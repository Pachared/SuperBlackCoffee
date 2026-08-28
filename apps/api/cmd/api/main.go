package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
	"y/internal/cache"
	"y/internal/config"
	"y/internal/database"
	"y/internal/router"
)

func main() {
	if err := config.ValidateRuntime(); err != nil {
		slog.Error("invalid runtime configuration", "error", err)
		os.Exit(1)
	}
	port := os.Getenv("API_PORT")
	if port == "" {
		port = "8080"
	}
	db, err := database.Open(context.Background(), os.Getenv("DATABASE_URL"))
	if err != nil {
		slog.Error("database bootstrap failed", "error", err)
		os.Exit(1)
	}
	if db != nil {
		defer db.Close()
	}
	redisCache, redisErr := cache.New(context.Background(), os.Getenv("REDIS_URL"))
	if redisErr != nil {
		slog.Warn("redis unavailable; continuing without cache", "error", redisErr)
	}
	if redisCache != nil {
		defer redisCache.Close()
	}
	r := router.New(db, redisCache)
	server := &http.Server{Addr: ":" + port, Handler: r}
	go func() {
		slog.Info("API listening", "port", port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("server failed", "error", err)
			os.Exit(1)
		}
	}()
	signals := make(chan os.Signal, 1)
	signal.Notify(signals, syscall.SIGINT, syscall.SIGTERM)
	<-signals
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_ = server.Shutdown(ctx)
}
