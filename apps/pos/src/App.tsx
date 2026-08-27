import { useState } from 'react';
import { SbcThemeProvider } from '@stackbuild/ui';
import { PosLoginPage } from './features/auth/PosLoginPage';
import { PosDashboard } from './features/dashboard/PosDashboard';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(
    () => sessionStorage.getItem('sbc-pos-session') === 'true',
  );
  const logout = () => {
    sessionStorage.removeItem('sbc-access-token');
    sessionStorage.removeItem('sbc-pos-session');
    setLoggedIn(false);
  };
  return (
    <SbcThemeProvider>
      {loggedIn ? (
        <PosDashboard logout={logout} />
      ) : (
        <PosLoginPage onLogin={() => setLoggedIn(true)} />
      )}
    </SbcThemeProvider>
  );
}
