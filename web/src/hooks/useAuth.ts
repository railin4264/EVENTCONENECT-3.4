'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// API instance with interceptors
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/refresh-token`,
            { refreshToken }
          );

          const data = response.data.data || response.data;
          const accessToken = data.tokens?.accessToken || data.accessToken;
          if (accessToken) {
            localStorage.setItem('accessToken', accessToken);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  }
);

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  interests: string[];
  location: {
    coordinates: [number, number];
    address?: string;
    city?: string;
    country?: string;
  };
  badges: string[];
  stats: {
    eventsCreated: number;
    eventsAttended: number;
    postsCreated: number;
    reviewsGiven: number;
    tribesJoined: number;
  };
  preferences: {
    notifications: {
      events: boolean;
      messages: boolean;
      community: boolean;
    };
    privacy: {
      profileVisible: boolean;
      locationVisible: boolean;
    };
  };
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  interests?: string[];
  location?: {
    coordinates: [number, number];
    address?: string;
    city?: string;
    country?: string;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const response = await api.get('/api/auth/profile');
        const u = (response.data?.data && response.data.data.user) || response.data.user;
        if (u) setUser(u);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await api.post('/api/auth/login', { email, password });
      const payload = response.data?.data || response.data;

      if (payload?.tokens) {
        localStorage.setItem('accessToken', payload.tokens.accessToken);
        localStorage.setItem('refreshToken', payload.tokens.refreshToken);
      }

      if (payload?.user) setUser(payload.user);
      router.push('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al iniciar sesión';
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      const response = await api.post('/api/auth/register', userData);
      const payload = response.data?.data || response.data;

      if (payload?.tokens) {
        localStorage.setItem('accessToken', payload.tokens.accessToken);
        localStorage.setItem('refreshToken', payload.tokens.refreshToken);
      }

      if (payload?.user) setUser(payload.user);
      router.push('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al registrarse';
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
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
      router.push('/');
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await api.put('/api/auth/profile', data);
      const updatedUser = (response.data?.data && response.data.data.user) || response.data.user;
      if (updatedUser) setUser(updatedUser);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al actualizar perfil';
      throw new Error(message);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/api/auth/profile');
      const u = (response.data?.data && response.data.data.user) || response.data.user;
      if (u) setUser(u);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, logout user
      await logout();
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
  };

  return value;
};

export default useAuth;