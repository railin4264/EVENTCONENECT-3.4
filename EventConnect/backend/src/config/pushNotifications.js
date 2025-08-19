const { redis } = require('./index');

class PushNotificationConfig {
  constructor() {
    this.expoConfig = {
      accessToken: process.env.EXPO_ACCESS_TOKEN,
      projectId: process.env.EXPO_PROJECT_ID,
      pushUrl: 'https://exp.host/--/api/v2/push/send'
    };

    this.fcmConfig = {
      serverKey: process.env.FCM_SERVER_KEY,
      projectId: process.env.FCM_PROJECT_ID
    };

    this.apnsConfig = {
      keyId: process.env.APNS_KEY_ID,
      teamId: process.env.APNS_TEAM_ID,
      bundleId: process.env.APNS_BUNDLE_ID,
      privateKey: process.env.APNS_PRIVATE_KEY
    };

    this.defaultSettings = {
      sound: 'default',
      priority: 'normal',
      badge: 1,
      ttl: 86400, // 24 horas
      expiration: null
    };

    this.platformSettings = {
      android: {
        channelId: 'default',
        priority: 'normal',
        sound: 'default',
        vibrate: [0, 250, 250, 250],
        icon: 'ic_notification',
        color: '#2196F3',
        sticky: false
      },
      ios: {
        sound: 'default',
        badge: 1,
        categoryId: 'default',
        threadId: null
      },
      web: {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'default',
        requireInteraction: false,
        silent: false
      }
    };
  }

  // Obtener configuración de Expo
  getExpoConfig() {
    return this.expoConfig;
  }

  // Obtener configuración de FCM
  getFCMConfig() {
    return this.fcmConfig;
  }

  // Obtener configuración de APNS
  getAPNSConfig() {
    return this.apnsConfig;
  }

  // Obtener configuración por defecto
  getDefaultSettings() {
    return this.defaultSettings;
  }

  // Obtener configuración por plataforma
  getPlatformSettings(platform) {
    return this.platformSettings[platform] || this.platformSettings.web;
  }

  // Verificar si Expo está configurado
  isExpoConfigured() {
    return !!(this.expoConfig.accessToken && this.expoConfig.projectId);
  }

  // Verificar si FCM está configurado
  isFCMConfigured() {
    return !!(this.fcmConfig.serverKey && this.fcmConfig.projectId);
  }

  // Verificar si APNS está configurado
  isAPNSConfigured() {
    return !!(this.apnsConfig.keyId && this.apnsConfig.teamId && this.apnsConfig.bundleId);
  }

