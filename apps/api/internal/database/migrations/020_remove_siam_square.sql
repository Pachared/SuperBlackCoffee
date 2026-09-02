-- ลบข้อมูลสาขาสยามสแควร์และข้อมูลที่เกี่ยวข้องออกจากระบบ
CREATE TEMP TABLE _siam_square_targets ON COMMIT DROP AS
SELECT id, franchisee_id
FROM branches
WHERE name = 'สยามสแควร์' OR code = 'SBC-BKK-001';

-- ลบบัญชีที่ผูกกับสาขาหรือแฟรนไชส์เป้าหมายก่อน
DELETE FROM users AS u
USING _siam_square_targets AS t
WHERE u.branch_id = t.id OR u.franchisee_id = t.franchisee_id;

-- ตารางลูกที่ใช้ ON DELETE CASCADE จะถูกลบตามสาขาโดยฐานข้อมูล
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
