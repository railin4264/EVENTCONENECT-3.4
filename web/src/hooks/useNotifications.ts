'use client';

import { useState, useEffect, useCallback } from 'react';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'event' | 'social';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  action?: {
    label: string;
    onClick: () => void;
  };
  metadata?: {
    eventId?: string;
    userId?: string;
    postId?: string;
    avatar?: string;
  };
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Cargar notificaciones desde localStorage al iniciar
  useEffect(() => {
    const savedNotifications = localStorage.getItem('eventconnect_notifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(parsed);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }

    // Agregar notificaciones de demostración si no hay ninguna
    if (!savedNotifications || JSON.parse(savedNotifications).length === 0) {
      const demoNotifications: Notification[] = [
        {
          id: '1',
          type: 'event',
          title: 'Nuevo evento cerca de ti',
          message: 'Tech Meetup Barcelona 2024 - ¡Solo quedan 3 días!',
          timestamp: new Date(Date.now() - 300000), // 5 minutos atrás
          read: false,
          priority: 'high',
          action: {
            label: 'Ver evento',
            onClick: () => console.log('Navigate to event')
          },
          metadata: {
            eventId: '1'
          }
        },
        {
          id: '2',
          type: 'social',
          title: 'Nueva conexión',
          message: 'María García quiere conectar contigo',
          timestamp: new Date(Date.now() - 3600000), // 1 hora atrás
          read: false,
          priority: 'medium',
          action: {
            label: 'Ver perfil',
            onClick: () => console.log('Navigate to profile')
          },
          metadata: {
            userId: 'maria_garcia',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b0e4?w=150'
          }
        },
        {
          id: '3',
          type: 'success',
          title: 'Registro confirmado',
          message: 'Te has registrado exitosamente en "Workshop de Arte Digital"',
          timestamp: new Date(Date.now() - 7200000), // 2 horas atrás
          read: true,
          priority: 'medium',
          metadata: {
            eventId: '3'
          }
        }
      ];
      setNotifications(demoNotifications);
    }
  }, []);

  // Actualizar contador de no leídas y guardar en localStorage
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
    localStorage.setItem('eventconnect_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Agregar nueva notificación
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Mostrar notificación del navegador si está permitido
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.svg',
        tag: newNotification.id
      });
    }
  }, []);

  // Marcar como leída
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  // Eliminar notificación
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Limpiar notificaciones antiguas (más de 7 días)
  const clearOldNotifications = useCallback(() => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    setNotifications(prev => 
      prev.filter(notification => notification.timestamp > weekAgo)
    );
  }, []);

  // Solicitar permisos de notificación
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearOldNotifications,
    requestNotificationPermission
  };
};