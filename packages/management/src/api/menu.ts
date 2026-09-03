import { secured } from './client';

export type MenuItem = {
  id: number;
  name: string;
  category: string;
  storePrice: number;
  storePriceAvailable: boolean;
  linemanPrice: number;
  linemanPriceAvailable: boolean;
  linemanCostPrice: number;
  costPrice: number;
  status: 'available' | 'soldout';
  ingredients: {
    inventoryItemId: number;
    name: string;
    quantity: number;
    unit: string;
    costAmount: number;
  }[];
  imageUrl: string;
};

export const listMenuItems = (branchCode = 'SBC-AYA-001') =>
  secured<MenuItem[]>(
    `/menu-items?branchCode=${encodeURIComponent(branchCode)}`,
  );
