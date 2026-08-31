import { LoginScreen } from '@stackbuild/ui';
import { Alert, Snackbar } from '@mui/material';
import { useState } from 'react';
import { login } from '../../lib/api';

export function PosLoginPage({ onLogin }: { onLogin: () => void }) {
  const [error, setError] = useState('');
  return (
    <>
      <LoginScreen
        headline={
          <>
            <span style={{ display: 'block', whiteSpace: 'nowrap' }}>
              Your daily pause,
            </span>
            <i style={{ color: '#d5ad8b', display: 'block' }}>perfected.</i>
          </>
        }
        description="รสชาติที่คุณรัก พร้อมอยู่ในทุกวันของคุณ"
        submitLabel="เข้าสู่แดชบอร์ด"
        onSubmit={async (username, password) => {
          try {
            const session = await login(username, password);
            if (
              !['branch_manager', 'franchise_owner', 'cashier'].includes(
                session.user.role,
              )
            ) {
              throw new Error('บัญชีนี้ไม่มีสิทธิ์เข้าระบบสาขา');
            }
            sessionStorage.setItem('sbc-access-token', session.accessToken);
            sessionStorage.setItem('sbc-pos-session', 'true');
            onLogin();
          } catch (error) {
            setError(
              error instanceof Error ? error.message : 'เข้าสู่ระบบไม่สำเร็จ',
            );
          }
        }}
      />
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={4000}
        onClose={() => setError('')}
      >
        <Alert severity="error" variant="filled" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}
