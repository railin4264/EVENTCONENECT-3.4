import { useEffect } from 'react';

class AnalyticsService {
  constructor() {
    this.ga = null;
    this.gtag = null;
    this.isInitialized = false;
    this.userId = null;
    this.sessionId = null;
    this.customEvents = new Map();
    this.pageViews = [];
    this.events = [];
    this.goals = new Map();
    this.ecommerce = {
      items: [],
      transactions: [],
    };
  }

  // Inicializar Google Analytics
  initialize(measurementId, options = {}) {
    if (this.isInitialized) {
      console.log('Analytics ya inicializado');
      return;
    }

    try {
      // Configuración por defecto
      const defaultOptions = {
        debug_mode: process.env.NODE_ENV === 'development',
        send_page_view: true,
        cookie_flags: 'SameSite=None;Secure',
        anonymize_ip: true,
        ...options,
      };

      // Cargar Google Analytics
      this.loadGoogleAnalytics(measurementId, defaultOptions);

      // Configurar eventos personalizados
      this.setupCustomEvents();

      // Configurar objetivos
      this.setupGoals();

      // Configurar ecommerce
      this.setupEcommerce();

      this.isInitialized = true;
      console.log('✅ Google Analytics inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando Google Analytics:', error);
    }
  }

  // Cargar Google Analytics
  loadGoogleAnalytics(measurementId, options) {
    // Cargar script de Google Analytics
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Configurar gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', measurementId, options);

    this.gtag = window.gtag;
    this.measurementId = measurementId;
  }

  // Configurar eventos personalizados
  setupCustomEvents() {
    // Eventos de autenticación
    this.customEvents.set('user_signup', {
      category: 'Authentication',
      action: 'Sign Up',
      label: 'User Registration',
    });

    this.customEvents.set('user_login', {
      category: 'Authentication',
      action: 'Login',
      label: 'User Login',
    });

    this.customEvents.set('user_logout', {
      category: 'Authentication',
      action: 'Logout',
      label: 'User Logout',
    });

    // Eventos de eventos
    this.customEvents.set('event_view', {
      category: 'Events',
      action: 'View',
      label: 'Event Details',
    });

    this.customEvents.set('event_create', {
      category: 'Events',
      action: 'Create',
      label: 'Event Creation',
    });

    this.customEvents.set('event_join', {
      category: 'Events',
      action: 'Join',
      label: 'Event Participation',
    });

    this.customEvents.set('event_leave', {
      category: 'Events',
      action: 'Leave',
      label: 'Event Departure',
    });

    this.customEvents.set('event_share', {
      category: 'Events',
      action: 'Share',
      label: 'Event Sharing',
    });

    // Eventos de tribus
    this.customEvents.set('tribe_view', {
      category: 'Tribes',
      action: 'View',
      label: 'Tribe Details',
    });

    this.customEvents.set('tribe_create', {
      category: 'Tribes',
      action: 'Create',
      label: 'Tribe Creation',
    });

    this.customEvents.set('tribe_join', {
      category: 'Tribes',
      action: 'Join',
      label: 'Tribe Membership',
    });

    this.customEvents.set('tribe_leave', {
      category: 'Tribes',
      action: 'Leave',
      label: 'Tribe Departure',
    });

    // Eventos de chat
    this.customEvents.set('chat_message', {
      category: 'Chat',
      action: 'Send Message',
      label: 'Message Sent',
    });

    this.customEvents.set('chat_create', {
      category: 'Chat',
      action: 'Create Chat',
      label: 'Chat Creation',
    });

    this.customEvents.set('chat_join', {
      category: 'Chat',
      action: 'Join Chat',
      label: 'Chat Participation',
    });

    // Eventos de búsqueda
    this.customEvents.set('search_perform', {
      category: 'Search',
      action: 'Search',
      label: 'Search Query',
    });

    this.customEvents.set('search_filter', {
      category: 'Search',
      action: 'Filter',
      label: 'Search Filter',
    });

    // Eventos de ubicación
    this.customEvents.set('location_permission', {
      category: 'Location',
      action: 'Permission Request',
      label: 'Location Access',
    });

    this.customEvents.set('location_update', {
      category: 'Location',
      action: 'Update',
      label: 'Location Change',
    });

    // Eventos de notificaciones
    this.customEvents.set('notification_permission', {
      category: 'Notifications',
      action: 'Permission Request',
      label: 'Notification Access',
    });

    this.customEvents.set('notification_received', {
      category: 'Notifications',
      action: 'Receive',
      label: 'Notification Display',
    });

    this.customEvents.set('notification_click', {
      category: 'Notifications',
      action: 'Click',
      label: 'Notification Interaction',
    });

    // Eventos de PWA
    this.customEvents.set('pwa_install', {
      category: 'PWA',
      action: 'Install',
      label: 'App Installation',
    });

    this.customEvents.set('pwa_update', {
      category: 'PWA',
      action: 'Update',
      label: 'App Update',
    });

    this.customEvents.set('offline_usage', {
      category: 'PWA',
      action: 'Offline Usage',
      label: 'Offline Access',
    });

    // Eventos de rendimiento
    this.customEvents.set('page_load_time', {
      category: 'Performance',
      action: 'Page Load',
      label: 'Load Time',
    });

    this.customEvents.set('api_response_time', {
      category: 'Performance',
      action: 'API Response',
      label: 'Response Time',
    });

    // Eventos de errores
    this.customEvents.set('error_occurred', {
      category: 'Errors',
      action: 'Error',
      label: 'Error Type',
    });

    this.customEvents.set('api_error', {
      category: 'Errors',
      action: 'API Error',
      label: 'API Error Type',
    });
  }

