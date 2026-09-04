import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminOrdersPage } from '../AdminOrdersPage';
import {
  useStockRequests,
  useUpdateStockRequestStatus,
} from '../../../hooks/useStockRequests';

vi.mock('../../../hooks/useStockRequests', () => ({
  useStockRequests: vi.fn(),
  useUpdateStockRequestStatus: vi.fn(),
}));

const mockedUseStockRequests = vi.mocked(useStockRequests);
const mockedUseUpdateStockRequestStatus = vi.mocked(
  useUpdateStockRequestStatus,
);
const mutateAsync = vi.fn();

describe('AdminOrdersPage', () => {
  beforeEach(() => {
    mockedUseStockRequests.mockReturnValue({
      data: [
        {
          id: 7,
          status: 'pending',
          note: '',
          createdAt: '2026-09-04T02:00:00Z',
          branch: { id: 51, name: 'อยุธยา' },
          items: [{ name: 'เมล็ดกาแฟ', quantity: 2, unit: 'ถุง' }],
        },
        {
          id: 8,
          status: 'completed',
          note: '',
          createdAt: '2026-09-04T02:00:00Z',
          branch: { id: 52, name: 'พิษณุโลก' },
          items: [{ name: 'นมสด', quantity: 1, unit: 'กล่อง' }],
        },
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useStockRequests>);
    mockedUseUpdateStockRequestStatus.mockReturnValue({
      mutateAsync,
    } as unknown as ReturnType<typeof useUpdateStockRequestStatus>);
    mutateAsync.mockResolvedValue({});
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('filters requests to the selected branch and advances a pending request', async () => {
    render(<AdminOrdersPage activeBranch="อยุธยา" />);

    await waitFor(() => expect(screen.getByText('REQ-7')).toBeTruthy());
    expect(screen.queryByText('REQ-8')).toBeNull();
    expect(screen.getByText('มีคำขอรอการอนุมัติ 1 รายการ')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'อนุมัติคำขอ' }));
    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({ id: 7, status: 'approved' }),
    );
  });
});
