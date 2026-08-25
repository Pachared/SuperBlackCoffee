import { LoginScreen } from '@stackbuild/ui';
import { login } from '../../lib/api';

export function AdminLoginPage({ onLogin }: { onLogin: () => void }) {
  return (
    <LoginScreen
      headline={
        <>
          Run coffee.
          <br />
          <i style={{ color: '#d5ad8b' }}>Beautifully.</i>
        </>
      }
      description="ทุกแก้วที่ดี เริ่มจากการจัดการที่ดี"
      submitLabel="เข้าสู่ระบบผู้ดูแล"
      onSubmit={async (email, password) => {
        try {
          const session = await login(email, password);
          if (session.user.role !== 'admin') throw new Error('บัญชีนี้ไม่มีสิทธิ์ผู้ดูแลระบบ');
          sessionStorage.setItem('sbc-access-token', session.accessToken);
          sessionStorage.setItem('sbc-admin-session', 'true');
          onLogin();
        } catch (error) {
          window.alert(error instanceof Error ? error.message : 'เข้าสู่ระบบไม่สำเร็จ');
        }
      }}
    />
  );
}
