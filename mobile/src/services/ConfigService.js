import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

class ConfigService {
  constructor() {
    this.config = {
      // API Configuration
      api: {
        baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000',
        timeout: 10000,
        retryAttempts: 3,
        retryDelay: 1000,
      },
      
      // Authentication Configuration
      auth: {
        tokenKey: 'auth_token',
        refreshTokenKey: 'refresh_token',
        userKey: 'user_data',
        sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
        autoRefreshThreshold: 5 * 60 * 1000, // 5 minutes before expiry
      },
      
      // Notification Configuration
      notifications: {
        pushEnabled: true,
        inAppEnabled: true,
        soundEnabled: true,
        vibrationEnabled: true,
        badgeEnabled: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
        categories: {
          events: { enabled: true, priority: 'high' },
          tribes: { enabled: true, priority: 'normal' },
          chat: { enabled: true, priority: 'high' },
          system: { enabled: true, priority: 'low' },
        },
      },
      
      // Location Configuration
      location: {
        enabled: true,
        accuracy: 'balanced', // low, balanced, high
        maxAge: 5 * 60 * 1000, // 5 minutes
        timeout: 10000,
        backgroundUpdates: false,
        geofenceRadius: 1000, // meters
      },
      
      // Cache Configuration
      cache: {
        maxAge: 30 * 60 * 1000, // 30 minutes
        maxSize: 50 * 1024 * 1024, // 50 MB
        autoCleanup: true,
        cleanupInterval: 60 * 60 * 1000, // 1 hour
      },
      
      // Chat Configuration
      chat: {
        reconnectAttempts: 5,
        reconnectDelay: 2000,
        messageRetryAttempts: 3,
        typingIndicatorTimeout: 3000,
        messageHistoryLimit: 100,
        fileUploadMaxSize: 10 * 1024 * 1024, // 10 MB
        allowedFileTypes: ['image', 'video', 'audio', 'document'],
      },
      
      // Search Configuration
      search: {
        debounceDelay: 300,
        minQueryLength: 2,
        maxSuggestions: 8,
        maxRecentSearches: 10,
        cacheResults: true,
        cacheDuration: 15 * 60 * 1000, // 15 minutes
      },
      
      // UI Configuration
      ui: {
        theme: 'dark', // light, dark, auto
        language: 'es',
        animations: true,
        hapticFeedback: true,
        reducedMotion: false,
        fontSize: 'medium', // small, medium, large
        tabBarPosition: 'bottom',
      },
      
      // Privacy Configuration
      privacy: {
        analyticsEnabled: true,
        crashReportingEnabled: true,
        locationSharingEnabled: true,
        profileVisibility: 'public', // public, friends, private
        activityTracking: true,
        dataCollection: 'essential', // essential, functional, all
      },
      
      // Performance Configuration
      performance: {
        imageQuality: 0.8,
        videoQuality: 'medium', // low, medium, high
        preloadImages: true,
        lazyLoading: true,
        backgroundTasksEnabled: true,
        offlineMode: true,
      },
      
      // Feature Flags
      features: {
        socialLogin: true,
        multifactorAuth: true,
        voiceMessages: false,
        videoChat: false,
        storyMode: false,
        liveEvents: true,
        gamification: false,
        marketplace: false,
      },
      
      // Development Configuration
      dev: {
        debugMode: __DEV__,
        showPerformanceOverlay: false,
        enableConsoleWarnings: __DEV__,
        mockAPI: false,
        skipAuthentication: false,
        useTestData: false,
      },
    };
    
    this.loadedConfig = null;
    this.configListeners = [];
  }

  // Initialize configuration
  async initialize() {
    try {
      await this.loadConfig();
      console.log('Configuration service initialized');
    } catch (error) {
      console.error('Error initializing config service:', error);
    }
  }

