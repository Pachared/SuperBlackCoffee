import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Card, Chip, InputAdornment, TextField, Typography } from '@mui/material';
import { DashboardMain, coffeeIngredientsImage, INGREDIENT_STATUS_BADGES, PlusIcon, SearchIcon, type IngredientStatus, type PlusIconHandle, type SearchIconHandle } from '@stackbuild/ui';
import { ingredientBranches, type IngredientBranch } from '../../components/sidebar/IngredientBranchesSidebar';
import { IngredientCardsSkeleton } from '../../components/skeletons/IngredientCardsSkeleton';

type Ingredient = { name: string; amount: string; status: IngredientStatus; imagePosition: string };

const ingredients: Ingredient[] = [
  { name: 'เมล็ดกาแฟ House Blend', amount: 'คงเหลือ 18 กก.', status: 'พร้อมใช้', imagePosition: '12% 50%' },
  { name: 'นมสด', amount: 'คงเหลือ 24 ลิตร', status: 'พร้อมใช้', imagePosition: '34% 50%' },
  { name: 'นมโอ๊ต', amount: 'คงเหลือ 6 ลิตร', status: 'วัตถุดิบใกล้หมด', imagePosition: '55% 50%' },
  { name: 'ไซรัปวานิลลา', amount: 'คงเหลือ 8 ขวด', status: 'พร้อมใช้', imagePosition: '76% 50%' },
  { name: 'ผงมัทฉะ', amount: 'คงเหลือ 0 กก.', status: 'วัตถุดิบหมด', imagePosition: '38% 24%' },
  { name: 'แก้วกระดาษ 16 oz', amount: 'คงเหลือ 320 ใบ', status: 'พร้อมใช้', imagePosition: '85% 60%' },
  { name: 'ซอสคาราเมล', amount: 'คงเหลือ 14 ขวด', status: 'วัตถุดิบค้างสต๊อก', imagePosition: '68% 76%' },
  { name: 'ผงโกโก้', amount: 'คงเหลือ 3 กก.', status: 'วัตถุดิบใกล้หมด', imagePosition: '50% 85%' },
];

const filters = ['ทั้งหมด', 'วัตถุดิบใกล้หมด', 'วัตถุดิบหมด', 'วัตถุดิบค้างสต๊อก'] as const;
type IngredientFilter = (typeof filters)[number];

