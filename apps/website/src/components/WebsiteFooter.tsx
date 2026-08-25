import { Box, Typography } from '@mui/material';
export function WebsiteFooter() {
  return (
    <Box
      component="footer"
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 1.75,
        flexDirection: { xs: 'column', sm: 'row' },
        px: { xs: 3, md: 'clamp(24px, 6vw, 96px)' },
        py: 3.25,
        bgcolor: '#171411',
        color: '#d8c8bd',
      }}
    >
      <Typography
        sx={{ fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: 1 }}
      >
        © 2026 SUPER BLACK COFFEE
      </Typography>
      <Typography
        sx={{ fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: 1 }}
      >
        MADE FOR EVERY MOMENT
      </Typography>
    </Box>
  );
}
