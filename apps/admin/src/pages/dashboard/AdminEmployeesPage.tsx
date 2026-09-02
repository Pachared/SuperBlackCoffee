import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  InputAdornment,
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

export function AdminEmployeesPage() {
  const [query, setQuery] = useState('');
  const { data: employees = [], error, isLoading, refetch } = useEmployees();
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
            ตรวจสอบบัญชี ตำแหน่ง และสิทธิ์เข้าถึงของพนักงานในระบบ
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
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              gap: 1.5,
              mb: 2,
            }}
          >
            {[
              ['บัญชีทั้งหมด', employees.length],
              ['พนักงานสาขา', staffCount],
              [
                'เจ้าของแฟรนไชส์',
                employees.filter(
                  (employee) => employee.role === 'franchise_owner',
                ).length,
              ],
            ].map(([label, value]) => (
              <Card
                key={String(label)}
                variant="outlined"
                sx={{ p: 2, borderRadius: '15px', borderColor: '#e8ddd5' }}
              >
                <Typography color="text.secondary" sx={{ fontSize: 14 }}>
                  {label}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.25,
                    color: '#201914',
                    fontWeight: 700,
                    fontSize: 26,
                  }}
                >
                  {value}
                </Typography>
              </Card>
            ))}
          </Box>
          <Box sx={{ display: 'grid', gap: 1.25 }}>
            {visibleEmployees.map((employee) => (
              <Card
                key={employee.id}
                variant="outlined"
                sx={{ p: 2, borderRadius: '15px', borderColor: '#e8ddd5' }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 1.5,
                    flexWrap: 'wrap',
                  }}
                >
                  <Box>
                    <Typography sx={{ color: '#201914', fontWeight: 600 }}>
                      {employee.name}
                    </Typography>
                    <Typography color="text.secondary" sx={{ fontSize: 14 }}>
                      ชื่อผู้ใช้: {employee.username}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                    <Chip
                      label={roleLabels[employee.role] ?? 'พนักงาน'}
                      size="small"
                      sx={{ bgcolor: '#f5ece5', color: '#60493b' }}
                    />
                    <Typography
                      color="text.secondary"
                      sx={{ mt: 0.75, fontSize: 13 }}
                    >
                      {employee.branchId
                        ? `สาขา #${employee.branchId}`
                        : 'สำนักงานใหญ่'}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            ))}
            {visibleEmployees.length === 0 ? (
              <Card
                variant="outlined"
                sx={{
                  p: 4,
                  borderRadius: '15px',
                  textAlign: 'center',
                  color: 'text.secondary',
                }}
              >
                ไม่พบข้อมูลพนักงาน
              </Card>
            ) : null}
          </Box>
        </>
      ) : null}
    </DashboardMain>
  );
}
