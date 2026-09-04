import { Box, Skeleton } from '@mui/material';

export function FranchiseOverviewSkeleton() {
  return (
    <Box sx={{ display: 'grid', gap: 2, minHeight: 360 }}>
      <Box>
        <Skeleton variant="text" width={220} height={40} />
        <Skeleton variant="text" width={340} height={24} />
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            xl: 'repeat(4, minmax(0, 1fr))',
          },
          gap: 1.75,
        }}
      >
        {[1, 2, 3, 4].map((item) => (
          <Skeleton
            key={item}
            variant="rounded"
            height={126}
            sx={{ borderRadius: '16px' }}
          />
        ))}
      </Box>
      <Skeleton variant="rounded" height={180} sx={{ borderRadius: '16px' }} />
    </Box>
  );
}
