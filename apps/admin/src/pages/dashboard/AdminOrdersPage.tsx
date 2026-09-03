import { useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import {
  DashboardMain,
  SearchIcon,
  formatDate,
  type SearchIconHandle,
} from '@stackbuild/ui';
import type { Branch } from '@stackbuild/management';
import {
  useStockRequests,
  useUpdateStockRequestStatus,
} from '../../hooks/useStockRequests';
import { AdminOrdersSkeleton } from '../../components/skeletons/AdminOrdersSkeleton';

type RequestStatus =
  'pending' | 'approved' | 'preparing' | 'completed' | 'rejected';
type SupplyType = 'วัตถุดิบ' | 'สต๊อก';
type SupplyItem = { name: string; quantity: string };
type SupplyRequest = {
  id: string;
  branch: Exclude<Branch, 'ทุกสาขา'>;
  type: SupplyType;
  items: SupplyItem[];
  requestedAt: string;
  status: RequestStatus;
};
const statuses = [
  'ทั้งหมด',
  'รออนุมัติ',
  'อนุมัติแล้ว',
  'กำลังจัดเตรียม',
  'จัดเสร็จแล้ว',
  'ปฏิเสธ',
] as const;
const statusLabels: Record<RequestStatus, string> = {
  pending: 'รออนุมัติ',
  approved: 'อนุมัติแล้ว',
  preparing: 'กำลังจัดเตรียม',
  completed: 'จัดเสร็จแล้ว',
  rejected: 'ปฏิเสธ',
};
const statusColors: Record<RequestStatus, { main: string; text: string }> = {
  pending: { main: '#805637', text: '#fff' },
  approved: { main: '#556b82', text: '#fff' },
  preparing: { main: '#ca7a16', text: '#fff' },
  completed: { main: '#e8eee9', text: '#3c5b47' },
  rejected: { main: '#f8dddd', text: '#a22e2a' },
};
const nextStatus: Partial<Record<RequestStatus, RequestStatus>> = {
  pending: 'approved',
  approved: 'preparing',
  preparing: 'completed',
};
const actionLabel: Partial<Record<RequestStatus, string>> = {
  pending: 'อนุมัติคำขอ',
  approved: 'เริ่มจัดเตรียม',
  preparing: 'ยืนยันจัดเสร็จ',
};

export function AdminOrdersPage({ activeBranch }: { activeBranch: Branch }) {
  const searchRef = useRef<SearchIconHandle>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof statuses)[number]>('ทั้งหมด');
  const [supplyType, setSupplyType] = useState<'ทั้งหมด' | SupplyType>(
    'ทั้งหมด',
  );
  const {
    data: apiRequests = [],
    isLoading,
    error,
    refetch,
  } = useStockRequests();
  const updateStatus = useUpdateStockRequestStatus();
  const requestStates = useMemo(
    () =>
      apiRequests.map((request) => ({
        id: `REQ-${request.id}`,
        branch: request.branch.name as Exclude<Branch, 'ทุกสาขา'>,
        type: 'วัตถุดิบ',
        items: request.items.map((item) => ({
          name: item.name,
          quantity: `${item.quantity} ${item.unit}`,
        })),
        requestedAt: formatDate(request.createdAt),
        status: request.status,
      })),
    [apiRequests],
  );
  const filteredRequests = useMemo(
    () =>
      requestStates.filter((request) => {
        const matchesBranch =
          activeBranch === 'ทุกสาขา' || request.branch === activeBranch;
        const matchesStatus =
          filter === 'ทั้งหมด' || statusLabels[request.status] === filter;
        const matchesType =
          supplyType === 'ทั้งหมด' || request.type === supplyType;
        return (
          matchesBranch &&
          matchesStatus &&
          matchesType &&
          `${request.id}${request.branch}${request.items.map((item) => item.name).join(' ')}`
            .toLowerCase()
            .includes(query.toLowerCase())
        );
      }),
    [activeBranch, filter, query, requestStates, supplyType],
  );
  const advanceRequest = async (id: string) => {
    const current = requestStates.find((request) => request.id === id);
    if (!current) return;
    const next = nextStatus[current.status] as
      Exclude<RequestStatus, 'pending'> | undefined;
    if (!next) return;
    try {
      const requestId = Number(id.replace('REQ-', ''));
      if (!Number.isNaN(requestId))
        await updateStatus.mutateAsync({ id: requestId, status: next });
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : 'อัปเดตคำขอไม่สำเร็จ',
      );
    }
  };
  const rejectRequest = async (id: string) => {
    try {
      const requestId = Number(id.replace('REQ-', ''));
      if (!Number.isNaN(requestId))
        await updateStatus.mutateAsync({ id: requestId, status: 'rejected' });
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : 'ปฏิเสธคำขอไม่สำเร็จ',
      );
    }
  };
  const pendingCount = requestStates.filter(
    (request) =>
      request.status === 'pending' &&
      (activeBranch === 'ทุกสาขา' || request.branch === activeBranch),
  ).length;

  return (
    <DashboardMain>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          justifyContent: 'space-between',
          alignItems: { lg: 'center' },
          gap: 1.5,
          mb: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              color: '#3c2d24',
              fontFamily: 'Kanit, sans-serif',
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            คำขอเติมวัตถุดิบและสต๊อก
          </Typography>
          <Typography
            sx={{
              color: 'text.secondary',
              fontFamily: 'Kanit, sans-serif',
              fontSize: 13,
            }}
          >
            จัดการรายการที่แต่ละสาขาส่งขอมาเพื่อเติมสินค้า
          </Typography>
        </Box>
        <TextField
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => searchRef.current?.startAnimation()}
          onBlur={() => searchRef.current?.stopAnimation()}
          placeholder="ค้นหาเลขคำขอ สาขา หรือรายการ"
          size="small"
          sx={{
            width: { xs: '100%', lg: 310 },
            '& .MuiOutlinedInput-root': { borderRadius: '12px' },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon ref={searchRef} size={18} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>
      <Card
        variant="outlined"
        sx={{
          mb: 2,
          borderRadius: '15px',
          borderColor: '#e8ddd5',
          bgcolor: '#fffaf7',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { sm: 'center' },
            gap: 1,
            p: 1.75,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontFamily: 'Kanit, sans-serif',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {activeBranch === 'ทุกสาขา' ? 'ทุกสาขา' : `สาขา ${activeBranch}`}
            </Typography>
            <Typography
              sx={{
                color: 'text.secondary',
                fontFamily: 'Kanit, sans-serif',
                fontSize: 12,
              }}
            >
              มีคำขอรอการอนุมัติ {pendingCount} รายการ
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.75 }}>
            {(['ทั้งหมด', 'วัตถุดิบ', 'สต๊อก'] as const).map((item) => (
              <Button
                key={item}
                onClick={() => setSupplyType(item)}
                size="small"
                variant={supplyType === item ? 'contained' : 'outlined'}
                sx={{
                  minHeight: 32,
                  borderRadius: '10px',
                  borderColor: '#d8c8bd',
                  bgcolor: supplyType === item ? '#201914' : '#fff',
                  color: supplyType === item ? '#fff' : '#5f4b3d',
                  fontFamily: 'Kanit, sans-serif',
                  fontSize: 12,
                  boxShadow: 'none',
                }}
              >
                {item}
              </Button>
            ))}
          </Box>
        </Box>
      </Card>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {statuses.map((item) => (
          <Button
            key={item}
            onClick={() => setFilter(item)}
            size="small"
            variant={filter === item ? 'contained' : 'outlined'}
            sx={{
              minHeight: 34,
              borderRadius: '12px',
              borderColor: '#d8c8bd',
              bgcolor: filter === item ? '#201914' : '#fff',
              color: filter === item ? '#fff' : '#5f4b3d',
              fontFamily: 'Kanit, sans-serif',
              fontSize: 12,
              boxShadow: 'none',
            }}
          >
            {item}
          </Button>
        ))}
      </Box>
      {error && (
        <Box
          sx={{
            mb: 2,
            p: 1.5,
            borderRadius: 2,
            bgcolor: '#fff0ee',
            color: '#a22e2a',
          }}
        >
          โหลดคำขอไม่สำเร็จ{' '}
          <Button size="small" onClick={() => refetch()}>
            ลองใหม่
          </Button>
        </Box>
      )}
      {isLoading && <AdminOrdersSkeleton />}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, minmax(0, 1fr))',
            xl: 'repeat(3, minmax(0, 1fr))',
          },
          gap: '16px',
        }}
      >
        {!isLoading &&
          filteredRequests.map((request) => {
            const color = statusColors[request.status];
            const canAdvance = Boolean(nextStatus[request.status]);
            return (
              <Card
                key={request.id}
                variant="outlined"
                sx={{ borderRadius: '15px', borderColor: '#e8ddd5' }}
              >
                <Box sx={{ p: 2.5 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 1,
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          color: '#3c2d24',
                          fontFamily: 'Kanit, sans-serif',
                          fontSize: 19,
                          fontWeight: 600,
                        }}
                      >
                        สาขา {request.branch}
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.15,
                          color: 'text.secondary',
                          fontFamily: 'Kanit, sans-serif',
                          fontSize: 12,
                        }}
                      >
                        {request.id}
                      </Typography>
                    </Box>
                    <Chip
                      label={statusLabels[request.status]}
                      size="small"
                      sx={{
                        height: 25,
                        borderRadius: '12px',
                        bgcolor: color.main,
                        color: color.text,
                        fontFamily: 'Kanit, sans-serif',
                        fontSize: 11,
                      }}
                    />
                  </Box>
                  <Chip
                    label={request.type}
                    size="small"
                    variant="outlined"
                    sx={{
                      mt: 1.5,
                      height: 24,
                      borderRadius: '9px',
                      borderColor:
                        request.type === 'วัตถุดิบ' ? '#b8a296' : '#a8b6c1',
                      color:
                        request.type === 'วัตถุดิบ' ? '#805637' : '#276a9c',
                      fontFamily: 'Kanit, sans-serif',
                      fontSize: 11,
                    }}
                  />
                  <Box
                    sx={{
                      mt: 1.5,
                      p: 1.25,
                      borderRadius: '10px',
                      bgcolor: '#f8f0eb',
                      border: '1px solid #eadbd2',
                    }}
                  >
                    <Typography
                      sx={{
                        mb: 0.75,
                        color: '#5f4030',
                        fontFamily: 'Kanit, sans-serif',
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      รายการที่ขอ{' '}
                      <Box
                        component="span"
                        sx={{ color: '#8a6b58', fontWeight: 500 }}
                      >
                        · {request.items.length} รายการ
                      </Box>
                    </Typography>
                    {request.items.map((item) => (
                      <Box
                        key={item.name}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 1,
                          py: 0.5,
                          '& + &': { borderTop: '1px solid #eadbd2' },
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: 'Kanit, sans-serif',
                            fontSize: 13,
                            fontWeight: 500,
                          }}
                        >
                          {item.name}
                        </Typography>
                        <Typography
                          sx={{
                            flexShrink: 0,
                            color: '#805637',
                            fontFamily: 'Kanit, sans-serif',
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          {item.quantity}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                      mt: 2,
                    }}
                  >
                    <Typography
                      sx={{
                        color: 'text.secondary',
                        fontFamily: 'Kanit, sans-serif',
                        fontSize: 12,
                      }}
                    >
                      {request.requestedAt}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.75 }}>
                      {canAdvance ? (
                        <Button
                          onClick={() => advanceRequest(request.id)}
                          variant="contained"
                          size="small"
                          sx={{
                            minHeight: 34,
                            borderRadius: '10px',
                            bgcolor: '#201914',
                            fontFamily: 'Kanit, sans-serif',
                            fontSize: 12,
                            boxShadow: 'none',
                            '&:hover': {
                              bgcolor: '#3c2d24',
                              boxShadow: 'none',
                            },
                          }}
                        >
                          {actionLabel[request.status]}
                        </Button>
                      ) : null}
                      {request.status === 'pending' ? (
                        <Button
                          onClick={() => rejectRequest(request.id)}
                          color="error"
                          variant="outlined"
                          size="small"
                          sx={{
                            minHeight: 34,
                            borderRadius: '10px',
                            fontFamily: 'Kanit, sans-serif',
                            fontSize: 12,
                          }}
                        >
                          ปฏิเสธ
                        </Button>
                      ) : null}
                    </Box>
                  </Box>
                </Box>
              </Card>
            );
          })}
      </Box>
      {filteredRequests.length === 0 && (
        <Typography
          sx={{
            pt: 4,
            textAlign: 'center',
            color: 'text.secondary',
            fontFamily: 'Kanit, sans-serif',
          }}
        >
          ไม่พบคำขอที่ค้นหา
        </Typography>
      )}
    </DashboardMain>
  );
}
