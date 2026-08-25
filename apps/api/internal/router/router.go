package router

import (
	"database/sql"
	"github.com/gin-gonic/gin"
	"net/http"
	"os"
	"strings"
	"y/internal/handler"
	"y/internal/middleware"
)

func New(db *sql.DB) *gin.Engine {
	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())
	r.Use(func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		if os.Getenv("APP_ENV") != "production" && strings.HasPrefix(origin, "http://localhost:") {
			c.Header("Access-Control-Allow-Origin", origin)
		} else {
			for _, allowed := range strings.Split(os.Getenv("CORS_ORIGINS"), ",") {
				if strings.TrimSpace(allowed) == origin {
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
	})
	h := handler.NewUserHandler(nil)
	platform := handler.NewPlatformHandler(db)
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "development-only-change-me"
	}
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"success": true, "message": "API is running", "data": gin.H{"status": "healthy"}})
	})
	v1 := r.Group("/api/v1")
	v1.GET("/status", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"success": true, "message": "API is running", "data": gin.H{"status": "healthy"}})
	})
	v1.GET("/users", h.List)
	v1.POST("/auth/login", platform.Login)
	protected := v1.Group("")
	protected.Use(middleware.RequireAuth(secret))
	protected.GET("/dashboard", platform.Dashboard)
	protected.GET("/branches", platform.ListBranches)
	protected.GET("/inventory", platform.ListInventory)
	protected.POST("/inventory", middleware.RequireAuth(secret, "admin", "franchise_owner", "branch_manager"), platform.CreateInventory)
	protected.PATCH("/inventory/:id", middleware.RequireAuth(secret, "admin", "franchise_owner", "branch_manager"), platform.UpdateInventory)
	protected.DELETE("/inventory/:id", middleware.RequireAuth(secret, "admin", "franchise_owner", "branch_manager"), platform.DeleteInventory)
	protected.POST("/stock-requests", middleware.RequireAuth(secret, "admin", "franchise_owner", "branch_manager"), platform.CreateStockRequest)
	protected.GET("/stock-requests", platform.ListStockRequests)
	protected.PATCH("/stock-requests/:id/status", middleware.RequireAuth(secret, "admin"), platform.UpdateStockRequestStatus)
	protected.POST("/pos/orders", middleware.RequireAuth(secret, "admin", "franchise_owner", "branch_manager", "cashier"), platform.CreatePOSOrder)
	admin := protected.Group("/franchisees")
	admin.Use(middleware.RequireAuth(secret, "admin"))
	admin.GET("", platform.ListFranchisees)
	admin.POST("", platform.CreateFranchisee)
	return r
}
