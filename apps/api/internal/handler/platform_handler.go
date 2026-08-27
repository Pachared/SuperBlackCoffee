package handler

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"y/internal/middleware"
)

type PlatformHandler struct {
	db        *sql.DB
	jwtSecret string
}

func NewPlatformHandler(db *sql.DB) *PlatformHandler {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "development-only-change-me"
	}
	return &PlatformHandler{db: db, jwtSecret: secret}
}
func (h *PlatformHandler) unavailable(c *gin.Context) bool {
	if h.db == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"success": false, "message": "database is not configured"})
		return true
	}
	return false
}

type loginInput struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func (h *PlatformHandler) Login(c *gin.Context) {
	if h.unavailable(c) {
		return
	}
	var input loginInput
	if c.ShouldBindJSON(&input) != nil {
		c.JSON(400, gin.H{"success": false, "message": "username and password are required"})
		return
	}
	var id int64
	var name, hash, role string
	var franchiseeID, branchID sql.NullInt64
	err := h.db.QueryRowContext(c, `SELECT id,name,password_hash,role,franchisee_id,branch_id FROM users WHERE lower(username)=lower($1)`, input.Username).Scan(&id, &name, &hash, &role, &franchiseeID, &branchID)
	if errors.Is(err, sql.ErrNoRows) || bcrypt.CompareHashAndPassword([]byte(hash), []byte(input.Password)) != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง"})
		return
	}
	if err != nil {
		c.JSON(500, gin.H{"success": false, "message": "failed to sign in"})
		return
	}
	claims := middleware.Claims{UserID: id, Role: role, RegisteredClaims: jwt.RegisteredClaims{ExpiresAt: jwt.NewNumericDate(time.Now().Add(12 * time.Hour)), IssuedAt: jwt.NewNumericDate(time.Now())}}
	if franchiseeID.Valid {
		value := franchiseeID.Int64
		claims.FranchiseeID = &value
	}
	if branchID.Valid {
		value := branchID.Int64
		claims.BranchID = &value
	}
	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(h.jwtSecret))
	if err != nil {
		c.JSON(500, gin.H{"success": false, "message": "failed to create access token"})
		return
	}
	c.JSON(200, gin.H{"success": true, "data": gin.H{"accessToken": token, "user": gin.H{"id": id, "name": name, "role": role, "franchiseeId": claims.FranchiseeID, "branchId": claims.BranchID}}})
}

func (h *PlatformHandler) ListFranchisees(c *gin.Context) {
	if h.unavailable(c) {
		return
	}
	rows, err := h.db.QueryContext(c, `SELECT id,name,email,plan,status,created_at FROM franchisees ORDER BY created_at DESC`)
	if err != nil {
		c.JSON(500, gin.H{"success": false, "message": "failed to list franchisees"})
		return
	}
	defer rows.Close()
	result := []gin.H{}
	for rows.Next() {
		var id int64
		var name, email, plan, status string
		var created time.Time
		_ = rows.Scan(&id, &name, &email, &plan, &status, &created)
		result = append(result, gin.H{"id": id, "name": name, "email": email, "plan": plan, "status": status, "createdAt": created})
	}
	c.JSON(200, gin.H{"success": true, "data": result})
}

type franchiseInput struct {
	Name       string `json:"name" binding:"required"`
	Email      string `json:"email" binding:"required,email"`
	Plan       string `json:"plan" binding:"required,oneof=S M L"`
	BranchName string `json:"branchName" binding:"required"`
	BranchCode string `json:"branchCode" binding:"required"`
}

