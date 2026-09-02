ALTER TABLE staff_shifts ADD COLUMN IF NOT EXISTS leave_type TEXT;
ALTER TABLE staff_shifts DROP CONSTRAINT IF EXISTS staff_shifts_status_check;
ALTER TABLE staff_shifts ADD CONSTRAINT staff_shifts_status_check CHECK (status IN ('scheduled','day_off','leave','sick_leave','personal_leave'));

WITH mock_staff(name, username, email, branch_code) AS (
  VALUES
    ('อรทัย ศรีสุข', 'aor_ayutthaya', 'aor.ayutthaya@superblackcoffee.local', 'SBC-AYA-001'),
    ('พิมพ์ชนก แสงทอง', 'pim_ayutthaya', 'pim.ayutthaya@superblackcoffee.local', 'SBC-AYA-001'),
    ('ณัฐวุฒิ ใจดี', 'nat_phitsanulok', 'nat.phitsanulok@superblackcoffee.local', 'SBC-PLK-001'),
    ('กัญญารัตน์ บุญมี', 'kan_phitsanulok', 'kan.phitsanulok@superblackcoffee.local', 'SBC-PLK-001')
)
INSERT INTO users(name, username, email, password_hash, role, branch_id)
SELECT mock_staff.name, mock_staff.username, mock_staff.email, admin.password_hash, 'cashier', branches.id
FROM mock_staff
JOIN branches ON branches.code = mock_staff.branch_code
CROSS JOIN (SELECT password_hash FROM users WHERE username = 'admin' LIMIT 1) admin
ON CONFLICT (lower(username)) DO NOTHING;

INSERT INTO staff_shifts(user_id, branch_id, shift_date, starts_at, ends_at, status)
SELECT users.id, users.branch_id, day::date, '08:00', '17:00', 'scheduled'
FROM users
CROSS JOIN generate_series(date_trunc('month', CURRENT_DATE)::date, (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::date, INTERVAL '1 day') day
WHERE users.username IN ('aor_ayutthaya','pim_ayutthaya','nat_phitsanulok','kan_phitsanulok')
  AND EXTRACT(ISODOW FROM day) BETWEEN 1 AND 5
ON CONFLICT (user_id, shift_date) DO NOTHING;
