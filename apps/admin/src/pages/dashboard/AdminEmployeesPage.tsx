import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DashboardMain } from '@stackbuild/ui';
import {
  generateStaffSchedules,
  listBranches,
  listStaffSchedules,
  updateStaffShift,
  type StaffShift,
} from '../../api';
import { AdminEmployeesSkeleton } from '../../components/skeletons/AdminEmployeesSkeleton';
import { useEmployees } from '../../hooks/useEmployees';

const thaiMonth = new Intl.DateTimeFormat('th-TH', {
  month: 'long',
  year: 'numeric',
});
const thaiWeekday = ['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.'];

const shiftColors = ['#e8f0ff', '#efe5ff', '#e1f5ea', '#fff0d7', '#ffe3e3'];
const leaveLabels: Record<StaffShift['status'], string> = {
  scheduled: 'ทำงานตามกะ',
  day_off: 'วันหยุด',
  leave: 'ลางาน',
  sick_leave: 'ลาป่วย',
  personal_leave: 'ลาอื่น ๆ',
};

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

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function AdminEmployeesPage() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [selectedShift, setSelectedShift] = useState<StaffShift | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editBranchId, setEditBranchId] = useState('');
  const [editStatus, setEditStatus] =
    useState<StaffShift['status']>('scheduled');
  const { data: employees = [], error, isLoading, refetch } = useEmployees();
  const calendarDays = useMemo(() => getCalendarDays(month), [month]);
  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
  const queryClient = useQueryClient();
  const schedules = useQuery({
    queryKey: ['staff-schedules', monthKey],
    queryFn: () => listStaffSchedules(monthKey),
  });
  const branches = useQuery({ queryKey: ['branches'], queryFn: listBranches });
  const generate = useMutation({
    mutationFn: () => generateStaffSchedules(monthKey),
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: ['staff-schedules', monthKey],
      }),
  });
  const updateShift = useMutation({
    mutationFn: () =>
      updateStaffShift(selectedShift!.id, {
        shiftDate: editDate,
        branchId: Number(editBranchId),
        status: editStatus,
        leaveType: editStatus === 'scheduled' ? '' : leaveLabels[editStatus],
      }),
    onSuccess: () => {
      setSelectedShift(null);
      void queryClient.invalidateQueries({
        queryKey: ['staff-schedules', monthKey],
      });
    },
  });
  const activeBranchId = selectedBranchId ?? branches.data?.[0]?.id ?? null;
  const activeBranch = branches.data?.find(
    (branch) => branch.id === activeBranchId,
  );
  const shiftsByDate = useMemo(() => {
    const result = new Map<string, NonNullable<typeof schedules.data>>();
    for (const shift of schedules.data ?? []) {
      if (shift.branchId !== activeBranchId) continue;
      result.set(shift.date, [...(result.get(shift.date) ?? []), shift]);
    }
    return result;
  }, [activeBranchId, schedules.data]);
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

  const openShiftEditor = (shift: StaffShift) => {
    setSelectedShift(shift);
    setEditDate(shift.date);
    setEditBranchId(String(shift.branchId));
    setEditStatus(shift.status);
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
          <Button
            variant="contained"
            size="small"
            onClick={() => generate.mutate()}
            disabled={generate.isPending}
          >
            {generate.isPending ? 'กำลังจัดตาราง...' : 'จัดตารางอัตโนมัติ'}
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
      {schedules.error ? (
        <Card
          variant="outlined"
          sx={{ mb: 2, p: 2, borderColor: '#edc7c3', color: '#a22e2a' }}
        >
          {schedules.error.message}{' '}
          <Button size="small" onClick={() => void schedules.refetch()}>
            ลองโหลดตารางอีกครั้ง
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

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexWrap: 'wrap',
              mb: 2,
            }}
          >
            <Typography color="text.secondary" sx={{ fontSize: 14, mr: 0.5 }}>
              แสดงตารางของสาขา
            </Typography>
            {(branches.data ?? []).map((branch) => (
              <Button
                key={branch.id}
                size="small"
                variant={
                  activeBranchId === branch.id ? 'contained' : 'outlined'
                }
                onClick={() => setSelectedBranchId(branch.id)}
              >
                {branch.name}
              </Button>
            ))}
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
                {activeBranch?.name ?? 'ยังไม่พบสาขา'} ·{' '}
                {thaiMonth.format(month)}
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                ระบบจัดกะวันจันทร์–ศุกร์ 08:00–17:00
                ให้ผู้จัดการสาขาและแคชเชียร์
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
                    const isToday = isSameDay(day, today);
                    const shifts = shiftsByDate.get(dateKey(day)) ?? [];
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
                            color: isToday ? '#fff' : '#45342b',
                            fontSize: 13,
                            fontWeight: 700,
                          }}
                        >
                          {day.getDate()}
                        </Box>
                        {isCurrentMonth && shifts.length === 0 ? (
                          <Typography
                            sx={{
                              mt: 2.5,
                              color: '#a89285',
                              fontSize: 11,
                              lineHeight: 1.35,
                            }}
                          >
                            ยังไม่มีตารางกะ
                          </Typography>
                        ) : null}
                        {shifts.slice(0, 2).map((shift) => (
                          <Box
                            key={shift.id}
                            component="button"
                            type="button"
                            onClick={() => openShiftEditor(shift)}
                            sx={{
                              width: '100%',
                              border: 0,
                              cursor: 'pointer',
                              textAlign: 'left',
                              mt: 0.75,
                              px: 0.65,
                              py: 0.35,
                              borderRadius: 1,
                              bgcolor:
                                shift.status === 'scheduled'
                                  ? shiftColors[
                                      shift.userId % shiftColors.length
                                    ]
                                  : '#ffe4e4',
                              color: '#60493b',
                              fontSize: 10,
                              lineHeight: 1.25,
                            }}
                          >
                            {shift.name}
                            <br />
                            {shift.status === 'scheduled'
                              ? `${shift.startsAt}–${shift.endsAt}`
                              : leaveLabels[shift.status]}
                          </Box>
                        ))}
                        {shifts.length > 2 ? (
                          <Typography
                            sx={{ mt: 0.5, color: '#805637', fontSize: 10 }}
                          >
                            +{shifts.length - 2} คน
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
      <Dialog
        open={Boolean(selectedShift)}
        onClose={() => setSelectedShift(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>จัดการกะงาน {selectedShift?.name}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: '16px !important' }}>
          <TextField
            label="ย้ายไปวันที่"
            type="date"
            value={editDate}
            onChange={(event) => setEditDate(event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <FormControl>
            <InputLabel id="schedule-branch-label">สาขา</InputLabel>
            <Select
              labelId="schedule-branch-label"
              label="สาขา"
              value={editBranchId}
              onChange={(event) => setEditBranchId(event.target.value)}
            >
              {(branches.data ?? []).map((branch) => (
                <MenuItem key={branch.id} value={String(branch.id)}>
                  {branch.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel id="schedule-status-label">สถานะ</InputLabel>
            <Select
              labelId="schedule-status-label"
              label="สถานะ"
              value={editStatus}
              onChange={(event) =>
                setEditStatus(event.target.value as StaffShift['status'])
              }
            >
              {(Object.keys(leaveLabels) as StaffShift['status'][]).map(
                (status) => (
                  <MenuItem key={status} value={status}>
                    {leaveLabels[status]}
                  </MenuItem>
                ),
              )}
            </Select>
          </FormControl>
          {updateShift.error ? (
            <Typography color="error" sx={{ fontSize: 13 }}>
              {updateShift.error.message}
            </Typography>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedShift(null)}>ยกเลิก</Button>
          <Button
            variant="contained"
            onClick={() => updateShift.mutate()}
            disabled={updateShift.isPending}
          >
            {updateShift.isPending ? 'กำลังบันทึก...' : 'บันทึกกะงาน'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardMain>
  );
}
