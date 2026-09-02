package handler

import "github.com/gin-gonic/gin"

// Dashboard keeps the Admin overview contract available while it awaits a future sales integration.
func (h *PlatformHandler) Dashboard(c *gin.Context) {
	if h.unavailable(c) {
		return
	}
	c.JSON(200, gin.H{"success": true, "data": gin.H{"todaySales": 0, "todayOrders": 0}})
}
