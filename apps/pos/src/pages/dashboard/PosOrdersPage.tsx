import { useEffect, useState } from 'react';
import { Box, Card, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { DashboardMain, formatDate } from '@stackbuild/ui';
import { listStockRequests } from '../../lib/api';

type SupplyOrder = { id: string; date: string; status: 'จัดส่งแล้ว' | 'กำลังจัดเตรียม' | 'รับเข้าแล้ว'; items: { name: string; quantity: string }[] };

const statusStyles = {
  'จัดส่งแล้ว': { bgcolor: '#e9f1fa', color: '#276a9c' },
  'กำลังจัดเตรียม': { bgcolor: '#fff2df', color: '#a85a0a' },
  'รับเข้าแล้ว': { bgcolor: '#e8eee9', color: '#3c5b47' },
};

export function PosOrdersPage() {
  const [supplyOrders, setSupplyOrders] = useState<SupplyOrder[]>([]);
  useEffect(() => {
    let active = true;
    listStockRequests().then((requests) => {
      if (!active) return;
      const statusMap: Record<string, SupplyOrder['status']> = { pending: 'กำลังจัดเตรียม', approved: 'กำลังจัดเตรียม', preparing: 'กำลังจัดเตรียม', completed: 'รับเข้าแล้ว' };
      setSupplyOrders(requests.map((request) => ({ id: `REQ-${request.id}`, date: formatDate(request.createdAt), status: statusMap[request.status] ?? 'จัดส่งแล้ว', items: request.items.map((item) => ({ name: item.name, quantity: `${item.quantity} ${item.unit}` })) })));
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);
  return <DashboardMain>
    <Card variant="outlined" sx={{ overflow: 'hidden', borderRadius: '15px', borderColor: '#e8ddd5' }}><TableContainer><Table sx={{ minWidth: 700 }}><TableHead><TableRow sx={{ bgcolor: '#f8f0eb' }}><TableCell sx={{ width: 150, fontFamily: 'Kanit, sans-serif', fontWeight: 600 }}>เลขคำขอ</TableCell><TableCell sx={{ fontFamily: 'Kanit, sans-serif', fontWeight: 600 }}>รายการที่สั่ง</TableCell><TableCell sx={{ width: 180, fontFamily: 'Kanit, sans-serif', fontWeight: 600 }}>วันที่สั่ง</TableCell><TableCell align="right" sx={{ width: 140, fontFamily: 'Kanit, sans-serif', fontWeight: 600 }}>สถานะ</TableCell></TableRow></TableHead><TableBody>{supplyOrders.map((order) => <TableRow key={order.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}><TableCell sx={{ color: '#805637', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700 }}>{order.id}</TableCell><TableCell sx={{ py: 1.5 }}><Box sx={{ display: 'grid', gap: .5 }}>{order.items.map((item) => <Box key={item.name} sx={{ display: 'flex', justifyContent: 'space-between', gap: 3, maxWidth: 420 }}><Typography sx={{ fontFamily: 'Kanit, sans-serif', fontSize: 13 }}>{item.name}</Typography><Typography sx={{ flexShrink: 0, color: '#805637', fontFamily: 'Kanit, sans-serif', fontSize: 13, fontWeight: 600 }}>{item.quantity}</Typography></Box>)}</Box></TableCell><TableCell sx={{ color: 'text.secondary', fontFamily: 'Kanit, sans-serif', fontSize: 13 }}>{order.date}</TableCell><TableCell align="right"><Chip label={order.status} size="small" sx={{ height: 26, borderRadius: '10px', ...statusStyles[order.status], fontFamily: 'Kanit, sans-serif', fontSize: 11, fontWeight: 600 }} /></TableCell></TableRow>)}</TableBody></Table></TableContainer></Card>
  </DashboardMain>;
}
