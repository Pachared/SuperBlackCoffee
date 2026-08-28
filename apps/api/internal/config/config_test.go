package config

import "testing"

func TestValidateRuntimeRequiresProductionSecrets(t *testing.T) {
	t.Setenv("APP_ENV", "production")
	t.Setenv("JWT_SECRET", "")
	t.Setenv("CORS_ORIGINS", "https://admin.example.com")
	if err := ValidateRuntime(); err == nil {
		t.Fatal("expected missing JWT_SECRET to fail")
	}

	t.Setenv("JWT_SECRET", "a-long-production-secret")
	t.Setenv("CORS_ORIGINS", "")
	if err := ValidateRuntime(); err == nil {
		t.Fatal("expected missing CORS_ORIGINS to fail")
	}
}

func TestValidateRuntimeAllowsDevelopmentDefaults(t *testing.T) {
	t.Setenv("APP_ENV", "development")
	t.Setenv("JWT_SECRET", "")
	t.Setenv("CORS_ORIGINS", "")
	if err := ValidateRuntime(); err != nil {
		t.Fatalf("development config should be valid: %v", err)
	}
}
