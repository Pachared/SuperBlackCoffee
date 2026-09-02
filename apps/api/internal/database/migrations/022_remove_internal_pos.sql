-- ถอนระบบ POS ภายในและข้อมูลการขายที่เคยสร้างจากระบบดังกล่าว
DELETE FROM audit_events WHERE entity_type = 'pos_order';
DELETE FROM stock_movements WHERE movement_type = 'pos_sale' OR reference_type = 'pos_order';

DROP TABLE IF EXISTS pos_order_items;
DROP TABLE IF EXISTS pos_orders;

ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS stock_movements_movement_type_check;
ALTER TABLE stock_movements
  ADD CONSTRAINT stock_movements_movement_type_check
  CHECK (movement_type IN ('initial', 'purchase_receipt', 'stock_request_receipt', 'adjustment'));
