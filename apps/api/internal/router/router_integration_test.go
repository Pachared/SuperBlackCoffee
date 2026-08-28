package router

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"y/internal/config"
	"y/internal/middleware"
)

func TestHealthIsPublic(t *testing.T) {
	r := New(nil, nil)
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	res := httptest.NewRecorder()
	r.ServeHTTP(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", res.Code, http.StatusOK)
	}
}

func TestProtectedRoutesRequireToken(t *testing.T) {
	r := New(nil, nil)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/dashboard", nil)
	res := httptest.NewRecorder()
	r.ServeHTTP(res, req)
	if res.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, want %d", res.Code, http.StatusUnauthorized)
	}
}

func TestUsersRequireAdminToken(t *testing.T) {
	r := New(nil, nil)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/users", nil)
	res := httptest.NewRecorder()
	r.ServeHTTP(res, req)
	if res.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, want %d", res.Code, http.StatusUnauthorized)
	}
}

func TestAdminRouteRejectsNonAdminRole(t *testing.T) {
	r := New(nil, nil)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/franchisees", nil)
	req.Header.Set("Authorization", "Bearer "+testToken(t, "cashier"))
	res := httptest.NewRecorder()
	r.ServeHTTP(res, req)
	if res.Code != http.StatusForbidden {
		t.Fatalf("status = %d, want %d", res.Code, http.StatusForbidden)
	}
}

func TestStockRequestsRejectCashierRole(t *testing.T) {
	r := New(nil, nil)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/stock-requests", nil)
	req.Header.Set("Authorization", "Bearer "+testToken(t, "cashier"))
	res := httptest.NewRecorder()
	r.ServeHTTP(res, req)
	if res.Code != http.StatusForbidden {
		t.Fatalf("status = %d, want %d", res.Code, http.StatusForbidden)
	}
}

func TestProtectedRoutesRejectUnexpectedSigningAlgorithm(t *testing.T) {
	r := New(nil, nil)
	claims := middleware.Claims{UserID: 7, Role: "admin", RegisteredClaims: jwt.RegisteredClaims{ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour))}}
	token, err := jwt.NewWithClaims(jwt.SigningMethodHS384, claims).SignedString([]byte(config.JWTSecret()))
	if err != nil {
		t.Fatalf("sign token: %v", err)
	}
	req := httptest.NewRequest(http.MethodGet, "/api/v1/dashboard", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	res := httptest.NewRecorder()
	r.ServeHTTP(res, req)
	if res.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, want %d", res.Code, http.StatusUnauthorized)
	}
}

func TestCORSOnlyAllowsConfiguredOrigin(t *testing.T) {
	t.Setenv("APP_ENV", "production")
	t.Setenv("CORS_ORIGINS", "https://admin.example.com")
	r := New(nil, nil)
	req := httptest.NewRequest(http.MethodOptions, "/health", nil)
	req.Header.Set("Origin", "https://admin.example.com")
	res := httptest.NewRecorder()
	r.ServeHTTP(res, req)
	if got := res.Header().Get("Access-Control-Allow-Origin"); got != "https://admin.example.com" {
		t.Fatalf("allowed origin = %q", got)
	}
	if res.Code != http.StatusNoContent {
		t.Fatalf("status = %d, want %d", res.Code, http.StatusNoContent)
	}
}

func TestMetricsAreAdminOnly(t *testing.T) {
	r := New(nil, nil)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/metrics", nil)
	req.Header.Set("Authorization", "Bearer "+testToken(t, "admin"))
	res := httptest.NewRecorder()
	r.ServeHTTP(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", res.Code, http.StatusOK)
	}
	if !strings.Contains(res.Body.String(), "superblack_http_requests_total") {
		t.Fatalf("metrics response did not contain request counter: %s", res.Body.String())
	}
}

func testToken(t *testing.T, role string) string {
	t.Helper()
	claims := middleware.Claims{UserID: 7, Role: role, RegisteredClaims: jwt.RegisteredClaims{ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour))}}
	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(config.JWTSecret()))
	if err != nil {
		t.Fatalf("sign token: %v", err)
	}
	return token
}