  // Obtener configuración de notificaciones por tipo
  getNotificationTypeConfig(type) {
    const typeConfigs = {
      event_invite: {
        priority: 'high',
        sound: 'default',
        badge: 1,
        android: {
          channelId: 'events',
          priority: 'high',
          color: '#4CAF50'
        },
        ios: {
          categoryId: 'event_invite',
          sound: 'default'
        }
      },
      event_reminder: {
        priority: 'high',
        sound: 'default',
        badge: 1,
        android: {
          channelId: 'reminders',
          priority: 'high',
          color: '#FF9800'
        },
        ios: {
          categoryId: 'event_reminder',
          sound: 'default'
        }
      },
      new_message: {
        priority: 'normal',
        sound: 'default',
        badge: 1,
        android: {
          channelId: 'messages',
          priority: 'normal',
          color: '#2196F3'
        },
        ios: {
          categoryId: 'new_message',
          sound: 'default'
        }
      },
      mention: {
        priority: 'normal',
        sound: 'default',
        badge: 1,
        android: {
          channelId: 'social',
          priority: 'normal',
          color: '#9C27B0'
        },
        ios: {
          categoryId: 'mention',
          sound: 'default'
        }
      },
      like: {
        priority: 'low',
        sound: 'default',
        badge: 1,
        android: {
          channelId: 'social',
          priority: 'low',
          color: '#E91E63'
        },
        ios: {
          categoryId: 'like',
          sound: 'default'
        }
      },
      comment: {
        priority: 'normal',
        sound: 'default',
        badge: 1,
        android: {
          channelId: 'social',
          priority: 'normal',
          color: '#FF5722'
        },
        ios: {
          categoryId: 'comment',
          sound: 'default'
        }
      },
      follow: {
        priority: 'low',
        sound: 'default',
        badge: 1,
        android: {
          channelId: 'social',
          priority: 'low',
          color: '#00BCD4'
        },
        ios: {
          categoryId: 'follow',
          sound: 'default'
        }
      },
      system: {
        priority: 'normal',
        sound: 'default',
        badge: 1,
        android: {
          channelId: 'system',
          priority: 'normal',
          color: '#607D8B'
        },
        ios: {
          categoryId: 'system',
          sound: 'default'
        }
      },
      security: {
        priority: 'high',
        sound: 'default',
        badge: 1,
        android: {
          channelId: 'security',
          priority: 'high',
          color: '#F44336'
        },
        ios: {
          categoryId: 'security',
          sound: 'default'
        }
      },
      promotional: {
        priority: 'low',
        sound: 'default',
        badge: 0,
        android: {
          channelId: 'promotional',
          priority: 'low',
          color: '#795548'
        },
        ios: {
          categoryId: 'promotional',
          sound: 'default'
        }
      }
    };

    return typeConfigs[type] || this.defaultSettings;
  }

  // Obtener configuración de canales de Android
  getAndroidChannels() {
    return [
      {
        id: 'default',
        name: 'General',
        description: 'Notificaciones generales',
        importance: 3, // IMPORTANCE_DEFAULT
        sound: 'default',
        vibration: true,
        light: true,
        lightColor: '#2196F3'
      },
      {
        id: 'events',
        name: 'Eventos',
        description: 'Notificaciones relacionadas con eventos',
        importance: 4, // IMPORTANCE_HIGH
        sound: 'default',
        vibration: true,
        light: true,
        lightColor: '#4CAF50'
      },
      {
        id: 'reminders',
        name: 'Recordatorios',
        description: 'Recordatorios de eventos',
        importance: 4, // IMPORTANCE_HIGH
        sound: 'default',
        vibration: true,
        light: true,
        lightColor: '#FF9800'
      },
      {
        id: 'messages',
        name: 'Mensajes',
        description: 'Nuevos mensajes de chat',
        importance: 3, // IMPORTANCE_DEFAULT
        sound: 'default',
        vibration: true,
        light: true,
        lightColor: '#2196F3'
      },
      {
        id: 'social',
        name: 'Social',
        description: 'Actividad social (likes, comentarios, menciones)',
        importance: 2, // IMPORTANCE_LOW
        sound: 'default',
        vibration: false,
        light: false
      },
      {
        id: 'system',
        name: 'Sistema',
        description: 'Notificaciones del sistema',
        importance: 3, // IMPORTANCE_DEFAULT
        sound: 'default',
        vibration: false,
        light: false
      },
      {
        id: 'security',
        name: 'Seguridad',
        description: 'Notificaciones de seguridad',
        importance: 4, // IMPORTANCE_HIGH
        sound: 'default',
        vibration: true,
        light: true,
        lightColor: '#F44336'
      },
      {
        id: 'promotional',
        name: 'Promocional',
        description: 'Contenido promocional',
        importance: 1, // IMPORTANCE_MIN
        sound: 'default',
        vibration: false,
        light: false
      }
    ];
  }

