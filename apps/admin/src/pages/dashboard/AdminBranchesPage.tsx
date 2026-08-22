import { useRef } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import {
  BRANCH_STATUS_BADGES,
  DashboardMain,
  MapPinPlusInsideIcon,
  SearchIcon,
  type BranchStatus,
  type MapPinPlusInsideIconHandle,
  type SearchIconHandle,
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

export function AdminBranchesPage() {
  const plusIconRef = useRef<MapPinPlusInsideIconHandle>(null);
  const searchIconRef = useRef<SearchIconHandle>(null);

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
          onMouseEnter={() => plusIconRef.current?.startAnimation()}
          onMouseLeave={() => plusIconRef.current?.stopAnimation()}
          sx={{ alignSelf: { xs: 'stretch', sm: 'auto' }, minHeight: 40, borderRadius: '12px', bgcolor: '#201914', fontFamily: 'Kanit, sans-serif', fontWeight: 600, boxShadow: 'none', '&:hover': { bgcolor: '#3c2d24', boxShadow: 'none' } }}
        >
          เพิ่มสาขา
        </Button>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' }, gap: '16px' }}>
        {branches.map((branch) => {
          const statusBadge = BRANCH_STATUS_BADGES[branch.status];
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
                </Box>
              </Box>
            </Card>
          );
        })}
      </Box>
    </DashboardMain>
  );
}
