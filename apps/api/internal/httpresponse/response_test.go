package httpresponse

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestResponsesUseConsistentEnvelope(t *testing.T) {
	gin.SetMode(gin.TestMode)
	tests := []struct {
		name       string
		write      func(*gin.Context)
		wantStatus int
		wantOK     bool
	}{
		{name: "ok", write: func(c *gin.Context) { OK(c, gin.H{"id": 1}) }, wantStatus: http.StatusOK, wantOK: true},
		{name: "created", write: func(c *gin.Context) { Created(c, gin.H{"id": 1}) }, wantStatus: http.StatusCreated, wantOK: true},
		{name: "error", write: func(c *gin.Context) {
			Error(c, http.StatusBadRequest, "ข้อมูลไม่ถูกต้อง")
		}, wantStatus: http.StatusBadRequest, wantOK: false},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			res := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(res)
			test.write(ctx)
			if res.Code != test.wantStatus {
				t.Fatalf("status = %d, want %d", res.Code, test.wantStatus)
			}
			var body map[string]any
			if err := json.Unmarshal(res.Body.Bytes(), &body); err != nil {
				t.Fatalf("decode response: %v", err)
			}
			if body["success"] != test.wantOK {
				t.Fatalf("success = %v, want %v", body["success"], test.wantOK)
			}
		})
	}
}
