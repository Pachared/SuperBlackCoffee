package handler

import (
	"database/sql"
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"y/internal/dto"
	"y/internal/middleware"
	"y/internal/model"
)

func (h *PlatformHandler) ListMenuItems(c *gin.Context) {
	if h.unavailable(c) {
		return
	}
	branchID, ok := h.branchScope(c)
	if !ok {
		return
	}
	cacheKey := "sbc:menu:" + strconv.FormatInt(branchID, 10)
	var cached []model.MenuItem
	if h.cache.GetJSON(c, cacheKey, &cached) {
		c.JSON(http.StatusOK, gin.H{"success": true, "data": cached})
		return
	}
	result, err := h.menu.List(c, branchID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "ไม่สามารถดึงรายการเมนูได้"})
		return
	}
	h.cache.SetJSON(c, cacheKey, result, 30*time.Second)
	c.JSON(http.StatusOK, gin.H{"success": true, "data": result})
}

type orderItemInput = dto.OrderItemRequest
type posOrderInput = dto.POSOrderRequest

func (h *PlatformHandler) CreatePOSOrder(c *gin.Context) {
	if h.unavailable(c) {
		return
	}
	var input posOrderInput
	if c.ShouldBindJSON(&input) != nil {
		c.JSON(400, gin.H{"success": false, "message": "ข้อมูลคำสั่งซื้อไม่ถูกต้อง"})
		return
	}
	branchID, ok := h.requestBranchScope(c, input.BranchID)
	if !ok {
		return
	}
	claims := middleware.ClaimsFrom(c)
	tx, err := h.db.BeginTx(c, nil)
	if err != nil {
		c.JSON(500, gin.H{"success": false, "message": "ไม่สามารถสร้างคำสั่งซื้อได้"})
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
		var requiredCount int
		err = tx.QueryRowContext(c, `SELECT COUNT(*) FROM menu_item_ingredients WHERE menu_item_id=$1`, menuItemID).Scan(&requiredCount)
		if err != nil {
			break
		}
		_, err = tx.ExecContext(c, `INSERT INTO pos_order_items(order_id,product_name,quantity,unit_price,cost_price) VALUES($1,$2,$3,$4,$5)`, orderID, item.ProductName, item.Quantity, unitPrice, costPrice)
		if err == nil {
			recipeRows, queryErr := tx.QueryContext(c, `SELECT inventory_item_id,quantity FROM menu_item_ingredients WHERE menu_item_id=$1 ORDER BY inventory_item_id`, menuItemID)
			if queryErr != nil {
				err = queryErr
				continue
			}
			type recipeItem struct {
				inventoryItemID int64
				quantity        float64
			}
			recipe := make([]recipeItem, 0, requiredCount)
			for recipeRows.Next() {
				var ingredient recipeItem
				if err = recipeRows.Scan(&ingredient.inventoryItemID, &ingredient.quantity); err != nil {
					break
				}
				recipe = append(recipe, ingredient)
			}
			if closeErr := recipeRows.Close(); err == nil && closeErr != nil {
				err = closeErr
			}
			for _, ingredient := range recipe {
				if err != nil {
					break
				}
				deducted := ingredient.quantity * float64(item.Quantity)
				var quantityAfter float64
				err = tx.QueryRowContext(c, `UPDATE inventory_items SET quantity=quantity-$1,updated_at=now() WHERE id=$2 AND branch_id=$3 AND quantity >= $1 RETURNING quantity`, deducted, ingredient.inventoryItemID, branchID).Scan(&quantityAfter)
				if errors.Is(err, sql.ErrNoRows) {
					c.JSON(http.StatusConflict, gin.H{"success": false, "message": "วัตถุดิบหรือสต๊อกคงเหลือไม่เพียงพอสำหรับเมนู " + item.ProductName})
					return
				}
				if err == nil {
					err = recordStockMovementTx(c, tx, branchID, ingredient.inventoryItemID, "pos_sale", -deducted, quantityAfter+deducted, quantityAfter, "pos_order", &orderID, "ตัดสต๊อกตามการขายเมนู "+item.ProductName, claims.UserID)
				}
			}
			if err == nil && len(recipe) != requiredCount {
				c.JSON(http.StatusConflict, gin.H{"success": false, "message": "วัตถุดิบหรือสต๊อกคงเหลือไม่เพียงพอสำหรับเมนู " + item.ProductName})
				return
			}
		}
	}
	if err == nil {
		_, err = tx.ExecContext(c, `UPDATE pos_orders SET total=$1 WHERE id=$2`, total, orderID)
	}
	if err == nil {
		err = recordAuditTx(c, tx, branchID, claims.UserID, "pos_order", orderID, "created", gin.H{"total": total, "itemCount": len(input.Items)})
	}
	if err != nil {
		c.JSON(500, gin.H{"success": false, "message": "ไม่สามารถบันทึกคำสั่งซื้อได้"})
		return
	}
	if err = tx.Commit(); err != nil {
		c.JSON(500, gin.H{"success": false, "message": "ไม่สามารถบันทึกคำสั่งซื้อได้"})
		return
	}
	h.invalidateBranchCache(c, branchID)
	h.cache.Publish(c, "sbc:events", gin.H{"type": "pos.order.created", "orderId": orderID, "branchId": branchID})
	h.cache.Enqueue(c, "sbc:jobs", map[string]any{"type": "sales.report.refresh", "branchId": branchID})
	c.JSON(201, gin.H{"success": true, "data": gin.H{"id": orderID, "total": total}})
}
