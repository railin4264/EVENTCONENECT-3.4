'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin' | 'moderator';
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    notifications: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          await refreshUser();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await api.post('/api/auth/login', { email, password });
        const payload = response.data?.data || response.data;

        if (payload?.tokens) {
          localStorage.setItem('accessToken', payload.tokens.accessToken);
          localStorage.setItem('refreshToken', payload.tokens.refreshToken);
        }

        if (payload?.user) {
          setUser(payload.user);
        }

        router.push('/dashboard');
      } catch (error: any) {
        const message =
          error.response?.data?.message || 'Error al iniciar sesión';
        setError(message);
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const register = useCallback(
    async (userData: RegisterData) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await api.post('/api/auth/register', userData);
        const payload = response.data?.data || response.data;

        if (payload?.tokens) {
          localStorage.setItem('accessToken', payload.tokens.accessToken);
          localStorage.setItem('refreshToken', payload.tokens.refreshToken);
        }

        if (payload?.user) {
          setUser(payload.user);
        }

        router.push('/dashboard');
      } catch (error: any) {
        const message = error.response?.data?.message || 'Error al registrarse';
        setError(message);
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      // Call logout endpoint to invalidate refresh token
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setError(null);
      router.push('/');
    }
  }, [router]);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.put('/api/auth/profile', data);
      const updatedUser =
        (response.data?.data && response.data.data.user) || response.data.user;

      if (updatedUser) {
        setUser(updatedUser);
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Error al actualizar perfil';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get('/api/auth/profile');
      const userData =
        (response.data?.data && response.data.data.user) || response.data.user;

      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, logout user
      await logout();
    }
  }, [logout]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
    clearError,
  };
};

export default useAuth;
