package service

import (
	"context"

	"y/internal/model"
	"y/internal/repository"
)

type InventoryService struct {
	repo repository.InventoryRepository
}

func NewInventoryService(repo repository.InventoryRepository) *InventoryService {
	return &InventoryService{repo: repo}
}
func (s *InventoryService) List(ctx context.Context, branchID int64, kind string) ([]model.InventoryItem, error) {
	return s.repo.List(ctx, branchID, kind)
}
func (s *InventoryService) Create(ctx context.Context, branchID int64, item model.InventoryItem) (int64, error) {
	return s.repo.Create(ctx, branchID, item)
}
func (s *InventoryService) Update(ctx context.Context, branchID, id int64, item model.InventoryItem) (bool, error) {
	return s.repo.Update(ctx, branchID, id, item)
}
func (s *InventoryService) Delete(ctx context.Context, branchID, id int64) (bool, error) {
	return s.repo.Delete(ctx, branchID, id)
}
