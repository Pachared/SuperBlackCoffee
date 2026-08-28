package handler

import (
	"database/sql"
	"encoding/json"
	"errors"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"y/internal/middleware"
)

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
	h.cache.Publish(c, "sbc:events", gin.H{"type": "stock.request.created", "requestId": requestID, "branchId": branchID})
	h.cache.Enqueue(c, "sbc:jobs", map[string]any{"type": "stock.request.notify", "requestId": requestID})
	h.recordAudit(c, branchID, "stock_request", requestID, "created", gin.H{"itemCount": len(input.Items)})
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
		var branchID int64
		err := h.db.QueryRowContext(c, `UPDATE stock_requests SET status=$1,approved_by=$2,updated_at=now() WHERE id=$3 AND status = ANY($4) RETURNING branch_id`, input.Status, claims.UserID, id, validCurrentStatuses[input.Status]).Scan(&branchID)
		if err != nil {
			c.JSON(409, gin.H{"success": false, "message": "request cannot be updated"})
			return
		}
		h.cache.Publish(c, "sbc:events", gin.H{"type": "stock.request.updated", "requestId": id, "status": input.Status})
		h.cache.Enqueue(c, "sbc:jobs", map[string]any{"type": "stock.request.notify", "requestId": id})
		h.recordAudit(c, branchID, "stock_request", id, input.Status, nil)
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
	h.invalidateBranchCache(c, branchID)
	h.cache.Publish(c, "sbc:events", gin.H{"type": "stock.request.updated", "requestId": id, "branchId": branchID, "status": input.Status})
	h.cache.Enqueue(c, "sbc:jobs", map[string]any{"type": "stock.request.notify", "requestId": id})
	h.recordAudit(c, branchID, "stock_request", id, "completed", nil)
	c.JSON(200, gin.H{"success": true, "data": gin.H{"id": id, "status": input.Status}})
}
