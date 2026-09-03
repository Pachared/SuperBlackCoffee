package handler

import (
	"database/sql"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"y/internal/middleware"
)

func (h *PlatformHandler) ListFranchisees(c *gin.Context) {
	if h.unavailable(c) {
		return
	}
	rows, err := h.db.QueryContext(c, `SELECT id,name,email,plan,status,created_at FROM franchisees ORDER BY created_at DESC`)
	if err != nil {
		c.JSON(500, gin.H{"success": false, "message": "ไม่สามารถดึงรายชื่อแฟรนไชส์ได้"})
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
	Username   string `json:"username" binding:"required,min=3"`
	Password   string `json:"password" binding:"required,min=8"`
}

func (h *PlatformHandler) CreateFranchisee(c *gin.Context) {
	if h.unavailable(c) {
		return
	}
	var input franchiseInput
	if c.ShouldBindJSON(&input) != nil {
		c.JSON(400, gin.H{"success": false, "message": "ข้อมูลแฟรนไชส์ไม่ถูกต้อง"})
		return
	}
	tx, err := h.db.BeginTx(c, nil)
	if err != nil {
		c.JSON(500, gin.H{"success": false, "message": "ไม่สามารถสร้างแฟรนไชส์ได้"})
		return
	}
	defer tx.Rollback()
	var franchiseeID int64
	err = tx.QueryRowContext(c, `INSERT INTO franchisees(name,email,plan,status) VALUES($1,$2,$3,'active') RETURNING id`, input.Name, input.Email, input.Plan).Scan(&franchiseeID)
	var branchID int64
	if err == nil {
		err = tx.QueryRowContext(c, `INSERT INTO branches(franchisee_id,name,code,status) VALUES($1,$2,$3,'active') RETURNING id`, franchiseeID, input.BranchName, input.BranchCode).Scan(&branchID)
	}
	if err == nil {
		passwordHash, hashErr := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
		if hashErr != nil {
			err = hashErr
		} else {
			_, err = tx.ExecContext(c, `INSERT INTO users(name,username,email,password_hash,role,franchisee_id,branch_id) VALUES($1,$2,$3,$4,'franchise_owner',$5,$6)`, strings.TrimSpace(input.Name), strings.TrimSpace(input.Username), strings.TrimSpace(input.Email), string(passwordHash), franchiseeID, branchID)
		}
	}
	if err != nil {
		c.JSON(409, gin.H{"success": false, "message": "อีเมลแฟรนไชส์หรือรหัสสาขานี้มีอยู่แล้ว"})
		return
	}
	if err = tx.Commit(); err != nil {
		c.JSON(500, gin.H{"success": false, "message": "ไม่สามารถบันทึกแฟรนไชส์ได้"})
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
		if claims.Role == "branch_manager" && claims.BranchID != nil {
			query += ` WHERE b.id=$1`
			args = append(args, *claims.BranchID)
		} else if claims.FranchiseeID != nil {
			query += ` WHERE b.franchisee_id=$1`
			args = append(args, *claims.FranchiseeID)
		} else {
			c.JSON(403, gin.H{"success": false, "message": "ต้องกำหนดสิทธิ์เข้าถึงสาขา"})
			return
		}
	}
	query += ` ORDER BY b.name`
	rows, err := h.db.QueryContext(c, query, args...)
	if err != nil {
		c.JSON(500, gin.H{"success": false, "message": "ไม่สามารถดึงรายชื่อสาขาได้"})
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

// BranchSales preserves the Admin branch overview until a future sales provider is connected.
func (h *PlatformHandler) BranchSales(c *gin.Context) {
	if h.unavailable(c) {
		return
	}
	rows, err := h.db.QueryContext(c, `SELECT id,name,code,status FROM branches ORDER BY name`)
	if err != nil {
		c.JSON(500, gin.H{"success": false, "message": "ไม่สามารถโหลดข้อมูลสาขาได้"})
		return
	}
	defer rows.Close()
	result := []gin.H{}
	for rows.Next() {
		var id int64
		var name, code, status string
		if err := rows.Scan(&id, &name, &code, &status); err != nil {
			c.JSON(500, gin.H{"success": false, "message": "ไม่สามารถอ่านข้อมูลสาขาได้"})
			return
		}
		result = append(result, gin.H{"id": id, "name": name, "code": code, "status": status, "sales": 0, "orders": 0})
	}
	c.JSON(200, gin.H{"success": true, "data": result})
}
