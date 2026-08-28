package handler

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"y/internal/cache"
	"y/internal/service"
)

type PlatformHandler struct {
	db        *sql.DB
	jwtSecret string
	cache     *cache.Client
	inventory *service.InventoryService
	auth      *service.AuthService
	menu      *service.MenuService
}

func NewPlatformHandler(db *sql.DB, redisCache *cache.Client, inventoryService *service.InventoryService, authService *service.AuthService, menuService *service.MenuService) *PlatformHandler {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "development-only-change-me"
	}
	return &PlatformHandler{db: db, jwtSecret: secret, cache: redisCache, inventory: inventoryService, auth: authService, menu: menuService}
}

func (h *PlatformHandler) invalidateBranchCache(c *gin.Context, branchID int64) {
	if h.cache == nil {
		return
	}
	h.cache.Delete(c,
		fmt.Sprintf("sbc:inventory:%d", branchID),
		fmt.Sprintf("sbc:inventory:%d:ingredient", branchID),
		fmt.Sprintf("sbc:inventory:%d:stock", branchID),
		fmt.Sprintf("sbc:menu:%d", branchID),
		fmt.Sprintf("sbc:dashboard:%d", branchID),
		"sbc:dashboard:all",
	)
	h.cache.DeletePattern(c, fmt.Sprintf("sbc:report:daily:*:%d", branchID))
	h.cache.DeletePattern(c, "sbc:report:daily:*:all")
}
func (h *PlatformHandler) unavailable(c *gin.Context) bool {
	if h.db == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"success": false, "message": "database is not configured"})
		return true
	}
	return false
}
