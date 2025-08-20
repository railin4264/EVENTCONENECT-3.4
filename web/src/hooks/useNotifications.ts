import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from './useAuth';

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

  const response = await api.get(`/api/notifications?${params.toString()}`);
  return response.data;
};

// Mark notification as read
const markNotificationAsRead = async (id: string): Promise<void> => {
  await api.put(`/api/notifications/${id}/read`);
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (): Promise<void> => {
  await api.put('/api/notifications/read-all');
};

// Archive notification
const archiveNotification = async (id: string): Promise<void> => {
  await api.put(`/api/notifications/${id}/archive`);
};

// Delete notification
const deleteNotification = async (id: string): Promise<void> => {
  await api.delete(`/api/notifications/${id}`);
};

// Update notification preferences
const updateNotificationPreferences = async (preferences: any): Promise<void> => {
  await api.put('/api/notifications/preferences', preferences);
};

// Get notification preferences
const getNotificationPreferences = async (): Promise<any> => {
  const response = await api.get('/api/notifications/preferences');
  return response.data;
};

export const useNotifications = (filters: NotificationFilters = {}) => {
  const queryClient = useQueryClient();

  // Main notifications query
  const {
    data: notificationsData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['notifications', filters],
    () => fetchNotifications(filters),
    {
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  // Mark as read mutation
  const markAsReadMutation = useMutation(markNotificationAsRead, {
    onSuccess: (_, id) => {
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
  const markAllAsReadMutation = useMutation(markAllNotificationsAsRead, {
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
  const archiveNotificationMutation = useMutation(archiveNotification, {
    onSuccess: (_, id) => {
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
  const deleteNotificationMutation = useMutation(deleteNotification, {
    onSuccess: (_, id) => {
      // Remove notification from cache
      queryClient.setQueryData(['notifications'], (old: any) => ({
        ...old,
        notifications: old.notifications.filter((n: Notification) => n.id !== id),
      }));
    },
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation(updateNotificationPreferences, {
    onSuccess: () => {
      // Invalidate preferences query
      queryClient.invalidateQueries(['notification-preferences']);
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
    isMarkingAsRead: markAsReadMutation.isLoading,
    isMarkingAllAsRead: markAllAsReadMutation.isLoading,
    isArchiving: archiveNotificationMutation.isLoading,
    isDeleting: deleteNotificationMutation.isLoading,
    isUpdatingPreferences: updatePreferencesMutation.isLoading,
  };
};

// Hook for notification preferences
export const useNotificationPreferences = () => {
  const {
    data: preferences,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['notification-preferences'],
    getNotificationPreferences,
    {
      staleTime: 60 * 60 * 1000, // 1 hour
      cacheTime: 2 * 60 * 60 * 1000, // 2 hours
    }
  );

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
  
  const unreadCount = notifications.filter(n => n.status === 'unread').length;
  
  return {
    unreadCount,
    hasUnread: unreadCount > 0,
  };
};

export type { Notification, NotificationFilters };