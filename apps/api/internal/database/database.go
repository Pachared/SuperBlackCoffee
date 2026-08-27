package database

import (
	"context"
	"database/sql"
	"embed"
	"fmt"
	"os"
	"sort"
	"strings"

	_ "github.com/jackc/pgx/v5/stdlib"
	"golang.org/x/crypto/bcrypt"
)

//go:embed migrations/*.sql
var migrationFiles embed.FS

func Open(ctx context.Context, url string) (*sql.DB, error) {
	if strings.TrimSpace(url) == "" {
		return nil, nil
	}
	db, err := sql.Open("pgx", url)
	if err != nil {
		return nil, fmt.Errorf("open database: %w", err)
	}
	if err := db.PingContext(ctx); err != nil {
		db.Close()
		return nil, fmt.Errorf("ping database: %w", err)
	}
	if err := migrate(ctx, db); err != nil {
		db.Close()
		return nil, err
	}
	return db, seed(ctx, db)
}

func migrate(ctx context.Context, db *sql.DB) error {
	entries, err := migrationFiles.ReadDir("migrations")
	if err != nil {
		return err
	}
	sort.Slice(entries, func(i, j int) bool { return entries[i].Name() < entries[j].Name() })
	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".sql") {
			continue
		}
		contents, readErr := migrationFiles.ReadFile("migrations/" + entry.Name())
		if readErr != nil {
			return readErr
		}
		if _, execErr := db.ExecContext(ctx, string(contents)); execErr != nil {
			return fmt.Errorf("apply migration %s: %w", entry.Name(), execErr)
		}
	}
	return nil
}

func seed(ctx context.Context, db *sql.DB) error {
	if os.Getenv("SEED_DEMO_DATA") != "true" {
		return nil
	}
	bootstrapUsername := os.Getenv("ADMIN_BOOTSTRAP_USERNAME")
	if bootstrapUsername == "" {
		bootstrapUsername = "admin"
	}
	bootstrapPassword := os.Getenv("ADMIN_BOOTSTRAP_PASSWORD")
	if bootstrapPassword == "" {
		bootstrapPassword = "password"
	}
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(bootstrapPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("hash demo password: %w", err)
	}
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin demo seed: %w", err)
	}
	statements := []struct {
		query string
		args  []any
	}{
		{`INSERT INTO users (name,username,email,password_hash,role) VALUES ('สำนักงานใหญ่',$1,'admin@superblackcoffee.local',$2,'admin') ON CONFLICT (email) DO NOTHING`, []any{bootstrapUsername, string(passwordHash)}},
		{`INSERT INTO franchisees (name,email,plan,status) VALUES ('Siam Coffee Group','siam@superblackcoffee.local','M','active') ON CONFLICT (email) DO NOTHING`, nil},
		{`INSERT INTO branches (franchisee_id,name,code,status) SELECT id,'สยามสแควร์','SBC-BKK-001','active' FROM franchisees WHERE email='siam@superblackcoffee.local' ON CONFLICT (code) DO NOTHING`, nil},
		{`INSERT INTO users (name,username,email,password_hash,role,franchisee_id,branch_id) SELECT 'ผู้จัดการสาขาสยามสแควร์','manager','manager@superblackcoffee.local',$1,'branch_manager',f.id,b.id FROM franchisees f JOIN branches b ON b.franchisee_id=f.id WHERE f.email='siam@superblackcoffee.local' AND b.code='SBC-BKK-001' ON CONFLICT (email) DO NOTHING`, []any{string(passwordHash)}},
		{`INSERT INTO menu_items (branch_id,name,category,store_price,lineman_price,cost_price) SELECT b.id,v.name,v.category,v.store_price,v.lineman_price,v.cost_price FROM branches b CROSS JOIN (VALUES ('อเมริกาโน่เย็น','กาแฟ',85.00,95.00,24.00),('ลาเต้เย็น','กาแฟ',95.00,110.00,38.00),('มัทฉะลาเต้','ชาและมัทฉะ',110.00,125.00,42.00),('ช็อกโกแลตเย็น','เครื่องดื่ม',100.00,115.00,35.00)) AS v(name,category,store_price,lineman_price,cost_price) WHERE b.code='SBC-BKK-001' ON CONFLICT (branch_id,name) DO NOTHING`, nil},
	}
	for _, statement := range statements {
		if _, execErr := tx.ExecContext(ctx, statement.query, statement.args...); execErr != nil {
			_ = tx.Rollback()
			return fmt.Errorf("seed demo data: %w", execErr)
		}
	}
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("commit demo seed: %w", err)
	}
	return nil
}