func (h *PlatformHandler) CreateFranchisee(c *gin.Context) {
	if h.unavailable(c) {
		return
	}
	var input franchiseInput
	if c.ShouldBindJSON(&input) != nil {
		c.JSON(400, gin.H{"success": false, "message": "invalid franchise input"})
		return
	}
	tx, err := h.db.BeginTx(c, nil)
	if err != nil {
		c.JSON(500, gin.H{"success": false, "message": "failed to create franchise"})
		return
	}
	defer tx.Rollback()
	var franchiseeID int64
	err = tx.QueryRowContext(c, `INSERT INTO franchisees(name,email,plan,status) VALUES($1,$2,$3,'invited') RETURNING id`, input.Name, input.Email, input.Plan).Scan(&franchiseeID)
	if err == nil {
		_, err = tx.ExecContext(c, `INSERT INTO branches(franchisee_id,name,code,status) VALUES($1,$2,$3,'inactive')`, franchiseeID, input.BranchName, input.BranchCode)
	}
	if err != nil {
		c.JSON(409, gin.H{"success": false, "message": "franchise email or branch code already exists"})
		return
	}
	if err = tx.Commit(); err != nil {
		c.JSON(500, gin.H{"success": false, "message": "failed to save franchise"})
		return
	}
	c.JSON(201, gin.H{"success": true, "data": gin.H{"id": franchiseeID, "status": "invited"}})
}

func (h *PlatformHandler) ListBranches(c *gin.Context) {
	if h.unavailable(c) {
		return
	}
	claims := middleware.ClaimsFrom(c)
	query := `SELECT b.id,b.name,b.code,b.status,b.franchisee_id,f.name FROM branches b LEFT JOIN franchisees f ON f.id=b.franchisee_id`
	args := []any{}
	if claims.Role != "admin" {
		if claims.FranchiseeID == nil {
			c.JSON(403, gin.H{"success": false, "message": "branch scope is required"})
			return
		}
		query += ` WHERE b.franchisee_id=$1`
		args = append(args, *claims.FranchiseeID)
	}
	query += ` ORDER BY b.name`
	rows, err := h.db.QueryContext(c, query, args...)
	if err != nil {
		c.JSON(500, gin.H{"success": false, "message": "failed to list branches"})
		return
	}
	defer rows.Close()
	result := []gin.H{}
	for rows.Next() {
		var id, franchiseeID int64
		var name, code, status string
		var franchiseName sql.NullString
		_ = rows.Scan(&id, &name, &code, &status, &franchiseeID, &franchiseName)
		result = append(result, gin.H{"id": id, "name": name, "code": code, "status": status, "franchiseeId": franchiseeID, "franchiseeName": franchiseName.String})
	}
	c.JSON(200, gin.H{"success": true, "data": result})
}

func (h *PlatformHandler) BranchSales(c *gin.Context) {
	if h.unavailable(c) {
		return
	}
	period := c.DefaultQuery("period", "today")
	var start string
	switch period {
	case "today":
		start = "date_trunc('day', now())"
	case "month":
		start = "date_trunc('month', now())"
	case "year":
		start = "date_trunc('year', now())"
	default:
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "period must be today, month, or year"})
		return
	}
	query := `SELECT b.id,b.name,b.code,b.status,
		COALESCE(SUM(o.total) FILTER (WHERE o.status='paid'), 0),
		COUNT(o.id) FILTER (WHERE o.status='paid')
		FROM branches b LEFT JOIN pos_orders o ON o.branch_id=b.id AND o.created_at >= ` + start + `
		GROUP BY b.id,b.name,b.code,b.status ORDER BY b.name`
	rows, err := h.db.QueryContext(c, query)
	if err != nil {
		c.JSON(500, gin.H{"success": false, "message": "failed to load branch sales"})
		return
	}
	defer rows.Close()
	result := []gin.H{}
	for rows.Next() {
		var id int64
		var name, code, status string
		var sales float64
		var orders int
		if err := rows.Scan(&id, &name, &code, &status, &sales, &orders); err != nil {
			c.JSON(500, gin.H{"success": false, "message": "failed to read branch sales"})
			return
		}
		result = append(result, gin.H{"id": id, "name": name, "code": code, "status": status, "sales": sales, "orders": orders})
	}
	if err := rows.Err(); err != nil {
		c.JSON(500, gin.H{"success": false, "message": "failed to read branch sales"})
		return
	}
	c.JSON(200, gin.H{"success": true, "data": result})
}

