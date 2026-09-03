import { useState } from 'react';
import { Box } from '@mui/material';
import {
  DashboardMain,
  DashboardSidebar,
  DashboardTopbar,
  LoginScreen,
  SbcThemeProvider,
} from '@stackbuild/ui';
import {
  EmployeesManagementPage,
  IngredientsManagementPage,
  ProductsManagementPage,
  StockManagementPage,
} from '@stackbuild/management';
import { login } from './api/auth';
import {
  franchiseBranch,
  navigationForPlan,
  type FranchisePlan,
} from './config/navigation';
import { EmptyPage } from './pages/EmptyPage';
import { Overview } from './pages/Overview';

const readPlan = (): FranchisePlan => {
  const value = sessionStorage.getItem('sbc-franchise-plan');
  return value === 'M' || value === 'L' ? value : 'S';
};

export default function App() {
  const [loggedIn, setLoggedIn] = useState(
    () => sessionStorage.getItem('sbc-franchise-session') === 'true',
  );
  const [plan, setPlan] = useState<FranchisePlan>(readPlan);
  const [activePage, setActivePage] = useState(
    () => sessionStorage.getItem('sbc-franchise-active-page') ?? 'ภาพรวม',
  );
  const [collapsed, setCollapsed] = useState(
    () => sessionStorage.getItem('sbc-franchise-sidebar-collapsed') === 'true',
  );
  const logout = () => {
    [
      'sbc-access-token',
      'sbc-franchise-session',
      'sbc-franchise-plan',
      'sbc-franchise-active-page',
      'sbc-franchise-sidebar-collapsed',
    ].forEach((key) => sessionStorage.removeItem(key));
    setLoggedIn(false);
  };
  const navigate = (page: string) => {
    sessionStorage.setItem('sbc-franchise-active-page', page);
    setActivePage(page);
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
            onNavigate={navigate}
            onLogout={logout}
            selectedColor="#3c2d24"
            activeBackground="#fbfaf8"
            accentColor="#bf9576"
            collapsed={collapsed}
            onToggle={() =>
              setCollapsed((value) => {
                const next = !value;
                sessionStorage.setItem(
                  'sbc-franchise-sidebar-collapsed',
                  String(next),
                );
                return next;
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
