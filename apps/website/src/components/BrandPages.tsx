// @ts-nocheck
import Image from 'next/image';
import { Box, Button, Divider, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';

const brown = '#171411';
const gold = '#d09a3f';
const cream = '#f8f4ef';
const shell = { maxWidth: 1180, mx: 'auto', px: { xs: 2.5, md: 5 } };
const heading = { fontWeight: 700, letterSpacing: '-.03em' };
const pill = { borderRadius: 999, px: 3, py: 1.25, fontWeight: 700, textTransform: 'none' };
const menu = [['Espresso', '90'], ['Americano', '100'], ['Latte', '120'], ['Cappuccino', '120'], ['Flat White', '120'], ['Mocha', '130']];
const branches = [['อยุธยา', '15 78 หมู่ที่ 3 ถนน ป่ามะพร้าว ตำบลท่าวาสุกรี อำเภอ พระนครศรีอยุธยา จังหวัดพระนครศรีอยุธยา 13000', '📞 061-884-9960', '08:00–20:30 น.', 'https://maps.app.goo.gl/B2sXw1XnoACsmphA9', 'เปิดทุกวัน'], ['พิษณุโลก', '654 18 ถนน พระองค์ขาว ซอย 4 ตำบล ในเมือง เมือง พิษณุโลก 65000', '📞 080-174-7757', '08:00–20:30 น.', 'https://maps.app.goo.gl/rbCG1HbrHJXHffSk6', 'เปิดทุกวัน'], ['รัชดา', 'กรุงเทพมหานคร', '', '', '', 'พบกันเร็วๆนี้']];
const plans = [['S', 'Smart Café', '20–40 ตร.ม.', 'Coffee & Beverage', '1.2–2.2 ล้านบาท'], ['M', 'Lifestyle Café', '40–100 ตร.ม.', 'Coffee, Food & Bakery', '2.5–4.5 ล้านบาท'], ['L', 'Lifestyle Hub', '100 ตร.ม. ขึ้นไป', 'ครบทุกบริการของเรา', '5–10 ล้านบาท+']];

function CTA({ href, children, outline = false }: { href: string; children: React.ReactNode; outline?: boolean }) {
  return <Button component="a" href={href} variant={outline ? 'outlined' : 'contained'} sx={{ ...pill, fontWeight: 500, color: outline ? '#fff' : brown, borderColor: outline ? 'rgba(255,255,255,.6)' : gold, bgcolor: outline ? 'transparent' : gold }}>{children}</Button>;
}

function BrandGallery() {
  const photo = (src: string, alt: string, title: string) => <Box sx={{ minHeight: { xs: 230, md: 260 }, borderRadius: 5, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'end', p: { xs: 2.5, md: 3 }, color: '#fff', '&:hover img': { transform: 'scale(1.04)' } }}><Image src={src} alt={alt} fill sizes="(max-width: 900px) 100vw, 30vw" style={{ objectFit: 'cover', transition: 'transform .45s ease' }} /><Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 45%, rgba(0,0,0,.6))' }} /><Typography variant="h5" sx={{ ...heading, position: 'relative', zIndex: 1 }}>{title}</Typography></Box>;
  return <Box component="section" sx={{ ...shell, py: { xs: 8, md: 12 } }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 3, mb: 4 }}>
      <Box>
        <Typography variant="overline" sx={{ color: '#a97943', letterSpacing: '.15em' }}>THE COFFEE MOMENT</Typography>
        <Typography variant="h2" sx={{ ...heading, mt: 1 }}>ทุกช่วงเวลามีรสชาติของเรา</Typography>
      </Box>
      <Button component="a" href="/menu" sx={{ color: brown, fontWeight: 700, textTransform: 'none', whiteSpace: 'nowrap' }}>สำรวจเมนู →</Button>
    </Box>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.25fr .8fr .8fr' }, gridTemplateRows: { xs: 'auto', md: 'repeat(2, 260px)' }, gap: 2 }}>
      <Box sx={{ gridRow: { md: 'span 2' } }}>{photo('/coffee/espresso.png', 'กาแฟเอสเพรสโซ่', 'กาแฟที่ตั้งใจในทุกแก้ว')}</Box>
      {photo('/coffee/drinks.png', 'เครื่องดื่มกาแฟและมัทฉะ', 'สดใหม่ทุกวัน')}{photo('/coffee/storefront.png', 'หน้าร้าน Super Black Coffee', 'พื้นที่สำหรับทุกช่วงเวลา')}
      <Paper sx={{ gridColumn: { md: '2 / 4' }, p: { xs: 3, md: 4 }, borderRadius: 5, bgcolor: brown, color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Typography variant="h5" sx={heading}>คุณภาพที่สัมผัสได้</Typography>
        <Typography sx={{ color: 'rgba(255,255,255,.68)', maxWidth: 560 }}>ตั้งใจเลือกทุกวัตถุดิบ เพื่อให้ทุกแก้วเป็นช่วงเวลาที่อยากกลับมา</Typography>
      </Paper>
    </Box>
  </Box>;
}

function BrandPromise() {
  const promises = [
    ['01', 'คัดสรรวัตถุดิบ', 'เลือกสิ่งที่ดีที่สุด เพื่อให้ทุกแก้วมีรสชาติที่ชัดเจน'],
    ['02', 'มาตรฐานทุกสาขา', 'ประสบการณ์ที่ดีควรเกิดขึ้นได้เหมือนกันในทุกพื้นที่'],
    ['03', 'ระบบที่พร้อมเติบโต', 'ดูแลร้านให้เดินหน้าได้จริง พร้อมทีมที่อยู่เคียงข้าง'],
  ];
  return <Box component="section" sx={{ bgcolor: brown, color: '#fff', py: { xs: 8, md: 11 } }}>
    <Box sx={{ ...shell }}>
      <Typography variant="h2" sx={{ ...heading, fontSize: 'clamp(2rem, 3.5vw, 3.6rem)', maxWidth: 680 }}>กาแฟดีที่ออกแบบมาเพื่อการเติบโต</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: { xs: 4, md: 3 }, mt: { xs: 6, md: 8 } }}>
        {promises.map(([number, title, text]) => <Box key={number} sx={{ borderTop: '1px solid rgba(255,255,255,.3)', pt: 2.5 }}>
          <Typography sx={{ color: gold, fontSize: 13, letterSpacing: '.12em' }}>{number}</Typography>
          <Typography variant="h5" sx={{ ...heading, mt: 2 }}>{title}</Typography>
          <Typography sx={{ mt: 1.5, color: 'rgba(255,255,255,.68)', lineHeight: 1.7 }}>{text}</Typography>
        </Box>)}
      </Box>
    </Box>
  </Box>;
}