func (h *PlatformHandler) ListInventory(c *gin.Context) {
	if h.unavailable(c) {
		return
	}
	branchID, ok := h.branchScope(c)
	if !ok {
		return
	}
	kind := c.Query("kind")
	if kind != "" && kind != "ingredient" && kind != "stock" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "kind must be ingredient or stock"})
		return
	}
	query := `SELECT id,name,category,kind,quantity,unit,reorder_level,unit_cost,updated_at FROM inventory_items WHERE branch_id=$1`
	args := []any{branchID}
	if kind != "" {
		query += ` AND kind=$2`
		args = append(args, kind)
	}
	query += ` ORDER BY name`
	rows, err := h.db.QueryContext(c, query, args...)
	if err != nil {
		c.JSON(500, gin.H{"success": false, "message": "failed to list inventory"})
		return
	}
	defer rows.Close()
	result := []gin.H{}
	for rows.Next() {
		var id int64
		var name, category, itemKind, unit string
		var quantity, reorder, unitCost float64
		var updated time.Time
		_ = rows.Scan(&id, &name, &category, &itemKind, &quantity, &unit, &reorder, &unitCost, &updated)
		status := "ready"
		if quantity <= 0 {
			status = "out"
		} else if quantity <= reorder {
			status = "low"
		}
		result = append(result, gin.H{"id": id, "name": name, "category": category, "kind": itemKind, "quantity": quantity, "unit": unit, "reorderLevel": reorder, "unitCost": unitCost, "status": status, "updatedAt": updated})
	}
	c.JSON(200, gin.H{"success": true, "data": result})
}

type inventoryInput struct {
	Name         string  `json:"name" binding:"required"`
	Category     string  `json:"category"`
	Kind         string  `json:"kind" binding:"omitempty,oneof=ingredient stock"`
	Quantity     float64 `json:"quantity"`
	Unit         string  `json:"unit" binding:"required"`
	ReorderLevel float64 `json:"reorderLevel"`
	UnitCost     float64 `json:"unitCost" binding:"gte=0"`
}

func (h *PlatformHandler) CreateInventory(c *gin.Context) {
	if h.unavailable(c) {
		return
	}
	branchID, ok := h.branchScope(c)
	if !ok {
		return
	}
	var input inventoryInput
	if c.ShouldBindJSON(&input) != nil {
		c.JSON(400, gin.H{"success": false, "message": "invalid inventory input"})
		return
	}
	var id int64
	err := h.db.QueryRowContext(c, `INSERT INTO inventory_items(branch_id,name,category,kind,quantity,unit,reorder_level,unit_cost) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`, branchID, input.Name, defaultString(input.Category, "other"), defaultString(input.Kind, "ingredient"), input.Quantity, input.Unit, input.ReorderLevel, input.UnitCost).Scan(&id)
	if err != nil {
		c.JSON(500, gin.H{"success": false, "message": "failed to create inventory item"})
		return
	}
	c.JSON(201, gin.H{"success": true, "data": gin.H{"id": id}})
}

func (h *PlatformHandler) UpdateInventory(c *gin.Context) {
	if h.unavailable(c) {
		return
	}
	branchID, ok := h.branchScope(c)
	if !ok {
		return
	}
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil || id < 1 {
		c.JSON(400, gin.H{"success": false, "message": "invalid inventory item"})
		return
	}
	var input inventoryInput
	if c.ShouldBindJSON(&input) != nil {
		c.JSON(400, gin.H{"success": false, "message": "invalid inventory input"})
		return
	}
	result, err := h.db.ExecContext(c, `UPDATE inventory_items SET name=$1,category=$2,kind=$3,quantity=$4,unit=$5,reorder_level=$6,unit_cost=$7,updated_at=now() WHERE id=$8 AND branch_id=$9`, input.Name, defaultString(input.Category, "other"), defaultString(input.Kind, "ingredient"), input.Quantity, input.Unit, input.ReorderLevel, input.UnitCost, id, branchID)
	if err != nil || rowsAffected(result) == 0 {
		c.JSON(404, gin.H{"success": false, "message": "inventory item was not found"})
		return
	}
	c.JSON(200, gin.H{"success": true, "data": gin.H{"id": id}})
}

