import { Box, Card, Skeleton } from '@mui/material';

export function AdminOverviewSkeleton() {
  return (
    <Box sx={{ display: 'grid', gap: 2.5 }} aria-label="กำลังโหลดภาพรวม">
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 2,
        }}
      >
        {Array.from({ length: 3 }, (_, i) => (
          <Card
            key={i}
            variant="outlined"
            sx={{ p: 2.5, borderRadius: '15px', borderColor: '#e8ddd5' }}
          >
            <Skeleton variant="rounded" width="42%" height={14} />
            <Skeleton
              variant="rounded"
              width="58%"
              height={34}
              sx={{ mt: 1 }}
            />
            <Skeleton
              variant="rounded"
              width="72%"
              height={13}
              sx={{ mt: 1 }}
            />
          </Card>
        ))}
      </Box>
      <Card
        variant="outlined"
        sx={{ p: 2.5, borderRadius: '15px', borderColor: '#e8ddd5' }}
      >
        <Skeleton variant="rounded" width="28%" height={20} />
        <Skeleton variant="rounded" width="38%" height={13} />
        <Skeleton
          variant="rounded"
          width="100%"
          height={130}
          sx={{ mt: 2, borderRadius: '15px', bgcolor: '#201914' }}
        />
      </Card>
    </Box>
  );
}
