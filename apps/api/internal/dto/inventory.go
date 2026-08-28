package dto

type InventoryRequest struct {
	Name         string  `json:"name" binding:"required"`
	Category     string  `json:"category"`
	Kind         string  `json:"kind" binding:"omitempty,oneof=ingredient stock"`
	Quantity     float64 `json:"quantity"`
	Unit         string  `json:"unit" binding:"required"`
	ReorderLevel float64 `json:"reorderLevel"`
	UnitCost     float64 `json:"unitCost" binding:"gte=0"`
}
