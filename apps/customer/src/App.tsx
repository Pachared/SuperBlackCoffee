import { useState } from 'react';
import { SbcThemeProvider } from '@stackbuild/ui';
import { CustomerLoginPage } from './features/auth/CustomerLoginPage';
import { CustomerDashboard } from './features/dashboard/CustomerDashboard';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(
    () => sessionStorage.getItem('sbc-customer-session') === 'true',
  );
  const logout = () => {
    sessionStorage.removeItem('sbc-access-token');
    sessionStorage.removeItem('sbc-customer-session');
    setLoggedIn(false);
  };
  return (
    <SbcThemeProvider>
      {loggedIn ? (
        <CustomerDashboard logout={logout} />
      ) : (
        <CustomerLoginPage onLogin={() => setLoggedIn(true)} />
      )}
    </SbcThemeProvider>
  );
}
