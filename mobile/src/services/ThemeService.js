import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

class ThemeService {
  constructor() {
    this.THEME_KEY = 'user_theme_config';
    this.defaultTheme = {
      mode: 'dark',
      primaryColor: 'cyan',
      accentColor: 'purple',
      customColors: {
        primary: '#06b6d4',
        secondary: '#8b5cf6',
        accent: '#f59e0b',
        background: '#0f172a',
        surface: '#1e293b',
        text: '#f8fafc'
      },
      animations: true,
      reducedMotion: false,
      glassEffect: true,
      neonEffects: false,
      autoSync: true
    };
  }

  // ==========================================
  // OBTENER CONFIGURACIÓN DE TEMA
  // ==========================================

  async getThemeConfig() {
    try {
      const response = await apiClient.get('/themes/config');
      
      if (response.data.success) {
        // Guardar en almacenamiento local para uso offline
        await this.saveThemeLocally(response.data.data.theme);
        return response.data.data.theme;
      }
      
      throw new Error(response.data.message || 'Error obteniendo configuración de tema');
    } catch (error) {
      console.warn('Error obteniendo tema del servidor, usando local:', error.message);
      
      // Fallback a configuración local
      return await this.getLocalTheme();
    }
  }

  // ==========================================
  // ACTUALIZAR CONFIGURACIÓN DE TEMA
  // ==========================================

  async updateThemeConfig(themeConfig) {
    try {
      // Guardar localmente primero para UX inmediata
      await this.saveThemeLocally(themeConfig);
      
      const response = await apiClient.put('/themes/config', themeConfig);
      
      if (response.data.success) {
        // Auto-sync si está habilitado
        if (themeConfig.autoSync) {
          await this.syncTheme();
        }
        
        return response.data.data.theme;
      }
      
      throw new Error(response.data.message || 'Error actualizando tema');
    } catch (error) {
      console.error('Error actualizando tema en servidor:', error.message);
      // Mantener cambio local aunque falle el servidor
      return themeConfig;
    }
  }

  // ==========================================
  // OBTENER TEMAS PREDEFINIDOS
  // ==========================================

  async getPresetThemes() {
    try {
      const response = await apiClient.get('/themes/presets');
      
      if (response.data.success) {
        return response.data.data.themes;
      }
      
      throw new Error(response.data.message || 'Error obteniendo temas predefinidos');
    } catch (error) {
      console.warn('Error obteniendo temas predefinidos:', error.message);
      
      // Fallback a temas locales
      return this.getLocalPresetThemes();
    }
  }

  // ==========================================
  // APLICAR TEMA PREDEFINIDO
  // ==========================================

  async applyPresetTheme(themeId) {
    try {
      const response = await apiClient.post(`/themes/presets/${themeId}/apply`);
      
      if (response.data.success) {
        // Guardar localmente
        await this.saveThemeLocally(response.data.data.theme);
        return response.data.data.theme;
      }
      
      throw new Error(response.data.message || 'Error aplicando tema predefinido');
    } catch (error) {
      console.error('Error aplicando tema predefinido:', error.message);
      
      // Fallback: aplicar tema local si existe
      const presetThemes = this.getLocalPresetThemes();
      const selectedTheme = presetThemes.find(theme => theme.id === themeId);
      
      if (selectedTheme) {
        await this.saveThemeLocally(selectedTheme.config);
        return selectedTheme.config;
      }
      
      throw error;
    }
  }

  // ==========================================
  // SINCRONIZAR TEMA
  // ==========================================

  async syncTheme() {
    try {
      const deviceId = await this.getDeviceId();
      const platform = Platform.OS;
      
      await apiClient.post('/themes/sync', {
        deviceId,
        platform
      });
      
      console.log('Tema sincronizado exitosamente');
    } catch (error) {
      console.error('Error sincronizando tema:', error.message);
    }
  }

  // ==========================================
  // ALMACENAMIENTO LOCAL
  // ==========================================

