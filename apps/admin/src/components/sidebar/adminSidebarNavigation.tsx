import {
  BoxIcon,
  BoxesIcon,
  LayoutGridIcon,
  MapPinHouseIcon,
  MapPinPlusIcon,
  MessageSquareIcon,
  ReceiptIcon,
  ReceiptTextIcon,
} from '@stackbuild/ui';

export const adminSidebarNavigation = [
  { label: 'ภาพรวม', icon: <LayoutGridIcon /> },
  { label: 'คำสั่งซื้อ', icon: <ReceiptIcon /> },
  { label: 'ประวัติการทำรายการ', icon: <ReceiptTextIcon /> },
  { label: 'เมนูและสินค้า', icon: <ReceiptTextIcon /> },
  { label: 'วัตถุดิบ', icon: <BoxesIcon /> },
  { label: 'สต๊อก', icon: <BoxIcon /> },
  { label: 'สาขา SBC', icon: <MapPinHouseIcon /> },
  { label: 'สาขาแฟรนไชส์', icon: <MapPinPlusIcon /> },
  { label: 'แชทลูกค้า', icon: <MessageSquareIcon />, badge: 2 },
];
