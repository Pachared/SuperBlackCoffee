package middleware

import (
	"fmt"
	"net/http"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type metric struct {
	count       uint64
	durationSec float64
}

var requestMetrics = struct {
	sync.Mutex
	byRoute map[string]metric
}{byRoute: make(map[string]metric)}

func RequestMetrics() gin.HandlerFunc {
	return func(c *gin.Context) {
		started := time.Now()
		c.Next()
		route := c.FullPath()
		if route == "" {
			route = "unmatched"
		}
		key := c.Request.Method + "|" + route + "|" + fmt.Sprint(c.Writer.Status())
		requestMetrics.Lock()
		current := requestMetrics.byRoute[key]
		current.count++
		current.durationSec += time.Since(started).Seconds()
		requestMetrics.byRoute[key] = current
		requestMetrics.Unlock()
	}
}

// Metrics returns a small Prometheus-compatible snapshot for operational
// dashboards. The router protects this endpoint with the admin role.
func Metrics(c *gin.Context) {
	requestMetrics.Lock()
	keys := make([]string, 0, len(requestMetrics.byRoute))
	for key := range requestMetrics.byRoute {
		keys = append(keys, key)
	}
	sort.Strings(keys)
	lines := []string{"# HELP superblack_http_requests_total Total API requests", "# TYPE superblack_http_requests_total counter", "# HELP superblack_http_request_duration_seconds Total API request duration", "# TYPE superblack_http_request_duration_seconds counter"}
	for _, key := range keys {
		parts := strings.Split(key, "|")
		value := requestMetrics.byRoute[key]
		labels := fmt.Sprintf(`method=%q,route=%q,status=%q`, parts[0], parts[1], parts[2])
		lines = append(lines,
			fmt.Sprintf("superblack_http_requests_total{%s} %d", labels, value.count),
			fmt.Sprintf("superblack_http_request_duration_seconds{%s} %.6f", labels, value.durationSec),
		)
	}
	requestMetrics.Unlock()
	c.Data(http.StatusOK, "text/plain; version=0.0.4; charset=utf-8", []byte(strings.Join(lines, "\n")+"\n"))
}
