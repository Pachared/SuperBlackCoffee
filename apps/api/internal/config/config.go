package config

import (
	"fmt"
	"os"
	"strings"
)

func JWTSecret() string {
	if secret := os.Getenv("JWT_SECRET"); secret != "" {
		return secret
	}
	return "development-only-change-me"
}

// ValidateRuntime prevents development credentials or permissive CORS from
// accidentally being deployed to production.
func ValidateRuntime() error {
	if os.Getenv("APP_ENV") != "production" {
		return nil
	}
	if strings.TrimSpace(os.Getenv("JWT_SECRET")) == "" {
		return fmt.Errorf("JWT_SECRET must be configured in production")
	}
	if strings.TrimSpace(os.Getenv("CORS_ORIGINS")) == "" {
		return fmt.Errorf("CORS_ORIGINS must be configured in production")
	}
	return nil
}
