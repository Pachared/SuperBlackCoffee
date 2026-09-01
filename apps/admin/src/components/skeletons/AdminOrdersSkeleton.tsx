import { Box, Card, Skeleton } from '@mui/material';

export function AdminOrdersSkeleton() {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: 'repeat(2, 1fr)',
          xl: 'repeat(3, 1fr)',
        },
        gap: 2,
      }}
      aria-label="กำลังโหลดคำขอ"
    >
      {Array.from({ length: 6 }, (_, i) => (
        <Card
          key={i}
          variant="outlined"
          sx={{ p: 2.5, borderRadius: '15px', borderColor: '#e8ddd5' }}
        >
          <Skeleton variant="rounded" width="62%" height={22} />
          <Skeleton variant="rounded" width="46%" height={14} sx={{ mt: 1 }} />
          <Skeleton variant="rounded" width="82%" height={14} sx={{ mt: 1 }} />
          <Skeleton variant="rounded" width="100%" height={34} sx={{ mt: 2 }} />
        </Card>
      ))}
    </Box>
  );
}
