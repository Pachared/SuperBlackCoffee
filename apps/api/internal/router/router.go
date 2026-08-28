package router

import (
	"database/sql"

	"github.com/gin-gonic/gin"
	"y/internal/cache"
	"y/internal/config"
	"y/internal/handler"
	"y/internal/middleware"
	"y/internal/repository"
	"y/internal/service"
)

func New(db *sql.DB, redisCache *cache.Client) *gin.Engine {
	r := gin.New()
	r.Use(middleware.RequestLogger(), middleware.RequestMetrics(), gin.Recovery(), middleware.CORS())

	deps := routeDependencies{
		users:    handler.NewUserHandler(service.NewUserService(repository.NewPostgresUserRepository(db))),
		platform: handler.NewPlatformHandler(db, redisCache, service.NewInventoryService(repository.NewPostgresInventoryRepository(db)), service.NewAuthService(repository.NewPostgresAuthRepository(db)), service.NewMenuService(repository.NewPostgresMenuRepository(db))),
		secret:   config.JWTSecret(),
	}
	registerPublicRoutes(r, deps)
	registerProtectedRoutes(r, deps)
	return r
}
