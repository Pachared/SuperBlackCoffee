CREATE TABLE IF NOT EXISTS staff_shifts (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  branch_id BIGINT REFERENCES branches(id) ON DELETE SET NULL,
  shift_date DATE NOT NULL,
  starts_at TIME NOT NULL DEFAULT '08:00',
  ends_at TIME NOT NULL DEFAULT '17:00',
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'day_off', 'leave')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, shift_date)
);
CREATE INDEX IF NOT EXISTS staff_shifts_date_branch_idx ON staff_shifts (shift_date, branch_id);
