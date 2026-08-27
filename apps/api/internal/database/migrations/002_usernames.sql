ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;

WITH numbered_users AS (
  SELECT id,
    COALESCE(NULLIF(lower(split_part(email, '@', 1)), ''), 'user') AS base_username,
    row_number() OVER (
      PARTITION BY COALESCE(NULLIF(lower(split_part(email, '@', 1)), ''), 'user')
      ORDER BY id
    ) AS position
  FROM users
  WHERE username IS NULL
)
UPDATE users AS u
SET username = CASE
  WHEN n.position = 1 THEN n.base_username
  ELSE n.base_username || '_' || u.id::text
END
FROM numbered_users AS n
WHERE u.id = n.id;

UPDATE users SET username = 'user_' || id::text WHERE username IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower_idx ON users (lower(username));
ALTER TABLE users ALTER COLUMN username SET NOT NULL;
