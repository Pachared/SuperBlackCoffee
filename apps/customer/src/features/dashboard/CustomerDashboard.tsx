import { useEffect, useState } from 'react';
import { customerSidebarNavigation } from '../../components/sidebar/customerSidebarNavigation';
import { CustomerDashboardLayout } from '../../layouts/CustomerDashboardLayout';
import { CustomerFavoritesPage } from '../../pages/dashboard/CustomerFavoritesPage';
import { CustomerIngredientsPage } from '../../pages/dashboard/CustomerIngredientsPage';
import { CustomerOrdersPage } from '../../pages/dashboard/CustomerOrdersPage';
import { CustomerOverviewPage } from '../../pages/dashboard/CustomerOverviewPage';
import { CustomerRewardsPage } from '../../pages/dashboard/CustomerRewardsPage';

const pages = {
  ภาพรวม: CustomerOverviewPage,
  คำสั่งซื้อของฉัน: CustomerOrdersPage,
  วัตถุดิบ: CustomerIngredientsPage,
  รายการโปรด: CustomerFavoritesPage,
  'สมาชิก & รางวัล': CustomerRewardsPage,
};

type CustomerPage = keyof typeof pages;

function pageFromHistory(): CustomerPage {
  const page = window.history.state?.sbcCustomerPage;
  return typeof page === 'string' && page in pages
    ? (page as CustomerPage)
    : 'ภาพรวม';
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
    >
      <Page />
    </CustomerDashboardLayout>
  );
}