func (h *PlatformHandler) DeleteInventory(c *gin.Context) {
	if h.unavailable(c) {
		return
	}
	branchID, ok := h.branchScope(c)
	if !ok {
		return
	}
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil || id < 1 {
		c.JSON(400, gin.H{"success": false, "message": "invalid inventory item"})
		return
	}
	result, err := h.db.ExecContext(c, `DELETE FROM inventory_items WHERE id=$1 AND branch_id=$2`, id, branchID)
	if err != nil || rowsAffected(result) == 0 {
		c.JSON(404, gin.H{"success": false, "message": "inventory item was not found"})
		return
	}
	c.Status(http.StatusNoContent)
}

type requestItemInput struct {
	InventoryItemID *int64  `json:"inventoryItemId"`
	Name            string  `json:"name" binding:"required"`
	Quantity        float64 `json:"quantity" binding:"required,gt=0"`
	Unit            string  `json:"unit" binding:"required"`
}
type requestInput struct {
	BranchID *int64             `json:"branchId"`
	Note     string             `json:"note"`
	Items    []requestItemInput `json:"items" binding:"required,min=1"`
}

func (h *PlatformHandler) CreateStockRequest(c *gin.Context) {
	if h.unavailable(c) {
		return
	}
	var input requestInput
	if c.ShouldBindJSON(&input) != nil {
		c.JSON(400, gin.H{"success": false, "message": "at least one requested item is required"})
		return
	}
	branchID, ok := h.requestBranchScope(c, input.BranchID)
	if !ok {
		return
	}
	claims := middleware.ClaimsFrom(c)
	tx, err := h.db.BeginTx(c, nil)
	if err != nil {
		c.JSON(500, gin.H{"success": false, "message": "failed to create request"})
		return
	}
	defer tx.Rollback()
	var requestID int64
	err = tx.QueryRowContext(c, `INSERT INTO stock_requests(branch_id,note,requested_by) VALUES($1,$2,$3) RETURNING id`, branchID, input.Note, claims.UserID).Scan(&requestID)
	for _, item := range input.Items {
		if err != nil {
			break
		}
		_, err = tx.ExecContext(c, `INSERT INTO stock_request_items(stock_request_id,inventory_item_id,item_name,quantity,unit) VALUES($1,$2,$3,$4,$5)`, requestID, item.InventoryItemID, item.Name, item.Quantity, item.Unit)
	}
	if err != nil {
		c.JSON(500, gin.H{"success": false, "message": "failed to save request"})
		return
	}
	if err = tx.Commit(); err != nil {
		c.JSON(500, gin.H{"success": false, "message": "failed to save request"})
		return
	}
	c.JSON(201, gin.H{"success": true, "data": gin.H{"id": requestID, "status": "pending"}})
}

