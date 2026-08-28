package model

import "time"

type StockRequestStatus string

const (
	StockRequestPending   StockRequestStatus = "pending"
	StockRequestApproved  StockRequestStatus = "approved"
	StockRequestPreparing StockRequestStatus = "preparing"
	StockRequestCompleted StockRequestStatus = "completed"
	StockRequestRejected  StockRequestStatus = "rejected"
)

type StockRequestItem struct {
	ID              int64   `json:"id,omitempty"`
	InventoryItemID *int64  `json:"inventoryItemId,omitempty"`
	ItemName        string  `json:"name"`
	Quantity        float64 `json:"quantity"`
	Unit            string  `json:"unit"`
}

type StockRequest struct {
	ID          int64              `json:"id"`
	BranchID    int64              `json:"branchId"`
	Status      StockRequestStatus `json:"status"`
	Note        string             `json:"note"`
	RequestedBy *int64             `json:"requestedBy,omitempty"`
	ApprovedBy  *int64             `json:"approvedBy,omitempty"`
	Items       []StockRequestItem `json:"items,omitempty"`
	CreatedAt   time.Time          `json:"createdAt"`
	UpdatedAt   time.Time          `json:"updatedAt"`
}
