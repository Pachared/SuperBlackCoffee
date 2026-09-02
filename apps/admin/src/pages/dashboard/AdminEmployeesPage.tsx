import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { DashboardMain, SearchIcon } from '@stackbuild/ui';
import { AdminEmployeesSkeleton } from '../../components/skeletons/AdminEmployeesSkeleton';
import { useEmployees } from '../../hooks/useEmployees';

const roleLabels = {
  admin: 'ผู้ดูแลระบบ',
  franchise_owner: 'เจ้าของแฟรนไชส์',
  branch_manager: 'ผู้จัดการสาขา',
  cashier: 'พนักงานแคชเชียร์',
} as const;

const thaiWeekday = new Intl.DateTimeFormat('th-TH', { weekday: 'short' });
const thaiDate = new Intl.DateTimeFormat('th-TH', {
  day: 'numeric',
  month: 'short',
});
const thaiWeekRange = new Intl.DateTimeFormat('th-TH', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

function getWeekStart(date: Date) {
  const start = new Date(date);
  const offset = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - offset);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getWeekDays(weekStart: Date) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return date;
  });
}

export function AdminEmployeesPage() {
  const [query, setQuery] = useState('');
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const { data: employees = [], error, isLoading, refetch } = useEmployees();
  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const visibleEmployees = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase('th-TH');
    if (!keyword) return employees;
    return employees.filter((employee) =>
      `${employee.name} ${employee.username} ${employee.role}`
        .toLocaleLowerCase('th-TH')
        .includes(keyword),
    );
  }, [employees, query]);
  const staffCount = employees.filter(
    (employee) =>
      employee.role === 'cashier' || employee.role === 'branch_manager',
  ).length;

  return (
    <DashboardMain>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
          alignItems: { xs: 'stretch', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
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
            ระบบพนักงาน
          </Typography>
          <Typography
            sx={{
              color: 'text.secondary',
              fontFamily: 'Kanit, sans-serif',
              fontSize: 14,
            }}
          >
            ตารางกะทำงานรายสัปดาห์ของพนักงานในระบบ
          </Typography>
        </Box>
        <TextField
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="ค้นหาชื่อหรือชื่อผู้ใช้"
          size="small"
          sx={{
            width: { xs: '100%', sm: 300 },
            '& .MuiOutlinedInput-root': { borderRadius: '12px' },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon size={18} />
                </InputAdornment>
              ),
            },
          }}
        />
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
                p: 2,
                display: 'flex',
                gap: 1,
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                flexDirection: { xs: 'column', sm: 'row' },
                borderBottom: '1px solid #eee4dd',
              }}
            >
              <Box>
                <Typography
                  sx={{ color: '#201914', fontWeight: 700, fontSize: 18 }}
                >
                  ตารางงานประจำสัปดาห์
                </Typography>
                <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                  {thaiWeekRange.format(weekDays[0])} –{' '}
                  {thaiWeekRange.format(weekDays[6])}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.75 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() =>
                    setWeekStart(
                      (current) =>
                        new Date(
                          current.getFullYear(),
                          current.getMonth(),
                          current.getDate() - 7,
                        ),
                    )
                  }
                >
                  สัปดาห์ก่อน
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setWeekStart(getWeekStart(new Date()))}
                >
                  สัปดาห์นี้
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() =>
                    setWeekStart(
                      (current) =>
                        new Date(
                          current.getFullYear(),
                          current.getMonth(),
                          current.getDate() + 7,
                        ),
                    )
                  }
                >
                  สัปดาห์ถัดไป
                </Button>
              </Box>
            </Box>
            <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
              <Table sx={{ minWidth: 980 }} aria-label="ตารางงานพนักงาน">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#fbf7f4' }}>
                    <TableCell
                      sx={{ minWidth: 220, fontWeight: 700, color: '#45342b' }}
                    >
                      พนักงาน
                    </TableCell>
                    {weekDays.map((day) => (
                      <TableCell
                        key={day.toISOString()}
                        align="center"
                        sx={{
                          minWidth: 105,
                          fontWeight: 700,
                          color: '#45342b',
                        }}
                      >
                        <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                          {thaiWeekday.format(day)}
                        </Typography>
                        <Typography
                          color="text.secondary"
                          sx={{ fontSize: 12 }}
                        >
                          {thaiDate.format(day)}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleEmployees.map((employee) => (
                    <TableRow key={employee.id} hover>
                      <TableCell>
                        <Typography sx={{ color: '#201914', fontWeight: 600 }}>
                          {employee.name}
                        </Typography>
                        <Box
                          sx={{
                            mt: 0.55,
                            display: 'flex',
                            gap: 0.5,
                            alignItems: 'center',
                            flexWrap: 'wrap',
                          }}
                        >
                          <Chip
                            label={roleLabels[employee.role] ?? 'พนักงาน'}
                            size="small"
                            sx={{
                              height: 22,
                              bgcolor: '#f5ece5',
                              color: '#60493b',
                            }}
                          />
                          <Typography
                            color="text.secondary"
                            sx={{ fontSize: 12 }}
                          >
                            {employee.branchId
                              ? `สาขา #${employee.branchId}`
                              : 'สำนักงานใหญ่'}
                          </Typography>
                        </Box>
                      </TableCell>
                      {weekDays.map((day) => (
                        <TableCell key={day.toISOString()} align="center">
                          <Typography
                            color="text.secondary"
                            sx={{ fontSize: 12 }}
                          >
                            ยังไม่ได้จัดกะ
                          </Typography>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  {visibleEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        align="center"
                        sx={{ py: 5, color: 'text.secondary' }}
                      >
                        ไม่พบข้อมูลพนักงาน
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </>
      ) : null}
    </DashboardMain>
  );
}
