import type { ReactNode } from 'react';
import { useState } from 'react';
import { Box } from '@mui/material';
import { DashboardSidebar, DashboardTopbar } from '@stackbuild/ui';

type NavigationItem = { label: string; icon: ReactNode };

export function AdminDashboardLayout({
  activePage,
  navigation,
  onNavigate,
  onLogout,
  children,
  pageTitle,
  forceSidebarCollapsed = false,
  secondarySidebar,
}: {
  activePage: string;
  navigation: NavigationItem[];
  onNavigate: (page: string) => void;
  onLogout: () => void;
  children: ReactNode;
  pageTitle?: string;
  forceSidebarCollapsed?: boolean;
  secondarySidebar?: ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const primarySidebarCollapsed = forceSidebarCollapsed || sidebarCollapsed;
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <DashboardSidebar
        activePage={activePage}
        navigation={navigation}
        onNavigate={onNavigate}
        onLogout={onLogout}
        selectedColor="#3c2d24"
        activeBackground="#fbfaf8"
        accentColor="#bf9576"
        collapsed={primarySidebarCollapsed}
        onToggle={() => setSidebarCollapsed((value) => !value)}
        hideToggle={forceSidebarCollapsed}
      />
      {secondarySidebar}
      <DashboardTopbar
        title={pageTitle ?? activePage}
        initials="AP"
        name="Arthit P."
        role="Store manager"
        sidebarWidth={primarySidebarCollapsed ? 96 : 230}
      />
      {children}
    </Box>
  );
}
