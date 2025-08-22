'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsAPI } from '@/services/api';

interface Notification {
  id: string;
  recipient: string;
  sender?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  type: string;
  title: string;
  message: string;
  data?: {
    eventId?: string;
    tribeId?: string;
    postId?: string;
    chatId?: string;
    badgeId?: string;
    achievementId?: string;
    customData?: any;
  };
  priority: 'low' | 'normal' | 'high' | 'urgent';
  channels: string[];
  status: 'unread' | 'read' | 'archived';
  readAt?: string;
  archivedAt?: string;
  scheduledFor?: string;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotificationFilters {
  type?: string;
  status?: string;
  priority?: string;
  page?: number;
  limit?: number;
}

// Fetch notifications with filters
const fetchNotifications = async (filters: NotificationFilters = {}): Promise<{ notifications: Notification[]; pagination: any }> => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString());
    }
  });

  return notificationsAPI.getNotifications(params);
};

// Mark notification as read
const markNotificationAsRead = async (id: string): Promise<void> => {
  await notificationsAPI.markAsRead(id);
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (): Promise<void> => {
  await notificationsAPI.markAllAsRead();
};

// Archive notification
const archiveNotification = async (id: string): Promise<void> => {
  // Archive is not available in notificationsAPI, using delete instead
  await notificationsAPI.deleteNotification(id);
};

// Delete notification
const deleteNotification = async (id: string): Promise<void> => {
  await notificationsAPI.deleteNotification(id);
};

// Update notification preferences
const updateNotificationPreferences = async (preferences: any): Promise<void> => {
  await notificationsAPI.updatePreferences(preferences);
};

// Get notification preferences
const getNotificationPreferences = async (): Promise<any> => {
  // Preferences endpoint not available in notificationsAPI, returning default preferences
  return {
    email: true,
    push: true,
    sms: false,
    types: ['events', 'messages', 'system'],
  };
};

export const useNotifications = (filters: NotificationFilters = {}) => {
  const queryClient = useQueryClient();

  // Main notifications query
  const {
    data: notificationsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['notifications', filters],
    queryFn: () => fetchNotifications(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes (cacheTime renamed to gcTime in v4)
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: (_: void, id: string) => {
      // Update notification in cache
      queryClient.setQueryData(['notifications'], (old: any) => ({
        ...old,
        notifications: old.notifications.map((n: Notification) =>
          n.id === id ? { ...n, status: 'read', readAt: new Date().toISOString() } : n
        ),
      }));
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      // Update all notifications in cache
      queryClient.setQueryData(['notifications'], (old: any) => ({
        ...old,
        notifications: old.notifications.map((n: Notification) => ({
          ...n,
          status: 'read',
          readAt: new Date().toISOString(),
        })),
      }));
    },
  });

  // Archive notification mutation
  const archiveNotificationMutation = useMutation({
    mutationFn: archiveNotification,
    onSuccess: (_: void, id: string) => {
      // Update notification in cache
      queryClient.setQueryData(['notifications'], (old: any) => ({
        ...old,
        notifications: old.notifications.map((n: Notification) =>
          n.id === id ? { ...n, status: 'archived', archivedAt: new Date().toISOString() } : n
        ),
      }));
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: (_: void, id: string) => {
      // Remove notification from cache
      queryClient.setQueryData(['notifications'], (old: any) => ({
        ...old,
        notifications: old.notifications.filter((n: Notification) => n.id !== id),
      }));
    },
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: () => {
      // Invalidate preferences query
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
  });

  return {
    // Data
    notifications: notificationsData?.notifications || [],
    pagination: notificationsData?.pagination,
    
    // State
    isLoading,
    error,
    
    // Actions
    refetch,
    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    archiveNotification: archiveNotificationMutation.mutateAsync,
    deleteNotification: deleteNotificationMutation.mutateAsync,
    updatePreferences: updatePreferencesMutation.mutateAsync,
    
    // Mutations state
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isArchiving: archiveNotificationMutation.isPending,
    isDeleting: deleteNotificationMutation.isPending,
    isUpdatingPreferences: updatePreferencesMutation.isPending,
  };
};

// Hook for notification preferences
export const useNotificationPreferences = () => {
  const {
    data: preferences,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: getNotificationPreferences,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000, // 2 hours (cacheTime renamed to gcTime in v4)
  });

  return {
    preferences: preferences || {},
    isLoading,
    error,
    refetch,
  };
};

// Hook for unread notifications count
export const useUnreadNotificationsCount = () => {
  const { notifications } = useNotifications();
  
  const unreadCount = notifications.filter((n: Notification) => n.status === 'unread').length;
  
  return {
    unreadCount,
    hasUnread: unreadCount > 0,
  };
};

export type { Notification, NotificationFilters };