  async saveThemeLocally(themeConfig) {
    try {
      const themeData = {
        ...themeConfig,
        lastUpdated: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(this.THEME_KEY, JSON.stringify(themeData));
    } catch (error) {
      console.error('Error guardando tema localmente:', error);
    }
  }

  async getLocalTheme() {
    try {
      const storedTheme = await AsyncStorage.getItem(this.THEME_KEY);
      
      if (storedTheme) {
        return JSON.parse(storedTheme);
      }
      
      // Retornar tema por defecto si no hay configuración guardada
      return this.defaultTheme;
    } catch (error) {
      console.error('Error obteniendo tema local:', error);
      return this.defaultTheme;
    }
  }

  async clearLocalTheme() {
    try {
      await AsyncStorage.removeItem(this.THEME_KEY);
    } catch (error) {
      console.error('Error eliminando tema local:', error);
    }
  }

  // ==========================================
  // TEMAS PREDEFINIDOS LOCALES
  // ==========================================

  getLocalPresetThemes() {
    return [
      {
        id: 'default-dark',
        name: 'Oscuro Predeterminado',
        description: 'Tema oscuro con acentos cian y púrpura',
        config: {
          mode: 'dark',
          primaryColor: 'cyan',
          accentColor: 'purple',
          customColors: {
            primary: '#06b6d4',
            secondary: '#8b5cf6',
            accent: '#f59e0b',
            background: '#0f172a',
            surface: '#1e293b',
            text: '#f8fafc'
          },
          animations: true,
          glassEffect: true,
          neonEffects: false
        }
      },
      {
        id: 'neon-cyber',
        name: 'Cyber Neon',
        description: 'Tema cyberpunk con efectos neon',
        config: {
          mode: 'dark',
          primaryColor: 'cyan',
          accentColor: 'pink',
          customColors: {
            primary: '#00ffff',
            secondary: '#ff00ff',
            accent: '#ffff00',
            background: '#000000',
            surface: '#111111',
            text: '#ffffff'
          },
          animations: true,
          glassEffect: false,
          neonEffects: true
        }
      },
      {
        id: 'minimal-light',
        name: 'Minimalista Claro',
        description: 'Tema claro y limpio',
        config: {
          mode: 'light',
          primaryColor: 'blue',
          accentColor: 'green',
          customColors: {
            primary: '#2563eb',
            secondary: '#059669',
            accent: '#d97706',
            background: '#ffffff',
            surface: '#f8fafc',
            text: '#1e293b'
          },
          animations: true,
          glassEffect: false,
          neonEffects: false
        }
      },
      {
        id: 'sunset-gradient',
        name: 'Atardecer',
        description: 'Gradientes cálidos inspirados en el atardecer',
        config: {
          mode: 'dark',
          primaryColor: 'orange',
          accentColor: 'red',
          customColors: {
            primary: '#ea580c',
            secondary: '#dc2626',
            accent: '#facc15',
            background: '#1c1917',
            surface: '#292524',
            text: '#fef3c7'
          },
          animations: true,
          glassEffect: true,
          neonEffects: false
        }
      },
      {
        id: 'forest-green',
        name: 'Bosque Verde',
        description: 'Tema natural con tonos verdes',
        config: {
          mode: 'dark',
          primaryColor: 'green',
          accentColor: 'blue',
          customColors: {
            primary: '#059669',
            secondary: '#0284c7',
            accent: '#84cc16',
            background: '#064e3b',
            surface: '#065f46',
            text: '#ecfdf5'
          },
          animations: true,
          glassEffect: true,
          neonEffects: false
        }
      }
    ];
  }

  // ==========================================
  // UTILIDADES
  // ==========================================

  async getDeviceId() {
    try {
      let deviceId = await SecureStore.getItemAsync('device_id');
      
      if (!deviceId) {
        // Generar ID único para el dispositivo
        deviceId = `${Platform.OS}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await SecureStore.setItemAsync('device_id', deviceId);
      }
      
      return deviceId;
    } catch (error) {
      console.error('Error obteniendo device ID:', error);
      return `${Platform.OS}_${Date.now()}`;
    }
  }

  getCurrentMode(themeConfig, appearance) {
    if (themeConfig.mode === 'auto') {
      return appearance === 'dark' ? 'dark' : 'light';
    }
    return themeConfig.mode;
  }

  getThemeStyles(themeConfig, appearance) {
    const currentMode = this.getCurrentMode(themeConfig, appearance);
    
    return {
      colors: {
        ...themeConfig.customColors,
        mode: currentMode
      },
      animations: {
        enabled: themeConfig.animations && !themeConfig.reducedMotion,
        duration: themeConfig.animations ? 300 : 0
      },
      effects: {
        glass: themeConfig.glassEffect,
        neon: themeConfig.neonEffects,
        reducedMotion: themeConfig.reducedMotion
      }
    };
  }

  // ==========================================
  // MIGRACIÓN DE DATOS
  // ==========================================

  async migrateThemeData() {
    try {
      // Migrar datos antiguos si es necesario
      const oldThemeKey = 'theme_preferences';
      const oldTheme = await AsyncStorage.getItem(oldThemeKey);
      
      if (oldTheme && !await AsyncStorage.getItem(this.THEME_KEY)) {
        const parsedTheme = JSON.parse(oldTheme);
        await this.saveThemeLocally({
          ...this.defaultTheme,
          ...parsedTheme
        });
        
        // Limpiar datos antiguos
        await AsyncStorage.removeItem(oldThemeKey);
        console.log('Migración de tema completada');
      }
    } catch (error) {
      console.error('Error migrando datos de tema:', error);
    }
  }
}

export default new ThemeService();
