'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Box, Button, Drawer, IconButton, Stack } from '@mui/material';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const links = [
  ['หน้าหลัก', '/'], ['เกี่ยวกับเรา', '/about'], ['เมนู', '/menu'], ['สาขา', '/branches'], ['แฟรนไชส์', '/franchise'], ['ติดต่อเรา', '/contact'],
];

function MenuToggle({ open }: { open: boolean }) {
  return <Box aria-hidden sx={{ width: 22, display: 'grid', gap: .55 }}>
    {[0, 1, 2].map((line) => <Box key={line} sx={{ height: 1.5, borderRadius: 2, bgcolor: '#fff', transform: open ? line === 0 ? 'translateY(6px) rotate(45deg)' : line === 2 ? 'translateY(-6px) rotate(-45deg)' : 'scaleX(0)' : 'none', transition: 'transform .2s ease' }} />)}
  </Box>;
}

export function WebsiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));
  const navLink = (label: string, href: string, mobile = false) => <Button key={href} component={Link} href={href} onClick={() => setOpen(false)} aria-current={isActive(href) ? 'page' : undefined} sx={{ justifyContent: mobile ? 'flex-start' : 'center', minHeight: mobile ? 52 : 40, px: mobile ? 0 : { md: 1.25, lg: 1.5 }, borderRadius: mobile ? 0 : 999, color: isActive(href) ? '#d09a3f' : mobile ? '#171411' : '#e9e1d9', fontSize: mobile ? '1.1rem' : 14, fontWeight: 500, '&:hover': { color: '#d09a3f', bgcolor: mobile ? 'transparent' : 'rgba(208,154,63,.12)' } }}>{label}</Button>;

  return <Box component="header" sx={{ bgcolor: '#171411', color: '#fff', position: 'sticky', top: 0, zIndex: 30, borderBottom: '1px solid rgba(255,255,255,.1)' }}>
    <Box component="nav" aria-label="เมนูหลัก" sx={{ minHeight: 68, maxWidth: 1440, mx: 'auto', px: { xs: 2.5, md: '5vw' }, display: 'flex', alignItems: 'center', gap: 2.5, position: 'relative' }}>
      <Link href="/" aria-label="หน้าแรก Super Black Coffee" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'inherit', fontFamily: 'var(--font-inter)', fontSize: 11, lineHeight: 1, fontWeight: 800, letterSpacing: -.15, whiteSpace: 'nowrap', flexShrink: 0 }}>
        <Image src="/superblack-logo.png" alt="" width={38} height={38} priority />
        <span>SUPER BLACK COFFEE</span>
      </Link>
      <Box component="ul" sx={{ display: { xs: 'none', lg: 'flex' }, position: 'absolute', left: '50%', transform: 'translateX(-50%)', gap: .5, p: 0, m: 0, listStyle: 'none', alignItems: 'center', whiteSpace: 'nowrap' }}>
        {links.map(([label, href]) => <Box component="li" key={href}>{navLink(label, href)}</Box>)}
      </Box>
      <Button component={Link} href="/franchise#apply" variant="outlined" sx={{ display: { xs: 'none', sm: 'inline-flex' }, minHeight: 38, px: 2.2, ml: 'auto', color: '#fff', borderColor: 'rgba(255,255,255,.52)', fontSize: 13, '&:hover': { borderColor: '#d09a3f', color: '#d09a3f', bgcolor: 'rgba(208,154,63,.08)' } }}>สนใจแฟรนไชส์</Button>
      <IconButton aria-label={open ? 'ปิดเมนู' : 'เปิดเมนู'} onClick={() => setOpen(true)} sx={{ display: { xs: 'inline-flex', lg: 'none' }, ml: { xs: 'auto', sm: 0 }, width: 40, height: 40, color: '#fff' }}><MenuToggle open={open} /></IconButton>
    </Box>
    <Drawer anchor="right" open={open} onClose={() => setOpen(false)} slotProps={{ paper: { sx: { width: 'min(88vw, 360px)', bgcolor: '#f8f4ef' } } }}>
      <Stack sx={{ p: 3.5, minHeight: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ fontFamily: 'var(--font-inter)', fontWeight: 800, fontSize: 13, letterSpacing: .4 }}>SUPER BLACK COFFEE</Box>
          <IconButton aria-label="ปิดเมนู" onClick={() => setOpen(false)} sx={{ color: '#171411' }}><Box component="span" sx={{ fontSize: 26, lineHeight: 1 }}>×</Box></IconButton>
        </Box>
        <Stack>{links.map(([label, href]) => navLink(label, href, true))}</Stack>
        <Button component={Link} href="/franchise#apply" onClick={() => setOpen(false)} variant="contained" sx={{ mt: 'auto', bgcolor: '#171411', color: '#fff', '&:hover': { bgcolor: '#302821' } }}>สนใจแฟรนไชส์</Button>
      </Stack>
    </Drawer>
  </Box>;
}