  // Configurar objetivos
  setupGoals() {
    // Objetivos de conversión
    this.goals.set('user_registration', {
      name: 'User Registration',
      type: 'conversion',
      value: 1,
    });

    this.goals.set('event_creation', {
      name: 'Event Creation',
      type: 'conversion',
      value: 5,
    });

    this.goals.set('tribe_creation', {
      name: 'Tribe Creation',
      type: 'conversion',
      value: 3,
    });

    this.goals.set('event_participation', {
      name: 'Event Participation',
      type: 'conversion',
      value: 2,
    });

    // Objetivos de engagement
    this.goals.set('daily_active_user', {
      name: 'Daily Active User',
      type: 'engagement',
      value: 1,
    });

    this.goals.set('weekly_active_user', {
      name: 'Weekly Active User',
      type: 'engagement',
      value: 1,
    });

    this.goals.set('monthly_active_user', {
      name: 'Monthly Active User',
      type: 'engagement',
      value: 1,
    });

    // Objetivos de retención
    this.goals.set('user_retention_7d', {
      name: '7-Day User Retention',
      type: 'retention',
      value: 1,
    });

    this.goals.set('user_retention_30d', {
      name: '30-Day User Retention',
      type: 'retention',
      value: 1,
    });
  }

  // Configurar ecommerce
  setupEcommerce() {
    // Configurar ecommerce si está disponible
    if (this.gtag) {
      this.gtag('config', this.measurementId, {
        ecommerce: {
          currency: 'USD',
          enhanced_conversions: true,
        },
      });
    }
  }

  // Trackear vista de página
  trackPageView(page, title = null, customParams = {}) {
    if (!this.gtag) return;

    const pageData = {
      page_title: title || document.title,
      page_location: window.location.href,
      page_referrer: document.referrer,
      timestamp: new Date().toISOString(),
      ...customParams,
    };

    // Trackear con Google Analytics
    this.gtag('event', 'page_view', pageData);

    // Guardar para análisis local
    this.pageViews.push({
      page,
      ...pageData,
      timestamp: Date.now(),
    });

    // Limpiar vistas antiguas (mantener solo las últimas 100)
    if (this.pageViews.length > 100) {
      this.pageViews = this.pageViews.slice(-100);
    }

    console.log('📊 Page view tracked:', pageData);
  }

  // Trackear evento personalizado
  trackEvent(eventName, parameters = {}) {
    if (!this.gtag) return;

    const eventConfig = this.customEvents.get(eventName);
    if (!eventConfig) {
      console.warn(`Evento no configurado: ${eventName}`);
      return;
    }

    const eventData = {
      event_category: eventConfig.category,
      event_action: eventConfig.action,
      event_label: eventConfig.label,
      event_value: parameters.value || 1,
      custom_parameters: parameters,
      timestamp: new Date().toISOString(),
      user_id: this.userId,
      session_id: this.sessionId,
    };

    // Trackear con Google Analytics
    this.gtag('event', eventName, eventData);

    // Guardar para análisis local
    this.events.push({
      name: eventName,
      ...eventData,
      timestamp: Date.now(),
    });

    // Limpiar eventos antiguos (mantener solo los últimos 1000)
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }

