package repository

import (
	"context"
	"database/sql"
	"errors"
	"os"
	"testing"

	"y/internal/database"
	"y/internal/model"
)

func openRepositoryTestDB(t *testing.T) *sql.DB {
	t.Helper()
	url := os.Getenv("TEST_DATABASE_URL")
	if url == "" {
		t.Skip("กำหนด TEST_DATABASE_URL เพื่อทดสอบ PostgreSQL integration")
	}
	db, err := database.Open(context.Background(), url)
	if err != nil {
		t.Fatalf("เปิดฐานข้อมูลทดสอบ: %v", err)
	}
	t.Cleanup(func() { _ = db.Close() })
	if _, err := db.Exec(`TRUNCATE TABLE users, menu_item_ingredients, menu_items, inventory_items, branches, franchisees RESTART IDENTITY CASCADE`); err != nil {
		t.Fatalf("ล้างฐานข้อมูลทดสอบ: %v", err)
	}
	return db
}

func seedTestBranch(t *testing.T, db *sql.DB) int64 {
	t.Helper()
	var id int64
	if err := db.QueryRow(`INSERT INTO branches(name,code) VALUES('สาขาทดสอบ','TEST-001') RETURNING id`).Scan(&id); err != nil {
		t.Fatalf("สร้างสาขาทดสอบ: %v", err)
	}
	return id
}

func TestPostgresAuthRepositoryFindsUsernameCaseInsensitively(t *testing.T) {
	db := openRepositoryTestDB(t)
	if _, err := db.Exec(`INSERT INTO users(name,username,email,password_hash,role) VALUES('ผู้ดูแล','Admin','admin@example.com','hash','admin')`); err != nil {
		t.Fatalf("สร้างผู้ใช้ทดสอบ: %v", err)
	}
	user, err := NewPostgresAuthRepository(db).FindByUsername(context.Background(), "admin")
	if err != nil || user.Username != "Admin" || user.Role != "admin" {
		t.Fatalf("user = %#v, err = %v", user, err)
	}
	_, err = NewPostgresAuthRepository(db).FindByUsername(context.Background(), "missing")
	if !errors.Is(err, sql.ErrNoRows) {
		t.Fatalf("error = %v, want sql.ErrNoRows", err)
	}
}

func TestPostgresInventoryRepositoryCRUDAndStatus(t *testing.T) {
	db := openRepositoryTestDB(t)
	branchID := seedTestBranch(t, db)
	repo := NewPostgresInventoryRepository(db)
	id, err := repo.Create(context.Background(), branchID, model.InventoryItem{Name: "นม", Category: "dairy", Kind: model.InventoryKindIngredient, Quantity: 2, Unit: "ลิตร", ReorderLevel: 2, UnitCost: 45})
	if err != nil || id < 1 {
		t.Fatalf("create id = %d, err = %v", id, err)
	}
	items, err := repo.List(context.Background(), branchID, "ingredient")
	if err != nil || len(items) != 1 || items[0].Status != "low" {
		t.Fatalf("items = %#v, err = %v", items, err)
	}
	updated, err := repo.Update(context.Background(), branchID, id, model.InventoryItem{Name: "นม", Category: "dairy", Kind: model.InventoryKindIngredient, Quantity: 0, Unit: "ลิตร", ReorderLevel: 2, UnitCost: 50})
	if err != nil || !updated {
		t.Fatalf("updated = %t, err = %v", updated, err)
	}
	items, err = repo.List(context.Background(), branchID, "")
	if err != nil || items[0].Status != "out" || items[0].UnitCost != 50 {
		t.Fatalf("items = %#v, err = %v", items, err)
	}
	deleted, err := repo.Delete(context.Background(), branchID, id)
	if err != nil || !deleted {
		t.Fatalf("deleted = %t, err = %v", deleted, err)
	}
}

func TestPostgresMenuRepositoryReturnsIngredients(t *testing.T) {
	db := openRepositoryTestDB(t)
	branchID := seedTestBranch(t, db)
	var inventoryID, menuID int64
	if err := db.QueryRow(`INSERT INTO inventory_items(branch_id,name,category,kind,quantity,unit,reorder_level,unit_cost) VALUES($1,'เมล็ดกาแฟ','coffee','ingredient',10,'กรัม',2,1.5) RETURNING id`, branchID).Scan(&inventoryID); err != nil {
		t.Fatalf("สร้างวัตถุดิบ: %v", err)
	}
	if err := db.QueryRow(`INSERT INTO menu_items(branch_id,name,category,store_price,lineman_price,cost_price,status) VALUES($1,'อเมริกาโน่','coffee',60,70,18,'available') RETURNING id`, branchID).Scan(&menuID); err != nil {
		t.Fatalf("สร้างเมนู: %v", err)
	}
	if _, err := db.Exec(`INSERT INTO menu_item_ingredients(menu_item_id,inventory_item_id,quantity,unit,cost_amount) VALUES($1,$2,12,'กรัม',18)`, menuID, inventoryID); err != nil {
		t.Fatalf("สร้างสูตรเมนู: %v", err)
	}
	items, err := NewPostgresMenuRepository(db).List(context.Background(), branchID)
	if err != nil || len(items) != 1 || len(items[0].Ingredients) != 1 {
		t.Fatalf("items = %#v, err = %v", items, err)
	}
	if items[0].Ingredients[0].Name != "เมล็ดกาแฟ" || items[0].Ingredients[0].Quantity != 12 {
		t.Fatalf("ingredients = %#v", items[0].Ingredients)
	}
}
