package service

import (
	"context"
	"y/internal/model"
	"y/internal/repository"
)

type MenuService struct{ repo repository.MenuRepository }

func NewMenuService(repo repository.MenuRepository) *MenuService { return &MenuService{repo: repo} }
func (s *MenuService) List(ctx context.Context, branchID int64) ([]model.MenuItem, error) {
	return s.repo.List(ctx, branchID)
}
