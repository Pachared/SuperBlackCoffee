package dto

type OrderItemRequest struct {
	ProductName string  `json:"productName" binding:"required"`
	Quantity    int     `json:"quantity" binding:"required,gt=0"`
	UnitPrice   float64 `json:"unitPrice" binding:"required,gte=0"`
	CostPrice   float64 `json:"costPrice" binding:"gte=0"`
}
type POSOrderRequest struct {
	BranchID *int64             `json:"branchId"`
	Channel  string             `json:"channel" binding:"required,oneof=storefront lineman"`
	Items    []OrderItemRequest `json:"items" binding:"required,min=1"`
}
