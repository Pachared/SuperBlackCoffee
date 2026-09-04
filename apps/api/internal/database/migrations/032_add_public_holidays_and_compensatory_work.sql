CREATE TABLE IF NOT EXISTS public_holidays (
  holiday_date DATE PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public_holidays (holiday_date, name) VALUES
  ('2026-01-01', 'วันขึ้นปีใหม่'),
  ('2026-03-03', 'วันมาฆบูชา'),
  ('2026-04-06', 'วันจักรี'),
  ('2026-04-13', 'วันสงกรานต์'),
  ('2026-04-14', 'วันสงกรานต์'),
  ('2026-04-15', 'วันสงกรานต์'),
  ('2026-05-01', 'วันแรงงานแห่งชาติ'),
  ('2026-05-04', 'วันฉัตรมงคล'),
  ('2026-06-01', 'วันหยุดชดเชยวันวิสาขบูชา'),
  ('2026-06-03', 'วันเฉลิมพระชนมพรรษาพระราชินี'),
  ('2026-07-28', 'วันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระเจ้าอยู่หัว'),
  ('2026-07-29', 'วันอาสาฬหบูชา'),
  ('2026-07-30', 'วันเข้าพรรษา'),
  ('2026-08-12', 'วันเฉลิมพระชนมพรรษาพระบรมราชชนนีพันปีหลวง'),
  ('2026-10-13', 'วันนวมินทรมหาราช'),
  ('2026-10-23', 'วันปิยมหาราช'),
  ('2026-12-07', 'วันหยุดชดเชยวันคล้ายวันพระบรมราชสมภพ รัชกาลที่ 9'),
  ('2026-12-10', 'วันรัฐธรรมนูญ'),
  ('2026-12-31', 'วันสิ้นปี')
ON CONFLICT (holiday_date) DO NOTHING;

ALTER TABLE staff_shifts DROP CONSTRAINT IF EXISTS staff_shifts_status_check;
ALTER TABLE staff_shifts ADD CONSTRAINT staff_shifts_status_check CHECK (status IN ('scheduled', 'compensatory_work', 'day_off', 'leave', 'sick_leave', 'personal_leave'));

UPDATE staff_shifts s
SET status = 'day_off', leave_type = h.name
FROM public_holidays h
WHERE s.shift_date = h.holiday_date AND s.status = 'scheduled';
