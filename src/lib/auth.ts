const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface User {
  id: number;
  email: string;
  username: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// ─── Token management ────────────────────────────────────────────
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('logbook_token') || sessionStorage.getItem('logbook_token');
}

export function setToken(token: string, rememberMe: boolean = true): void {
  if (rememberMe) {
    localStorage.setItem('logbook_token', token);
    sessionStorage.removeItem('logbook_token');
  } else {
    sessionStorage.setItem('logbook_token', token);
    localStorage.removeItem('logbook_token');
  }
}

export function clearToken(): void {
  localStorage.removeItem('logbook_token');
  localStorage.removeItem('logbook_user');
  sessionStorage.removeItem('logbook_token');
  sessionStorage.removeItem('logbook_user');
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('logbook_user') || sessionStorage.getItem('logbook_user');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function storeUser(user: User, rememberMe: boolean = true): void {
  const data = JSON.stringify(user);
  if (rememberMe) {
    localStorage.setItem('logbook_user', data);
    sessionStorage.removeItem('logbook_user');
  } else {
    sessionStorage.setItem('logbook_user', data);
    localStorage.removeItem('logbook_user');
  }
}

// ─── Auth API calls ──────────────────────────────────────────────
export async function register(email: string, username: string, password: string, rememberMe: boolean = true): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Registration failed');
  }
  const data: AuthResponse = await res.json();
  setToken(data.access_token, rememberMe);
  storeUser(data.user, rememberMe);
  return data;
}

export async function login(email: string, password: string, rememberMe: boolean = true): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Login failed');
  }
  const data: AuthResponse = await res.json();
  setToken(data.access_token, rememberMe);
  storeUser(data.user, rememberMe);
  return data;
}

export async function validateSession(): Promise<User | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      clearToken();
      return null;
    }
    const user: User = await res.json();
    // Validate session updates the stored user but preserves the storage type 
    // by checking where the token came from originally
    const isPersistent = localStorage.getItem('logbook_token') !== null;
    storeUser(user, isPersistent);
    return user;
  } catch {
    return getStoredUser();
  }
}

export function logout(): void {
  clearToken();
}

// ─── Authenticated fetch helper ──────────────────────────────────
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
