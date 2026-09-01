import { Box, Card, Skeleton } from '@mui/material';

export function AdminIngredientsSkeleton() {
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
      aria-label="กำลังโหลดวัตถุดิบ"
    >
      {Array.from({ length: 4 }, (_, i) => (
        <Card
          key={i}
          variant="outlined"
          sx={{
            overflow: 'hidden',
            borderRadius: '15px',
            borderColor: '#e8ddd5',
          }}
        >
          <Skeleton variant="rectangular" height={170} />
          <Box sx={{ p: 2.25 }}>
            <Skeleton variant="rounded" width="68%" height={20} />
            <Skeleton
              variant="rounded"
              width="48%"
              height={14}
              sx={{ mt: 1 }}
            />
            <Skeleton
              variant="rounded"
              width="100%"
              height={32}
              sx={{ mt: 2 }}
            />
          </Box>
        </Card>
      ))}
    </Box>
  );
}
