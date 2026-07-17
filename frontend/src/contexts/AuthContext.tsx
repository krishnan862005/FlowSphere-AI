'use client';

import type { User } from '@flowsphere/types';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';

import { apiClient } from '@/lib/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ requiresTwoFactor?: boolean; twoFactorToken?: string }>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'fs_access_token';
const REFRESH_KEY = 'fs_refresh_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const setToken = (token: string | null) => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  };

  const setRefreshToken = (token: string | null) => {
    if (token) {
      localStorage.setItem(REFRESH_KEY, token);
    } else {
      localStorage.removeItem(REFRESH_KEY);
    }
  };

  const fetchMe = useCallback(async (token: string) => {
    try {
      const res = await apiClient.get<{ user: User }>('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data?.user ?? null;
    } catch {
      return null;
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    if (!refreshToken) {
      setState({ user: null, accessToken: null, isLoading: false, isAuthenticated: false });
      return;
    }
    try {
      const res = await apiClient.post<{ tokens: { accessToken: string; refreshToken: string } }>('/auth/refresh', { refreshToken });
      const { accessToken, refreshToken: newRefreshToken } = res.data!.tokens;
      setToken(accessToken);
      setRefreshToken(newRefreshToken);
      const user = await fetchMe(accessToken);
      setState({ user, accessToken, isLoading: false, isAuthenticated: !!user });
    } catch {
      setToken(null);
      setRefreshToken(null);
      setState({ user: null, accessToken: null, isLoading: false, isAuthenticated: false });
    }
  }, [fetchMe]);

  // Initialize auth on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const urlRefreshToken = params.get('refreshToken');

    if (urlToken) {
      setToken(urlToken);
    }

    if (urlRefreshToken) {
      setRefreshToken(urlRefreshToken);
    }

    if (urlToken || urlRefreshToken) {
      const nextParams = new URLSearchParams(window.location.search);
      nextParams.delete('token');
      nextParams.delete('refreshToken');
      const nextUrl = `${window.location.pathname}${nextParams.toString() ? `?${nextParams.toString()}` : ''}${window.location.hash}`;
      window.history.replaceState({}, '', nextUrl);
    }

    const token = urlToken ?? localStorage.getItem(TOKEN_KEY);
    if (token) {
      fetchMe(token).then((user) => {
        if (user) {
          setState({ user, accessToken: token, isLoading: false, isAuthenticated: true });
        } else {
          refreshAuth();
        }
      });
    } else {
      refreshAuth();
    }
  }, [fetchMe, refreshAuth]);

  // Auto-refresh every 13 minutes
  useEffect(() => {
    const interval = setInterval(refreshAuth, 13 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshAuth]);

  const login = async (email: string, password: string, rememberMe = false) => {
    const res = await apiClient.post<{
      user: User;
      tokens: { accessToken: string; refreshToken: string };
      requiresTwoFactor?: boolean;
      twoFactorToken?: string;
    }>('/auth/login', { email, password, rememberMe });

    const data = res.data!;

    if (data.requiresTwoFactor) {
      return { requiresTwoFactor: true, twoFactorToken: data.twoFactorToken };
    }

    setToken(data.tokens.accessToken);
    setRefreshToken(data.tokens.refreshToken);
    setState({ user: data.user, accessToken: data.tokens.accessToken, isLoading: false, isAuthenticated: true });
    return {};
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    try {
      await apiClient.post('/auth/logout', { refreshToken }, {
        headers: { Authorization: `Bearer ${state.accessToken}` },
      });
    } catch { /* ignore */ }
    setToken(null);
    setRefreshToken(null);
    setState({ user: null, accessToken: null, isLoading: false, isAuthenticated: false });
    window.location.href = '/auth/login';
  };

  const register = async (name: string, email: string, password: string) => {
    await apiClient.post('/auth/register', { name, email, password });
  };

  const updateUser = (updates: Partial<User>) => {
    setState((prev) => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...updates } : null,
    }));
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, register, updateUser, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