  // Obtener configuración de categorías de iOS
  getIOSCategories() {
    return [
      {
        id: 'default',
        actions: [
          {
            id: 'view',
            title: 'Ver',
            options: ['foreground']
          }
        ]
      },
      {
        id: 'event_invite',
        actions: [
          {
            id: 'accept',
            title: 'Aceptar',
            options: ['foreground']
          },
          {
            id: 'decline',
            title: 'Rechazar',
            options: ['foreground']
          },
          {
            id: 'view',
            title: 'Ver',
            options: ['foreground']
          }
        ]
      },
      {
        id: 'event_reminder',
        actions: [
          {
            id: 'snooze',
            title: 'Posponer',
            options: ['foreground']
          },
          {
            id: 'view',
            title: 'Ver',
            options: ['foreground']
          }
        ]
      },
      {
        id: 'new_message',
        actions: [
          {
            id: 'reply',
            title: 'Responder',
            options: ['foreground', 'authenticationRequired']
          },
          {
            id: 'view',
            title: 'Ver',
            options: ['foreground']
          }
        ]
      },
      {
        id: 'mention',
        actions: [
          {
            id: 'reply',
            title: 'Responder',
            options: ['foreground']
          },
          {
            id: 'view',
            title: 'Ver',
            options: ['foreground']
          }
        ]
      },
      {
        id: 'like',
        actions: [
          {
            id: 'view',
            title: 'Ver',
            options: ['foreground']
          }
        ]
      },
      {
        id: 'comment',
        actions: [
          {
            id: 'reply',
            title: 'Responder',
            options: ['foreground']
          },
          {
            id: 'view',
            title: 'Ver',
            options: ['foreground']
          }
        ]
      },
      {
        id: 'follow',
        actions: [
          {
            id: 'follow_back',
            title: 'Seguir',
            options: ['foreground']
          },
          {
            id: 'view',
            title: 'Ver perfil',
            options: ['foreground']
          }
        ]
      },
      {
        id: 'system',
        actions: [
          {
            id: 'view',
            title: 'Ver',
            options: ['foreground']
          }
        ]
      },
      {
        id: 'security',
        actions: [
          {
            id: 'view',
            title: 'Ver',
            options: ['foreground']
          },
          {
            id: 'dismiss',
            title: 'Descartar',
            options: ['destructive']
          }
        ]
      },
      {
        id: 'promotional',
        actions: [
          {
            id: 'view',
            title: 'Ver',
            options: ['foreground']
          },
          {
            id: 'dismiss',
            title: 'Descartar',
            options: ['destructive']
          }
        ]
      }
    ];
  }

  // Obtener configuración de horarios silenciosos
  getQuietHoursConfig() {
    return {
      default: {
        enabled: false,
        start: '22:00',
        end: '08:00',
        timezone: 'UTC'
      },
      userConfigurable: true,
      allowedTypes: ['security', 'event_reminder']
    };
  }

  // Obtener configuración de retry
  getRetryConfig() {
    return {
      maxAttempts: 3,
      backoffMultiplier: 2,
      initialDelay: 1000, // 1 segundo
      maxDelay: 30000 // 30 segundos
    };
  }

  // Obtener configuración de rate limiting
  getRateLimitConfig() {
    return {
      maxNotificationsPerMinute: 60,
      maxNotificationsPerHour: 1000,
      maxNotificationsPerDay: 10000,
      burstLimit: 10
    };
  }

  // Obtener configuración de analytics
  getAnalyticsConfig() {
    return {
      enabled: true,
      trackDelivery: true,
      trackOpen: true,
      trackClick: true,
      trackDismiss: true,
      trackConversion: true,
      retentionWindow: 30 // días
    };
  }

  // Obtener configuración de personalización
  getPersonalizationConfig() {
    return {
      enabled: true,
      userSegments: true,
      behaviorTracking: true,
      a_bTesting: true,
      dynamicContent: true,
      smartScheduling: true
    };
  }

  // Obtener configuración de seguridad
  getSecurityConfig() {
    return {
      encryption: true,
      signatureVerification: true,
      tokenValidation: true,
      rateLimiting: true,
      contentFiltering: true,
      auditLogging: true
    };
  }
}

module.exports = new PushNotificationConfig();