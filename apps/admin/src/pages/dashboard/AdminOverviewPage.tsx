import { useMemo } from 'react';
import {
  Box,
  ButtonBase,
  Card,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { DashboardMain, formatCurrency } from '@stackbuild/ui';
import { useDashboardSummary } from '../../hooks/useDashboardSummary';
import { useStockRequests } from '../../hooks/useStockRequests';
import { useWebsiteLeads } from '../../hooks/useWebsiteLeads';
import { AdminPageSkeleton } from '../../components/skeletons/AdminPageSkeleton';
import type { AdminPage } from '../../routes/adminRoutes';

type OverviewAction = {
  title: string;
  description: string;
  page: AdminPage;
  marker: string;
};

const overviewActions: OverviewAction[] = [
  {
    title: 'จัดการคำสั่งซื้อ',
    description: 'ตรวจสอบและดำเนินการตามรายการขาย',
    page: 'คำสั่งซื้อ',
    marker: '01',
  },
  {
    title: 'ตรวจสอบสต๊อก',
    description: 'ดูคำขอเติมสินค้าและสถานะการจัดส่ง',
    page: 'สต๊อก',
    marker: '02',
  },
  {
    title: 'จัดการเมนูและสินค้า',
    description: 'เพิ่ม แก้ไข หรือปิดการขายสินค้า',
    page: 'เมนูและสินค้า',
    marker: '03',
  },
  {
    title: 'อ่านข้อความลูกค้า',
    description: 'ติดตามข้อความและลูกค้าใหม่จากเว็บไซต์',
    page: 'แชทลูกค้า',
    marker: '04',
  },
];

const cardSx = {
  borderRadius: '16px',
  borderColor: '#e8ddd5',
  boxShadow: 'none',
};
const eyebrowSx = {
  color: '#6e625a',
  fontFamily: 'Kanit, sans-serif',
  fontSize: 13,
  fontWeight: 500,
};
const formatCount = (count: number) => count.toLocaleString('th-TH');

function MetricCard({
  label,
  value,
  helper,
  accent,
}: {
  label: string;
  value: string;
  helper: string;
  accent: string;
}) {
  return (
    <Card variant="outlined" sx={cardSx}>
      <Box sx={{ p: { xs: 2, md: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Typography sx={eyebrowSx}>{label}</Typography>
          <Box
            sx={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              bgcolor: accent,
              mt: 0.6,
            }}
          />
        </Box>
        <Typography
          sx={{
            mt: 1.25,
            color: '#201914',
            fontSize: { xs: 25, md: 31 },
            fontWeight: 800,
            lineHeight: 1.1,
          }}
        >
          {value}
        </Typography>
        <Typography sx={{ mt: 1, color: 'text.secondary', fontSize: 12.5 }}>
          {helper}
        </Typography>
      </Box>
    </Card>
  );
}

function FollowUpRow({
  title,
  detail,
  count,
  tone,
  onClick,
}: {
  title: string;
  detail: string;
  count: number;
  tone: string;
  onClick: () => void;
}) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        gap: 1.5,
        p: 1.5,
        border: '1px solid #eee4dd',
        borderRadius: '12px',
        textAlign: 'left',
        '&:hover': { borderColor: '#c9a78e', bgcolor: '#fdfaf8' },
        '&:focus-visible': {
          outline: '3px solid rgba(128,86,55,.28)',
          outlineOffset: 2,
        },
      }}
    >
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          bgcolor: tone,
          flexShrink: 0,
        }}
      />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          sx={{
            color: '#201914',
            fontFamily: 'Kanit, sans-serif',
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          {title}
        </Typography>
        <Typography sx={{ mt: 0.1, color: 'text.secondary', fontSize: 12.5 }}>
          {detail}
        </Typography>
      </Box>
      <Typography sx={{ color: '#201914', fontSize: 21, fontWeight: 800 }}>
        {formatCount(count)}
      </Typography>
      <Typography
        aria-hidden
        sx={{ color: '#805637', fontSize: 21, lineHeight: 1 }}
      >
        ›
      </Typography>
    </ButtonBase>
  );
}