func (h *PlatformHandler) ListStockRequests(c *gin.Context) {
	if h.unavailable(c) {
		return
	}
	claims := middleware.ClaimsFrom(c)
	query := `SELECT r.id,r.status,r.note,r.created_at,b.id,b.name,
		COALESCE(json_agg(json_build_object('name',i.item_name,'quantity',i.quantity,'unit',i.unit) ORDER BY i.id) FILTER (WHERE i.id IS NOT NULL),'[]')
		FROM stock_requests r JOIN branches b ON b.id=r.branch_id LEFT JOIN stock_request_items i ON i.stock_request_id=r.id`
	args := []any{}
	if claims.Role != "admin" {
		branchID, ok := h.branchScope(c)
		if !ok {
			return
		}
		query += ` WHERE r.branch_id=$1`
		args = append(args, branchID)
	}
	query += ` GROUP BY r.id,b.id ORDER BY r.created_at DESC`
	rows, err := h.db.QueryContext(c, query, args...)
	if err != nil {
		c.JSON(500, gin.H{"success": false, "message": "failed to list stock requests"})
		return
	}
	defer rows.Close()
	result := []gin.H{}
	for rows.Next() {
		var id, branchID int64
		var status, note, branchName string
		var created time.Time
		var items []byte
		if err := rows.Scan(&id, &status, &note, &created, &branchID, &branchName, &items); err != nil {
			c.JSON(500, gin.H{"success": false, "message": "failed to read stock requests"})
			return
		}
		result = append(result, gin.H{"id": id, "status": status, "note": note, "createdAt": created, "branch": gin.H{"id": branchID, "name": branchName}, "items": json.RawMessage(items)})
	}
	c.JSON(200, gin.H{"success": true, "data": result})
}

func (h *PlatformHandler) UpdateStockRequestStatus(c *gin.Context) {
	if h.unavailable(c) {
		return
	}
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	var input struct {
		Status string `json:"status" binding:"required,oneof=approved preparing completed rejected"`
	}
	if c.ShouldBindJSON(&input) != nil {
		c.JSON(400, gin.H{"success": false, "message": "invalid status"})
		return
	}
	claims := middleware.ClaimsFrom(c)
	validCurrentStatuses := map[string][]string{"approved": {"pending"}, "rejected": {"pending"}, "preparing": {"pending", "approved"}, "completed": {"preparing"}}
	if input.Status != "completed" {
		result, err := h.db.ExecContext(c, `UPDATE stock_requests SET status=$1,approved_by=$2,updated_at=now() WHERE id=$3 AND status = ANY($4)`, input.Status, claims.UserID, id, validCurrentStatuses[input.Status])
		if err != nil || rowsAffected(result) == 0 {
			c.JSON(409, gin.H{"success": false, "message": "request cannot be updated"})
			return
		}
		c.JSON(200, gin.H{"success": true, "data": gin.H{"id": id, "status": input.Status}})
		return
	}

	tx, err := h.db.BeginTx(c, nil)
	if err != nil {
		c.JSON(500, gin.H{"success": false, "message": "failed to complete request"})
		return
	}
	defer tx.Rollback()
	var branchID int64
	err = tx.QueryRowContext(c, `SELECT branch_id FROM stock_requests WHERE id=$1 AND status = ANY($2) FOR UPDATE`, id, validCurrentStatuses[input.Status]).Scan(&branchID)
	if errors.Is(err, sql.ErrNoRows) {
		c.JSON(409, gin.H{"success": false, "message": "request cannot be updated"})
		return
	}
	if err != nil {
		c.JSON(500, gin.H{"success": false, "message": "failed to complete request"})
		return
	}
	rows, err := tx.QueryContext(c, `SELECT item_name,quantity,unit FROM stock_request_items WHERE stock_request_id=$1`, id)
	if err != nil {
		c.JSON(500, gin.H{"success": false, "message": "failed to complete request"})
		return
	}
	defer rows.Close()
	for rows.Next() {
		var name, unit string
		var quantity float64
		if err := rows.Scan(&name, &quantity, &unit); err != nil {
			c.JSON(500, gin.H{"success": false, "message": "failed to complete request"})
			return
		}
		result, updateErr := tx.ExecContext(c, `UPDATE inventory_items SET quantity=quantity+$1,updated_at=now() WHERE branch_id=$2 AND name=$3 AND unit=$4`, quantity, branchID, name, unit)
		if updateErr != nil {
			c.JSON(500, gin.H{"success": false, "message": "failed to receive requested inventory"})
			return
		}
		if rowsAffected(result) == 0 {
			if _, insertErr := tx.ExecContext(c, `INSERT INTO inventory_items(branch_id,name,category,kind,quantity,unit,reorder_level,unit_cost) VALUES($1,$2,'other','ingredient',$3,$4,0,0)`, branchID, name, quantity, unit); insertErr != nil {
				c.JSON(500, gin.H{"success": false, "message": "failed to receive requested inventory"})
				return
			}
		}
	}
	if err := rows.Err(); err != nil {
		c.JSON(500, gin.H{"success": false, "message": "failed to complete request"})
		return
	}
	if _, err = tx.ExecContext(c, `UPDATE stock_requests SET status='completed',approved_by=$1,updated_at=now() WHERE id=$2`, claims.UserID, id); err != nil {
		c.JSON(500, gin.H{"success": false, "message": "failed to complete request"})
		return
	}
	if err = tx.Commit(); err != nil {
		c.JSON(500, gin.H{"success": false, "message": "failed to complete request"})
		return
	}
	c.JSON(200, gin.H{"success": true, "data": gin.H{"id": id, "status": input.Status}})
}

