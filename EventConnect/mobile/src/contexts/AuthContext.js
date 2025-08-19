import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

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
      baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
      timeout: 10000,
    });

    // Request interceptor para agregar token
    api.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
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
      const storedToken = await AsyncStorage.getItem('accessToken');
      const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
      const storedUser = await AsyncStorage.getItem('user');

      if (storedToken && storedRefreshToken && storedUser) {
        setToken(storedToken);
        setRefreshToken(storedRefreshToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
        
        // Verificar si el token sigue siendo válido
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
      const response = await api?.get('/auth/me');
      if (response?.data?.success) {
        setUser(response.data.data);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.data));
      }
    } catch (error) {
      console.error('Token inválido, haciendo logout');
      await logout();
    }
  };

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await api?.post('/auth/login', { email, password });
      
      if (response?.data?.success) {
        const { accessToken, refreshToken: newRefreshToken, user: userData } = response.data.data;
        
        // Guardar tokens
        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('refreshToken', newRefreshToken);
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
      const response = await api?.post('/auth/register', userData);
      
      if (response?.data?.success) {
        const { accessToken, refreshToken: newRefreshToken, user: newUser } = response.data.data;
        
        // Guardar tokens
        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('refreshToken', newRefreshToken);
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
      if (!refreshToken) throw new Error('No hay refresh token');

      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/auth/refresh`,
        { refreshToken }
      );

      if (response?.data?.success) {
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        
        // Actualizar tokens
        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('refreshToken', newRefreshToken);
        
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
      if (token) {
        try {
          await api?.post('/auth/logout');
        } catch (error) {
          console.error('Error en logout del servidor:', error);
        }
      }

      // Limpiar tokens del servidor
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
      
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
      const response = await api?.put('/auth/profile', profileData);
      
      if (response?.data?.success) {
        const updatedUser = response.data.data;
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
      const response = await api?.put('/auth/change-password', {
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
      const response = await api?.post('/auth/forgot-password', { email });
      
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
      const response = await api?.post('/auth/reset-password', {
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