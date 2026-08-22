import { LoginScreen } from '@stackbuild/ui';

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
      onSubmit={(email, password) => {
        if (email && password) {
          sessionStorage.setItem('sbc-customer-session', 'true');
          onLogin();
        }
      }}
    />
  );
}
