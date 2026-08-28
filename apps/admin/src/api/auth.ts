import { publicRequest } from './client';

export type AuthSession = {
  accessToken: string;
  user: { id: number; name: string; role: string };
};
export const login = (username: string, password: string) =>
  publicRequest<AuthSession>('/auth/login', {
    method: 'POST',
    data: { username, password },
  });
