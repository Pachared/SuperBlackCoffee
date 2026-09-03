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

export const createFranchisee = (input: CreateFranchiseeInput) =>
  secured<{ id: number; status: string }>('/franchisees', {
    method: 'POST',
    data: input,
  });
