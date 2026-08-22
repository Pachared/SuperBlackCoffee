package router

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"y/internal/handler"
)

func New() *gin.Engine {
	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())
	h := handler.NewUserHandler(nil)
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"success": true, "message": "API is running", "data": gin.H{"status": "healthy"}})
	})
	v1 := r.Group("/api/v1")
	v1.GET("/status", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"success": true, "message": "API is running", "data": gin.H{"status": "healthy"}})
	})
	v1.GET("/users", h.List)
	return r
}
