import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { DashboardMain, formatDate } from '@stackbuild/ui';
import { getDailySalesReport, type DailySalesReport } from '../../lib/api';

const currency = (amount: number) => `${amount.toLocaleString('th-TH')} บาท`;
const inputDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

export function PosReportsPage() {
  const [dailyReport, setDailyReport] = useState<DailySalesReport | null>(null);
  const [selectedDate, setSelectedDate] = useState(inputDate);

  useEffect(() => {
    let active = true;
    void getDailySalesReport(selectedDate)
      .then((report) => {
        if (active) setDailyReport(report);
      })
      .catch(() => {
        if (active) setDailyReport(null);
      });
    return () => {
      active = false;
    };
  }, [selectedDate]);

  const items = dailyReport?.items ?? [];
  const totals = dailyReport?.totals ?? {
    quantity: 0,
    costTotal: 0,
    revenueTotal: 0,
    profit: 0,
  };
  const profitColor = totals.profit >= 0 ? '#177245' : '#b42318';

  return (
    <DashboardMain>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <Typography
          sx={{
            fontFamily: 'Kanit, sans-serif',
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          รายงานยอดขาย
        </Typography>
        <TextField
          type="date"
          size="small"
          value={selectedDate}
          onChange={(event) =>
            setSelectedDate(event.target.value || inputDate())
          }
          slotProps={{ htmlInput: { 'aria-label': 'เลือกวันที่รายงาน' } }}
          sx={{
            width: 170,
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              bgcolor: '#fff',
            },
            '& input': { fontFamily: 'Kanit, sans-serif', fontSize: 13, py: 1 },
          }}
        />
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
          gap: '16px',
          mb: 2,
        }}
      >
        <Card
          variant="outlined"
          sx={{ p: 2.25, borderRadius: '15px', borderColor: '#e8ddd5' }}
        >
          <Typography
            sx={{
              color: 'text.secondary',
              fontFamily: 'Kanit, sans-serif',
              fontSize: 13,
            }}
          >
            ยอดขายรวม
          </Typography>
          <Typography
            sx={{
              mt: 0.5,
              color: '#201914',
              fontFamily: 'Kanit, sans-serif',
              fontSize: 25,
              fontWeight: 700,
            }}
          >
            {currency(totals.revenueTotal)}
          </Typography>
          <Typography
            sx={{
              mt: 0.25,
              color: 'text.secondary',
              fontFamily: 'Kanit, sans-serif',
              fontSize: 12,
            }}
          >
            จากรายการที่ชำระแล้ว
          </Typography>
        </Card>
        <Card
          variant="outlined"
          sx={{ p: 2.25, borderRadius: '15px', borderColor: '#e8ddd5' }}
        >
          <Typography
            sx={{
              color: 'text.secondary',
              fontFamily: 'Kanit, sans-serif',
              fontSize: 13,
            }}
          >
            จำนวนที่ขาย
          </Typography>
          <Typography
            sx={{
              mt: 0.5,
              fontFamily: 'Kanit, sans-serif',
              fontSize: 25,
              fontWeight: 700,
            }}
          >
            {totals.quantity.toLocaleString('th-TH')} รายการ
          </Typography>
          <Typography
            sx={{
              mt: 0.25,
              color: 'text.secondary',
              fontFamily: 'Kanit, sans-serif',
              fontSize: 12,
            }}
          >
            รวมทุกเมนูวันนี้
          </Typography>
        </Card>
        <Card
          variant="outlined"
          sx={{ p: 2.25, borderRadius: '15px', borderColor: '#e8ddd5' }}
        >
          <Typography
            sx={{
              color: 'text.secondary',
              fontFamily: 'Kanit, sans-serif',
              fontSize: 13,
            }}
          >
            กำไรสุทธิ
          </Typography>
          <Typography
            sx={{
              mt: 0.5,
              color: profitColor,
              fontFamily: 'Kanit, sans-serif',
              fontSize: 25,
              fontWeight: 700,
            }}
          >
            {currency(totals.profit)}
          </Typography>
          <Typography
            sx={{
              mt: 0.25,
              color: 'text.secondary',
              fontFamily: 'Kanit, sans-serif',
              fontSize: 12,
            }}
          >
            รายได้หักต้นทุน
          </Typography>
        </Card>
      </Box>
      <Card
        variant="outlined"
        sx={{
          borderRadius: '15px',
          borderColor: '#e8ddd5',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: { xs: 2, md: 2.5 } }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 2,
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontFamily: 'Kanit, sans-serif',
                  fontSize: 18,
                  fontWeight: 600,
                }}
              >
                สรุปยอดขายรายวัน
              </Typography>
              <Typography
                sx={{
                  mt: 0.25,
                  color: 'text.secondary',
                  fontFamily: 'Kanit, sans-serif',
                  fontSize: 13,
                }}
              >
                ดูรายได้ ต้นทุน และกำไรแยกตามเมนู
              </Typography>
            </Box>
            <Typography
              sx={{
                flexShrink: 0,
                color: '#805637',
                fontFamily: 'Kanit, sans-serif',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {dailyReport?.date
                ? formatDate(dailyReport.date)
                : 'กำลังโหลด...'}
            </Typography>
          </Box>
        </Box>
        <Divider />
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 600 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#fbf7f3' }}>
                <TableCell
                  sx={{
                    width: '34%',
                    color: '#5f4b3d',
                    fontFamily: 'Kanit, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  เมนู
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: '#5f4b3d',
                    fontFamily: 'Kanit, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  จำนวน
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: '#5f4b3d',
                    fontFamily: 'Kanit, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  รายได้
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: '#5f4b3d',
                    fontFamily: 'Kanit, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  ต้นทุน
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: '#5f4b3d',
                    fontFamily: 'Kanit, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  กำไร
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow
                  key={item.productName}
                  sx={{
                    '&:last-child td': { borderBottom: 0 },
                    '&:hover': { bgcolor: '#fffaf7' },
                  }}
                >
                  <TableCell
                    sx={{ fontFamily: 'Kanit, sans-serif', fontWeight: 600 }}
                  >
                    {item.productName}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontFamily: 'Kanit, sans-serif' }}
                  >
                    {item.quantity.toLocaleString('th-TH')}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontFamily: 'Kanit, sans-serif' }}
                  >
                    {currency(item.revenueTotal)}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: '#6f625b', fontFamily: 'Kanit, sans-serif' }}
                  >
                    {currency(item.costTotal)}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: item.profit >= 0 ? '#177245' : '#b42318',
                      fontFamily: 'Kanit, sans-serif',
                      fontWeight: 700,
                    }}
                  >
                    {currency(item.profit)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow
                sx={{ bgcolor: '#f7eee8', '& td': { borderBottom: 0 } }}
              >
                <TableCell
                  sx={{
                    color: '#201914',
                    fontFamily: 'Kanit, sans-serif',
                    fontWeight: 700,
                  }}
                >
                  รวมทั้งหมด
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: '#201914',
                    fontFamily: 'Kanit, sans-serif',
                    fontWeight: 700,
                  }}
                >
                  {totals.quantity.toLocaleString('th-TH')}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: '#201914',
                    fontFamily: 'Kanit, sans-serif',
                    fontWeight: 700,
                  }}
                >
                  {currency(totals.revenueTotal)}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: '#5f4b3d',
                    fontFamily: 'Kanit, sans-serif',
                    fontWeight: 700,
                  }}
                >
                  {currency(totals.costTotal)}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: profitColor,
                    fontFamily: 'Kanit, sans-serif',
                    fontWeight: 700,
                  }}
                >
                  {currency(totals.profit)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        {items.length === 0 && (
          <Typography
            sx={{
              px: 2,
              pb: 2.5,
              textAlign: 'center',
              color: 'text.secondary',
              fontFamily: 'Kanit, sans-serif',
            }}
          >
            ยังไม่มีรายการขายในวันนี้
          </Typography>
        )}
      </Card>
    </DashboardMain>
  );
}
