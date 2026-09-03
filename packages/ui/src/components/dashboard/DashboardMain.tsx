import type { ReactNode } from 'react';
import { Box } from '@mui/material';

export function DashboardMain({ children }: { children: ReactNode }) {
  return (
    <Box
      component="main"
      sx={{
        flex: 1,
        minWidth: 0,
        width: '100%',
        height: 'calc(100vh - 72px)',
        mt: '72px',
        overflowY: 'auto',
        overflowX: 'hidden',
        // The main-content scroll area deliberately begins beneath the fixed
        // Topbar, so its scrollbar never runs through the header.
        scrollbarWidth: 'thin',
        scrollbarColor: '#805637 transparent',
        '&::-webkit-scrollbar': { width: 8 },
        '&::-webkit-scrollbar-thumb': {
          bgcolor: '#805637',
          borderRadius: 99,
        },
        pt: { xs: 2, md: '16px' },
        px: { xs: 2, md: '40px' },
        pb: { xs: 3, md: '40px' },
      }}
    >
      {children}
    </Box>
  );
}
