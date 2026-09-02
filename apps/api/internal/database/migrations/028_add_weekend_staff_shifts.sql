INSERT INTO staff_shifts(user_id, branch_id, shift_date, starts_at, ends_at, status)
SELECT users.id, users.branch_id, day::date, '08:00', '17:00', 'scheduled'
FROM users
CROSS JOIN generate_series(date_trunc('month', CURRENT_DATE)::date, (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::date, INTERVAL '1 day') day
WHERE users.role IN ('cashier','branch_manager')
  AND EXTRACT(ISODOW FROM day) IN (6,7)
ON CONFLICT (user_id,shift_date) DO NOTHING;
