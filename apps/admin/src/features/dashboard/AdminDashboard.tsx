import { useEffect, useRef, useState } from 'react';
import { coffeeIngredientsImage } from '@stackbuild/ui';
import { adminSidebarNavigation } from '../../components/sidebar/adminSidebarNavigation';
import {
  IngredientBranchesSidebar,
  type IngredientBranch,
} from '../../components/sidebar/IngredientBranchesSidebar';
import { AdminDashboardLayout } from '../../layouts/AdminDashboardLayout';
import { AdminBranchesPage } from '../../pages/dashboard/AdminBranchesPage';
import { AdminCustomerChatPage } from '../../pages/dashboard/AdminCustomerChatPage';
import { AdminFranchiseBranchesPage } from '../../pages/dashboard/AdminFranchiseBranchesPage';
import { AdminIngredientsPage } from '../../pages/dashboard/AdminIngredientsPage';
import { AdminOrdersPage } from '../../pages/dashboard/AdminOrdersPage';
import { AdminOverviewPage } from '../../pages/dashboard/AdminOverviewPage';
import { AdminProductsPage } from '../../pages/dashboard/AdminProductsPage';
import { AdminStockPage } from '../../pages/dashboard/AdminStockPage';

const pages = {
  ภาพรวม: AdminOverviewPage,
  คำสั่งซื้อ: AdminOrdersPage,
  เมนูและสินค้า: AdminProductsPage,
  วัตถุดิบ: AdminIngredientsPage,
  สต๊อก: AdminStockPage,
  'สาขา SBC': AdminBranchesPage,
  สาขาแฟรนไชส์: AdminFranchiseBranchesPage,
  แชทลูกค้า: AdminCustomerChatPage,
};

type AdminPage = keyof typeof pages;

function pageFromHistory(): AdminPage {
  const page = window.history.state?.sbcAdminPage;
  if (page === 'สาขา') return 'สาขา SBC';
  if (page === 'วัตถุดิบและสต๊อก') return 'วัตถุดิบ';
  return typeof page === 'string' && page in pages
    ? (page as AdminPage)
    : 'ภาพรวม';
}

export function AdminDashboard({ logout }: { logout: () => void }) {
  const [activePage, setActivePage] = useState<AdminPage>(pageFromHistory);
  const [activeIngredientBranch, setActiveIngredientBranch] =
    useState<IngredientBranch>('ทุกสาขา');
  const scrollbarTimeoutRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    const ingredientImage = new Image();
    ingredientImage.src = coffeeIngredientsImage;
    void ingredientImage.decode().catch(() => undefined);
  }, []);
  useEffect(() => {
    const revealScrollbars = () => {
      document.documentElement.classList.add('sbc-is-scrolling');
      window.clearTimeout(scrollbarTimeoutRef.current);
      scrollbarTimeoutRef.current = window.setTimeout(
        () => document.documentElement.classList.remove('sbc-is-scrolling'),
        700,
      );
    };
    window.addEventListener('scroll', revealScrollbars, true);
    return () => {
      window.removeEventListener('scroll', revealScrollbars, true);
      window.clearTimeout(scrollbarTimeoutRef.current);
      document.documentElement.classList.remove('sbc-is-scrolling');
    };
  }, []);
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
    const nextPage = page as AdminPage;
    if (nextPage === activePage) return;
    window.history.pushState(
      { ...window.history.state, sbcAdminPage: nextPage },
      '',
      `${window.location.pathname}${window.location.search}`,
    );
    setActivePage(nextPage);
  };
  const isIngredientPage = activePage === 'วัตถุดิบ';
  const isStockPage = activePage === 'สต๊อก';
  const hasBranchSidebar =
    isIngredientPage ||
    isStockPage ||
    activePage === 'เมนูและสินค้า' ||
    activePage === 'คำสั่งซื้อ';
  const pageContent = isIngredientPage ? (
    <AdminIngredientsPage activeBranch={activeIngredientBranch} />
  ) : activePage === 'ภาพรวม' ? (
    <AdminOverviewPage />
  ) : activePage === 'คำสั่งซื้อ' ? (
    <AdminOrdersPage activeBranch={activeIngredientBranch} />
  ) : isStockPage ? (
    <AdminStockPage activeBranch={activeIngredientBranch} />
  ) : activePage === 'เมนูและสินค้า' ? (
    <AdminProductsPage activeBranch={activeIngredientBranch} />
  ) : activePage === 'แชทลูกค้า' ? (
    <AdminCustomerChatPage />
  ) : activePage === 'สาขาแฟรนไชส์' ? (
    <AdminFranchiseBranchesPage />
  ) : (
    <AdminBranchesPage />
  );
  const pageTitle = isIngredientPage
    ? activeIngredientBranch === 'ทุกสาขา'
      ? 'วัตถุดิบ ทุกสาขา'
      : `วัตถุดิบ สาขา${activeIngredientBranch}`
    : isStockPage
      ? activeIngredientBranch === 'ทุกสาขา'
        ? 'สต๊อก ทุกสาขา'
        : `สต๊อก สาขา${activeIngredientBranch}`
      : activePage === 'เมนูและสินค้า'
        ? activeIngredientBranch === 'ทุกสาขา'
          ? 'เมนูและสินค้า ทุกสาขา'
          : `เมนูและสินค้า สาขา${activeIngredientBranch}`
        : activePage === 'คำสั่งซื้อ'
          ? activeIngredientBranch === 'ทุกสาขา'
            ? 'คำสั่งซื้อ ทุกสาขา'
            : `คำสั่งซื้อ สาขา${activeIngredientBranch}`
          : activePage;
  return (
    <AdminDashboardLayout
      activePage={activePage}
      pageTitle={pageTitle}
      navigation={adminSidebarNavigation}
      onNavigate={navigate}
      onLogout={logout}
      forceSidebarCollapsed={hasBranchSidebar}
      secondarySidebarVisible={hasBranchSidebar}
      secondarySidebar={
        <IngredientBranchesSidebar
          activeBranch={activeIngredientBranch}
          onBranchChange={setActiveIngredientBranch}
          visible={hasBranchSidebar}
        />
      }
    >
      {pageContent}
    </AdminDashboardLayout>
  );
}
