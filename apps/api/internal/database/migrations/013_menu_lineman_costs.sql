ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS lineman_cost_price NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (lineman_cost_price >= 0);

UPDATE menu_items
SET lineman_cost_price = cost_price
WHERE lineman_cost_price = 0;
