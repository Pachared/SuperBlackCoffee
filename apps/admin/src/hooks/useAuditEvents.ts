import { useQuery } from '@tanstack/react-query';
import { listAuditEvents } from '../api';

export const useAuditEvents = () =>
  useQuery({ queryKey: ['audit-events'], queryFn: listAuditEvents });
