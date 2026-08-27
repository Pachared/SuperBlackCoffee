package repository

import (
	"database/sql"

	"y/internal/model"
)

type postgresUserRepository struct{ db *sql.DB }

func NewPostgresUserRepository(db *sql.DB) UserRepository {
	return &postgresUserRepository{db: db}
}

func (r *postgresUserRepository) List() ([]model.User, error) {
	if r.db == nil {
		return []model.User{}, nil
	}
	rows, err := r.db.Query(`SELECT id, name, username, email FROM users ORDER BY id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	users := make([]model.User, 0)
	for rows.Next() {
		var user model.User
		if err := rows.Scan(&user.ID, &user.Name, &user.Username, &user.Email); err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return users, nil
}
