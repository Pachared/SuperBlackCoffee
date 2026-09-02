import { useMemo, useState } from 'react';
import { Box, Button, Card, Typography } from '@mui/material';
import { DashboardMain } from '@stackbuild/ui';
import { AdminEmployeesSkeleton } from '../../components/skeletons/AdminEmployeesSkeleton';
import { useEmployees } from '../../hooks/useEmployees';

const thaiMonth = new Intl.DateTimeFormat('th-TH', {
  month: 'long',
  year: 'numeric',
});
const thaiWeekday = ['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.'];

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getCalendarDays(month: Date) {
  const firstDay = startOfMonth(month);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const firstVisibleDay = new Date(firstDay);
  firstVisibleDay.setDate(firstDay.getDate() - mondayOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstVisibleDay);
    date.setDate(firstVisibleDay.getDate() + index);
    return date;
  });
}

function isSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

export function AdminEmployeesPage() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const { data: employees = [], error, isLoading, refetch } = useEmployees();
  const calendarDays = useMemo(() => getCalendarDays(month), [month]);
  const staffCount = employees.filter(
    (employee) =>
      employee.role === 'cashier' || employee.role === 'branch_manager',
  ).length;
  const today = new Date();

  const changeMonth = (offset: number) => {
    setMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  };

  return (
    <DashboardMain>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
          alignItems: { xs: 'flex-start', md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          mb: 2.5,
        }}
      >
        <Box>
          <Typography
            sx={{
              color: '#201914',
              fontFamily: 'Kanit, sans-serif',
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            ตารางงานพนักงาน
          </Typography>
          <Typography
            sx={{
              color: 'text.secondary',
              fontFamily: 'Kanit, sans-serif',
              fontSize: 14,
            }}
          >
            ดูและวางแผนตารางกะของพนักงานในรูปแบบปฏิทิน
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => changeMonth(-1)}
          >
            เดือนก่อน
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setMonth(startOfMonth(new Date()))}
          >
            เดือนนี้
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => changeMonth(1)}
          >
            เดือนถัดไป
          </Button>
        </Box>
      </Box>

      {isLoading ? <AdminEmployeesSkeleton /> : null}
      {error ? (
        <Card
          variant="outlined"
          sx={{ p: 2, borderColor: '#edc7c3', color: '#a22e2a' }}
        >
          {error.message}{' '}
          <Button size="small" onClick={() => refetch()}>
            ลองใหม่
          </Button>
        </Card>
      ) : null}
      {!isLoading && !error ? (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 1.5,
              mb: 2,
            }}
          >
            <Card
              variant="outlined"
              sx={{ p: 2, borderRadius: '15px', borderColor: '#e8ddd5' }}
            >
              <Typography color="text.secondary" sx={{ fontSize: 14 }}>
                พนักงานทั้งหมด
              </Typography>
              <Typography
                sx={{
                  mt: 0.25,
                  color: '#201914',
                  fontWeight: 700,
                  fontSize: 26,
                }}
              >
                {employees.length}
              </Typography>
            </Card>
            <Card
              variant="outlined"
              sx={{ p: 2, borderRadius: '15px', borderColor: '#e8ddd5' }}
            >
              <Typography color="text.secondary" sx={{ fontSize: 14 }}>
                พนักงานประจำสาขา
              </Typography>
              <Typography
                sx={{
                  mt: 0.25,
                  color: '#201914',
                  fontWeight: 700,
                  fontSize: 26,
                }}
              >
                {staffCount}
              </Typography>
            </Card>
          </Box>

          <Card
            variant="outlined"
            sx={{
              borderRadius: '16px',
              borderColor: '#e8ddd5',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.75,
                borderBottom: '1px solid #eee4dd',
                bgcolor: '#fbf7f4',
              }}
            >
              <Typography
                sx={{ color: '#201914', fontSize: 19, fontWeight: 700 }}
              >
                {thaiMonth.format(month)}
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                ตารางกะจะปรากฏที่วันที่ได้รับการกำหนดแล้ว
              </Typography>
            </Box>
            <Box sx={{ overflowX: 'auto' }}>
              <Box sx={{ minWidth: 780 }}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                    borderBottom: '1px solid #eee4dd',
                  }}
                >
                  {thaiWeekday.map((day, index) => (
                    <Box
                      key={day}
                      sx={{
                        py: 1,
                        textAlign: 'center',
                        color: index > 4 ? '#9a6d5c' : '#60493b',
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {day}
                    </Box>
                  ))}
                </Box>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                  }}
                >
                  {calendarDays.map((day) => {
                    const isCurrentMonth = day.getMonth() === month.getMonth();
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                    const isToday = isSameDay(day, today);
                    return (
                      <Box
                        key={day.toISOString()}
                        sx={{
                          minHeight: 122,
                          p: 1.25,
                          borderRight: '1px solid #eee4dd',
                          borderBottom: '1px solid #eee4dd',
                          bgcolor: isCurrentMonth ? '#fff' : '#fbf8f6',
                          opacity: isCurrentMonth ? 1 : 0.5,
                          '&:nth-of-type(7n)': { borderRight: 0 },
                        }}
                      >
                        <Box
                          sx={{
                            width: 26,
                            height: 26,
                            display: 'grid',
                            placeItems: 'center',
                            borderRadius: '50%',
                            bgcolor: isToday ? '#3c2d24' : 'transparent',
                            color: isToday
                              ? '#fff'
                              : isWeekend
                                ? '#9a6d5c'
                                : '#45342b',
                            fontSize: 13,
                            fontWeight: 700,
                          }}
                        >
                          {day.getDate()}
                        </Box>
                        {isCurrentMonth ? (
                          <Typography
                            sx={{
                              mt: 2.5,
                              color: isWeekend ? '#aa9589' : '#a89285',
                              fontSize: 11,
                              lineHeight: 1.35,
                            }}
                          >
                            {isWeekend ? 'วันหยุด' : 'ยังไม่มีตารางกะ'}
                          </Typography>
                        ) : null}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Box>
          </Card>
        </>
      ) : null}
    </DashboardMain>
  );
}
