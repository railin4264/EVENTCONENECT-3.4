import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const NotificationsScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, events, tribes, chat

  useEffect(() => {
    // TODO: Fetch notifications from API
    const mockNotifications = [
      {
        id: '1',
        type: 'event',
        title: 'Nuevo evento cerca de ti',
        message: 'Fiesta de Cumpleaños se ha programado para mañana',
        timestamp: '2 min',
        isRead: false,
        icon: '🎉',
        action: 'view_event',
        eventId: '123',
      },
      {
        id: '2',
        type: 'tribe',
        title: 'Invitación a tribu',
        message: 'Juan te ha invitado a unirte a Tech Enthusiasts',
        timestamp: '1 hora',
        isRead: false,
        icon: '👥',
        action: 'join_tribe',
        tribeId: '456',
      },
      {
        id: '3',
        type: 'chat',
        title: 'Nuevo mensaje',
        message: 'María ha enviado un mensaje en el chat de Yoga en el Parque',
        timestamp: '2 horas',
        isRead: true,
        icon: '💬',
        action: 'open_chat',
        chatId: '789',
      },
      {
        id: '4',
        type: 'event',
        title: 'Recordatorio de evento',
        message: 'Tu evento "Meetup Tech" comienza en 1 hora',
        timestamp: '3 horas',
        isRead: true,
        icon: '⏰',
        action: 'view_event',
        eventId: '101',
      },
      {
        id: '5',
        type: 'system',
        title: 'Bienvenido a EventConnect',
        message: 'Tu cuenta ha sido creada exitosamente. ¡Comienza a explorar!',
        timestamp: '1 día',
        isRead: true,
        icon: '🎯',
        action: 'none',
      },
      {
        id: '6',
        type: 'tribe',
        title: 'Nuevo miembro en tu tribu',
        message: 'Ana se ha unido a tu tribu "Fitness Enthusiasts"',
        timestamp: '2 días',
        isRead: true,
        icon: '👤',
        action: 'view_tribe',
        tribeId: '202',
      },
    ];
    setNotifications(mockNotifications);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch fresh notifications
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getFilteredNotifications = () => {
    if (filter === 'all') return notifications;
    if (filter === 'unread') return notifications.filter(n => !n.isRead);
    return notifications.filter(n => n.type === filter);
  };

  const handleNotificationPress = (notification) => {
    if (notification.isRead) {
      // Mark as read if not already
      setNotifications(prev =>
        prev.map(n =>
          n.id === notification.id ? { ...n, isRead: true } : n
        )
      );
    }

    // Handle different notification actions
    switch (notification.action) {
      case 'view_event':
        navigation.navigate('EventDetails', { eventId: notification.eventId });
        break;
      case 'join_tribe':
        handleJoinTribe(notification.tribeId);
        break;
      case 'open_chat':
        navigation.navigate('IndividualChat', { chatId: notification.chatId });
        break;
      case 'view_tribe':
        navigation.navigate('TribeDetails', { tribeId: notification.tribeId });
        break;
      case 'none':
      default:
        // No action needed
        break;
    }
  };

  const handleJoinTribe = (tribeId) => {
    Alert.alert(
      'Unirse a Tribu',
      '¿Te gustaría unirte a esta tribu?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Unirse',
          onPress: () => {
            // TODO: API call to join tribe
            Alert.alert('Éxito', 'Te has unido a la tribu');
          },
        },
      ]
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const handleDeleteNotification = (notificationId) => {
    Alert.alert(
      'Eliminar Notificación',
      '¿Estás seguro de que quieres eliminar esta notificación?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setNotifications(prev =>
              prev.filter(n => n.id !== notificationId)
            );
          },
        },
      ]
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'event':
        return 'calendar';
      case 'tribe':
        return 'people';
      case 'chat':
        return 'chatbubble';
      case 'system':
        return 'settings';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'event':
        return '#667eea';
      case 'tribe':
        return '#764ba2';
      case 'chat':
        return '#f093fb';
      case 'system':
        return '#4facfe';
      default:
        return '#96CEB4';
    }
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        isDark && styles.notificationItemDark,
        !item.isRead && styles.unreadNotification
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationIcon}>
        <Text style={styles.notificationEmoji}>{item.icon}</Text>
        {!item.isRead && (
          <View style={[styles.unreadDot, { backgroundColor: getNotificationColor(item.type) }]} />
        )}
      </View>
      
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={[styles.notificationTitle, isDark && styles.notificationTitleDark]}>
            {item.title}
          </Text>
          <TouchableOpacity
            onPress={() => handleDeleteNotification(item.id)}
            style={styles.deleteButton}
          >
            <Ionicons
              name="close"
              size={16}
              color={isDark ? '#ccc' : '#999'}
            />
          </TouchableOpacity>
        </View>
        
        <Text
          style={[styles.notificationMessage, isDark && styles.notificationMessageDark]}
          numberOfLines={2}
        >
          {item.message}
        </Text>
        
        <View style={styles.notificationFooter}>
          <Text style={[styles.notificationTimestamp, isDark && styles.notificationTimestampDark]}>
            {item.timestamp}
          </Text>
          
          <View style={styles.notificationType}>
            <Ionicons
              name={getNotificationIcon(item.type)}
              size={14}
              color={getNotificationColor(item.type)}
            />
            <Text style={[styles.notificationTypeText, isDark && styles.notificationTypeTextDark]}>
              {item.type === 'event' ? 'Evento' :
               item.type === 'tribe' ? 'Tribu' :
               item.type === 'chat' ? 'Chat' :
               item.type === 'system' ? 'Sistema' : 'Otro'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name="notifications-outline"
        size={64}
        color={isDark ? '#666' : '#ccc'}
      />
      <Text style={[styles.emptyStateTitle, isDark && styles.emptyStateTitleDark]}>
        No hay notificaciones
      </Text>
      <Text style={[styles.emptyStateSubtitle, isDark && styles.emptyStateSubtitleDark]}>
        {filter === 'all' ? 'Todas las notificaciones aparecerán aquí' :
         filter === 'unread' ? 'No tienes notificaciones sin leer' :
         `No tienes notificaciones de ${filter}`}
      </Text>
    </View>
  );

  const renderFilterTabs = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[
          { key: 'all', label: 'Todas', icon: 'notifications' },
          { key: 'unread', label: 'Sin leer', icon: 'ellipse' },
          { key: 'event', label: 'Eventos', icon: 'calendar' },
          { key: 'tribe', label: 'Tribus', icon: 'people' },
          { key: 'chat', label: 'Chat', icon: 'chatbubble' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.filterTab,
              filter === tab.key && styles.activeFilterTab,
              isDark && styles.filterTabDark
            ]}
            onPress={() => setFilter(tab.key)}
          >
            <Ionicons
              name={tab.icon}
              size={16}
              color={filter === tab.key ? '#fff' : (isDark ? '#ccc' : '#666')}
            />
            <Text
              style={[
                styles.filterTabText,
                filter === tab.key && styles.activeFilterTabText,
                isDark && styles.filterTabTextDark
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Notificaciones</Text>
          <TouchableOpacity
            style={styles.markAllReadButton}
            onPress={handleMarkAllAsRead}
          >
            <Ionicons name="checkmark-done" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Filter Tabs */}
      {renderFilterTabs()}

      {/* Notifications List */}
      <FlatList
        data={getFilteredNotifications()}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        style={styles.notificationsList}
        contentContainerStyle={styles.notificationsListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  markAllReadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterTabDark: {
    backgroundColor: '#2a2a2a',
  },
  activeFilterTab: {
    backgroundColor: '#667eea',
  },
  filterTabText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  filterTabTextDark: {
    color: '#ccc',
  },
  activeFilterTabText: {
    color: '#fff',
  },
  notificationsList: {
    flex: 1,
  },
  notificationsListContent: {
    paddingBottom: 20,
  },
  notificationItem: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationItemDark: {
    backgroundColor: '#2a2a2a',
  },
  unreadNotification: {
    backgroundColor: '#f8f9ff',
  },
  notificationIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    position: 'relative',
  },
  notificationEmoji: {
    fontSize: 24,
  },
  unreadDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  notificationTitleDark: {
    color: '#fff',
  },
  deleteButton: {
    padding: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationMessageDark: {
    color: '#ccc',
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationTimestamp: {
    fontSize: 12,
    color: '#999',
  },
  notificationTimestampDark: {
    color: '#888',
  },
  notificationType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationTypeText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  notificationTypeTextDark: {
    color: '#888',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 86,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateTitleDark: {
    color: '#fff',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyStateSubtitleDark: {
    color: '#ccc',
  },
});

export default NotificationsScreen;