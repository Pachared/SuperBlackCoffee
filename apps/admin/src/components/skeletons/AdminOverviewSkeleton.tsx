import { Box, Card, Divider, Skeleton, Stack } from '@mui/material';

export function AdminOverviewSkeleton() {
  return (
    <Stack spacing={2.25} aria-label="กำลังโหลดภาพรวม">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Skeleton
            variant="rounded"
            width="72%"
            height={32}
            sx={{ maxWidth: 330 }}
          />
          <Skeleton
            variant="rounded"
            width="84%"
            height={14}
            sx={{ mt: 1, maxWidth: 360 }}
          />
        </Box>
        <Skeleton variant="rounded" width={170} height={14} />
      </Box>
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
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            xl: 'minmax(0, 1.25fr) minmax(330px, .75fr)',
          },
          gap: 2,
        }}
      >
        <Card
          variant="outlined"
          sx={{
            p: { xs: 2, md: 2.75 },
            borderRadius: '15px',
            borderColor: '#e8ddd5',
          }}
        >
          <Skeleton variant="rounded" width="28%" height={22} />
          <Skeleton variant="rounded" width="38%" height={13} sx={{ mt: 1 }} />
          <Skeleton
            variant="rounded"
            width="100%"
            height={140}
            sx={{ mt: 2.5, borderRadius: '14px', bgcolor: '#201914' }}
          />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 2,
              mt: 2.25,
            }}
          >
            <Box>
              <Skeleton variant="rounded" width="52%" height={14} />
              <Skeleton
                variant="rounded"
                width="62%"
                height={28}
                sx={{ mt: 1 }}
              />
            </Box>
            <Box sx={{ borderLeft: '1px solid #ece3dc', pl: 2 }}>
              <Skeleton variant="rounded" width="58%" height={14} />
              <Skeleton
                variant="rounded"
                width="62%"
                height={28}
                sx={{ mt: 1 }}
              />
            </Box>
          </Box>
        </Card>
        <Card
          variant="outlined"
          sx={{
            p: { xs: 2, md: 2.75 },
            borderRadius: '15px',
            borderColor: '#e8ddd5',
          }}
        >
          <Skeleton variant="rounded" width="32%" height={22} />
          <Skeleton variant="rounded" width="48%" height={13} sx={{ mt: 1 }} />
          <Stack spacing={1.25} sx={{ mt: 2.3 }}>
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton
                key={i}
                variant="rounded"
                width="100%"
                height={54}
                sx={{ borderRadius: '12px' }}
              />
            ))}
          </Stack>
        </Card>
      </Box>
      <Card
        variant="outlined"
        sx={{
          p: { xs: 2, md: 2.75 },
          borderRadius: '15px',
          borderColor: '#e8ddd5',
        }}
      >
        <Skeleton variant="rounded" width="18%" height={22} />
        <Skeleton variant="rounded" width="38%" height={13} sx={{ mt: 1 }} />
        <Divider sx={{ my: 2.2, borderColor: '#eee4dd' }} />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 1.25,
          }}
        >
          {Array.from({ length: 4 }, (_, i) => (
            <Box
              key={i}
              sx={{
                border: '1px solid #eee4dd',
                borderRadius: '12px',
                p: 1.75,
              }}
            >
              <Skeleton variant="rounded" width={24} height={14} />
              <Skeleton
                variant="rounded"
                width="74%"
                height={19}
                sx={{ mt: 1 }}
              />
              <Skeleton
                variant="rounded"
                width="92%"
                height={14}
                sx={{ mt: 1 }}
              />
            </Box>
          ))}
        </Box>
      </Card>
    </Stack>
  );
}
