import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { Platform } from 'react-native';

class AnalyticsService {
  constructor() {
    this.baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
    this.eventQueue = [];
    this.isOnline = true;
    this.batchSize = 10;
    this.maxRetries = 3;
    this.flushInterval = 30000; // 30 seconds
    
    this.startPeriodicFlush();
  }

  // Initialize analytics service
  async initialize() {
    try {
      // Get device info for analytics
      const deviceInfo = await this.getDeviceInfo();
      await AsyncStorage.setItem('analytics_device_info', JSON.stringify(deviceInfo));
      
      // Flush any queued events
      await this.flushEvents();
      
      console.log('Analytics service initialized');
    } catch (error) {
      console.error('Error initializing analytics service:', error);
    }
  }

  // Get device information
  async getDeviceInfo() {
    try {
      const deviceInfo = {
        deviceId: await Application.getAndroidId() || Device.osInternalBuildId,
        deviceName: Device.deviceName,
        deviceType: Device.deviceType,
        osName: Device.osName,
        osVersion: Device.osVersion,
        platform: Platform.OS,
        appVersion: await Application.getApplicationVersion(),
        buildVersion: await Application.getBuildVersion(),
        bundleId: await Application.getApplicationId(),
        manufacturer: Device.manufacturer,
        model: Device.modelName,
        brand: Device.brand,
        isEmulator: !Device.isDevice,
        screenDimensions: null, // To be set by UI components
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locale: Intl.DateTimeFormat().resolvedOptions().locale,
        timestamp: new Date().toISOString(),
      };
      
      return deviceInfo;
    } catch (error) {
      console.error('Error getting device info:', error);
      return {
        deviceId: 'unknown',
        platform: Platform.OS,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Track event
  async trackEvent(eventName, properties = {}, userId = null) {
    try {
      const deviceInfo = await this.getCachedDeviceInfo();
      const token = await AsyncStorage.getItem('token');
      
      const event = {
        eventName,
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
          sessionId: await this.getSessionId(),
        },
        userId: userId || await this.getCurrentUserId(),
        deviceInfo,
        metadata: {
          sdkVersion: '1.0.0',
          source: 'mobile',
          platform: Platform.OS,
        },
      };
      
      // Add to queue
      this.eventQueue.push(event);
      
      // Try to flush immediately if online
      if (this.isOnline && this.eventQueue.length >= this.batchSize) {
        await this.flushEvents();
      }
      
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  // Track screen view
  async trackScreenView(screenName, properties = {}) {
    await this.trackEvent('screen_view', {
      screen_name: screenName,
      ...properties,
    });
  }

  // Track user action
  async trackUserAction(action, category, properties = {}) {
    await this.trackEvent('user_action', {
      action,
      category,
      ...properties,
    });
  }

  // Track error
  async trackError(error, context = {}) {
    await this.trackEvent('error', {
      error_message: error.message || String(error),
      error_stack: error.stack,
      context,
      severity: 'error',
    });
  }

  // Track performance metrics
  async trackPerformance(metric, value, properties = {}) {
    await this.trackEvent('performance', {
      metric,
      value,
      ...properties,
    });
  }

  // Flush events to server
  async flushEvents() {
    if (this.eventQueue.length === 0) return;
    
    try {
      const token = await AsyncStorage.getItem('token');
      const events = [...this.eventQueue];
      
      const response = await axios.post(
        `${this.baseURL}/analytics/events`,
        { events },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );
      
      if (response.status === 200) {
        // Clear sent events from queue
        this.eventQueue.splice(0, events.length);
        console.log(`Flushed ${events.length} analytics events`);
      }
      
    } catch (error) {
      console.error('Error flushing analytics events:', error);
      
      // If events failed to send, keep them in queue for retry
      // But limit queue size to prevent memory issues
      if (this.eventQueue.length > 100) {
        this.eventQueue.splice(0, this.eventQueue.length - 100);
      }
    }
  }

  // Get cached device info
  async getCachedDeviceInfo() {
    try {
      const cached = await AsyncStorage.getItem('analytics_device_info');
      return cached ? JSON.parse(cached) : await this.getDeviceInfo();
    } catch (error) {
      return await this.getDeviceInfo();
    }
  }

  // Get or generate session ID
  async getSessionId() {
    try {
      let sessionId = await AsyncStorage.getItem('analytics_session_id');
      
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem('analytics_session_id', sessionId);
        
        // Set session expiry (24 hours)
        const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
        await AsyncStorage.setItem('analytics_session_expiry', String(expiryTime));
      } else {
        // Check if session expired
        const expiryTime = await AsyncStorage.getItem('analytics_session_expiry');
        if (expiryTime && Date.now() > parseInt(expiryTime)) {
          // Generate new session
          sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await AsyncStorage.setItem('analytics_session_id', sessionId);
          
          const newExpiryTime = Date.now() + (24 * 60 * 60 * 1000);
          await AsyncStorage.setItem('analytics_session_expiry', String(newExpiryTime));
        }
      }
      
      return sessionId;
    } catch (error) {
      console.error('Error getting session ID:', error);
      return `session_${Date.now()}`;
    }
  }

  // Get current user ID
  async getCurrentUserId() {
    try {
      const userString = await AsyncStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        return user.id || user._id;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // Start periodic flush
  startPeriodicFlush() {
    setInterval(async () => {
      if (this.eventQueue.length > 0) {
        await this.flushEvents();
      }
    }, this.flushInterval);
  }

  // Set network status
  setNetworkStatus(isOnline) {
    this.isOnline = isOnline;
    
    if (isOnline && this.eventQueue.length > 0) {
      this.flushEvents();
    }
  }

  // Get analytics data from server
  async getEventStats(params = {}) {
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await axios.get(`${this.baseURL}/events/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting event stats:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas de eventos');
    }
  }

  // Get notification analytics
  async getNotificationAnalytics(params = {}) {
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await axios.get(`${this.baseURL}/notifications/analytics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting notification analytics:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener analytics de notificaciones');
    }
  }

  // Get user engagement metrics
  async getUserEngagement(timeframe = '7d') {
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await axios.get(`${this.baseURL}/analytics/engagement`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { timeframe },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting user engagement:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener métricas de engagement');
    }
  }

  // Get app usage statistics
  async getAppUsageStats(timeframe = '30d') {
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await axios.get(`${this.baseURL}/analytics/usage`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { timeframe },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting app usage stats:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas de uso');
    }
  }

  // Get tribe analytics
  async getTribeAnalytics(tribeId, timeframe = '30d') {
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await axios.get(`${this.baseURL}/tribes/${tribeId}/analytics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { timeframe },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting tribe analytics:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener analytics de tribu');
    }
  }

  // Get content performance
  async getContentPerformance(contentType, contentId, timeframe = '30d') {
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await axios.get(`${this.baseURL}/analytics/content/${contentType}/${contentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { timeframe },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting content performance:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener rendimiento de contenido');
    }
  }

  // Clear analytics data (for privacy/logout)
  async clearAnalyticsData() {
    try {
      await AsyncStorage.multiRemove([
        'analytics_device_info',
        'analytics_session_id',
        'analytics_session_expiry',
      ]);
      
      this.eventQueue = [];
      console.log('Analytics data cleared');
    } catch (error) {
      console.error('Error clearing analytics data:', error);
    }
  }

  // Export analytics data (for user data export)
  async exportAnalyticsData() {
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await axios.get(`${this.baseURL}/analytics/export`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error exporting analytics data:', error);
      throw new Error(error.response?.data?.message || 'Error al exportar datos de analytics');
    }
  }

  // Set user properties
  async setUserProperties(properties) {
    try {
      const token = await AsyncStorage.getItem('token');
      
      await axios.put(
        `${this.baseURL}/analytics/user-properties`,
        properties,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log('User properties updated');
    } catch (error) {
      console.error('Error setting user properties:', error);
    }
  }

  // Increment user property
  async incrementUserProperty(property, value = 1) {
    await this.trackEvent('user_property_increment', {
      property,
      value,
    });
  }
}

export default new AnalyticsService();









