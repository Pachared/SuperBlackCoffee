import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { DashboardMain, coffeeIngredientsImage } from '@stackbuild/ui';
import { adminSidebarNavigation } from '../../components/sidebar/adminSidebarNavigation';
import {
  IngredientBranchesSidebar,
  type IngredientBranch,
} from '../../components/sidebar/IngredientBranchesSidebar';
import { AdminDashboardLayout } from '../../layouts/AdminDashboardLayout';
import { AdminOverviewSkeleton } from '../../components/skeletons/AdminOverviewSkeleton';
import { AdminAuditSkeleton } from '../../components/skeletons/AdminAuditSkeleton';
import { AdminBranchesSkeleton } from '../../components/skeletons/AdminBranchesSkeleton';
import { AdminCustomerChatSkeleton } from '../../components/skeletons/AdminCustomerChatSkeleton';
import { AdminIngredientsSkeleton } from '../../components/skeletons/AdminIngredientsSkeleton';
import { AdminOrdersSkeleton } from '../../components/skeletons/AdminOrdersSkeleton';
import { AdminProcurementSkeleton } from '../../components/skeletons/AdminProcurementSkeleton';
import { AdminProductsSkeleton } from '../../components/skeletons/AdminProductsSkeleton';
import { AdminStockSkeleton } from '../../components/skeletons/AdminStockSkeleton';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  adminPageFromPath,
  adminPagePaths,
  type AdminPage,
} from '../../routes/adminRoutes';
const AdminBranchesPage = lazy(() =>
  import('../../pages/dashboard/AdminBranchesPage').then((module) => ({
    default: module.AdminBranchesPage,
  })),
);
const AdminCustomerChatPage = lazy(() =>
  import('../../pages/dashboard/AdminCustomerChatPage').then((module) => ({
    default: module.AdminCustomerChatPage,
  })),
);
const AdminFranchiseBranchesPage = lazy(() =>
  import('../../pages/dashboard/AdminFranchiseBranchesPage').then((module) => ({
    default: module.AdminFranchiseBranchesPage,
  })),
);
const AdminIngredientsPage = lazy(() =>
  import('../../pages/dashboard/AdminIngredientsPage').then((module) => ({
    default: module.AdminIngredientsPage,
  })),
);
const AdminOrdersPage = lazy(() =>
  import('../../pages/dashboard/AdminOrdersPage').then((module) => ({
    default: module.AdminOrdersPage,
  })),
);
const AdminAuditPage = lazy(() =>
  import('../../pages/dashboard/AdminAuditPage').then((module) => ({
    default: module.AdminAuditPage,
  })),
);
const AdminOverviewPage = lazy(() =>
  import('../../pages/dashboard/AdminOverviewPage').then((module) => ({
    default: module.AdminOverviewPage,
  })),
);
const AdminProductsPage = lazy(() =>
  import('../../pages/dashboard/AdminProductsPage').then((module) => ({
    default: module.AdminProductsPage,
  })),
);
const AdminStockPage = lazy(() =>
  import('../../pages/dashboard/AdminStockPage').then((module) => ({
    default: module.AdminStockPage,
  })),
);
const AdminProcurementPage = lazy(() =>
  import('../../pages/dashboard/AdminProcurementPage').then((module) => ({
    default: module.AdminProcurementPage,
  })),
);

function DashboardPageSkeleton({ page }: { page: AdminPage }) {
  const skeleton =
    page === 'ภาพรวม' ? (
      <AdminOverviewSkeleton />
    ) : page === 'สาขา Super Black Coffee' ? (
      <AdminBranchesSkeleton />
    ) : page === 'คำสั่งซื้อ' ? (
      <AdminOrdersSkeleton />
    ) : page === 'ประวัติการทำรายการ' ? (
      <AdminAuditSkeleton />
    ) : page === 'สต๊อก' ? (
      <AdminStockSkeleton />
    ) : page === 'จัดซื้อ' ? (
      <AdminProcurementSkeleton />
    ) : page === 'เมนูและสินค้า' ? (
      <AdminProductsSkeleton />
    ) : page === 'วัตถุดิบ' ? (
      <AdminIngredientsSkeleton />
    ) : page === 'แชทลูกค้า' ? (
      <AdminCustomerChatSkeleton />
    ) : (
      <AdminBranchesSkeleton />
    );
  return <DashboardMain>{skeleton}</DashboardMain>;
}

export function AdminDashboard({ logout }: { logout: () => void }) {
  const location = useLocation();
  const routerNavigate = useNavigate();
  const activePage = adminPageFromPath(location.pathname);
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
  const navigate = (page: string) => {
    const nextPage = page as AdminPage;
    if (nextPage === activePage) return;
    routerNavigate(adminPagePaths[nextPage]);
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
    <AdminOverviewPage onNavigate={navigate} />
  ) : activePage === 'คำสั่งซื้อ' ? (
    <AdminOrdersPage activeBranch={activeIngredientBranch} />
  ) : activePage === 'ประวัติการทำรายการ' ? (
    <AdminAuditPage />
  ) : isStockPage ? (
    <AdminStockPage activeBranch={activeIngredientBranch} />
  ) : activePage === 'จัดซื้อ' ? (
    <AdminProcurementPage />
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
      <Suspense fallback={<DashboardPageSkeleton page={activePage} />}>
        {pageContent}
      </Suspense>
    </AdminDashboardLayout>
  );
}
