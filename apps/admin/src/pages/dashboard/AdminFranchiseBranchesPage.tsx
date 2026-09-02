import { useMemo, useRef, useState } from 'react';
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
  DashboardMain,
  PlusIcon,
  SearchIcon,
  XIcon,
  type SearchIconHandle,
} from '@stackbuild/ui';

type FranchisePlan = 'S' | 'M' | 'L';

const plans: Record<
  FranchisePlan,
  {
    title: string;
    subtitle: string;
    investment: string;
    services: string[];
    color: string;
  }
> = {
  S: {
    title: 'S — Smart Café',
    subtitle: 'เริ่มต้นง่าย สำหรับพื้นที่ขนาดกะทัดรัด',
    investment: 'ลงทุนโดยประมาณ 1.5 – 2.5 ล้านบาท',
    services: ['Coffee & Beverage'],
    color: '#3d7c2b',
  },
  M: {
    title: 'M — Lifestyle Café',
    subtitle: 'ร้านกาแฟพร้อมบริการเสริมสำหรับทำเลศักยภาพ',
    investment: 'ลงทุนโดยประมาณ 3.5 – 5 ล้านบาท',
    services: ['Coffee & Beverage', 'Food & Bakery', 'BPOST65 Express'],
    color: '#9b6916',
  },
  L: {
    title: 'L — Lifestyle Hub',
    subtitle: 'ศูนย์รวมบริการครบวงจรสำหรับพื้นที่ขนาดใหญ่',
    investment: 'ลงทุนโดยประมาณ 7 – 10 ล้านบาทขึ้นไป',
    services: [
      'Coffee & Beverage',
      'Food & Bakery',
      'BPOST65 Express',
      'EV Charging',
      'Mobile Café',
    ],
    color: '#b12a22',
  },
};

const franchisees = [
  {
    name: 'คุณกฤตภาส จันทร์ดี',
    branch: 'สาขารัชดา',
    plan: 'S' as FranchisePlan,
    email: 'kritapas@superblackcoffee.co.th',
    status: 'ใช้งานแล้ว',
  },
];

