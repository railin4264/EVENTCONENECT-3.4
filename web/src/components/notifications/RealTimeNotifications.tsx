'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { io, Socket } from 'socket.io-client';
import { 
  Bell, 
  X, 
  Check, 
  Trash2, 
  Settings, 
  Filter,
  Search,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Clock,
  User,
  Calendar,
  Users,
  MessageCircle,
  Heart,
  Share2,
  Star,
  Award,
  Zap,
  AlertCircle,
  Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Notification {
  id: string;
  type: 'event' | 'tribe' | 'user' | 'system' | 'achievement' | 'reminder' | 'social' | 'security';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  isImportant: boolean;
  createdAt: string;
  expiresAt?: string;
  actions?: {
    label: string;
    action: string;
    url?: string;
  }[];
  sender?: {
    id: string;
    username: string;
    avatar?: string;
  };
  target?: {
    type: 'event' | 'tribe' | 'user' | 'post';
    id: string;
    name: string;
  };
}

interface NotificationSettings {
  push: boolean;
  email: boolean;
  inApp: boolean;
  sound: boolean;
  types: {
    event: boolean;
    tribe: boolean;
    user: boolean;
    system: boolean;
    achievement: boolean;
    reminder: boolean;
    social: boolean;
    security: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

interface NotificationFilters {
  type: 'all' | 'event' | 'tribe' | 'user' | 'system' | 'achievement' | 'reminder' | 'social' | 'security';
  status: 'all' | 'read' | 'unread';
  importance: 'all' | 'important' | 'normal';
  search: string;
  dateRange: 'all' | 'today' | 'week' | 'month';
}

export default function RealTimeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [filters, setFilters] = useState<NotificationFilters>({
    type: 'all',
    status: 'all',
    importance: 'all',
    search: '',
    dateRange: 'all',
  });
  
  const [settings, setSettings] = useState<NotificationSettings>({
    push: true,
    email: true,
    inApp: true,
    sound: true,
    types: {
      event: true,
      tribe: true,
      user: true,
      system: true,
      achievement: true,
      reminder: true,
      social: true,
      security: true,
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  });

  const socketRef = useRef<Socket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: fetchedNotifications, isLoading } = useQuery({
    queryKey: ['notifications', filters],
    queryFn: () => api.notifications.getNotifications(filters),
  });

  // Fetch notification settings
  const { data: fetchedSettings } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: () => api.notifications.getSettings(),
  });

  // Mutations
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => api.notifications.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => api.notifications.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: string) => api.notifications.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings: NotificationSettings) => api.notifications.updateSettings(newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
      toast.success('Configuración actualizada');
    },
  });

  // Initialize Socket.IO connection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      socketRef.current = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000', {
        transports: ['websocket'],
        auth: {
          token: localStorage.getItem('token'),
        },
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to notification socket');
      });

      socketRef.current.on('notification', (newNotification: Notification) => {
        handleNewNotification(newNotification);
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from notification socket');
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, []);

  // Initialize audio for notifications
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/notification-sound.mp3');
      audioRef.current.volume = 0.5;
    }
  }, []);

  // Update local state when fetched data changes
  useEffect(() => {
    if (fetchedNotifications) {
      setNotifications(fetchedNotifications);
      setUnreadCount(fetchedNotifications.filter(n => !n.isRead).length);
    }
  }, [fetchedNotifications]);

  useEffect(() => {
    if (fetchedSettings) {
      setSettings(fetchedSettings);
    }
  }, [fetchedSettings]);

  // Handle new notification from socket
  const handleNewNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Show toast notification
    if (settings.inApp) {
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                <p className="mt-1 text-sm text-gray-500">{notification.message}</p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Cerrar
            </button>
          </div>
        </div>
      ), {
        duration: 5000,
      });
    }

    // Play sound if enabled
    if (settings.sound && audioRef.current) {
      audioRef.current.play().catch(console.error);
    }

    // Show browser notification if enabled
    if (settings.push && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.svg',
        tag: notification.id,
      });
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    const iconClass = "w-6 h-6";
    switch (type) {
      case 'event':
        return <Calendar className={`${iconClass} text-blue-600`} />;
      case 'tribe':
        return <Users className={`${iconClass} text-green-600`} />;
      case 'user':
        return <User className={`${iconClass} text-purple-600`} />;
      case 'system':
        return <Info className={`${iconClass} text-gray-600`} />;
      case 'achievement':
        return <Award className={`${iconClass} text-yellow-600`} />;
      case 'reminder':
        return <Clock className={`${iconClass} text-orange-600`} />;
      case 'social':
        return <Heart className={`${iconClass} text-pink-600`} />;
      case 'security':
        return <AlertCircle className={`${iconClass} text-red-600`} />;
      default:
        return <Bell className={`${iconClass} text-gray-600`} />;
    }
  };

  // Get notification type label
  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'event': return 'Evento';
      case 'tribe': return 'Tribu';
      case 'user': return 'Usuario';
      case 'system': return 'Sistema';
      case 'achievement': return 'Logro';
      case 'reminder': return 'Recordatorio';
      case 'social': return 'Social';
      case 'security': return 'Seguridad';
      default: return 'Notificación';
    }
  };

  // Get notification type color
  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'event': return 'bg-blue-100 text-blue-800';
      case 'tribe': return 'bg-green-100 text-green-800';
      case 'user': return 'bg-purple-100 text-purple-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      case 'achievement': return 'bg-yellow-100 text-yellow-800';
      case 'reminder': return 'bg-orange-100 text-orange-800';
      case 'social': return 'bg-pink-100 text-pink-800';
      case 'security': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle notification actions
  const handleNotificationAction = (notification: Notification, action: string) => {
    switch (action) {
      case 'mark_read':
        markAsReadMutation.mutate(notification.id);
        break;
      case 'view':
        if (notification.target?.url) {
          window.location.href = notification.target.url;
        }
        break;
      case 'dismiss':
        deleteNotificationMutation.mutate(notification.id);
        break;
    }
  };

  // Filter notifications based on current filters
  const filteredNotifications = notifications.filter(notification => {
    if (filters.type !== 'all' && notification.type !== filters.type) return false;
    if (filters.status !== 'all') {
      if (filters.status === 'read' && !notification.isRead) return false;
      if (filters.status === 'unread' && notification.isRead) return false;
    }
    if (filters.importance !== 'all') {
      if (filters.importance === 'important' && !notification.isImportant) return false;
      if (filters.importance === 'normal' && notification.isImportant) return false;
    }
    if (filters.search && !notification.title.toLowerCase().includes(filters.search.toLowerCase()) && 
        !notification.message.toLowerCase().includes(filters.search.toLowerCase())) return false;
    
    return true;
  });

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Notificaciones push habilitadas');
      }
    }
  };

  // Update settings
  const handleSettingsUpdate = (newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    updateSettingsMutation.mutate(updatedSettings);
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => markAllAsReadMutation.mutate()}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Marcar todas como leídas
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowDropdown(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="mt-3 flex items-center space-x-2">
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">Todos</option>
                <option value="event">Eventos</option>
                <option value="tribe">Tribus</option>
                <option value="user">Usuarios</option>
                <option value="system">Sistema</option>
                <option value="achievement">Logros</option>
                <option value="reminder">Recordatorios</option>
                <option value="social">Social</option>
                <option value="security">Seguridad</option>
              </select>
              
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">Todos</option>
                <option value="unread">No leídos</option>
                <option value="read">Leídos</option>
              </select>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNotificationTypeColor(notification.type)}`}>
                          {getNotificationTypeLabel(notification.type)}
                        </span>
                        {notification.isImportant && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Importante
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(notification.createdAt).toLocaleString()}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {!notification.isRead && (
                            <button
                              onClick={() => handleNotificationAction(notification, 'mark_read')}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Marcar como leído
                            </button>
                          )}
                          
                          {notification.actions?.map((action, index) => (
                            <button
                              key={index}
                              onClick={() => handleNotificationAction(notification, action.action)}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              {action.label}
                            </button>
                          ))}
                          
                          <button
                            onClick={() => handleNotificationAction(notification, 'dismiss')}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No hay notificaciones</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200">
            <button
              onClick={() => window.location.href = '/notifications'}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800"
            >
              Ver todas las notificaciones
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Configuración de Notificaciones</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* General Settings */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración General</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.push}
                        onChange={(e) => handleSettingsUpdate({ push: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Notificaciones push</span>
                    </label>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.email}
                        onChange={(e) => handleSettingsUpdate({ email: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Notificaciones por email</span>
                    </label>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.inApp}
                        onChange={(e) => handleSettingsUpdate({ inApp: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Notificaciones en la app</span>
                    </label>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.sound}
                        onChange={(e) => handleSettingsUpdate({ sound: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Sonidos</span>
                    </label>
                  </div>
                </div>

                {/* Notification Types */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Tipos de Notificación</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(settings.types).map(([type, enabled]) => (
                      <label key={type} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={(e) => handleSettingsUpdate({
                            types: { ...settings.types, [type]: e.target.checked }
                          })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Quiet Hours */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Horas Silenciosas</h3>
                  <div className="space-y-4">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.quietHours.enabled}
                        onChange={(e) => handleSettingsUpdate({
                          quietHours: { ...settings.quietHours, enabled: e.target.checked }
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Activar horas silenciosas</span>
                    </label>
                    
                    {settings.quietHours.enabled && (
                      <div className="grid grid-cols-2 gap-4 ml-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Inicio</label>
                          <input
                            type="time"
                            value={settings.quietHours.start}
                            onChange={(e) => handleSettingsUpdate({
                              quietHours: { ...settings.quietHours, start: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Fin</label>
                          <input
                            type="time"
                            value={settings.quietHours.end}
                            onChange={(e) => handleSettingsUpdate({
                              quietHours: { ...settings.quietHours, end: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Permission Request */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Permisos de Notificación</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Para recibir notificaciones push, necesitas habilitar los permisos en tu navegador.
                  </p>
                  <button
                    onClick={requestNotificationPermission}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Habilitar Notificaciones
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
