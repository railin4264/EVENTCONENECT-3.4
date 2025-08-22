import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  PanGestureHandler,
  State,
  Alert,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { useDynamicTheme } from '../../contexts/DynamicThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'achievement' | 'event' | 'social';
  title: string;
  message: string;
  icon: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: Date;
  read: boolean;
  actions?: NotificationAction[];
  data?: any;
  autoClose?: boolean;
  duration?: number;
}

export interface NotificationAction {
  id: string;
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'destructive';
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

// Componente de notificación individual
const NotificationItem: React.FC<{
  notification: Notification;
  onRemove: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  onAction: (action: NotificationAction) => void;
}> = ({ notification, onRemove, onMarkAsRead, onAction }) => {
  const { currentTheme } = useDynamicTheme();
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const typeConfig = {
    success: {
      colors: ['#22c55e', '#16a34a'],
      icon: '✅',
      haptic: Haptics.NotificationFeedbackType.Success
    },
    error: {
      colors: ['#ef4444', '#dc2626'],
      icon: '❌',
      haptic: Haptics.NotificationFeedbackType.Error
    },
    warning: {
      colors: ['#f59e0b', '#d97706'],
      icon: '⚠️',
      haptic: Haptics.NotificationFeedbackType.Warning
    },
    info: {
      colors: ['#3b82f6', '#2563eb'],
      icon: 'ℹ️',
      haptic: Haptics.NotificationFeedbackType.Info
    },
    achievement: {
      colors: ['#fbbf24', '#f59e0b'],
      icon: '🏆',
      haptic: Haptics.NotificationFeedbackType.Success
    },
    event: {
      colors: ['#8b5cf6', '#7c3aed'],
      icon: '🎉',
      haptic: Haptics.NotificationFeedbackType.Success
    },
    social: {
      colors: ['#ec4899', '#db2777'],
      icon: '👥',
      haptic: Haptics.NotificationFeedbackType.Success
    }
  };

  const config = typeConfig[notification.type];

  // Animación de entrada
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Feedback háptico
    Haptics.notificationAsync(config.haptic);

    // Auto-close si está configurado
    if (notification.autoClose) {
      const duration = notification.duration || 5000;
      setTimeout(() => {
        onRemove(notification.id);
      }, duration);
    }
  }, []);

  // Animación de shake para notificaciones urgentes
  useEffect(() => {
    if (notification.priority === 'urgent') {
      const shakeAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -1,
            duration: 100,
            useNativeDriver: true,
          }),
        ])
      );
      shakeAnimation.start();

      return () => shakeAnimation.stop();
    }
  }, [notification.priority, shakeAnim]);

  const handlePress = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  const handleRemove = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: screenWidth,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onRemove(notification.id);
    });
  };

  const shakeInterpolation = shakeAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-5, 5],
  });

  return (
    <Animated.View
      style={[
        styles.notificationItem,
        {
          transform: [
            { translateX: slideAnim },
            { scale: scaleAnim },
            { translateX: shakeInterpolation },
          ],
          opacity: opacityAnim,
        },
      ]}
    >
      <LinearGradient
        colors={config.colors}
        style={styles.notificationGradient}
      >
        {/* Header de la notificación */}
        <View style={styles.notificationHeader}>
          <View style={styles.notificationIcon}>
            <Text style={styles.notificationIconText}>{config.icon}</Text>
          </View>
          
          <View style={styles.notificationInfo}>
            <Text style={styles.notificationTitle} numberOfLines={1}>
              {notification.title}
            </Text>
            <Text style={styles.notificationMessage} numberOfLines={2}>
              {notification.message}
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={handleRemove}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        {/* Indicador de prioridad */}
        <View style={[
          styles.priorityIndicator,
          {
            backgroundColor: notification.priority === 'urgent' ? '#ef4444' :
                           notification.priority === 'high' ? '#f59e0b' :
                           notification.priority === 'medium' ? '#3b82f6' : '#6b7280'
          }
        ]}>
          <Text style={styles.priorityText}>
            {notification.priority.toUpperCase()}
          </Text>
        </View>

        {/* Acciones */}
        {notification.actions && notification.actions.length > 0 && (
          <View style={styles.actionsContainer}>
            {notification.actions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: action.style === 'destructive' ? '#ef4444' :
                                   action.style === 'primary' ? '#3b82f6' : 'rgba(255, 255, 255, 0.2)'
                  }
                ]}
                onPress={() => onAction(action)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.actionButtonText,
                  { color: action.style === 'destructive' || action.style === 'primary' ? '#fff' : '#fff' }
                ]}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Indicador de lectura */}
        {!notification.read && (
          <View style={styles.unreadIndicator}>
            <View style={styles.unreadDot} />
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
};

// Componente principal del sistema de notificaciones
export const ImmersiveNotificationSystem: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const panelAnim = useRef(new Animated.Value(-screenHeight)).current;
  const badgeAnim = useRef(new Animated.Value(1)).current;

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Animación del badge
    Animated.sequence([
      Animated.timing(badgeAnim, {
        toValue: 1.3,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(badgeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const togglePanel = () => {
    const toValue = showPanel ? -screenHeight : 0;
    Animated.timing(panelAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setShowPanel(!showPanel);
  };

  const handleAction = (action: NotificationAction) => {
    action.action();
    // Feedback háptico
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Configurar notificaciones push
  useEffect(() => {
    const configureNotifications = async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        Alert.alert('Permisos', 'Se requieren permisos para las notificaciones');
        return;
      }

      // Configurar canal de notificaciones para Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    };

    configureNotifications();
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        markAsRead,
        clearAll,
        unreadCount,
      }}
    >
      {children}

      {/* Botón flotante de notificaciones */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={togglePanel}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#8b5cf6', '#7c3aed']}
          style={styles.floatingButtonGradient}
        >
          <Text style={styles.floatingButtonIcon}>🔔</Text>
          
          {/* Badge de notificaciones no leídas */}
          {unreadCount > 0 && (
            <Animated.View
              style={[
                styles.notificationBadge,
                {
                  transform: [{ scale: badgeAnim }],
                },
              ]}
            >
              <Text style={styles.notificationBadgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </Animated.View>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Panel de notificaciones */}
      <Animated.View
        style={[
          styles.notificationPanel,
          {
            transform: [{ translateY: panelAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.95)', 'rgba(0, 0, 0, 0.9)']}
          style={styles.panelGradient}
        >
          {/* Header del panel */}
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Notificaciones</Text>
            <View style={styles.panelActions}>
              <TouchableOpacity
                onPress={clearAll}
                style={styles.clearAllButton}
                activeOpacity={0.7}
              >
                <Text style={styles.clearAllButtonText}>Limpiar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={togglePanel}
                style={styles.closePanelButton}
                activeOpacity={0.7}
              >
                <Text style={styles.closePanelButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Lista de notificaciones */}
          <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
            {notifications.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>🔔</Text>
                <Text style={styles.emptyStateText}>No hay notificaciones</Text>
              </View>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRemove={removeNotification}
                  onMarkAsRead={markAsRead}
                  onAction={handleAction}
                />
              ))
            )}
          </ScrollView>
        </LinearGradient>
      </Animated.View>
    </NotificationContext.Provider>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000,
  },
  floatingButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingButtonIcon: {
    fontSize: 24,
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  notificationPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  panelGradient: {
    flex: 1,
    paddingTop: 50,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  panelTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  panelActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    marginRight: 12,
  },
  clearAllButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  closePanelButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closePanelButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  notificationsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
  },
  notificationItem: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  notificationGradient: {
    padding: 16,
    position: 'relative',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationIconText: {
    fontSize: 20,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  priorityIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  unreadIndicator: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
});

export default ImmersiveNotificationSystem;