import type { ReactNode } from 'react';
import { Box } from '@mui/material';

export function DashboardMain({ children }: { children: ReactNode }) {
  return (
    <Box
      component="main"
      sx={{
        flex: 1,
        width: '100%',
        pt: { xs: 11, md: '88px' },
        px: { xs: 2, md: '40px' },
        pb: { xs: 3, md: '40px' },
      }}
    >
      {children}
    </Box>
  );
}
