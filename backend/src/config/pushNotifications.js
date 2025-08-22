const admin = require('firebase-admin');

/**
 * Push Notifications Configuration and Management Service
 */
class PushNotificationService {
  /**
   *
   */
  constructor() {
    this.initialized = false;
    this.init();
  }

  /**
   * Initialize Firebase Admin SDK
   */
  init() {
    try {
      if (this.initialized) {
        return;
      }

      // Check if Firebase credentials are available
      if (
        !process.env.FIREBASE_PROJECT_ID ||
        !process.env.FIREBASE_PRIVATE_KEY ||
        !process.env.FIREBASE_CLIENT_EMAIL
      ) {
        console.warn(
          '⚠️ Firebase credentials not configured. Push notifications will be disabled.'
        );
        return;
      }

      // Parse private key (remove newlines and quotes)
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

      // Initialize Firebase Admin
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });

      this.initialized = true;
      console.log('✅ Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Firebase Admin SDK:', error);
      this.initialized = false;
    }
  }

  /**
   * Send push notification to a single device
   * @param {string} token - FCM token
   * @param {Object} notification - Notification data
   * @param {Object} data - Additional data
   * @returns {Promise<Object>} Send result
   */
  async sendToDevice(token, notification, data = {}) {
    try {
      if (!this.initialized) {
        throw new Error('Firebase Admin SDK not initialized');
      }

      if (!token) {
        throw new Error('FCM token is required');
      }

      const message = {
        token,
        notification: {
          title: notification.title || 'EventConnect',
          body: notification.body || 'You have a new notification',
          ...notification,
        },
        data: {
          ...data,
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channel_id: 'eventconnect_channel',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const result = await admin.messaging().send(message);

      return {
        success: true,
        messageId: result,
        token,
      };
    } catch (error) {
      console.error('Error sending push notification to device:', error);
      return {
        success: false,
        error: error.message,
        token,
      };
    }
  }

  /**
   * Send push notification to multiple devices
   * @param {Array<string>} tokens - Array of FCM tokens
   * @param {Object} notification - Notification data
   * @param {Object} data - Additional data
   * @returns {Promise<Object>} Send result
   */
  async sendToMultipleDevices(tokens, notification, data = {}) {
    try {
      if (!this.initialized) {
        throw new Error('Firebase Admin SDK not initialized');
      }

      if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
        throw new Error('Valid array of FCM tokens is required');
      }

      // Limit batch size to 500 (Firebase limit)
      const batchSize = 500;
      const results = {
        successCount: 0,
        failureCount: 0,
        successTokens: [],
        failedTokens: [],
        errors: [],
      };

      // Process tokens in batches
      for (let i = 0; i < tokens.length; i += batchSize) {
        const batch = tokens.slice(i, i + batchSize);

        try {
          const message = {
            tokens: batch,
            notification: {
              title: notification.title || 'EventConnect',
              body: notification.body || 'You have a new notification',
              ...notification,
            },
            data: {
              ...data,
              click_action: 'FLUTTER_NOTIFICATION_CLICK',
            },
            android: {
              priority: 'high',
              notification: {
                sound: 'default',
                channel_id: 'eventconnect_channel',
              },
            },
            apns: {
              payload: {
                aps: {
                  sound: 'default',
                  badge: 1,
                },
              },
            },
          };

          const result = await admin.messaging().sendMulticast(message);

          // Process results
          result.responses.forEach((response, index) => {
            const token = batch[index];

            if (response.success) {
              results.successCount++;
              results.successTokens.push(token);
            } else {
              results.failureCount++;
              results.failedTokens.push(token);
              results.errors.push({
                token,
                error: response.error?.message || 'Unknown error',
              });
            }
          });
        } catch (batchError) {
          console.error('Error sending batch notification:', batchError);
          results.failureCount += batch.length;
          results.failedTokens.push(...batch);
          results.errors.push({
            tokens: batch,
            error: batchError.message,
          });
        }
      }

      return results;
    } catch (error) {
      console.error(
        'Error sending push notification to multiple devices:',
        error
      );
      return {
        success: false,
        error: error.message,
        successCount: 0,
        failureCount: tokens.length,
        successTokens: [],
        failedTokens: tokens,
        errors: [{ tokens, error: error.message }],
      };
    }
  }

  /**
   * Send push notification to a topic
   * @param {string} topic - Topic name
   * @param {Object} notification - Notification data
   * @param {Object} data - Additional data
   * @returns {Promise<Object>} Send result
   */
  async sendToTopic(topic, notification, data = {}) {
    try {
      if (!this.initialized) {
        throw new Error('Firebase Admin SDK not initialized');
      }

      if (!topic) {
        throw new Error('Topic is required');
      }

      const message = {
        topic,
        notification: {
          title: notification.title || 'EventConnect',
          body: notification.body || 'You have a new notification',
          ...notification,
        },
        data: {
          ...data,
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channel_id: 'eventconnect_channel',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const result = await admin.messaging().send(message);

      return {
        success: true,
        messageId: result,
        topic,
      };
    } catch (error) {
      console.error('Error sending push notification to topic:', error);
      return {
        success: false,
        error: error.message,
        topic,
      };
    }
  }

  /**
   * Subscribe device to a topic
   * @param {string|Array<string>} tokens - FCM token(s)
   * @param {string} topic - Topic name
   * @returns {Promise<Object>} Subscription result
   */
  async subscribeToTopic(tokens, topic) {
    try {
      if (!this.initialized) {
        throw new Error('Firebase Admin SDK not initialized');
      }

      if (!tokens || !topic) {
        throw new Error('Tokens and topic are required');
      }

      const tokenArray = Array.isArray(tokens) ? tokens : [tokens];
      const result = await admin
        .messaging()
        .subscribeToTopic(tokenArray, topic);

      return {
        success: true,
        successCount: result.successCount,
        failureCount: result.failureCount,
        errors: result.errors,
        topic,
      };
    } catch (error) {
      console.error('Error subscribing to topic:', error);
      return {
        success: false,
        error: error.message,
        topic,
      };
    }
  }

  /**
   * Unsubscribe device from a topic
   * @param {string|Array<string>} tokens - FCM token(s)
   * @param {string} topic - Topic name
   * @returns {Promise<Object>} Unsubscription result
   */
  async unsubscribeFromTopic(tokens, topic) {
    try {
      if (!this.initialized) {
        throw new Error('Firebase Admin SDK not initialized');
      }

      if (!tokens || !topic) {
        throw new Error('Tokens and topic are required');
      }

      const tokenArray = Array.isArray(tokens) ? tokens : [tokens];
      const result = await admin
        .messaging()
        .unsubscribeFromTopic(tokenArray, topic);

      return {
        success: true,
        successCount: result.successCount,
        failureCount: result.failureCount,
        errors: result.errors,
        topic,
      };
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
      return {
        success: false,
        error: error.message,
        topic,
      };
    }
  }

  /**
   * Send event notification
   * @param {string} eventId - Event ID
   * @param {string} type - Notification type
   * @param {Array<string>} tokens - Array of FCM tokens
   * @param {Object} eventData - Event data
   * @returns {Promise<Object>} Send result
   */
  async sendEventNotification(eventId, type, tokens, eventData = {}) {
    try {
      const notification = this.getEventNotificationContent(type, eventData);
      const data = {
        type: 'event',
        eventId,
        notificationType: type,
        ...eventData,
      };

      return await this.sendToMultipleDevices(tokens, notification, data);
    } catch (error) {
      console.error('Error sending event notification:', error);
      throw error;
    }
  }

  /**
   * Send tribe notification
   * @param {string} tribeId - Tribe ID
   * @param {string} type - Notification type
   * @param {Array<string>} tokens - Array of FCM tokens
   * @param {Object} tribeData - Tribe data
   * @returns {Promise<Object>} Send result
   */
  async sendTribeNotification(tribeId, type, tokens, tribeData = {}) {
    try {
      const notification = this.getTribeNotificationContent(type, tribeData);
      const data = {
        type: 'tribe',
        tribeId,
        notificationType: type,
        ...tribeData,
      };

      return await this.sendToMultipleDevices(tokens, notification, data);
    } catch (error) {
      console.error('Error sending tribe notification:', error);
      throw error;
    }
  }

  /**
   * Send social notification
   * @param {string} type - Notification type
   * @param {Array<string>} tokens - Array of FCM tokens
   * @param {Object} socialData - Social interaction data
   * @returns {Promise<Object>} Send result
   */
  async sendSocialNotification(type, tokens, socialData = {}) {
    try {
      const notification = this.getSocialNotificationContent(type, socialData);
      const data = {
        type: 'social',
        notificationType: type,
        ...socialData,
      };

      return await this.sendToMultipleDevices(tokens, notification, data);
    } catch (error) {
      console.error('Error sending social notification:', error);
      throw error;
    }
  }

  /**
   * Get event notification content
   * @param {string} type - Notification type
   * @param {Object} eventData - Event data
   * @returns {Object} Notification content
   */
  getEventNotificationContent(type, eventData) {
    const titles = {
      invite: 'Invitación a evento',
      update: 'Evento actualizado',
      reminder: 'Recordatorio de evento',
      cancellation: 'Evento cancelado',
      new_attendee: 'Nuevo asistente',
      event_starting: 'Evento comenzando',
    };

    const messages = {
      invite: `Has sido invitado a "${eventData.title || 'un evento'}"`,
      update: `El evento "${eventData.title || 'un evento'}" ha sido actualizado`,
      reminder: `Recordatorio: "${eventData.title || 'un evento'}" comienza pronto`,
      cancellation: `El evento "${eventData.title || 'un evento'}" ha sido cancelado`,
      new_attendee: `Nuevo asistente en "${eventData.title || 'un evento'}"`,
      event_starting: `"${eventData.title || 'Un evento'} está comenzando ahora`,
    };

    return {
      title: titles[type] || 'Notificación de evento',
      body: messages[type] || 'Tienes una nueva notificación de evento',
    };
  }

  /**
   * Get tribe notification content
   * @param {string} type - Notification type
   * @param {Object} tribeData - Tribe data
   * @returns {Object} Notification content
   */
  getTribeNotificationContent(type, tribeData) {
    const titles = {
      invite: 'Invitación a tribu',
      update: 'Tribu actualizada',
      new_member: 'Nuevo miembro',
      new_post: 'Nuevo post en la tribu',
      event_created: 'Nuevo evento en la tribu',
    };

    const messages = {
      invite: `Has sido invitado a unirte a "${tribeData.name || 'una tribu'}"`,
      update: `La tribu "${tribeData.name || 'una tribu'}" ha sido actualizada`,
      new_member: `Nuevo miembro en "${tribeData.name || 'una tribu'}"`,
      new_post: `Nuevo post en "${tribeData.name || 'una tribu'}"`,
      event_created: `Nuevo evento en "${tribeData.name || 'una tribu'}"`,
    };

    return {
      title: titles[type] || 'Notificación de tribu',
      body: messages[type] || 'Tienes una nueva notificación de tribu',
    };
  }

  /**
   * Get social notification content
   * @param {string} type - Notification type
   * @param {Object} socialData - Social interaction data
   * @returns {Object} Notification content
   */
  getSocialNotificationContent(type, socialData) {
    const titles = {
      follow: 'Nuevo seguidor',
      like: 'Nuevo like',
      comment: 'Nuevo comentario',
      mention: 'Mencionado en un post',
      friend_request: 'Solicitud de amistad',
      message: 'Nuevo mensaje',
    };

    const messages = {
      follow: `${socialData.senderName || 'Alguien'} comenzó a seguirte`,
      like: `${socialData.senderName || 'Alguien'} dio like a tu post`,
      comment: `${socialData.senderName || 'Alguien'} comentó en tu post`,
      mention: `${socialData.senderName || 'Alguien'} te mencionó en un post`,
      friend_request: `${socialData.senderName || 'Alguien'} te envió una solicitud de amistad`,
      message: `${socialData.senderName || 'Alguien'} te envió un mensaje`,
    };

    return {
      title: titles[type] || 'Notificación social',
      body: messages[type] || 'Tienes una nueva notificación social',
    };
  }

  /**
   * Check if service is initialized
   * @returns {boolean} True if initialized
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * Get service status
   * @returns {Object} Service status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID || null,
      hasCredentials: !!(
        process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL
      ),
    };
  }
}

// Create and export push notification service instance
const pushNotificationService = new PushNotificationService();

module.exports = {
  pushNotificationService,
  PushNotificationService,
};