function BrandStats() {
  const stats = [
    ['⌂', '50+', 'BRANCHES', 'สาขาทั่วประเทศ'],
    ['☕', '1M+', 'CUPS SERVED', 'แก้วที่เราเสิร์ฟ'],
    ['♧', '100K+', 'HAPPY CUSTOMERS', 'ลูกค้าที่พอใจ'],
    ['ϟ', '30+', 'EV STATIONS', 'สถานีชาร์จ EV'],
    ['□', '200K+', 'PARCELS DELIVERED', 'พัสดุที่จัดส่ง'],
    ['♛', 'AWARD', 'WINNER', 'รางวัลคุณภาพ'],
  ];
  return <Box component="section" sx={{ bgcolor: '#050505', color: '#fff', py: { xs: 3, md: 4 } }}>
    <Box sx={{ ...shell }}>
      <Box sx={{ border: '1px solid rgba(208,154,63,.45)', borderRadius: 2, display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' } }}>
        {stats.map(([icon, value, label, description], i) => <Box key={label} sx={{ minHeight: { xs: 112, md: 122 }, p: { xs: 1.5, md: 2 }, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '42px 1fr' }, gap: { xs: .5, md: 1.25 }, alignItems: 'center', borderRight: { xs: i % 2 === 0 ? '1px solid rgba(255,255,255,.2)' : 'none', sm: i % 3 !== 2 ? '1px solid rgba(255,255,255,.2)' : 'none', lg: i !== 5 ? '1px solid rgba(255,255,255,.2)' : 'none' }, borderBottom: { xs: i < 4 ? '1px solid rgba(255,255,255,.2)' : 'none', sm: i < 3 ? '1px solid rgba(255,255,255,.2)' : 'none', lg: 'none' } }}>
          <Typography aria-hidden sx={{ color: gold, fontSize: { xs: 27, md: 34 }, lineHeight: 1, textAlign: { xs: 'left', md: 'center' } }}>{icon}</Typography>
          <Box>
            <Typography sx={{ color: '#fff', fontSize: { xs: '1.35rem', md: '1.6rem' }, fontWeight: 700, lineHeight: 1 }}>{value}</Typography>
            <Typography sx={{ color: '#fff', fontSize: { xs: 10, md: 11 }, fontWeight: 700, mt: .65, lineHeight: 1.2 }}>{label}</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,.62)', fontSize: { xs: 10, md: 11 }, mt: .35 }}>{description}</Typography>
          </Box>
        </Box>)}
      </Box>
    </Box>
  </Box>;
}

