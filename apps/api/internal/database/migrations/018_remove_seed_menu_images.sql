-- ลบเฉพาะรูปตัวอย่าง Unsplash ที่ใส่มากับข้อมูลเริ่มต้น
-- ไม่กระทบ URL รูปที่อัปโหลดหรือกำหนดเองภายหลัง
UPDATE menu_items
SET image_url = '', updated_at = now()
WHERE image_url LIKE 'https://images.unsplash.com/%';
