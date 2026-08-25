import { useEffect, useState } from 'react';
import { customerSidebarNavigation } from '../../components/sidebar/customerSidebarNavigation';
import { CustomerDashboardLayout } from '../../layouts/CustomerDashboardLayout';
import { CustomerIngredientsPage } from '../../pages/dashboard/CustomerIngredientsPage';
import { CustomerOrdersPage } from '../../pages/dashboard/CustomerOrdersPage';
import { CustomerOverviewPage } from '../../pages/dashboard/CustomerOverviewPage';
import { CustomerReportsPage } from '../../pages/dashboard/CustomerReportsPage';

const pages = {
  รับออเดอร์: CustomerOverviewPage,
  รายงาน: CustomerReportsPage,
  คำสั่งซื้อ: CustomerOrdersPage,
  วัตถุดิบ: CustomerIngredientsPage,
};

type CustomerPage = keyof typeof pages;

function pageFromHistory(): CustomerPage {
  const page = window.history.state?.sbcCustomerPage;
  if (page === 'ภาพรวม' || page === 'POS') return 'รับออเดอร์';
  if (page === 'คำสั่งซื้อของฉัน') return 'คำสั่งซื้อ';
  return typeof page === 'string' && page in pages
    ? (page as CustomerPage)
    : 'รับออเดอร์';
}

export function CustomerDashboard({ logout }: { logout: () => void }) {
  const [activePage, setActivePage] = useState<CustomerPage>(pageFromHistory);
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
    const nextPage = page as CustomerPage;
    if (nextPage === activePage) return;
    window.history.pushState(
      { ...window.history.state, sbcCustomerPage: nextPage },
      '',
      `${window.location.pathname}${window.location.search}`,
    );
    setActivePage(nextPage);
  };
  const Page = pages[activePage];
  return (
    <CustomerDashboardLayout
      activePage={activePage}
      navigation={customerSidebarNavigation}
      onNavigate={navigate}
      onLogout={logout}
      forceSidebarCollapsed={activePage === 'รับออเดอร์'}
    >
      <Page />
    </CustomerDashboardLayout>
  );
}
