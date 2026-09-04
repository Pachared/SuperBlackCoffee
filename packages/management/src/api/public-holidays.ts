import { secured } from './client';

export type PublicHoliday = {
  date: string;
  name: string;
};

export const listPublicHolidays = (month: string) =>
  secured<PublicHoliday[]>(`/public-holidays?month=${month}`);
