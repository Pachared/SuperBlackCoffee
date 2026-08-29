package service

import (
	"context"
	"errors"
	"testing"

	"y/internal/model"
)

type fakeInventoryRepository struct {
	listBranchID              int64
	listKind                  string
	createBranchID            int64
	updatedBranchID, updateID int64
	deletedBranchID, deleteID int64
	items                     []model.InventoryItem
}

func (r *fakeInventoryRepository) List(_ context.Context, branchID int64, kind string) ([]model.InventoryItem, error) {
	r.listBranchID, r.listKind = branchID, kind
	return r.items, nil
}
func (r *fakeInventoryRepository) Create(_ context.Context, branchID int64, _ model.InventoryItem) (int64, error) {
	r.createBranchID = branchID
	return 11, nil
}
func (r *fakeInventoryRepository) Update(_ context.Context, branchID, id int64, _ model.InventoryItem) (bool, error) {
	r.updatedBranchID, r.updateID = branchID, id
	return true, nil
}
func (r *fakeInventoryRepository) Delete(_ context.Context, branchID, id int64) (bool, error) {
	r.deletedBranchID, r.deleteID = branchID, id
	return true, nil
}

func TestInventoryServiceDelegatesBranchScopedOperations(t *testing.T) {
	repo := &fakeInventoryRepository{items: []model.InventoryItem{{ID: 4, Name: "นม"}}}
	service := NewInventoryService(repo)
	items, err := service.List(context.Background(), 3, "ingredient")
	if err != nil || len(items) != 1 || repo.listBranchID != 3 || repo.listKind != "ingredient" {
		t.Fatalf("list result = %#v, err = %v, repo = %#v", items, err, repo)
	}
	if id, err := service.Create(context.Background(), 3, model.InventoryItem{}); err != nil || id != 11 || repo.createBranchID != 3 {
		t.Fatalf("create id = %d, err = %v", id, err)
	}
	if updated, err := service.Update(context.Background(), 3, 7, model.InventoryItem{}); err != nil || !updated || repo.updatedBranchID != 3 || repo.updateID != 7 {
		t.Fatalf("update result = %t, err = %v", updated, err)
	}
	if deleted, err := service.Delete(context.Background(), 3, 7); err != nil || !deleted || repo.deletedBranchID != 3 || repo.deleteID != 7 {
		t.Fatalf("delete result = %t, err = %v", deleted, err)
	}
}

type fakeMenuRepository struct {
	branchID int64
	err      error
}

func (r *fakeMenuRepository) List(_ context.Context, branchID int64) ([]model.MenuItem, error) {
	r.branchID = branchID
	return []model.MenuItem{{ID: 5, Name: "อเมริกาโน่"}}, r.err
}

func TestMenuServiceDelegatesToRepository(t *testing.T) {
	repo := &fakeMenuRepository{}
	items, err := NewMenuService(repo).List(context.Background(), 9)
	if err != nil || len(items) != 1 || repo.branchID != 9 {
		t.Fatalf("items = %#v, err = %v, branch = %d", items, err, repo.branchID)
	}
}

type fakeUserRepository struct {
	called bool
	err    error
}

func (r *fakeUserRepository) List() ([]model.User, error) {
	r.called = true
	return []model.User{{ID: 1, Username: "admin"}}, r.err
}

func TestUserServiceHandlesNilAndRepository(t *testing.T) {
	users, err := NewUserService(nil).List()
	if err != nil || len(users) != 0 {
		t.Fatalf("nil repository users = %#v, err = %v", users, err)
	}
	repo := &fakeUserRepository{}
	users, err = NewUserService(repo).List()
	if err != nil || !repo.called || len(users) != 1 {
		t.Fatalf("users = %#v, err = %v, called = %t", users, err, repo.called)
	}
	repo.err = errors.New("query failed")
	if _, err := NewUserService(repo).List(); !errors.Is(err, repo.err) {
		t.Fatalf("error = %v, want repository error", err)
	}
}
