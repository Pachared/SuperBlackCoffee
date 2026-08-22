/** ค่าเริ่มต้นกลางสำหรับการแสดงสกุลเงินใน Super Black Coffee */
export const DEFAULT_CURRENCY = {
  locale: 'th-TH',
  unit: 'บาท',
} as const;

/** แสดงจำนวนเงินตามรูปแบบมาตรฐานของระบบ เช่น "12,840 บาท" */
export function formatCurrency(value: number): string {
  return `${value.toLocaleString(DEFAULT_CURRENCY.locale)} ${DEFAULT_CURRENCY.unit}`;
}
