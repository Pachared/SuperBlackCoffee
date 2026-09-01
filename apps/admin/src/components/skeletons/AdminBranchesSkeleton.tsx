import { Box, Card, Skeleton } from '@mui/material';

export function AdminBranchesSkeleton() {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(4, 1fr)',
        },
        gap: 2,
      }}
      aria-label="กำลังโหลดข้อมูลสาขา"
    >
      {Array.from({ length: 4 }, (_, i) => (
        <Card
          key={i}
          variant="outlined"
          sx={{ p: 2.5, borderRadius: '15px', borderColor: '#e8ddd5' }}
        >
          <Skeleton variant="rounded" width="62%" height={22} />
          <Skeleton variant="rounded" width="38%" height={13} sx={{ mt: 1 }} />
          <Skeleton variant="rounded" width="48%" height={18} sx={{ mt: 2 }} />
          <Skeleton variant="rounded" width="72%" height={14} sx={{ mt: 1 }} />
        </Card>
      ))}
    </Box>
  );
}
