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

func (h *PlatformHandler) ListInventory(c *gin.Context) {
	if h.unavailable(c) {
		return
	}
	branchID, ok := h.branchScope(c)
	if !ok {
		return
	}
	rows, err := h.db.QueryContext(c, `SELECT id,name,category,quantity,unit,reorder_level,updated_at FROM inventory_items WHERE branch_id=$1 ORDER BY name`, branchID)
	if err != nil {
		c.JSON(500, gin.H{"success": false, "message": "failed to list inventory"})
		return
	}
	defer rows.Close()
	result := []gin.H{}
	for rows.Next() {
		var id int64
		var name, category, unit string
		var quantity, reorder float64
		var updated time.Time
		_ = rows.Scan(&id, &name, &category, &quantity, &unit, &reorder, &updated)
		status := "ready"
		if quantity <= 0 {
			status = "out"
		} else if quantity <= reorder {
			status = "low"
		}
		result = append(result, gin.H{"id": id, "name": name, "category": category, "quantity": quantity, "unit": unit, "reorderLevel": reorder, "status": status, "updatedAt": updated})
	}
	c.JSON(200, gin.H{"success": true, "data": result})
}

type inventoryInput struct {
	Name         string  `json:"name" binding:"required"`
	Category     string  `json:"category"`
	Quantity     float64 `json:"quantity"`
	Unit         string  `json:"unit" binding:"required"`
	ReorderLevel float64 `json:"reorderLevel"`
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
	err := h.db.QueryRowContext(c, `INSERT INTO inventory_items(branch_id,name,category,quantity,unit,reorder_level) VALUES($1,$2,$3,$4,$5,$6) RETURNING id`, branchID, input.Name, defaultString(input.Category, "other"), input.Quantity, input.Unit, input.ReorderLevel).Scan(&id)
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
	result, err := h.db.ExecContext(c, `UPDATE inventory_items SET name=$1,category=$2,quantity=$3,unit=$4,reorder_level=$5,updated_at=now() WHERE id=$6 AND branch_id=$7`, input.Name, defaultString(input.Category, "other"), input.Quantity, input.Unit, input.ReorderLevel, id, branchID)
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
	result, err := h.db.ExecContext(c, `UPDATE stock_requests SET status=$1,approved_by=$2,updated_at=now() WHERE id=$3 AND status = ANY($4)`, input.Status, claims.UserID, id, validCurrentStatuses[input.Status])
	if err != nil || rowsAffected(result) == 0 {
		c.JSON(409, gin.H{"success": false, "message": "request cannot be updated"})
		return
	}
	c.JSON(200, gin.H{"success": true, "data": gin.H{"id": id, "status": input.Status}})
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
	total := 0.0
	for _, item := range input.Items {
		total += float64(item.Quantity) * item.UnitPrice
	}
	claims := middleware.ClaimsFrom(c)
	tx, err := h.db.BeginTx(c, nil)
	if err != nil {
		c.JSON(500, gin.H{"success": false, "message": "failed to create order"})
		return
	}
	defer tx.Rollback()
	var orderID int64
	err = tx.QueryRowContext(c, `INSERT INTO pos_orders(branch_id,channel,total,cashier_id) VALUES($1,$2,$3,$4) RETURNING id`, branchID, input.Channel, total, claims.UserID).Scan(&orderID)
	for _, item := range input.Items {
		if err != nil {
			break
		}
		costPrice := item.CostPrice
		_ = tx.QueryRowContext(c, `SELECT cost_price FROM menu_items WHERE branch_id=$1 AND name=$2`, branchID, item.ProductName).Scan(&costPrice)
		_, err = tx.ExecContext(c, `INSERT INTO pos_order_items(order_id,product_name,quantity,unit_price,cost_price) VALUES($1,$2,$3,$4,$5)`, orderID, item.ProductName, item.Quantity, item.UnitPrice, costPrice)
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
