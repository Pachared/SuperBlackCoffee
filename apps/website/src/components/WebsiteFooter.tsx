import Link from 'next/link';
import { Box, Typography } from '@mui/material';

export function WebsiteFooter() {
  return <Box component="footer" sx={{ bgcolor: '#171411', color: '#fff', px: { xs: 3, md: '8vw' }, pt: 8, pb: 3 }}>
    <Box sx={{ maxWidth: 1240, mx: 'auto', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr repeat(3,1fr)' }, gap: 5 }}>
      <Box sx={{ display: 'grid', alignContent: 'start', gap: 1 }}>
        <strong style={{ font: '700 23px/1.05 var(--font-inter)', letterSpacing: 2, color: '#c69454' }}>SUPER BLACK<br />COFFEE</strong>
        <Typography component="p" sx={{ color: '#c8bbb0', fontSize: 14 }}>กาแฟที่ตั้งใจในทุกจังหวะของคุณ</Typography>
      </Box>
      <Box sx={{ display: 'grid', alignContent: 'start', gap: 1 }}>
        <b style={{ color: '#c69454' }}>สำรวจ</b>
        <Link href="/about">เกี่ยวกับเรา</Link>
        <Link href="/menu">เมนู</Link>
        <Link href="/branches">สาขา</Link>
      </Box>
      <Box sx={{ display: 'grid', alignContent: 'start', gap: 1 }}>
        <b style={{ color: '#c69454' }}>แฟรนไชส์</b>
        <Link href="/franchise">ภาพรวมธุรกิจ</Link>
        <Link href="/services">บริการของเรา</Link>
        <Link href="/contact">ติดต่อทีมงาน</Link>
      </Box>
      <Box sx={{ display: 'grid', alignContent: 'start', gap: 1 }}>
        <b style={{ color: '#c69454' }}>ติดต่อเรา</b>
        <a href="tel:021234567">02-123-4567</a>
        <a href="mailto:hello@superblackcoffee.co.th">hello@superblackcoffee.co.th</a>
        <span style={{ color: '#c8bbb0', fontSize: 14 }}>จันทร์–ศุกร์ 09:00–18:00 น.</span>
      </Box>
    </Box>
    <Box sx={{ maxWidth: 1240, mx: 'auto', mt: 7, pt: 2, borderTop: '1px solid rgba(198,148,84,.35)', display: 'flex', justifyContent: 'space-between', gap: 2, color: '#a99d94', fontSize: 12 }}>
      <span>© {new Date().getFullYear()} SUPER BLACK COFFEE</span>
      <Box sx={{ display: 'flex', gap: 3 }}>
        <Link href="/privacy">นโยบายความเป็นส่วนตัว</Link>
        <Link href="/terms">ข้อกำหนดการใช้งาน</Link>
      </Box>
    </Box>
  </Box>;
}
