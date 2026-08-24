import { useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Drawer,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import {
  BRANCH_STATUS_BADGES,
  DashboardMain,
  MapPinPlusInsideIcon,
  SearchIcon,
  XIcon,
  type BranchStatus,
  type MapPinPlusInsideIconHandle,
  type SearchIconHandle,
  type XIconHandle,
} from '@stackbuild/ui';

type Branch = {
  code: string;
  name: string;
  address: string;
  manager: string;
  phone: string;
  status: BranchStatus;
};

const branches: Branch[] = [
  { code: 'BKK-01', name: 'สยามสแควร์', address: 'สยามสแควร์ ซอย 7, ปทุมวัน', manager: 'Narin S.', phone: '02 658 2410', status: 'เปิดให้บริการ' },
  { code: 'BKK-02', name: 'อโศก', address: 'สุขุมวิท อโศก, วัฒนา', manager: 'May W.', phone: '02 261 4582', status: 'เปิดให้บริการ' },
  { code: 'BKK-03', name: 'อารีย์', address: 'พหลโยธิน 7, พญาไท', manager: 'Krit P.', phone: '02 279 1168', status: 'เปิดให้บริการ' },
  { code: 'BKK-04', name: 'ทองหล่อ', address: 'สุขุมวิท 55, วัฒนา', manager: 'Pim C.', phone: '02 381 9064', status: 'ปิดปรับปรุง' },
  { code: 'BKK-05', name: 'เซ็นทรัลลาดพร้าว', address: 'ชั้น 2 เซ็นทรัลลาดพร้าว, จตุจักร', manager: 'Artit P.', phone: '02 541 1027', status: 'เปิดให้บริการ' },
  { code: 'BKK-06', name: 'สามย่าน', address: 'สามย่านมิตรทาวน์, ปทุมวัน', manager: 'Jane K.', phone: '02 033 7811', status: 'เปิดให้บริการ' },
  { code: 'BKK-07', name: 'เยาวราช', address: 'ถนนเยาวราช, สัมพันธวงศ์', manager: 'Beam T.', phone: '02 222 4193', status: 'เปิดให้บริการ' },
  { code: 'BKK-08', name: 'ไอคอนสยาม', address: 'ชั้น G ไอคอนสยาม, คลองสาน', manager: 'นนท์ ว.', phone: '02 495 7008', status: 'เปิดให้บริการ' },
  { code: 'BKK-09', name: 'เอ็มควอเทียร์', address: 'ชั้น 1 เอ็มควอเทียร์, วัฒนา', manager: 'Mew L.', phone: '02 269 8341', status: 'ปิดปรับปรุง' },
  { code: 'BKK-10', name: 'พระราม 9', address: 'อาคาร G Tower, ห้วยขวาง', manager: 'Tee P.', phone: '02 168 5096', status: 'เปิดให้บริการ' },
  { code: 'BKK-11', name: 'รัชดา', address: 'เดอะสตรีทรัชดา, ดินแดง', manager: 'Fah N.', phone: '02 692 1745', status: 'เปิดให้บริการ' },
  { code: 'BKK-12', name: 'บางนา', address: 'เมกาบางนา, บางพลี', manager: 'Oak J.', phone: '02 105 6492', status: 'เปิดให้บริการ' },
  { code: 'BKK-13', name: 'ศาลาแดง', address: 'สีลมคอมเพล็กซ์, บางรัก', manager: 'Palm R.', phone: '02 231 9805', status: 'ปิดทำการ' },
  { code: 'BKK-14', name: 'จตุจักร', address: 'ตลาดนัดจตุจักร, จตุจักร', manager: 'Game S.', phone: '02 618 3470', status: 'เปิดให้บริการ' },
  { code: 'BKK-15', name: 'ลาดกระบัง', address: 'โรบินสันไลฟ์สไตล์, ลาดกระบัง', manager: 'Aom V.', phone: '02 737 8114', status: 'เปิดให้บริการ' },
  { code: 'BKK-16', name: 'ปิ่นเกล้า', address: 'เซ็นทรัลปิ่นเกล้า, บางกอกน้อย', manager: 'Nina C.', phone: '02 884 2749', status: 'เปิดให้บริการ' },
  { code: 'BKK-17', name: 'บางแค', address: 'เดอะมอลล์ไลฟ์สโตร์ บางแค, ภาษีเจริญ', manager: 'Mark D.', phone: '02 454 6238', status: 'ปิดทำการ' },
  { code: 'BKK-18', name: 'รามอินทรา', address: 'แฟชั่นไอส์แลนด์, คันนายาว', manager: 'พลอย อ.', phone: '02 947 1602', status: 'เปิดให้บริการ' },
  { code: 'BKK-19', name: 'วงเวียนใหญ่', address: 'ถนนสมเด็จพระเจ้าตากสิน, ธนบุรี', manager: 'Boss K.', phone: '02 466 9037', status: 'เปิดให้บริการ' },
  { code: 'BKK-20', name: 'อนุสาวรีย์ชัยฯ', address: 'พหลโยธิน, ราชเทวี', manager: 'Mild P.', phone: '02 245 7891', status: 'เปิดให้บริการ' },
];

const salesPeriods = ['รายชั่วโมง', 'รายวัน', 'รายเดือน'] as const;
type SalesPeriod = (typeof salesPeriods)[number];
const salesData: Record<SalesPeriod, { total: string; change: string; label: string; points: { label: string; value: number }[] }> = {
  รายชั่วโมง: { total: '48,620 บาท', change: '+12.4%', label: 'ยอดขายวันนี้', points: [{ label: '08:00', value: 36 }, { label: '10:00', value: 56 }, { label: '12:00', value: 94 }, { label: '14:00', value: 68 }, { label: '16:00', value: 77 }, { label: '18:00', value: 52 }] },
  รายวัน: { total: '312,840 บาท', change: '+8.6%', label: 'ยอดขายสัปดาห์นี้', points: [{ label: 'จ.', value: 58 }, { label: 'อ.', value: 72 }, { label: 'พ.', value: 64 }, { label: 'พฤ.', value: 88 }, { label: 'ศ.', value: 95 }, { label: 'ส.', value: 77 }, { label: 'อา.', value: 61 }] },
  รายเดือน: { total: '1,284,560 บาท', change: '+15.2%', label: 'ยอดขายปีนี้', points: [{ label: 'มี.ค.', value: 54 }, { label: 'เม.ย.', value: 68 }, { label: 'พ.ค.', value: 62 }, { label: 'มิ.ย.', value: 78 }, { label: 'ก.ค.', value: 85 }, { label: 'ส.ค.', value: 96 }] },
};

const salesMultipliers: Record<SalesPeriod, number> = { รายชั่วโมง: 0.1, รายวัน: 1, รายเดือน: 30 };
const salesPeriodLabels: Record<SalesPeriod, string> = { รายชั่วโมง: 'ยอดขายวันนี้รายชั่วโมง', รายวัน: 'ยอดขายวันนี้', รายเดือน: 'ยอดขายเดือนนี้' };

export function AdminBranchesPage() {
  const plusIconRef = useRef<MapPinPlusInsideIconHandle>(null);
  const searchIconRef = useRef<SearchIconHandle>(null);
  const closeIconRef = useRef<XIconHandle>(null);
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [salesPeriod, setSalesPeriod] = useState<SalesPeriod>('รายวัน');
  const sales = salesData[salesPeriod];
  const salesForBranch = (branch: Branch, index: number) => branch.status === 'เปิดให้บริการ'
    ? Math.round((11_800 + ((index * 1_470) % 8_900)) * salesMultipliers[salesPeriod])
    : 0;
  const totalSales = branches.reduce((sum, branch, index) => sum + salesForBranch(branch, index), 0);

  return (
    <DashboardMain>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', gap: 1.5, mb: 2 }}>
        <TextField
          onFocus={() => searchIconRef.current?.startAnimation()}
          onBlur={() => searchIconRef.current?.stopAnimation()}
          placeholder="ค้นหาสาขา"
          size="small"
          name="branch-search"
          autoComplete="off"
          sx={{ width: { xs: '100%', sm: 310 }, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start" sx={{ alignSelf: 'center', display: 'flex', alignItems: 'center', height: 18 }}><SearchIcon ref={searchIconRef} size={18} /></InputAdornment> } }}
        />
        <Button
          variant="contained"
          startIcon={<MapPinPlusInsideIcon ref={plusIconRef} />}
          onClick={() => setIsAddBranchOpen(true)}
          onMouseEnter={() => plusIconRef.current?.startAnimation()}
          onMouseLeave={() => plusIconRef.current?.stopAnimation()}
          sx={{ alignSelf: { xs: 'stretch', sm: 'auto' }, minHeight: 40, borderRadius: '12px', bgcolor: '#201914', fontFamily: 'Kanit, sans-serif', fontWeight: 600, boxShadow: 'none', '&:hover': { bgcolor: '#3c2d24', boxShadow: 'none' } }}
        >
          เพิ่มสาขา
        </Button>
      </Box>

      <Card variant="outlined" sx={{ mb: 3, p: { xs: 2.25, md: 2.5 }, borderRadius: '15px', borderColor: '#e8ddd5' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'flex-start' }, gap: 2.5 }}>
          <Box><Typography sx={{ color: 'text.secondary', fontFamily: 'Kanit, sans-serif', fontSize: 14 }}>{sales.label}</Typography><Typography sx={{ mt: .25, color: '#201914', fontFamily: 'Kanit, sans-serif', fontSize: { xs: 28, md: 32 }, fontWeight: 700 }}>{totalSales.toLocaleString('th-TH')} บาท</Typography><Typography sx={{ mt: .25, color: '#177245', fontFamily: 'Kanit, sans-serif', fontSize: 13, fontWeight: 600 }}>{sales.change} จากช่วงก่อนหน้า</Typography></Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>{salesPeriods.map((period) => <Button key={period} size="small" variant={salesPeriod === period ? 'contained' : 'outlined'} onClick={() => setSalesPeriod(period)} sx={{ minHeight: 34, borderRadius: '12px', borderColor: '#d8c8bd', bgcolor: salesPeriod === period ? '#201914' : '#fff', color: salesPeriod === period ? '#fff' : '#5f4b3d', fontFamily: 'Kanit, sans-serif', fontSize: 12, boxShadow: 'none', '&:hover': { borderColor: '#201914', bgcolor: salesPeriod === period ? '#3c2d24' : '#f5eee9', boxShadow: 'none' } }}>{period}</Button>)}</Box>
        </Box>
      </Card>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' }, gap: '16px' }}>
        {branches.map((branch, index) => {
          const statusBadge = BRANCH_STATUS_BADGES[branch.status];
          const branchSales = salesForBranch(branch, index);
          return (
            <Card key={branch.code} variant="outlined" sx={{ borderRadius: '15px', borderColor: '#e8ddd5' }}>
              <Box sx={{ p: { xs: 2.25, md: 2.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                  <Box>
                    <Typography sx={{ fontFamily: 'Kanit, sans-serif', fontSize: 19, fontWeight: 600 }}>{branch.name}</Typography>
                    <Typography sx={{ mt: .35, color: '#805637', fontFamily: '"SBC Sans", sans-serif', fontSize: 12, fontWeight: 700, letterSpacing: .5 }}>{branch.code}</Typography>
                  </Box>
                  <Chip label={branch.status} size="small" sx={{ height: 25, borderRadius: '12px', bgcolor: statusBadge.main, color: statusBadge.contrastText, fontFamily: 'Kanit, sans-serif', fontSize: 11, fontWeight: 500 }} />
                </Box>
                <Box sx={{ mt: 2, pt: 1.75, borderTop: '1px solid #eee6e0' }}>
                  <Typography sx={{ color: 'text.secondary', fontFamily: 'Kanit, sans-serif', fontSize: 13 }}>{branch.address}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mt: 1.5 }}>
                    <Typography sx={{ color: 'text.secondary', fontFamily: 'Kanit, sans-serif', fontSize: 12 }}>ผู้จัดการ <Box component="span" sx={{ color: 'text.primary', fontFamily: '"SBC Sans", sans-serif', fontWeight: 600 }}>{branch.manager}</Box></Typography>
                    <Typography sx={{ color: 'text.secondary', fontFamily: '"SBC Sans", sans-serif', fontSize: 12 }}>{branch.phone}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 1, mt: 1.75, pt: 1.5, borderTop: '1px solid #eee6e0' }}>
                    <Typography sx={{ color: 'text.secondary', fontFamily: 'Kanit, sans-serif', fontSize: 12 }}>{salesPeriodLabels[salesPeriod]}</Typography>
                    <Typography sx={{ color: branchSales ? '#805637' : 'text.secondary', fontFamily: 'Kanit, sans-serif', fontSize: 17, fontWeight: 700 }}>{branchSales.toLocaleString('th-TH')} บาท</Typography>
                  </Box>
                </Box>
              </Box>
            </Card>
          );
        })}
      </Box>
      <Drawer anchor="bottom" open={isAddBranchOpen} onClose={() => setIsAddBranchOpen(false)} transitionDuration={{ enter: 360, exit: 280 }} sx={{ zIndex: 1300 }} slotProps={{ paper: { sx: { left: { md: '254px' }, width: { md: 'calc(100% - 278px)' }, minHeight: { sm: 480 }, maxHeight: '82vh', overflowY: 'auto', borderRadius: '24px 24px 0 0', bgcolor: '#fffaf7', boxShadow: '0 -12px 32px rgba(50, 35, 25, .18)' } } }}>
        <Box sx={{ width: '100%', px: { xs: 2.5, sm: 4 }, pt: 1.5, pb: 3.5 }}>
          <Box sx={{ width: 44, height: 5, mx: 'auto', mb: 2.5, borderRadius: 99, bgcolor: '#d8c8bd' }} />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}><Typography sx={{ color: '#201914', fontFamily: 'Kanit, sans-serif', fontSize: 22, fontWeight: 600 }}>เพิ่มสาขา</Typography><Button aria-label="ปิด" onClick={() => setIsAddBranchOpen(false)} onMouseEnter={() => closeIconRef.current?.startAnimation()} onMouseLeave={() => closeIconRef.current?.stopAnimation()} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 40, width: 40, height: 40, p: 0, borderRadius: '12px', bgcolor: '#f7eee8', color: '#5f4b3d', '&:hover': { bgcolor: '#f1e4da' } }}><XIcon ref={closeIconRef} size={20} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 0 }} /></Button></Box>
          <Typography sx={{ mt: .5, color: 'text.secondary', fontFamily: 'Kanit, sans-serif' }}>กรอกข้อมูลเพื่อเพิ่มสาขาใหม่</Typography>
          <Box component="form" onSubmit={(event) => { event.preventDefault(); setIsAddBranchOpen(false); }} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2, mt: 3, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}>
            <TextField required fullWidth label="ชื่อสาขา" placeholder="เช่น สยามสแควร์" />
            <TextField required fullWidth label="รหัสสาขา" placeholder="เช่น BKK-21" />
            <TextField required fullWidth label="ที่อยู่สาขา" placeholder="กรอกรายละเอียดที่อยู่" sx={{ gridColumn: { sm: '1 / -1' } }} />
            <TextField required fullWidth label="ชื่อผู้จัดการ" placeholder="เช่น Narin S." />
            <TextField required fullWidth label="เบอร์โทรศัพท์" type="tel" placeholder="เช่น 02 123 4567" />
            <TextField required select fullWidth label="สถานะ" defaultValue="open"><MenuItem value="open">เปิดให้บริการ</MenuItem><MenuItem value="renovation">ปิดปรับปรุง</MenuItem><MenuItem value="closed">ปิดทำการ</MenuItem></TextField>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.25, mt: 1, gridColumn: { sm: '1 / -1' } }}><Button onClick={() => setIsAddBranchOpen(false)} sx={{ minHeight: 40, borderRadius: '12px', color: '#5f4b3d', fontFamily: 'Kanit, sans-serif' }}>ยกเลิกเพิ่ม</Button><Button type="submit" variant="contained" sx={{ minHeight: 40, borderRadius: '12px', bgcolor: '#201914', fontFamily: 'Kanit, sans-serif', boxShadow: 'none', '&:hover': { bgcolor: '#3c2d24', boxShadow: 'none' } }}>บันทึกสาขา</Button></Box>
          </Box>
        </Box>
      </Drawer>
    </DashboardMain>
  );
}
