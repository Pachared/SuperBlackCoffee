import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Drawer,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { DashboardMain, PlusIcon, XIcon } from '@stackbuild/ui';

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
    name: 'บริษัท สยาม คอฟฟี่ กรุ๊ป จำกัด',
    branch: 'สาขาสยามสแควร์',
    plan: 'M' as FranchisePlan,
    email: 'siam@superblackcoffee.co.th',
    status: 'ส่งคำเชิญแล้ว',
  },
  {
    name: 'คุณกฤตภาส จันทร์ดี',
    branch: 'สาขารัชดา',
    plan: 'S' as FranchisePlan,
    email: 'kritapas@superblackcoffee.co.th',
    status: 'ใช้งานแล้ว',
  },
];

export function AdminFranchiseBranchesPage() {
  const [selectedPlan, setSelectedPlan] = useState<FranchisePlan>('S');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <DashboardMain>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2.5 }}>
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
      <Typography
        sx={{
          mb: 1.25,
          color: '#3c2d24',
          fontFamily: 'Kanit, sans-serif',
          fontSize: 18,
          fontWeight: 600,
        }}
      >
        เลือกรูปแบบแฟรนไชส์
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
          gap: '16px',
        }}
      >
        {(Object.keys(plans) as FranchisePlan[]).map((planKey) => {
          const plan = plans[planKey];
          const selected = selectedPlan === planKey;
          return (
            <Card
              key={planKey}
              variant="outlined"
              onClick={() => setSelectedPlan(planKey)}
              sx={{
                cursor: 'pointer',
                p: 2.5,
                borderRadius: '16px',
                border: `2px solid ${selected ? plan.color : '#e8ddd5'}`,
                bgcolor: selected ? '#fffaf7' : '#fff',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 1.5,
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      color: plan.color,
                      fontFamily: 'Kanit, sans-serif',
                      fontSize: 28,
                      fontWeight: 800,
                    }}
                  >
                    {planKey}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.25,
                      color: '#201914',
                      fontFamily: 'Kanit, sans-serif',
                      fontSize: 18,
                      fontWeight: 600,
                    }}
                  >
                    {plan.title}
                  </Typography>
                </Box>
                {selected && (
                  <Chip
                    label="เลือกอยู่"
                    size="small"
                    sx={{
                      borderRadius: '10px',
                      bgcolor: plan.color,
                      color: '#fff',
                      fontFamily: 'Kanit, sans-serif',
                      fontWeight: 600,
                    }}
                  />
                )}
              </Box>
              <Typography
                sx={{
                  minHeight: 46,
                  mt: 1,
                  color: 'text.secondary',
                  fontFamily: 'Kanit, sans-serif',
                  fontSize: 13,
                }}
              >
                {plan.subtitle}
              </Typography>
              <Typography
                sx={{
                  mt: 1.25,
                  color: '#5f4030',
                  fontFamily: 'Kanit, sans-serif',
                  fontWeight: 600,
                }}
              >
                {plan.investment}
              </Typography>
              <Divider sx={{ my: 1.75, borderColor: '#eee4de' }} />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {plan.services.map((service) => (
                  <Chip
                    key={service}
                    label={service}
                    size="small"
                    sx={{
                      borderRadius: '9px',
                      bgcolor: '#f7eee8',
                      color: '#5f4b3d',
                      fontFamily: 'Kanit, sans-serif',
                      fontSize: 11,
                    }}
                  />
                ))}
              </Box>
            </Card>
          );
        })}
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          mt: 4,
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
      <Card
        variant="outlined"
        sx={{
          overflow: 'hidden',
          borderRadius: '15px',
          borderColor: '#e8ddd5',
        }}
      >
        {franchisees.map((franchisee, index) => (
          <Box
            key={franchisee.email}
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'minmax(220px, 1.2fr) minmax(160px, .9fr) minmax(200px, 1fr) auto',
              },
              alignItems: 'center',
              gap: { xs: 1, md: 2 },
              px: { xs: 2, md: 2.5 },
              py: 2.1,
              borderTop: index ? '1px solid #eee4de' : 'none',
            }}
          >
            <Box>
              <Typography
                sx={{
                  color: '#201914',
                  fontFamily: 'Kanit, sans-serif',
                  fontSize: 17,
                  fontWeight: 600,
                }}
              >
                {franchisee.name}
              </Typography>
              <Typography
                sx={{
                  mt: 0.15,
                  color: 'text.secondary',
                  fontFamily: 'Kanit, sans-serif',
                  fontSize: 13,
                }}
              >
                {franchisee.branch}
              </Typography>
            </Box>
            <Chip
              label={`แพ็กเกจ ${franchisee.plan}`}
              size="small"
              sx={{
                width: 'fit-content',
                borderRadius: '10px',
                bgcolor: `${plans[franchisee.plan].color}16`,
                color: plans[franchisee.plan].color,
                fontFamily: 'Kanit, sans-serif',
                fontWeight: 700,
              }}
            />
            <Typography
              sx={{
                color: '#5f4b3d',
                fontFamily: 'Inter, Kanit, sans-serif',
                fontSize: 13,
              }}
            >
              {franchisee.email}
            </Typography>
            <Chip
              label={franchisee.status}
              size="small"
              sx={{
                width: 'fit-content',
                borderRadius: '10px',
                bgcolor:
                  franchisee.status === 'ใช้งานแล้ว' ? '#def4e7' : '#f8edd8',
                color:
                  franchisee.status === 'ใช้งานแล้ว' ? '#177245' : '#a76415',
                fontFamily: 'Kanit, sans-serif',
                fontWeight: 600,
              }}
            />
          </Box>
        ))}
      </Card>
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
