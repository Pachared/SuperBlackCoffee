import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Card, Chip, Drawer, InputAdornment, MenuItem, TextField, Typography } from '@mui/material';
import { DashboardMain, coffeeIngredientsImage, INGREDIENT_STATUS_BADGES, PlusIcon, SearchIcon, type IngredientStatus, type PlusIconHandle, type SearchIconHandle } from '@stackbuild/ui';
import { IngredientCardsSkeleton } from '../../components/skeletons/IngredientCardsSkeleton';

type Ingredient = { name: string; amount: string; status: IngredientStatus; imagePosition: string };

const ingredients: Ingredient[] = [
  { name: 'เมล็ดกาแฟ House Blend', amount: 'คงเหลือ 18 กก.', status: 'พร้อมใช้', imagePosition: '12% 50%' },
  { name: 'นมสด', amount: 'คงเหลือ 24 ลิตร', status: 'พร้อมใช้', imagePosition: '34% 50%' },
  { name: 'นมโอ๊ต', amount: 'คงเหลือ 6 ลิตร', status: 'วัตถุดิบใกล้หมด', imagePosition: '55% 50%' },
  { name: 'ผงมัทฉะ', amount: 'คงเหลือ 0 กก.', status: 'วัตถุดิบหมด', imagePosition: '38% 24%' },
  { name: 'ไซรัปวานิลลา', amount: 'คงเหลือ 8 ขวด', status: 'วัตถุดิบค้างสต๊อก', imagePosition: '76% 50%' },
  { name: 'โกโก้', amount: 'คงเหลือ 3 กก.', status: 'พร้อมใช้', imagePosition: '50% 85%' },
];

const filters = ['ทั้งหมด', 'วัตถุดิบใกล้หมด', 'วัตถุดิบหมด', 'วัตถุดิบค้างสต๊อก'] as const;
type IngredientFilter = (typeof filters)[number];

