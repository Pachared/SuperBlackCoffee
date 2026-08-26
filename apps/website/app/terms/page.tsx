import { Box, Typography } from '@mui/material';
import { WebsiteFooter } from '../../src/components/WebsiteFooter';
import { WebsiteNav } from '../../src/components/WebsiteNav';
export default function TermsPage() { return <main><WebsiteNav /><Box sx={{ maxWidth: 900, mx: 'auto', px: 3, py: 12 }}><Typography variant="h1" sx={{ fontWeight: 700, mb: 3 }}>ข้อกำหนดการใช้งาน</Typography><Typography color="text.secondary">เนื้อหาบนเว็บไซต์นี้จัดทำขึ้นเพื่อให้ข้อมูลเกี่ยวกับ SUPER BLACK COFFEE และอาจมีการปรับปรุงได้ตามความเหมาะสม</Typography></Box><WebsiteFooter /></main>; }
