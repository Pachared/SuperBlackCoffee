import { LoginScreen } from '@stackbuild/ui';

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
      onSubmit={(email, password) => {
        if (email && password) {
          sessionStorage.setItem('sbc-admin-session', 'true');
          onLogin();
        }
      }}
    />
  );
}
