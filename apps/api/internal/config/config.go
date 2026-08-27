package config

import "os"

func JWTSecret() string {
	if secret := os.Getenv("JWT_SECRET"); secret != "" {
		return secret
	}
	return "development-only-change-me"
}
