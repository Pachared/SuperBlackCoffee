/** รูปแบบวันมาตรฐานของ Super Black Coffee: วัน เดือน ปี (พ.ศ.) */
export const DEFAULT_DATE_FORMAT = {
  locale: 'th-TH',
  timeZone: 'Asia/Bangkok',
  options: {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  },
} as const;

/** แสดงวันในรูปแบบเดียวกันทั้งระบบ เช่น "27 สิงหาคม 2569" */
export function formatDate(value: Date | string | number): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(
    DEFAULT_DATE_FORMAT.locale,
    DEFAULT_DATE_FORMAT.options,
  ).format(date);
}
