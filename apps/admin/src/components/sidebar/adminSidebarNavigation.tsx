import {
  BoxIcon,
  BoxesIcon,
  LayoutGridIcon,
  MapPinHouseIcon,
  MapPinPlusIcon,
  MessageSquareIcon,
  ReceiptIcon,
  ReceiptTextIcon,
  UsersIcon,
} from '@stackbuild/ui';

export const adminSidebarNavigation = [
  { label: 'ภาพรวม', icon: <LayoutGridIcon />, group: 'ภาพรวม' },
  { label: 'คำสั่งซื้อ', icon: <ReceiptIcon />, group: 'งานประจำวัน' },
  {
    label: 'เมนูและสินค้า',
    icon: <ReceiptTextIcon />,
    group: 'สินค้าและคลัง',
  },
  { label: 'สต๊อก', icon: <BoxIcon />, group: 'สินค้าและคลัง' },
  { label: 'วัตถุดิบ', icon: <BoxesIcon />, group: 'สินค้าและคลัง' },
  { label: 'จัดซื้อ', icon: <ReceiptTextIcon />, group: 'สินค้าและคลัง' },
  {
    label: 'สาขา SBC',
    icon: <MapPinHouseIcon />,
    group: 'สาขาและแฟรนไชส์',
  },
  {
    label: 'สาขาแฟรนไชส์',
    icon: <MapPinPlusIcon />,
    group: 'สาขาและแฟรนไชส์',
  },
  {
    label: 'จัดการแฟรนไชส์',
    icon: <MapPinPlusIcon />,
    group: 'สาขาและแฟรนไชส์',
  },
  { label: 'พนักงาน', icon: <UsersIcon />, group: 'สาขาและแฟรนไชส์' },
  {
    label: 'แชทลูกค้า',
    icon: <MessageSquareIcon />,
    badge: 2,
    group: 'ติดตามและตรวจสอบ',
  },
  {
    label: 'ประวัติการทำรายการ',
    icon: <ReceiptTextIcon />,
    group: 'ติดตามและตรวจสอบ',
  },
];
