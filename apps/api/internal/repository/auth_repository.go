package repository

import (
	"context"
	"database/sql"
	"y/internal/model"
)

type AuthRepository interface {
	FindByUsername(context.Context, string) (model.User, error)
}
type postgresAuthRepository struct{ db *sql.DB }

func NewPostgresAuthRepository(db *sql.DB) AuthRepository { return &postgresAuthRepository{db: db} }
func (r *postgresAuthRepository) FindByUsername(ctx context.Context, username string) (model.User, error) {
	var u model.User
	err := r.db.QueryRowContext(ctx, `SELECT id,name,username,email,password_hash,role,franchisee_id,branch_id FROM users WHERE lower(username)=lower($1)`, username).Scan(&u.ID, &u.Name, &u.Username, &u.Email, &u.PasswordHash, &u.Role, &u.FranchiseeID, &u.BranchID)
	return u, err
}
