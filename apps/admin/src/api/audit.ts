import { secured } from './client';

export type AuditEvent = {
  id: number;
  branchId: number | null;
  branchName: string;
  actorId: number | null;
  actorName: string;
  entityType: 'inventory_item' | 'stock_request';
  entityId: number | null;
  action: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};
export const listAuditEvents = () =>
  secured<AuditEvent[]>('/audit-events?limit=100');
