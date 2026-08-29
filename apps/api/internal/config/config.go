package config

import (
	"fmt"
	"net"
	"net/url"
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
	return validateProductionOrigins(os.Getenv("CORS_ORIGINS"))
}

func validateProductionOrigins(value string) error {
	for _, rawOrigin := range strings.Split(value, ",") {
		origin := strings.TrimSpace(rawOrigin)
		if origin == "" || origin == "*" {
			return fmt.Errorf("CORS_ORIGINS ต้องเป็น HTTPS origin ที่ระบุชัดเจน")
		}
		parsed, err := url.Parse(origin)
		if err != nil || parsed.Scheme != "https" || parsed.Host == "" || parsed.Path != "" || parsed.RawQuery != "" || parsed.Fragment != "" || parsed.User != nil {
			return fmt.Errorf("CORS_ORIGINS ไม่ถูกต้อง: %q", origin)
		}
		host := parsed.Hostname()
		if strings.EqualFold(host, "localhost") || (net.ParseIP(host) != nil && net.ParseIP(host).IsLoopback()) {
			return fmt.Errorf("CORS_ORIGINS สำหรับระบบจริงห้ามใช้ localhost: %q", origin)
		}
	}
	return nil
}
