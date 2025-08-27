'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { authService, apiUtils } from '@/services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar autenticación al cargar
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      // Verificar si hay token
      if (!apiUtils.isAuthenticated()) {
        setUser(null);
        return;
      }

      // Obtener usuario actual
      const userData = await authService.getCurrentUser();
      setUser(userData.user);
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      setError('Error al verificar autenticación');
      // Limpiar datos de autenticación si hay error
      apiUtils.clearAuth();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.login(credentials);
      setUser(response.user);
      
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = apiUtils.handleError(error);
      setError(errorMessage.message);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.register(userData);
      
      // Opcional: hacer login automático después del registro
      if (response.success) {
        await login({
          email: userData.email,
          password: userData.password,
        });
      }
      
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = apiUtils.handleError(error);
      setError(errorMessage.message);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      setUser(null);
      apiUtils.clearAuth();
      setLoading(false);
    }
  };

  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.updateProfile(userData);
      setUser(response.user);
      
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = apiUtils.handleError(error);
      setError(errorMessage.message);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (passwordData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.changePassword(passwordData);
      
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = apiUtils.handleError(error);
      setError(errorMessage.message);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.forgotPassword(email);
      
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = apiUtils.handleError(error);
      setError(errorMessage.message);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.resetPassword(token, password);
      
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = apiUtils.handleError(error);
      setError(errorMessage.message);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    clearError,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};