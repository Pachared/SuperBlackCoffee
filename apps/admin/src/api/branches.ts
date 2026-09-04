import { secured } from './client';

export type Branch = {
  id: number;
  name: string;
  code: string;
  status?: string;
  franchiseeId?: number;
  franchiseeName?: string;
};

export const listBranches = () => secured<Branch[]>('/branches');
