CREATE TABLE IF NOT EXISTS menu_items (
  id BIGSERIAL PRIMARY KEY,
  branch_id BIGINT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  store_price NUMERIC(12,2) NOT NULL CHECK (store_price >= 0),
  lineman_price NUMERIC(12,2) NOT NULL CHECK (lineman_price >= 0),
  cost_price NUMERIC(12,2) NOT NULL CHECK (cost_price >= 0),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','soldout')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (branch_id, name)
);
