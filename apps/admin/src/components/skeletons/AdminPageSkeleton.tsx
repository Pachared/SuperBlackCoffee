import { Box, Card, Skeleton } from '@mui/material';

type AdminPageSkeletonProps = {
  variant: 'overview' | 'cards' | 'list' | 'table' | 'chat';
  count?: number;
};

const cardSx = {
  borderRadius: '15px',
  borderColor: '#e8ddd5',
  bgcolor: '#fff',
};

function Line({
  width = '100%',
  height = 16,
}: {
  width?: string | number;
  height?: number;
}) {
  return (
    <Skeleton
      animation="wave"
      variant="rounded"
      width={width}
      height={height}
      sx={{ borderRadius: '6px', bgcolor: '#f0e7e1' }}
    />
  );
}

export function AdminPageSkeleton({
  variant,
  count = 6,
}: AdminPageSkeletonProps) {
  if (variant === 'overview') {
    return (
      <Box sx={{ display: 'grid', gap: 2.5 }} aria-label="กำลังโหลดภาพรวม">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          {Array.from({ length: 3 }, (_, index) => (
            <Card key={index} variant="outlined" sx={{ ...cardSx, p: 2.5 }}>
              <Line width="42%" height={14} />
              <Skeleton
                animation="wave"
                variant="rounded"
                width="58%"
                height={34}
                sx={{ mt: 1, bgcolor: '#f0e7e1' }}
              />
              <Line width="72%" height={13} />
            </Card>
          ))}
        </Box>
        <Card variant="outlined" sx={{ ...cardSx, p: 2.5 }}>
          <Line width="28%" height={20} />
          <Line width="38%" height={13} />
          <Skeleton
            animation="wave"
            variant="rounded"
            width="100%"
            height={130}
            sx={{ mt: 2, borderRadius: '15px', bgcolor: '#201914' }}
          />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 2,
              mt: 2,
            }}
          >
            <Line width="48%" height={14} />
            <Line width="48%" height={14} />
          </Box>
        </Card>
        <Card variant="outlined" sx={{ ...cardSx, p: 2.5 }}>
          <Line width="24%" height={20} />
          <Box sx={{ display: 'grid', gap: 1.25, mt: 2 }}>
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton
                key={index}
                animation="wave"
                variant="rounded"
                height={52}
                sx={{ borderRadius: '12px', bgcolor: '#f0e7e1' }}
              />
            ))}
          </Box>
        </Card>
      </Box>
    );
  }

  if (variant === 'chat') {
    return (
      <Card
        variant="outlined"
        sx={{
          ...cardSx,
          height: { xs: 520, md: 620 },
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '280px 1fr' },
          overflow: 'hidden',
        }}
        aria-label="กำลังโหลดแชท"
      >
        <Box sx={{ p: 2, borderRight: { md: '1px solid #eee4de' } }}>
          <Line width="70%" height={20} />
          <Box sx={{ display: 'grid', gap: 1.5, mt: 2 }}>
            {Array.from({ length: 5 }, (_, index) => (
              <Box
                key={index}
                sx={{ display: 'flex', gap: 1.25, alignItems: 'center' }}
              >
                <Skeleton
                  variant="circular"
                  width={38}
                  height={38}
                  sx={{ bgcolor: '#f0e7e1' }}
                />
                <Line width={`${55 + (index % 3) * 12}%`} height={14} />
              </Box>
            ))}
          </Box>
        </Box>
        <Box sx={{ p: 2.5 }}>
          <Line width="34%" height={20} />
          <Line width="52%" height={13} />
          <Box sx={{ display: 'grid', gap: 1.5, mt: 4 }}>
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton
                key={index}
                variant="rounded"
                width={index % 2 ? '62%' : '48%'}
                height={48}
                sx={{
                  justifySelf: index % 2 ? 'end' : 'start',
                  borderRadius: '14px',
                  bgcolor: '#f0e7e1',
                }}
              />
            ))}
          </Box>
        </Box>
      </Card>
    );
  }

  if (variant === 'table') {
    return (
      <Card
        variant="outlined"
        sx={{ ...cardSx, overflow: 'hidden' }}
        aria-label="กำลังโหลดข้อมูล"
      >
        <Box sx={{ p: 2.5, display: 'grid', gap: 1.5 }}>
          {Array.from({ length: count }, (_, index) => (
            <Box
              key={index}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1.2fr .8fr 1fr auto' },
                gap: 2,
                alignItems: 'center',
                py: 1.25,
                borderBottom: index < count - 1 ? '1px solid #eee4de' : 0,
              }}
            >
              <Line width="78%" />
              <Line width="62%" />
              <Line width="86%" />
              <Skeleton
                variant="rounded"
                width={76}
                height={26}
                sx={{ borderRadius: '12px', bgcolor: '#f0e7e1' }}
              />
            </Box>
          ))}
        </Box>
      </Card>
    );
  }

  if (variant === 'list') {
    return (
      <Box sx={{ display: 'grid', gap: 1.25 }} aria-label="กำลังโหลดรายการ">
        {Array.from({ length: count }, (_, index) => (
          <Card key={index} variant="outlined" sx={{ ...cardSx, p: 2.25 }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}
            >
              <Box sx={{ flex: 1 }}>
                <Line width="45%" height={19} />
                <Line width="72%" height={13} />
                <Line width="55%" height={13} />
              </Box>
              <Skeleton
                variant="rounded"
                width={82}
                height={26}
                sx={{ borderRadius: '12px', bgcolor: '#f0e7e1' }}
              />
            </Box>
          </Card>
        ))}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(4, minmax(0, 1fr))',
        },
        gap: 2,
      }}
      aria-label="กำลังโหลดรายการ"
    >
      <>
        {Array.from({ length: count }, (_, index) => (
          <Card
            key={index}
            variant="outlined"
            sx={{ ...cardSx, overflow: 'hidden' }}
          >
            <Skeleton
              variant="rectangular"
              height={170}
              sx={{ bgcolor: '#f0e7e1' }}
            />
            <Box sx={{ p: 2.25 }}>
              <Line width="68%" height={20} />
              <Line width="48%" height={14} />
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Skeleton
                  variant="rounded"
                  height={32}
                  sx={{ flex: 1, bgcolor: '#f0e7e1' }}
                />
                <Skeleton
                  variant="rounded"
                  height={32}
                  sx={{ flex: 1, bgcolor: '#f0e7e1' }}
                />
              </Box>
            </Box>
          </Card>
        ))}
      </>
    </Box>
  );
}
