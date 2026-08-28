import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, Chip, Divider, TextField, Typography } from '@mui/material';
import { DashboardMain, coffeeIngredientsImage, formatCurrency } from '@stackbuild/ui';
import { createPOSOrder, listMenuItems } from '../../lib/api';

type MenuItem = { id: string; name: string; category: string; storePrice: number; linemanPrice: number; status: 'available' | 'soldout'; position: string; imageUrl: string };

function posCategory(name: string, category: string) {
  if (name.includes('อะโวคาโด')) return 'เมนูอโวคาโด';
  if (name.includes('โซดา')) return 'เมนูโซดา';
  if (name.includes('ปั่น')) return 'เมนูปั่น';
  if (name.includes('ร้อน')) return category.includes('ชา') ? 'เมนูชาร้อน' : 'เมนูร้อน';
  if (category === 'กาแฟ') return 'เมนูกาแฟเย็น';
  if (category === 'ชาและมัทฉะ') return 'เมนูชา';
  return category;
}

export function PosOverviewPage() {
  const [category, setCategory] = useState('ทั้งหมด');
  const [salesChannel, setSalesChannel] = useState<'หน้าร้าน' | 'LINE MAN'>('หน้าร้าน');
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [orderError, setOrderError] = useState('');
  const categories = useMemo(() => ['ทั้งหมด', ...Array.from(new Set(menu.map((item) => item.category)))], [menu]);
  const visibleMenu = useMemo(() => menu.filter((item) => item.status === 'available' && (category === 'ทั้งหมด' || item.category === category) && item.name.includes(deferredQuery)), [category, deferredQuery, menu]);
  const cartItems = menu.filter((item) => cart[item.id]);
  const priceFor = (item: MenuItem) => salesChannel === 'LINE MAN' ? item.linemanPrice : item.storePrice;
  const total = cartItems.reduce((sum, item) => sum + priceFor(item) * cart[item.id], 0);
  useEffect(() => {
    let active = true;
    listMenuItems().then((items) => {
      if (!active) return;
      setMenu(items.map((item, index) => ({ id: String(item.id), name: item.name, category: posCategory(item.name, item.category), storePrice: item.storePrice, linemanPrice: item.linemanPrice, status: item.status, imageUrl: item.imageUrl, position: `${12 + ((index * 21) % 76)}% ${24 + ((index * 17) % 64)}%` })));
    }).catch((error: Error) => { if (active) setOrderError(error.message); }).finally(() => { if (active) setIsLoadingMenu(false); });
    return () => { active = false; };
  }, []);
  const submitOrder = async () => {
    try {
      setOrderError('');
      await createPOSOrder(salesChannel === 'หน้าร้าน' ? 'storefront' : 'lineman', cartItems.map((item) => ({ productName: item.name, quantity: cart[item.id], unitPrice: priceFor(item) })));
      setCart({});
      window.alert('บันทึกคำสั่งซื้อเรียบร้อยแล้ว และตัดสต๊อกตามสูตรแล้ว');
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : 'ไม่สามารถบันทึกคำสั่งซื้อได้');
    }
  };
  const updateQuantity = (id: string, amount: number) => setCart((current) => { const next = Math.max(0, (current[id] ?? 0) + amount); const copy = { ...current }; if (next) copy[id] = next; else delete copy[id]; return copy; });

  return <DashboardMain><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 340px' }, gap: '16px', alignItems: 'start' }}>
    <Box>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 1.5, mb: 1.5, px: 1.5, py: 1.25, border: '1px solid #e2d2c7', borderRadius: '15px', bgcolor: '#fffaf7' }}>
        <Box><Typography sx={{ color: '#201914', fontFamily: 'Kanit, sans-serif', fontSize: 15, fontWeight: 600 }}>ช่องทางการขาย</Typography><Typography sx={{ mt: .1, color: 'text.secondary', fontFamily: 'Kanit, sans-serif', fontSize: 11 }}>เลือกราคาให้ตรงกับช่องทางก่อนรับออเดอร์</Typography></Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: .75, width: { xs: '100%', sm: 248 } }}>{(['หน้าร้าน', 'LINE MAN'] as const).map((channel) => { const selected = salesChannel === channel; const lineMan = channel === 'LINE MAN'; return <Button key={channel} onClick={() => setSalesChannel(channel)} variant={selected ? 'contained' : 'outlined'} sx={{ minHeight: 42, borderRadius: '11px', borderColor: selected ? (lineMan ? '#06C755' : '#201914') : '#d8c8bd', bgcolor: selected ? (lineMan ? '#06C755' : '#201914') : '#fff', color: selected ? '#fff' : '#5f4b3d', fontFamily: 'Kanit, sans-serif', fontSize: 13, fontWeight: 600, boxShadow: 'none', '&:hover': { borderColor: lineMan ? '#06C755' : '#201914', bgcolor: selected ? (lineMan ? '#05B64F' : '#3c2d24') : '#f5eee9', boxShadow: 'none' } }}>{channel}</Button>; })}</Box>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, justifyContent: 'space-between', alignItems: { lg: 'center' }, gap: 1.5, mb: 2 }}><Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>{categories.map((item) => <Button key={item} onClick={() => setCategory(item)} size="small" variant={category === item ? 'contained' : 'outlined'} sx={{ minHeight: 34, borderRadius: '12px', borderColor: '#d8c8bd', bgcolor: category === item ? '#201914' : '#fff', color: category === item ? '#fff' : '#5f4b3d', fontFamily: 'Kanit, sans-serif', fontSize: 12, boxShadow: 'none' }}>{item}</Button>)}</Box><TextField value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาเมนู" size="small" sx={{ width: { xs: '100%', lg: 250 }, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} /></Box>
      {orderError && <Typography sx={{ mb: 1.5, color: 'error.main', fontFamily: 'Kanit, sans-serif', fontSize: 13 }}>{orderError}</Typography>}
      {isLoadingMenu ? <Typography sx={{ py: 6, textAlign: 'center', color: 'text.secondary', fontFamily: 'Kanit, sans-serif' }}>กำลังโหลดเมนู…</Typography> : <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' }, gap: '16px' }}>{visibleMenu.map((item) => <Card key={item.id} variant="outlined" onClick={() => updateQuantity(item.id, 1)} sx={{ overflow: 'hidden', borderRadius: '15px', borderColor: '#e8ddd5', cursor: 'pointer', transition: 'border-color .18s ease', '&:hover': { borderColor: '#805637' } }}><Box component="img" src={item.imageUrl || coffeeIngredientsImage} alt={item.name} sx={{ display: 'block', width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', objectPosition: item.position }} /><Box sx={{ p: 1.75 }}><Typography sx={{ fontFamily: 'Kanit, sans-serif', fontSize: 16, fontWeight: 600 }}>{item.name}</Typography><Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: .5 }}><Typography sx={{ color: 'text.secondary', fontFamily: 'Kanit, sans-serif', fontSize: 12 }}>{item.category}</Typography><Typography sx={{ color: '#805637', fontFamily: 'Kanit, sans-serif', fontSize: 14, fontWeight: 600 }}>{formatCurrency(priceFor(item))}</Typography></Box></Box></Card>)}</Box>}
    </Box>
    <Card variant="outlined" sx={{ position: { xs: 'static', lg: 'fixed' }, top: { lg: 88 }, right: { lg: 40 }, width: { lg: 340 }, height: { lg: 'calc(100vh - 128px)' }, display: 'flex', flexDirection: 'column', alignSelf: 'start', zIndex: { lg: 1 }, borderRadius: '15px', borderColor: '#e8ddd5', overflow: 'hidden' }}><Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, p: 2.5, bgcolor: '#201914', color: '#fff' }}><Box><Typography sx={{ fontFamily: 'Kanit, sans-serif', fontSize: 19, fontWeight: 600 }}>ตะกร้าคำสั่งซื้อ</Typography><Typography sx={{ mt: .1, color: 'rgba(255,255,255,.7)', fontFamily: 'Kanit, sans-serif', fontSize: 11 }}>{salesChannel === 'หน้าร้าน' ? 'ขายหน้าร้าน' : 'ขายผ่าน LINE MAN'}</Typography></Box><Chip label={`${cartItems.length} รายการ`} size="small" sx={{ height: 25, borderRadius: '10px', bgcolor: 'rgba(255,255,255,.14)', color: '#fff', fontFamily: 'Kanit, sans-serif' }} /></Box><Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, p: 2.5 }}>
      {cartItems.length === 0 ? <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}><Typography sx={{ color: 'text.secondary', fontFamily: 'Kanit, sans-serif' }}>ยังไม่มีรายการในตะกร้า</Typography><Typography sx={{ mt: .5, color: 'text.secondary', fontFamily: 'Kanit, sans-serif', fontSize: 12 }}>เลือกเมนูจากด้านซ้ายเพื่อเริ่มออเดอร์</Typography></Box> : <Box>{cartItems.map((item) => <Box key={item.id} sx={{ py: 1.25, display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 1, borderBottom: '1px solid #eee6e0' }}><Box><Typography sx={{ fontFamily: 'Kanit, sans-serif', fontSize: 14, fontWeight: 600 }}>{item.name}</Typography><Typography sx={{ color: 'text.secondary', fontFamily: 'Kanit, sans-serif', fontSize: 12 }}>{formatCurrency(priceFor(item))}</Typography></Box><Box sx={{ display: 'flex', alignItems: 'center', gap: .5 }}><Button onClick={() => updateQuantity(item.id, -1)} sx={{ minWidth: 28, width: 28, height: 28, p: 0, borderRadius: '8px', bgcolor: '#f3ebe5', color: '#5f4b3d' }}>−</Button><Typography sx={{ minWidth: 18, textAlign: 'center', fontFamily: 'Kanit, sans-serif' }}>{cart[item.id]}</Typography><Button onClick={() => updateQuantity(item.id, 1)} sx={{ minWidth: 28, width: 28, height: 28, p: 0, borderRadius: '8px', bgcolor: '#201914', color: '#fff' }}>+</Button></Box></Box>)}</Box>}<Box sx={{ mt: 'auto' }}><Divider sx={{ my: 2 }} /><Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography sx={{ fontFamily: 'Kanit, sans-serif', fontSize: 17, fontWeight: 600 }}>รวมทั้งหมด</Typography><Typography sx={{ color: '#805637', fontFamily: 'Kanit, sans-serif', fontSize: 19, fontWeight: 700 }}>{formatCurrency(total)}</Typography></Box><Button onClick={submitOrder} disabled={!cartItems.length} fullWidth variant="contained" sx={{ mt: 2.5, minHeight: 44, borderRadius: '12px', bgcolor: '#201914', fontFamily: 'Kanit, sans-serif', fontWeight: 600, boxShadow: 'none', '&:hover': { bgcolor: '#3c2d24', boxShadow: 'none' } }}>ดำเนินการชำระเงิน</Button></Box></Box>
    </Card>
  </Box></DashboardMain>;
}
