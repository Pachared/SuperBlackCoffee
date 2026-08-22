import { Card, CardContent, Stack, Typography } from '@mui/material';
import { DashboardMain } from '@stackbuild/ui';

const content: Record<string, [string, string][]> = {
  คำสั่งซื้อของฉัน: [
    ['คำสั่งซื้อที่กำลังเตรียม', 'Iced Americano · รับที่สาขาสยาม'],
    ['ประวัติคำสั่งซื้อ', 'ดูรายละเอียดและใบเสร็จของคุณ'],
  ],
  รายการโปรด: [
    ['เมนูโปรดของคุณ', 'Iced Americano'],
    ['สั่งซ้ำได้ทันที', 'กาแฟแก้วโปรดของคุณพร้อมเสมอ'],
  ],
  'สมาชิก & รางวัล': [
    ['คะแนนสะสม', '420 points'],
    ['รางวัลถัดไป', 'อีก 80 คะแนน รับเครื่องดื่มฟรี'],
  ],
};

export function CustomerDashboardPage({ title }: { title: string }) {
  return (
    <DashboardMain>
      <Stack spacing={2}>
        {(content[title] ?? []).map(([heading, detail]) => (
          <Card key={heading}>
            <CardContent>
              <Typography variant="h6">{heading}</Typography>
              <Typography color="text.secondary">{detail}</Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </DashboardMain>
  );
}
