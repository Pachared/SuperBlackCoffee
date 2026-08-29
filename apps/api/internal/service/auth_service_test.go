package service

import (
	"context"
	"database/sql"
	"errors"
	"testing"

	"golang.org/x/crypto/bcrypt"
	"y/internal/model"
)

type fakeAuthRepository struct {
	user model.User
	err  error
}

func (r fakeAuthRepository) FindByUsername(context.Context, string) (model.User, error) {
	return r.user, r.err
}

func TestAuthenticate(t *testing.T) {
	hash, err := bcrypt.GenerateFromPassword([]byte("correct-password"), bcrypt.MinCost)
	if err != nil {
		t.Fatalf("create password hash: %v", err)
	}
	tests := []struct {
		name    string
		repo    fakeAuthRepository
		secret  string
		wantErr error
	}{
		{name: "valid credentials", repo: fakeAuthRepository{user: model.User{ID: 1, Username: "admin", PasswordHash: string(hash)}}, secret: "correct-password"},
		{name: "unknown user", repo: fakeAuthRepository{err: sql.ErrNoRows}, secret: "correct-password", wantErr: ErrInvalidCredentials},
		{name: "wrong password", repo: fakeAuthRepository{user: model.User{PasswordHash: string(hash)}}, secret: "wrong-password", wantErr: ErrInvalidCredentials},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			user, gotErr := NewAuthService(test.repo).Authenticate(context.Background(), "admin", test.secret)
			if !errors.Is(gotErr, test.wantErr) {
				t.Fatalf("error = %v, want %v", gotErr, test.wantErr)
			}
			if test.wantErr == nil && user.Username != "admin" {
				t.Fatalf("user = %#v", user)
			}
		})
	}
}

func TestAuthenticateReturnsRepositoryFailure(t *testing.T) {
	wantErr := errors.New("database unavailable")
	_, gotErr := NewAuthService(fakeAuthRepository{err: wantErr}).Authenticate(context.Background(), "admin", "password")
	if !errors.Is(gotErr, wantErr) {
		t.Fatalf("error = %v, want repository error %v", gotErr, wantErr)
	}
}
