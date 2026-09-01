import { Box, Card, Skeleton } from '@mui/material';

export function AdminProcurementSkeleton() {
  return (
    <Card
      variant="outlined"
      sx={{ borderRadius: '15px', borderColor: '#e8ddd5', overflow: 'hidden' }}
      aria-label="กำลังโหลดรายการจัดซื้อ"
    >
      <Box sx={{ p: 2.5 }}>
        {Array.from({ length: 5 }, (_, i) => (
          <Box
            key={i}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1.2fr .8fr 1fr auto' },
              gap: 2,
              py: 1.25,
              borderBottom: i < 4 ? '1px solid #eee4de' : 0,
            }}
          >
            <Skeleton variant="rounded" width="78%" height={16} />
            <Skeleton variant="rounded" width="62%" height={16} />
            <Skeleton variant="rounded" width="86%" height={16} />
            <Skeleton variant="rounded" width={76} height={26} />
          </Box>
        ))}
      </Box>
    </Card>
  );
}
