import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Configurar axios con interceptors
  useEffect(() => {
    const api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
    });

    // Request interceptor para agregar token
    api.interceptors.request.use(
      async (config) => {
        const storedAccess = await SecureStore.getItemAsync('accessToken');
        const bearer = token || storedAccess;
        if (bearer) {
          config.headers.Authorization = `Bearer ${bearer}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor para refresh token
    api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newTokens = await refreshAccessToken();
            if (newTokens) {
              originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
              return api(originalRequest);
            }
          } catch (refreshError) {
            await logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    // Guardar instancia de API en contexto
    setApi(api);
  }, [token]);

  const [api, setApi] = useState(null);

  // Cargar tokens guardados al iniciar
  useEffect(() => {
    loadStoredTokens();
  }, []);

  const loadStoredTokens = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('accessToken');
      const storedRefreshToken = await SecureStore.getItemAsync('refreshToken');
      const storedUser = await AsyncStorage.getItem('user');

      if (storedToken && storedRefreshToken && storedUser) {
        setToken(storedToken);
        setRefreshToken(storedRefreshToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
        await validateToken(storedToken);
      }
    } catch (error) {
      console.error('Error cargando tokens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateToken = async (tokenToValidate) => {
    try {
      const response = await api?.get('/api/auth/profile');
      if (response?.data?.success) {
        const currentUser = response.data.data.user || response.data.data;
        setUser(currentUser);
        await AsyncStorage.setItem('user', JSON.stringify(currentUser));
      }
    } catch (error) {
      console.error('Token inválido, haciendo logout');
      await logout();
    }
  };

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await api?.post('/api/auth/login', { email, password });
      
      if (response?.data?.success) {
        const { tokens, user: userData } = response.data.data;
        const { accessToken, refreshToken: newRefreshToken } = tokens || {};
        
        // Guardar tokens en SecureStore y user en AsyncStorage
        await SecureStore.setItemAsync('accessToken', accessToken);
        await SecureStore.setItemAsync('refreshToken', newRefreshToken);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        
        // Actualizar estado
        setToken(accessToken);
        setRefreshToken(newRefreshToken);
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true }; 
      } else {
        throw new Error(response?.data?.message || 'Error en login');
      }
    } catch (error) {
      console.error('Error en login:', error);
      throw new Error(error.response?.data?.message || 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      const response = await api?.post('/api/auth/register', userData);
      
      if (response?.data?.success) {
        const { tokens, user: newUser } = response.data.data;
        const { accessToken, refreshToken: newRefreshToken } = tokens || {};
        
        // Guardar tokens
        await SecureStore.setItemAsync('accessToken', accessToken);
        await SecureStore.setItemAsync('refreshToken', newRefreshToken);
        await AsyncStorage.setItem('user', JSON.stringify(newUser));
        
        // Actualizar estado
        setToken(accessToken);
        setRefreshToken(newRefreshToken);
        setUser(newUser);
        setIsAuthenticated(true);
        
        return { success: true };
      } else {
        throw new Error(response?.data?.message || 'Error en registro');
      }
    } catch (error) {
      console.error('Error en registro:', error);
      throw new Error(error.response?.data?.message || 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAccessToken = async () => {
    try {
      const currentRefresh = refreshToken || (await SecureStore.getItemAsync('refreshToken'));
      if (!currentRefresh) throw new Error('No hay refresh token');

      const response = await axios.post(
        `${API_BASE_URL}/api/auth/refresh-token`,
        { refreshToken: currentRefresh }
      );

      if (response?.data?.success) {
        const { tokens } = response.data.data || {};
        const { accessToken, refreshToken: newRefreshToken } = tokens || {};
        
        // Actualizar tokens
        await SecureStore.setItemAsync('accessToken', accessToken);
        await SecureStore.setItemAsync('refreshToken', newRefreshToken);
        
        setToken(accessToken);
        setRefreshToken(newRefreshToken);
        
        return { accessToken, refreshToken: newRefreshToken };
      }
    } catch (error) {
      console.error('Error refrescando token:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Llamar al endpoint de logout si hay token
      const bearer = token || (await SecureStore.getItemAsync('accessToken'));
      if (bearer) {
        try {
          await api?.post('/api/auth/logout', {});
        } catch (error) {
          console.error('Error en logout del servidor:', error);
        }
      }

      // Limpiar tokens y user
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      await AsyncStorage.multiRemove(['user']);
      
      // Limpiar estado
      setToken(null);
      setRefreshToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api?.put('/api/auth/profile', profileData);
      
      if (response?.data?.success) {
        const updatedUser = response.data.data.user || response.data.data;
        setUser(updatedUser);
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true, user: updatedUser };
      } else {
        throw new Error(response?.data?.message || 'Error actualizando perfil');
      }
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      throw new Error(error.response?.data?.message || 'Error de conexión');
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await api?.put('/api/auth/change-password', {
        currentPassword,
        newPassword
      });
      
      if (response?.data?.success) {
        return { success: true };
      } else {
        throw new Error(response?.data?.message || 'Error cambiando contraseña');
      }
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      throw new Error(error.response?.data?.message || 'Error de conexión');
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await api?.post('/api/auth/request-password-reset', { email });
      
      if (response?.data?.success) {
        return { success: true };
      } else {
        throw new Error(response?.data?.message || 'Error enviando email de reset');
      }
    } catch (error) {
      console.error('Error en forgot password:', error);
      throw new Error(error.response?.data?.message || 'Error de conexión');
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      const response = await api?.post('/api/auth/reset-password', {
        token,
        newPassword
      });
      
      if (response?.data?.success) {
        return { success: true };
      } else {
        throw new Error(response?.data?.message || 'Error reseteando contraseña');
      }
    } catch (error) {
      console.error('Error en reset password:', error);
      throw new Error(error.response?.data?.message || 'Error de conexión');
    }
  };

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    api,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    refreshAccessToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};