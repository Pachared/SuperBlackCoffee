package cache

import (
	"context"
	"testing"
	"time"
)

func TestAllowLoginUsesFallbackWhenRedisIsUnavailable(t *testing.T) {
	client := (*Client)(nil)
	key := "test:login:fallback"
	for attempt := 1; attempt <= 2; attempt++ {
		if !client.AllowLogin(context.Background(), key, 2, time.Minute) {
			t.Fatalf("attempt %d should be allowed", attempt)
		}
	}
	if client.AllowLogin(context.Background(), key, 2, time.Minute) {
		t.Fatal("third attempt should be rate limited")
	}
	client.Reset(context.Background(), key)
	if !client.AllowLogin(context.Background(), key, 2, time.Minute) {
		t.Fatal("reset should clear fallback limit")
	}
}
