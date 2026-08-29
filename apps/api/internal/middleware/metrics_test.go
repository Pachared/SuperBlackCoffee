package middleware

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestRequestMetricsExportsRouteLabels(t *testing.T) {
	gin.SetMode(gin.TestMode)
	requestMetrics.Lock()
	requestMetrics.byRoute = make(map[string]metric)
	requestMetrics.Unlock()
	r := gin.New()
	r.Use(RequestMetrics())
	r.GET("/health", func(c *gin.Context) { c.Status(http.StatusOK) })
	r.GET("/metrics", Metrics)
	r.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest(http.MethodGet, "/health", nil))
	res := httptest.NewRecorder()
	r.ServeHTTP(res, httptest.NewRequest(http.MethodGet, "/metrics", nil))
	if res.Code != http.StatusOK {
		t.Fatalf("status = %d", res.Code)
	}
	body := res.Body.String()
	if !strings.Contains(body, `superblack_http_requests_total{method="GET",route="/health",status="200"} 1`) {
		t.Fatalf("health metric missing: %s", body)
	}
	if !strings.Contains(res.Header().Get("Content-Type"), "text/plain") {
		t.Fatalf("content type = %q", res.Header().Get("Content-Type"))
	}
}
