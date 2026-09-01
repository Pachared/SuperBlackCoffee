-- เมนูเหล่านี้ในไฟล์มีต้นทุน แต่ไม่ได้กำหนดราคาขาย
-- คืนค่าราคาที่เคยถูกจับคู่กับเมนู “ข้าว…” ที่ชื่อคล้ายกัน และแสดงเป็น - ในระบบ
UPDATE menu_items AS m
SET
  cost_price = v.store_cost_price,
  lineman_cost_price = v.lineman_cost_price,
  store_price = v.previous_store_price,
  lineman_price = v.previous_lineman_price,
  store_price_available = false,
  lineman_price_available = false,
  updated_at = now()
FROM (VALUES
  ('ไข่เจียวหมู ทรงเครื่อง', 31.77, 39.39, 110.00, 160.00),
  ('ไข่เจียวกุ้ง ทรงเครื่อง', 60.52, 69.16, 205.00, 295.00),
  ('ไข่ขยี้คั่วพริกเกลือ หมู', 41.39, 50.04, 140.00, 200.00)
) AS v(name, store_cost_price, lineman_cost_price, previous_store_price, previous_lineman_price)
WHERE m.name = v.name;
