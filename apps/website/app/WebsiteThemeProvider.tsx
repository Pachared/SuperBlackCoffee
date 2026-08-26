'use client';

import type { ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: 'var(--font-kanit), sans-serif',
    h1: { fontSize: 'clamp(2.25rem, 4vw, 4.2rem)' },
    h2: { fontSize: 'clamp(2rem, 3.2vw, 3.2rem)' },
    h3: { fontSize: 'clamp(1.7rem, 2.5vw, 2.5rem)' },
    h4: { fontSize: 'clamp(1.35rem, 2vw, 2rem)' },
  },
});

export function WebsiteThemeProvider({ children }: { children: ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
