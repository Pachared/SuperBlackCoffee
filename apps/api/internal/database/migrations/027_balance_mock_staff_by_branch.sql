WITH ayutthaya AS (
  SELECT id FROM branches WHERE code = 'SBC-AYA-001'
)
UPDATE users
SET branch_id = (SELECT id FROM ayutthaya)
WHERE username = 'kan_phitsanulok';

WITH ayutthaya AS (
  SELECT id FROM branches WHERE code = 'SBC-AYA-001'
)
UPDATE staff_shifts
SET branch_id = (SELECT id FROM ayutthaya)
WHERE user_id = (SELECT id FROM users WHERE username = 'kan_phitsanulok');
