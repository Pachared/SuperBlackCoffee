package router

import (
	"database/sql"

	"github.com/gin-gonic/gin"
	"y/internal/config"
	"y/internal/handler"
	"y/internal/middleware"
	"y/internal/repository"
	"y/internal/service"
)

func New(db *sql.DB) *gin.Engine {
	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery(), middleware.CORS())

	deps := routeDependencies{
		users:    handler.NewUserHandler(service.NewUserService(repository.NewPostgresUserRepository(db))),
		platform: handler.NewPlatformHandler(db),
		secret:   config.JWTSecret(),
	}
	registerPublicRoutes(r, deps)
	registerProtectedRoutes(r, deps)
	return r
}
