import { BoxIcon, BoxesIcon, LayoutGridIcon, MapPinHouseIcon, ReceiptIcon } from '@stackbuild/ui';

export const adminSidebarNavigation = [
  { label: 'ภาพรวม', icon: <LayoutGridIcon /> },
  { label: 'คำสั่งซื้อ', icon: <ReceiptIcon /> },
  { label: 'เมนูและสินค้า', icon: <BoxIcon /> },
  { label: 'วัตถุดิบ', icon: <BoxesIcon /> },
  { label: 'สาขา SBC', icon: <MapPinHouseIcon /> },
];
