package handler

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"y/internal/dto"
	"y/internal/middleware"
	"y/internal/service"
)

type loginInput = dto.LoginRequest

func (h *PlatformHandler) Login(c *gin.Context) {
	if h.unavailable(c) {
		return
	}
	var input loginInput
	if c.ShouldBindJSON(&input) != nil {
		c.JSON(400, gin.H{"success": false, "message": "username and password are required"})
		return
	}
	loginKey := "sbc:login:limit:" + c.ClientIP() + ":" + strings.ToLower(strings.TrimSpace(input.Username))
	if h.cache != nil && !h.cache.AllowLogin(c, loginKey, 10, 15*time.Minute) {
		c.JSON(http.StatusTooManyRequests, gin.H{"success": false, "message": "ลองเข้าสู่ระบบใหม่ภายหลัง"})
		return
	}
	user, err := h.auth.Authenticate(c, input.Username, input.Password)
	if err == service.ErrInvalidCredentials {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง"})
		return
	}
	if err != nil {
		c.JSON(500, gin.H{"success": false, "message": "failed to sign in"})
		return
	}
	if h.cache != nil {
		h.cache.Reset(c, loginKey)
	}
	claims := middleware.Claims{UserID: int64(user.ID), Role: user.Role, RegisteredClaims: jwt.RegisteredClaims{ExpiresAt: jwt.NewNumericDate(time.Now().Add(12 * time.Hour)), IssuedAt: jwt.NewNumericDate(time.Now())}}
	claims.FranchiseeID = user.FranchiseeID
	claims.BranchID = user.BranchID
	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(h.jwtSecret))
	if err != nil {
		c.JSON(500, gin.H{"success": false, "message": "failed to create access token"})
		return
	}
	c.JSON(200, gin.H{"success": true, "data": gin.H{"accessToken": token, "user": gin.H{"id": user.ID, "name": user.Name, "role": user.Role, "franchiseeId": claims.FranchiseeID, "branchId": claims.BranchID}}})
}
