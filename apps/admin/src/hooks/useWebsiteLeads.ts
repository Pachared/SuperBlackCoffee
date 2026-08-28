import { useQuery } from '@tanstack/react-query';
import { listWebsiteLeads } from '../api';

export const useWebsiteLeads = () =>
  useQuery({ queryKey: ['website-leads'], queryFn: listWebsiteLeads });
