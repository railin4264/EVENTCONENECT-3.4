import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Send, Image, Camera, Paperclip, Mic, MoreVertical } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';

const { width, height } = Dimensions.get('window');

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    username: string;
    avatar?: string;
  };
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'audio';
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
  isRead: boolean;
}

interface ChatRoom {
  _id: string;
  participants: Array<{
    _id: string;
    username: string;
    avatar?: string;
    isOnline: boolean;
  }>;
  lastMessage?: Message;
  unreadCount: number;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
}

export default function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  // Mock chat room data - in real app this would come from route params
  const chatRoomId = route.params?.chatRoomId || 'mock-chat-room';
  const isGroupChat = route.params?.isGroupChat || false;

  // Fetch chat messages
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['chat-messages', chatRoomId],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/api/chat/${chatRoomId}/messages`);
        return response.data.messages || [];
      } catch (error) {
        console.error('Error fetching messages:', error);
        // Return mock data for development
        return generateMockMessages();
      }
    },
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });

  // Fetch chat room info
  const { data: chatRoom } = useQuery({
    queryKey: ['chat-room', chatRoomId],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/api/chat/${chatRoomId}`);
        return response.data.chatRoom;
      } catch (error) {
        console.error('Error fetching chat room:', error);
        // Return mock data for development
        return generateMockChatRoom();
      }
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { content: string; type: string; mediaUrl?: string }) => {
      const response = await apiClient.post(`/api/chat/${chatRoomId}/messages`, messageData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', chatRoomId] });
      setMessage('');
      inputRef.current?.focus();
    },
    onError: (error) => {
      Alert.alert('Error', 'No se pudo enviar el mensaje');
      console.error('Error sending message:', error);
    },
  });

  // Generate mock data for development
  const generateMockMessages = (): Message[] => {
    const mockMessages: Message[] = [];
    const mockUsers = [
      { _id: '1', username: 'usuario1', avatar: undefined },
      { _id: '2', username: 'usuario2', avatar: undefined },
    ];

    for (let i = 0; i < 20; i++) {
      const isOwnMessage = i % 2 === 0;
      const sender = isOwnMessage ? mockUsers[0] : mockUsers[1];
      
      mockMessages.push({
        _id: `msg-${i}`,
        content: `Este es un mensaje de ejemplo número ${i + 1}. Puede ser bastante largo para probar el diseño de la interfaz.`,
        sender,
        timestamp: new Date(Date.now() - i * 60000).toISOString(),
        type: 'text',
        isRead: i < 15,
      });
    }

    return mockMessages.reverse();
  };

  const generateMockChatRoom = (): ChatRoom => ({
    _id: chatRoomId,
    participants: [
      { _id: '1', username: 'usuario1', avatar: undefined, isOnline: true },
      { _id: '2', username: 'usuario2', avatar: undefined, isOnline: false },
    ],
    lastMessage: {
      _id: 'last',
      content: 'Último mensaje del chat',
      sender: { _id: '1', username: 'usuario1', avatar: undefined },
      timestamp: new Date().toISOString(),
      type: 'text',
      isRead: false,
    },
    unreadCount: 3,
    isGroup: isGroupChat,
    groupName: isGroupChat ? 'Grupo de Eventos' : undefined,
  });

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessageMutation.mutate({
        content: message.trim(),
        type: 'text',
      });
    }
  };

  const handleAttachment = () => {
    Alert.alert(
      'Adjuntar Archivo',
      'Selecciona el tipo de archivo',
      [
        { text: 'Imagen', onPress: () => Alert.alert('Info', 'Función de imagen en desarrollo') },
        { text: 'Documento', onPress: () => Alert.alert('Info', 'Función de documento en desarrollo') },
        { text: 'Audio', onPress: () => Alert.alert('Info', 'Función de audio en desarrollo') },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const handleVoiceMessage = () => {
    Alert.alert('Info', 'Función de mensaje de voz en desarrollo');
  };

  const handleMessageLongPress = (messageId: string) => {
    if (isSelectionMode) {
      setSelectedMessages(prev => 
        prev.includes(messageId) 
          ? prev.filter(id => id !== messageId)
          : [...prev, messageId]
      );
    } else {
      setIsSelectionMode(true);
      setSelectedMessages([messageId]);
    }
  };

  const handleMessagePress = (messageId: string) => {
    if (isSelectionMode) {
      handleMessageLongPress(messageId);
    }
  };

  const cancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedMessages([]);
  };

  const deleteSelectedMessages = () => {
    Alert.alert(
      'Eliminar Mensajes',
      `¿Estás seguro de que quieres eliminar ${selectedMessages.length} mensaje(s)?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => {
          Alert.alert('Info', 'Función de eliminación en desarrollo');
          cancelSelection();
        }},
      ]
    );
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwnMessage = item.sender._id === user?._id;
    const showAvatar = !isOwnMessage && (index === 0 || messages[index - 1]?.sender._id !== item.sender._id);
    const showTimestamp = index === messages.length - 1 || 
      new Date(item.timestamp).getTime() - new Date(messages[index + 1]?.timestamp).getTime() > 300000; // 5 minutes

    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
      ]}>
        {showAvatar && (
          <View style={styles.avatarContainer}>
            {item.sender.avatar ? (
              <Image source={{ uri: item.sender.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>
                  {item.sender.username.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        )}
        
        <TouchableOpacity
          style={[
            styles.messageBubble,
            isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
            isSelectionMode && selectedMessages.includes(item._id) && styles.selectedMessage,
            { backgroundColor: isOwnMessage ? colors.primary : colors.surface }
          ]}
          onPress={() => handleMessagePress(item._id)}
          onLongPress={() => handleMessageLongPress(item._id)}
          delayLongPress={500}
        >
          {!isOwnMessage && showAvatar && (
            <Text style={[styles.senderName, { color: colors.textSecondary }]}>
              {item.sender.username}
            </Text>
          )}
          
          <Text style={[
            styles.messageText,
            { color: isOwnMessage ? 'white' : colors.text }
          ]}>
            {item.content}
          </Text>
          
          {showTimestamp && (
            <View style={styles.messageFooter}>
              <Text style={[
                styles.timestamp,
                { color: isOwnMessage ? 'rgba(255,255,255,0.7)' : colors.textSecondary }
              ]}>
                {new Date(item.timestamp).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
              
              {isOwnMessage && (
                <View style={styles.readStatus}>
                  <Ionicons
                    name={item.isRead ? 'checkmark-done' : 'checkmark'}
                    size={14}
                    color={item.isRead ? '#4CAF50' : 'rgba(255,255,255,0.7)'}
                  />
                </View>
              )}
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.chatInfo}
        onPress={() => Alert.alert('Info', 'Información del chat en desarrollo')}
      >
        {chatRoom?.isGroup && chatRoom.groupAvatar ? (
          <Image source={{ uri: chatRoom.groupAvatar }} style={styles.chatAvatar} />
        ) : chatRoom?.isGroup ? (
          <View style={[styles.chatAvatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.chatAvatarText}>G</Text>
          </View>
        ) : chatRoom?.participants?.[0]?.avatar ? (
          <Image source={{ uri: chatRoom.participants[0].avatar }} style={styles.chatAvatar} />
        ) : (
          <View style={[styles.chatAvatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.chatAvatarText}>
              {chatRoom?.isGroup 
                ? 'G' 
                : chatRoom?.participants?.[0]?.username?.charAt(0)?.toUpperCase() || 'U'
              }
            </Text>
          </View>
        )}
        
        <View style={styles.chatDetails}>
          <Text style={[styles.chatName, { color: colors.text }]}>
            {chatRoom?.isGroup 
              ? chatRoom.groupName || 'Grupo'
              : chatRoom?.participants?.[0]?.username || 'Usuario'
            }
          </Text>
          <Text style={[styles.chatStatus, { color: colors.textSecondary }]}>
            {chatRoom?.isGroup 
              ? `${chatRoom.participants?.length || 0} miembros`
              : chatRoom?.participants?.[0]?.isOnline ? 'En línea' : 'Desconectado'
            }
          </Text>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.moreButton}
        onPress={() => Alert.alert('Info', 'Opciones del chat en desarrollo')}
      >
        <MoreVertical size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );

  const renderSelectionToolbar = () => (
    isSelectionMode && (
      <View style={[styles.selectionToolbar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={cancelSelection} style={styles.toolbarButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={[styles.selectionCount, { color: colors.text }]}>
          {selectedMessages.length} seleccionado(s)
        </Text>
        
        <View style={styles.toolbarActions}>
          <TouchableOpacity
            style={[styles.toolbarActionButton, { backgroundColor: colors.error }]}
            onPress={deleteSelectedMessages}
          >
            <Ionicons name="trash" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    )
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      {renderSelectionToolbar()}
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        inverted
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          // Load more messages when scrolling to top
        }}
        onEndReachedThreshold={0.1}
      />
      
      {isTyping && (
        <View style={styles.typingIndicator}>
          <Text style={[styles.typingText, { color: colors.textSecondary }]}>
            {chatRoom?.isGroup ? 'Alguien está escribiendo...' : 'Está escribiendo...'}
          </Text>
        </View>
      )}
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity
            style={styles.attachmentButton}
            onPress={handleAttachment}
          >
            <Paperclip size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TextInput
            ref={inputRef}
            style={[styles.textInput, { color: colors.text }]}
            placeholder="Escribe un mensaje..."
            placeholderTextColor={colors.textSecondary}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={1000}
            onFocus={() => setIsTyping(true)}
            onBlur={() => setIsTyping(false)}
          />
          
          {message.trim() ? (
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: colors.primary }]}
              onPress={handleSendMessage}
            >
              <Send size={20} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.voiceButton}
              onPress={handleVoiceMessage}
            >
              <Mic size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  chatInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chatAvatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatDetails: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  chatStatus: {
    fontSize: 12,
  },
  moreButton: {
    padding: 8,
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
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
    marginTop: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  messageBubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
  },
  ownMessageBubble: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 20,
  },
  selectedMessage: {
    opacity: 0.7,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  senderName: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 4,
  },
  timestamp: {
    fontSize: 11,
  },
  readStatus: {
    marginLeft: 4,
  },
  typingIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
  },
  attachmentButton: {
    padding: 8,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    padding: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  voiceButton: {
    padding: 8,
    marginLeft: 8,
  },
});
