import { useMemo } from 'react';
import { Box, Card, Chip, Divider, Stack, Typography } from '@mui/material';
import { DashboardMain, formatCurrency } from '@stackbuild/ui';
import { useDashboardSummary } from '../../hooks/useDashboardSummary';

export function AdminOverviewPage() {
  const { data: summary } = useDashboardSummary();
  const metrics = useMemo(() => {
    const sales = summary?.todaySales ?? 0;
    const orders = summary?.todayOrders ?? 0;
    return [
      ['ยอดขายวันนี้', formatCurrency(sales)],
      ['คำสั่งซื้อวันนี้', orders.toLocaleString('th-TH')],
      ['ยอดเฉลี่ยต่อบิล', formatCurrency(orders ? sales / orders : 0)],
    ];
  }, [summary]);
  return (
    <DashboardMain>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
          gap: '16px',
        }}
      >
        {metrics.map(([title, value]) => (
          <Card
            key={title}
            variant="outlined"
            sx={{ borderRadius: '15px', borderColor: '#e8ddd5' }}
          >
            <Box sx={{ p: { xs: 2, md: 2.5 } }}>
              <Typography
                sx={{
                  color: 'text.secondary',
                  fontFamily: 'Kanit, sans-serif',
                  fontSize: 13,
                }}
              >
                {title}
              </Typography>
              <Typography
                sx={{
                  mt: 1,
                  fontSize: { xs: 21, md: 26 },
                  lineHeight: 1.1,
                  fontWeight: 800,
                }}
              >
                {value}
              </Typography>
              <Typography
                sx={{
                  mt: 0.8,
                  color: 'text.secondary',
                  fontFamily: 'Kanit, sans-serif',
                  fontSize: 12,
                }}
              >
                ข้อมูลจากรายการขายที่ชำระแล้ว
              </Typography>
            </Box>
          </Card>
        ))}
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            xl: 'minmax(0, 1.55fr) minmax(310px, .75fr)',
          },
          gap: '16px',
          mt: '16px',
        }}
      >
        <Card
          variant="outlined"
          sx={{ borderRadius: '15px', borderColor: '#e8ddd5' }}
        >
          <Box sx={{ p: { xs: 2.25, md: 3 } }}>
            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
            >
              <Box>
                <Typography
                  sx={{
                    fontFamily: 'Kanit, sans-serif',
                    fontSize: 19,
                    fontWeight: 600,
                  }}
                >
                  ยอดขายวันนี้
                </Typography>
                <Typography
                  sx={{ mt: 0.25, color: 'text.secondary', fontSize: 13 }}
                >
                  สรุปจากข้อมูลที่ระบบบันทึกจริง
                </Typography>
              </Box>
              <Chip
                label="วันนี้"
                size="small"
                sx={{
                  bgcolor: '#f4eee9',
                  color: '#805637',
                  borderRadius: '15px',
                  fontFamily: 'Kanit, sans-serif',
                  fontSize: 12,
                }}
              />
            </Stack>
            <Box
              sx={{
                minHeight: 220,
                pt: 3,
                display: 'grid',
                placeItems: 'center',
                borderBottom: '1px solid #ece3dc',
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  sx={{
                    color: '#201914',
                    fontFamily: 'Kanit, sans-serif',
                    fontSize: 36,
                    fontWeight: 800,
                  }}
                >
                  {formatCurrency(summary?.todaySales ?? 0)}
                </Typography>
                <Typography
                  sx={{
                    mt: 1,
                    color: 'text.secondary',
                    fontFamily: 'Kanit, sans-serif',
                    fontSize: 14,
                  }}
                >
                  จาก {summary?.todayOrders.toLocaleString('th-TH') ?? '0'}{' '}
                  รายการที่ชำระแล้ว
                </Typography>
              </Box>
            </Box>
          </Box>
        </Card>
        <Card
          elevation={0}
          sx={{ borderRadius: '15px', bgcolor: '#201914', color: '#fff' }}
        >
          <Box
            sx={{
              p: { xs: 2.5, md: 3 },
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography
              sx={{
                color: '#c99a75',
                fontFamily: '"SBC Sans", sans-serif',
                fontSize: 11,
                letterSpacing: 1.3,
                fontWeight: 700,
              }}
            >
              LIVE STATUS
            </Typography>
            <Typography
              sx={{
                mt: 1,
                fontFamily: 'Kanit, sans-serif',
                fontSize: 21,
                fontWeight: 600,
              }}
            >
              สถานะการขายวันนี้
            </Typography>
            <Stack
              direction="row"
              divider={
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ borderColor: 'rgba(255,255,255,.2)' }}
                />
              }
              sx={{ mt: 3.5 }}
            >
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Typography sx={{ fontSize: 27, fontWeight: 800 }}>
                  {summary?.todayOrders.toLocaleString('th-TH') ?? '0'}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.35,
                    color: 'rgba(255,255,255,.63)',
                    fontFamily: 'Kanit, sans-serif',
                    fontSize: 12,
                  }}
                >
                  ชำระเงินแล้ว
                </Typography>
              </Box>
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Typography sx={{ fontSize: 27, fontWeight: 800 }}>
                  {formatCurrency(summary?.todaySales ?? 0)}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.35,
                    color: 'rgba(255,255,255,.63)',
                    fontFamily: 'Kanit, sans-serif',
                    fontSize: 12,
                  }}
                >
                  ยอดขายสะสม
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Card>
      </Box>
    </DashboardMain>
  );
}
