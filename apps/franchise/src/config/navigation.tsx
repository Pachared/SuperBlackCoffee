import {
  BoxIcon,
  BoxesIcon,
  LayoutGridIcon,
  ReceiptIcon,
  ReceiptTextIcon,
  UsersIcon,
} from '@stackbuild/ui';

export const franchiseBranch = 'อยุธยา' as const;
export const navigation = [
  { label: 'ภาพรวม', icon: <LayoutGridIcon />, group: 'ภาพรวม' },
  { label: 'คำสั่งซื้อ', icon: <ReceiptIcon />, group: 'งานประจำวัน' },
  { label: 'เมนูและสินค้า', icon: <ReceiptTextIcon />, group: 'สินค้าและคลัง' },
  { label: 'สต๊อก', icon: <BoxIcon />, group: 'สินค้าและคลัง' },
  { label: 'วัตถุดิบ', icon: <BoxesIcon />, group: 'สินค้าและคลัง' },
  {
    label: 'เอกสารและคำขอ',
    icon: <ReceiptIcon />,
    group: 'เอกสารและการสนับสนุน',
  },
  {
    label: 'คู่มือการดำเนินงาน',
    icon: <BoxIcon />,
    group: 'เอกสารและการสนับสนุน',
  },
  { label: 'พนักงาน', icon: <UsersIcon />, group: 'บุคลากร' },
] as const;

export type FranchisePlan = 'S' | 'M' | 'L';
export const navigationForPlan = (plan: FranchisePlan) =>
  navigation.filter((item) => plan === 'L' || item.label !== 'สต๊อก');
