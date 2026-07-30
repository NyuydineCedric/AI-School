const TOKEN_KEY = 'ssai_token';
const ROLE_KEY = 'ssai_role';
const NAME_KEY = 'ssai_name';
const USER_ID_KEY = 'ssai_user_id';

export type Role = 'student' | 'teacher' | 'admin';

export function saveSession(token: string, role: Role, name: string, userId: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
  localStorage.setItem(NAME_KEY, name);
  localStorage.setItem(USER_ID_KEY, userId);
}

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getRole = () => localStorage.getItem(ROLE_KEY) as Role | null;
export const getName = () => localStorage.getItem(NAME_KEY);
export const getUserId = () => localStorage.getItem(USER_ID_KEY);
export const isLoggedIn = () => !!getToken();

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(NAME_KEY);
  localStorage.removeItem(USER_ID_KEY);
}