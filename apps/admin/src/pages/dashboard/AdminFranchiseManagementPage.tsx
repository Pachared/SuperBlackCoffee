import { Box, Card, Chip, Divider, Typography } from '@mui/material';
import { DashboardMain } from '@stackbuild/ui';

const plans = [
  {
    code: 'S',
    title: 'Smart Café',
    description: 'เหมาะสำหรับร้านขนาดกะทัดรัด',
    items: [
      'สูตรเครื่องดื่มมาตรฐาน',
      'คู่มือการเปิดร้านและอบรมพื้นฐาน',
      'สิทธิ์ใช้แบรนด์และสื่อการตลาดกลาง',
    ],
  },
  {
    code: 'M',
    title: 'Lifestyle Café',
    description: 'ร้านกาแฟพร้อมอาหารและบริการเสริม',
    items: [
      'ทุกสิทธิ์ของแพ็กเกจ S',
      'สูตรอาหารและเบเกอรี่เพิ่มเติม',
      'การอบรมพนักงานและคำปรึกษาการดำเนินงาน',
    ],
  },
  {
    code: 'L',
    title: 'Lifestyle Hub',
    description: 'ศูนย์รวมบริการสำหรับพื้นที่ขนาดใหญ่',
    items: [
      'ทุกสิทธิ์ของแพ็กเกจ M',
      'ชุดเมนูและสูตรครบวงจร',
      'แผนการตลาดเฉพาะสาขาและการสนับสนุนเชิงลึก',
    ],
  },
];

export function AdminFranchiseManagementPage() {
  return (
    <DashboardMain>
      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{
            color: '#201914',
            fontFamily: 'Kanit, sans-serif',
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          จัดการแฟรนไชส์
        </Typography>
        <Typography
          sx={{ color: 'text.secondary', fontFamily: 'Kanit, sans-serif' }}
        >
          จัดการชุดข้อมูลเครื่องดื่ม สูตรอาหาร และสิทธิประโยชน์ของแต่ละแพ็กเกจ
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 2,
        }}
      >
        {plans.map((plan) => (
          <Card
            key={plan.code}
            sx={{
              p: 2.5,
              borderRadius: '18px',
              border: '1px solid #eadfd7',
              boxShadow: 'none',
            }}
          >
            <Chip
              label={`แพ็กเกจ ${plan.code}`}
              sx={{
                mb: 1.5,
                bgcolor: '#f5ece5',
                color: '#60493b',
                fontWeight: 700,
              }}
            />
            <Typography
              sx={{ fontSize: 21, fontWeight: 700, color: '#201914' }}
            >
              {plan.title}
            </Typography>
            <Typography sx={{ mt: 0.5, mb: 2, color: 'text.secondary' }}>
              {plan.description}
            </Typography>
            <Divider sx={{ mb: 1.5 }} />
            {plan.items.map((item) => (
              <Typography key={item} sx={{ mb: 1, color: '#4f4036' }}>
                ✓ {item}
              </Typography>
            ))}
          </Card>
        ))}
      </Box>
    </DashboardMain>
  );
}
