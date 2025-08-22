'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
} from 'framer-motion';
import {
  Bell,
  X,
  Check,
  AlertTriangle,
  Info,
  Star,
  Zap,
  Heart,
  MessageCircle,
} from 'lucide-react';

interface Notification {
  id: string;
  type:
    | 'success'
    | 'error'
    | 'warning'
    | 'info'
    | 'achievement'
    | 'event'
    | 'social';
  title: string;
  message: string;
  icon?: React.ReactNode;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  sound?: string;
  vibration?: boolean;
  autoClose?: number;
  expandable?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
  ) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = React.createContext<
  NotificationContextType | undefined
>(undefined);

// Sonidos contextuales
const notificationSounds = {
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
  warning: '/sounds/warning.mp3',
  info: '/sounds/info.mp3',
  achievement: '/sounds/achievement.mp3',
  event: '/sounds/event.mp3',
  social: '/sounds/social.mp3',
};

// Colores por tipo de notificación
const notificationColors = {
  success: {
    bg: 'from-green-500 to-emerald-500',
    border: 'border-green-400/30',
    icon: 'text-green-300',
  },
  error: {
    bg: 'from-red-500 to-pink-500',
    border: 'border-red-400/30',
    icon: 'text-red-300',
  },
  warning: {
    bg: 'from-yellow-500 to-orange-500',
    border: 'border-yellow-400/30',
    icon: 'text-yellow-300',
  },
  info: {
    bg: 'from-blue-500 to-cyan-500',
    border: 'border-blue-400/30',
    icon: 'text-blue-300',
  },
  achievement: {
    bg: 'from-purple-500 to-pink-500',
    border: 'border-purple-400/30',
    icon: 'text-purple-300',
  },
  event: {
    bg: 'from-indigo-500 to-blue-500',
    border: 'border-indigo-400/30',
    icon: 'text-indigo-300',
  },
  social: {
    bg: 'from-teal-500 to-green-500',
    border: 'border-teal-400/30',
    icon: 'text-teal-300',
  },
};

// Iconos por tipo
const notificationIcons = {
  success: <Check className='w-5 h-5' />,
  error: <X className='w-5 h-5' />,
  warning: <AlertTriangle className='w-5 h-5' />,
  info: <Info className='w-5 h-5' />,
  achievement: <Star className='w-5 h-5' />,
  event: <Zap className='w-5 h-5' />,
  social: <MessageCircle className='w-5 h-5' />,
};

