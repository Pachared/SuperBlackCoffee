export const BRANCH_STATUS_BADGES = {
  เปิดให้บริการ: { main: '#166534', contrastText: '#ffffff' },
  ปิดปรับปรุง: { main: '#9a4d18', contrastText: '#ffffff' },
  ปิดทำการ: { main: '#b42318', contrastText: '#ffffff' },
} as const;

export type BranchStatus = keyof typeof BRANCH_STATUS_BADGES;
