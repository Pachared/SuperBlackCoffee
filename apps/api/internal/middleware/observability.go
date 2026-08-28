package middleware

import (
	"log/slog"
	"time"

	"github.com/gin-gonic/gin"
)

// RequestLogger emits one structured event per request, including latency and
// authenticated user context when it is available.
func RequestLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		started := time.Now()
		c.Next()
		attributes := []any{
			"method", c.Request.Method,
			"path", c.FullPath(),
			"status", c.Writer.Status(),
			"latency_ms", time.Since(started).Milliseconds(),
			"client_ip", c.ClientIP(),
		}
		if claims := ClaimsFrom(c); claims != nil {
			attributes = append(attributes, "user_id", claims.UserID, "role", claims.Role)
		}
		if len(c.Errors) > 0 {
			attributes = append(attributes, "errors", c.Errors.String())
		}
		slog.Info("http request", attributes...)
	}
}
