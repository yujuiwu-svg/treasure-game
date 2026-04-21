const API = '/api';

const getToken = () => localStorage.getItem('auth_token');

const authHeaders = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

export async function signup(username: string, password: string) {
  const res = await fetch(`${API}/auth/signup`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  localStorage.setItem('auth_token', data.token);
  return data.user as { id: number; username: string };
}

export async function signin(username: string, password: string) {
  const res = await fetch(`${API}/auth/signin`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  localStorage.setItem('auth_token', data.token);
  return data.user as { id: number; username: string };
}

export async function signout() {
  await fetch(`${API}/auth/signout`, { method: 'POST', headers: authHeaders() });
  localStorage.removeItem('auth_token');
}

export async function getMe() {
  const token = getToken();
  if (!token) return null;
  const res = await fetch(`${API}/auth/me`, { headers: authHeaders() });
  if (!res.ok) {
    localStorage.removeItem('auth_token');
    return null;
  }
  const data = await res.json();
  return data.user as { id: number; username: string };
}

export async function saveScore(score: number) {
  await fetch(`${API}/scores`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ score }),
  });
}

export async function getScores() {
  const res = await fetch(`${API}/scores`, { headers: authHeaders() });
  if (!res.ok) return [];
  const data = await res.json();
  return data.scores as { score: number; played_at: string }[];
}
