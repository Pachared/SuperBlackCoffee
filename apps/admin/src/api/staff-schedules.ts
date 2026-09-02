import { secured } from './client';

export type StaffShift = {
  id: number;
  userId: number;
  name: string;
  branchId?: number;
  date: string;
  startsAt: string;
  endsAt: string;
  status: 'scheduled' | 'day_off' | 'leave';
};
export const listStaffSchedules = (month: string) =>
  secured<StaffShift[]>(`/staff-schedules?month=${month}`);
export const generateStaffSchedules = (month: string) =>
  secured<{ created: number; month: string }>('/staff-schedules/generate', {
    method: 'POST',
    data: { month },
  });
