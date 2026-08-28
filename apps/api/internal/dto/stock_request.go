package dto

type StockRequestItem struct {
	InventoryItemID *int64  `json:"inventoryItemId"`
	Name            string  `json:"name" binding:"required"`
	Quantity        float64 `json:"quantity" binding:"required,gt=0"`
	Unit            string  `json:"unit" binding:"required"`
}
type StockRequest struct {
	BranchID *int64             `json:"branchId"`
	Note     string             `json:"note"`
	Items    []StockRequestItem `json:"items" binding:"required,min=1"`
}
type StockStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=approved preparing completed rejected"`
}
