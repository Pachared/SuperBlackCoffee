import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { DashboardMain, coffeeIngredientsImage } from '@stackbuild/ui';
import {
  EmployeesSkeleton,
  IngredientsSkeleton,
  ProductsSkeleton,
  StockSkeleton,
  BranchesSidebar,
  type Branch,
} from '@stackbuild/management';
import { adminSidebarNavigation } from '../../components/sidebar/adminSidebarNavigation';
import { AdminDashboardLayout } from '../../layouts/AdminDashboardLayout';
import { AdminOverviewSkeleton } from '../../components/skeletons/AdminOverviewSkeleton';
import { AdminAuditSkeleton } from '../../components/skeletons/AdminAuditSkeleton';
import { AdminBranchesSkeleton } from '../../components/skeletons/AdminBranchesSkeleton';
import { AdminCustomerChatSkeleton } from '../../components/skeletons/AdminCustomerChatSkeleton';
import { AdminOrdersSkeleton } from '../../components/skeletons/AdminOrdersSkeleton';
import { AdminProcurementSkeleton } from '../../components/skeletons/AdminProcurementSkeleton';
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
const AdminFranchiseManagementPage = lazy(() =>
  import('../../pages/dashboard/AdminFranchiseManagementPage').then(
    (module) => ({
      default: module.AdminFranchiseManagementPage,
    }),
  ),
);
const AdminEmployeesPage = lazy(() =>
  import('../../pages/dashboard/management').then((module) => ({
    default: module.EmployeesManagementPage,
  })),
);
const AdminIngredientsPage = lazy(() =>
  import('../../pages/dashboard/management').then((module) => ({
    default: module.IngredientsManagementPage,
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
  import('../../pages/dashboard/management').then((module) => ({
    default: module.ProductsManagementPage,
  })),
);
const AdminStockPage = lazy(() =>
  import('../../pages/dashboard/management').then((module) => ({
    default: module.StockManagementPage,
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
    ) : page === 'สาขา SBC' ? (
      <AdminBranchesSkeleton />
    ) : page === 'คำสั่งซื้อ' ? (
      <AdminOrdersSkeleton />
    ) : page === 'ประวัติการทำรายการ' ? (
      <AdminAuditSkeleton />
    ) : page === 'สต๊อก' ? (
      <StockSkeleton />
    ) : page === 'จัดซื้อ' ? (
      <AdminProcurementSkeleton />
    ) : page === 'เมนูและสินค้า' ? (
      <ProductsSkeleton />
    ) : page === 'วัตถุดิบ' ? (
      <IngredientsSkeleton />
    ) : page === 'แชทลูกค้า' ? (
      <AdminCustomerChatSkeleton />
    ) : page === 'พนักงาน' ? (
      <EmployeesSkeleton />
    ) : (
      <AdminBranchesSkeleton />
    );
  return <DashboardMain>{skeleton}</DashboardMain>;
}

export function AdminDashboard({ logout }: { logout: () => void }) {
  const location = useLocation();
  const routerNavigate = useNavigate();
  const activePage = adminPageFromPath(location.pathname);
  const [activeBranch, setActiveBranch] = useState<Branch>('ทุกสาขา');
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
  const isEmployeesPage = activePage === 'พนักงาน';
  const hasBranchSidebar =
    isIngredientPage ||
    isStockPage ||
    activePage === 'เมนูและสินค้า' ||
    activePage === 'คำสั่งซื้อ';
  const pageContent = isIngredientPage ? (
    <AdminIngredientsPage activeBranch={activeBranch} />
  ) : activePage === 'ภาพรวม' ? (
    <AdminOverviewPage onNavigate={navigate} />
  ) : activePage === 'คำสั่งซื้อ' ? (
    <AdminOrdersPage activeBranch={activeBranch} />
  ) : activePage === 'ประวัติการทำรายการ' ? (
    <AdminAuditPage />
  ) : isStockPage ? (
    <AdminStockPage activeBranch={activeBranch} />
  ) : activePage === 'จัดซื้อ' ? (
    <AdminProcurementPage />
  ) : activePage === 'เมนูและสินค้า' ? (
    <AdminProductsPage activeBranch={activeBranch} />
  ) : activePage === 'แชทลูกค้า' ? (
    <AdminCustomerChatPage />
  ) : activePage === 'สาขาแฟรนไชส์' ? (
    <AdminFranchiseBranchesPage />
  ) : activePage === 'จัดการแฟรนไชส์' ? (
    <AdminFranchiseManagementPage />
  ) : activePage === 'พนักงาน' ? (
    <AdminEmployeesPage />
  ) : (
    <AdminBranchesPage />
  );
  const pageTitle = isIngredientPage
    ? activeBranch === 'ทุกสาขา'
      ? 'วัตถุดิบ ทุกสาขา'
      : `วัตถุดิบ สาขา${activeBranch}`
    : isStockPage
      ? activeBranch === 'ทุกสาขา'
        ? 'สต๊อก ทุกสาขา'
        : `สต๊อก สาขา${activeBranch}`
      : activePage === 'เมนูและสินค้า'
        ? activeBranch === 'ทุกสาขา'
          ? 'เมนูและสินค้า ทุกสาขา'
          : `เมนูและสินค้า สาขา${activeBranch}`
        : activePage === 'คำสั่งซื้อ'
          ? activeBranch === 'ทุกสาขา'
            ? 'คำสั่งซื้อ ทุกสาขา'
            : `คำสั่งซื้อ สาขา${activeBranch}`
          : activePage === 'สาขา SBC'
            ? 'สาขา Super Black Coffee'
            : activePage;
  return (
    <AdminDashboardLayout
      activePage={activePage}
      pageTitle={pageTitle}
      navigation={adminSidebarNavigation}
      onNavigate={navigate}
      onLogout={logout}
      forceSidebarCollapsed={hasBranchSidebar || isEmployeesPage}
      secondarySidebarVisible={hasBranchSidebar}
      secondarySidebar={
        <BranchesSidebar
          activeBranch={activeBranch}
          onBranchChange={setActiveBranch}
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