func (h *PlatformHandler) ListMenuItems(c *gin.Context) {
	if h.unavailable(c) {
		return
	}
	branchID, ok := h.branchScope(c)
	if !ok {
		return
	}
	rows, err := h.db.QueryContext(c, `
		SELECT m.id,m.name,m.category,m.store_price,m.lineman_price,m.cost_price,m.status,
			COALESCE(json_agg(json_build_object(
				'inventoryItemId',i.id,'name',i.name,'quantity',mi.quantity,'unit',mi.unit,'costAmount',mi.cost_amount
			) ORDER BY i.name) FILTER (WHERE i.id IS NOT NULL),'[]')
		FROM menu_items m
		LEFT JOIN menu_item_ingredients mi ON mi.menu_item_id=m.id
		LEFT JOIN inventory_items i ON i.id=mi.inventory_item_id
		WHERE m.branch_id=$1
		GROUP BY m.id
		ORDER BY m.category,m.name`, branchID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "failed to list menu items"})
		return
	}
	defer rows.Close()
	result := []gin.H{}
	for rows.Next() {
		var id int64
		var name, category, status string
		var storePrice, linemanPrice, costPrice float64
		var ingredients []byte
		if err := rows.Scan(&id, &name, &category, &storePrice, &linemanPrice, &costPrice, &status, &ingredients); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "failed to read menu items"})
			return
		}
		result = append(result, gin.H{"id": id, "name": name, "category": category, "storePrice": storePrice, "linemanPrice": linemanPrice, "costPrice": costPrice, "status": status, "ingredients": json.RawMessage(ingredients)})
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": result})
}

type orderItemInput struct {
	ProductName string  `json:"productName" binding:"required"`
	Quantity    int     `json:"quantity" binding:"required,gt=0"`
	UnitPrice   float64 `json:"unitPrice" binding:"required,gte=0"`
	CostPrice   float64 `json:"costPrice" binding:"gte=0"`
}
type posOrderInput struct {
	BranchID *int64           `json:"branchId"`
	Channel  string           `json:"channel" binding:"required,oneof=storefront lineman"`
	Items    []orderItemInput `json:"items" binding:"required,min=1"`
}

