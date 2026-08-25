const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1';

type ApiEnvelope<T> = { success: boolean; data: T; message?: string };
type AuthSession = { accessToken: string; user: { id: number; name: string; role: string } };

export async function login(email: string, password: string): Promise<AuthSession> {
  const response = await fetch(`${apiUrl}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }),
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
