const cache = require('../config/cache');

// ===== SERVICIO DE ANALYTICS =====
class AnalyticsService {
  /**
   * Registra un evento de analytics
   */
  static async trackEvent(userId, eventName, properties = {}) {
    try {
      const eventData = {
        userId,
        eventName,
        properties,
        timestamp: new Date(),
        sessionId: this.generateSessionId(),
        platform: properties.platform || 'web'
      };

      // En una implementación real, esto se enviaría a Mixpanel/Amplitude
      console.log('📊 Analytics Event:', eventData);

      // Guardar en caché para métricas en tiempo real
      await this.updateRealTimeMetrics(eventName, properties);

      return eventData;

    } catch (error) {
      console.error('Error tracking analytics event:', error);
      // No lanzar error para no interrumpir el flujo principal
    }
  }

  /**
   * Registra una página vista
   */
  static async trackPageView(userId, page, referrer = null) {
    return this.trackEvent(userId, 'page_view', {
      page,
      referrer,
      timestamp: Date.now()
    });
  }

  /**
   * Registra conversión de usuario
   */
  static async trackConversion(userId, conversionType, value = null) {
    return this.trackEvent(userId, 'conversion', {
      type: conversionType,
      value,
      timestamp: Date.now()
    });
  }

  /**
   * Actualiza métricas en tiempo real
   */
  static async updateRealTimeMetrics(eventName, properties) {
    try {
      const metricsKey = 'realtime_metrics';
      let metrics = await cache.get(metricsKey) || {
        activeUsers: 0,
        eventsToday: 0,
        newSignups: 0,
        engagementRate: 0,
        trendingEvents: [],
        lastUpdated: new Date().toISOString()
      };

      // Actualizar métricas basado en el evento
      switch (eventName) {
        case 'user_signup':
          metrics.newSignups += 1;
          break;
        case 'event_created':
          metrics.eventsToday += 1;
          break;
        case 'user_active':
          metrics.activeUsers = Math.max(metrics.activeUsers, properties.activeCount || 1);
          break;
        case 'engagement_action':
          metrics.engagementRate = Math.min(100, metrics.engagementRate + 0.1);
          break;
      }

      metrics.lastUpdated = new Date().toISOString();

      // Guardar métricas actualizadas (TTL 1 hora)
      await cache.set(metricsKey, metrics, 60 * 60);

    } catch (error) {
      console.error('Error updating real-time metrics:', error);
    }
  }

  /**
   * Obtiene métricas en tiempo real
   */
  static async getRealTimeMetrics() {
    try {
      const metrics = await cache.get('realtime_metrics');
      return metrics || {
        activeUsers: 0,
        eventsToday: 0,
        newSignups: 0,
        engagementRate: 0,
        trendingEvents: [],
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting real-time metrics:', error);
      return null;
    }
  }

  /**
   * Genera ID de sesión único
   */
  static generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtiene estadísticas de usuario
   */
  static async getUserStats(userId) {
    try {
      // En una implementación real, consultarías la base de datos
      return {
        totalEvents: 0,
        eventsThisMonth: 0,
        avgSessionTime: 0,
        lastActive: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  }

  /**
   * Registra error para monitoring
   */
  static async trackError(error, context = {}) {
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date(),
        severity: context.severity || 'error'
      };

      console.error('🚨 Error tracked:', errorData);

      // En producción, esto se enviaría a Sentry
      return errorData;

    } catch (trackingError) {
      console.error('Error tracking error:', trackingError);
    }
  }
}

module.exports = AnalyticsService;