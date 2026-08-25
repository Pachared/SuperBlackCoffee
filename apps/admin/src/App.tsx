import { useState } from 'react';
import { SbcThemeProvider } from '@stackbuild/ui';
import { AdminLoginPage } from './features/auth/AdminLoginPage';
import { AdminDashboard } from './features/dashboard/AdminDashboard';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(
    () => sessionStorage.getItem('sbc-admin-session') === 'true',
  );
  const logout = () => {
    sessionStorage.removeItem('sbc-access-token');
    sessionStorage.removeItem('sbc-admin-session');
    setLoggedIn(false);
  };
  return (
    <SbcThemeProvider secondary="#8f6040" background="#fbfaf8">
      {loggedIn ? (
        <AdminDashboard logout={logout} />
      ) : (
        <AdminLoginPage onLogin={() => setLoggedIn(true)} />
      )}
    </SbcThemeProvider>
  );
}
