import { Box, Skeleton } from '@mui/material';

export function AdminEmployeesSkeleton() {
  return (
    <Box sx={{ display: 'grid', gap: 1.25 }}>
      <Skeleton variant="text" width={190} height={32} />
      <Skeleton variant="text" width={320} height={20} />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 1.5,
          mt: 1,
        }}
      >
        {[1, 2, 3].map((item) => (
          <Skeleton
            key={item}
            variant="rounded"
            height={88}
            sx={{ borderRadius: '15px' }}
          />
        ))}
      </Box>
      {[1, 2, 3, 4].map((item) => (
        <Skeleton
          key={item}
          variant="rounded"
          height={78}
          sx={{ borderRadius: '15px' }}
        />
      ))}
    </Box>
  );
}
