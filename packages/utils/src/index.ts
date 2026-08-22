export const isNonEmpty = (value: string | null | undefined): value is string => Boolean(value?.trim());
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