export function CustomerIngredientsPage() {
  const plusIconRef = useRef<PlusIconHandle>(null);
  const searchIconRef = useRef<SearchIconHandle>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<IngredientFilter>('ทั้งหมด');
  const [isIngredientsLoaded, setIsIngredientsLoaded] = useState(false);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const filteredIngredients = useMemo(() => ingredients.filter((ingredient) => {
    const matchesQuery = ingredient.name.toLowerCase().includes(query.trim().toLowerCase());
    const matchesFilter = filter === 'ทั้งหมด' || ingredient.status === filter;
    return matchesQuery && matchesFilter;
  }), [filter, query]);
  useEffect(() => {
    const timer = window.setTimeout(() => setIsIngredientsLoaded(true), 220);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <DashboardMain>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, alignItems: { xs: 'stretch', lg: 'center' }, justifyContent: 'space-between', gap: 1.5, mb: 2 }}>
        <TextField value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => searchIconRef.current?.startAnimation()} onBlur={() => searchIconRef.current?.stopAnimation()} placeholder="ค้นหาวัตถุดิบ" size="small" name="customer-ingredient-search" autoComplete="off" sx={{ width: { xs: '100%', lg: 310 }, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} slotProps={{ input: { startAdornment: <InputAdornment position="start" sx={{ alignSelf: 'center', display: 'flex', alignItems: 'center', height: 18 }}><SearchIcon ref={searchIconRef} size={18} /></InputAdornment> } }} />
        <Button variant="contained" startIcon={<PlusIcon ref={plusIconRef} size={16} />} onClick={() => setIsAddDrawerOpen(true)} onMouseEnter={() => plusIconRef.current?.startAnimation()} onMouseLeave={() => plusIconRef.current?.stopAnimation()} sx={{ minHeight: 40, borderRadius: '12px', bgcolor: '#201914', fontFamily: 'Kanit, sans-serif', fontWeight: 500, boxShadow: 'none', '& .MuiButton-startIcon': { ml: .5, mr: .75 }, '&:hover': { bgcolor: '#3c2d24', boxShadow: 'none' } }}>เพิ่มวัตถุดิบ</Button>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {filters.map((item) => <Button key={item} size="small" variant={filter === item ? 'contained' : 'outlined'} onClick={() => setFilter(item)} sx={{ minHeight: 34, borderRadius: '12px', borderColor: '#d8c8bd', bgcolor: filter === item ? '#201914' : '#fff', color: filter === item ? '#fff' : '#5f4b3d', fontFamily: 'Kanit, sans-serif', fontSize: 12, fontWeight: 500, boxShadow: 'none', '&:hover': { borderColor: '#201914', bgcolor: filter === item ? '#3c2d24' : '#f5eee9', boxShadow: 'none' } }}>{item}</Button>)}
      </Box>
      {!isIngredientsLoaded ? <IngredientCardsSkeleton count={Math.min(ingredients.length, 4)} /> : <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' }, gap: '16px' }}>
        {filteredIngredients.map((ingredient) => {
          const statusBadge = INGREDIENT_STATUS_BADGES[ingredient.status];
          return <Card key={ingredient.name} variant="outlined" sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: '15px', borderColor: '#e8ddd5' }}>
            <Box sx={{ position: 'relative' }}><Box component="img" src={coffeeIngredientsImage} alt={ingredient.name} sx={{ display: 'block', width: '100%', aspectRatio: { xs: '1 / 1', md: '4 / 3' }, objectFit: 'cover', objectPosition: ingredient.imagePosition }} /><Chip label={ingredient.status} size="small" sx={{ position: 'absolute', top: 12, right: 12, height: 25, borderRadius: '12px', bgcolor: statusBadge.main, color: statusBadge.contrastText, fontFamily: 'Kanit, sans-serif', fontSize: 11, fontWeight: 500 }} /></Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, p: 2.5 }}><Typography sx={{ fontFamily: 'Kanit, sans-serif', fontSize: 18, fontWeight: 500 }}>{ingredient.name}</Typography><Typography sx={{ mt: .6, color: 'text.secondary', fontFamily: 'Kanit, sans-serif', fontSize: 13 }}>{ingredient.amount}</Typography><Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1, mt: 'auto', pt: 2 }}><Button size="small" variant="contained" sx={{ minHeight: 34, borderRadius: '10px', bgcolor: '#5f4030', color: '#fff', fontFamily: 'Kanit, sans-serif', fontSize: 12, fontWeight: 500, boxShadow: 'none', '&:hover': { bgcolor: '#3c2d24', boxShadow: 'none' } }}>แก้ไขวัตถุดิบ</Button><Button size="small" variant="contained" color="error" sx={{ minHeight: 34, borderRadius: '10px', fontFamily: 'Kanit, sans-serif', fontSize: 12, fontWeight: 500, boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}>ลบวัตถุดิบ</Button><Button size="small" variant="contained" sx={{ gridColumn: '1 / -1', minHeight: 34, borderRadius: '10px', bgcolor: '#201914', fontFamily: 'Kanit, sans-serif', fontSize: 12, fontWeight: 500, boxShadow: 'none', '&:hover': { bgcolor: '#3c2d24', boxShadow: 'none' } }}>สั่งวัตถุดิบ</Button></Box></Box>
          </Card>;
        })}
      </Box>}
      {filteredIngredients.length === 0 && <Typography sx={{ pt: 4, textAlign: 'center', color: 'text.secondary', fontFamily: 'Kanit, sans-serif' }}>ไม่พบวัตถุดิบที่ค้นหา</Typography>}
      <Drawer anchor="bottom" open={isAddDrawerOpen} onClose={() => setIsAddDrawerOpen(false)} transitionDuration={{ enter: 360, exit: 280 }} slotProps={{ paper: { sx: { left: { md: '254px' }, width: { md: 'calc(100% - 278px)' }, minHeight: { sm: 520 }, maxHeight: '82vh', overflowY: 'auto', borderRadius: '24px 24px 0 0', bgcolor: '#fffaf7', boxShadow: '0 -12px 32px rgba(50, 35, 25, .18)' } } }}>
        <Box sx={{ width: 'min(100%, 840px)', mx: 'auto', px: { xs: 2.5, sm: 4 }, pt: 1.5, pb: 3.5 }}>
          <Box sx={{ width: 44, height: 5, mx: 'auto', mb: 2.5, borderRadius: 99, bgcolor: '#d8c8bd' }} />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}><Typography sx={{ color: '#201914', fontFamily: 'Kanit, sans-serif', fontSize: 22, fontWeight: 600 }}>เพิ่มวัตถุดิบ</Typography><Button onClick={() => setIsAddDrawerOpen(false)} sx={{ minWidth: 0, color: '#5f4b3d', fontFamily: 'Kanit, sans-serif' }}>ปิด</Button></Box>
          <Typography sx={{ mt: .5, color: 'text.secondary', fontFamily: 'Kanit, sans-serif' }}>กรอกข้อมูลวัตถุดิบเพื่อเพิ่มเข้าสต๊อก</Typography>
          <Box component="form" onSubmit={(event) => { event.preventDefault(); setIsAddDrawerOpen(false); }} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '200px minmax(0, 1fr)' }, gap: 2.5, mt: 3 }}>
            <Box component="label" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: { xs: 150, md: 250 }, p: 2, border: '1.5px dashed #c9b6a9', borderRadius: '16px', bgcolor: '#f7eee8', color: '#5f4b3d', cursor: 'pointer', transition: 'background-color .2s ease, border-color .2s ease', '&:hover': { bgcolor: '#f1e4da', borderColor: '#805637' } }}><Box sx={{ display: 'grid', placeItems: 'center', width: 44, height: 44, mb: 1, borderRadius: '50%', bgcolor: '#ead9cd', color: '#5f4030', fontSize: 28, lineHeight: 1 }}>+</Box><Typography sx={{ fontFamily: 'Kanit, sans-serif', fontSize: 14, fontWeight: 500, textAlign: 'center' }}>เพิ่มรูปวัตถุดิบ</Typography><Typography sx={{ mt: .25, color: 'text.secondary', fontFamily: 'Kanit, sans-serif', fontSize: 11, textAlign: 'center' }}>JPG, PNG ไม่เกิน 5 MB</Typography><input hidden type="file" accept="image/png,image/jpeg" /></Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
            <TextField required fullWidth label="ชื่อวัตถุดิบ" placeholder="เช่น เมล็ดกาแฟคั่วกลาง" sx={{ gridColumn: { sm: '1 / -1' } }} />
            <TextField required select fullWidth label="หมวดหมู่" defaultValue=""><MenuItem value="" disabled>เลือกหมวดหมู่</MenuItem><MenuItem value="coffee">เมล็ดกาแฟ</MenuItem><MenuItem value="milk">นมและครีม</MenuItem><MenuItem value="syrup">ไซรัปและผงชง</MenuItem><MenuItem value="other">อื่น ๆ</MenuItem></TextField>
            <TextField fullWidth label="จำนวนคงเหลือ" type="number" slotProps={{ htmlInput: { min: 0 } }} />
            <TextField required select fullWidth label="หน่วย" defaultValue="kg"><MenuItem value="kg">กิโลกรัม</MenuItem><MenuItem value="liter">ลิตร</MenuItem><MenuItem value="bottle">ขวด</MenuItem><MenuItem value="piece">ชิ้น</MenuItem></TextField>
            <TextField fullWidth label="แจ้งเตือนเมื่อคงเหลือ" type="number" slotProps={{ htmlInput: { min: 0 } }} />
            <TextField fullWidth label="หมายเหตุ" placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)" sx={{ gridColumn: { sm: '1 / -1' } }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.25, mt: 1, gridColumn: { sm: '1 / -1' } }}><Button onClick={() => setIsAddDrawerOpen(false)} sx={{ color: '#5f4b3d', fontFamily: 'Kanit, sans-serif' }}>ยกเลิก</Button><Button type="submit" variant="contained" sx={{ minHeight: 40, borderRadius: '12px', bgcolor: '#201914', fontFamily: 'Kanit, sans-serif', boxShadow: 'none', '&:hover': { bgcolor: '#3c2d24', boxShadow: 'none' } }}>บันทึกวัตถุดิบ</Button></Box>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </DashboardMain>
  );
}
