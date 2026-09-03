import { secured } from './client';

export type InventoryItem = {
  id: number;
  name: string;
  category: string;
  kind: 'ingredient' | 'stock';
  quantity: number;
  unit: string;
  reorderLevel: number;
  unitCost: number;
  status: 'ready' | 'low' | 'out';
  imageUrl: string;
};

export const listInventory = (
  kind: 'ingredient' | 'stock',
  branchCode = 'SBC-AYA-001',
) =>
  secured<InventoryItem[]>(
    `/inventory?branchCode=${encodeURIComponent(branchCode)}&kind=${kind}`,
  );
