import { lazy, Suspense, useEffect, useState } from 'react';
import { posSidebarNavigation } from '../../components/sidebar/posSidebarNavigation';
import { PosDashboardLayout } from '../../layouts/PosDashboardLayout';
const PosOverviewPage = lazy(() =>
  import('../../pages/dashboard/PosOverviewPage').then((module) => ({
    default: module.PosOverviewPage,
  })),
);
const PosReportsPage = lazy(() =>
  import('../../pages/dashboard/PosReportsPage').then((module) => ({
    default: module.PosReportsPage,
  })),
);
const PosOrdersPage = lazy(() =>
  import('../../pages/dashboard/PosOrdersPage').then((module) => ({
    default: module.PosOrdersPage,
  })),
);
const PosIngredientsPage = lazy(() =>
  import('../../pages/dashboard/PosIngredientsPage').then((module) => ({
    default: module.PosIngredientsPage,
  })),
);

const pages = {
  รับออเดอร์: PosOverviewPage,
  รายงาน: PosReportsPage,
  คำสั่งซื้อ: PosOrdersPage,
  วัตถุดิบ: PosIngredientsPage,
};

type PosPage = keyof typeof pages;

function pageFromHistory(): PosPage {
  const page = window.history.state?.sbcPosPage;
  if (page === 'ภาพรวม' || page === 'POS') return 'รับออเดอร์';
  if (page === 'คำสั่งซื้อของฉัน') return 'คำสั่งซื้อ';
  return typeof page === 'string' && page in pages
    ? (page as PosPage)
    : 'รับออเดอร์';
}

export function PosDashboard({ logout }: { logout: () => void }) {
  const [activePage, setActivePage] = useState<PosPage>(pageFromHistory);
  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(
        window.history.state,
        '',
        `${window.location.pathname}${window.location.search}`,
      );
    }
    const syncPage = () => setActivePage(pageFromHistory());
    window.addEventListener('popstate', syncPage);
    return () => window.removeEventListener('popstate', syncPage);
  }, []);
  const navigate = (page: string) => {
    const nextPage = page as PosPage;
    if (nextPage === activePage) return;
    window.history.pushState(
      { ...window.history.state, sbcPosPage: nextPage },
      '',
      `${window.location.pathname}${window.location.search}`,
    );
    setActivePage(nextPage);
  };
  const Page = pages[activePage];
  return (
    <PosDashboardLayout
      activePage={activePage}
      navigation={posSidebarNavigation}
      onNavigate={navigate}
      onLogout={logout}
      forceSidebarCollapsed={activePage === 'รับออเดอร์'}
    >
      <Suspense fallback={null}>
        <Page />
      </Suspense>
    </PosDashboardLayout>
  );
}