// Componente de notificación individual
const NotificationItem: React.FC<{
  notification: Notification;
  onRemove: (id: string) => void;
  onMarkAsRead: (id: string) => void;
}> = ({ notification, onRemove, onMarkAsRead }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const scale = useMotionValue(1);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const springScale = useSpring(scale, { damping: 20, stiffness: 300 });
  const springRotateX = useSpring(rotateX, { damping: 20, stiffness: 300 });
  const springRotateY = useSpring(rotateY, { damping: 20, stiffness: 300 });

  // Reproducir sonido
  useEffect(() => {
    if (notification.sound && !isPlaying) {
      try {
        audioRef.current = new Audio(notification.sound);
        audioRef.current.volume = 0.3;
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            // Fallback silencioso si no se puede reproducir
          });
      } catch (error) {
        console.log('Audio not supported');
      }
    }
  }, [notification.sound, isPlaying]);

  // Vibración en móviles
  useEffect(() => {
    if (notification.vibration && 'vibrate' in navigator) {
      const pattern =
        notification.priority === 'urgent' ? [200, 100, 200] : [100];
      navigator.vibrate(pattern);
    }
  }, [notification.vibration, notification.priority]);

  // Auto-cerrar
  useEffect(() => {
    if (notification.autoClose) {
      const timer = setTimeout(() => {
        onRemove(notification.id);
      }, notification.autoClose);

      return () => clearTimeout(timer);
    }
  }, [notification.autoClose, notification.id, onRemove]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHovered) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    rotateX.set((mouseY / (rect.height / 2)) * -5);
    rotateY.set((mouseX / (rect.width / 2)) * 5);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    scale.set(1.02);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
  };

  const colors = notificationColors[notification.type];
  const icon = notification.icon || notificationIcons[notification.type];

  return (
    <motion.div
      className={`relative overflow-hidden rounded-xl border ${colors.border} bg-gradient-to-br ${colors.bg} backdrop-blur-sm`}
      style={{
        scale: springScale,
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, x: 300, rotateY: 90 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      exit={{ opacity: 0, x: -300, rotateY: -90 }}
      transition={{ duration: 0.5, type: 'spring' }}
      whileHover={{ z: 10 }}
      layout
    >
      {/* Efecto de brillo */}
      <motion.div
        className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent'
        initial={{ x: '-100%' }}
        animate={{ x: isHovered ? '100%' : '-100%' }}
        transition={{ duration: 0.8 }}
      />

      {/* Contenido principal */}
      <div className='relative z-10 p-4'>
        <div className='flex items-start space-x-3'>
          {/* Icono */}
          <motion.div
            className={`p-2 rounded-lg bg-white/10 ${colors.icon}`}
            animate={{ rotate: isHovered ? [0, 10, -10, 0] : 0 }}
            transition={{ duration: 0.5 }}
          >
            {icon}
          </motion.div>

          {/* Contenido */}
          <div className='flex-1 min-w-0'>
            <div className='flex items-center justify-between mb-1'>
              <h4 className='font-semibold text-white text-sm'>
                {notification.title}
              </h4>

              {/* Indicador de prioridad */}
              <div className='flex items-center space-x-2'>
                {notification.priority === 'urgent' && (
                  <motion.div
                    className='w-2 h-2 bg-red-300 rounded-full'
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}

                <button
                  onClick={() => onRemove(notification.id)}
                  className='text-white/70 hover:text-white transition-colors'
                >
                  <X className='w-4 h-4' />
                </button>
              </div>
            </div>

            <p className='text-white/90 text-xs mb-2'>{notification.message}</p>

            {/* Timestamp */}
            <div className='text-white/60 text-xs'>
              {notification.timestamp.toLocaleTimeString()}
            </div>

            {/* Acción */}
            {notification.action && (
              <motion.button
                className='mt-3 px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs rounded-lg transition-colors'
                onClick={notification.action.onClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {notification.action.label}
              </motion.button>
            )}
          </div>
        </div>

        {/* Barra de progreso para auto-close */}
        {notification.autoClose && (
          <motion.div
            ref={progressRef}
            className='absolute bottom-0 left-0 h-1 bg-white/30'
            initial={{ width: '100%' }}
            animate={{ width: 0 }}
            transition={{
              duration: notification.autoClose / 1000,
              ease: 'linear',
            }}
          />
        )}
      </div>

      {/* Efecto de partículas para notificaciones especiales */}
      {notification.type === 'achievement' && (
        <motion.div
          className='absolute inset-0 pointer-events-none'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className='absolute w-1 h-1 bg-yellow-300 rounded-full'
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + i * 10}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [1, 0, 1],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2,
                delay: i * 0.2,
                repeat: Infinity,
              }}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

// Componente principal del sistema de notificaciones
export const ImmersiveNotificationSystem: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      const newNotification: Notification = {
        ...notification,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        read: false,
      };

      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Mostrar notificación toast si es de alta prioridad
      if (
        notification.priority === 'high' ||
        notification.priority === 'urgent'
      ) {
        showToast(newNotification);
      }
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const showToast = (notification: Notification) => {
    // Implementar toast emergente para notificaciones urgentes
    console.log('Toast:', notification.title);
  };

  const contextValue: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    markAsRead,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}

      {/* Botón de notificaciones */}
      <div className='fixed top-4 right-4 z-50'>
        <motion.button
          className='relative p-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white hover:bg-white/20 transition-colors'
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Bell className='w-6 h-6' />

          {/* Contador de no leídas */}
          {unreadCount > 0 && (
            <motion.div
              className='absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold'
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.div>
          )}
        </motion.button>

        {/* Panel de notificaciones */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className='absolute top-16 right-0 w-96 max-h-96 overflow-y-auto bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 space-y-3'
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-white font-semibold'>Notificaciones</h3>
                <button
                  onClick={clearAll}
                  className='text-white/70 hover:text-white text-sm transition-colors'
                >
                  Limpiar todo
                </button>
              </div>

              {/* Lista de notificaciones */}
              {notifications.length === 0 ? (
                <div className='text-center text-white/50 py-8'>
                  <Bell className='w-12 h-12 mx-auto mb-2 opacity-50' />
                  <p>No hay notificaciones</p>
                </div>
              ) : (
                <div className='space-y-3'>
                  {notifications.map(notification => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onRemove={removeNotification}
                      onMarkAsRead={markAsRead}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

// Hook para usar notificaciones
export const useNotifications = (): NotificationContextType => {
  const context = React.useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotifications must be used within a ImmersiveNotificationSystem'
    );
  }
  return context;
};
