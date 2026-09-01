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
  { label: 'ภาพรวม', icon: <LayoutGridIcon />, group: 'ภาพรวม' },
  { label: 'คำสั่งซื้อ', icon: <ReceiptIcon />, group: 'งานขายและคำขอ' },
  {
    label: 'เมนูและสินค้า',
    icon: <ReceiptTextIcon />,
    group: 'สินค้าและสต๊อก',
  },
  { label: 'วัตถุดิบ', icon: <BoxesIcon />, group: 'สินค้าและสต๊อก' },
  { label: 'สต๊อก', icon: <BoxIcon />, group: 'สินค้าและสต๊อก' },
  { label: 'จัดซื้อ', icon: <ReceiptTextIcon />, group: 'สินค้าและสต๊อก' },
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
    label: 'ประวัติการทำรายการ',
    icon: <ReceiptTextIcon />,
    group: 'การติดตาม',
  },
  {
    label: 'แชทลูกค้า',
    icon: <MessageSquareIcon />,
    badge: 2,
    group: 'การติดตาม',
  },
];
