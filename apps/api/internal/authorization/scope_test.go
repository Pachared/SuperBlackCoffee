package authorization

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"y/internal/middleware"
)

func TestBranchIDUsesClaimForNonAdmin(t *testing.T) {
	branchID := int64(12)
	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())
	ctx.Request = httptest.NewRequest(http.MethodGet, "/inventory?branchId=99", nil)
	ctx.Set("claims", &middleware.Claims{Role: "cashier", BranchID: &branchID})
	got, ok := BranchID(ctx, nil)
	if !ok || got != branchID {
		t.Fatalf("branch = %d, ok = %t", got, ok)
	}
}

func TestBranchIDRejectsUnscopedNonAdmin(t *testing.T) {
	res := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(res)
	ctx.Request = httptest.NewRequest(http.MethodGet, "/inventory", nil)
	ctx.Set("claims", &middleware.Claims{Role: "cashier"})
	_, ok := BranchID(ctx, nil)
	if ok || res.Code != http.StatusForbidden {
		t.Fatalf("ok = %t, status = %d", ok, res.Code)
	}
}

func TestBranchIDValidatesAdminBranchID(t *testing.T) {
	res := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(res)
	ctx.Request = httptest.NewRequest(http.MethodGet, "/inventory?branchId=invalid", nil)
	ctx.Set("claims", &middleware.Claims{Role: "admin"})
	_, ok := BranchID(ctx, nil)
	if ok || res.Code != http.StatusBadRequest {
		t.Fatalf("ok = %t, status = %d", ok, res.Code)
	}
}
