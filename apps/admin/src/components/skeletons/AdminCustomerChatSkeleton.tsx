import { Box, Card, Skeleton } from '@mui/material';

export function AdminCustomerChatSkeleton() {
  return (
    <Card
      variant="outlined"
      sx={{
        height: { xs: 520, md: 620 },
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '300px 1fr' },
        overflow: 'hidden',
        borderRadius: '15px',
        borderColor: '#e8ddd5',
      }}
      aria-label="กำลังโหลดแชท"
    >
      <Box sx={{ p: 2, borderRight: { md: '1px solid #eee4de' } }}>
        <Skeleton variant="rounded" width="70%" height={20} />
        {Array.from({ length: 5 }, (_, i) => (
          <Box
            key={i}
            sx={{ display: 'flex', gap: 1.25, alignItems: 'center', mt: 2 }}
          >
            <Skeleton variant="circular" width={38} height={38} />
            <Skeleton
              variant="rounded"
              width={`${55 + (i % 3) * 12}%`}
              height={14}
            />
          </Box>
        ))}
      </Box>
      <Box sx={{ p: 2.5 }}>
        <Skeleton variant="rounded" width="34%" height={20} />
        <Skeleton variant="rounded" width="52%" height={13} sx={{ mt: 1 }} />
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton
            key={i}
            variant="rounded"
            width={i % 2 ? '62%' : '48%'}
            height={48}
            sx={{
              display: 'block',
              ml: i % 2 ? 'auto' : 0,
              mt: 2,
              borderRadius: '14px',
            }}
          />
        ))}
      </Box>
    </Card>
  );
}
