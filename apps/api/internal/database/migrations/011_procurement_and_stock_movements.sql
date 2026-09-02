CREATE TABLE IF NOT EXISTS suppliers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  contact_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id BIGSERIAL PRIMARY KEY,
  branch_id BIGINT NOT NULL REFERENCES branches(id),
  supplier_id BIGINT NOT NULL REFERENCES suppliers(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'ordered', 'partially_received', 'received', 'cancelled')),
  note TEXT NOT NULL DEFAULT '',
  ordered_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  approved_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  ordered_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
  id BIGSERIAL PRIMARY KEY,
  purchase_order_id BIGINT NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  inventory_item_id BIGINT NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
  item_name TEXT NOT NULL,
  quantity_ordered NUMERIC(12,4) NOT NULL CHECK (quantity_ordered > 0),
  quantity_received NUMERIC(12,4) NOT NULL DEFAULT 0 CHECK (quantity_received >= 0),
  unit TEXT NOT NULL,
  unit_cost NUMERIC(12,4) NOT NULL CHECK (unit_cost >= 0)
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id BIGSERIAL PRIMARY KEY,
  branch_id BIGINT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  inventory_item_id BIGINT NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('initial', 'purchase_receipt', 'stock_request_receipt', 'pos_sale', 'adjustment')),
  quantity_delta NUMERIC(12,4) NOT NULL CHECK (quantity_delta <> 0),
  quantity_before NUMERIC(12,4) NOT NULL,
  quantity_after NUMERIC(12,4) NOT NULL,
  reference_type TEXT NOT NULL DEFAULT '',
  reference_id BIGINT,
  note TEXT NOT NULL DEFAULT '',
  actor_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS purchase_orders_branch_status_created_idx ON purchase_orders(branch_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS purchase_orders_supplier_created_idx ON purchase_orders(supplier_id, created_at DESC);
CREATE INDEX IF NOT EXISTS stock_movements_item_created_idx ON stock_movements(inventory_item_id, created_at DESC);
CREATE INDEX IF NOT EXISTS stock_movements_branch_created_idx ON stock_movements(branch_id, created_at DESC);
