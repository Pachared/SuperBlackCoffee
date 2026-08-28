package cache

import (
	"context"
	"encoding/json"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"
)

// Client is an optional Redis integration. PostgreSQL remains the source of truth;
// callers can safely skip caching when Redis is unavailable.
type Client struct{ rdb *redis.Client }

type fallbackLoginWindow struct {
	count     int
	expiresAt time.Time
}

var fallbackLoginLimits = struct {
	sync.Mutex
	entries map[string]fallbackLoginWindow
}{entries: make(map[string]fallbackLoginWindow)}

func New(ctx context.Context, url string) (*Client, error) {
	if url == "" {
		return nil, nil
	}
	options, err := redis.ParseURL(url)
	if err != nil {
		return nil, err
	}
	rdb := redis.NewClient(options)
	if err := rdb.Ping(ctx).Err(); err != nil {
		rdb.Close()
		return nil, err
	}
	return &Client{rdb: rdb}, nil
}

func (c *Client) Close() error {
	if c == nil || c.rdb == nil {
		return nil
	}
	return c.rdb.Close()
}

func (c *Client) GetJSON(ctx context.Context, key string, target any) bool {
	if c == nil || c.rdb == nil {
		return false
	}
	value, err := c.rdb.Get(ctx, key).Result()
	if err != nil {
		return false
	}
	return json.Unmarshal([]byte(value), target) == nil
}

func (c *Client) SetJSON(ctx context.Context, key string, value any, ttl time.Duration) {
	if c == nil || c.rdb == nil {
		return
	}
	encoded, err := json.Marshal(value)
	if err == nil {
		_ = c.rdb.Set(ctx, key, encoded, ttl).Err()
	}
}

func (c *Client) Delete(ctx context.Context, keys ...string) {
	if c == nil || c.rdb == nil || len(keys) == 0 {
		return
	}
	_ = c.rdb.Del(ctx, keys...).Err()
}

// DeletePattern removes short-lived derived keys matching a prefix/pattern.
// It uses SCAN rather than KEYS so it remains safe when the database grows.
func (c *Client) DeletePattern(ctx context.Context, pattern string) {
	if c == nil || c.rdb == nil {
		return
	}
	var cursor uint64
	for {
		keys, next, err := c.rdb.Scan(ctx, cursor, pattern, 100).Result()
		if err != nil {
			return
		}
		if len(keys) > 0 {
			_ = c.rdb.Del(ctx, keys...).Err()
		}
		cursor = next
		if cursor == 0 {
			return
		}
	}
}

// AllowLogin applies a small fixed-window limit per username and IP address.
func (c *Client) AllowLogin(ctx context.Context, key string, limit int, window time.Duration) bool {
	if c == nil || c.rdb == nil {
		return allowFallbackLogin(key, limit, window)
	}
	count, err := c.rdb.Incr(ctx, key).Result()
	if err != nil {
		return allowFallbackLogin(key, limit, window)
	}
	if count == 1 {
		_ = c.rdb.Expire(ctx, key, window).Err()
	}
	return count <= int64(limit)
}

func allowFallbackLogin(key string, limit int, window time.Duration) bool {
	now := time.Now()
	fallbackLoginLimits.Lock()
	defer fallbackLoginLimits.Unlock()
	for existingKey, existing := range fallbackLoginLimits.entries {
		if !existing.expiresAt.After(now) {
			delete(fallbackLoginLimits.entries, existingKey)
		}
	}
	entry := fallbackLoginLimits.entries[key]
	if entry.expiresAt.Before(now) {
		entry = fallbackLoginWindow{expiresAt: now.Add(window)}
	}
	entry.count++
	fallbackLoginLimits.entries[key] = entry
	return entry.count <= limit
}

func (c *Client) Reset(ctx context.Context, key string) {
	c.Delete(ctx, key)
	fallbackLoginLimits.Lock()
	delete(fallbackLoginLimits.entries, key)
	fallbackLoginLimits.Unlock()
}

func (c *Client) Publish(ctx context.Context, channel string, payload any) {
	if c == nil || c.rdb == nil {
		return
	}
	encoded, err := json.Marshal(payload)
	if err == nil {
		_ = c.rdb.Publish(ctx, channel, encoded).Err()
	}
}

func (c *Client) Enqueue(ctx context.Context, stream string, values map[string]any) {
	if c == nil || c.rdb == nil {
		return
	}
	args := make([]any, 0, len(values)*2)
	for key, value := range values {
		args = append(args, key, value)
	}
	_, _ = c.rdb.XAdd(ctx, &redis.XAddArgs{Stream: stream, Values: args}).Result()
}
