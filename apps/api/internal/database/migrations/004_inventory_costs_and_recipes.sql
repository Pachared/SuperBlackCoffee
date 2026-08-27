ALTER TABLE inventory_items
  ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'ingredient' CHECK (kind IN ('ingredient', 'stock')),
  ADD COLUMN IF NOT EXISTS unit_cost NUMERIC(12,4) NOT NULL DEFAULT 0 CHECK (unit_cost >= 0);

CREATE TABLE IF NOT EXISTS menu_item_ingredients (
  menu_item_id BIGINT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  inventory_item_id BIGINT NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
  quantity NUMERIC(12,4) NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL,
  cost_amount NUMERIC(12,2) NOT NULL CHECK (cost_amount >= 0),
  PRIMARY KEY (menu_item_id, inventory_item_id)
);

CREATE INDEX IF NOT EXISTS inventory_items_branch_kind_idx ON inventory_items (branch_id, kind, name);
CREATE UNIQUE INDEX IF NOT EXISTS inventory_items_branch_name_key ON inventory_items (branch_id, name);
CREATE INDEX IF NOT EXISTS menu_item_ingredients_inventory_idx ON menu_item_ingredients (inventory_item_id);
