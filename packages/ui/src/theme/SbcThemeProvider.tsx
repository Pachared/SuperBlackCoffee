import type { ReactNode } from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

export function SbcThemeProvider({
  children,
  secondary = '#8e5f3c',
  background = '#faf8f5',
}: {
  children: ReactNode;
  secondary?: string;
  background?: string;
}) {
  const theme = createTheme({
    palette: {
      primary: { main: '#171411' },
      secondary: { main: secondary },
      background: { default: background },
    },
    shape: { borderRadius: 20 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: '8px 16px !important',
            minHeight: '40px !important',
            fontFamily: '"SBC Sans", "Kanit", Arial, sans-serif',
            fontSize: '14px !important',
            fontWeight: '400 !important',
            lineHeight: '1.4 !important',
            textTransform: 'none !important',
          },
        },
      },
      MuiButtonBase: {
        styleOverrides: {
          root: { borderRadius: 12 },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 12 },
        },
      },
    },
    typography: {
      fontFamily: '"SBC Sans", "Kanit", Arial, sans-serif',
      h3: {
        fontFamily: '"SBC Sans", "Kanit", Arial, sans-serif',
        fontWeight: 700,
      },
      h4: {
        fontFamily: '"SBC Sans", "Kanit", Arial, sans-serif',
        fontWeight: 700,
      },
      h5: {
        fontFamily: '"SBC Sans", "Kanit", Arial, sans-serif',
        fontWeight: 700,
      },
    },
  });
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
