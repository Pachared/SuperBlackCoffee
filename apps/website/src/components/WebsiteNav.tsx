'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Box, Button } from '@mui/material';
import { usePathname } from 'next/navigation';

const links = [
  ['หน้าหลัก', '/'], ['เกี่ยวกับเรา', '/about'], ['เมนู', '/menu'], ['สาขา', '/branches'], ['แฟรนไชส์', '/franchise'], ['ติดต่อเรา', '/contact'],
];

export function WebsiteNav() {
  const pathname = usePathname();
  return <Box component="header" sx={{ bgcolor: '#171411', color: '#fff', position: 'sticky', top: 0, zIndex: 20, m: 0, p: 0 }}>
    <Box component="nav" aria-label="เมนูหลัก" sx={{ minHeight: 64, maxWidth: 1440, mx: 'auto', px: { xs: 2.5, md: '5vw' }, display: 'flex', alignItems: 'center', gap: 3, position: 'relative' }}>
    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'inherit', fontFamily: 'var(--font-inter)', fontSize: 11, lineHeight: 1.15, fontWeight: 800, letterSpacing: 0, whiteSpace: 'nowrap', flexShrink: 0 }}>
        <Image src="/superblack-logo.png" alt="Super Black Coffee" width={42} height={42} priority />
        <span>SUPER BLACK COFFEE</span>
      </Link>
      <Box component="ul" sx={{ display: { xs: 'none', md: 'flex' }, position: 'absolute', left: '50%', transform: 'translateX(-50%)', gap: { md: 1, lg: 1.5 }, p: 0, m: 0, listStyle: 'none', alignItems: 'center', whiteSpace: 'nowrap' }}>{links.map(([label, href]) => { const active = pathname === href || (href !== '/' && pathname.startsWith(`${href}/`)); return <Box component="li" key={href}><Button component={Link} href={href} aria-current={active ? 'page' : undefined} sx={{ minHeight: 42, px: { md: 1.2, lg: 1.5 }, borderRadius: 999, color: active ? '#d09a3f' : '#e7e0db', fontFamily: 'inherit', fontSize: 14, fontWeight: 500, textTransform: 'none', '&:hover': { color: '#d09a3f', bgcolor: 'rgba(208,154,63,.1)' } }}>{label}</Button></Box>; })}
      </Box>
      <Button component="a" href="/franchise#apply" variant="outlined" sx={{ minHeight: 40, px: 2, ml: 'auto', flexShrink: 0, borderRadius: 999, color: '#fff', borderColor: 'rgba(255,255,255,.7)', fontFamily: 'inherit', fontSize: 13, '&:hover': { borderColor: '#d09a3f', color: '#d09a3f' } }}>สนใจแฟรนไชส์</Button>
    </Box>
  </Box>;
}
