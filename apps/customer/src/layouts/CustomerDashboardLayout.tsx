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
}: {
  activePage: string;
  navigation: NavigationItem[];
  onNavigate: (page: string) => void;
  onLogout: () => void;
  children: ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((value) => !value)}
      />
      <DashboardTopbar
        title={activePage}
        initials="NS"
        name="Narin S."
        role="Customer"
        sidebarWidth={sidebarCollapsed ? 96 : 230}
      />
      {children}
    </Box>
  );
}
