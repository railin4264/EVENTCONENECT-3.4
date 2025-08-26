import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  MessageCircle,
  Users,
  Calendar,
  Plus,
  Search,
  X,
  UserCheck,
  Clock,
  Send
} from 'lucide-react-native';

import chatService from '../../services/ChatService';
import { useAuth } from '../../contexts/AuthContext';

const ChatScreen = () => {
  const navigation = useNavigation();
  const { user, token } = useAuth();
  
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChats, setFilteredChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const flatListRef = useRef(null);

  // Inicializar servicio de chat
  useEffect(() => {
    if (user && token) {
      initializeChatService();
    }

    return () => {
      chatService.cleanup();
    };
  }, [user, token]);

  // Listener para cambios de estado
  useEffect(() => {
    const removeChatListener = chatService.addListener((event, data) => {
      switch (event) {
        case 'socket_connected':
          setIsConnected(true);
          setConnectionStatus('connected');
          break;
        case 'socket_disconnected':
          setIsConnected(false);
          setConnectionStatus('disconnected');
          break;
        case 'socket_error':
          setConnectionStatus('error');
          break;
        case 'chats_updated':
          setChats(data);
          break;
        case 'chat_created':
          setChats(prev => [data, ...prev]);
          break;
        case 'chat_updated':
          loadChats(); // Refresh chats
          break;
      }
    });

    return removeChatListener;
  }, []);

  // Filtrar chats basado en búsqueda
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredChats(chats);
    } else {
      const filtered = chats.filter(chat =>
        chat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredChats(filtered);
    }
  }, [searchQuery, chats]);

  // Recargar cuando la pantalla esté en foco
  useFocusEffect(
    React.useCallback(() => {
      if (user && token) {
        loadChats();
      }
    }, [user, token])
  );

  const initializeChatService = async () => {
    try {
      setIsLoading(true);
      const success = await chatService.initializeSocket(user._id, token);
      
      if (success) {
        await loadChats();
      } else {
        Alert.alert('Error', 'No se pudo conectar al chat en tiempo real');
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      Alert.alert('Error', 'Error inicializando chat');
    } finally {
      setIsLoading(false);
    }
  };

  const loadChats = async () => {
    try {
      const response = await chatService.getChats();
      setChats(response.data || []);
    } catch (error) {
      console.error('Error loading chats:', error);
      Alert.alert('Error', 'No se pudieron cargar los chats');
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadChats();
    setIsRefreshing(false);
  };

  const handleChatPress = (chat) => {
    // Mark chat as read
    chatService.markChatAsRead(chat._id);
    
    // Navigate to chat screen
    navigation.navigate('IndividualChat', { 
      chatId: chat._id,
      chatName: chat.name,
      chatType: chat.type 
    });
  };

  const handleNewChat = () => {
    Alert.alert(
      'Nuevo Chat',
      '¿Qué tipo de chat quieres crear?',
      [
        {
          text: 'Chat Individual',
          onPress: () => navigation.navigate('CreateChat', { type: 'private' }),
        },
        {
          text: 'Chat Grupal',
          onPress: () => navigation.navigate('CreateChat', { type: 'group' }),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  const handleSearchChats = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const results = await chatService.searchChats(searchQuery);
      setFilteredChats(results.data || []);
    } catch (error) {
      Alert.alert('Error', 'Error buscando chats');
    }
  };

  const getChatIcon = (type) => {
    switch (type) {
      case 'private':
      case 'individual':
        return UserCheck;
      case 'group':
        return Users;
      case 'event':
        return Calendar;
      default:
        return MessageCircle;
    }
  };

  const getChatColor = (type) => {
    switch (type) {
      case 'private':
      case 'individual':
        return '#67e8f9';
      case 'group':
        return '#a855f7';
      case 'event':
        return '#f59e0b';
      default:
        return '#22c55e';
    }
  };

  const formatTimestamp = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
    
    return date.toLocaleDateString('es-ES');
  };

  const getConnectionIndicator = () => {
    if (connectionStatus === 'connected' && isConnected) {
      return { color: '#22c55e', text: 'Conectado' };
    } else if (connectionStatus === 'disconnected') {
      return { color: '#ef4444', text: 'Desconectado' };
    } else if (connectionStatus === 'error') {
      return { color: '#f59e0b', text: 'Error de conexión' };
    }
    return { color: '#6b7280', text: 'Conectando...' };
  };

  const renderChatItem = ({ item }) => {
    const IconComponent = getChatIcon(item.type);
    const iconColor = getChatColor(item.type);
    const hasUnread = item.unreadCount > 0;
    
    // Get participants info for private chats
    const isPrivateChat = item.type === 'private';
    const otherParticipant = isPrivateChat 
      ? item.participants?.find(p => p._id !== user._id)
      : null;
    
    const chatName = item.name || otherParticipant?.name || 'Chat sin nombre';
    const isOnline = isPrivateChat ? otherParticipant?.isOnline : false;
    
    return (
    <TouchableOpacity
        style={[styles.chatItem, hasUnread && styles.unreadChatItem]}
      onPress={() => handleChatPress(item)}
    >
      <View style={styles.chatAvatar}>
          <View style={[styles.avatarContainer, { backgroundColor: `${iconColor}20` }]}>
            {item.avatar ? (
        <Text style={styles.chatAvatarText}>{item.avatar}</Text>
            ) : (
              <IconComponent size={24} color={iconColor} />
            )}
          </View>
          
          {/* Online indicator for private chats */}
          {isOnline && (
            <View style={[styles.onlineIndicator, { backgroundColor: '#22c55e' }]} />
          )}
          
          {/* Unread indicator */}
          {hasUnread && (
            <View style={[styles.unreadDot, { backgroundColor: iconColor }]} />
        )}
      </View>
      
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
            <Text style={[
              styles.chatName,
              hasUnread && styles.unreadChatName
            ]}>
              {chatName}
          </Text>
            <Text style={styles.chatTimestamp}>
              {formatTimestamp(item.lastMessageTime || item.updatedAt)}
          </Text>
        </View>
        
        <View style={styles.chatFooter}>
          <Text
              style={[
                styles.chatLastMessage,
                hasUnread && styles.unreadLastMessage
              ]}
              numberOfLines={2}
            >
              {item.lastMessage?.content || 'No hay mensajes aún'}
          </Text>
          
            {hasUnread && (
              <View style={[styles.unreadBadge, { backgroundColor: iconColor }]}>
                <Text style={styles.unreadCount}>
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
            </View>
          )}
        </View>
        
          {/* Chat metadata */}
          <View style={styles.chatMeta}>
            <View style={styles.chatType}>
              <IconComponent size={12} color={iconColor} />
              <Text style={styles.chatTypeText}>
                {item.type === 'private' ? 'Privado' :
                 item.type === 'group' ? 'Grupo' :
                 item.type === 'event' ? 'Evento' : 'Chat'}
            </Text>
          </View>
            
            {item.participantCount && item.participantCount > 2 && (
              <Text style={styles.chatMetaText}>
                • {item.participantCount} miembros
              </Text>
        )}
          </View>
      </View>
    </TouchableOpacity>
  );
  };

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#67e8f9" />
          <Text style={styles.emptyStateTitle}>Cargando chats...</Text>
        </View>
      );
    }
    
    return (
    <View style={styles.emptyState}>
        <MessageCircle size={64} color="#6b7280" />
        <Text style={styles.emptyStateTitle}>
          {searchQuery ? 'No se encontraron chats' : 'No hay chats aún'}
      </Text>
        <Text style={styles.emptyStateSubtitle}>
          {searchQuery 
            ? 'Intenta con otros términos de búsqueda'
            : 'Inicia una conversación o únete a una tribu para comenzar a chatear'
          }
      </Text>
        {!searchQuery && (
      <TouchableOpacity
        style={styles.emptyStateButton}
        onPress={handleNewChat}
      >
            <Plus size={20} color="#ffffff" style={styles.buttonIcon} />
        <Text style={styles.emptyStateButtonText}>Crear Chat</Text>
      </TouchableOpacity>
        )}
    </View>
  );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0f0f23', '#1a1a2e', '#16213e']}
        style={StyleSheet.absoluteFillObject}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Chats</Text>
              
              {/* Connection status indicator */}
              <View style={styles.connectionIndicator}>
                <View style={[
                  styles.connectionDot,
                  { backgroundColor: getConnectionIndicator().color }
                ]} />
                <Text style={styles.connectionText}>
                  {getConnectionIndicator().text}
                </Text>
              </View>
            </View>
            
            <View style={styles.headerActions}>
            <TouchableOpacity
                style={styles.headerButton}
              onPress={handleNewChat}
            >
                <Plus size={24} color="#67e8f9" />
            </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#9ca3af" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar chats..."
              placeholderTextColor="#6b7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchChats}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <X size={20} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Chats List */}
        <FlatList
          ref={flatListRef}
          data={filteredChats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item._id}
          style={styles.chatsList}
          contentContainerStyle={styles.chatsListContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#67e8f9"
            />
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  connectionText: {
    fontSize: 12,
    color: '#d1d5db',
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  searchContainerDark: {
    backgroundColor: 'transparent',
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchBarDark: {
    backgroundColor: '#2a2a2a',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  searchInputDark: {
    color: '#fff',
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  chatsList: {
    flex: 1,
  },
  chatsListContent: {
    paddingBottom: 20,
  },
  chatItem: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatItemDark: {
    backgroundColor: '#2a2a2a',
  },
  chatAvatar: {
    marginRight: 16,
    position: 'relative',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  chatAvatarText: {
    fontSize: 24,
  },
  unreadChatItem: {
    backgroundColor: 'rgba(103, 232, 249, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#67e8f9',
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#0a0a0a',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#d1d5db',
    flex: 1,
  },
  unreadChatName: {
    fontWeight: '600',
    color: '#ffffff',
  },
  chatTimestamp: {
    fontSize: 12,
    color: '#999',
  },
  chatTimestampDark: {
    color: '#888',
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatLastMessage: {
    fontSize: 14,
    color: '#9ca3af',
    flex: 1,
    marginRight: 8,
    lineHeight: 18,
  },
  unreadLastMessage: {
    fontWeight: '500',
    color: '#d1d5db',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  chatMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  chatType: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  chatTypeText: {
    fontSize: 10,
    color: '#9ca3af',
    marginLeft: 4,
    fontWeight: '500',
  },
  chatMetaText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
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
    marginBottom: 24,
  },
  emptyStateSubtitleDark: {
    color: '#ccc',
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#67e8f9',
    borderRadius: 25,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 20,
  },
  buttonIcon: {
    marginRight: 8,
  },
  emptyStateButtonText: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChatScreen;