package model

import "time"

type Branch struct {
	ID           int64     `json:"id"`
	FranchiseeID *int64    `json:"franchiseeId,omitempty"`
	Name         string    `json:"name"`
	Code         string    `json:"code"`
	Status       string    `json:"status"`
	CreatedAt    time.Time `json:"createdAt"`
}
