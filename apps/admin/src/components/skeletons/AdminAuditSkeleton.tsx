import { Box, Card, Skeleton } from '@mui/material';

export function AdminAuditSkeleton() {
  return (
    <Box sx={{ display: 'grid', gap: 1.25 }} aria-label="กำลังโหลดประวัติ">
      {Array.from({ length: 5 }, (_, i) => (
        <Card
          key={i}
          variant="outlined"
          sx={{ p: 2.25, borderRadius: '15px', borderColor: '#e8ddd5' }}
        >
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}
          >
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="rounded" width="45%" height={19} />
              <Skeleton
                variant="rounded"
                width="72%"
                height={13}
                sx={{ mt: 1 }}
              />
            </Box>
            <Skeleton variant="rounded" width={82} height={26} />
          </Box>
        </Card>
      ))}
    </Box>
  );
}
