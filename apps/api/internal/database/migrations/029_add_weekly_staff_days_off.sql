UPDATE staff_shifts
SET status = 'day_off', leave_type = 'วันหยุดประจำสัปดาห์'
WHERE status = 'scheduled'
  AND shift_date >= date_trunc('month', CURRENT_DATE)::date
  AND shift_date < (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month')::date
  AND EXTRACT(ISODOW FROM shift_date) = ((user_id % 7) + 1);
