import { useState } from 'react';
import { Box, Button, Card, Chip, Typography } from '@mui/material';
import {
  BoxIcon,
  BoxesIcon,
  DashboardMain,
  DashboardSidebar,
  DashboardTopbar,
  LayoutGridIcon,
  ReceiptIcon,
  ReceiptTextIcon,
  UsersIcon,
  SbcThemeProvider,
  LoginScreen,
} from '@stackbuild/ui';
import {
  EmployeesManagementPage,
  IngredientsManagementPage,
  ProductsManagementPage,
  StockManagementPage,
} from '../../admin/src/pages/dashboard/management';
import { login } from './api/auth';

const navigation = [
  { label: 'ภาพรวม', icon: <LayoutGridIcon />, group: 'ภาพรวม' },
  { label: 'คำสั่งซื้อ', icon: <ReceiptIcon />, group: 'งานประจำวัน' },
  {
    label: 'เมนูและสินค้า',
    icon: <ReceiptTextIcon />,
    group: 'สินค้าและคลัง',
  },
  { label: 'สต๊อก', icon: <BoxIcon />, group: 'สินค้าและคลัง' },
  { label: 'วัตถุดิบ', icon: <BoxesIcon />, group: 'สินค้าและคลัง' },
  {
    label: 'เอกสารและคำขอ',
    icon: <ReceiptIcon />,
    group: 'เอกสารและการสนับสนุน',
  },
  {
    label: 'คู่มือการดำเนินงาน',
    icon: <BoxIcon />,
    group: 'เอกสารและการสนับสนุน',
  },
  { label: 'พนักงาน', icon: <UsersIcon />, group: 'บุคลากร' },
];

const franchiseBranch = 'อยุธยา' as const;
const navigationForPlan = (plan: 'S' | 'M' | 'L') =>
  navigation.filter((item) => plan === 'L' || item.label !== 'สต๊อก');

export default function App() {
  const [loggedIn, setLoggedIn] = useState(
    () => sessionStorage.getItem('sbc-franchise-session') === 'true',
  );
  const [plan, setPlan] = useState<'S' | 'M' | 'L'>(
    () =>
      (sessionStorage.getItem('sbc-franchise-plan') as 'S' | 'M' | 'L') ?? 'S',
  );
  const [activePage, setActivePage] = useState(
    () => sessionStorage.getItem('sbc-franchise-active-page') ?? 'ภาพรวม',
  );
  const [collapsed, setCollapsed] = useState(
    () => sessionStorage.getItem('sbc-franchise-sidebar-collapsed') === 'true',
  );
  const logout = () => {
    sessionStorage.removeItem('sbc-access-token');
    sessionStorage.removeItem('sbc-franchise-session');
    sessionStorage.removeItem('sbc-franchise-plan');
    sessionStorage.removeItem('sbc-franchise-active-page');
    sessionStorage.removeItem('sbc-franchise-sidebar-collapsed');
    setLoggedIn(false);
  };
  return (
    <SbcThemeProvider secondary="#8f6040" background="#fbfaf8">
      {!loggedIn ? (
        <LoginScreen
          headline="Franchise Portal"
          description="เข้าสู่ระบบเพื่อจัดการแฟรนไชส์ของคุณ"
          submitLabel="เข้าสู่ระบบแฟรนไชส์"
          onSubmit={async (username, password) => {
            const session = await login(username, password);
            if (session.user.role !== 'franchise_owner')
              throw new Error('บัญชีนี้ไม่มีสิทธิ์แฟรนไชส์');
            const accountPlan = session.user.plan ?? 'S';
            sessionStorage.setItem('sbc-access-token', session.accessToken);
            sessionStorage.setItem('sbc-franchise-session', 'true');
            sessionStorage.setItem('sbc-franchise-plan', accountPlan);
            setPlan(accountPlan);
            setLoggedIn(true);
          }}
        />
      ) : (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <DashboardSidebar
            activePage={activePage}
            navigation={navigationForPlan(plan)}
            onNavigate={(page) => {
              sessionStorage.setItem('sbc-franchise-active-page', page);
              setActivePage(page);
            }}
            onLogout={logout}
            selectedColor="#3c2d24"
            activeBackground="#fbfaf8"
            accentColor="#bf9576"
            collapsed={collapsed}
            onToggle={() =>
              setCollapsed((value) => {
                const nextValue = !value;
                sessionStorage.setItem(
                  'sbc-franchise-sidebar-collapsed',
                  String(nextValue),
                );
                return nextValue;
              })
            }
          />
          <DashboardTopbar
            title={activePage}
            initials="FC"
            name="Franchise account"
            role="Franchise partner"
            sidebarWidth={collapsed ? 96 : 230}
          />
          {activePage === 'เมนูและสินค้า' ? (
            <ProductsManagementPage
              activeBranch={franchiseBranch}
              franchisePlan={plan}
            />
          ) : activePage === 'วัตถุดิบ' ? (
            <IngredientsManagementPage activeBranch={franchiseBranch} />
          ) : activePage === 'สต๊อก' ? (
            <StockManagementPage activeBranch={franchiseBranch} />
          ) : activePage === 'พนักงาน' ? (
            <EmployeesManagementPage franchiseMode />
          ) : (
            <DashboardMain>
              {activePage === 'ภาพรวม' ? (
                <Overview />
              ) : (
                <EmptyPage title={activePage} />
              )}
            </DashboardMain>
          )}
        </Box>
      )}
    </SbcThemeProvider>
  );
}