export function AdminOverviewPage({
  onNavigate,
}: {
  onNavigate: (page: AdminPage) => void;
}) {
  const dashboard = useDashboardSummary();
  const stockRequests = useStockRequests();
  const websiteLeads = useWebsiteLeads();
  const sales = dashboard.data?.todaySales ?? 0;
  const orders = dashboard.data?.todayOrders ?? 0;
  const isLoading =
    dashboard.isLoading || stockRequests.isLoading || websiteLeads.isLoading;
  const followUps = useMemo(() => {
    const requests = stockRequests.data ?? [];
    const leads = websiteLeads.data ?? [];
    return {
      pendingStock: requests.filter((request) => request.status === 'pending')
        .length,
      activeStock: requests.filter((request) =>
        ['approved', 'preparing'].includes(request.status),
      ).length,
      newLeads: leads.filter((lead) => lead.status === 'new').length,
      contactedLeads: leads.filter((lead) => lead.status === 'contacted')
        .length,
    };
  }, [stockRequests.data, websiteLeads.data]);
  const hasError =
    dashboard.isError || stockRequests.isError || websiteLeads.isError;
  const updatedAt = new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date());

  return (
    <DashboardMain>
      {isLoading ? (
        <AdminPageSkeleton variant="overview" />
      ) : (
        <Stack spacing={2.25}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 2,
              alignItems: { xs: 'flex-start', sm: 'center' },
              flexDirection: { xs: 'column', sm: 'row' },
            }}
          >
            <Box>
              <Typography
                sx={{
                  color: '#201914',
                  fontFamily: 'Kanit, sans-serif',
                  fontSize: { xs: 23, md: 27 },
                  fontWeight: 700,
                }}
              >
                ภาพรวมการดำเนินงานวันนี้
              </Typography>
              <Typography
                sx={{ mt: 0.35, color: 'text.secondary', fontSize: 13 }}
              >
                ดูยอดขายและงานที่ควรติดตามจากข้อมูลในระบบ
              </Typography>
            </Box>
            <Typography sx={{ color: 'text.secondary', fontSize: 12.5 }}>
              อัปเดตเมื่อ {updatedAt}
            </Typography>
          </Box>
          {hasError ? (
            <Box
              role="alert"
              sx={{
                border: '1px solid #e7b8ae',
                borderRadius: '12px',
                bgcolor: '#fff7f5',
                p: 1.5,
                color: '#9d3322',
                fontFamily: 'Kanit, sans-serif',
                fontSize: 14,
              }}
            >
              ดึงข้อมูลบางส่วนไม่สำเร็จ กรุณาลองรีเฟรชหน้าอีกครั้ง
            </Box>
          ) : null}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(3, minmax(0, 1fr))',
              },
              gap: 2,
            }}
          >
            <MetricCard
              label="ยอดขายวันนี้"
              value={formatCurrency(sales)}
              helper="รวมเฉพาะรายการที่ชำระเงินแล้ว"
              accent="#805637"
            />
            <MetricCard
              label="คำสั่งซื้อที่ชำระแล้ว"
              value={`${formatCount(orders)} รายการ`}
              helper="คำสั่งซื้อที่บันทึกสำเร็จในวันนี้"
              accent="#4c8f70"
            />
            <MetricCard
              label="ยอดเฉลี่ยต่อบิล"
              value={formatCurrency(orders === 0 ? 0 : sales / orders)}
              helper="ยอดขายเฉลี่ยต่อคำสั่งซื้อที่ชำระแล้ว"
              accent="#c38642"
            />
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                xl: 'minmax(0, 1.25fr) minmax(330px, .75fr)',
              },
              gap: 2,
            }}
          >
            <Card variant="outlined" sx={cardSx}>
              <Box sx={{ p: { xs: 2, md: 2.75 } }}>
                <Typography
                  sx={{
                    color: '#201914',
                    fontFamily: 'Kanit, sans-serif',
                    fontSize: 19,
                    fontWeight: 600,
                  }}
                >
                  สรุปยอดขายวันนี้
                </Typography>
                <Typography
                  sx={{ mt: 0.35, color: 'text.secondary', fontSize: 13 }}
                >
                  ข้อมูลจากคำสั่งซื้อที่ชำระเงินแล้ว
                </Typography>
                <Box
                  sx={{
                    mt: 2.5,
                    p: { xs: 2, md: 2.5 },
                    borderRadius: '14px',
                    bgcolor: '#201914',
                    color: '#fff',
                  }}
                >
                  <Typography
                    sx={{
                      color: '#d6b59d',
                      fontFamily: 'Kanit, sans-serif',
                      fontSize: 13,
                    }}
                  >
                    รายได้สะสม
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.7,
                      fontSize: { xs: 31, md: 38 },
                      fontWeight: 800,
                      lineHeight: 1.1,
                    }}
                  >
                    {formatCurrency(sales)}
                  </Typography>
                  <Typography
                    sx={{ mt: 1, color: 'rgba(255,255,255,.7)', fontSize: 13 }}
                  >
                    จาก {formatCount(orders)} คำสั่งซื้อที่ชำระเงินแล้ว
                  </Typography>
                </Box>
                <Box
                  sx={{
                    mt: 2.25,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography sx={eyebrowSx}>จำนวนคำสั่งซื้อ</Typography>
                    <Typography
                      sx={{
                        mt: 0.4,
                        color: '#201914',
                        fontSize: 24,
                        fontWeight: 750,
                      }}
                    >
                      {formatCount(orders)}{' '}
                      <Box
                        component="span"
                        sx={{ fontSize: 14, fontWeight: 500 }}
                      >
                        รายการ
                      </Box>
                    </Typography>
                  </Box>
                  <Box sx={{ borderLeft: '1px solid #ece3dc', pl: 2 }}>
                    <Typography sx={eyebrowSx}>เฉลี่ยต่อคำสั่งซื้อ</Typography>
                    <Typography
                      sx={{
                        mt: 0.4,
                        color: '#201914',
                        fontSize: 24,
                        fontWeight: 750,
                      }}
                    >
                      {formatCurrency(orders === 0 ? 0 : sales / orders)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Card>
            <Card variant="outlined" sx={cardSx}>
              <Box sx={{ p: { xs: 2, md: 2.75 } }}>
                <Typography
                  sx={{
                    color: '#201914',
                    fontFamily: 'Kanit, sans-serif',
                    fontSize: 19,
                    fontWeight: 600,
                  }}
                >
                  สิ่งที่ต้องติดตาม
                </Typography>
                <Typography
                  sx={{ mt: 0.35, color: 'text.secondary', fontSize: 13 }}
                >
                  รายการที่ยังต้องดำเนินการ
                </Typography>
                <Stack spacing={1.25} sx={{ mt: 2.3 }}>
                  <FollowUpRow
                    title="คำขอสต๊อกรออนุมัติ"
                    detail="ตรวจสอบรายการจากสาขา"
                    count={followUps.pendingStock}
                    tone="#d59a31"
                    onClick={() => onNavigate('สต๊อก')}
                  />
                  <FollowUpRow
                    title="คำขอสต๊อกที่กำลังดำเนินการ"
                    detail="อนุมัติแล้วหรือกำลังจัดเตรียม"
                    count={followUps.activeStock}
                    tone="#4c8f70"
                    onClick={() => onNavigate('สต๊อก')}
                  />
                  <FollowUpRow
                    title="ข้อความลูกค้าใหม่"
                    detail="ข้อความจากแบบฟอร์มเว็บไซต์"
                    count={followUps.newLeads}
                    tone="#ad4939"
                    onClick={() => onNavigate('แชทลูกค้า')}
                  />
                  <FollowUpRow
                    title="ลูกค้าที่รอติดตาม"
                    detail="ติดต่อแล้วแต่ยังไม่ปิดเรื่อง"
                    count={followUps.contactedLeads}
                    tone="#805637"
                    onClick={() => onNavigate('แชทลูกค้า')}
                  />
                </Stack>
              </Box>
            </Card>
          </Box>
          <Card variant="outlined" sx={cardSx}>
            <Box sx={{ p: { xs: 2, md: 2.75 } }}>
              <Typography
                sx={{
                  color: '#201914',
                  fontFamily: 'Kanit, sans-serif',
                  fontSize: 19,
                  fontWeight: 600,
                }}
              >
                ทางลัด
              </Typography>
              <Typography
                sx={{ mt: 0.35, color: 'text.secondary', fontSize: 13 }}
              >
                ไปยังงานที่ใช้บ่อยของผู้ดูแลระบบ
              </Typography>
              <Divider sx={{ my: 2.2, borderColor: '#eee4dd' }} />
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, minmax(0, 1fr))',
                    lg: 'repeat(4, minmax(0, 1fr))',
                  },
                  gap: 1.25,
                }}
              >
                {overviewActions.map((action) => (
                  <ButtonBase
                    key={action.page}
                    onClick={() => onNavigate(action.page)}
                    sx={{
                      display: 'block',
                      border: '1px solid #eee4dd',
                      borderRadius: '12px',
                      p: 1.75,
                      textAlign: 'left',
                      transition:
                        'transform 160ms ease, border-color 160ms ease, background-color 160ms ease',
                      '&:hover': {
                        bgcolor: '#fdfaf8',
                        borderColor: '#c9a78e',
                        transform: 'translateY(-2px)',
                      },
                      '&:focus-visible': {
                        outline: '3px solid rgba(128,86,55,.28)',
                        outlineOffset: 2,
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        color: '#b28a6d',
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: 1,
                      }}
                    >
                      {action.marker}
                    </Typography>
                    <Typography
                      sx={{
                        mt: 0.8,
                        color: '#201914',
                        fontFamily: 'Kanit, sans-serif',
                        fontSize: 15,
                        fontWeight: 600,
                      }}
                    >
                      {action.title}
                    </Typography>
                    <Typography
                      sx={{
                        mt: 0.35,
                        color: 'text.secondary',
                        fontSize: 12.5,
                        lineHeight: 1.45,
                      }}
                    >
                      {action.description}
                    </Typography>
                  </ButtonBase>
                ))}
              </Box>
            </Box>
          </Card>
        </Stack>
      )}
    </DashboardMain>
  );
}
