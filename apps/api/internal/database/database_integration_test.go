package database

import (
	"context"
	"os"
	"testing"
)

func TestMigrationsCreateImageColumns(t *testing.T) {
	url := os.Getenv("TEST_DATABASE_URL")
	if url == "" {
		t.Skip("กำหนด TEST_DATABASE_URL เพื่อทดสอบ PostgreSQL integration")
	}
	db, err := Open(context.Background(), url)
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	for _, table := range []string{"inventory_items", "menu_items"} {
		var exists bool
		if err := db.QueryRow(`SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name=$1 AND column_name='image_url')`, table).Scan(&exists); err != nil || !exists {
			t.Fatalf("%s.image_url missing: %v", table, err)
		}
	}
}
