'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  type User,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  validateSession,
  getStoredUser,
} from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (email: string, username: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fast path: show stored user immediately
    const stored = getStoredUser();
    if (stored) setUser(stored);

    // Validate in background
    validateSession()
      .then((validated) => {
        setUser(validated);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = true) => {
    const res = await apiLogin(email, password, rememberMe);
    setUser(res.user);
  };

  const register = async (email: string, username: string, password: string, rememberMe: boolean = true) => {
    const res = await apiRegister(email, username, password, rememberMe);
    setUser(res.user);
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