function BrandStory() {
  return <Box component="section" sx={{ ...shell, py: { xs: 8, md: 12 }, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.05fr .95fr' }, gap: { xs: 5, md: 9 }, alignItems: 'center' }}>
    <Box sx={{ position: 'relative', minHeight: { xs: 300, md: 500 }, borderRadius: 5, overflow: 'hidden' }}>
      <Image src="/coffee/storefront.png" alt="หน้าร้าน Super Black Coffee" fill sizes="(max-width: 900px) 100vw, 52vw" style={{ objectFit: 'cover' }} />
    </Box>
    <Box>
      <Typography variant="overline" sx={{ color: '#a97943', letterSpacing: '.15em' }}>OUR STORY</Typography>
      <Typography variant="h2" sx={{ ...heading, fontSize: 'clamp(2rem, 3.5vw, 3.5rem)', mt: 1.5 }}>เริ่มต้นจากความตั้งใจ สู่แบรนด์ที่พร้อมเติบโต</Typography>
      <Typography sx={{ mt: 3, color: '#6b625c', lineHeight: 1.85 }}>กาแฟที่ดีเริ่มจากรายละเอียดที่ใส่ใจ และธุรกิจที่ดีต้องมีระบบที่ทำให้ทุกคนเติบโตได้จริง เราจึงออกแบบทุกขั้นตอน ตั้งแต่วัตถุดิบไปจนถึงประสบการณ์หน้าร้าน</Typography>
      <Button component="a" href="/about" sx={{ mt: 3, p: 0, color: brown, fontWeight: 700, textTransform: 'none' }}>รู้จักเรื่องราวของเรา →</Button>
    </Box>
  </Box>;
}

function MenuHighlight() {
  return <Box component="section" sx={{ bgcolor: '#eee5db', py: { xs: 8, md: 11 } }}>
    <Box sx={{ ...shell, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '.85fr 1.15fr' }, gap: { xs: 5, md: 9 }, alignItems: 'center' }}>
      <Box>
        <Typography variant="overline" sx={{ color: '#a97943', letterSpacing: '.15em' }}>THE MENU</Typography>
        <Typography variant="h2" sx={{ ...heading, fontSize: 'clamp(2rem, 3.5vw, 3.5rem)', mt: 1.5 }}>เมนูที่ตั้งใจในทุกแก้ว</Typography>
        <Typography sx={{ mt: 2.5, color: '#6b625c', lineHeight: 1.8 }}>รสชาติที่ชัดเจน จากวัตถุดิบที่เราเลือกเองและความพิถีพิถันของทีมบาริสต้า</Typography>
        <Button component="a" href="/menu" sx={{ mt: 3, p: 0, color: brown, fontWeight: 700, textTransform: 'none' }}>ดูเมนูทั้งหมด →</Button>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: { xs: 2, md: 3 }, alignItems: 'stretch' }}>
        <Box sx={{ minHeight: { xs: 240, md: 340 }, position: 'relative', borderRadius: 4, overflow: 'hidden', gridRow: 'span 2' }}>
          <Image src="/coffee/espresso.png" alt="เอสเพรสโซ่" fill sizes="(max-width: 900px) 50vw, 30vw" style={{ objectFit: 'cover' }} />
        </Box>
        <Box sx={{ borderTop: '1px solid #bfae9f', py: 2 }}><Typography sx={{ color: '#8c5d39', fontSize: 13 }}>01 · COFFEE</Typography><Typography variant="h6" sx={{ ...heading, mt: .75 }}>เอสเพรสโซ่</Typography><Typography variant="body2" sx={{ color: '#6b625c', mt: .5 }}>เข้ม ชัด หอมยาว</Typography></Box>
        <Box sx={{ borderTop: '1px solid #bfae9f', py: 2 }}><Typography sx={{ color: '#8c5d39', fontSize: 13 }}>02 · SIGNATURE</Typography><Typography variant="h6" sx={{ ...heading, mt: .75 }}>ลาเต้ซิกเนเจอร์</Typography><Typography variant="body2" sx={{ color: '#6b625c', mt: .5 }}>นุ่มละมุนในทุกจิบ</Typography></Box>
      </Box>
    </Box>
  </Box>;
}

