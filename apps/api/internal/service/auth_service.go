package service

import (
	"context"
	"database/sql"
	"errors"
	"golang.org/x/crypto/bcrypt"
	"y/internal/model"
	"y/internal/repository"
)

var ErrInvalidCredentials = errors.New("ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง")

type AuthService struct{ repo repository.AuthRepository }

func NewAuthService(repo repository.AuthRepository) *AuthService { return &AuthService{repo: repo} }
func (s *AuthService) Authenticate(ctx context.Context, username, password string) (model.User, error) {
	u, err := s.repo.FindByUsername(ctx, username)
	if errors.Is(err, sql.ErrNoRows) {
		return model.User{}, ErrInvalidCredentials
	}
	if err != nil {
		return model.User{}, err
	}
	if bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(password)) != nil {
		return model.User{}, ErrInvalidCredentials
	}
	return u, nil
}
