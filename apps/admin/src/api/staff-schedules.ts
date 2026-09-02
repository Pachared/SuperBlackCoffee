import { secured } from './client';

export type StaffShift = {
  id: number;
  userId: number;
  name: string;
  branchId?: number;
  date: string;
  startsAt: string;
  endsAt: string;
  status: 'scheduled' | 'day_off' | 'leave' | 'sick_leave' | 'personal_leave';
  leaveType?: string;
};
export const listStaffSchedules = (month: string) =>
  secured<StaffShift[]>(`/staff-schedules?month=${month}`);
export const generateStaffSchedules = (month: string) =>
  secured<{ created: number; month: string }>('/staff-schedules/generate', {
    method: 'POST',
    data: { month },
  });
export const updateStaffShift = (
  id: number,
  data: {
    shiftDate?: string;
    branchId?: number;
    status?:
      'scheduled' | 'leave' | 'sick_leave' | 'personal_leave' | 'day_off';
    leaveType?: string;
  },
) =>
  secured<{ id: string }>(`/staff-schedules/${id}`, { method: 'PATCH', data });
