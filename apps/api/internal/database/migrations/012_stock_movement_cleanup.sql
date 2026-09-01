-- Inventory items can be removed only with their own movement history. This keeps
-- the existing inventory delete behaviour compatible while preserving other audits.
ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS stock_movements_inventory_item_id_fkey;
ALTER TABLE stock_movements
  ADD CONSTRAINT stock_movements_inventory_item_id_fkey
  FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE CASCADE;
