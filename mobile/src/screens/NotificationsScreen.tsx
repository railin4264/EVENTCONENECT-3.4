import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Bell, Check, Trash2, MoreVertical, Filter } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';

const { width } = Dimensions.get('window');

interface Notification {
  _id: string;
  type: 'event' | 'tribe' | 'post' | 'user' | 'system' | 'reminder';
  title: string;
  message: string;
  recipient: string;
  sender?: {
    _id: string;
    username: string;
    avatar?: string;
  };
  relatedEntity?: {
    type: 'event' | 'tribe' | 'post' | 'user';
    id: string;
    name: string;
  };
  timestamp: string;
  isRead: boolean;
  isActionable: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
  category: 'social' | 'event' | 'tribe' | 'system' | 'reminder';
}

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', filterType, filterCategory],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (filterType !== 'all') params.append('isRead', filterType === 'read' ? 'true' : 'false');
        if (filterCategory !== 'all') params.append('category', filterCategory);
        
        const response = await apiClient.get(`/api/notifications?${params.toString()}`);
        return response.data.notifications || [];
      } catch (error) {
        console.error('Error fetching notifications:', error);
        // Return mock data for development
        return generateMockNotifications();
      }
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await apiClient.patch(`/api/notifications/${notificationId}/read`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Error marking notification as read:', error);
    },
  });

  // Mark all notifications as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.patch('/api/notifications/read-all');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      Alert.alert('Éxito', 'Todas las notificaciones han sido marcadas como leídas');
    },
    onError: (error) => {
      Alert.alert('Error', 'No se pudieron marcar todas las notificaciones como leídas');
      console.error('Error marking all notifications as read:', error);
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await apiClient.delete(`/api/notifications/${notificationId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      Alert.alert('Error', 'No se pudo eliminar la notificación');
      console.error('Error deleting notification:', error);
    },
  });

  // Generate mock notifications for development
  const generateMockNotifications = (): Notification[] => {
    const mockNotifications: Notification[] = [];
    const types: Notification['type'][] = ['event', 'tribe', 'post', 'user', 'system', 'reminder'];
    const categories: Notification['category'][] = ['social', 'event', 'tribe', 'system', 'reminder'];
    const priorities: Notification['priority'][] = ['low', 'medium', 'high'];
    
    const mockUsers = [
      { _id: '1', username: 'usuario1', avatar: undefined },
      { _id: '2', username: 'usuario2', avatar: undefined },
      { _id: '3', username: 'usuario3', avatar: undefined },
    ];

    for (let i = 0; i < 25; i++) {
      const type = types[i % types.length];
      const category = categories[i % categories.length];
      const priority = priorities[i % priorities.length];
      const sender = mockUsers[i % mockUsers.length];
      const isRead = i > 10;
      
      let title = '';
      let message = '';
      let relatedEntity = undefined;

      switch (type) {
        case 'event':
          title = 'Nuevo Evento';
          message = `${sender.username} ha creado un nuevo evento: "Evento de Networking ${i + 1}"`;
          relatedEntity = { type: 'event', id: `event-${i}`, name: `Evento de Networking ${i + 1}` };
          break;
        case 'tribe':
          title = 'Nueva Tribu';
          message = `${sender.username} te ha invitado a unirte a la tribu "Desarrolladores Web"`;
          relatedEntity = { type: 'tribe', id: `tribe-${i}`, name: 'Desarrolladores Web' };
          break;
        case 'post':
          title = 'Nuevo Post';
          message = `${sender.username} ha publicado en la tribu "Eventos Tech"`;
          relatedEntity = { type: 'post', id: `post-${i}`, name: 'Post en Eventos Tech' };
          break;
        case 'user':
          title = 'Nuevo Seguidor';
          message = `${sender.username} ha empezado a seguirte`;
          relatedEntity = { type: 'user', id: sender._id, name: sender.username };
          break;
        case 'system':
          title = 'Actualización del Sistema';
          message = 'Hemos actualizado nuestra aplicación con nuevas funcionalidades';
          break;
        case 'reminder':
          title = 'Recordatorio de Evento';
          message = 'Tu evento "Meetup de Desarrolladores" comienza en 1 hora';
          relatedEntity = { type: 'event', id: `event-reminder-${i}`, name: 'Meetup de Desarrolladores' };
          break;
      }

      mockNotifications.push({
        _id: `notif-${i}`,
        type,
        title,
        message,
        recipient: user?._id || 'user1',
        sender,
        relatedEntity,
        timestamp: new Date(Date.now() - i * 300000).toISOString(), // 5 minutes apart
        isRead,
        isActionable: type !== 'system',
        actionUrl: type !== 'system' ? `/app/${type}/${i}` : undefined,
        priority,
        category,
      });
    }

    return mockNotifications;
  };

  const handleNotificationPress = (notification: Notification) => {
    if (notification.isActionable && notification.relatedEntity) {
      // Mark as read first
      if (!notification.isRead) {
        markAsReadMutation.mutate(notification._id);
      }
      
      // Navigate to related entity
      switch (notification.relatedEntity.type) {
        case 'event':
          navigation.navigate('EventDetail' as never, { eventId: notification.relatedEntity.id } as never);
          break;
        case 'tribe':
          navigation.navigate('TribeDetail' as never, { tribeId: notification.relatedEntity.id } as never);
          break;
        case 'post':
          navigation.navigate('PostDetail' as never, { postId: notification.relatedEntity.id } as never);
          break;
        case 'user':
          navigation.navigate('UserProfile' as never, { userId: notification.relatedEntity.id } as never);
          break;
      }
    } else if (notification.isActionable && notification.actionUrl) {
      // Handle custom action URLs
      Alert.alert('Info', 'Navegación a URL personalizada en desarrollo');
    }
  };

  const handleNotificationLongPress = (notificationId: string) => {
    if (isSelectionMode) {
      setSelectedNotifications(prev => 
        prev.includes(notificationId) 
          ? prev.filter(id => id !== notificationId)
          : [...prev, notificationId]
      );
    } else {
      setIsSelectionMode(true);
      setSelectedNotifications([notificationId]);
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleDeleteNotification = (notificationId: string) => {
    Alert.alert(
      'Eliminar Notificación',
      '¿Estás seguro de que quieres eliminar esta notificación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => {
          deleteNotificationMutation.mutate(notificationId);
        }},
      ]
    );
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDeleteSelected = () => {
    Alert.alert(
      'Eliminar Notificaciones',
      `¿Estás seguro de que quieres eliminar ${selectedNotifications.length} notificación(es)?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => {
          selectedNotifications.forEach(id => deleteNotificationMutation.mutate(id));
          cancelSelection();
        }},
      ]
    );
  };

  const cancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedNotifications([]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['notifications'] });
    setRefreshing(false);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'event':
        return <Ionicons name="calendar" size={24} color="#4CAF50" />;
      case 'tribe':
        return <Ionicons name="people" size={24} color="#2196F3" />;
      case 'post':
        return <Ionicons name="document-text" size={24} color="#FF9800" />;
      case 'user':
        return <Ionicons name="person" size={24} color="#9C27B0" />;
      case 'system':
        return <Ionicons name="settings" size={24} color="#607D8B" />;
      case 'reminder':
        return <Ionicons name="time" size={24} color="#F44336" />;
      default:
        return <Bell size={24} color={colors.primary} />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return '#F44336';
      case 'medium':
        return '#FF9800';
      case 'low':
        return '#4CAF50';
      default:
        return colors.textSecondary;
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        { backgroundColor: colors.surface, borderBottomColor: colors.border },
        !item.isRead && { backgroundColor: colors.primary + '10' },
        isSelectionMode && selectedNotifications.includes(item._id) && styles.selectedNotification
      ]}
      onPress={() => handleNotificationPress(item)}
      onLongPress={() => handleNotificationLongPress(item._id)}
      delayLongPress={500}
    >
      <View style={styles.notificationLeft}>
        <View style={styles.notificationIcon}>
          {getNotificationIcon(item.type)}
        </View>
        
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={[
              styles.notificationTitle,
              { color: colors.text },
              !item.isRead && { fontWeight: 'bold' }
            ]}>
              {item.title}
            </Text>
            
            <View style={styles.notificationMeta}>
              <View style={[
                styles.priorityIndicator,
                { backgroundColor: getPriorityColor(item.priority) }
              ]} />
              <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
                {new Date(item.timestamp).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          </View>
          
          <Text style={[
            styles.notificationMessage,
            { color: colors.textSecondary },
            !item.isRead && { color: colors.text }
          ]} numberOfLines={2}>
            {item.message}
          </Text>
          
          {item.relatedEntity && (
            <View style={[styles.relatedEntity, { backgroundColor: colors.background }]}>
              <Text style={[styles.relatedEntityText, { color: colors.textSecondary }]}>
                {item.relatedEntity.name}
              </Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.notificationActions}>
        {!item.isRead && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => handleMarkAsRead(item._id)}
          >
            <Check size={16} color="white" />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.error }]}
          onPress={() => handleDeleteNotification(item._id)}
        >
          <Trash2 size={16} color="white" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <View style={styles.headerTop}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Notificaciones
        </Text>
        
        <View style={styles.headerActions}>
          {!isSelectionMode && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleMarkAllAsRead}
            >
              <Check size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => Alert.alert('Info', 'Filtros en desarrollo')}
          >
            <Filter size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => Alert.alert('Info', 'Opciones en desarrollo')}
          >
            <MoreVertical size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Filter tabs */}
      <View style={styles.filterTabs}>
        {[
          { key: 'all', label: 'Todas', count: notifications.length },
          { key: 'unread', label: 'No leídas', count: notifications.filter(n => !n.isRead).length },
          { key: 'read', label: 'Leídas', count: notifications.filter(n => n.isRead).length },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              filterType === filter.key && { backgroundColor: colors.primary + '20' }
            ]}
            onPress={() => setFilterType(filter.key as any)}
          >
            <Text style={[
              styles.filterTabText,
              { color: filterType === filter.key ? colors.primary : colors.textSecondary }
            ]}>
              {filter.label}
            </Text>
            <View style={[
              styles.filterCount,
              { backgroundColor: filterType === filter.key ? colors.primary : colors.border }
            ]}>
              <Text style={[
                styles.filterCountText,
                { color: filterType === filter.key ? 'white' : colors.textSecondary }
              ]}>
                {filter.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSelectionToolbar = () => (
    isSelectionMode && (
      <View style={[styles.selectionToolbar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={cancelSelection} style={styles.toolbarButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={[styles.selectionCount, { color: colors.text }]}>
          {selectedNotifications.length} seleccionada(s)
        </Text>
        
        <View style={styles.toolbarActions}>
          <TouchableOpacity
            style={[styles.toolbarActionButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              selectedNotifications.forEach(id => markAsReadMutation.mutate(id));
              cancelSelection();
            }}
          >
            <Check size={20} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.toolbarActionButton, { backgroundColor: colors.error }]}
            onPress={handleDeleteSelected}
          >
            <Trash2 size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    )
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Bell size={64} color={colors.textSecondary} />
      <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
        No hay notificaciones
      </Text>
      <Text style={[styles.emptyStateMessage, { color: colors.textSecondary }]}>
        {filterType === 'all' 
          ? 'Cuando recibas notificaciones, aparecerán aquí'
          : `No hay notificaciones ${filterType === 'unread' ? 'no leídas' : 'leídas'}`
        }
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      {renderSelectionToolbar()}
      
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item._id}
        style={styles.notificationsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    padding: 8,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterCount: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  filterCountText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  selectionToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  toolbarButton: {
    padding: 8,
    marginRight: 16,
  },
  selectionCount: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  toolbarActions: {
    flexDirection: 'row',
    gap: 12,
  },
  toolbarActionButton: {
    padding: 8,
    borderRadius: 8,
  },
  notificationsList: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  notificationLeft: {
    flex: 1,
    flexDirection: 'row',
  },
  notificationIcon: {
    marginRight: 16,
    marginTop: 4,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    flex: 1,
    marginRight: 12,
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timestamp: {
    fontSize: 12,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  relatedEntity: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  relatedEntityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  notificationActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    marginLeft: 16,
  },
  actionButton: {
    padding: 8,
    borderRadius: 16,
  },
  selectedNotification: {
    opacity: 0.7,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
