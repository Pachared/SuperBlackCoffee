// @ts-nocheck
import { Box, Button, Card, Chip, Divider, LinearProgress, Stack, Typography } from '@mui/material';
import { DashboardMain } from '@stackbuild/ui';

const orders = [
  { id: '#SC-24018', item: 'Iced Americano', note: 'วันนี้ · 10:24', status: 'กำลังเตรียม', tone: '#9b6138' },
  { id: '#SC-24002', item: 'Cold Brew', note: '18 ส.ค. 2026', status: 'รับแล้ว', tone: '#4f7555' },
  { id: '#SC-23976', item: 'Cappuccino', note: '13 ส.ค. 2026', status: 'รับแล้ว', tone: '#4f7555' },
];

export function CustomerOverviewPage() {
  return (
    <DashboardMain>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.65fr) minmax(290px, .85fr)' }, gap: '16px' }}>
        <Card elevation={0} sx={{ bgcolor: '#181411', color: '#fff', borderRadius: '15px', minHeight: 258 }}>
          <Box sx={{ p: { xs: 3, md: 4 }, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box><Typography sx={{ color: '#c99a75', fontFamily: '"SBC Sans", sans-serif', fontSize: 11, letterSpacing: 1.5, fontWeight: 700 }}>SUPER BLACK COFFEE</Typography><Typography sx={{ mt: 1.5, fontFamily: 'Kanit, sans-serif', fontSize: { xs: 27, md: 33 }, fontWeight: 600, lineHeight: 1.25 }}>พร้อมรับกาแฟแก้วโปรด<br />ของคุณแล้ว</Typography><Typography sx={{ mt: 1, color: 'rgba(255,255,255,.62)', fontSize: 14 }}>สั่งซ้ำเมนูเดิม หรือเลือกเมนูใหม่ได้ทันที</Typography></Box>
            <Button variant="contained" sx={{ width: 'fit-content', mt: 3, borderRadius: '15px', px: 2.25, bgcolor: '#bd936e', color: '#171411', fontFamily: 'Kanit, sans-serif', fontWeight: 600, boxShadow: 'none', '&:hover': { bgcolor: '#cfaa89', boxShadow: 'none' } }}>สั่งกาแฟ</Button>
          </Box>
        </Card>
        <Card variant="outlined" sx={{ borderRadius: '15px', borderColor: '#e8ddd5' }}>
          <Box sx={{ p: { xs: 2.5, md: 3 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography sx={{ color: '#805637', fontFamily: '"SBC Sans", sans-serif', fontSize: 11, letterSpacing: 1.2, fontWeight: 800 }}>BLACK REWARDS</Typography>
            <Stack direction="row" alignItems="baseline" spacing={1} mt={1.3}><Typography sx={{ fontSize: 38, lineHeight: 1, fontWeight: 800 }}>420</Typography><Typography sx={{ color: 'text.secondary', fontFamily: 'Kanit, sans-serif', fontSize: 14 }}>คะแนน</Typography></Stack>
            <Typography sx={{ mt: 1, color: 'text.secondary', fontFamily: 'Kanit, sans-serif', fontSize: 13 }}>อีก 80 คะแนน รับเครื่องดื่มฟรี</Typography>
            <LinearProgress variant="determinate" value={84} sx={{ mt: 2.5, height: 6, borderRadius: '15px', bgcolor: '#eee2d8', '& .MuiLinearProgress-bar': { bgcolor: '#a16d4b' } }} />
            <Button variant="text" sx={{ mt: 'auto', pt: 2.5, px: 0, alignSelf: 'start', color: '#805637', fontFamily: 'Kanit, sans-serif', fontWeight: 600 }}>ดูสิทธิประโยชน์</Button>
          </Box>
        </Card>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1.5fr) minmax(300px, .75fr)' }, gap: '16px', mt: '16px' }}>
        <Card variant="outlined" sx={{ borderRadius: '15px', borderColor: '#e8ddd5' }}><Box sx={{ p: { xs: 2.25, md: 3 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}><Box><Typography sx={{ fontFamily: 'Kanit, sans-serif', fontSize: 19, fontWeight: 600 }}>คำสั่งซื้อล่าสุด</Typography><Typography sx={{ mt: .25, color: 'text.secondary', fontSize: 13 }}>ติดตามสถานะแก้วของคุณได้ที่นี่</Typography></Box><Button size="small" sx={{ color: '#805637', fontFamily: 'Kanit, sans-serif' }}>ดูทั้งหมด</Button></Stack>
          <Stack divider={<Divider flexItem sx={{ borderColor: '#eee6e0' }} />}>{orders.map((order) => <Box key={order.id} sx={{ py: 1.5, display: 'grid', gridTemplateColumns: '40px minmax(0,1fr) auto', alignItems: 'center', gap: 1.5 }}><Box sx={{ width: 36, height: 36, display: 'grid', placeItems: 'center', bgcolor: '#f3ebe5', color: '#805637', borderRadius: '15px', fontSize: 17 }}>☕</Box><Box><Typography sx={{ fontFamily: 'Kanit, sans-serif', fontWeight: 600, fontSize: 15 }}>{order.item}</Typography><Typography sx={{ color: 'text.secondary', fontSize: 12 }}>{order.id} · {order.note}</Typography></Box><Chip label={order.status} size="small" sx={{ height: 25, bgcolor: '#f7f1ec', color: order.tone, borderRadius: '15px', fontFamily: 'Kanit, sans-serif', fontSize: 12, fontWeight: 600 }} /></Box>)}</Stack>
        </Box></Card>
        <Card elevation={0} sx={{ borderRadius: '15px', bgcolor: '#f4eee9' }}><Box sx={{ p: { xs: 2.5, md: 3 }, display: 'flex', height: '100%', flexDirection: 'column' }}>
          <Typography sx={{ color: '#805637', fontFamily: '"SBC Sans", sans-serif', fontSize: 11, letterSpacing: 1.2, fontWeight: 800 }}>QUICK ACCESS</Typography>
          <Stack spacing={0} mt={1.5} divider={<Divider flexItem sx={{ borderColor: '#dfcfc3' }} />}>{[['เมนูโปรด', 'สั่งเมนูที่คุณชอบอีกครั้ง'], ['คะแนนสะสม', 'ตรวจสอบรางวัลของคุณ'], ['ประวัติการสั่ง', 'ดูรายการทั้งหมด']].map(([title, detail]) => <Box key={title} sx={{ py: 1.35 }}><Typography sx={{ fontFamily: 'Kanit, sans-serif', fontSize: 15, fontWeight: 600 }}>{title}</Typography><Typography sx={{ mt: .2, color: 'text.secondary', fontSize: 12 }}>{detail}</Typography></Box>)}</Stack>
        </Box></Card>
      </Box>
    </DashboardMain>
  );
}