func (h *PlatformHandler) CreatePOSOrder(c *gin.Context) {
	if h.unavailable(c) {
		return
	}
	var input posOrderInput
	if c.ShouldBindJSON(&input) != nil {
		c.JSON(400, gin.H{"success": false, "message": "invalid order"})
		return
	}
	branchID, ok := h.requestBranchScope(c, input.BranchID)
	if !ok {
		return
	}
	claims := middleware.ClaimsFrom(c)
	tx, err := h.db.BeginTx(c, nil)
	if err != nil {
		c.JSON(500, gin.H{"success": false, "message": "failed to create order"})
		return
	}
	defer tx.Rollback()
	var orderID int64
	err = tx.QueryRowContext(c, `INSERT INTO pos_orders(branch_id,channel,total,cashier_id) VALUES($1,$2,0,$3) RETURNING id`, branchID, input.Channel, claims.UserID).Scan(&orderID)
	total := 0.0
	for _, item := range input.Items {
		if err != nil {
			break
		}
		costPrice := item.CostPrice
		var menuItemID int64
		var storePrice, linemanPrice float64
		menuErr := tx.QueryRowContext(c, `SELECT id,cost_price,store_price,lineman_price FROM menu_items WHERE branch_id=$1 AND name=$2`, branchID, item.ProductName).Scan(&menuItemID, &costPrice, &storePrice, &linemanPrice)
		if errors.Is(menuErr, sql.ErrNoRows) {
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "ไม่พบเมนู " + item.ProductName})
			return
		}
		if menuErr != nil {
			err = menuErr
			break
		}
		unitPrice := storePrice
		if input.Channel == "lineman" {
			unitPrice = linemanPrice
		}
		total += float64(item.Quantity) * unitPrice
		var requiredCount, availableCount int
		err = tx.QueryRowContext(c, `
			SELECT COUNT(*), COUNT(*) FILTER (WHERE i.quantity >= mi.quantity * $1)
			FROM menu_item_ingredients mi
			JOIN inventory_items i ON i.id=mi.inventory_item_id
			WHERE mi.menu_item_id=$2`, item.Quantity, menuItemID).Scan(&requiredCount, &availableCount)
		if err != nil {
			break
		}
		if requiredCount > 0 && availableCount != requiredCount {
			c.JSON(http.StatusConflict, gin.H{"success": false, "message": "วัตถุดิบหรือสต๊อกคงเหลือไม่เพียงพอสำหรับเมนู " + item.ProductName})
			return
		}
		_, err = tx.ExecContext(c, `INSERT INTO pos_order_items(order_id,product_name,quantity,unit_price,cost_price) VALUES($1,$2,$3,$4,$5)`, orderID, item.ProductName, item.Quantity, unitPrice, costPrice)
		if err == nil {
			_, err = tx.ExecContext(c, `
				UPDATE inventory_items i
				SET quantity=i.quantity-(mi.quantity*$1),updated_at=now()
				FROM menu_item_ingredients mi
				WHERE mi.menu_item_id=$2 AND i.id=mi.inventory_item_id`, item.Quantity, menuItemID)
		}
	}
	if err == nil {
		_, err = tx.ExecContext(c, `UPDATE pos_orders SET total=$1 WHERE id=$2`, total, orderID)
	}
	if err != nil {
		c.JSON(500, gin.H{"success": false, "message": "failed to save order"})
		return
	}
	if err = tx.Commit(); err != nil {
		c.JSON(500, gin.H{"success": false, "message": "failed to save order"})
		return
	}
	c.JSON(201, gin.H{"success": true, "data": gin.H{"id": orderID, "total": total}})
}