  // Load configuration from storage
  async loadConfig() {
    try {
      const storedConfig = await AsyncStorage.getItem('app_config');
      if (storedConfig) {
        this.loadedConfig = JSON.parse(storedConfig);
        // Merge with default config
        this.config = this.mergeDeep(this.config, this.loadedConfig);
      }
      
      // Load secure config items
      const secureItems = ['auth.tokenKey', 'auth.refreshTokenKey'];
      for (const item of secureItems) {
        const value = await this.getSecureItem(item);
        if (value) {
          this.setNestedValue(this.config, item, value);
        }
      }
      
    } catch (error) {
      console.error('Error loading config:', error);
    }
  }

  // Save configuration to storage
  async saveConfig() {
    try {
      const configToSave = { ...this.config };
      
      // Remove sensitive data before saving to AsyncStorage
      delete configToSave.auth.tokenKey;
      delete configToSave.auth.refreshTokenKey;
      
      await AsyncStorage.setItem('app_config', JSON.stringify(configToSave));
      
      // Save sensitive items to secure store
      if (this.config.auth.tokenKey) {
        await this.setSecureItem('auth.tokenKey', this.config.auth.tokenKey);
      }
      if (this.config.auth.refreshTokenKey) {
        await this.setSecureItem('auth.refreshTokenKey', this.config.auth.refreshTokenKey);
      }
      
      this.notifyConfigChange();
      
    } catch (error) {
      console.error('Error saving config:', error);
    }
  }

  // Get configuration value
  get(path, defaultValue = null) {
    return this.getNestedValue(this.config, path) ?? defaultValue;
  }

  // Set configuration value
  async set(path, value) {
    this.setNestedValue(this.config, path, value);
    await this.saveConfig();
  }

  // Get multiple configuration values
  getAll(paths) {
    const result = {};
    paths.forEach(path => {
      result[path] = this.get(path);
    });
    return result;
  }

  // Set multiple configuration values
  async setAll(values) {
    Object.keys(values).forEach(path => {
      this.setNestedValue(this.config, path, values[path]);
    });
    await this.saveConfig();
  }

  // Reset configuration to defaults
  async resetToDefaults(section = null) {
    try {
      if (section) {
        const defaultSection = this.getDefaultConfig(section);
        this.setNestedValue(this.config, section, defaultSection);
      } else {
        this.config = { ...this.getDefaultConfig() };
      }
      
      await this.saveConfig();
    } catch (error) {
      console.error('Error resetting config:', error);
    }
  }

  // Get default configuration
  getDefaultConfig(section = null) {
    const defaults = {
      api: {
        baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000',
        timeout: 10000,
        retryAttempts: 3,
        retryDelay: 1000,
      },
      notifications: {
        pushEnabled: true,
        inAppEnabled: true,
        soundEnabled: true,
        vibrationEnabled: true,
        categories: {
          events: { enabled: true, priority: 'high' },
          tribes: { enabled: true, priority: 'normal' },
          chat: { enabled: true, priority: 'high' },
        },
      },
      ui: {
        theme: 'dark',
        language: 'es',
        animations: true,
        hapticFeedback: true,
      },
      privacy: {
        analyticsEnabled: true,
        locationSharingEnabled: true,
        profileVisibility: 'public',
      },
    };
    
    return section ? defaults[section] : defaults;
  }

