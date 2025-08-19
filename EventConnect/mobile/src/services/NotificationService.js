import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../hooks/useAuth';

// Configurar comportamiento de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Verificar si el dispositivo soporta notificaciones
      if (!Device.isDevice) {
        console.log('Las notificaciones push solo funcionan en dispositivos físicos');
        return false;
      }

      // Solicitar permisos
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permisos de notificación denegados');
        return false;
      }

      // Obtener token de Expo
      this.expoPushToken = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PROJECT_ID,
      });

      // Guardar token en storage
      await this.savePushToken(this.expoPushToken.data);

      // Configurar listeners
      this.setupNotificationListeners();

      // Configurar categorías de notificaciones
      await this.setupNotificationCategories();

      this.isInitialized = true;
      console.log('Servicio de notificaciones inicializado');
      return true;
    } catch (error) {
      console.error('Error inicializando notificaciones:', error);
      return false;
    }
  }

  async setupNotificationCategories() {
    try {
      await Notifications.setNotificationCategoryAsync('event', [
        {
          identifier: 'join',
          buttonTitle: 'Unirse',
          options: {
            isDestructive: false,
            isAuthenticationRequired: false,
          },
        },
        {
          identifier: 'view',
          buttonTitle: 'Ver',
          options: {
            isDestructive: false,
            isAuthenticationRequired: false,
          },
        },
        {
          identifier: 'dismiss',
          buttonTitle: 'Descartar',
          options: {
            isDestructive: true,
            isAuthenticationRequired: false,
          },
        },
      ]);

      await Notifications.setNotificationCategoryAsync('tribe', [
        {
          identifier: 'join',
          buttonTitle: 'Unirse',
          options: {
            isDestructive: false,
            isAuthenticationRequired: false,
          },
        },
        {
          identifier: 'view',
          buttonTitle: 'Ver',
          options: {
            isDestructive: false,
            isAuthenticationRequired: false,
          },
        },
      ]);

      await Notifications.setNotificationCategoryAsync('chat', [
        {
          identifier: 'reply',
          buttonTitle: 'Responder',
          options: {
            isDestructive: false,
            isAuthenticationRequired: true,
          },
        },
        {
          identifier: 'view',
          buttonTitle: 'Ver Chat',
          options: {
            isDestructive: false,
            isAuthenticationRequired: false,
          },
        },
      ]);

      await Notifications.setNotificationCategoryAsync('reminder', [
        {
          identifier: 'snooze',
          buttonTitle: 'Posponer',
          options: {
            isDestructive: false,
            isAuthenticationRequired: false,
          },
        },
        {
          identifier: 'dismiss',
          buttonTitle: 'Descartar',
          options: {
            isDestructive: true,
            isAuthenticationRequired: false,
          },
        },
      ]);
    } catch (error) {
      console.error('Error configurando categorías de notificaciones:', error);
    }
  }

  setupNotificationListeners() {
    // Listener para cuando llega una notificación
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificación recibida:', notification);
      this.handleNotificationReceived(notification);
    });

    // Listener para cuando el usuario interactúa con la notificación
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Respuesta a notificación:', response);
      this.handleNotificationResponse(response);
    });
  }

  async handleNotificationReceived(notification) {
    try {
      // Guardar notificación en storage
      await this.saveNotification(notification);

      // Actualizar badge count
      await this.updateBadgeCount();

      // Emitir evento personalizado si es necesario
      // EventEmitter.emit('notificationReceived', notification);
    } catch (error) {
      console.error('Error manejando notificación recibida:', error);
    }
  }

  async handleNotificationResponse(response) {
    try {
      const { actionIdentifier, notification } = response;
      const data = notification.request.content.data;

      // Manejar diferentes acciones
      switch (actionIdentifier) {
        case 'join':
          await this.handleJoinAction(data);
          break;
        case 'view':
          await this.handleViewAction(data);
          break;
        case 'reply':
          await this.handleReplyAction(data);
          break;
        case 'snooze':
          await this.handleSnoozeAction(data);
          break;
        case 'dismiss':
          await this.handleDismissAction(data);
          break;
        default:
          // Acción por defecto (tocar la notificación)
          await this.handleDefaultAction(data);
          break;
      }

      // Marcar notificación como leída
      await this.markNotificationAsRead(notification.request.identifier);
    } catch (error) {
      console.error('Error manejando respuesta de notificación:', error);
    }
  }

  async handleJoinAction(data) {
    // Implementar lógica para unirse a evento/triba
    console.log('Unirse a:', data);
    // Navigation.navigate('EventDetails', { eventId: data.eventId });
  }

  async handleViewAction(data) {
    // Implementar lógica para ver detalles
    console.log('Ver detalles de:', data);
    // Navigation.navigate('EventDetails', { eventId: data.eventId });
  }

  async handleReplyAction(data) {
    // Implementar lógica para responder en chat
    console.log('Responder en chat:', data);
    // Navigation.navigate('Chat', { chatId: data.chatId });
  }

  async handleSnoozeAction(data) {
    // Implementar lógica para posponer recordatorio
    console.log('Posponer recordatorio:', data);
    await this.scheduleReminder(data, 15); // Posponer 15 minutos
  }

  async handleDismissAction(data) {
    // Implementar lógica para descartar notificación
    console.log('Descartar notificación:', data);
    await this.removeNotification(data.notificationId);
  }

  async handleDefaultAction(data) {
    // Acción por defecto al tocar la notificación
    console.log('Acción por defecto para:', data);
    
    switch (data.type) {
      case 'event':
        // Navigation.navigate('EventDetails', { eventId: data.eventId });
        break;
      case 'tribe':
        // Navigation.navigate('TribeDetails', { tribeId: data.tribeId });
        break;
      case 'chat':
        // Navigation.navigate('Chat', { chatId: data.chatId });
        break;
      case 'reminder':
        // Navigation.navigate('EventDetails', { eventId: data.eventId });
        break;
      default:
        // Navigation.navigate('Home');
        break;
    }
  }

  // Enviar notificación local
  async scheduleLocalNotification(title, body, data = {}, options = {}) {
    try {
      const defaultOptions = {
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        vibrate: [0, 250, 250, 250],
        ...options
      };

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: defaultOptions.sound,
          priority: defaultOptions.priority,
          vibrate: defaultOptions.vibrate,
        },
        trigger: options.trigger || null, // null para notificación inmediata
      });

      console.log('Notificación local programada:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error programando notificación local:', error);
      throw error;
    }
  }

  // Programar recordatorio
  async scheduleReminder(data, minutes = 15) {
    try {
      const trigger = new Date(Date.now() + minutes * 60 * 1000);
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Recordatorio',
          body: `No olvides: ${data.title}`,
          data: { ...data, type: 'reminder' },
          categoryIdentifier: 'reminder',
        },
        trigger: {
          date: trigger,
        },
      });

      console.log('Recordatorio programado:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error programando recordatorio:', error);
      throw error;
    }
  }

  // Programar notificación para evento
  async scheduleEventReminder(event, minutesBefore = 60) {
    try {
      const eventTime = new Date(event.startDate);
      const reminderTime = new Date(eventTime.getTime() - minutesBefore * 60 * 1000);
      
      // Solo programar si el tiempo de recordatorio está en el futuro
      if (reminderTime > new Date()) {
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: `¡${event.title} comienza en ${minutesBefore} minutos!`,
            body: `Ubicación: ${event.location?.address || 'Ubicación por confirmar'}`,
            data: {
              type: 'event',
              eventId: event._id,
              title: event.title,
              startDate: event.startDate,
            },
            categoryIdentifier: 'event',
          },
          trigger: {
            date: reminderTime,
          },
        });

        console.log('Recordatorio de evento programado:', notificationId);
        return notificationId;
      }
    } catch (error) {
      console.error('Error programando recordatorio de evento:', error);
      throw error;
    }
  }

  // Cancelar notificación
  async cancelNotification(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('Notificación cancelada:', notificationId);
    } catch (error) {
      console.error('Error cancelando notificación:', error);
      throw error;
    }
  }

  // Cancelar todas las notificaciones
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('Todas las notificaciones canceladas');
    } catch (error) {
      console.error('Error cancelando todas las notificaciones:', error);
      throw error;
    }
  }

  // Obtener notificaciones programadas
  async getScheduledNotifications() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      return notifications;
    } catch (error) {
      console.error('Error obteniendo notificaciones programadas:', error);
      return [];
    }
  }

  // Obtener notificaciones pendientes
  async getPendingNotifications() {
    try {
      const notifications = await Notifications.getPendingNotificationRequestsAsync();
      return notifications;
    } catch (error) {
      console.error('Error obteniendo notificaciones pendientes:', error);
      return [];
    }
  }

  // Actualizar badge count
  async updateBadgeCount() {
    try {
      const unreadCount = await this.getUnreadNotificationCount();
      await Notifications.setBadgeCountAsync(unreadCount);
    } catch (error) {
      console.error('Error actualizando badge count:', error);
    }
  }

  // Guardar notificación en storage
  async saveNotification(notification) {
    try {
      const notifications = await this.getStoredNotifications();
      const newNotification = {
        id: notification.request.identifier,
        title: notification.request.content.title,
        body: notification.request.content.body,
        data: notification.request.content.data,
        timestamp: Date.now(),
        read: false,
      };

      notifications.unshift(newNotification);
      
      // Mantener solo las últimas 100 notificaciones
      if (notifications.length > 100) {
        notifications.splice(100);
      }

      await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error guardando notificación:', error);
    }
  }

  // Obtener notificaciones guardadas
  async getStoredNotifications() {
    try {
      const stored = await AsyncStorage.getItem('notifications');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error obteniendo notificaciones guardadas:', error);
      return [];
    }
  }

  // Marcar notificación como leída
  async markNotificationAsRead(notificationId) {
    try {
      const notifications = await this.getStoredNotifications();
      const updatedNotifications = notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      );

      await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      await this.updateBadgeCount();
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
    }
  }

  // Obtener conteo de notificaciones no leídas
  async getUnreadNotificationCount() {
    try {
      const notifications = await this.getStoredNotifications();
      return notifications.filter(notification => !notification.read).length;
    } catch (error) {
      console.error('Error obteniendo conteo de notificaciones no leídas:', error);
      return 0;
    }
  }

  // Limpiar notificaciones antiguas
  async clearOldNotifications(daysOld = 30) {
    try {
      const notifications = await this.getStoredNotifications();
      const cutoffDate = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
      
      const filteredNotifications = notifications.filter(
        notification => notification.timestamp > cutoffDate
      );

      await AsyncStorage.setItem('notifications', JSON.stringify(filteredNotifications));
      console.log(`Notificaciones más antiguas de ${daysOld} días eliminadas`);
    } catch (error) {
      console.error('Error limpiando notificaciones antiguas:', error);
    }
  }

  // Guardar token de push
  async savePushToken(token) {
    try {
      await AsyncStorage.setItem('expo_push_token', token);
      console.log('Token de push guardado:', token);
    } catch (error) {
      console.error('Error guardando token de push:', error);
    }
  }

  // Obtener token de push guardado
  async getPushToken() {
    try {
      return await AsyncStorage.getItem('expo_push_token');
    } catch (error) {
      console.error('Error obteniendo token de push:', error);
      return null;
    }
  }

  // Enviar token al servidor
  async sendTokenToServer(token, userId) {
    try {
      // Implementar lógica para enviar token al backend
      console.log('Token enviado al servidor:', { token, userId });
    } catch (error) {
      console.error('Error enviando token al servidor:', error);
    }
  }

  // Configurar notificaciones para diferentes tipos de eventos
  async configureEventNotifications(event) {
    try {
      // Recordatorio 1 hora antes
      await this.scheduleEventReminder(event, 60);
      
      // Recordatorio 15 minutos antes
      await this.scheduleEventReminder(event, 15);
      
      // Notificación cuando el evento comienza
      const eventStartTime = new Date(event.startDate);
      if (eventStartTime > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `¡${event.title} está comenzando!`,
            body: '¡Es hora de ir al evento!',
            data: {
              type: 'event',
              eventId: event._id,
              title: event.title,
            },
            categoryIdentifier: 'event',
          },
          trigger: {
            date: eventStartTime,
          },
        });
      }
    } catch (error) {
      console.error('Error configurando notificaciones de evento:', error);
    }
  }

  // Limpiar recursos
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  // Obtener estado del servicio
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      hasPermission: this.isInitialized,
      pushToken: this.expoPushToken?.data,
      platform: Platform.OS,
    };
  }
}

// Crear instancia singleton
const notificationService = new NotificationService();

export default notificationService;