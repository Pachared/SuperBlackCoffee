import { Box, Card, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { DashboardMain } from '@stackbuild/ui';

type SupplyOrder = { id: string; date: string; status: 'จัดส่งแล้ว' | 'กำลังจัดเตรียม' | 'รับเข้าแล้ว'; items: { name: string; quantity: string }[] };

const supplyOrders: SupplyOrder[] = [
  { id: 'REQ-2048', date: '25 ส.ค. 2569 · 10:24', status: 'กำลังจัดเตรียม', items: [{ name: 'เมล็ดกาแฟ House Blend', quantity: '18 กก.' }, { name: 'นมสด', quantity: '30 ลิตร' }, { name: 'ไซรัปวานิลลา', quantity: '10 ขวด' }] },
  { id: 'REQ-2029', date: '23 ส.ค. 2569 · 14:08', status: 'จัดส่งแล้ว', items: [{ name: 'แก้วกระดาษ 16 oz', quantity: '400 ใบ' }, { name: 'ฝาแก้วร้อน', quantity: '200 ชิ้น' }, { name: 'หลอดกระดาษ', quantity: '180 ชิ้น' }] },
  { id: 'REQ-1997', date: '20 ส.ค. 2569 · 09:30', status: 'รับเข้าแล้ว', items: [{ name: 'ผงมัทฉะ', quantity: '5 กก.' }, { name: 'ผงโกโก้', quantity: '7 กก.' }] },
  { id: 'REQ-1964', date: '17 ส.ค. 2569 · 16:42', status: 'รับเข้าแล้ว', items: [{ name: 'นมโอ๊ต', quantity: '16 ลิตร' }, { name: 'ซอสคาราเมล', quantity: '10 ขวด' }] },
  { id: 'REQ-1931', date: '14 ส.ค. 2569 · 11:15', status: 'รับเข้าแล้ว', items: [{ name: 'กล่องพัสดุ M', quantity: '80 กล่อง' }, { name: 'ถุงกระดาษหูหิ้ว', quantity: '100 ใบ' }] },
];

const statusStyles = {
  'จัดส่งแล้ว': { bgcolor: '#e9f1fa', color: '#276a9c' },
  'กำลังจัดเตรียม': { bgcolor: '#fff2df', color: '#a85a0a' },
  'รับเข้าแล้ว': { bgcolor: '#e8eee9', color: '#3c5b47' },
};

export function CustomerOrdersPage() {
  return <DashboardMain>
    <Card variant="outlined" sx={{ overflow: 'hidden', borderRadius: '15px', borderColor: '#e8ddd5' }}><TableContainer><Table sx={{ minWidth: 700 }}><TableHead><TableRow sx={{ bgcolor: '#f8f0eb' }}><TableCell sx={{ width: 150, fontFamily: 'Kanit, sans-serif', fontWeight: 600 }}>เลขคำขอ</TableCell><TableCell sx={{ fontFamily: 'Kanit, sans-serif', fontWeight: 600 }}>รายการที่สั่ง</TableCell><TableCell sx={{ width: 180, fontFamily: 'Kanit, sans-serif', fontWeight: 600 }}>วันที่สั่ง</TableCell><TableCell align="right" sx={{ width: 140, fontFamily: 'Kanit, sans-serif', fontWeight: 600 }}>สถานะ</TableCell></TableRow></TableHead><TableBody>{supplyOrders.map((order) => <TableRow key={order.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}><TableCell sx={{ color: '#805637', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700 }}>{order.id}</TableCell><TableCell sx={{ py: 1.5 }}><Box sx={{ display: 'grid', gap: .5 }}>{order.items.map((item) => <Box key={item.name} sx={{ display: 'flex', justifyContent: 'space-between', gap: 3, maxWidth: 420 }}><Typography sx={{ fontFamily: 'Kanit, sans-serif', fontSize: 13 }}>{item.name}</Typography><Typography sx={{ flexShrink: 0, color: '#805637', fontFamily: 'Kanit, sans-serif', fontSize: 13, fontWeight: 600 }}>{item.quantity}</Typography></Box>)}</Box></TableCell><TableCell sx={{ color: 'text.secondary', fontFamily: 'Kanit, sans-serif', fontSize: 13 }}>{order.date}</TableCell><TableCell align="right"><Chip label={order.status} size="small" sx={{ height: 26, borderRadius: '10px', ...statusStyles[order.status], fontFamily: 'Kanit, sans-serif', fontSize: 11, fontWeight: 600 }} /></TableCell></TableRow>)}</TableBody></Table></TableContainer></Card>
  </DashboardMain>;
}
