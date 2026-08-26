import { Box, Typography } from '@mui/material';
import { WebsiteFooter } from '../../src/components/WebsiteFooter';
import { WebsiteNav } from '../../src/components/WebsiteNav';
export default function PrivacyPage() { return <main><WebsiteNav /><Box sx={{ maxWidth: 900, mx: 'auto', px: 3, py: 12 }}><Typography variant="h1" sx={{ fontWeight: 700, mb: 3 }}>นโยบายความเป็นส่วนตัว</Typography><Typography color="text.secondary">เราใช้ข้อมูลที่คุณส่งผ่านแบบฟอร์มติดต่อเพื่อประสานงานและตอบกลับตามความสนใจของคุณเท่านั้น</Typography></Box><WebsiteFooter /></main>; }