func (h *PlatformHandler) DailySalesReport(c *gin.Context) {
	if h.unavailable(c) {
		return
	}
	claims := middleware.ClaimsFrom(c)
	date := c.Query("date")
	if date == "" {
		date = time.Now().Format("2006-01-02")
	}
	query := `SELECT oi.product_name, SUM(oi.quantity), SUM(oi.quantity * oi.cost_price), SUM(oi.quantity * oi.unit_price), SUM(oi.quantity * (oi.unit_price - oi.cost_price))
		FROM pos_order_items oi JOIN pos_orders o ON o.id=oi.order_id WHERE o.status='paid' AND o.created_at >= $1::date AND o.created_at < ($1::date + INTERVAL '1 day')`
	args := []any{date}
	if claims.Role != "admin" {
		branchID, ok := h.branchScope(c)
		if !ok {
			return
		}
		query += ` AND o.branch_id=$2`
		args = append(args, branchID)
	}
	query += ` GROUP BY oi.product_name ORDER BY SUM(oi.quantity * oi.unit_price) DESC`
	rows, err := h.db.QueryContext(c, query, args...)
	if err != nil {
		c.JSON(500, gin.H{"success": false, "message": "failed to load daily sales report"})
		return
	}
	defer rows.Close()
	items := []gin.H{}
	var totals struct {
		quantity              int
		cost, revenue, profit float64
	}
	for rows.Next() {
		var name string
		var quantity int
		var cost, revenue, profit float64
		if err := rows.Scan(&name, &quantity, &cost, &revenue, &profit); err != nil {
			c.JSON(500, gin.H{"success": false, "message": "failed to read daily sales report"})
			return
		}
		items = append(items, gin.H{"productName": name, "quantity": quantity, "costTotal": cost, "revenueTotal": revenue, "profit": profit})
		totals.quantity += quantity
		totals.cost += cost
		totals.revenue += revenue
		totals.profit += profit
	}
	c.JSON(200, gin.H{"success": true, "data": gin.H{"date": date, "items": items, "totals": gin.H{"quantity": totals.quantity, "costTotal": totals.cost, "revenueTotal": totals.revenue, "profit": totals.profit}}})
}
func (h *PlatformHandler) Dashboard(c *gin.Context) {
	if h.unavailable(c) {
		return
	}
	claims := middleware.ClaimsFrom(c)
	query := `SELECT COALESCE(SUM(total),0),COUNT(*) FROM pos_orders WHERE status='paid' AND created_at >= date_trunc('day',now())`
	args := []any{}
	if claims.Role != "admin" {
		branchID, ok := h.branchScope(c)
		if !ok {
			return
		}
		query += ` AND branch_id=$1`
		args = append(args, branchID)
	}
	var sales float64
	var orders int
	if err := h.db.QueryRowContext(c, query, args...).Scan(&sales, &orders); err != nil {
		c.JSON(500, gin.H{"success": false, "message": "failed to load dashboard"})
		return
	}
	c.JSON(200, gin.H{"success": true, "data": gin.H{"todaySales": sales, "todayOrders": orders}})
}

func (h *PlatformHandler) branchScope(c *gin.Context) (int64, bool) {
	claims := middleware.ClaimsFrom(c)
	if claims.Role == "admin" {
		if code := strings.TrimSpace(c.Query("branchCode")); code != "" {
			var branchID int64
			if err := h.db.QueryRowContext(c, `SELECT id FROM branches WHERE code=$1`, code).Scan(&branchID); err != nil {
				c.JSON(404, gin.H{"success": false, "message": "branch was not found"})
				return 0, false
			}
			return branchID, true
		}
		value, err := strconv.ParseInt(c.Query("branchId"), 10, 64)
		if err != nil || value < 1 {
			c.JSON(400, gin.H{"success": false, "message": "branchId is required"})
			return 0, false
		}
		return value, true
	}
	if claims.BranchID == nil {
		c.JSON(403, gin.H{"success": false, "message": "your account has no branch scope"})
		return 0, false
	}
	return *claims.BranchID, true
}
func (h *PlatformHandler) requestBranchScope(c *gin.Context, requested *int64) (int64, bool) {
	claims := middleware.ClaimsFrom(c)
	if claims.Role == "admin" {
		if requested == nil || *requested < 1 {
			c.JSON(400, gin.H{"success": false, "message": "branchId is required"})
			return 0, false
		}
		return *requested, true
	}
	return h.branchScope(c)
}
func defaultString(value, fallback string) string {
	if strings.TrimSpace(value) == "" {
		return fallback
	}
	return value
}
func rowsAffected(result sql.Result) int64 { value, _ := result.RowsAffected(); return value }
