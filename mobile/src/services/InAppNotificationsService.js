import axios from 'axios';

// Configuración de la API
const API_URL = 'http://localhost:5000/api';

class InAppNotificationsService {
  constructor() {
    this.notifications = [];
    this.unreadCount = 0;
    this.listeners = [];
  }

  // ==========================================
  // OBTENER NOTIFICACIONES
  // ==========================================

  async getNotifications(page = 1, limit = 20) {
    try {
      const response = await axios.get(`${API_URL}/notifications/in-app`, {
        params: { page, limit }
      });
      
      this.notifications = response.data.data || [];
      this.updateUnreadCount();
      this.notifyListeners('notifications_updated', this.notifications);
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo notificaciones');
    }
  }

  async getUnreadNotifications() {
    try {
      const response = await axios.get(`${API_URL}/notifications/in-app/unread`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo notificaciones no leídas');
    }
  }

  async getNotificationById(notificationId) {
    try {
      const response = await axios.get(`${API_URL}/notifications/in-app/${notificationId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo detalles de notificación');
    }
  }

  // ==========================================
  // GESTIÓN DE NOTIFICACIONES
  // ==========================================

  async markAsRead(notificationId) {
    try {
      const response = await axios.put(`${API_URL}/notifications/in-app/${notificationId}/read`);
      
      // Actualizar notificación local
      this.notifications = this.notifications.map(notification =>
        notification._id === notificationId
          ? { ...notification, read: true, readAt: new Date().toISOString() }
          : notification
      );
      
      this.updateUnreadCount();
      this.notifyListeners('notification_read', notificationId);
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error marcando notificación como leída');
    }
  }

  async markAsUnread(notificationId) {
    try {
      const response = await axios.put(`${API_URL}/notifications/in-app/${notificationId}/unread`);
      
      // Actualizar notificación local
      this.notifications = this.notifications.map(notification =>
        notification._id === notificationId
          ? { ...notification, read: false, readAt: null }
          : notification
      );
      
      this.updateUnreadCount();
      this.notifyListeners('notification_unread', notificationId);
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error marcando notificación como no leída');
    }
  }

  async markAllAsRead() {
    try {
      const response = await axios.put(`${API_URL}/notifications/in-app/mark-all-read`);
      
      // Actualizar todas las notificaciones locales
      this.notifications = this.notifications.map(notification => ({
        ...notification,
        read: true,
        readAt: new Date().toISOString()
      }));
      
      this.updateUnreadCount();
      this.notifyListeners('all_notifications_read');
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error marcando todas las notificaciones como leídas');
    }
  }

  async deleteNotification(notificationId) {
    try {
      const response = await axios.delete(`${API_URL}/notifications/in-app/${notificationId}`);
      
      // Remover notificación de la lista local
      this.notifications = this.notifications.filter(
        notification => notification._id !== notificationId
      );
      
      this.updateUnreadCount();
      this.notifyListeners('notification_deleted', notificationId);
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error eliminando notificación');
    }
  }

  async deleteAllNotifications() {
    try {
      const response = await axios.delete(`${API_URL}/notifications/in-app`);
      
      // Limpiar todas las notificaciones locales
      this.notifications = [];
      this.updateUnreadCount();
      this.notifyListeners('all_notifications_deleted');
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error eliminando todas las notificaciones');
    }
  }

  // ==========================================
  // PREFERENCIAS
  // ==========================================

  async getPreferences() {
    try {
      const response = await axios.get(`${API_URL}/notifications/preferences`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo preferencias');
    }
  }

  async updatePreferences(preferences) {
    try {
      const response = await axios.put(`${API_URL}/notifications/preferences`, preferences);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error actualizando preferencias');
    }
  }

  async getNotificationTypes() {
    try {
      const response = await axios.get(`${API_URL}/notifications/types`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo tipos de notificación');
    }
  }

  // ==========================================
  // NOTIFICACIONES PROGRAMADAS
  // ==========================================

  async getScheduledNotifications() {
    try {
      const response = await axios.get(`${API_URL}/notifications/scheduled`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo notificaciones programadas');
    }
  }

  async cancelScheduledNotification(notificationId) {
    try {
      const response = await axios.delete(`${API_URL}/notifications/scheduled/${notificationId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error cancelando notificación programada');
    }
  }

  async scheduleNotification(notificationData) {
    try {
      const response = await axios.post(`${API_URL}/notifications/scheduled`, notificationData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error programando notificación');
    }
  }

  // ==========================================
  // ANALYTICS
  // ==========================================

  async getAnalytics(timeframe = '7d') {
    try {
      const response = await axios.get(`${API_URL}/notifications/analytics`, {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo analytics');
    }
  }

  async trackNotificationOpened(notificationId) {
    try {
      const response = await axios.post(`${API_URL}/notifications/analytics/opened`, {
        notificationId,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error tracking notification opened:', error);
    }
  }

  async trackNotificationAction(notificationId, action) {
    try {
      const response = await axios.post(`${API_URL}/notifications/analytics/action`, {
        notificationId,
        action,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error tracking notification action:', error);
    }
  }

  // ==========================================
  // GESTIÓN LOCAL DE ESTADO
  // ==========================================

  updateUnreadCount() {
    this.unreadCount = this.notifications.filter(notification => !notification.read).length;
  }

  getLocalNotifications() {
    return this.notifications;
  }

  getUnreadCount() {
    return this.unreadCount;
  }

  // ==========================================
  // SISTEMA DE EVENTOS
  // ==========================================

  addListener(callback) {
    this.listeners.push(callback);
    
    // Retornar función para remover listener
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  notifyListeners(event, data) {
    this.listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }

  // ==========================================
  // UTILIDADES
  // ==========================================

  formatNotification(notification) {
    return {
      id: notification._id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      data: notification.data,
      read: notification.read,
      createdAt: notification.createdAt,
      readAt: notification.readAt,
      icon: this.getNotificationIcon(notification.type),
      color: this.getNotificationColor(notification.type),
    };
  }

  getNotificationIcon(type) {
    const icons = {
      event: '📅',
      tribe: '👥',
      chat: '💬',
      like: '❤️',
      comment: '💬',
      follow: '👤',
      reminder: '⏰',
      system: '⚙️',
      promotion: '🎉',
      warning: '⚠️',
      error: '❌',
      success: '✅',
      info: 'ℹ️',
    };
    
    return icons[type] || '🔔';
  }

  getNotificationColor(type) {
    const colors = {
      event: '#67e8f9',
      tribe: '#a855f7',
      chat: '#22c55e',
      like: '#ef4444',
      comment: '#3b82f6',
      follow: '#f59e0b',
      reminder: '#f97316',
      system: '#6b7280',
      promotion: '#ec4899',
      warning: '#eab308',
      error: '#ef4444',
      success: '#22c55e',
      info: '#3b82f6',
    };
    
    return colors[type] || '#9ca3af';
  }

  formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Hace un momento';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Hace ${minutes}m`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Hace ${hours}h`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `Hace ${days}d`;
    } else {
      return date.toLocaleDateString('es-ES');
    }
  }

  // ==========================================
  // FILTROS Y BÚSQUEDA
  // ==========================================

  filterNotificationsByType(type) {
    return this.notifications.filter(notification => notification.type === type);
  }

  filterNotificationsByRead(isRead) {
    return this.notifications.filter(notification => notification.read === isRead);
  }

  searchNotifications(query) {
    const lowercaseQuery = query.toLowerCase();
    return this.notifications.filter(notification =>
      notification.title.toLowerCase().includes(lowercaseQuery) ||
      notification.message.toLowerCase().includes(lowercaseQuery)
    );
  }

  groupNotificationsByDate() {
    const groups = {};
    
    this.notifications.forEach(notification => {
      const date = new Date(notification.createdAt);
      const dateString = date.toLocaleDateString('es-ES');
      
      if (!groups[dateString]) {
        groups[dateString] = [];
      }
      
      groups[dateString].push(notification);
    });
    
    return groups;
  }

  // ==========================================
  // LIMPIEZA Y MANTENIMIENTO
  // ==========================================

  async cleanupOldNotifications(daysOld = 30) {
    try {
      const response = await axios.delete(`${API_URL}/notifications/in-app/cleanup`, {
        params: { daysOld }
      });
      
      // Actualizar notificaciones locales
      await this.getNotifications();
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error limpiando notificaciones antiguas');
    }
  }

  clearLocalCache() {
    this.notifications = [];
    this.unreadCount = 0;
    this.notifyListeners('cache_cleared');
  }

  // ==========================================
  // CONFIGURACIÓN DE POLLING
  // ==========================================

  startPolling(intervalMs = 30000) { // 30 segundos por defecto
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    
    this.pollingInterval = setInterval(async () => {
      try {
        await this.getNotifications();
      } catch (error) {
        console.error('Error in notification polling:', error);
      }
    }, intervalMs);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // ==========================================
  // GESTIÓN DE RECURSOS
  // ==========================================

  cleanup() {
    this.stopPolling();
    this.listeners = [];
    this.notifications = [];
    this.unreadCount = 0;
  }
}

// Exportar instancia única
const inAppNotificationsService = new InAppNotificationsService();
export default inAppNotificationsService;

