import { Box, Typography } from '@mui/material';
export function StorySection() {
  return (
    <Box
      component="section"
      id="story"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        gap: { xs: 4, md: '12vw' },
        p: {
          xs: '80px 24px',
          md: 'clamp(80px, 12vw, 180px) clamp(24px, 16vw, 260px)',
        },
        mt: { xs: 8, md: 'clamp(80px, 10vw, 150px)' },
        bgcolor: '#f4ebe5',
        overflow: 'hidden',
        position: 'relative',
        '&::after': {
          content: '"SBC"',
          position: 'absolute',
          right: -20,
          bottom: -74,
          color: 'rgba(128,86,55,.08)',
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: 'clamp(160px, 25vw, 360px)',
          fontWeight: 800,
          letterSpacing: '-20px',
          pointerEvents: 'none',
        },
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography
          sx={{
            mb: 1.75,
            color: '#805637',
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 2,
          }}
        >
          OUR COFFEE, OUR WAY
        </Typography>
        <Typography
          component="h2"
          sx={{
            m: 0,
            color: '#201914',
            fontSize: 'clamp(48px, 6vw, 92px)',
            fontWeight: 700,
            lineHeight: 0.98,
            letterSpacing: '-2.7px',
          }}
        >
          เรียบง่าย
          <br />
          แต่ไม่ธรรมดา
        </Typography>
      </Box>
      <Typography
        sx={{
          position: 'relative',
          zIndex: 1,
          alignSelf: 'end',
          color: '#67584e',
          fontSize: 18,
          lineHeight: 1.9,
        }}
      >
        เราทำกาแฟที่ดื่มง่ายในทุกวัน
        ด้วยเมล็ดที่คัดเลือกอย่างพิถีพิถันและมาตรฐานเดียวกันในทุกสาขา
        เพื่อให้ทุกแก้วเป็นช่วงเวลาที่ดีของคุณ
      </Typography>
    </Box>
  );
}
