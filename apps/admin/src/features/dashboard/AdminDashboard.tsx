import { useEffect, useState } from 'react';
import { coffeeIngredientsImage } from '@stackbuild/ui';
import { adminSidebarNavigation } from '../../components/sidebar/adminSidebarNavigation';
import { IngredientBranchesSidebar, type IngredientBranch } from '../../components/sidebar/IngredientBranchesSidebar';
import { AdminDashboardLayout } from '../../layouts/AdminDashboardLayout';
import { AdminBranchesPage } from '../../pages/dashboard/AdminBranchesPage';
import { AdminIngredientsPage } from '../../pages/dashboard/AdminIngredientsPage';
import { AdminOrdersPage } from '../../pages/dashboard/AdminOrdersPage';
import { AdminOverviewPage } from '../../pages/dashboard/AdminOverviewPage';
import { AdminProductsPage } from '../../pages/dashboard/AdminProductsPage';

const pages = {
  ภาพรวม: AdminOverviewPage,
  คำสั่งซื้อ: AdminOrdersPage,
  เมนูและสินค้า: AdminProductsPage,
  วัตถุดิบ: AdminIngredientsPage,
  'สาขา SBC': AdminBranchesPage,
};

type AdminPage = keyof typeof pages;

function pageFromHistory(): AdminPage {
  const page = window.history.state?.sbcAdminPage;
  if (page === 'สาขา') return 'สาขา SBC';
  return typeof page === 'string' && page in pages
    ? (page as AdminPage)
    : 'ภาพรวม';
}

export function AdminDashboard({ logout }: { logout: () => void }) {
  const [activePage, setActivePage] = useState<AdminPage>(pageFromHistory);
  const [activeIngredientBranch, setActiveIngredientBranch] = useState<IngredientBranch>('ทุกสาขา');
  useEffect(() => {
    const ingredientImage = new Image();
    ingredientImage.src = coffeeIngredientsImage;
    void ingredientImage.decode().catch(() => undefined);
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
  const hasBranchSidebar = isIngredientPage || activePage === 'เมนูและสินค้า' || activePage === 'คำสั่งซื้อ';
  const pageContent = isIngredientPage
    ? <AdminIngredientsPage activeBranch={activeIngredientBranch} />
    : activePage === 'ภาพรวม'
      ? <AdminOverviewPage />
      : activePage === 'คำสั่งซื้อ'
        ? <AdminOrdersPage activeBranch={activeIngredientBranch} />
        : activePage === 'เมนูและสินค้า'
          ? <AdminProductsPage activeBranch={activeIngredientBranch} />
          : <AdminBranchesPage />;
  const pageTitle = isIngredientPage
    ? activeIngredientBranch === 'ทุกสาขา'
      ? 'วัตถุดิบ ทุกสาขา'
      : `วัตถุดิบ สาขา${activeIngredientBranch}`
    : activePage === 'เมนูและสินค้า'
      ? activeIngredientBranch === 'ทุกสาขา' ? 'เมนูและสินค้า ทุกสาขา' : `เมนูและสินค้า สาขา${activeIngredientBranch}`
      : activePage === 'คำสั่งซื้อ'
        ? activeIngredientBranch === 'ทุกสาขา' ? 'คำสั่งซื้อ ทุกสาขา' : `คำสั่งซื้อ สาขา${activeIngredientBranch}`
      : activePage;
  return <AdminDashboardLayout activePage={activePage} pageTitle={pageTitle} navigation={adminSidebarNavigation} onNavigate={navigate} onLogout={logout} forceSidebarCollapsed={hasBranchSidebar} secondarySidebarVisible={hasBranchSidebar} secondarySidebar={<IngredientBranchesSidebar activeBranch={activeIngredientBranch} onBranchChange={setActiveIngredientBranch} visible={hasBranchSidebar} />}>{pageContent}</AdminDashboardLayout>;
}