export function AdminIngredientsPage({ activeBranch }: { activeBranch: IngredientBranch }) {
  const plusIconRef = useRef<PlusIconHandle>(null);
  const searchIconRef = useRef<SearchIconHandle>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<IngredientFilter>('ทั้งหมด');
  const [visibleBranchNames, setVisibleBranchNames] = useState<Set<string>>(() => new Set());
  const [loadedBranchNames, setLoadedBranchNames] = useState<Set<string>>(() => new Set());
  const branchSectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const filteredIngredients = useMemo(() => ingredients.filter((ingredient) => {
    const matchesQuery = ingredient.name.toLowerCase().includes(query.trim().toLowerCase());
    const matchesFilter = filter === 'ทั้งหมด' || ingredient.status === filter;
    return matchesQuery && matchesFilter;
  }), [filter, query]);
  useEffect(() => {
    if (activeBranch !== 'ทุกสาขา') {
      setVisibleBranchNames(new Set([activeBranch]));
      setLoadedBranchNames(new Set([activeBranch]));
      return undefined;
    }
    setVisibleBranchNames(new Set());
    setLoadedBranchNames(new Set());
    const timers = new Map<string, number>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const branch = entry.target.getAttribute('data-branch');
        if (!branch) return;
        setVisibleBranchNames((names) => names.has(branch) ? names : new Set(names).add(branch));
        if (!timers.has(branch)) timers.set(branch, window.setTimeout(() => setLoadedBranchNames((names) => names.has(branch) ? names : new Set(names).add(branch)), branch === ingredientBranches[1] ? 360 : 220));
      });
    }, { rootMargin: '0px 0px -60% 0px' });
    Object.values(branchSectionRefs.current).forEach((section) => section && observer.observe(section));
    return () => {
      observer.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [activeBranch]);
  const displayedBranches = activeBranch === 'ทุกสาขา' ? ingredientBranches.slice(1) : [activeBranch];

  return (
    <DashboardMain>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, alignItems: { xs: 'stretch', lg: 'center' }, justifyContent: 'space-between', gap: 1.5, mb: 2 }}>
        <TextField value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => searchIconRef.current?.startAnimation()} onBlur={() => searchIconRef.current?.stopAnimation()} placeholder="ค้นหาวัตถุดิบ" size="small" name="ingredient-search" autoComplete="off" sx={{ width: { xs: '100%', lg: 310 }, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} slotProps={{ input: { startAdornment: <InputAdornment position="start" sx={{ alignSelf: 'center', display: 'flex', alignItems: 'center', height: 18 }}><SearchIcon ref={searchIconRef} size={18} /></InputAdornment> } }} />
        <Button variant="contained" startIcon={<PlusIcon ref={plusIconRef} size={16} />} onMouseEnter={() => plusIconRef.current?.startAnimation()} onMouseLeave={() => plusIconRef.current?.stopAnimation()} sx={{ minHeight: 40, borderRadius: '12px', bgcolor: '#201914', fontFamily: 'Kanit, sans-serif', fontWeight: 500, boxShadow: 'none', '& .MuiButton-startIcon': { ml: .5, mr: .75 }, '&:hover': { bgcolor: '#3c2d24', boxShadow: 'none' } }}>เพิ่มวัตถุดิบ</Button>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {filters.map((item) => <Button key={item} size="small" variant={filter === item ? 'contained' : 'outlined'} onClick={() => setFilter(item)} sx={{ minHeight: 34, borderRadius: '12px', borderColor: '#d8c8bd', bgcolor: filter === item ? '#201914' : '#fff', color: filter === item ? '#fff' : '#5f4b3d', fontFamily: 'Kanit, sans-serif', fontSize: 12, fontWeight: 500, boxShadow: 'none', '&:hover': { borderColor: '#201914', bgcolor: filter === item ? '#3c2d24' : '#f5eee9', boxShadow: 'none' } }}>{item}</Button>)}
      </Box>
      <Box sx={{ display: 'grid', gap: 4 }}>
        {displayedBranches.map((branch, index) => {
          const isBranchVisible = activeBranch !== 'ทุกสาขา' || visibleBranchNames.has(branch);
          const isBranchLoaded = activeBranch !== 'ทุกสาขา' || loadedBranchNames.has(branch);
          return <Box key={branch} ref={(section: HTMLDivElement | null) => { branchSectionRefs.current[branch] = section; }} data-branch={branch} sx={index === 0 ? undefined : { position: 'relative', pt: 4, '&::before': { content: '""', position: 'absolute', top: 0, left: '-40px', right: '-40px', borderTop: '1px solid #e8ddd5' } }}>
          {activeBranch === 'ทุกสาขา' && <Typography sx={{ mb: 1.5, color: '#3c2d24', fontFamily: 'Kanit, sans-serif', fontSize: 19, fontWeight: 600 }}>สาขา {branch}</Typography>}
          {!isBranchVisible ? <Box sx={{ minHeight: 420 }} /> : !isBranchLoaded ? <IngredientCardsSkeleton count={Math.min(filteredIngredients.length, 5)} /> : <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(5, minmax(0, 1fr))' }, gap: '16px' }}>
        {filteredIngredients.map((ingredient, ingredientIndex) => {
          const statusBadge = INGREDIENT_STATUS_BADGES[ingredient.status];
          return <Card key={`${branch}-${ingredient.name}`} variant="outlined" sx={{ overflow: 'hidden', borderRadius: '15px', borderColor: '#e8ddd5', contentVisibility: { xs: 'visible', xl: ingredientIndex >= 5 ? 'auto' : 'visible' }, containIntrinsicSize: { xl: ingredientIndex >= 5 ? 'auto 430px' : 'auto' } }}>
            <Box component="img" src={coffeeIngredientsImage} alt={ingredient.name} loading="lazy" decoding="async" sx={{ display: 'block', width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', objectPosition: ingredient.imagePosition }} />
            <Box sx={{ p: 2.5 }}><Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}><Typography sx={{ fontFamily: 'Kanit, sans-serif', fontSize: 18, fontWeight: 500 }}>{ingredient.name}</Typography><Chip label={ingredient.status} size="small" sx={{ flexShrink: 0, height: 25, borderRadius: '12px', bgcolor: statusBadge.main, color: statusBadge.contrastText, fontFamily: 'Kanit, sans-serif', fontSize: 11, fontWeight: 500 }} /></Box><Typography sx={{ mt: .6, color: 'text.secondary', fontFamily: 'Kanit, sans-serif', fontSize: 13 }}>{ingredient.amount}</Typography><Box sx={{ display: 'flex', gap: 1, mt: 2 }}><Button size="small" variant="contained" sx={{ flex: 1, minHeight: 34, borderRadius: '10px', bgcolor: '#5f4030', color: '#fff', fontFamily: 'Kanit, sans-serif', fontSize: 12, fontWeight: 500, boxShadow: 'none', '&:hover': { bgcolor: '#3c2d24', boxShadow: 'none' } }}>แก้ไขวัตถุดิบ</Button><Button size="small" variant="contained" color="error" sx={{ flex: 1, minHeight: 34, borderRadius: '10px', fontFamily: 'Kanit, sans-serif', fontSize: 12, fontWeight: 500, boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}>ลบวัตถุดิบ</Button></Box></Box>
          </Card>;
        })}
          </Box>
          </>}
        </Box>;
        })}
      </Box>
      {filteredIngredients.length === 0 && <Typography sx={{ pt: 4, textAlign: 'center', color: 'text.secondary', fontFamily: 'Kanit, sans-serif' }}>ไม่พบวัตถุดิบที่ค้นหา</Typography>}
    </DashboardMain>
  );
}
