import { useQuery } from '@tanstack/react-query';
import { listEmployees } from '../api';

export const useEmployees = () =>
  useQuery({ queryKey: ['employees'], queryFn: listEmployees });