function ServicesStrip() {
  const services = [
    ['/coffee/espresso.png', 'COFFEE & BEVERAGE', 'กาแฟคุณภาพที่คัดสรรอย่างตั้งใจ', '#d09a3f'],
    ['/brand-hero.png', 'EV CHARGING', 'สถานีชาร์จรถยนต์ไฟฟ้าสำหรับทุกพื้นที่', '#71b65e'],
    ['/coffee/storefront.png', 'BPOST65 EXPRESS', 'บริการจัดส่งพัสดุครบวงจร', '#e15a42'],
    ['/brand-hero.png', 'FRANCHISE', 'เติบโตไปด้วยกันกับธุรกิจที่มั่นคง', '#d09a3f'],
    ['/coffee/drinks.png', 'SUPERBLACK CONTROL', 'ระบบบริหารจัดการร้านและสาขา', '#d09a3f'],
  ];
  return <Box component="section" sx={{ bgcolor: brown, color: '#fff', py: { xs: 7, md: 10 } }}>
    <Box sx={{ ...shell }}>
      <Typography variant="h3" sx={{ ...heading, fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', mb: 4 }}>มากกว่ากาแฟในทุกพื้นที่</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' }, gap: 1.5 }}>
        {services.map(([image, title, text, accent]) => <Box key={title} sx={{ minHeight: { xs: 280, md: 350 }, position: 'relative', overflow: 'hidden', border: '1px solid rgba(208,154,63,.55)', borderRadius: 2.5, display: 'flex', alignItems: 'end', '&:hover img': { transform: 'scale(1.04)' } }}>
          <Image src={image} alt={title} fill sizes="(max-width: 900px) 50vw, 20vw" style={{ objectFit: 'cover', transition: 'transform .45s ease' }} />
          <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 20%, rgba(0,0,0,.94) 92%)' }} />
          <Box sx={{ position: 'relative', zIndex: 1, p: 2.25 }}>
            <Typography sx={{ color: accent, fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>{title}</Typography>
            <Typography sx={{ mt: 1, color: 'rgba(255,255,255,.82)', fontSize: 14, lineHeight: 1.55 }}>{text}</Typography>
            <Typography component="a" href={title === 'FRANCHISE' ? '/franchise' : title === 'SUPERBLACK CONTROL' ? '/contact' : '/services'} sx={{ display: 'inline-block', mt: 2, color: accent, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>LEARN MORE&nbsp; ↗</Typography>
          </Box>
        </Box>)}
      </Box>
    </Box>
  </Box>;
}

export function HomeContent() {
  return <>
    <Box component="section" sx={{ position: 'relative', color: '#fff', overflow: 'hidden', textAlign: 'center' }}>
      <Image src="/brand-hero.png" alt="ร้าน Super Black Coffee" width={1672} height={941} priority unoptimized sizes="100vw" style={{ display: 'block', width: '100%', height: 'auto' }} />
      <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(18,13,10,.58)' }} />
      <Box sx={{ ...shell, position: 'absolute', inset: 0, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6 }}>
        <Typography component="h1" sx={{ ...heading, fontWeight: 600, fontSize: 'clamp(1.8rem, 3.6vw, 3.8rem)', lineHeight: { xs: 1.2, md: 1.15 }, letterSpacing: '-.025em', maxWidth: 700, mt: 2, textWrap: 'balance' }}>กาแฟดีทุกแก้ว<br />
          <Box component="em" sx={{ color: gold, fontStyle: 'normal', display: 'inline-block', mt: { xs: .5, md: .75 } }}>ธุรกิจเติบโตไปด้วยกัน</Box>
        </Typography>
        <Typography sx={{ mt: 3, maxWidth: 560, color: 'rgba(255,255,255,.82)' }}>กาแฟคุณภาพที่ตั้งใจในทุกแก้ว พร้อมระบบที่พาธุรกิจเติบโตอย่างยั่งยืน</Typography>
        <Stack direction="row" spacing={1.5} sx={{ mt: 4, justifyContent: 'center' }}>
          <CTA href="/branches">ค้นหาสาขา</CTA>
          <CTA href="/franchise" outline>ดูแฟรนไชส์</CTA>
        </Stack>
      </Box>
    </Box>
    <BrandStats />
    <BrandStory />
    <ServicesStrip />
    <BrandGallery />
    <Box sx={{ bgcolor: brown, color: '#fff', textAlign: 'center', py: 10 }}>
      <Typography variant="h2" sx={heading}>สนใจเติบโตไปกับเรา</Typography>
      <Typography sx={{ mt: 2, color: 'rgba(255,255,255,.72)' }}>เลือกแฟรนไชส์ที่เหมาะกับพื้นที่และเป้าหมายของคุณ</Typography>
      <CTA href="/franchise#apply">พูดคุยกับทีมแฟรนไชส์</CTA>
    </Box>
  </>;
}

export function AboutContent() {
  return <PageIntro title="เรื่องราวที่เริ่มจากแก้วกาแฟ" text="เราอยากสร้างพื้นที่ที่กาแฟดี ผู้คนดี และธุรกิจที่ดีเติบโตไปพร้อมกัน" image="/brand-hero.png">
    <ContentSection title="คุณภาพไม่ใช่ทางเลือก">
      <Typography>ตั้งแต่การเลือกเมล็ดกาแฟ การฝึกทีมบาริสต้า ไปจนถึงการดูแลทุกสาขา เราออกแบบทุกขั้นตอนให้ส่งมอบประสบการณ์ที่เหมือนกันในทุกแก้ว</Typography>
      <Typography>SUPER BLACK COFFEE คือแพลตฟอร์มที่พร้อมเติบโตไปกับชุมชนและผู้ประกอบการ</Typography>
    </ContentSection>
  </PageIntro>;
}

export function MenuContent() {
  return <PageIntro title="เมนูที่ตั้งใจในทุกแก้ว" text="รสชาติที่ชัดเจน จากวัตถุดิบที่เราเลือกเอง" image="/coffee-ingredients.png">
    <Box sx={{ ...shell, py: 8 }}>
      <Stack direction="row" gap={1} sx={{ mb: 4, flexWrap: 'wrap' }}>{['กาแฟ', 'ชาและมัทฉะ', 'เครื่องดื่ม', 'เบเกอรี่'].map((x, i) =>
        <Button key={x} variant={i === 0 ? 'contained' : 'outlined'} sx={{ ...pill, borderRadius: 2, color: i === 0 ? '#fff' : brown, bgcolor: i === 0 ? brown : 'transparent' }}>{x}</Button>)}
      </Stack>
      <Typography variant="h2" sx={heading}>กาแฟ</Typography>
      {menu.map(([name, price]) => <Box key={name} sx={{ py: 2, display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2d6ca' }}>
        <Box>
          <Typography sx={{ fontWeight: 700 }}>{name}</Typography>
          <Typography variant="body2" color="text.secondary">กาแฟคุณภาพคั่วอย่างพิถีพิถัน</Typography>
        </Box>
        <Typography sx={{ fontWeight: 700 }} color="#8c5d39">฿{price}</Typography>
      </Box>)}
    </Box>
  </PageIntro>;
}

export function BranchesContent() {
  return <PageIntro title="พบกับเราได้ทุกวัน" text="ค้นหาสาขาและบริการที่ใกล้คุณที่สุด" image="/brand-hero.png">
    <Box sx={{ ...shell, py: 8 }}>
      <TextField fullWidth placeholder="ค้นหาสาขา" sx={{ mb: 3, bgcolor: '#fff' }} />{branches.map(([name, address, phone, hours, mapUrl, status], i) =>
        <Box key={name} sx={{ display: 'grid', gridTemplateColumns: { xs: '40px minmax(0, 1fr)', md: '64px minmax(0, 1fr) 180px' }, gap: { xs: 1.5, md: 2.5 }, alignItems: 'start', py: { xs: 3, md: 3.5 }, borderBottom: '1px solid #e2d6ca' }}>
          <Typography sx={{ color: '#a97943', fontWeight: 700, pt: .25 }}>0{i + 1}</Typography>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, fontSize: 'clamp(1.2rem, 2vw, 1.55rem)', mb: .75 }}>{name}</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.65, overflowWrap: 'anywhere' }}>{address}</Typography>
            {phone && <Typography variant="body1" color="#8c5d39" sx={{ mt: 1, fontWeight: 600 }}>{phone}</Typography>}
            {mapUrl && <Typography component="a" href={mapUrl} target="_blank" rel="noreferrer" variant="body2" sx={{ display: 'inline-block', mt: 1.25, color: '#a97943', fontWeight: 700 }}>เปิด Google Maps ↗</Typography>}
          </Box>
          <Box sx={{ gridColumn: { xs: '2', md: 'auto' }, textAlign: { xs: 'left', md: 'right' }, mt: { xs: 1, md: .5 } }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: status === 'พบกันเร็วๆนี้' ? '#a97943' : 'inherit' }}>{status}</Typography>
            {hours && <Typography variant="body2" color="text.secondary">{hours}</Typography>}
          </Box>
        </Box>)}
    </Box>
  </PageIntro>;
}

