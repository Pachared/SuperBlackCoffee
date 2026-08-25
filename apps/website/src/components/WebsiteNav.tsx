import { useState, type MouseEvent } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { superBlackLogo } from '@stackbuild/ui';

export function WebsiteNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);
  const scrollToTop = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    closeMenu();
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${window.location.search}`,
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const links = [
    ['เรื่องราว', '#story'],
    ['เมนู', '#menu'],
    ['สาขา', '#stores'],
    ['แฟรนไชส์', '#stores'],
  ];
  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        px: { xs: 1.5, md: 4 },
        pt: { xs: 1.25, md: 2 },
        pointerEvents: 'none',
      }}
    >
      <Box
        component="nav"
        aria-label="เมนูหลัก"
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: 1440,
          minHeight: { xs: 62, md: 68 },
          mx: 'auto',
          px: { xs: 1.5, md: 2 },
          border: '1px solid rgba(223, 209, 199, .86)',
          borderRadius: { xs: '15px', md: '18px' },
          bgcolor: 'rgba(255, 250, 247, .82)',
          boxShadow: '0 10px 30px rgba(48, 31, 20, .08)',
          backdropFilter: 'blur(18px)',
          pointerEvents: 'auto',
        }}
      >
        <Box
          component="a"
          href="/"
          onClick={scrollToTop}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            color: '#201914',
          }}
        >
          <Box
            component="img"
            src={superBlackLogo}
            alt="Super Black Coffee"
            sx={{
              width: { xs: 36, md: 42 },
              height: { xs: 36, md: 42 },
              objectFit: 'contain',
            }}
          />
          <Typography
            sx={{
              fontFamily: 'Inter, sans-serif',
              fontSize: { xs: 9, md: 10 },
              fontWeight: 800,
              letterSpacing: 1.1,
              whiteSpace: 'nowrap',
            }}
          >
            SUPER BLACK COFFEE
          </Typography>
        </Box>
        <Box
          sx={{
            display: { xs: isMenuOpen ? 'flex' : 'none', md: 'flex' },
            position: { xs: 'absolute', md: 'static' },
            top: { xs: 'calc(100% + 8px)', md: 'auto' },
            left: { xs: 0, md: 'auto' },
            right: { xs: 0, md: 'auto' },
            flexDirection: { xs: 'column', md: 'row' },
            gap: 0.25,
            p: { xs: 1, md: 0 },
            border: { xs: '1px solid #e2d2c7', md: 0 },
            borderRadius: { xs: '15px', md: 0 },
            bgcolor: { xs: 'rgba(255, 250, 247, .97)', md: 'transparent' },
            boxShadow: { xs: '0 14px 28px rgba(48, 31, 20, .12)', md: 'none' },
          }}
        >
          {links.map(([label, href]) => (
            <Box
              key={label}
              component="a"
              href={href}
              onClick={closeMenu}
              sx={{
                px: 1.5,
                py: 1,
                borderRadius: '9px',
                color: '#5f4b3d',
                fontSize: 13,
                fontWeight: 500,
                transition: 'color .2s ease, background-color .2s ease',
                '&:hover': { color: '#201914', bgcolor: '#f1e4da' },
              }}
            >
              {label}
            </Box>
          ))}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant="contained"
            href="#stores"
            sx={{
              display: { xs: 'none', sm: 'inline-flex' },
              minHeight: 42,
              borderRadius: '12px',
              px: 2.25,
              bgcolor: '#201914',
              fontFamily: 'Kanit, sans-serif',
              fontSize: 13,
              boxShadow: '0 10px 22px rgba(32, 25, 20, .16)',
              '&:hover': {
                bgcolor: '#3c2d24',
                boxShadow: '0 14px 28px rgba(32, 25, 20, .22)',
              },
            }}
          >
            เยี่ยมชมสาขา
          </Button>
          <Button
            aria-label="เปิดเมนู"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
            sx={{
              display: { xs: 'flex', md: 'none' },
              minWidth: 42,
              width: 42,
              height: 42,
              p: 0,
              borderRadius: '12px',
              bgcolor: '#f1e4da',
              '&:hover': { bgcolor: '#ead9cd' },
            }}
          >
            <Box
              sx={{
                width: 17,
                '&::before, &::after': {
                  content: '""',
                  display: 'block',
                  width: 17,
                  height: 2,
                  my: 0.5,
                  borderRadius: 2,
                  bgcolor: '#201914',
                },
              }}
            />
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
