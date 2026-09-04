import { lazy, Suspense, useState } from 'react';
import { DashboardMain } from '@stackbuild/ui';
import { useLocation, useNavigate } from 'react-router-dom';
import { EmployeesSkeleton } from '../../../../../packages/management/src/components/skeletons/EmployeesSkeleton';
import { IngredientsSkeleton } from '../../../../../packages/management/src/components/skeletons/IngredientsSkeleton';
import { ProductsSkeleton } from '../../../../../packages/management/src/components/skeletons/ProductsSkeleton';
import { StockSkeleton } from '../../../../../packages/management/src/components/skeletons/StockSkeleton';
import {
  franchiseBranch,
  type FranchisePlan,
} from '../../components/sidebar/franchiseSidebarNavigation';
import { FranchiseOverviewSkeleton } from '../../components/skeletons/FranchiseOverviewSkeleton';
import { FranchiseDashboardLayout } from '../../layouts/FranchiseDashboardLayout';
import {
  franchisePageFromPath,
  franchisePagePaths,
} from '../../routes/franchiseRoutes';

const ProductsManagementPage = lazy(() =>
  import('../../../../../packages/management/src/pages/ProductsManagementPage').then(
    (module) => ({
      default: module.ProductsManagementPage,
    }),
  ),
);
const IngredientsManagementPage = lazy(() =>
  import('../../../../../packages/management/src/pages/IngredientsManagementPage').then(
    (module) => ({
      default: module.IngredientsManagementPage,
    }),
  ),
);
const StockManagementPage = lazy(() =>
  import('../../../../../packages/management/src/pages/StockManagementPage').then(
    (module) => ({
      default: module.StockManagementPage,
    }),
  ),
);
const EmployeesManagementPage = lazy(() =>
  import('../../../../../packages/management/src/pages/EmployeesManagementPage').then(
    (module) => ({
      default: module.EmployeesManagementPage,
    }),
  ),
);
const FranchiseIngredientRequestsPage = lazy(() =>
  import('../../pages/dashboard/FranchiseIngredientRequestsPage').then(
    (module) => ({
      default: module.FranchiseIngredientRequestsPage,
    }),
  ),
);
const FranchiseOverviewPage = lazy(() =>
  import('../../pages/dashboard/FranchiseOverviewPage').then((module) => ({
    default: module.FranchiseOverviewPage,
  })),
);

const readPlan = (): FranchisePlan => {
  const value = sessionStorage.getItem('sbc-franchise-plan');
  return value === 'M' || value === 'L' ? value : 'S';
};

function FranchisePageSkeleton({ page }: { page: string }) {
  const skeleton =
    page === 'ตารางพนักงาน' ? (
      <EmployeesSkeleton franchiseMode />
    ) : page === 'วัตถุดิบ' ? (
      <IngredientsSkeleton />
    ) : page === 'เมนูและสินค้า' ? (
      <ProductsSkeleton />
    ) : page === 'สต๊อก' ? (
      <StockSkeleton />
    ) : (
      <FranchiseOverviewSkeleton />
    );
  return <DashboardMain>{skeleton}</DashboardMain>;
}

export function FranchiseDashboard({ logout }: { logout: () => void }) {
  const location = useLocation();
  const routerNavigate = useNavigate();
  const [plan] = useState<FranchisePlan>(readPlan);
  const activePage = franchisePageFromPath(location.pathname);
  const [collapsed, setCollapsed] = useState(
    () => sessionStorage.getItem('sbc-franchise-sidebar-collapsed') === 'true',
  );
  const navigate = (page: string) => {
    const path =
      franchisePagePaths[page as keyof typeof franchisePagePaths] ?? '/';
    if (path === location.pathname) return;
    sessionStorage.setItem('sbc-franchise-active-page', page);
    routerNavigate(path);
  };
  return (
    <FranchiseDashboardLayout
      activePage={activePage}
      plan={plan}
      onNavigate={navigate}
      onLogout={logout}
      collapsed={collapsed}
      onToggle={() =>
        setCollapsed((value) => {
          const next = !value;
          sessionStorage.setItem(
            'sbc-franchise-sidebar-collapsed',
            String(next),
          );
          return next;
        })
      }
    >
      <Suspense fallback={<FranchisePageSkeleton page={activePage} />}>
        {activePage === 'เมนูและสินค้า' ? (
          <ProductsManagementPage
            activeBranch={franchiseBranch}
            franchisePlan={plan}
            readOnly
          />
        ) : activePage === 'วัตถุดิบ' ? (
          <IngredientsManagementPage
            activeBranch={franchiseBranch}
            franchisePlan={plan}
            readOnly
            allowOrdering
            onRequestCreated={() => navigate('คำขอวัตถุดิบ')}
          />
        ) : activePage === 'คำขอวัตถุดิบ' ? (
          <FranchiseIngredientRequestsPage />
        ) : activePage === 'สต๊อก' ? (
          <StockManagementPage activeBranch={franchiseBranch} readOnly />
        ) : activePage === 'ตารางพนักงาน' ? (
          <EmployeesManagementPage franchiseMode />
        ) : (
          <DashboardMain>
            <FranchiseOverviewPage plan={plan} onNavigate={navigate} />
          </DashboardMain>
        )}
      </Suspense>
    </FranchiseDashboardLayout>
  );
}
