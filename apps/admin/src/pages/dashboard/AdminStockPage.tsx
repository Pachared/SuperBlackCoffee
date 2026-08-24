import { useMemo, useRef, useState } from 'react';
import { Box, Button, Card, Chip, InputAdornment, TextField, Typography } from '@mui/material';
import { DashboardMain, INGREDIENT_STATUS_BADGES, PlusIcon, SearchIcon, coffeeIngredientsImage, type IngredientStatus, type PlusIconHandle, type SearchIconHandle } from '@stackbuild/ui';
import { ingredientBranches, type IngredientBranch } from '../../components/sidebar/IngredientBranchesSidebar';

type StockItem = { name: string; amount: string; status: IngredientStatus; position: string };
const stockItems: StockItem[] = [
  { name: 'แก้วกระดาษ 16 oz', amount: 'คงเหลือ 320 ใบ', status: 'พร้อมใช้', position: '15% 50%' },
  { name: 'ฝาแก้วร้อน', amount: 'คงเหลือ 140 ชิ้น', status: 'พร้อมใช้', position: '35% 50%' },
  { name: 'หลอดกระดาษ', amount: 'คงเหลือ 48 ชิ้น', status: 'วัตถุดิบใกล้หมด', position: '55% 50%' },
  { name: 'กล่องพัสดุ S', amount: 'คงเหลือ 80 กล่อง', status: 'พร้อมใช้', position: '75% 50%' },
  { name: 'กล่องพัสดุ M', amount: 'คงเหลือ 12 กล่อง', status: 'วัตถุดิบใกล้หมด', position: '30% 24%' },
  { name: 'ถุงกระดาษหูหิ้ว', amount: 'คงเหลือ 0 ใบ', status: 'วัตถุดิบหมด', position: '65% 76%' },
  { name: 'สติกเกอร์โลโก้', amount: 'คงเหลือ 260 แผ่น', status: 'พร้อมใช้', position: '85% 60%' },
  { name: 'ทิชชู', amount: 'คงเหลือ 18 ห่อ', status: 'วัตถุดิบค้างสต๊อก', position: '50% 85%' },
];
const filters = ['ทั้งหมด', 'ใกล้หมด', 'หมด', 'ค้างสต๊อก'] as const;
type StockFilter = (typeof filters)[number];

export function AdminStockPage({ activeBranch }: { activeBranch: IngredientBranch }) {
  const plusRef = useRef<PlusIconHandle>(null);
  const searchRef = useRef<SearchIconHandle>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<StockFilter>('ทั้งหมด');
  const filteredItems = useMemo(() => stockItems.filter((item) => item.name.includes(query) && (filter === 'ทั้งหมด' || (filter === 'ใกล้หมด' && item.status === 'วัตถุดิบใกล้หมด') || (filter === 'หมด' && item.status === 'วัตถุดิบหมด') || (filter === 'ค้างสต๊อก' && item.status === 'วัตถุดิบค้างสต๊อก'))), [filter, query]);
  const displayedBranches = activeBranch === 'ทุกสาขา' ? ingredientBranches.slice(1) : [activeBranch];
  return <DashboardMain>
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, alignItems: { xs: 'stretch', lg: 'center' }, justifyContent: 'space-between', gap: 1.5, mb: 2 }}><TextField value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => searchRef.current?.startAnimation()} onBlur={() => searchRef.current?.stopAnimation()} placeholder="ค้นหาสต๊อก" size="small" sx={{ width: { xs: '100%', lg: 310 }, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon ref={searchRef} size={18} /></InputAdornment> } }} /><Button variant="contained" startIcon={<PlusIcon ref={plusRef} size={16} />} onMouseEnter={() => plusRef.current?.startAnimation()} onMouseLeave={() => plusRef.current?.stopAnimation()} sx={{ minHeight: 40, borderRadius: '12px', bgcolor: '#201914', fontFamily: 'Kanit, sans-serif', fontWeight: 500, boxShadow: 'none', '&:hover': { bgcolor: '#3c2d24', boxShadow: 'none' } }}>เพิ่มสต๊อก</Button></Box>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>{filters.map((item) => <Button key={item} size="small" variant={filter === item ? 'contained' : 'outlined'} onClick={() => setFilter(item)} sx={{ minHeight: 34, borderRadius: '12px', borderColor: '#d8c8bd', bgcolor: filter === item ? '#201914' : '#fff', color: filter === item ? '#fff' : '#5f4b3d', fontFamily: 'Kanit, sans-serif', fontSize: 12, boxShadow: 'none' }}>{item}</Button>)}</Box>
    <Box sx={{ display: 'grid', gap: 4 }}>{displayedBranches.map((branch, index) => <Box key={branch} sx={index === 0 ? undefined : { position: 'relative', pt: 4, '&::before': { content: '""', position: 'absolute', top: 0, left: '-40px', right: '-40px', borderTop: '1px solid #e8ddd5' } }}>{activeBranch === 'ทุกสาขา' && <Typography sx={{ mb: 1.5, color: '#3c2d24', fontFamily: 'Kanit, sans-serif', fontSize: 19, fontWeight: 600 }}>สาขา {branch}</Typography>}<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' }, gap: '16px' }}>{filteredItems.map((item) => { const badge = INGREDIENT_STATUS_BADGES[item.status]; return <Card key={`${branch}-${item.name}`} variant="outlined" sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: '15px', borderColor: '#e8ddd5' }}><Box sx={{ position: 'relative' }}><Box component="img" src={coffeeIngredientsImage} alt={item.name} loading="lazy" sx={{ display: 'block', width: '100%', aspectRatio: { xs: '1 / 1', md: '4 / 3' }, objectFit: 'cover', objectPosition: item.position }} /><Chip label={item.status} size="small" sx={{ position: 'absolute', top: 12, right: 12, height: 25, borderRadius: '12px', bgcolor: badge.main, color: badge.contrastText, fontFamily: 'Kanit, sans-serif', fontSize: 11 }} /></Box><Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, p: 2.5 }}><Typography sx={{ fontFamily: 'Kanit, sans-serif', fontSize: 18, fontWeight: 500 }}>{item.name}</Typography><Typography sx={{ mt: .6, color: 'text.secondary', fontFamily: 'Kanit, sans-serif', fontSize: 13 }}>{item.amount}</Typography><Box sx={{ display: 'flex', gap: 1, mt: 'auto', pt: 2 }}><Button size="small" variant="contained" sx={{ flex: 1, minHeight: 34, borderRadius: '10px', bgcolor: '#5f4030', fontFamily: 'Kanit, sans-serif', fontSize: 12, boxShadow: 'none', '&:hover': { bgcolor: '#3c2d24', boxShadow: 'none' } }}>รับเข้าสต๊อก</Button><Button size="small" variant="outlined" sx={{ flex: 1, minHeight: 34, borderRadius: '10px', borderColor: '#d8c8bd', color: '#5f4b3d', fontFamily: 'Kanit, sans-serif', fontSize: 12 }}>ปรับยอด</Button></Box></Box></Card>; })}</Box></Box>)}</Box>
    {filteredItems.length === 0 && <Typography sx={{ pt: 4, textAlign: 'center', color: 'text.secondary', fontFamily: 'Kanit, sans-serif' }}>ไม่พบรายการสต๊อกที่ค้นหา</Typography>}
  </DashboardMain>;
}
