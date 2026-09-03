import { secured } from './client';

export type StockRequestStatus =
  'pending' | 'approved' | 'preparing' | 'completed' | 'rejected';

export type StockRequest = {
  id: number;
  status: StockRequestStatus;
  note: string;
  createdAt: string;
  branch: { id: number; name: string };
  items: { name: string; quantity: number; unit: string }[];
};

export type CreateStockRequestInput = {
  note?: string;
  items: {
    inventoryItemId: number;
    name: string;
    quantity: number;
    unit: string;
  }[];
};

export const listStockRequests = () =>
  secured<StockRequest[]>('/stock-requests');

export const createStockRequest = (data: CreateStockRequestInput) =>
  secured<{ id: number; status: StockRequestStatus }>('/stock-requests', {
    method: 'POST',
    data,
  });
