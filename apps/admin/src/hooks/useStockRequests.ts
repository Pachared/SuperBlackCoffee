import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listStockRequests,
  updateStockRequestStatus,
  type StockRequest,
} from '../api';

const stockRequestsKey = ['stock-requests'] as const;

export const useStockRequests = () =>
  useQuery({ queryKey: stockRequestsKey, queryFn: listStockRequests });

export function useUpdateStockRequestStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number;
      status: 'approved' | 'preparing' | 'completed' | 'rejected';
    }) => updateStockRequestStatus(id, status),
    onSuccess: (_, { id, status }) => {
      queryClient.setQueryData<StockRequest[]>(stockRequestsKey, (current) =>
        current?.map((request) =>
          request.id === id ? { ...request, status } : request,
        ),
      );
      void queryClient.invalidateQueries({ queryKey: ['audit-events'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });
}
