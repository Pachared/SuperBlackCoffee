import { Box, Button, Card, Chip, Typography } from '@mui/material';

export function Overview() {
  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 24, fontWeight: 700 }}>
            ยินดีต้อนรับสู่ Franchise Portal
          </Typography>
          <Typography sx={{ mt: 0.25, color: 'text.secondary' }}>
            พื้นที่จัดการข้อมูลแฟรนไชส์ของคุณ
          </Typography>
        </Box>
        <Chip
          label="บัญชีกำลังรอตั้งค่า"
          sx={{
            borderRadius: '10px',
            bgcolor: '#f8edd8',
            color: '#a76415',
            fontFamily: 'Kanit, sans-serif',
            fontWeight: 600,
          }}
        />
      </Box>
      <Card
        variant="outlined"
        sx={{
          p: { xs: 2.5, md: 4 },
          borderRadius: '16px',
          borderColor: '#e8ddd5',
        }}
      >
        <Typography
          sx={{
            color: '#805637',
            fontFamily: 'Inter, sans-serif',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.5,
          }}
        >
          FRANCHISE ONBOARDING
        </Typography>
        <Typography sx={{ mt: 1, fontSize: 26, fontWeight: 700 }}>
          เริ่มต้นตั้งค่าบัญชีแฟรนไชส์
        </Typography>
        <Typography
          sx={{
            maxWidth: 620,
            mt: 1,
            color: 'text.secondary',
            lineHeight: 1.8,
          }}
        >
          สำนักงานกลางจะกำหนดรูปแบบแฟรนไชส์ บัญชีผู้ใช้งาน
          และสิทธิ์เข้าถึงให้ก่อนเปิดใช้งาน
          คุณสามารถตรวจสอบข้อมูลและส่งคำขอผ่านหน้านี้ได้
        </Typography>
        <Button
          variant="contained"
          sx={{
            mt: 3,
            minHeight: 40,
            borderRadius: '12px',
            bgcolor: '#201914',
            fontFamily: 'Kanit, sans-serif',
            boxShadow: 'none',
            '&:hover': { bgcolor: '#3c2d24', boxShadow: 'none' },
          }}
        >
          ดูข้อมูลแฟรนไชส์
        </Button>
      </Card>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
          gap: 2,
          mt: 2,
        }}
      >
        {[
          ['รูปแบบแฟรนไชส์', 'รอสำนักงานใหญ่กำหนด'],
          ['บัญชีเข้าใช้', 'รอรับคำเชิญ'],
          ['สถานะเปิดใช้งาน', 'ยังไม่เปิดใช้งาน'],
        ].map(([label, value]) => (
          <Card
            key={label}
            variant="outlined"
            sx={{ p: 2.25, borderRadius: '15px', borderColor: '#e8ddd5' }}
          >
            <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
              {label}
            </Typography>
            <Typography sx={{ mt: 0.5, fontSize: 18, fontWeight: 600 }}>
              {value}
            </Typography>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
