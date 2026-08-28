package model

import "time"

type SalesChannel string

const (
	SalesChannelStorefront SalesChannel = "storefront"
	SalesChannelLineman    SalesChannel = "lineman"
)

type OrderStatus string

const (
	OrderStatusPaid   OrderStatus = "paid"
	OrderStatusVoided OrderStatus = "voided"
)

type POSOrderItem struct {
	ID          int64   `json:"id,omitempty"`
	ProductName string  `json:"productName"`
	Quantity    int     `json:"quantity"`
	UnitPrice   float64 `json:"unitPrice"`
	CostPrice   float64 `json:"costPrice"`
}

type POSOrder struct {
	ID        int64          `json:"id"`
	BranchID  int64          `json:"branchId"`
	Channel   SalesChannel   `json:"channel"`
	Status    OrderStatus    `json:"status"`
	Total     float64        `json:"total"`
	CashierID *int64         `json:"cashierId,omitempty"`
	Items     []POSOrderItem `json:"items,omitempty"`
	CreatedAt time.Time      `json:"createdAt"`
}