export function FranchiseContent() {
  return <>
    <PageIntro title="ธุรกิจที่เติบโตไปด้วยกัน" text="เริ่มต้นแฟรนไชส์ในรูปแบบที่เหมาะกับพื้นที่และเป้าหมายของคุณ" image="/brand-hero.png" />
    <Box sx={{ ...shell, py: 8 }}>
      <Typography variant="h2" sx={{ ...heading, mb: 4 }}>เลือกรูปแบบแฟรนไชส์</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3,1fr)' }, gap: 2 }}>{plans.map(([size, name, area, service, cost]) =>
        <Paper key={size} sx={{ p: 3.5, borderRadius: 4, border: '1px solid #e2d6ca', bgcolor: cream }}>
          <Typography sx={{ ...heading, fontSize: '4rem', color: size === 'S' ? '#3f7d3c' : size === 'M' ? '#b37a18' : '#b72d24' }}>{size}</Typography>
          <Typography variant="h5" fontWeight={700}>{name}</Typography>
          <Divider sx={{ my: 2 }} />
          <Typography color="text.secondary">พื้นที่แนะนำ</Typography>
          <Typography fontWeight={700}>{area}</Typography>
          <Typography color="text.secondary" sx={{ mt: 2 }}>บริการหลัก</Typography>
          <Typography fontWeight={700}>{service}</Typography>
          <Typography variant="h6" sx={{ mt: 3 }} color="#8c5d39">{cost}</Typography>
        </Paper>)}</Box></Box>
    <Box id="apply" sx={{ bgcolor: brown, color: '#fff', textAlign: 'center', py: 9 }}>
      <Typography variant="h2" sx={heading}>เริ่มต้นเพียง 5 ขั้นตอน</Typography>
      <Typography sx={{ mt: 2 }}>กรอกข้อมูล · นัดพูดคุย · ประเมินทำเล · สรุปสัญญา · เตรียมเปิดร้าน</Typography>
      <CTA href="/contact">พูดคุยกับทีมแฟรนไชส์</CTA>
    </Box>
  </>;
}

