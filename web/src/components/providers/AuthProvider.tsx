'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/services/api';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin' | 'moderator';
  preferences: {
    notifications: boolean;
    theme: 'light' | 'dark' | 'system';
    language: string;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on mount
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const res = await authAPI.getProfile();
      const data = (res as any)?.data?.user || (res as any)?.user || res;
      if (data) {
        setUser(data);
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
      }
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const res = await authAPI.login({ email, password });
      const payload = (res as any)?.data || res;
      const userData = payload?.user || payload?.data?.user || payload?.data?.user;
      const tokens = payload?.tokens || payload?.data?.tokens;

      if (!tokens?.accessToken) throw new Error('No access token received');

      localStorage.setItem('accessToken', tokens.accessToken);
      if (tokens.refreshToken) localStorage.setItem('refreshToken', tokens.refreshToken);

      setUser(userData || null);
      router.push('/');
    } catch (error) {
      throw error as Error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setIsLoading(true);
      const res = await authAPI.register(userData);
      const payload = (res as any)?.data || res;
      const newUser = payload?.user || payload?.data?.user;
      const tokens = payload?.tokens || payload?.data?.tokens;

      if (tokens?.accessToken) localStorage.setItem('accessToken', tokens.accessToken);
      if (tokens?.refreshToken) localStorage.setItem('refreshToken', tokens.refreshToken);

      setUser(newUser || null);
      router.push('/');
    } catch (error) {
      throw error as Error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    router.push('/');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
