-- ลบข้อมูลสาขาสยามสแควร์และข้อมูลที่เกี่ยวข้องออกจากระบบ
CREATE TEMP TABLE _siam_square_targets ON COMMIT DROP AS
SELECT id, franchisee_id
FROM branches
WHERE name = 'สยามสแควร์' OR code = 'SBC-BKK-001';

-- ลบบัญชีที่ผูกกับสาขาหรือแฟรนไชส์เป้าหมายก่อน
DELETE FROM users AS u
USING _siam_square_targets AS t
WHERE u.branch_id = t.id OR u.franchisee_id = t.franchisee_id;

-- ลบตารางลูกที่อ้างอิงสาขาแบบ RESTRICT ก่อนลบสาขา
DELETE FROM pos_order_items AS i
USING pos_orders AS o, _siam_square_targets AS t
WHERE i.order_id = o.id AND o.branch_id = t.id;

DELETE FROM pos_orders AS o
USING _siam_square_targets AS t
WHERE o.branch_id = t.id;

DELETE FROM stock_request_items AS i
USING stock_requests AS r, _siam_square_targets AS t
WHERE i.stock_request_id = r.id AND r.branch_id = t.id;

DELETE FROM stock_requests AS r
USING _siam_square_targets AS t
WHERE r.branch_id = t.id;

DELETE FROM purchase_order_items AS i
USING purchase_orders AS o, _siam_square_targets AS t
WHERE i.purchase_order_id = o.id AND o.branch_id = t.id;

DELETE FROM purchase_orders AS o
USING _siam_square_targets AS t
WHERE o.branch_id = t.id;

DELETE FROM stock_movements AS m
USING _siam_square_targets AS t
WHERE m.branch_id = t.id;

DELETE FROM menu_item_ingredients AS i
USING menu_items AS m, _siam_square_targets AS t
WHERE i.menu_item_id = m.id AND m.branch_id = t.id;

DELETE FROM menu_items AS m
USING _siam_square_targets AS t
WHERE m.branch_id = t.id;

DELETE FROM inventory_items AS i
USING _siam_square_targets AS t
WHERE i.branch_id = t.id;

DELETE FROM branches AS b
USING _siam_square_targets AS t
WHERE b.id = t.id;

-- ลบแฟรนไชส์ที่ไม่เหลือสาขาใดผูกอยู่แล้ว
DELETE FROM franchisees AS f
USING _siam_square_targets AS t
WHERE f.id = t.franchisee_id
  AND NOT EXISTS (
    SELECT 1 FROM branches AS b WHERE b.franchisee_id = f.id
  );
