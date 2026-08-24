import { useMemo, useRef, useState } from 'react';
import { Box, Button, Card, Chip, InputAdornment, Typography } from '@mui/material';
import { DashboardMain, SearchIcon, type SearchIconHandle } from '@stackbuild/ui';
import type { IngredientBranch } from '../../components/sidebar/IngredientBranchesSidebar';

type OrderStatus = 'ออเดอร์ใหม่' | 'กำลังเตรียม' | 'พร้อมรับ' | 'เสร็จสิ้น';
type Order = { id: string; customer: string; items: string; total: string; time: string; status: OrderStatus };
const orders: Order[] = [
  { id: '#SBC-1042', customer: 'Pim P.', items: 'ลาเต้เย็น × 1, ครัวซองต์ × 1', total: '170 บาท', time: '10:24', status: 'ออเดอร์ใหม่' },
  { id: '#SBC-1041', customer: 'Narin K.', items: 'อเมริกาโน่เย็น × 2', total: '170 บาท', time: '10:18', status: 'กำลังเตรียม' },
  { id: '#SBC-1040', customer: 'May S.', items: 'มัทฉะลาเต้ × 1', total: '110 บาท', time: '10:12', status: 'พร้อมรับ' },
  { id: '#SBC-1039', customer: 'Beam W.', items: 'ช็อกโกแลตเย็น × 1', total: '100 บาท', time: '10:05', status: 'เสร็จสิ้น' },
];
const statusColor: Record<OrderStatus, { main: string; text: string }> = { 'ออเดอร์ใหม่': { main: '#805637', text: '#fff' }, 'กำลังเตรียม': { main: '#ca7a16', text: '#fff' }, 'พร้อมรับ': { main: '#177245', text: '#fff' }, 'เสร็จสิ้น': { main: '#e8eee9', text: '#3c5b47' } };

export function AdminOrdersPage({ activeBranch }: { activeBranch: IngredientBranch }) {
  const searchRef = useRef<SearchIconHandle>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'ทั้งหมด' | OrderStatus>('ทั้งหมด');
  const [orderStates, setOrderStates] = useState(orders);
  const filtered = useMemo(() => orderStates.filter((order) => (filter === 'ทั้งหมด' || order.status === filter) && `${order.id}${order.customer}`.toLowerCase().includes(query.toLowerCase())), [filter, orderStates, query]);
  const advance = (id: string) => setOrderStates((current) => current.map((order) => order.id !== id ? order : { ...order, status: order.status === 'ออเดอร์ใหม่' ? 'กำลังเตรียม' : order.status === 'กำลังเตรียม' ? 'พร้อมรับ' : 'เสร็จสิ้น' }));
  return <DashboardMain>
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, justifyContent: 'space-between', gap: 1.5, mb: 2 }}><Box><Typography sx={{ color: '#3c2d24', fontFamily: 'Kanit, sans-serif', fontSize: 19, fontWeight: 600 }}>ออเดอร์ {activeBranch}</Typography><Typography sx={{ color: 'text.secondary', fontFamily: 'Kanit, sans-serif', fontSize: 13 }}>จัดการสถานะคำสั่งซื้อของสาขา</Typography></Box><Box sx={{ width: { xs: '100%', lg: 310 } }}><InputAdornment position="start" sx={{ position: 'absolute', zIndex: 1, mt: 1.1, ml: 1.5 }}><SearchIcon ref={searchRef} size={18} /></InputAdornment><input value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => searchRef.current?.startAnimation()} onBlur={() => searchRef.current?.stopAnimation()} placeholder="ค้นหาเลขออเดอร์หรือลูกค้า" style={{ width: '100%', height: 40, padding: '0 14px 0 42px', border: '1px solid #d8c8bd', borderRadius: 12, fontFamily: 'Kanit, sans-serif', boxSizing: 'border-box' }} /></Box></Box>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>{(['ทั้งหมด', 'ออเดอร์ใหม่', 'กำลังเตรียม', 'พร้อมรับ', 'เสร็จสิ้น'] as const).map((item) => <Button key={item} onClick={() => setFilter(item)} size="small" variant={filter === item ? 'contained' : 'outlined'} sx={{ minHeight: 34, borderRadius: '12px', borderColor: '#d8c8bd', bgcolor: filter === item ? '#201914' : '#fff', color: filter === item ? '#fff' : '#5f4b3d', fontFamily: 'Kanit, sans-serif', fontSize: 12, boxShadow: 'none' }}>{item}</Button>)}</Box>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' }, gap: '16px' }}>{filtered.map((order) => <Card key={order.id} variant="outlined" sx={{ borderRadius: '15px', borderColor: '#e8ddd5' }}><Box sx={{ p: 2.5 }}><Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}><Box><Typography sx={{ fontFamily: 'Kanit, sans-serif', fontSize: 18, fontWeight: 600 }}>{order.id}</Typography><Typography sx={{ color: '#805637', fontFamily: 'Kanit, sans-serif', fontSize: 13 }}>{order.customer} · {order.time}</Typography></Box><Chip label={order.status} size="small" sx={{ height: 25, borderRadius: '12px', bgcolor: statusColor[order.status].main, color: statusColor[order.status].text, fontFamily: 'Kanit, sans-serif', fontSize: 11 }} /></Box><Typography sx={{ mt: 2, pt: 1.5, borderTop: '1px solid #eee6e0', color: 'text.secondary', fontFamily: 'Kanit, sans-serif', fontSize: 13 }}>{order.items}</Typography><Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}><Typography sx={{ fontFamily: 'Kanit, sans-serif', fontSize: 16, fontWeight: 600 }}>{order.total}</Typography>{order.status !== 'เสร็จสิ้น' && <Button onClick={() => advance(order.id)} variant="contained" size="small" sx={{ minHeight: 34, borderRadius: '10px', bgcolor: '#201914', fontFamily: 'Kanit, sans-serif', fontSize: 12, boxShadow: 'none', '&:hover': { bgcolor: '#3c2d24', boxShadow: 'none' } }}>{order.status === 'ออเดอร์ใหม่' ? 'รับออเดอร์' : order.status === 'กำลังเตรียม' ? 'พร้อมรับ' : 'ปิดออเดอร์'}</Button>}</Box></Box></Card>)}</Box>
  </DashboardMain>;
}
