export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}
export type ApiResponse<T> = ApiEnvelope<T>;
export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
}
export interface Pagination {
  page: number;
  limit: number;
  total: number;
}
export interface ApiError {
  message: string;
  code?: string;
}
export interface HealthResponse {
  status: 'healthy';
}
