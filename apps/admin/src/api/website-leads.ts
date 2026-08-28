import { secured } from './client';

export type WebsiteLead = {
  id: number;
  name: string;
  phone: string;
  email: string;
  topic: string;
  plan: string;
  province: string;
  message: string;
  status: 'new' | 'contacted' | 'closed';
  createdAt: string;
};
export const listWebsiteLeads = () => secured<WebsiteLead[]>('/website/leads');
export const updateWebsiteLeadStatus = (
  id: number,
  status: WebsiteLead['status'],
) =>
  secured<{ id: number; status: WebsiteLead['status'] }>(
    `/website/leads/${id}/status`,
    { method: 'PATCH', data: { status } },
  );
