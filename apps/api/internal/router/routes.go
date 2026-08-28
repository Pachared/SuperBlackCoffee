package router

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"y/internal/handler"
	"y/internal/middleware"
)

type routeDependencies struct {
	users    *handler.UserHandler
	platform *handler.PlatformHandler
	secret   string
}

func registerPublicRoutes(r *gin.Engine, deps routeDependencies) {
	r.GET("/health", health)
	v1 := r.Group("/api/v1")
	v1.GET("/status", health)
	v1.POST("/website/leads", deps.platform.CreateWebsiteLead)
	v1.GET("/users", middleware.RequireAuth(deps.secret, "admin"), deps.users.List)
	v1.POST("/auth/login", deps.platform.Login)
}

func registerProtectedRoutes(r *gin.Engine, deps routeDependencies) {
	protected := r.Group("/api/v1")
	protected.Use(middleware.RequireAuth(deps.secret))
	protected.GET("/dashboard", deps.platform.Dashboard)
	protected.GET("/metrics", middleware.RequireAuth(deps.secret, "admin"), middleware.Metrics)
	protected.GET("/reports/daily-sales", deps.platform.DailySalesReport)
	protected.GET("/branches", deps.platform.ListBranches)
	protected.GET("/branches/sales", middleware.RequireAuth(deps.secret, "admin"), deps.platform.BranchSales)
	protected.GET("/inventory", deps.platform.ListInventory)
	protected.GET("/menu-items", deps.platform.ListMenuItems)
	protected.POST("/menu-items", middleware.RequireAuth(deps.secret, "admin", "franchise_owner", "branch_manager"), deps.platform.CreateMenuItem)
	protected.PATCH("/menu-items/:id", middleware.RequireAuth(deps.secret, "admin", "franchise_owner", "branch_manager"), deps.platform.UpdateMenuItem)
	protected.DELETE("/menu-items/:id", middleware.RequireAuth(deps.secret, "admin", "franchise_owner", "branch_manager"), deps.platform.DeleteMenuItem)
	protected.POST("/inventory", middleware.RequireAuth(deps.secret, "admin", "franchise_owner", "branch_manager"), deps.platform.CreateInventory)
	protected.PATCH("/inventory/:id", middleware.RequireAuth(deps.secret, "admin", "franchise_owner", "branch_manager"), deps.platform.UpdateInventory)
	protected.DELETE("/inventory/:id", middleware.RequireAuth(deps.secret, "admin", "franchise_owner", "branch_manager"), deps.platform.DeleteInventory)
	protected.POST("/stock-requests", middleware.RequireAuth(deps.secret, "admin", "franchise_owner", "branch_manager"), deps.platform.CreateStockRequest)
	protected.GET("/stock-requests", middleware.RequireAuth(deps.secret, "admin", "franchise_owner", "branch_manager"), deps.platform.ListStockRequests)
	protected.GET("/audit-events", middleware.RequireAuth(deps.secret, "admin"), deps.platform.ListAuditEvents)
	protected.GET("/website/leads", middleware.RequireAuth(deps.secret, "admin"), deps.platform.ListWebsiteLeads)
	protected.PATCH("/website/leads/:id/status", middleware.RequireAuth(deps.secret, "admin"), deps.platform.UpdateWebsiteLeadStatus)
	protected.PATCH("/stock-requests/:id/status", middleware.RequireAuth(deps.secret, "admin"), deps.platform.UpdateStockRequestStatus)
	protected.POST("/pos/orders", middleware.RequireAuth(deps.secret, "admin", "franchise_owner", "branch_manager", "cashier"), deps.platform.CreatePOSOrder)
	registerAdminRoutes(protected, deps)
}

func registerAdminRoutes(protected *gin.RouterGroup, deps routeDependencies) {
	admin := protected.Group("/franchisees")
	admin.Use(middleware.RequireAuth(deps.secret, "admin"))
	admin.GET("", deps.platform.ListFranchisees)
	admin.POST("", deps.platform.CreateFranchisee)
}

func health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "API ทำงานปกติ", "data": gin.H{"status": "พร้อมใช้งาน"}})
}
