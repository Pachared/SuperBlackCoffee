import { Box, Typography } from '@mui/material';

export function FranchiseEmptyPage({ title }: { title: string }) {
  return (
    <Box
      sx={{
        display: 'grid',
        minHeight: 440,
        placeItems: 'center',
        border: '1px dashed #d8c8bd',
        borderRadius: '16px',
        bgcolor: '#fffaf7',
        textAlign: 'center',
        p: 3,
      }}
    >
      <Box>
        <Typography sx={{ fontSize: 23, fontWeight: 700 }}>{title}</Typography>
        <Typography sx={{ mt: 0.5, color: 'text.secondary' }}>
          ส่วนนี้พร้อมสำหรับตั้งค่าจากสำนักงานใหญ่
        </Typography>
      </Box>
    </Box>
  );
}
