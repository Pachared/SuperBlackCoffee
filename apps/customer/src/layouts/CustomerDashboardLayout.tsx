import type { ReactNode } from 'react';
import { useState } from 'react';
import { Box } from '@mui/material';
import { DashboardSidebar, DashboardTopbar } from '@stackbuild/ui';

type NavigationItem = { label: string; icon: ReactNode };

export function CustomerDashboardLayout({
  activePage,
  navigation,
  onNavigate,
  onLogout,
  children,
  forceSidebarCollapsed = false,
}: {
  activePage: string;
  navigation: NavigationItem[];
  onNavigate: (page: string) => void;
  onLogout: () => void;
  children: ReactNode;
  forceSidebarCollapsed?: boolean;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isCollapsed = forceSidebarCollapsed || sidebarCollapsed;
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <DashboardSidebar
        activePage={activePage}
        navigation={navigation}
        onNavigate={onNavigate}
        onLogout={onLogout}
        selectedColor="#392b22"
        activeBackground="#faf8f5"
        accentColor="#bd936e"
        collapsed={isCollapsed}
        onToggle={() => setSidebarCollapsed((value) => !value)}
        hideToggle={forceSidebarCollapsed}
      />
      <DashboardTopbar
        title={activePage === 'คำสั่งซื้อ' ? 'ประวัติการสั่งซื้อ' : activePage}
        initials="NS"
        name="Narin S."
        role="Customer"
        sidebarWidth={isCollapsed ? 96 : 230}
      />
      {children}
    </Box>
  );
}