export function AdminFranchiseBranchesPage() {
  const searchIconRef = useRef<SearchIconHandle>(null);
  const [selectedPlan, setSelectedPlan] = useState<FranchisePlan>('S');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [query, setQuery] = useState('');
  const visibleFranchisees = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('th-TH');
    if (!normalizedQuery) return franchisees;
    return franchisees.filter((franchisee) =>
      `${franchisee.name} ${franchisee.branch} ${franchisee.email}`
        .toLocaleLowerCase('th-TH')
        .includes(normalizedQuery),
    );
  }, [query]);

  return (
    <DashboardMain>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <TextField
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => searchIconRef.current?.startAnimation()}
          onBlur={() => searchIconRef.current?.stopAnimation()}
          placeholder="ค้นหาสาขาแฟรนไชส์"
          size="small"
          name="franchise-branch-search"
          autoComplete="off"
          sx={{
            width: { xs: '100%', sm: 310 },
            '& .MuiOutlinedInput-root': { borderRadius: '12px' },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment
                  position="start"
                  sx={{
                    alignSelf: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    height: 18,
                  }}
                >
                  <SearchIcon ref={searchIconRef} size={18} />
                </InputAdornment>
              ),
            },
          }}
        />
        <Button
          variant="contained"
          startIcon={<PlusIcon size={16} />}
          onClick={() => setIsDrawerOpen(true)}
          sx={{
            minHeight: 40,
            borderRadius: '12px',
            bgcolor: '#201914',
            fontFamily: 'Kanit, sans-serif',
            fontWeight: 500,
            boxShadow: 'none',
            '&:hover': { bgcolor: '#3c2d24', boxShadow: 'none' },
          }}
        >
          เพิ่มบัญชีแฟรนไชส์
        </Button>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          mt: 1.5,
          mb: 1.25,
        }}
      >
        <Typography
          sx={{
            color: '#3c2d24',
            fontFamily: 'Kanit, sans-serif',
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          บัญชีแฟรนไชส์
        </Typography>
        <Typography
          sx={{
            color: 'text.secondary',
            fontFamily: 'Kanit, sans-serif',
            fontSize: 13,
          }}
        >
          แสดงเฉพาะข้อมูลสำหรับเข้าใช้ระบบ
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(4, minmax(0, 1fr))',
          },
          gap: '16px',
        }}
      >
        {visibleFranchisees.map((franchisee) => (
          <Card
            key={franchisee.email}
            variant="outlined"
            sx={{ borderRadius: '15px', borderColor: '#e8ddd5' }}
          >
            <Box sx={{ p: { xs: 2.25, md: 2.5 } }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 1,
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      color: '#201914',
                      fontFamily: 'Kanit, sans-serif',
                      fontSize: 19,
                      fontWeight: 600,
                    }}
                  >
                    {franchisee.name}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.35,
                      color: '#805637',
                      fontFamily: 'Kanit, sans-serif',
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {franchisee.branch}
                  </Typography>
                </Box>
                <Chip
                  label={franchisee.status}
                  size="small"
                  sx={{
                    height: 25,
                    borderRadius: '12px',
                    bgcolor:
                      franchisee.status === 'ใช้งานแล้ว'
                        ? '#def4e7'
                        : '#f8edd8',
                    color:
                      franchisee.status === 'ใช้งานแล้ว'
                        ? '#177245'
                        : '#a76415',
                    fontFamily: 'Kanit, sans-serif',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />
              </Box>
              <Box sx={{ mt: 2, pt: 1.75, borderTop: '1px solid #eee6e0' }}>
                <Chip
                  label={`แพ็กเกจ ${franchisee.plan}`}
                  size="small"
                  sx={{
                    height: 25,
                    borderRadius: '12px',
                    bgcolor: `${plans[franchisee.plan].color}16`,
                    color: plans[franchisee.plan].color,
                    fontFamily: 'Kanit, sans-serif',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                />
                <Typography
                  sx={{
                    mt: 1.1,
                    color: 'text.secondary',
                    fontFamily: 'Inter, Kanit, sans-serif',
                    fontSize: 12,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {franchisee.email}
                </Typography>
              </Box>
            </Box>
          </Card>
        ))}
      </Box>
      {visibleFranchisees.length === 0 && (
        <Typography
          sx={{
            pt: 4,
            textAlign: 'center',
            color: 'text.secondary',
            fontFamily: 'Kanit, sans-serif',
          }}
        >
          ไม่พบข้อมูลสาขาแฟรนไชส์
        </Typography>
      )}
      <Drawer
        anchor="bottom"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        transitionDuration={{ enter: 360, exit: 280 }}
        slotProps={{
          paper: {
            sx: {
              left: { md: '254px' },
              width: { md: 'calc(100% - 278px)' },
              minHeight: { sm: 460 },
              maxHeight: '82vh',
              overflowY: 'auto',
              borderRadius: '24px 24px 0 0',
              bgcolor: '#fffaf7',
              boxShadow: '0 -12px 32px rgba(50, 35, 25, .18)',
            },
          },
        }}
      >
        <Box
          component="form"
          onSubmit={(event) => {
            event.preventDefault();
            setIsDrawerOpen(false);
          }}
          sx={{
            width: '100%',
            px: { xs: 2.5, sm: 4 },
            pt: 1.5,
            pb: 3.5,
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              bgcolor: '#fff',
            },
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 5,
              mx: 'auto',
              mb: 2.5,
              borderRadius: 99,
              bgcolor: '#d8c8bd',
            }}
          />
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box>
              <Typography
                sx={{
                  color: '#201914',
                  fontFamily: 'Kanit, sans-serif',
                  fontSize: 22,
                  fontWeight: 600,
                }}
              >
                เพิ่มบัญชีแฟรนไชส์
              </Typography>
              <Typography
                sx={{
                  mt: 0.25,
                  color: 'text.secondary',
                  fontFamily: 'Kanit, sans-serif',
                  fontSize: 14,
                }}
              >
                ระบบจะส่งลิงก์ตั้งรหัสผ่านไปยังอีเมลผู้ซื้อแฟรนไชส์
              </Typography>
            </Box>
            <Button
              aria-label="ปิด"
              onClick={() => setIsDrawerOpen(false)}
              sx={{
                minWidth: 40,
                width: 40,
                height: 40,
                p: 0,
                borderRadius: '12px',
                bgcolor: '#f7eee8',
                color: '#5f4b3d',
                '&:hover': { bgcolor: '#f1e4da' },
              }}
            >
              <XIcon size={20} />
            </Button>
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
              },
              gap: 2,
              mt: 3,
            }}
          >
            <TextField
              required
              label="ชื่อผู้ซื้อแฟรนไชส์ / บริษัท"
              fullWidth
            />
            <TextField required label="ชื่อสาขา" fullWidth />
            <TextField
              required
              label="อีเมลสำหรับเข้าใช้ระบบ"
              type="email"
              fullWidth
            />
            <TextField
              required
              select
              label="รูปแบบแฟรนไชส์"
              defaultValue={selectedPlan}
              fullWidth
              onChange={(event) =>
                setSelectedPlan(event.target.value as FranchisePlan)
              }
            >
              {(Object.keys(plans) as FranchisePlan[]).map((plan) => (
                <MenuItem key={plan} value={plan}>
                  {plans[plan].title}
                </MenuItem>
              ))}
            </TextField>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 1.25,
                mt: 1,
                gridColumn: { sm: '1 / -1' },
              }}
            >
              <Button
                onClick={() => setIsDrawerOpen(false)}
                sx={{
                  minHeight: 40,
                  borderRadius: '12px',
                  color: '#5f4b3d',
                  fontFamily: 'Kanit, sans-serif',
                }}
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  minHeight: 40,
                  borderRadius: '12px',
                  bgcolor: '#201914',
                  fontFamily: 'Kanit, sans-serif',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#3c2d24', boxShadow: 'none' },
                }}
              >
                สร้างและส่งคำเชิญ
              </Button>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </DashboardMain>
  );
}
