ALTER TABLE users
  ADD COLUMN IF NOT EXISTS default_second_starts_at TIME,
  ADD COLUMN IF NOT EXISTS default_second_ends_at TIME;
