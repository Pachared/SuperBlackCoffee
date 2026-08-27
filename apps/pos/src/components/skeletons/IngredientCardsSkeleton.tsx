import { Box, Card, Skeleton } from '@mui/material';

export function IngredientCardsSkeleton({ count }: { count: number }) {
  return <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' }, gap: '16px' }}>
    {Array.from({ length: count }, (_, index) => <Card key={index} variant="outlined" sx={{ overflow: 'hidden', borderRadius: '15px', borderColor: '#e8ddd5' }}>
      <Box sx={{ width: '100%', aspectRatio: { xs: '1 / 1', md: '4 / 3' } }}><Skeleton animation="wave" variant="rectangular" width="100%" height="100%" sx={{ display: 'block', bgcolor: '#f0e7e1' }} /></Box>
      <Box sx={{ p: 2.5 }}>
        <Skeleton animation="wave" variant="rounded" height={27} sx={{ width: '60%', borderRadius: '4px', bgcolor: '#f0e7e1' }} />
        <Skeleton animation="wave" variant="rounded" height={20} sx={{ width: '42%', mt: .6, borderRadius: '4px', bgcolor: '#f0e7e1' }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1, mt: 2 }}>
          <Skeleton animation="wave" variant="rounded" height={34} sx={{ borderRadius: '10px', bgcolor: '#f0e7e1' }} />
          <Skeleton animation="wave" variant="rounded" height={34} sx={{ borderRadius: '10px', bgcolor: '#f0e7e1' }} />
          <Skeleton animation="wave" variant="rounded" height={34} sx={{ gridColumn: '1 / -1', borderRadius: '10px', bgcolor: '#f0e7e1' }} />
        </Box>
      </Box>
    </Card>)}
  </Box>;
}
