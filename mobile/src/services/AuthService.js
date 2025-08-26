import apiClient from './apiClient';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthService {
  constructor() {
    this.ACCESS_TOKEN_KEY = 'access_token';
    this.REFRESH_TOKEN_KEY = 'refresh_token';
    this.USER_DATA_KEY = 'user_data';
  }

  // ==========================================
  // LOGIN
  // ==========================================

  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      
      if (response.data.success) {
        // Store tokens securely
        await this.storeTokens(
          response.data.data.tokens.accessToken,
          response.data.data.tokens.refreshToken
        );
        
        // Store user data
        await this.storeUserData(response.data.data.user);
        
        return {
          success: true,
          data: response.data.data,
          message: 'Inicio de sesión exitoso'
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Error en el inicio de sesión'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 
                error.message || 
                'Error de conexión. Verifica tu internet.'
      };
    }
  }

  // ==========================================
  // REGISTER
  // ==========================================

  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData);
      
      if (response.data.success) {
        // Store tokens if provided
        if (response.data.data.tokens) {
          await this.storeTokens(
            response.data.data.tokens.accessToken,
            response.data.data.tokens.refreshToken
          );
        }
        
        // Store user data
        await this.storeUserData(response.data.data.user);
        
        return {
          success: true,
          data: response.data.data,
          message: 'Registro exitoso'
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Error en el registro'
        };
      }
    } catch (error) {
      console.error('Register error:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 
                error.message || 
                'Error de conexión. Verifica tu internet.'
      };
    }
  }

  // ==========================================
  // LOGOUT
  // ==========================================

  async logout() {
    try {
      // Try to call logout endpoint
      try {
        await apiClient.post('/auth/logout');
      } catch (error) {
        // Continue with local logout even if API call fails
        console.warn('Logout API call failed:', error);
      }
      
      // Clear all stored data
      await this.clearStoredData();
      
      return {
        success: true,
        message: 'Sesión cerrada exitosamente'
      };
    } catch (error) {
      console.error('Logout error:', error);
      
      // Force clear data even if there's an error
      await this.clearStoredData();
      
      return {
        success: true,
        message: 'Sesión cerrada'
      };
    }
  }

  // ==========================================
  // REFRESH TOKEN
  // ==========================================

  async refreshToken() {
    try {
      const refreshToken = await SecureStore.getItemAsync(this.REFRESH_TOKEN_KEY);
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await apiClient.post('/auth/refresh-token', {
        refreshToken
      });
      
      if (response.data.success) {
        // Store new tokens
        await this.storeTokens(
          response.data.data.accessToken,
          response.data.data.refreshToken
        );
        
        return {
          success: true,
          data: response.data.data
        };
      } else {
        throw new Error(response.data.message || 'Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      
      // Clear tokens if refresh fails
      await this.clearTokens();
      
      return {
        success: false,
        message: error.message || 'Token refresh failed'
      };
    }
  }

  // ==========================================
  // PASSWORD RESET
  // ==========================================

  async requestPasswordReset(email) {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      
      return {
        success: response.data.success,
        message: response.data.message || 'Instrucciones enviadas por email'
      };
    } catch (error) {
      console.error('Password reset request error:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 
                'Error enviando instrucciones de recuperación'
      };
    }
  }

  async resetPassword(token, newPassword) {
    try {
      const response = await apiClient.post('/auth/reset-password', {
        token,
        password: newPassword
      });
      
      return {
        success: response.data.success,
        message: response.data.message || 'Contraseña actualizada exitosamente'
      };
    } catch (error) {
      console.error('Password reset error:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 
                'Error actualizando contraseña'
      };
    }
  }

  // ==========================================
  // EMAIL VERIFICATION
  // ==========================================

  async verifyEmail(token) {
    try {
      const response = await apiClient.post('/auth/verify-email', { token });
      
      if (response.data.success) {
        // Update user data
        const userData = await this.getUserData();
        if (userData) {
          userData.emailVerified = true;
          await this.storeUserData(userData);
        }
      }
      
      return {
        success: response.data.success,
        message: response.data.message || 'Email verificado exitosamente'
      };
    } catch (error) {
      console.error('Email verification error:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 
                'Error verificando email'
      };
    }
  }

  async resendVerificationEmail() {
    try {
      const response = await apiClient.post('/auth/resend-verification');
      
      return {
        success: response.data.success,
        message: response.data.message || 'Email de verificación enviado'
      };
    } catch (error) {
      console.error('Resend verification error:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 
                'Error enviando email de verificación'
      };
    }
  }

  // ==========================================
  // TOKEN MANAGEMENT
  // ==========================================

  async storeTokens(accessToken, refreshToken) {
    try {
      await SecureStore.setItemAsync(this.ACCESS_TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(this.REFRESH_TOKEN_KEY, refreshToken);
    } catch (error) {
      console.error('Error storing tokens:', error);
      throw error;
    }
  }

  async getAccessToken() {
    try {
      return await SecureStore.getItemAsync(this.ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  async getRefreshToken() {
    try {
      return await SecureStore.getItemAsync(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  async clearTokens() {
    try {
      await SecureStore.deleteItemAsync(this.ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  // ==========================================
  // USER DATA MANAGEMENT
  // ==========================================

  async storeUserData(userData) {
    try {
      await AsyncStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Error storing user data:', error);
      throw error;
    }
  }

  async getUserData() {
    try {
      const userData = await AsyncStorage.getItem(this.USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  async updateUserData(updates) {
    try {
      const currentData = await this.getUserData();
      if (currentData) {
        const updatedData = { ...currentData, ...updates };
        await this.storeUserData(updatedData);
        return updatedData;
      }
      return null;
    } catch (error) {
      console.error('Error updating user data:', error);
      return null;
    }
  }

  async clearUserData() {
    try {
      await AsyncStorage.removeItem(this.USER_DATA_KEY);
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  }

  // ==========================================
  // SESSION MANAGEMENT
  // ==========================================

  async isAuthenticated() {
    try {
      const accessToken = await this.getAccessToken();
      const userData = await this.getUserData();
      
      return !!(accessToken && userData);
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  async getCurrentUser() {
    try {
      if (!await this.isAuthenticated()) {
        return null;
      }
      
      // Try to get fresh user data from API
      try {
        const response = await apiClient.get('/auth/profile');
        if (response.data.success) {
          await this.storeUserData(response.data.data);
          return response.data.data;
        }
      } catch (apiError) {
        console.warn('Failed to fetch fresh user data:', apiError);
      }
      
      // Fallback to stored user data
      return await this.getUserData();
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async clearStoredData() {
    try {
      await Promise.all([
        this.clearTokens(),
        this.clearUserData(),
        AsyncStorage.removeItem('onboarding_completed'),
        AsyncStorage.removeItem('user_preferences'),
        AsyncStorage.removeItem('user_location')
      ]);
    } catch (error) {
      console.error('Error clearing stored data:', error);
    }
  }

  // ==========================================
  // SOCIAL LOGIN (PLACEHOLDER)
  // ==========================================

  async loginWithGoogle() {
    // Placeholder for Google login implementation
    return {
      success: false,
      message: 'Login con Google próximamente disponible'
    };
  }

  async loginWithFacebook() {
    // Placeholder for Facebook login implementation
    return {
      success: false,
      message: 'Login con Facebook próximamente disponible'
    };
  }

  async loginWithApple() {
    // Placeholder for Apple login implementation
    return {
      success: false,
      message: 'Login con Apple próximamente disponible'
    };
  }

  // ==========================================
  // BIOMETRIC AUTHENTICATION (FUTURE)
  // ==========================================

  async enableBiometric() {
    // Placeholder for biometric authentication
    return {
      success: false,
      message: 'Autenticación biométrica próximamente disponible'
    };
  }

  async loginWithBiometric() {
    // Placeholder for biometric login
    return {
      success: false,
      message: 'Autenticación biométrica próximamente disponible'
    };
  }
}

export default new AuthService();
