package middleware

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

// CORS allows local frontend apps during development and configured origins in production.
func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		if os.Getenv("APP_ENV") != "production" && strings.HasPrefix(origin, "http://localhost:") {
			c.Header("Access-Control-Allow-Origin", origin)
		} else {
			for _, allowed := range strings.Split(os.Getenv("CORS_ORIGINS"), ",") {
				if strings.TrimSpace(allowed) == origin && origin != "" {
					c.Header("Access-Control-Allow-Origin", origin)
					break
				}
			}
		}
		c.Header("Access-Control-Allow-Headers", "Authorization, Content-Type")
		c.Header("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS")
		if c.Request.Method == http.MethodOptions {
			c.Status(http.StatusNoContent)
			c.Abort()
			return
		}
		c.Next()
	}
}
