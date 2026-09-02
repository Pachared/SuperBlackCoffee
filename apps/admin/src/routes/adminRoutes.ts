export const adminPagePaths = {
  ภาพรวม: '/',
  คำสั่งซื้อ: '/orders',
  ประวัติการทำรายการ: '/audit',
  เมนูและสินค้า: '/products',
  วัตถุดิบ: '/ingredients',
  สต๊อก: '/stock',
  จัดซื้อ: '/procurement',
  'สาขา SBC': '/branches',
  สาขาแฟรนไชส์: '/franchise-branches',
  จัดการแฟรนไชส์: '/franchise-management',
  พนักงาน: '/employees',
  แชทลูกค้า: '/customer-chat',
} as const;

export type AdminPage = keyof typeof adminPagePaths;

export function adminPageFromPath(pathname: string): AdminPage {
  return (
    (Object.entries(adminPagePaths).find(
      ([, path]) => path === pathname,
    )?.[0] as AdminPage | undefined) ?? 'ภาพรวม'
  );
}
