package handler

import (
	"database/sql"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"y/internal/middleware"
)

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
