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
		return fmt.Errorf("ต้องกำหนด JWT_SECRET สำหรับระบบจริง")
	}
	if strings.TrimSpace(os.Getenv("CORS_ORIGINS")) == "" {
		return fmt.Errorf("ต้องกำหนด CORS_ORIGINS สำหรับระบบจริง")
	}
	return nil
}
