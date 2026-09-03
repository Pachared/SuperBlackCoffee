import { type MouseEvent, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Divider,
  Drawer,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ClockIcon, DashboardMain, XIcon } from '@stackbuild/ui';
import {
  generateStaffSchedules,
  listStaffSchedules,
  replaceStaffShift,
  updateStaffShift,
  type StaffShift,
} from '../api/staff-schedules';
import {
  createEmployee,
  deleteEmployee,
  listEmployees,
  updateEmployee,
} from '../api/users';
import { listBranches } from '../api/branches';
import { EmployeesSkeleton } from '../components/skeletons/EmployeesSkeleton';

const thaiMonth = new Intl.DateTimeFormat('th-TH', {
  month: 'long',
  year: 'numeric',
});
const thaiWeekday = [
  'วันจันทร์',
  'วันอังคาร',
  'วันพุธ',
  'วันพฤหัสบดี',
  'วันศุกร์',
  'วันเสาร์',
  'วันอาทิตย์',
];

const shiftColors = [
  '#dceeff',
  '#eee1ff',
  '#dff4e7',
  '#fff0cd',
  '#ffe0e8',
  '#dff1f1',
];
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
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  const rowCount = Math.ceil((mondayOffset + daysInMonth) / 7);
  const firstVisibleDay = new Date(firstDay);
  firstVisibleDay.setDate(firstDay.getDate() - mondayOffset);
  return Array.from({ length: rowCount * 7 }, (_, index) => {
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

export function EmployeesManagementPage({
  franchiseMode = false,
}: {
  franchiseMode?: boolean;
} = {}) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [selectedShift, setSelectedShift] = useState<StaffShift | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editBranchId, setEditBranchId] = useState('');
  const [editStatus, setEditStatus] =
    useState<StaffShift['status']>('scheduled');
  const [draggedShiftId, setDraggedShiftId] = useState<number | null>(null);
  const [isEmployeeDrawerOpen, setIsEmployeeDrawerOpen] = useState(false);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeRole, setNewEmployeeRole] = useState<
    'branch_manager' | 'cashier'
  >('cashier');
  const [newEmployeeBranchId, setNewEmployeeBranchId] = useState('');
  const [defaultStartsAt, setDefaultStartsAt] = useState('08:00');
  const [defaultEndsAt, setDefaultEndsAt] = useState('17:00');
  const [hoveredTimeField, setHoveredTimeField] = useState<
    'start' | 'end' | null
  >(null);
  const [confirmAutoSchedule, setConfirmAutoSchedule] = useState(false);
  const [pendingDeleteEmployeeId, setPendingDeleteEmployeeId] = useState<
    number | null
  >(null);
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(
    null,
  );
  const {
    data: employees = [],
    error,
    isLoading,
    refetch,
  } = useQuery({ queryKey: ['employees'], queryFn: listEmployees });
  const calendarDays = useMemo(() => getCalendarDays(month), [month]);
  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
  const queryClient = useQueryClient();
  const schedules = useQuery({
    queryKey: ['staff-schedules', monthKey],
    queryFn: () => listStaffSchedules(monthKey),
  });
  const branches = useQuery({ queryKey: ['branches'], queryFn: listBranches });
  const workspaceBranches = franchiseMode
    ? (branches.data ?? [])
    : (branches.data ?? []).filter((branch) => !branch.franchiseeId);
  const activeBranchId = franchiseMode
    ? (workspaceBranches[0]?.id ?? null)
    : (selectedBranchId ?? workspaceBranches[0]?.id ?? null);
  const activeBranch = workspaceBranches.find(
    (branch) => branch.id === activeBranchId,
  );
  const generate = useMutation({
    mutationFn: () => generateStaffSchedules(monthKey, activeBranchId!),
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
  const replaceShift = useMutation({
    mutationFn: ({
      targetShiftId,
      sourceShiftId,
    }: {
      targetShiftId: number;
      sourceShiftId: number;
    }) => replaceStaffShift(targetShiftId, sourceShiftId),
    onSuccess: () => {
      setDraggedShiftId(null);
      void queryClient.invalidateQueries({
        queryKey: ['staff-schedules', monthKey],
      });
    },
  });
  const createEmployeeMutation = useMutation({
    mutationFn: () =>
      createEmployee({
        name: newEmployeeName,
        username: `employee_${Date.now()}`,
        password: `Temp${Date.now()}!`,
        role: newEmployeeRole,
        branchId: Number(newEmployeeBranchId),
        defaultStartsAt,
        defaultEndsAt,
      }),
    onSuccess: () => {
      setIsEmployeeDrawerOpen(false);
      setNewEmployeeName('');
      void queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
  const shiftsByDate = useMemo(() => {
    const result = new Map<string, NonNullable<typeof schedules.data>>();
    for (const shift of schedules.data ?? []) {
      if (shift.branchId !== activeBranchId) continue;
      result.set(shift.date, [...(result.get(shift.date) ?? []), shift]);
    }
    return result;
  }, [activeBranchId, schedules.data]);
  const shiftColorsByUser = useMemo(() => {
    const userIds = [
      ...new Set(
        (schedules.data ?? [])
          .filter((shift) => shift.branchId === activeBranchId)
          .map((shift) => shift.userId),
      ),
    ].sort((first, second) => first - second);
    return new Map(
      userIds.map((userId, index) => [
        userId,
        shiftColors[index % shiftColors.length],
      ]),
    );
  }, [activeBranchId, schedules.data]);
  const staffCount = employees.filter(
    (employee) =>
      employee.role === 'cashier' || employee.role === 'branch_manager',
  ).length;
  const branchEmployees = franchiseMode
    ? employees
    : employees.filter((employee) => employee.branchId === activeBranchId);
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
  const editEmployee = async (employee: (typeof employees)[number]) => {
    setEditingEmployeeId(employee.id);
    setNewEmployeeName(employee.name);
    setNewEmployeeRole(
      employee.role === 'branch_manager' ? 'branch_manager' : 'cashier',
    );
    setNewEmployeeBranchId(String(employee.branchId ?? activeBranchId ?? ''));
    setDefaultStartsAt(employee.defaultStartsAt?.slice(0, 5) || '08:00');
    setDefaultEndsAt(employee.defaultEndsAt?.slice(0, 5) || '17:00');
    setIsEmployeeDrawerOpen(true);
  };
  const removeEmployee = async (employee: (typeof employees)[number]) => {
    await deleteEmployee(employee.id);
    setPendingDeleteEmployeeId(null);
    void refetch();
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
          <Divider
            orientation="vertical"
            flexItem
            sx={{ mx: 0.5, borderColor: '#d8cec7' }}
          />
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              if (confirmAutoSchedule) {
                setConfirmAutoSchedule(false);
                generate.mutate();
              } else setConfirmAutoSchedule(true);
            }}
            disabled={generate.isPending || activeBranchId === null}
            sx={
              confirmAutoSchedule
                ? { bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }
                : undefined
            }
          >
            {generate.isPending
              ? 'กำลังจัดตาราง...'
              : confirmAutoSchedule
                ? 'ยืนยันจัดตาราง'
                : 'จัดตารางอัตโนมัติ'}
          </Button>
          {confirmAutoSchedule ? (
            <Button
              variant="outlined"
              size="small"
              onClick={() => setConfirmAutoSchedule(false)}
            >
              ยกเลิก
            </Button>
          ) : null}
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              setEditingEmployeeId(null);
              setNewEmployeeName('');
              setNewEmployeeRole('cashier');
              setNewEmployeeBranchId(String(activeBranchId ?? ''));
              setDefaultStartsAt('');
              setDefaultEndsAt('');
              setIsEmployeeDrawerOpen(true);
            }}
            sx={{ bgcolor: '#805637', '&:hover': { bgcolor: '#60412a' } }}
          >
            เพิ่มพนักงาน
          </Button>
        </Box>
      </Box>

      {isLoading ? <EmployeesSkeleton /> : null}
      {!franchiseMode && error ? (
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
      {!franchiseMode && schedules.error ? (
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
      {!isLoading && (!error || franchiseMode) ? (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'minmax(0, 2fr) minmax(0, 8fr)',
              },
              gap: 1.5,
              mb: 2,
              alignItems: 'stretch',
            }}
          >
            {!franchiseMode ? (
              <Card
                variant="outlined"
                sx={{ p: 2, borderRadius: '15px', borderColor: '#e8ddd5' }}
              >
                <Typography
                  color="text.secondary"
                  sx={{ fontSize: 14, fontWeight: 700 }}
                >
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
            ) : null}
            <Card
              variant="outlined"
              sx={{ p: 2, borderRadius: '15px', borderColor: '#e8ddd5' }}
            >
              <Typography
                color="text.secondary"
                sx={{ fontSize: 14, fontWeight: 700 }}
              >
                {franchiseMode ? 'พนักงานในแฟรนไชส์' : 'พนักงานประจำสาขา'}
              </Typography>
              {franchiseMode ? (
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
              ) : (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, minmax(0, 1fr))',
                    },
                    gap: 1,
                    mt: 1.5,
                  }}
                >
                  {branchEmployees.length === 0 ? (
                    <Typography color="text.secondary" sx={{ fontSize: 14 }}>
                      ยังไม่มีพนักงานในสาขานี้
                    </Typography>
                  ) : (
                    branchEmployees.map((employee) => (
                      <Box
                        key={employee.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          px: 1.5,
                          py: 1,
                          borderRadius: '10px',
                          bgcolor: '#fbf7f4',
                        }}
                      >
                        <Typography
                          sx={{ flex: 1, fontSize: 15, fontWeight: 600 }}
                        >
                          {employee.name}
                        </Typography>
                        <Typography
                          color="text.secondary"
                          sx={{ fontSize: 13 }}
                        >
                          {employee.role === 'branch_manager'
                            ? 'ผู้จัดการสาขา'
                            : 'แคชเชียร์'}
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.75,
                            ml: 2,
                          }}
                        >
                          <Divider
                            orientation="vertical"
                            flexItem
                            sx={{ borderColor: '#d8cec7', mx: 0.5 }}
                          />
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => {
                              if (pendingDeleteEmployeeId === employee.id)
                                setPendingDeleteEmployeeId(null);
                              else void editEmployee(employee);
                            }}
                            sx={{
                              minHeight: 34,
                              borderRadius: '10px',
                              bgcolor: '#5f4030',
                              color: '#fff',
                              boxShadow: 'none',
                              '&:hover': {
                                bgcolor: '#3c2d24',
                                boxShadow: 'none',
                              },
                            }}
                          >
                            {pendingDeleteEmployeeId === employee.id
                              ? 'ยกเลิก'
                              : 'แก้ไข'}
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            onClick={() => {
                              if (pendingDeleteEmployeeId === employee.id)
                                void removeEmployee(employee);
                              else setPendingDeleteEmployeeId(employee.id);
                            }}
                            sx={{
                              minHeight: 34,
                              borderRadius: '10px',
                              boxShadow: 'none',
                              '&:hover': { boxShadow: 'none' },
                            }}
                          >
                            {pendingDeleteEmployeeId === employee.id
                              ? 'ยืนยัน'
                              : 'ลบ'}
                          </Button>
                        </Box>
                      </Box>
                    ))
                  )}
                </Box>
              )}
            </Card>

            {franchiseMode ? (
              <Card
                variant="outlined"
                sx={{
                  gridColumn: { xs: 'auto', sm: '2' },
                  p: 2,
                  borderRadius: '16px',
                  borderColor: '#e8ddd5',
                }}
              >
                <Typography
                  color="text.secondary"
                  sx={{
                    fontFamily: 'Kanit, sans-serif',
                    fontSize: 14,
                    fontWeight: 700,
                    mb: 1.5,
                  }}
                >
                  รายชื่อพนักงาน
                </Typography>
                {employees.length === 0 ? (
                  <Typography
                    sx={{ color: '#b8aaa1', fontSize: 14, fontWeight: 500 }}
                  >
                    ยังไม่มีพนักงานในแฟรนไชส์
                  </Typography>
                ) : (
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, minmax(0, 1fr))',
                      },
                      gap: 1,
                    }}
                  >
                    {employees.map((employee) => (
                      <Box
                        key={employee.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          px: 1.5,
                          py: 1,
                          borderRadius: '10px',
                          bgcolor: '#fbf7f4',
                        }}
                      >
                        <Typography
                          sx={{ flex: 1, fontSize: 15, fontWeight: 600 }}
                        >
                          {employee.name}
                        </Typography>
                        <Typography
                          color="text.secondary"
                          sx={{ fontSize: 13 }}
                        >
                          {employee.role === 'branch_manager'
                            ? 'ผู้จัดการสาขา'
                            : 'แคชเชียร์'}
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.75,
                            ml: 2,
                          }}
                        >
                          <Divider
                            orientation="vertical"
                            flexItem
                            sx={{ borderColor: '#d8cec7', mx: 0.5 }}
                          />
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => {
                              if (pendingDeleteEmployeeId === employee.id)
                                setPendingDeleteEmployeeId(null);
                              else void editEmployee(employee);
                            }}
                            sx={{
                              minHeight: 34,
                              borderRadius: '10px',
                              bgcolor: '#5f4030',
                              color: '#fff',
                              boxShadow: 'none',
                              '&:hover': {
                                bgcolor: '#3c2d24',
                                boxShadow: 'none',
                              },
                            }}
                          >
                            {pendingDeleteEmployeeId === employee.id
                              ? 'ยกเลิก'
                              : 'แก้ไข'}
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            onClick={() => {
                              if (pendingDeleteEmployeeId === employee.id)
                                void removeEmployee(employee);
                              else setPendingDeleteEmployeeId(employee.id);
                            }}
                            sx={{
                              minHeight: 34,
                              borderRadius: '10px',
                              boxShadow: 'none',
                              '&:hover': { boxShadow: 'none' },
                            }}
                          >
                            {pendingDeleteEmployeeId === employee.id
                              ? 'ยืนยัน'
                              : 'ลบ'}
                          </Button>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Card>
            ) : null}
          </Box>

          {!franchiseMode && (
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
              {workspaceBranches.map((branch) => (
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
          )}

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
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {!franchiseMode && (
                  <Box>
                    <Typography
                      sx={{ color: '#8b7161', fontSize: 12, fontWeight: 700 }}
                    >
                      สาขา
                    </Typography>
                    <Typography
                      sx={{ color: '#201914', fontSize: 21, fontWeight: 800 }}
                    >
                      {activeBranch?.name ?? 'ยังไม่พบสาขา'}
                    </Typography>
                  </Box>
                )}
                <Box
                  sx={{
                    pl: franchiseMode ? 0 : 3,
                    borderLeft: franchiseMode ? 0 : '1px solid #dfd1c8',
                  }}
                >
                  <Typography
                    sx={{ color: '#8b7161', fontSize: 12, fontWeight: 700 }}
                  >
                    เดือน
                  </Typography>
                  <Typography
                    sx={{ color: '#201914', fontSize: 21, fontWeight: 800 }}
                  >
                    {thaiMonth.format(month)}
                  </Typography>
                </Box>
              </Box>
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
                          '&:nth-last-child(-n + 7)': { borderBottom: 0 },
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
                        {shifts.map((shift) => (
                          <Box
                            key={shift.id}
                            component="button"
                            type="button"
                            draggable={shift.status === 'scheduled'}
                            onClick={() => openShiftEditor(shift)}
                            onDragStart={() => setDraggedShiftId(shift.id)}
                            onDragEnd={() => setDraggedShiftId(null)}
                            onDragOver={(event) => {
                              if (shift.status !== 'scheduled')
                                event.preventDefault();
                            }}
                            onDrop={() => {
                              if (
                                draggedShiftId !== null &&
                                draggedShiftId !== shift.id &&
                                shift.status !== 'scheduled'
                              )
                                replaceShift.mutate({
                                  targetShiftId: shift.id,
                                  sourceShiftId: draggedShiftId,
                                });
                            }}
                            sx={{
                              width: '100%',
                              border: 0,
                              cursor: 'pointer',
                              opacity:
                                draggedShiftId === shift.id ? 0.55 : undefined,
                              outline:
                                draggedShiftId !== null &&
                                shift.status !== 'scheduled'
                                  ? '2px dashed #b94136'
                                  : 'none',
                              outlineOffset: 2,
                              textAlign: 'left',
                              mt: 0.75,
                              px: 0.65,
                              py: 0.35,
                              borderRadius: '6px',
                              bgcolor:
                                shift.status === 'scheduled'
                                  ? shiftColorsByUser.get(shift.userId)
                                  : shift.status === 'day_off'
                                    ? '#ebe8e5'
                                    : '#ffe4e4',
                              color: '#60493b',
                              fontSize: 12,
                              lineHeight: 1.25,
                            }}
                          >
                            <Box
                              component="span"
                              sx={{ display: 'block', mb: 0.35 }}
                            >
                              {shift.name}
                            </Box>
                            {shift.status === 'scheduled'
                              ? `${shift.startsAt.slice(0, 5)} น. - ${shift.endsAt.slice(0, 5)} น.`
                              : leaveLabels[shift.status]}
                          </Box>
                        ))}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Box>
          </Card>
        </>
      ) : null}
      <Drawer
        anchor="bottom"
        open={Boolean(selectedShift)}
        onClose={() => setSelectedShift(null)}
        transitionDuration={{ enter: 360, exit: 280 }}
        sx={{ zIndex: 1300 }}
        slotProps={{
          paper: {
            sx: {
              left: { md: '280px' },
              width: { md: 'calc(100% - 304px)' },
              minHeight: { sm: 440 },
              maxHeight: '82vh',
              overflowY: 'auto',
              borderRadius: '24px 24px 0 0',
              bgcolor: '#fffaf7',
              boxShadow: '0 -12px 32px rgba(50, 35, 25, .18)',
            },
          },
        }}
      >
        <Box sx={{ width: '100%', px: { xs: 2.5, sm: 4 }, pt: 1.5, pb: 3.5 }}>
          <Box
            sx={{
              width: 44,
              height: 5,
              mx: 'auto',
              mb: 2.5,
              borderRadius: 99,
              bgcolor: '#d8c8bd',
            }}
          />
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box>
              <Typography
                sx={{
                  color: '#201914',
                  fontFamily: 'Kanit, sans-serif',
                  fontSize: 22,
                  fontWeight: 600,
                }}
              >
                จัดการกะงาน
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: 14 }}>
                {selectedShift?.name}
              </Typography>
            </Box>
            <Button
              aria-label="ปิด"
              onClick={() => setSelectedShift(null)}
              sx={{
                minWidth: 40,
                width: 40,
                height: 40,
                p: 0,
                borderRadius: '12px',
                bgcolor: '#f7eee8',
                color: '#5f4b3d',
                '&:hover': { bgcolor: '#f1e4da' },
              }}
            >
              <XIcon size={20} />
            </Button>
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(3, minmax(0, 1fr))',
              },
              gap: 2,
              mt: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: '#fff',
              },
            }}
          >
            <TextField
              label="ย้ายไปวันที่"
              type="date"
              value={editDate}
              onChange={(event) => setEditDate(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            {!franchiseMode && (
              <FormControl>
                <InputLabel id="schedule-branch-label">สาขา</InputLabel>
                <Select
                  labelId="schedule-branch-label"
                  label="สาขา"
                  value={editBranchId}
                  onChange={(event) => setEditBranchId(event.target.value)}
                >
                  {workspaceBranches.map((branch) => (
                    <MenuItem key={branch.id} value={String(branch.id)}>
                      {branch.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
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
              <Typography
                color="error"
                sx={{ fontSize: 13, gridColumn: '1 / -1' }}
              >
                {updateShift.error.message}
              </Typography>
            ) : null}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 1.25,
                gridColumn: '1 / -1',
              }}
            >
              <Button onClick={() => setSelectedShift(null)}>ยกเลิก</Button>
              <Button
                variant="contained"
                onClick={() => updateShift.mutate()}
                disabled={updateShift.isPending}
                sx={{ bgcolor: '#201914', '&:hover': { bgcolor: '#3c2d24' } }}
              >
                {updateShift.isPending ? 'กำลังบันทึก...' : 'บันทึกกะงาน'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Drawer>
      <Drawer
        anchor="bottom"
        open={isEmployeeDrawerOpen}
        onClose={() => setIsEmployeeDrawerOpen(false)}
        transitionDuration={{ enter: 360, exit: 280 }}
        sx={{ zIndex: 1300 }}
        slotProps={{
          paper: {
            sx: {
              left: { md: '280px' },
              width: { md: 'calc(100% - 304px)' },
              maxHeight: '82vh',
              overflowY: 'auto',
              borderRadius: '24px 24px 0 0',
              bgcolor: '#fffaf7',
              boxShadow: '0 -12px 32px rgba(50, 35, 25, .18)',
            },
          },
        }}
      >
        <Box sx={{ width: '100%', px: { xs: 2.5, sm: 4 }, pt: 1.5, pb: 3.5 }}>
          <Box
            sx={{
              width: 44,
              height: 5,
              mx: 'auto',
              mb: 2.5,
              borderRadius: 99,
              bgcolor: '#d8c8bd',
            }}
          />
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box>
              <Typography
                sx={{
                  color: '#201914',
                  fontFamily: 'Kanit, sans-serif',
                  fontSize: 22,
                  fontWeight: 600,
                }}
              >
                {editingEmployeeId !== null ? 'แก้ไขพนักงาน' : 'เพิ่มพนักงาน'}
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: 14 }}>
                สร้างบัญชีเพื่อเข้าสู่ระบบและจัดตารางกะ
              </Typography>
            </Box>
            <Button
              aria-label="ปิด"
              onClick={() => setIsEmployeeDrawerOpen(false)}
              sx={{
                minWidth: 40,
                width: 40,
                height: 40,
                p: 0,
                borderRadius: '12px',
                bgcolor: '#f7eee8',
                color: '#5f4b3d',
              }}
            >
              <XIcon size={20} />
            </Button>
          </Box>
          <Box
            component="form"
            onSubmit={(event) => {
              event.preventDefault();
              if (
                !defaultStartsAt ||
                !defaultEndsAt ||
                defaultStartsAt === '00:00' ||
                defaultEndsAt === '00:00'
              ) {
                window.alert('กรุณาระบุเวลาเข้างานและเวลาออกงานก่อนบันทึก');
                return;
              }
              if (editingEmployeeId !== null) {
                void updateEmployee(editingEmployeeId, {
                  name: newEmployeeName,
                  role: newEmployeeRole,
                  branchId: Number(newEmployeeBranchId),
                  defaultStartsAt,
                  defaultEndsAt,
                }).then(() => {
                  setEditingEmployeeId(null);
                  setIsEmployeeDrawerOpen(false);
                  void queryClient.invalidateQueries({
                    queryKey: ['employees'],
                  });
                });
              } else createEmployeeMutation.mutate();
            }}
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
              },
              gap: 2,
              mt: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: '#fff',
              },
            }}
          >
            <TextField
              required
              label="ชื่อ-นามสกุล"
              value={newEmployeeName}
              onChange={(event) => setNewEmployeeName(event.target.value)}
            />
            {!franchiseMode && (
              <FormControl required>
                <InputLabel id="new-employee-branch-label">สาขา</InputLabel>
                <Select
                  labelId="new-employee-branch-label"
                  label="สาขา"
                  value={newEmployeeBranchId}
                  onChange={(event) =>
                    setNewEmployeeBranchId(event.target.value)
                  }
                >
                  {workspaceBranches.map((branch) => (
                    <MenuItem key={branch.id} value={String(branch.id)}>
                      {branch.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <FormControl required>
              <InputLabel id="new-employee-role-label">ตำแหน่ง</InputLabel>
              <Select
                labelId="new-employee-role-label"
                label="ตำแหน่ง"
                value={newEmployeeRole}
                onChange={(event) =>
                  setNewEmployeeRole(
                    event.target.value as 'branch_manager' | 'cashier',
                  )
                }
              >
                <MenuItem value="cashier">แคชเชียร์</MenuItem>
                <MenuItem value="branch_manager">ผู้จัดการสาขา</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ gridColumn: '1 / -1', mt: 0.5 }}>
              <Divider sx={{ borderColor: '#d8cec7', mb: 1.5 }} />
              <Typography
                sx={{ color: '#3c2d24', fontSize: 14, fontWeight: 600, mb: 1 }}
              >
                เวลาทำงานประจำ
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                gridColumn: { xs: '1', sm: '1 / -1' },
              }}
            >
              <Box sx={{ flex: 1, position: 'relative' }}>
                <TextField
                  required
                  fullWidth
                  label="เวลาเข้างาน"
                  type="time"
                  value={defaultStartsAt}
                  onChange={(event) => setDefaultStartsAt(event.target.value)}
                  onMouseEnter={() => setHoveredTimeField('start')}
                  onMouseLeave={() => setHoveredTimeField(null)}
                  sx={{
                    '& input::-webkit-calendar-picker-indicator': {
                      opacity: 0,
                    },
                  }}
                  slotProps={{
                    inputLabel: { shrink: true },
                    htmlInput: {
                      onClick: (event: MouseEvent<HTMLInputElement>) =>
                        event.currentTarget.showPicker?.(),
                    },
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    inset: '0 16px 0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#3c2d24',
                    pointerEvents: 'none',
                    zIndex: 2,
                  }}
                >
                  <ClockIcon
                    size={20}
                    animated={hoveredTimeField === 'start'}
                  />
                </Box>
              </Box>
              <Box sx={{ flex: 1, position: 'relative' }}>
                <TextField
                  required
                  fullWidth
                  label="เวลาออกงาน"
                  type="time"
                  value={defaultEndsAt}
                  onChange={(event) => setDefaultEndsAt(event.target.value)}
                  onMouseEnter={() => setHoveredTimeField('end')}
                  onMouseLeave={() => setHoveredTimeField(null)}
                  sx={{
                    '& input::-webkit-calendar-picker-indicator': {
                      opacity: 0,
                    },
                  }}
                  slotProps={{
                    inputLabel: { shrink: true },
                    htmlInput: {
                      onClick: (event: MouseEvent<HTMLInputElement>) =>
                        event.currentTarget.showPicker?.(),
                    },
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    inset: '0 16px 0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#3c2d24',
                    pointerEvents: 'none',
                    zIndex: 2,
                  }}
                >
                  <ClockIcon size={20} animated={hoveredTimeField === 'end'} />
                </Box>
              </Box>
            </Box>
            {createEmployeeMutation.error ? (
              <Typography
                color="error"
                sx={{ fontSize: 13, gridColumn: '1 / -1' }}
              >
                {createEmployeeMutation.error.message}
              </Typography>
            ) : null}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 1.25,
                gridColumn: '1 / -1',
              }}
            >
              <Button
                variant="outlined"
                onClick={() => setIsEmployeeDrawerOpen(false)}
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={createEmployeeMutation.isPending}
                sx={{ bgcolor: '#201914', '&:hover': { bgcolor: '#3c2d24' } }}
              >
                {createEmployeeMutation.isPending
                  ? 'กำลังเพิ่ม...'
                  : 'เพิ่มพนักงาน'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </DashboardMain>
  );
}
