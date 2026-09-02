-- แยกเมนูปั่นออกจากหมวดโซดาตามชื่อเมนู
UPDATE menu_items
SET category = 'เมนูปั่น', updated_at = now()
WHERE name ILIKE '%ปั่น%';
