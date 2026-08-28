import { secured } from './client';

export type StockRequest = {
  id: number;
  status: 'pending' | 'approved' | 'preparing' | 'completed' | 'rejected';
  createdAt: string;
  branch: { id: number; name: string };
  items: { name: string; quantity: number; unit: string }[];
};
export const listStockRequests = () =>
  secured<StockRequest[]>('/stock-requests');
export const updateStockRequestStatus = (
  id: number,
  status: 'approved' | 'preparing' | 'completed' | 'rejected',
) =>
  secured<{ id: number; status: string }>(`/stock-requests/${id}/status`, {
    method: 'PATCH',
    data: { status },
  });
