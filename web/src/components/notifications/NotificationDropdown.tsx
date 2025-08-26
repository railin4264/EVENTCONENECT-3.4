'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BellIcon,
  CalendarDaysIcon,
  UsersIcon,
  ChatBubbleLeftIcon,
  StarIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';

interface NotificationDropdownProps {
  onClose: () => void;
}

const NotificationDropdown = ({ onClose }: NotificationDropdownProps) => {
  const { user } = useAuth();
  const { notifications, markAsRead, markAllAsRead, isLoading } =
    useNotifications();
  const [isVisible, setIsVisible] = useState(true);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  const handleNotificationClick = async (notificationId: string) => {
    await markAsRead(notificationId);
    // Handle navigation based on notification type
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'event_invite':
      case 'event_reminder':
      case 'event_update':
      case 'event_cancelled':
        return <CalendarDaysIcon className='w-5 h-5 text-primary-500' />;
      case 'tribe_invite':
      case 'tribe_join_request':
      case 'tribe_update':
        return <UsersIcon className='w-5 h-5 text-secondary-500' />;
      case 'new_message':
      case 'message_reply':
        return <ChatBubbleLeftIcon className='w-5 h-5 text-accent-500' />;
      case 'badge_earned':
      case 'achievement_unlocked':
        return <StarIcon className='w-5 h-5 text-yellow-500' />;
      default:
        return <BellIcon className='w-5 h-5 text-gray-500' />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'event_invite':
      case 'event_reminder':
      case 'event_update':
      case 'event_cancelled':
        return 'bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800';
      case 'tribe_invite':
      case 'tribe_join_request':
      case 'tribe_update':
        return 'bg-secondary-50 border-secondary-200 dark:bg-secondary-900/20 dark:border-secondary-800';
      case 'new_message':
      case 'message_reply':
        return 'bg-accent-50 border-accent-200 dark:bg-accent-900/20 dark:border-accent-800';
      case 'badge_earned':
      case 'achievement_unlocked':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className='absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50'
        >
          {/* Header */}
          <div className='flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
              Notificaciones
            </h3>
            <div className='flex items-center space-x-2'>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className='text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300'
                >
                  Marcar todo como leído
                </button>
              )}
              <button
                onClick={handleClose}
                className='p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
              >
                <XMarkIcon className='w-4 h-4' />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className='max-h-96 overflow-y-auto'>
            {isLoading ? (
              <div className='p-4 text-center'>
                <div className='w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2' />
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Cargando...
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className='p-8 text-center'>
                <BellIcon className='w-12 h-12 text-gray-400 mx-auto mb-3' />
                <p className='text-gray-500 dark:text-gray-400 text-sm'>
                  No tienes notificaciones
                </p>
              </div>
            ) : (
              <div className='divide-y divide-gray-200 dark:divide-gray-700'>
                {notifications.slice(0, 10).map(notification => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id)}
                    className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      notification.status === 'unread'
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : ''
                    }`}
                  >
                    <div className='flex items-start space-x-3'>
                      <div className='flex-shrink-0 mt-1'>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium text-gray-900 dark:text-white'>
                          {notification.title}
                        </p>
                        <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                          {notification.message}
                        </p>
                        <div className='flex items-center justify-between mt-2'>
                          <span className='text-xs text-gray-400 dark:text-gray-500'>
                            {formatDistanceToNow(
                              new Date(notification.createdAt),
                              {
                                addSuffix: true,
                                locale: es,
                              }
                            )}
                          </span>
                          {notification.status === 'unread' && (
                            <span className='w-2 h-2 bg-blue-500 rounded-full'></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 10 && (
            <div className='p-4 border-t border-gray-200 dark:border-gray-700'>
              <button className='w-full text-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300'>
                Ver todas las notificaciones
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationDropdown;
