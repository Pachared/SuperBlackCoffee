const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1';

export type AuthSession = {
  accessToken: string;
  user: { id: number; name: string; role: string; franchiseeId?: number; branchId?: number };
};

type ApiEnvelope<T> = { success: boolean; data: T; message?: string };

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = sessionStorage.getItem('sbc-access-token');
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (response.status === 204) return undefined as T;
  const body = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || !body.success) throw new Error(body.message ?? 'ไม่สามารถเชื่อมต่อระบบได้');
  return body.data;
}

export async function login(email: string, password: string) {
  return api<AuthSession>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export type InventoryItem = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
  status: 'ready' | 'low' | 'out';
};

export const listInventory = () => api<InventoryItem[]>('/inventory');
export const createInventory = (item: Omit<InventoryItem, 'id' | 'status'>) => api<{ id: number }>('/inventory', { method: 'POST', body: JSON.stringify(item) });
export const updateInventory = (id: number, item: Omit<InventoryItem, 'id' | 'status'>) => api<{ id: number }>(`/inventory/${id}`, { method: 'PATCH', body: JSON.stringify(item) });
export const deleteInventory = (id: number) => api<never>(`/inventory/${id}`, { method: 'DELETE' });
export const createStockRequest = (items: { inventoryItemId?: number; name: string; quantity: number; unit: string }[]) => api<{ id: number; status: string }>('/stock-requests', { method: 'POST', body: JSON.stringify({ items }) });