function Overview() {
  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 24, fontWeight: 700 }}>
            ยินดีต้อนรับสู่ Franchise Portal
          </Typography>
          <Typography sx={{ mt: 0.25, color: 'text.secondary' }}>
            พื้นที่จัดการข้อมูลแฟรนไชส์ของคุณ
          </Typography>
        </Box>
        <Chip
          label="บัญชีกำลังรอตั้งค่า"
          sx={{
            borderRadius: '10px',
            bgcolor: '#f8edd8',
            color: '#a76415',
            fontFamily: 'Kanit, sans-serif',
            fontWeight: 600,
          }}
        />
      </Box>
      <Card
        variant="outlined"
        sx={{
          p: { xs: 2.5, md: 4 },
          borderRadius: '16px',
          borderColor: '#e8ddd5',
        }}
      >
        <Typography
          sx={{
            color: '#805637',
            fontFamily: 'Inter, sans-serif',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.5,
          }}
        >
          FRANCHISE ONBOARDING
        </Typography>
        <Typography sx={{ mt: 1, fontSize: 26, fontWeight: 700 }}>
          เริ่มต้นตั้งค่าบัญชีแฟรนไชส์
        </Typography>
        <Typography
          sx={{
            maxWidth: 620,
            mt: 1,
            color: 'text.secondary',
            lineHeight: 1.8,
          }}
        >
          สำนักงานกลางจะกำหนดรูปแบบแฟรนไชส์ บัญชีผู้ใช้งาน
          และสิทธิ์เข้าถึงให้ก่อนเปิดใช้งาน
          คุณสามารถตรวจสอบข้อมูลและส่งคำขอผ่านหน้านี้ได้
        </Typography>
        <Button
          variant="contained"
          sx={{
            mt: 3,
            minHeight: 40,
            borderRadius: '12px',
            bgcolor: '#201914',
            fontFamily: 'Kanit, sans-serif',
            boxShadow: 'none',
            '&:hover': { bgcolor: '#3c2d24', boxShadow: 'none' },
          }}
        >
          ดูข้อมูลแฟรนไชส์
        </Button>
      </Card>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
          gap: 2,
          mt: 2,
        }}
      >
        {[
          ['รูปแบบแฟรนไชส์', 'รอสำนักงานใหญ่กำหนด'],
          ['บัญชีเข้าใช้', 'รอรับคำเชิญ'],
          ['สถานะเปิดใช้งาน', 'ยังไม่เปิดใช้งาน'],
        ].map(([label, value]) => (
          <Card
            key={label}
            variant="outlined"
            sx={{ p: 2.25, borderRadius: '15px', borderColor: '#e8ddd5' }}
          >
            <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
              {label}
            </Typography>
            <Typography sx={{ mt: 0.5, fontSize: 18, fontWeight: 600 }}>
              {value}
            </Typography>
          </Card>
        ))}
      </Box>
    </Box>
  );
}

function EmptyPage({ title }: { title: string }) {
  return (
    <Box
      sx={{
        display: 'grid',
        minHeight: 440,
        placeItems: 'center',
        border: '1px dashed #d8c8bd',
        borderRadius: '16px',
        bgcolor: '#fffaf7',
        textAlign: 'center',
        p: 3,
      }}
    >
      <Box>
        <Typography sx={{ fontSize: 23, fontWeight: 700 }}>{title}</Typography>
        <Typography sx={{ mt: 0.5, color: 'text.secondary' }}>
          ส่วนนี้พร้อมสำหรับตั้งค่าจากสำนักงานใหญ่
        </Typography>
      </Box>
    </Box>
  );
}
