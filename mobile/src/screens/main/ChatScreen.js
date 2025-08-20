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
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const ChatScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChats, setFilteredChats] = useState([]);
  const flatListRef = useRef(null);

  useEffect(() => {
    // TODO: Fetch chats from API
    const mockChats = [
      {
        id: '1',
        name: 'Juan Pérez',
        lastMessage: '¡Hola! ¿Cómo estás?',
        timestamp: '2 min',
        unreadCount: 2,
        avatar: '👤',
        isOnline: true,
        type: 'individual',
      },
      {
        id: '2',
        name: 'Tech Enthusiasts',
        lastMessage: 'Nuevo evento programado para el viernes',
        timestamp: '1 hora',
        unreadCount: 0,
        avatar: '💻',
        isOnline: false,
        type: 'group',
        members: 15,
      },
      {
        id: '3',
        name: 'María García',
        lastMessage: 'Perfecto, nos vemos ahí',
        timestamp: '2 horas',
        unreadCount: 1,
        avatar: '👤',
        isOnline: false,
        type: 'individual',
      },
      {
        id: '4',
        name: 'Fiesta de Cumpleaños',
        lastMessage: 'Confirmado: 25 personas asistirán',
        timestamp: '1 día',
        unreadCount: 0,
        avatar: '🎉',
        isOnline: false,
        type: 'event',
        members: 25,
      },
      {
        id: '5',
        name: 'Yoga en el Parque',
        lastMessage: 'Recordatorio: clase mañana a las 8 AM',
        timestamp: '2 días',
        unreadCount: 0,
        avatar: '🧘',
        isOnline: false,
        type: 'event',
        members: 30,
      },
    ];
    setChats(mockChats);
    setFilteredChats(mockChats);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredChats(chats);
    } else {
      const filtered = chats.filter(chat =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredChats(filtered);
    }
  }, [searchQuery, chats]);

  const handleChatPress = (chat) => {
    // TODO: Navigate to individual chat
    navigation.navigate('IndividualChat', { chat });
  };

  const handleNewChat = () => {
    Alert.alert(
      'Nuevo Chat',
      '¿Qué tipo de chat quieres crear?',
      [
        {
          text: 'Chat Individual',
          onPress: () => navigation.navigate('NewIndividualChat'),
        },
        {
          text: 'Chat Grupal',
          onPress: () => navigation.navigate('NewGroupChat'),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  const getChatIcon = (type) => {
    switch (type) {
      case 'individual':
        return 'person';
      case 'group':
        return 'people';
      case 'event':
        return 'calendar';
      default:
        return 'chatbubble';
    }
  };

  const getChatColor = (type) => {
    switch (type) {
      case 'individual':
        return '#667eea';
      case 'group':
        return '#764ba2';
      case 'event':
        return '#f093fb';
      default:
        return '#4facfe';
    }
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.chatItem, isDark && styles.chatItemDark]}
      onPress={() => handleChatPress(item)}
    >
      <View style={styles.chatAvatar}>
        <Text style={styles.chatAvatarText}>{item.avatar}</Text>
        {item.isOnline && (
          <View style={[styles.onlineIndicator, { backgroundColor: getChatColor(item.type) }]} />
        )}
      </View>
      
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={[styles.chatName, isDark && styles.chatNameDark]}>
            {item.name}
          </Text>
          <Text style={[styles.chatTimestamp, isDark && styles.chatTimestampDark]}>
            {item.timestamp}
          </Text>
        </View>
        
        <View style={styles.chatFooter}>
          <Text
            style={[styles.chatLastMessage, isDark && styles.chatLastMessageDark]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          
          {item.unreadCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: getChatColor(item.type) }]}>
              <Text style={styles.unreadCount}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
        
        {item.type !== 'individual' && (
          <View style={styles.chatMeta}>
            <Ionicons
              name={getChatIcon(item.type)}
              size={14}
              color={getChatColor(item.type)}
            />
            <Text style={[styles.chatMetaText, isDark && styles.chatMetaTextDark]}>
              {item.members} miembros
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name="chatbubbles-outline"
        size={64}
        color={isDark ? '#666' : '#ccc'}
      />
      <Text style={[styles.emptyStateTitle, isDark && styles.emptyStateTitleDark]}>
        No hay chats aún
      </Text>
      <Text style={[styles.emptyStateSubtitle, isDark && styles.emptyStateSubtitleDark]}>
        Inicia una conversación o únete a una tribu para comenzar a chatear
      </Text>
      <TouchableOpacity
        style={styles.emptyStateButton}
        onPress={handleNewChat}
      >
        <Text style={styles.emptyStateButtonText}>Crear Chat</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Chats</Text>
            <TouchableOpacity
              style={styles.newChatButton}
              onPress={handleNewChat}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Search Bar */}
        <View style={[styles.searchContainer, isDark && styles.searchContainerDark]}>
          <View style={[styles.searchBar, isDark && styles.searchBarDark]}>
            <Ionicons
              name="search"
              size={20}
              color={isDark ? '#ccc' : '#666'}
              style={styles.searchIcon}
            />
            <TextInput
              style={[styles.searchInput, isDark && styles.searchInputDark]}
              placeholder="Buscar chats..."
              placeholderTextColor={isDark ? '#888' : '#999'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={isDark ? '#ccc' : '#666'}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Chats List */}
        <FlatList
          ref={flatListRef}
          data={filteredChats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          style={styles.chatsList}
          contentContainerStyle={styles.chatsListContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
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
  newChatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
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
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    position: 'relative',
  },
  chatAvatarText: {
    fontSize: 24,
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
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  chatNameDark: {
    color: '#fff',
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
    color: '#666',
    flex: 1,
    marginRight: 8,
  },
  chatLastMessageDark: {
    color: '#ccc',
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
  },
  chatMetaText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  chatMetaTextDark: {
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
    marginBottom: 24,
  },
  emptyStateSubtitleDark: {
    color: '#ccc',
  },
  emptyStateButton: {
    backgroundColor: '#667eea',
    borderRadius: 25,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChatScreen;