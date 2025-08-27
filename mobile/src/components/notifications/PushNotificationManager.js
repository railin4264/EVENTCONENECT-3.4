import React, { useEffect, useState } from 'react';
import { Platform, Alert, Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Configuración de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Tipos de notificaciones
const NOTIFICATION_TYPES = {
  EVENT_REMINDER: 'event_reminder',
  EVENT_INVITATION: 'event_invitation',
  EVENT_UPDATE: 'event_update',
  TRIBE_INVITATION: 'tribe_invitation',
  NEW_MESSAGE: 'new_message',
  FRIEND_REQUEST: 'friend_request',
  EVENT_STARTING: 'event_starting',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  DAILY_DIGEST: 'daily_digest'
};

// Configuración de canales de notificación (Android)
const NOTIFICATION_CHANNELS = {
  EVENTS: {
    name: 'events',
    description: 'Notificaciones de eventos',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'event_sound.wav',
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF6B6B',
  },
  MESSAGES: {
    name: 'messages',
    description: 'Mensajes y chat',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'message_sound.wav',
    vibrationPattern: [0, 150, 150, 150],
    lightColor: '#4ECDC4',
  },
  SOCIAL: {
    name: 'social',
    description: 'Actividad social',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'social_sound.wav',
    vibrationPattern: [0, 100, 100, 100],
    lightColor: '#45B7D1',
  },
  SYSTEM: {
    name: 'system',
    description: 'Notificaciones del sistema',
    importance: Notifications.AndroidImportance.LOW,
    lightColor: '#96CEB4',
  }
};

class PushNotificationManager {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
    this.isInitialized = false;
  }

  // Inicializar el sistema de notificaciones
  async initialize() {
    try {
      if (this.isInitialized) return;

      // Verificar si es un dispositivo físico
      if (!Device.isDevice) {
        console.warn('Las notificaciones push solo funcionan en dispositivos físicos');
        return;
      }

      // Configurar canales de notificación en Android
      if (Platform.OS === 'android') {
        await this.setupAndroidChannels();
      }

      // Registrar token de push
      await this.registerForPushNotifications();

      // Configurar listeners
      this.setupNotificationListeners();

      // Solicitar permisos
      await this.requestPermissions();

      this.isInitialized = true;
      console.log('Push notifications initialized successfully');
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  }

  // Configurar canales de Android
  async setupAndroidChannels() {
    for (const [key, channel] of Object.entries(NOTIFICATION_CHANNELS)) {
      await Notifications.setNotificationChannelAsync(channel.name, channel);
    }
  }

  // Solicitar permisos de notificación
  async requestPermissions() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert(
        'Permisos de Notificación',
        'Para recibir notificaciones importantes sobre eventos y mensajes, necesitamos tu permiso.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Configuración', onPress: () => Linking.openSettings() }
        ]
      );
      return false;
    }

    return true;
  }

  // Registrar para notificaciones push
  async registerForPushNotifications() {
    try {
      if (!Constants.isDevice) {
        throw new Error('Debe usar un dispositivo físico para push notifications');
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      this.expoPushToken = token.data;
      
      // Guardar token localmente
      await AsyncStorage.setItem('expo_push_token', token.data);
      
      // Enviar token al servidor
      await this.sendTokenToServer(token.data);

      console.log('Push token registered:', token.data);
      return token.data;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      throw error;
    }
  }

  // Enviar token al servidor
  async sendTokenToServer(token) {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) return;

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/notifications/register-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          expoPushToken: token,
          platform: Platform.OS,
          deviceInfo: {
            brand: Device.brand,
            modelName: Device.modelName,
            osVersion: Device.osVersion,
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to register push token with server');
      }
    } catch (error) {
      console.error('Error sending token to server:', error);
    }
  }

  // Configurar listeners de notificaciones
  setupNotificationListeners() {
    // Listener para notificaciones recibidas mientras la app está en primer plano
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Listener para respuestas a notificaciones (tap, etc.)
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  // Manejar notificación recibida
  handleNotificationReceived(notification) {
    const { request } = notification;
    const { content, trigger } = request;

    // Lógica personalizada según el tipo de notificación
    switch (content.data?.type) {
      case NOTIFICATION_TYPES.EVENT_REMINDER:
        this.handleEventReminder(content.data);
        break;
      case NOTIFICATION_TYPES.NEW_MESSAGE:
        this.handleNewMessage(content.data);
        break;
      case NOTIFICATION_TYPES.ACHIEVEMENT_UNLOCKED:
        this.handleAchievementUnlocked(content.data);
        break;
      default:
        console.log('Unknown notification type:', content.data?.type);
    }
  }

  // Manejar respuesta a notificación
  handleNotificationResponse(response) {
    const { notification, actionIdentifier } = response;
    const { content } = notification.request;

    // Navegar según el tipo de notificación
    switch (content.data?.type) {
      case NOTIFICATION_TYPES.EVENT_REMINDER:
        // Navegar a la pantalla del evento
        this.navigateToEvent(content.data.eventId);
        break;
      case NOTIFICATION_TYPES.NEW_MESSAGE:
        // Navegar al chat
        this.navigateToChat(content.data.chatId);
        break;
      case NOTIFICATION_TYPES.TRIBE_INVITATION:
        // Navegar a la tribu
        this.navigateToTribe(content.data.tribeId);
        break;
      default:
        console.log('Unknown notification action:', actionIdentifier);
    }
  }

  // Programar notificación local
  async scheduleLocalNotification(title, body, data = {}, trigger = null) {
    try {
      const channelId = this.getChannelForType(data.type);
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          color: '#FF6B6B',
          ...(Platform.OS === 'android' && { channelId }),
        },
        trigger,
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling local notification:', error);
    }
  }

  // Obtener canal según tipo de notificación
  getChannelForType(type) {
    switch (type) {
      case NOTIFICATION_TYPES.EVENT_REMINDER:
      case NOTIFICATION_TYPES.EVENT_INVITATION:
      case NOTIFICATION_TYPES.EVENT_UPDATE:
      case NOTIFICATION_TYPES.EVENT_STARTING:
        return NOTIFICATION_CHANNELS.EVENTS.name;
      case NOTIFICATION_TYPES.NEW_MESSAGE:
        return NOTIFICATION_CHANNELS.MESSAGES.name;
      case NOTIFICATION_TYPES.TRIBE_INVITATION:
      case NOTIFICATION_TYPES.FRIEND_REQUEST:
      case NOTIFICATION_TYPES.ACHIEVEMENT_UNLOCKED:
        return NOTIFICATION_CHANNELS.SOCIAL.name;
      default:
        return NOTIFICATION_CHANNELS.SYSTEM.name;
    }
  }

  // Programar recordatorio de evento
  async scheduleEventReminder(event, reminderTime = 15) {
    const eventDate = new Date(event.dateTime.start);
    const reminderDate = new Date(eventDate.getTime() - reminderTime * 60 * 1000);

    if (reminderDate <= new Date()) {
      console.log('Reminder time is in the past, skipping');
      return;
    }

    return await this.scheduleLocalNotification(
      `🎉 Evento próximo: ${event.title}`,
      `Tu evento "${event.title}" comienza en ${reminderTime} minutos`,
      {
        type: NOTIFICATION_TYPES.EVENT_REMINDER,
        eventId: event._id,
        eventTitle: event.title,
      },
      { date: reminderDate }
    );
  }

  // Programar digest diario
  async scheduleDailyDigest() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // 9 AM

    return await this.scheduleLocalNotification(
      '📅 Tu resumen diario de EventConnect',
      'Descubre qué eventos interesantes tienes hoy',
      {
        type: NOTIFICATION_TYPES.DAILY_DIGEST,
      },
      {
        date: tomorrow,
        repeats: true,
      }
    );
  }

  // Manejar recordatorio de evento
  handleEventReminder(data) {
    // Lógica adicional para recordatorios de eventos
    console.log('Event reminder received:', data);
  }

  // Manejar nuevo mensaje
  handleNewMessage(data) {
    // Actualizar badge de la app
    Notifications.setBadgeCountAsync(data.unreadCount || 1);
  }

  // Manejar logro desbloqueado
  handleAchievementUnlocked(data) {
    // Mostrar animación especial o confetti
    console.log('Achievement unlocked:', data);
  }

  // Navegación (estas funciones serían implementadas según el sistema de navegación)
  navigateToEvent(eventId) {
    // Implementar navegación a evento
    console.log('Navigate to event:', eventId);
  }

  navigateToChat(chatId) {
    // Implementar navegación a chat
    console.log('Navigate to chat:', chatId);
  }

  navigateToTribe(tribeId) {
    // Implementar navegación a tribu
    console.log('Navigate to tribe:', tribeId);
  }

  // Obtener permisos actuales
  async getPermissionStatus() {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  }

  // Cancelar notificación
  async cancelNotification(notificationId) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  // Cancelar todas las notificaciones
  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Limpiar badge
  async clearBadge() {
    await Notifications.setBadgeCountAsync(0);
  }

  // Cleanup
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

// Hook para usar el sistema de notificaciones
export const usePushNotifications = () => {
  const [manager] = useState(() => new PushNotificationManager());
  const [isInitialized, setIsInitialized] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('undetermined');

  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        await manager.initialize();
        setIsInitialized(true);
        
        const status = await manager.getPermissionStatus();
        setPermissionStatus(status);
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
      }
    };

    initializeNotifications();

    return () => {
      manager.cleanup();
    };
  }, [manager]);

  const requestPermissions = async () => {
    const granted = await manager.requestPermissions();
    const status = await manager.getPermissionStatus();
    setPermissionStatus(status);
    return granted;
  };

  const scheduleEventReminder = (event, reminderTime) => {
    return manager.scheduleEventReminder(event, reminderTime);
  };

  const scheduleLocalNotification = (title, body, data, trigger) => {
    return manager.scheduleLocalNotification(title, body, data, trigger);
  };

  return {
    isInitialized,
    permissionStatus,
    requestPermissions,
    scheduleEventReminder,
    scheduleLocalNotification,
    cancelNotification: manager.cancelNotification.bind(manager),
    cancelAllNotifications: manager.cancelAllNotifications.bind(manager),
    clearBadge: manager.clearBadge.bind(manager),
  };
};

export default PushNotificationManager;
export { NOTIFICATION_TYPES, NOTIFICATION_CHANNELS };



