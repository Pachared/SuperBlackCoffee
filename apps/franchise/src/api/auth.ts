export type FranchiseSession = {
  accessToken: string;
  user: { id: number; name: string; role: string; plan?: 'S' | 'M' | 'L' };
};

export async function login(username: string, password: string) {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1'}/auth/login`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    },
  );
  const body = await response.json();
  if (!response.ok || !body.success)
    throw new Error(body.message ?? 'เข้าสู่ระบบไม่สำเร็จ');
  return body.data as FranchiseSession;
}
