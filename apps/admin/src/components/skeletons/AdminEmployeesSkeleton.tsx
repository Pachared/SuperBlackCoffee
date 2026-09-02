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
      {[1, 2, 3, 4, 5].map((item) => (
        <Skeleton
          key={item}
          variant="rounded"
          height={66}
          sx={{ borderRadius: item === 1 ? '0 0 15px 15px' : '10px' }}
        />
      ))}
    </Box>
  );
}
