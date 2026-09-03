import { secured } from './client';

export type DashboardSummary = {
  todaySales: number;
  todayOrders: number;
};

export const getDashboardSummary = () =>
  secured<DashboardSummary>('/dashboard');
