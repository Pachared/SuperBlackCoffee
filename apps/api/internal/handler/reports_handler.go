package handler

import (
	"database/sql"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"y/internal/authorization"
	"y/internal/middleware"
)

func (h *PlatformHandler) DailySalesReport(c *gin.Context) {
	if h.unavailable(c) {
		return
	}
	claims := middleware.ClaimsFrom(c)
	date := c.Query("date")
	if date == "" {
		date = time.Now().Format("2006-01-02")
	}
	cacheKey := "sbc:report:daily:" + date + ":all"
	var branchID int64
	if claims.Role != "admin" {
		var ok bool
		branchID, ok = h.branchScope(c)
		if !ok {
			return
		}
		cacheKey = "sbc:report:daily:" + date + ":" + strconv.FormatInt(branchID, 10)
	}
	var cached gin.H
	if h.cache.GetJSON(c, cacheKey, &cached) {
		c.JSON(200, gin.H{"success": true, "data": cached})
		return
	}
	query := `SELECT oi.product_name, SUM(oi.quantity), SUM(oi.quantity * oi.cost_price), SUM(oi.quantity * oi.unit_price), SUM(oi.quantity * (oi.unit_price - oi.cost_price))
		FROM pos_order_items oi JOIN pos_orders o ON o.id=oi.order_id WHERE o.status='paid' AND o.created_at >= $1::date AND o.created_at < ($1::date + INTERVAL '1 day')`
	args := []any{date}
	if claims.Role != "admin" {
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
	data := gin.H{"date": date, "items": items, "totals": gin.H{"quantity": totals.quantity, "costTotal": totals.cost, "revenueTotal": totals.revenue, "profit": totals.profit}}
	h.cache.SetJSON(c, cacheKey, data, 30*time.Second)
	c.JSON(200, gin.H{"success": true, "data": data})
}
func (h *PlatformHandler) Dashboard(c *gin.Context) {
	if h.unavailable(c) {
		return
	}
	claims := middleware.ClaimsFrom(c)
	cacheKey := "sbc:dashboard:all"
	var branchID int64
	if claims.Role != "admin" {
		var ok bool
		branchID, ok = h.branchScope(c)
		if !ok {
			return
		}
		cacheKey = "sbc:dashboard:" + strconv.FormatInt(branchID, 10)
	}
	var cached gin.H
	if h.cache.GetJSON(c, cacheKey, &cached) {
		c.JSON(200, gin.H{"success": true, "data": cached})
		return
	}
	query := `SELECT COALESCE(SUM(total),0),COUNT(*) FROM pos_orders WHERE status='paid' AND created_at >= date_trunc('day',now())`
	args := []any{}
	if claims.Role != "admin" {
		query += ` AND branch_id=$1`
		args = append(args, branchID)
	}
	var sales float64
	var orders int
	if err := h.db.QueryRowContext(c, query, args...).Scan(&sales, &orders); err != nil {
		c.JSON(500, gin.H{"success": false, "message": "failed to load dashboard"})
		return
	}
	data := gin.H{"todaySales": sales, "todayOrders": orders}
	h.cache.SetJSON(c, cacheKey, data, 30*time.Second)
	c.JSON(200, gin.H{"success": true, "data": data})
}

func (h *PlatformHandler) branchScope(c *gin.Context) (int64, bool) {
	return authorization.BranchID(c, h.db)
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
