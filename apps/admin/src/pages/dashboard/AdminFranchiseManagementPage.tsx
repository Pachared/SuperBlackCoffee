import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Divider,
  TextField,
  Typography,
} from '@mui/material';
import { DashboardMain } from '@stackbuild/ui';
import { createFranchisee } from '../../api';

const plans = [
  {
    code: 'S',
    title: 'Smart Café',
    description: 'เหมาะสำหรับร้านขนาดกะทัดรัด',
    items: [
      'สูตรเครื่องดื่มมาตรฐาน',
      'คู่มือการเปิดร้านและอบรมพื้นฐาน',
      'สิทธิ์ใช้แบรนด์และสื่อการตลาดกลาง',
    ],
  },
  {
    code: 'M',
    title: 'Lifestyle Café',
    description: 'ร้านกาแฟพร้อมอาหารและบริการเสริม',
    items: [
      'ทุกสิทธิ์ของแพ็กเกจ S',
      'สูตรอาหารและเบเกอรี่เพิ่มเติม',
      'การอบรมพนักงานและคำปรึกษาการดำเนินงาน',
    ],
  },
  {
    code: 'L',
    title: 'Lifestyle Hub',
    description: 'ศูนย์รวมบริการสำหรับพื้นที่ขนาดใหญ่',
    items: [
      'ทุกสิทธิ์ของแพ็กเกจ M',
      'ชุดเมนูและสูตรครบวงจร',
      'แผนการตลาดเฉพาะสาขาและการสนับสนุนเชิงลึก',
    ],
  },
];

export function AdminFranchiseManagementPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    plan: 'S' as 'S' | 'M' | 'L',
    branchName: '',
    branchCode: '',
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      await createFranchisee(form);
      setForm({
        name: '',
        email: '',
        plan: 'S',
        branchName: '',
        branchCode: '',
        username: '',
        password: '',
      });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'ไม่สามารถสร้างบัญชีแฟรนไชส์ได้',
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <DashboardMain>
      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{
            color: '#201914',
            fontFamily: 'Kanit, sans-serif',
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          จัดการแฟรนไชส์
        </Typography>
        <Typography
          sx={{ color: 'text.secondary', fontFamily: 'Kanit, sans-serif' }}
        >
          จัดการชุดข้อมูลเครื่องดื่ม สูตรอาหาร และสิทธิประโยชน์ของแต่ละแพ็กเกจ
        </Typography>
      </Box>
      <Card
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: '18px',
          border: '1px solid #eadfd7',
          boxShadow: 'none',
        }}
      >
        <Typography
          sx={{ fontSize: 21, fontWeight: 700, color: '#201914', mb: 2 }}
        >
          เพิ่มแฟรนไชส์และบัญชีเข้าใช้งาน
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 1.5,
          }}
        >
          <TextField
            required
            label="ชื่อแฟรนไชส์"
            value={form.name}
            onChange={(event) => update('name', event.target.value)}
          />
          <TextField
            required
            label="อีเมล"
            type="email"
            value={form.email}
            onChange={(event) => update('email', event.target.value)}
          />
          <TextField
            select
            label="แพ็กเกจ"
            value={form.plan}
            onChange={(event) => update('plan', event.target.value)}
          >
            <option value="S">Smart Café</option>
            <option value="M">Lifestyle Café</option>
            <option value="L">Lifestyle Hub</option>
          </TextField>
          <TextField
            required
            label="ชื่อสาขา"
            value={form.branchName}
            onChange={(event) => update('branchName', event.target.value)}
          />
          <TextField
            required
            label="รหัสสาขา"
            value={form.branchCode}
            onChange={(event) => update('branchCode', event.target.value)}
          />
          <TextField
            required
            label="Username สำหรับ Franchise"
            value={form.username}
            onChange={(event) => update('username', event.target.value)}
          />
          <TextField
            required
            label="Password"
            type="password"
            helperText="อย่างน้อย 8 ตัวอักษร"
            value={form.password}
            onChange={(event) => update('password', event.target.value)}
          />
        </Box>
        {error ? (
          <Typography color="error" sx={{ mt: 1.5 }}>
            {error}
          </Typography>
        ) : null}
        <Button
          variant="contained"
          onClick={() => void submit()}
          disabled={
            saving ||
            !form.name ||
            !form.email ||
            !form.branchName ||
            !form.branchCode ||
            !form.username ||
            form.password.length < 8
          }
          sx={{ mt: 2, bgcolor: '#201914' }}
        >
          {saving ? 'กำลังสร้างบัญชี...' : 'สร้างบัญชีแฟรนไชส์'}
        </Button>
      </Card>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 2,
        }}
      >
        {plans.map((plan) => (
          <Card
            key={plan.code}
            sx={{
              p: 2.5,
              borderRadius: '18px',
              border: '1px solid #eadfd7',
              boxShadow: 'none',
            }}
          >
            <Chip
              label={`แพ็กเกจ ${plan.code}`}
              sx={{
                mb: 1.5,
                bgcolor: '#f5ece5',
                color: '#60493b',
                fontWeight: 700,
              }}
            />
            <Typography
              sx={{ fontSize: 21, fontWeight: 700, color: '#201914' }}
            >
              {plan.title}
            </Typography>
            <Typography sx={{ mt: 0.5, mb: 2, color: 'text.secondary' }}>
              {plan.description}
            </Typography>
            <Divider sx={{ mb: 1.5 }} />
            {plan.items.map((item) => (
              <Typography key={item} sx={{ mb: 1, color: '#4f4036' }}>
                ✓ {item}
              </Typography>
            ))}
          </Card>
        ))}
      </Box>
    </DashboardMain>
  );
}