    console.log('📊 Event tracked:', eventData);
  }

  // Trackear objetivo
  trackGoal(goalName, value = null) {
    const goal = this.goals.get(goalName);
    if (!goal) {
      console.warn(`Objetivo no configurado: ${goalName}`);
      return;
    }

    const goalValue = value || goal.value;

    this.trackEvent('goal_completion', {
      goal_name: goalName,
      goal_type: goal.type,
      goal_value: goalValue,
      category: 'Goals',
      action: 'Complete',
      label: goal.name,
    });

    console.log('🎯 Goal tracked:', { goalName, value: goalValue });
  }

  // Trackear ecommerce
  trackEcommerce(action, data) {
    if (!this.gtag) return;

    switch (action) {
      case 'view_item':
        this.gtag('event', 'view_item', {
          currency: 'USD',
          value: data.value,
          items: [data.item],
        });
        break;

      case 'add_to_cart':
        this.gtag('event', 'add_to_cart', {
          currency: 'USD',
          value: data.value,
          items: [data.item],
        });
        break;

      case 'begin_checkout':
        this.gtag('event', 'begin_checkout', {
          currency: 'USD',
          value: data.value,
          items: data.items,
        });
        break;

      case 'purchase':
        this.gtag('event', 'purchase', {
          transaction_id: data.transaction_id,
          value: data.value,
          tax: data.tax,
          shipping: data.shipping,
          currency: 'USD',
          items: data.items,
        });
        break;

      default:
        console.warn(`Acción de ecommerce no soportada: ${action}`);
    }

    console.log('🛒 Ecommerce tracked:', { action, data });
  }

  // Trackear excepción
  trackException(description, fatal = false) {
    if (!this.gtag) return;

    this.gtag('event', 'exception', {
      description,
      fatal,
    });

    this.trackEvent('error_occurred', {
      error_description: description,
      error_fatal: fatal,
      error_type: 'exception',
    });

    console.log('❌ Exception tracked:', { description, fatal });
  }

  // Trackear tiempo de carga
  trackPageLoadTime(loadTime) {
    if (!this.gtag) return;

    this.gtag('event', 'timing_complete', {
      name: 'load',
      value: loadTime,
    });

    this.trackEvent('page_load_time', {
      load_time: loadTime,
      page_url: window.location.href,
    });

    console.log('⏱️ Page load time tracked:', loadTime);
  }

  // Trackear tiempo de respuesta de API
  trackApiResponseTime(endpoint, responseTime, status) {
    this.trackEvent('api_response_time', {
      endpoint,
      response_time: responseTime,
      status,
      success: status >= 200 && status < 300,
    });

    console.log('📡 API response time tracked:', {
      endpoint,
      responseTime,
      status,
    });
  }

  // Trackear búsqueda
  trackSearch(query, resultsCount, filters = {}) {
    this.trackEvent('search_perform', {
      search_term: query,
      results_count: resultsCount,
      search_filters: filters,
      page_url: window.location.href,
    });

    console.log('🔍 Search tracked:', { query, resultsCount, filters });
  }

  // Trackear filtros de búsqueda
  trackSearchFilter(filterType, filterValue) {
    this.trackEvent('search_filter', {
      filter_type: filterType,
      filter_value: filterValue,
      page_url: window.location.href,
    });

    console.log('🔍 Search filter tracked:', { filterType, filterValue });
  }

  // Trackear interacción con mapa
  trackMapInteraction(action, data = {}) {
    this.trackEvent('map_interaction', {
      action,
      map_data: data,
      page_url: window.location.href,
    });

    console.log('🗺️ Map interaction tracked:', { action, data });
  }

  // Trackear interacción con notificaciones
  trackNotificationInteraction(action, notificationType, data = {}) {
    this.trackEvent('notification_interaction', {
      action,
      notification_type: notificationType,
      notification_data: data,
    });

    console.log('🔔 Notification interaction tracked:', {
      action,
      notificationType,
      data,
    });
  }

  // Trackear uso offline
  trackOfflineUsage(feature, data = {}) {
    this.trackEvent('offline_usage', {
      feature,
      offline_data: data,
      timestamp: new Date().toISOString(),
    });

    console.log('📱 Offline usage tracked:', { feature, data });
  }

  // Trackear instalación de PWA
  trackPWAInstall() {
    this.trackEvent('pwa_install', {
      install_timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      platform: navigator.platform,
    });

    console.log('📱 PWA install tracked');
  }

  // Trackear actualización de PWA
  trackPWAUpdate() {
    this.trackEvent('pwa_update', {
      update_timestamp: new Date().toISOString(),
      previous_version: this.getPreviousVersion(),
      current_version: this.getCurrentVersion(),
    });

    console.log('📱 PWA update tracked');
  }

  // Configurar usuario
  setUserId(userId) {
    this.userId = userId;

    if (this.gtag) {
      this.gtag('config', this.measurementId, {
        user_id: userId,
      });
    }

    console.log('👤 User ID set:', userId);
  }

  // Configurar sesión
  setSessionId(sessionId) {
    this.sessionId = sessionId;
    console.log('🆔 Session ID set:', sessionId);
  }

  // Obtener métricas
  getMetrics() {
    return {
      pageViews: this.pageViews.length,
      events: this.events.length,
      goals: this.goals.size,
      ecommerce: {
        items: this.ecommerce.items.length,
        transactions: this.ecommerce.transactions.length,
      },
    };
  }

  // Obtener análisis de eventos
  getEventAnalytics() {
    const eventCounts = {};
    const eventCategories = {};
    const eventTimeline = {};

    this.events.forEach(event => {
      // Contar eventos por nombre
      eventCounts[event.name] = (eventCounts[event.name] || 0) + 1;

      // Contar eventos por categoría
      const category = event.event_category;
      eventCategories[category] = (eventCategories[category] || 0) + 1;

      // Agrupar por día
      const date = new Date(event.timestamp).toDateString();
      if (!eventTimeline[date]) {
        eventTimeline[date] = [];
      }
      eventTimeline[date].push(event);
    });

    return {
      eventCounts,
      eventCategories,
      eventTimeline,
      totalEvents: this.events.length,
    };
  }

  // Obtener análisis de páginas
  getPageAnalytics() {
    const pageCounts = {};
    const pageTimeline = {};

    this.pageViews.forEach(pageView => {
      // Contar vistas por página
      pageCounts[pageView.page] = (pageCounts[pageView.page] || 0) + 1;

      // Agrupar por día
      const date = new Date(pageView.timestamp).toDateString();
      if (!pageTimeline[date]) {
        pageTimeline[date] = [];
      }
      pageTimeline[date].push(pageView);
    });

    return {
      pageCounts,
      pageTimeline,
      totalPageViews: this.pageViews.length,
    };
  }

  // Exportar datos
  exportData() {
    return {
      metrics: this.getMetrics(),
      eventAnalytics: this.getEventAnalytics(),
      pageAnalytics: this.getPageAnalytics(),
      timestamp: new Date().toISOString(),
    };
  }

  // Limpiar datos
  clearData() {
    this.pageViews = [];
    this.events = [];
    this.ecommerce.items = [];
    this.ecommerce.transactions = [];

    console.log('🧹 Analytics data cleared');
  }

  // Obtener versión anterior (simulado)
  getPreviousVersion() {
    return localStorage.getItem('pwa_previous_version') || '1.0.0';
  }

  // Obtener versión actual (simulado)
  getCurrentVersion() {
    return '1.0.0';
  }

  // Limpiar recursos
  cleanup() {
    this.clearData();
    this.customEvents.clear();
    this.goals.clear();
    this.isInitialized = false;
    this.userId = null;
    this.sessionId = null;

    console.log('🧹 Analytics service cleaned up');
  }
}

// Crear instancia singleton
const analyticsService = new AnalyticsService();

export default analyticsService;

// Hook de React para usar analytics
export const useAnalytics = () => {
  useEffect(() => {
    // Inicializar analytics cuando el componente se monta
    if (!analyticsService.isInitialized) {
      const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
      if (measurementId) {
        analyticsService.initialize(measurementId);
      }
    }

    // Cleanup cuando el componente se desmonta
    return () => {
      // No limpiar analytics aquí, solo cuando sea necesario
    };
  }, []);

  return analyticsService;
};
