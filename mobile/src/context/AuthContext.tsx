import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../services/apiClient';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isVerified: boolean;
  isHost: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  refreshToken: () => Promise<void>;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone?: string;
  password: string;
  dateOfBirth?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      
      if (token && userData) {
        // Verify token with backend
        try {
          const response = await apiClient.get('/auth/verify');
          if (response.data.valid) {
            setUser(JSON.parse(userData));
          } else {
            // Token expired, clear storage
            await AsyncStorage.multiRemove(['token', 'user']);
          }
        } catch (error) {
          // Token invalid, clear storage
          await AsyncStorage.multiRemove(['token', 'user']);
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      const { token, user: userData } = response.data;

      // Store token and user data
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      // Update API client headers
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);

      if (response.data.success) {
        // Registration successful, user needs to login
        return;
      } else {
        throw new Error('Error al crear la cuenta');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear la cuenta');
    }
  };

  const logout = async () => {
    try {
      // Clear token and user data
      await AsyncStorage.multiRemove(['token', 'user']);

      // Clear API client headers
      delete apiClient.defaults.headers.common['Authorization'];

      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await apiClient.post('/auth/forgot-password', { email });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al enviar email de recuperación');
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      const response = await apiClient.put('/users/profile', userData);
      
      const updatedUser = { ...user, ...response.data };
      
      // Update stored user data
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      setUser(updatedUser);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar perfil');
    }
  };

  const refreshToken = async () => {
    try {
      const response = await apiClient.post('/auth/refresh');
      const { token } = response.data;

      // Update stored token
      await AsyncStorage.setItem('token', token);

      // Update API client headers
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      // Token refresh failed, logout user
      await logout();
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    updateProfile,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
