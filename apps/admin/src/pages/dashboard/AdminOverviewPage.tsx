// @ts-nocheck
import { Box, Button, Card, Chip, Divider, Stack, Typography } from '@mui/material';
import { DashboardMain, formatCurrency } from '@stackbuild/ui';

const metrics = [['ยอดขายวันนี้', formatCurrency(12_840), '+12.5%', '#4d7556'], ['คำสั่งซื้อ', '86', '+8.2%', '#4d7556'], ['ลูกค้าใหม่', '24', '+4.8%', '#4d7556'], ['ยอดเฉลี่ยต่อบิล', formatCurrency(149), '-1.4%', '#b0473c']];
const orders = [['ORD-24018', 'Narin S.', 'Iced Americano', formatCurrency(120), 'กำลังเตรียม'], ['ORD-24017', 'May W.', 'Oat Latte', formatCurrency(145), 'เสร็จแล้ว'], ['ORD-24016', 'Krit P.', 'Espresso', formatCurrency(90), 'เสร็จแล้ว']];
const sales = [38, 55, 47, 68, 58, 84, 65];

export function AdminOverviewPage() {
  return (
    <DashboardMain>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' }, gap: '16px' }}>
        {metrics.map(([title, value, trend, color]) => <Card key={title} variant="outlined" sx={{ borderRadius: '15px', borderColor: '#e8ddd5' }}><Box sx={{ p: { xs: 2, md: 2.5 } }}><Typography sx={{ color: 'text.secondary', fontFamily: 'Kanit, sans-serif', fontSize: 13 }}>{title}</Typography><Typography sx={{ mt: 1, fontSize: { xs: 21, md: 26 }, lineHeight: 1.1, fontWeight: 800 }}>{value}</Typography><Typography sx={{ mt: .8, color, fontSize: 12, fontWeight: 700 }}>{trend} <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}>จากเมื่อวาน</Box></Typography></Box></Card>)}
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1.55fr) minmax(310px, .75fr)' }, gap: '16px', mt: '16px' }}>
        <Card variant="outlined" sx={{ borderRadius: '15px', borderColor: '#e8ddd5' }}><Box sx={{ p: { xs: 2.25, md: 3 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="start"><Box><Typography sx={{ fontFamily: 'Kanit, sans-serif', fontSize: 19, fontWeight: 600 }}>ยอดขายรายสัปดาห์</Typography><Typography sx={{ mt: .25, color: 'text.secondary', fontSize: 13 }}>ยอดขายรวมในช่วง 7 วันล่าสุด</Typography></Box><Chip label="7 วันล่าสุด" size="small" sx={{ bgcolor: '#f4eee9', color: '#805637', borderRadius: '15px', fontFamily: 'Kanit, sans-serif', fontSize: 12 }} /></Stack>
          <Box sx={{ height: 220, pt: 3, display: 'flex', alignItems: 'end', gap: { xs: 1, md: 2 }, borderBottom: '1px solid #ece3dc' }}>{sales.map((height, index) => <Box key={index} sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'end' }}><Box sx={{ width: { xs: '82%', md: '64%' }, height: height + '%', minHeight: 16, bgcolor: index === 5 ? '#201914' : '#ba8d6c', borderRadius: '3px 3px 0 0' }} /><Typography sx={{ mt: 1, color: 'text.secondary', fontFamily: 'Kanit, sans-serif', fontSize: 11 }}>{['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'][index]}</Typography></Box>)}</Box>
        </Box></Card>
        <Card elevation={0} sx={{ borderRadius: '15px', bgcolor: '#201914', color: '#fff' }}><Box sx={{ p: { xs: 2.5, md: 3 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Typography sx={{ color: '#c99a75', fontFamily: '"SBC Sans", sans-serif', fontSize: 11, letterSpacing: 1.3, fontWeight: 700 }}>LIVE STATUS</Typography><Typography sx={{ mt: 1, fontFamily: 'Kanit, sans-serif', fontSize: 21, fontWeight: 600 }}>สถานะออเดอร์วันนี้</Typography>
          <Stack direction="row" mt={3.5} divider={<Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,.2)' }} />}>{[['8', 'กำลังทำ'], ['64', 'เสร็จแล้ว'], ['14', 'ยกเลิก']].map(([number, label]) => <Box key={label} flex={1} textAlign="center"><Typography sx={{ fontSize: 27, fontWeight: 800 }}>{number}</Typography><Typography sx={{ mt: .35, color: 'rgba(255,255,255,.63)', fontFamily: 'Kanit, sans-serif', fontSize: 12 }}>{label}</Typography></Box>)}</Stack>
          <Button variant="contained" sx={{ mt: 'auto', borderRadius: '15px', bgcolor: '#bd936e', color: '#171411', fontFamily: 'Kanit, sans-serif', fontWeight: 700, boxShadow: 'none', '&:hover': { bgcolor: '#cfaa89', boxShadow: 'none' } }}>จัดการคำสั่งซื้อ</Button>
        </Box></Card>
      </Box>
      <Card variant="outlined" sx={{ borderRadius: '15px', borderColor: '#e8ddd5', mt: 2 }}><Box sx={{ p: { xs: 2.25, md: 3 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}><Box><Typography sx={{ fontFamily: 'Kanit, sans-serif', fontSize: 19, fontWeight: 600 }}>คำสั่งซื้อล่าสุด</Typography><Typography sx={{ mt: .25, color: 'text.secondary', fontSize: 13 }}>ติดตามออเดอร์ที่เข้ามาล่าสุด</Typography></Box><Button size="small" sx={{ color: '#805637', fontFamily: 'Kanit, sans-serif' }}>ดูทั้งหมด</Button></Stack>
        <Stack divider={<Divider flexItem sx={{ borderColor: '#eee6e0' }} />}>{orders.map(([id, customer, item, total, status]) => <Box key={id} display="grid" gridTemplateColumns={{ xs: 'minmax(0,1fr) auto', md: '1.05fr 1fr 1.25fr .65fr .85fr' }} gap={1} alignItems="center" sx={{ py: 1.35 }}><Box><Typography sx={{ fontFamily: '"SBC Sans", sans-serif', fontSize: 13, fontWeight: 700 }}>{id}</Typography><Typography display={{ md: 'none' }} sx={{ mt: .2, color: 'text.secondary', fontFamily: 'Kanit, sans-serif', fontSize: 12 }}>{customer} · {item}</Typography></Box><Typography display={{ xs: 'none', md: 'block' }} sx={{ fontFamily: 'Kanit, sans-serif', fontSize: 14 }}>{customer}</Typography><Typography display={{ xs: 'none', md: 'block' }} sx={{ fontFamily: 'Kanit, sans-serif', fontSize: 14 }}>{item}</Typography><Typography display={{ xs: 'none', md: 'block' }} sx={{ fontSize: 14, fontWeight: 700 }}>{total}</Typography><Chip label={status} size="small" sx={{ justifySelf: 'end', height: 25, borderRadius: '15px', bgcolor: status === 'กำลังเตรียม' ? '#f5e9de' : '#edf3eb', color: status === 'กำลังเตรียม' ? '#9b6138' : '#4d7556', fontFamily: 'Kanit, sans-serif', fontWeight: 600, fontSize: 12 }} /></Box>)}</Stack>
      </Box></Card>
    </DashboardMain>
  );
}
