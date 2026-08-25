package database

import (
	"context"
	"database/sql"
	"embed"
	"fmt"
	"os"
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
	contents, err := migrationFiles.ReadFile("migrations/001_initial.sql")
	if err != nil {
		return err
	}
	_, err = db.ExecContext(ctx, string(contents))
	if err != nil {
		return fmt.Errorf("apply migrations: %w", err)
	}
	return nil
}

func seed(ctx context.Context, db *sql.DB) error {
	if os.Getenv("SEED_DEMO_DATA") != "true" {
		return nil
	}
	passwordHash, err := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("hash demo password: %w", err)
	}
	_, err = db.ExecContext(ctx, `
		INSERT INTO users (name,email,password_hash,role) VALUES
		('สำนักงานใหญ่','admin@superblackcoffee.local',$1,'admin')
		ON CONFLICT (email) DO NOTHING;
		INSERT INTO franchisees (name,email,plan,status) VALUES ('Siam Coffee Group','siam@superblackcoffee.local','M','active') ON CONFLICT (email) DO NOTHING;
		INSERT INTO branches (franchisee_id,name,code,status) SELECT id,'สยามสแควร์','SBC-BKK-001','active' FROM franchisees WHERE email='siam@superblackcoffee.local' ON CONFLICT (code) DO NOTHING;
		INSERT INTO users (name,email,password_hash,role,franchisee_id,branch_id)
		SELECT 'ผู้จัดการสาขาสยามสแควร์','manager@superblackcoffee.local',$1,'branch_manager',f.id,b.id
		FROM franchisees f JOIN branches b ON b.franchisee_id=f.id
		WHERE f.email='siam@superblackcoffee.local' AND b.code='SBC-BKK-001'
		ON CONFLICT (email) DO NOTHING;
	`, string(passwordHash))
	return err
}
