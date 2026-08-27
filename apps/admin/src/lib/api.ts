const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1';

type ApiEnvelope<T> = { success: boolean; data: T; message?: string };
type AuthSession = { accessToken: string; user: { id: number; name: string; role: string } };

export async function login(username: string, password: string): Promise<AuthSession> {
  const response = await fetch(`${apiUrl}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }),
  });
  const body = (await response.json()) as ApiEnvelope<AuthSession>;
  if (!response.ok || !body.success) throw new Error(body.message ?? 'ไม่สามารถเข้าสู่ระบบได้');
  return body.data;
}

export type StockRequest = {
  id: number;
  status: 'pending' | 'approved' | 'preparing' | 'completed' | 'rejected';
  createdAt: string;
  branch: { id: number; name: string };
  items: { name: string; quantity: number; unit: string }[];
};

async function secured<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionStorage.getItem('sbc-access-token') ?? ''}`, ...options.headers },
  });
  const body = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || !body.success) throw new Error(body.message ?? 'ไม่สามารถเชื่อมต่อระบบได้');
  return body.data;
}

export const listStockRequests = () => secured<StockRequest[]>('/stock-requests');
export const updateStockRequestStatus = (id: number, status: 'approved' | 'preparing' | 'completed') => secured<{ id: number; status: string }>(`/stock-requests/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });

export type DashboardSummary = { todaySales: number; todayOrders: number };
export const getDashboardSummary = () => secured<DashboardSummary>('/dashboard');

export type BranchSales = {
  id: number;
  name: string;
  code: string;
  status: 'active' | 'inactive' | 'maintenance';
  sales: number;
  orders: number;
};
export const listBranchSales = (period: 'today' | 'month' | 'year') => secured<BranchSales[]>(`/branches/sales?period=${period}`);

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
};

export type MenuItem = {
  id: number;
  name: string;
  category: string;
  storePrice: number;
  linemanPrice: number;
  costPrice: number;
  status: 'available' | 'soldout';
  ingredients: { inventoryItemId: number; name: string; quantity: number; unit: string; costAmount: number }[];
};

export const listInventory = (kind: 'ingredient' | 'stock', branchCode = 'SBC-AYA-001') => secured<InventoryItem[]>(`/inventory?branchCode=${encodeURIComponent(branchCode)}&kind=${kind}`);
export const listMenuItems = (branchCode = 'SBC-AYA-001') => secured<MenuItem[]>(`/menu-items?branchCode=${encodeURIComponent(branchCode)}`);
