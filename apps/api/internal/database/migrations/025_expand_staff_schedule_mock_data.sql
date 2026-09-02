UPDATE users
SET name = CASE username
  WHEN 'manager_ayutthaya' THEN 'ชลธิชา วัฒนากุล'
  WHEN 'manager_phitsanulok' THEN 'ธนภพ ศรีสวัสดิ์'
  ELSE name
END
WHERE username IN ('manager_ayutthaya','manager_phitsanulok');

INSERT INTO branches(name, code, status)
VALUES ('ลาดกระบัง', 'SBC-LKB-001', 'active')
ON CONFLICT (code) DO NOTHING;

WITH mock_staff(name, username, email) AS (
  VALUES
    ('มินตรา พูนผล', 'min_ladkrabang', 'min.ladkrabang@superblackcoffee.local'),
    ('ปุณณภา จันทร์ดี', 'pun_ladkrabang', 'pun.ladkrabang@superblackcoffee.local'),
    ('ธีรภัทร คำมี', 'tee_ladkrabang', 'tee.ladkrabang@superblackcoffee.local'),
    ('สุภาวดี รัตนะ', 'sup_ladkrabang', 'sup.ladkrabang@superblackcoffee.local')
)
INSERT INTO users(name, username, email, password_hash, role, branch_id)
SELECT mock_staff.name, mock_staff.username, mock_staff.email, admin.password_hash, 'cashier', branch.id
FROM mock_staff
JOIN branches branch ON branch.code = 'SBC-LKB-001'
CROSS JOIN (SELECT password_hash FROM users WHERE username = 'admin' LIMIT 1) admin
ON CONFLICT (lower(username)) DO NOTHING;

INSERT INTO staff_shifts(user_id, branch_id, shift_date, starts_at, ends_at, status)
SELECT users.id, users.branch_id, day::date, '08:00', '17:00', 'scheduled'
FROM users
CROSS JOIN generate_series(date_trunc('month', CURRENT_DATE)::date, (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::date, INTERVAL '1 day') day
WHERE users.username IN ('min_ladkrabang','pun_ladkrabang','tee_ladkrabang','sup_ladkrabang')
  AND EXTRACT(ISODOW FROM day) BETWEEN 1 AND 5
ON CONFLICT (user_id, shift_date) DO NOTHING;

UPDATE staff_shifts
SET status = 'sick_leave', leave_type = 'ลาป่วย'
WHERE id = (
  SELECT staff_shifts.id
  FROM staff_shifts
  JOIN users ON users.id = staff_shifts.user_id
  WHERE users.username = 'pim_ayutthaya'
    AND staff_shifts.shift_date = CURRENT_DATE
  LIMIT 1
);
