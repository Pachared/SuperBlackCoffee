package handler
import ("net/http"; "github.com/gin-gonic/gin"; "y/internal/service")
type UserHandler struct { service service.UserService }; func NewUserHandler(s service.UserService) *UserHandler { return &UserHandler{s} }; func (h *UserHandler) List(c *gin.Context) { users := []any{}; if h.service != nil { result, err := h.service.List(); if err != nil { c.JSON(500, gin.H{"success":false,"message":"failed to get users"}); return }; for _, user := range result { users = append(users, user) } }; c.JSON(http.StatusOK, gin.H{"success":true,"message":"Users retrieved","data":users}) }
