import { secured } from './client';

export type Branch = {
  id: number;
  name: string;
  code: string;
  franchiseeId?: number;
};

export const listBranches = () => secured<Branch[]>('/branches');
