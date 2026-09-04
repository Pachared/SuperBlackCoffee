import { secured } from './client';

export type CreateFranchiseeInput = {
  name: string;
  email: string;
  plan: 'S' | 'M' | 'L';
  branchName: string;
  branchCode: string;
  username: string;
  password: string;
};

export type Franchisee = {
  id: number;
  name: string;
  email: string;
  plan: 'S' | 'M' | 'L';
  status: 'active' | 'inactive' | 'invited';
  createdAt: string;
};

export const listFranchisees = () => secured<Franchisee[]>('/franchisees');

export const createFranchisee = (input: CreateFranchiseeInput) =>
  secured<{ id: number; status: string }>('/franchisees', {
    method: 'POST',
    data: input,
  });

export const updateFranchiseeStatus = (
  id: number,
  status: 'active' | 'inactive',
) =>
  secured<{ id: number; status: 'active' | 'inactive' }>(
    `/franchisees/${id}/status`,
    { method: 'PATCH', data: { status } },
  );
