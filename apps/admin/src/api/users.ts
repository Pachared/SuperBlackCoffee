import { secured } from './client';

export type Employee = {
  id: number;
  name: string;
  username: string;
  email: string;
  role: 'admin' | 'franchise_owner' | 'branch_manager' | 'cashier';
  franchiseeId?: number;
  branchId?: number;
};

export const listEmployees = () => secured<Employee[]>('/users');
