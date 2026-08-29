package handler

import (
	"database/sql"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestPlatformHandlerRejectsDatabaseDependentRequestsWhenDatabaseIsMissing(t *testing.T) {
	gin.SetMode(gin.TestMode)
	handler := NewPlatformHandler(nil, nil, nil, nil, nil)
	res := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(res)
	ctx.Request = httptest.NewRequest(http.MethodGet, "/api/v1/dashboard", nil)
	if !handler.unavailable(ctx) {
		t.Fatal("expected nil database to be unavailable")
	}
	if res.Code != http.StatusServiceUnavailable {
		t.Fatalf("status = %d, want %d", res.Code, http.StatusServiceUnavailable)
	}
}

func TestPlatformHandlerIsAvailableWhenDatabaseExists(t *testing.T) {
	handler := &PlatformHandler{db: &sql.DB{}}
	res := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(res)
	if handler.unavailable(ctx) {
		t.Fatal("expected handler without a response to remain available")
	}
}