export function ServicesContent() {
  const services = ['Coffee & Beverage', 'Food & Bakery', 'BPOST65 Express', 'EV Charging', 'Mobile Café'];

  return <PageIntro title="มากกว่ากาแฟในทุกพื้นที่" text="บริการที่ออกแบบให้ทุกทำเลมีศักยภาพมากขึ้น" image="/brand-hero.png">
    <Box sx={{ ...shell, py: 8 }}>{services.map((item, i) =>
      <Box key={item} sx={{ display: 'grid', gridTemplateColumns: '64px 1fr auto', gap: 2, py: 3, borderBottom: '1px solid #e2d6ca' }}>
        <Typography color="#a97943">0{i + 1}</Typography>
        <Box>
          <Typography variant="h4" sx={heading}>{item}</Typography>
          <Typography color="text.secondary">บริการคุณภาพที่เติมเต็มทุกพื้นที่ของคุณ</Typography>
        </Box>
        <Typography variant="h4">→</Typography>
      </Box>)}
    </Box>
  </PageIntro>;
}

export function NewsContent() {
  const posts = ['รวมโมเมนต์ดี ๆ กับชุมชนคนรักกาแฟ', 'เปิดตัวเมนูใหม่ เอสเพรสโซ่ซิกเนเจอร์', 'ส่งต่ออนาคตที่ดีให้กับชุมชนกาแฟไทย'];
  return <PageIntro dark title="เรื่องราวจาก SUPER BLACK COFFEE" text="ข่าวสาร โปรโมชัน และเรื่องราวที่เราอยากแบ่งปัน" image="/brand-hero.png">
    <Box sx={{ ...shell, py: 8, color: '#fff' }}>{posts.map((title, i) =>
      <Box key={title} sx={{ py: 3, borderBottom: '1px solid rgba(255,255,255,.2)' }}>
        <Typography color={gold}>ข่าวสาร · 0{i + 1}</Typography>
        <Typography variant="h4" sx={heading}>{title}</Typography>
        <Typography sx={{ color: 'rgba(255,255,255,.66)' }}>ติดตามเรื่องราวและกิจกรรมล่าสุดจาก SUPER BLACK COFFEE</Typography>
      </Box>)}
    </Box>
  </PageIntro>;
}

