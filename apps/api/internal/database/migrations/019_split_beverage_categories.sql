-- แยกหมวดเครื่องดื่มตามเอกสารต้นทุนเครื่องดื่ม
-- จำกัดการปรับเฉพาะเมนูเดิมที่เป็นหมวดเครื่องดื่ม ไม่กระทบหมวดอาหาร
UPDATE menu_items
SET category = 'เมนูอโวคาโด', updated_at = now()
WHERE category IN ('กาแฟ', 'ชาและมัทฉะ', 'เครื่องดื่ม')
  AND name ILIKE '%อโวคาโด%';

UPDATE menu_items
SET category = 'โซดา', updated_at = now()
WHERE category IN ('กาแฟ', 'ชาและมัทฉะ', 'เครื่องดื่ม')
  AND (
    name ILIKE '%โซดา%'
    OR name ILIKE '%ปั่น%'
    OR name IN ('บลูเบอร์รี่น้ำผึ้งมะนาว', 'เลม่อนผสมน้ำผึ้ง')
  );

UPDATE menu_items
SET category = 'เมนูชาร้อน', updated_at = now()
WHERE category IN ('กาแฟ', 'ชาและมัทฉะ', 'เครื่องดื่ม')
  AND name ILIKE '%ร้อน%'
  AND (
    name ILIKE '%ชา%'
    OR name ILIKE '%มัทฉะ%'
    OR name ILIKE '%มัฉฉะ%'
    OR name ILIKE '%โกโก้%'
    OR name ILIKE '%นมสด%'
  );

UPDATE menu_items
SET category = 'เมนูร้อน', updated_at = now()
WHERE category IN ('กาแฟ', 'ชาและมัทฉะ', 'เครื่องดื่ม')
  AND name ILIKE '%ร้อน%';

UPDATE menu_items
SET category = 'เมนูกาแฟเย็น', updated_at = now()
WHERE category IN ('กาแฟ', 'ชาและมัทฉะ', 'เครื่องดื่ม')
  AND name NOT ILIKE '%cocoa%'
  AND name NOT ILIKE '%โกโก้%'
  AND (
    name ILIKE '%กาแฟ%'
    OR name ILIKE '%อเมริกาโน่%'
    OR name ILIKE '%เอสเปรสโซ่%'
    OR name ILIKE '%คาปูชิโน่%'
    OR name ILIKE '%คาราเมลมัคคีอาโต้%'
    OR name ILIKE '%ลาเต้%'
    OR name ILIKE '%มอคค่า%'
    OR name ILIKE '%แอโร%กาโน%'
    OR name ILIKE '%ซุปเปอร์แบล็ค%'
    OR name ILIKE '%ซุปเปอร์เเบล็ค%'
    OR name ILIKE '%super black%'
  );

UPDATE menu_items
SET category = 'เมนูชา', updated_at = now()
WHERE category IN ('กาแฟ', 'ชาและมัทฉะ', 'เครื่องดื่ม')
  AND (
    name ILIKE '%ชา%'
    OR name ILIKE '%มัทฉะ%'
    OR name ILIKE '%มัฉฉะ%'
    OR name ILIKE '%โกโก้%'
    OR name ILIKE '%ช็อกโก%'
    OR name ILIKE '%ช็อกกาแลต%'
    OR name ILIKE '%cocoa%'
    OR name ILIKE '%นมสด%'
    OR name ILIKE '%นมชมพู%'
  );
