package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"y/internal/dto"
	"y/internal/model"
)

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
	cacheKey := "sbc:inventory:" + strconv.FormatInt(branchID, 10)
	if kind != "" {
		cacheKey += ":" + kind
	}
	var cached []model.InventoryItem
	if h.cache.GetJSON(c, cacheKey, &cached) {
		c.JSON(http.StatusOK, gin.H{"success": true, "data": cached})
		return
	}
	result, err := h.inventory.List(c, branchID, kind)
	if err != nil {
		c.JSON(500, gin.H{"success": false, "message": "failed to list inventory"})
		return
	}
	h.cache.SetJSON(c, cacheKey, result, 30*time.Second)
	c.JSON(200, gin.H{"success": true, "data": result})
}

type inventoryInput = dto.InventoryRequest

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
	item := model.InventoryItem{Name: input.Name, Category: defaultString(input.Category, "other"), Kind: model.InventoryKind(defaultString(input.Kind, "ingredient")), Quantity: input.Quantity, Unit: input.Unit, ReorderLevel: input.ReorderLevel, UnitCost: input.UnitCost}
	id, err := h.inventory.Create(c, branchID, item)
	if err != nil {
		c.JSON(500, gin.H{"success": false, "message": "failed to create inventory item"})
		return
	}
	h.invalidateBranchCache(c, branchID)
	h.recordAudit(c, branchID, "inventory_item", id, "created", gin.H{"name": item.Name, "quantity": item.Quantity, "unit": item.Unit})
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
	item := model.InventoryItem{Name: input.Name, Category: defaultString(input.Category, "other"), Kind: model.InventoryKind(defaultString(input.Kind, "ingredient")), Quantity: input.Quantity, Unit: input.Unit, ReorderLevel: input.ReorderLevel, UnitCost: input.UnitCost}
	found, err := h.inventory.Update(c, branchID, id, item)
	if err != nil || !found {
		c.JSON(404, gin.H{"success": false, "message": "inventory item was not found"})
		return
	}
	h.invalidateBranchCache(c, branchID)
	h.recordAudit(c, branchID, "inventory_item", id, "updated", gin.H{"name": item.Name, "quantity": item.Quantity, "unit": item.Unit})
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
	found, err := h.inventory.Delete(c, branchID, id)
	if err != nil || !found {
		c.JSON(404, gin.H{"success": false, "message": "inventory item was not found"})
		return
	}
	h.invalidateBranchCache(c, branchID)
	h.recordAudit(c, branchID, "inventory_item", id, "deleted", nil)
	c.Status(http.StatusNoContent)
}

type requestItemInput = dto.StockRequestItem
type requestInput = dto.StockRequest
