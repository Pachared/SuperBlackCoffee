import { LoginScreen } from '@stackbuild/ui';
import { login } from '../../lib/api';

export function CustomerLoginPage({ onLogin }: { onLogin: () => void }) {
  return (
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
      onSubmit={async (email, password) => {
        try {
          const session = await login(email, password);
          if (!['branch_manager', 'franchise_owner', 'cashier'].includes(session.user.role)) {
            throw new Error('บัญชีนี้ไม่มีสิทธิ์เข้าระบบสาขา');
          }
          sessionStorage.setItem('sbc-access-token', session.accessToken);
          sessionStorage.setItem('sbc-customer-session', 'true');
          onLogin();
        } catch (error) {
          window.alert(error instanceof Error ? error.message : 'เข้าสู่ระบบไม่สำเร็จ');
        }
      }}
    />
  );
}