  // Update configuration from server
  async syncFromServer() {
    try {
      const token = await this.getSecureItem('auth.tokenKey');
      if (!token) return;
      
      const response = await fetch(`${this.get('api.baseURL')}/config/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const serverConfig = await response.json();
        await this.setAll(serverConfig.data);
        console.log('Configuration synced from server');
      }
    } catch (error) {
      console.error('Error syncing config from server:', error);
    }
  }

  // Push configuration to server
  async syncToServer() {
    try {
      const token = await this.getSecureItem('auth.tokenKey');
      if (!token) return;
      
      const configToSync = {
        notifications: this.config.notifications,
        ui: this.config.ui,
        privacy: this.config.privacy,
      };
      
      const response = await fetch(`${this.get('api.baseURL')}/config/user`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configToSync),
      });
      
      if (response.ok) {
        console.log('Configuration synced to server');
      }
    } catch (error) {
      console.error('Error syncing config to server:', error);
    }
  }

  // Add configuration change listener
  addChangeListener(listener) {
    this.configListeners.push(listener);
  }

  // Remove configuration change listener
  removeChangeListener(listener) {
    const index = this.configListeners.indexOf(listener);
    if (index > -1) {
      this.configListeners.splice(index, 1);
    }
  }

  // Notify configuration change
  notifyConfigChange() {
    this.configListeners.forEach(listener => {
      try {
        listener(this.config);
      } catch (error) {
        console.error('Error notifying config change:', error);
      }
    });
  }

  // Utility: Get nested value from object
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => 
      current && current[key] !== undefined ? current[key] : undefined, obj
    );
  }

  // Utility: Set nested value in object
  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  // Utility: Deep merge objects
  mergeDeep(target, source) {
    const result = { ...target };
    
    Object.keys(source).forEach(key => {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.mergeDeep(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    });
    
    return result;
  }

  // Utility: Get secure item
  async getSecureItem(key) {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem(`secure_${key}`);
      } else {
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.error(`Error getting secure item ${key}:`, error);
      return null;
    }
  }

  // Utility: Set secure item
  async setSecureItem(key, value) {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem(`secure_${key}`, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error(`Error setting secure item ${key}:`, error);
    }
  }

  // Utility: Delete secure item
  async deleteSecureItem(key) {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem(`secure_${key}`);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error(`Error deleting secure item ${key}:`, error);
    }
  }

  // Export configuration for backup
  async exportConfig() {
    try {
      const configToExport = { ...this.config };
      
      // Remove sensitive information
      delete configToExport.auth;
      delete configToExport.dev;
      
      return {
        version: '1.0',
        timestamp: new Date().toISOString(),
        config: configToExport,
      };
    } catch (error) {
      console.error('Error exporting config:', error);
      return null;
    }
  }

  // Import configuration from backup
  async importConfig(exportedConfig) {
    try {
      if (!exportedConfig || !exportedConfig.config) {
        throw new Error('Invalid configuration format');
      }
      
      // Merge imported config with current config
      const importedData = exportedConfig.config;
      this.config = this.mergeDeep(this.config, importedData);
      
      await this.saveConfig();
      
      console.log('Configuration imported successfully');
      return true;
    } catch (error) {
      console.error('Error importing config:', error);
      return false;
    }
  }

  // Validate configuration
  validateConfig() {
    const issues = [];
    
    // Validate API configuration
    if (!this.config.api.baseURL) {
      issues.push('API base URL is not configured');
    }
    
    // Validate notification configuration
    if (this.config.notifications.categories) {
      Object.keys(this.config.notifications.categories).forEach(category => {
        const config = this.config.notifications.categories[category];
        if (!['low', 'normal', 'high'].includes(config.priority)) {
          issues.push(`Invalid priority for notification category: ${category}`);
        }
      });
    }
    
    // Validate UI configuration
    if (!['light', 'dark', 'auto'].includes(this.config.ui.theme)) {
      issues.push('Invalid UI theme configuration');
    }
    
    // Validate privacy configuration
    if (!['public', 'friends', 'private'].includes(this.config.privacy.profileVisibility)) {
      issues.push('Invalid profile visibility configuration');
    }
    
    return {
      isValid: issues.length === 0,
      issues,
    };
  }

  // Clear all configuration
  async clearConfig() {
    try {
      await AsyncStorage.removeItem('app_config');
      
      // Clear secure items
      await this.deleteSecureItem('auth.tokenKey');
      await this.deleteSecureItem('auth.refreshTokenKey');
      
      this.config = { ...this.getDefaultConfig() };
      
      console.log('Configuration cleared');
    } catch (error) {
      console.error('Error clearing config:', error);
    }
  }
}

export default new ConfigService();









