import { Box, Skeleton } from '@mui/material';

export function AdminEmployeesSkeleton() {
  return (
    <Box sx={{ display: 'grid', gap: 1.25 }}>
      <Skeleton variant="text" width={190} height={32} />
      <Skeleton variant="text" width={320} height={20} />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 1.5,
          mt: 1,
        }}
      >
        {[1, 2].map((item) => (
          <Skeleton
            key={item}
            variant="rounded"
            height={88}
            sx={{ borderRadius: '15px' }}
          />
        ))}
      </Box>
      <Skeleton variant="rounded" height={68} sx={{ borderRadius: '15px' }} />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(110px, 1fr))',
          overflow: 'hidden',
          borderRadius: '15px',
          gap: '1px',
          bgcolor: '#eee4dd',
        }}
      >
        {Array.from({ length: 35 }, (_, index) => (
          <Skeleton
            key={index}
            variant="rectangular"
            height={105}
            sx={{ bgcolor: '#f7f1ed' }}
          />
        ))}
      </Box>
    </Box>
  );
}