export function ContactContent() {
  return <PageIntro dark title="เริ่มต้นบทสนทนากับเรา" text="ไม่ว่าจะเป็นเรื่องสาขา แฟรนไชส์ หรือความร่วมมือ เรายินดีรับฟัง" image="/brand-hero.png">
    <Box sx={{ ...shell, py: 8, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1.2fr' }, gap: 6, color: '#fff' }}>
      <Stack spacing={3}>
        <Typography><b>LINE</b><br />@superblackcoffee</Typography>
        <Typography><b>โทรศัพท์</b><br />02-123-4567</Typography>
        <Typography><b>อีเมล</b><br />hello@superblackcoffee.co.th</Typography>
      </Stack>
      <Box component="form" sx={{ display: 'grid', gap: 2 }}>
        <TextField label="ชื่อ" required fullWidth />
        <TextField label="เบอร์โทรศัพท์" required type="tel" fullWidth />
        <TextField label="อีเมล" required type="email" fullWidth />
        <TextField select label="สนใจเรื่อง" defaultValue="" fullWidth>
          <MenuItem value="" disabled>เลือกหัวข้อที่คุณสนใจ</MenuItem>
          <MenuItem value="franchise">แฟรนไชส์</MenuItem>
          <MenuItem value="branch">สาขาและบริการ</MenuItem>
        </TextField>
        <TextField label="ข้อความ" multiline rows={4} fullWidth />
        <Button type="submit" variant="contained" sx={{ ...pill, bgcolor: gold, color: brown, justifySelf: 'start' }}>
          ส่งข้อความ
        </Button>
      </Box>
    </Box>
  </PageIntro>;
}

function ContentSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <Box sx={{ ...shell, py: { xs: 8, md: 12 }, display: 'grid', gap: 2 }}>
    <Typography variant="h2" sx={{ ...heading, fontSize: 'clamp(2rem, 3.2vw, 3.2rem)' }}>{title}</Typography>
    {children}
  </Box>;
}

function PageIntro({ title, text, image, dark = false, children }: { title: string; text: string; image: string; dark?: boolean; children?: React.ReactNode }) {
  return <Box sx={{ bgcolor: dark ? brown : cream, color: dark ? '#fff' : brown }}>
    <Box component="section" sx={{ ...shell, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 5, alignItems: 'center', py: { xs: 8, md: 13 } }}>
      <Box>
        <Typography variant="overline" sx={{ color: gold, letterSpacing: '.15em', fontWeight: 700 }}>SUPER BLACK COFFEE</Typography>
        <Typography component="h1" sx={{ ...heading, fontSize: 'clamp(2.25rem, 4vw, 4.2rem)', lineHeight: 1.05, mt: 2, textWrap: 'balance' }}>{title}</Typography>
        <Typography sx={{ mt: 3, color: dark ? 'rgba(255,255,255,.72)' : '#6b625c', fontSize: '1.15rem', maxWidth: 520 }}>{text}</Typography>
      </Box>
      <Image src={image} alt="Super Black Coffee" width={700} height={430} priority style={{ width: '100%', height: 'auto', borderRadius: 28 }} />
    </Box>
    {children}
  </Box>;
}
