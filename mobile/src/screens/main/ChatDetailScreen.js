import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Send,
  Plus,
  Image as ImageIcon,
  Camera,
  Mic,
  ArrowLeft,
  MoreVertical,
  Phone,
  Video,
  Info
} from 'lucide-react-native';

import chatService from '../../services/ChatService';
import { useAuth } from '../../contexts/AuthContext';

const ChatDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { chatId, chatName, participants } = route.params;
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  
  const flatListRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    loadMessages();
    setupRealTimeListeners();
    
    return () => {
      chatService.cleanup();
    };
  }, [chatId]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await chatService.getMessages(chatId);
      setMessages(response.data || []);
      
      // Mark chat as read
      await chatService.markChatAsRead(chatId);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los mensajes');
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealTimeListeners = () => {
    // Listen for new messages
    chatService.onNewMessage((message) => {
      if (message.chatId === chatId) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
    });

    // Listen for typing indicators
    chatService.onTyping((data) => {
      if (data.chatId === chatId && data.userId !== user.id) {
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.userId !== data.userId);
          if (data.isTyping) {
            return [...filtered, data];
          }
          return filtered;
        });
      }
    });

    // Listen for message status updates
    chatService.onMessageStatus((data) => {
      if (data.chatId === chatId) {
        setMessages(prev => prev.map(msg => 
          msg._id === data.messageId 
            ? { ...msg, status: data.status, readBy: data.readBy }
            : msg
        ));
      }
    });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    try {
      const tempMessage = {
        _id: Date.now().toString(),
        content: messageText,
        sender: user,
        createdAt: new Date().toISOString(),
        status: 'sending',
        type: 'text'
      };

      setMessages(prev => [...prev, tempMessage]);
      scrollToBottom();

      const response = await chatService.sendMessage(chatId, {
        content: messageText,
        type: 'text'
      });

      // Update temp message with real data
      setMessages(prev => prev.map(msg => 
        msg._id === tempMessage._id ? response.data : msg
      ));

    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar el mensaje');
      // Remove failed message
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = (text) => {
    setNewMessage(text);
    
    if (!isTyping && text.length > 0) {
      setIsTyping(true);
      chatService.emitTyping(chatId, true);
    }

    // Clear previous timeout
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    // Set new timeout
    typingTimeout.current = setTimeout(() => {
      setIsTyping(false);
      chatService.emitTyping(chatId, false);
    }, 1000);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    return date.toLocaleDateString('es-ES', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessage = ({ item: message, index }) => {
    const isOwnMessage = message.sender?._id === user.id || message.sender?.id === user.id;
    const showAvatar = !isOwnMessage && (
      index === messages.length - 1 || 
      messages[index + 1]?.sender?._id !== message.sender?._id
    );

    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
      ]}>
        {showAvatar && !isOwnMessage && (
          <Image 
            source={{ 
              uri: message.sender?.profilePicture || 
                   `https://ui-avatars.com/api/?name=${message.sender?.name}&background=67e8f9&color=fff`
            }}
            style={styles.messageAvatar}
          />
        )}
        
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
        ]}>
          {!isOwnMessage && message.sender?.name && (
            <Text style={styles.senderName}>{message.sender.name}</Text>
          )}
          
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {message.content}
          </Text>
          
          <View style={styles.messageFooter}>
            <Text style={[
              styles.messageTime,
              isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime
            ]}>
              {formatMessageTime(message.createdAt)}
            </Text>
            
            {isOwnMessage && (
              <View style={styles.messageStatus}>
                {message.status === 'sending' && <Text style={styles.statusIcon}>⏳</Text>}
                {message.status === 'sent' && <Text style={styles.statusIcon}>✓</Text>}
                {message.status === 'delivered' && <Text style={styles.statusIcon}>✓✓</Text>}
                {message.status === 'read' && <Text style={styles.statusIconRead}>✓✓</Text>}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;

    const typingText = typingUsers.length === 1 
      ? `${typingUsers[0].userName} está escribiendo...`
      : `${typingUsers.length} personas están escribiendo...`;

    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingBubble}>
          <Text style={styles.typingText}>{typingText}</Text>
          <View style={styles.typingDots}>
            <View style={[styles.typingDot, styles.typingDot1]} />
            <View style={[styles.typingDot, styles.typingDot2]} />
            <View style={[styles.typingDot, styles.typingDot3]} />
          </View>
        </View>
      </View>
    );
  };

  const renderAttachmentOptions = () => {
    if (!showAttachmentOptions) return null;

    return (
      <View style={styles.attachmentOptions}>
        <TouchableOpacity style={styles.attachmentOption}>
          <Camera size={24} color="#67e8f9" />
          <Text style={styles.attachmentOptionText}>Cámara</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.attachmentOption}>
          <ImageIcon size={24} color="#67e8f9" />
          <Text style={styles.attachmentOptionText}>Galería</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.attachmentOption}>
          <Mic size={24} color="#67e8f9" />
          <Text style={styles.attachmentOptionText}>Audio</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0f0f23', '#1a1a2e', '#16213e']}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.chatInfo}
          onPress={() => navigation.navigate('ChatInfo', { chatId, participants })}
        >
          <Image 
            source={{ 
              uri: participants?.length === 2 
                ? `https://ui-avatars.com/api/?name=${chatName}&background=67e8f9&color=fff`
                : `https://ui-avatars.com/api/?name=${chatName}&background=7c3aed&color=fff`
            }}
            style={styles.headerAvatar}
          />
          <View style={styles.chatDetails}>
            <Text style={styles.chatTitle} numberOfLines={1}>{chatName}</Text>
            <Text style={styles.chatSubtitle}>
              {participants?.length > 2 ? `${participants.length} miembros` : 'En línea'}
            </Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerAction}>
            <Phone size={20} color="#ffffff" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerAction}>
            <Video size={20} color="#ffffff" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerAction}>
            <MoreVertical size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Messages */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#67e8f9" />
            <Text style={styles.loadingText}>Cargando mensajes...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item._id}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={scrollToBottom}
          />
        )}

        {renderTypingIndicator()}
        {renderAttachmentOptions()}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={styles.attachButton}
            onPress={() => setShowAttachmentOptions(!showAttachmentOptions)}
          >
            <Plus size={24} color="#67e8f9" />
          </TouchableOpacity>
          
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Escribe un mensaje..."
              placeholderTextColor="#6b7280"
              value={newMessage}
              onChangeText={handleTyping}
              multiline
              maxLength={1000}
            />
          </View>
          
          <TouchableOpacity 
            style={[
              styles.sendButton,
              (!newMessage.trim() || isSending) && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Send size={20} color="#ffffff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
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
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  chatDetails: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  chatSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAction: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-end',
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '70%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  ownMessageBubble: {
    backgroundColor: '#67e8f9',
    borderBottomRightRadius: 8,
  },
  otherMessageBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: 8,
  },
  senderName: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
    fontWeight: '500',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#0a0a0a',
  },
  otherMessageText: {
    color: '#ffffff',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 12,
  },
  ownMessageTime: {
    color: 'rgba(10, 10, 10, 0.6)',
  },
  otherMessageTime: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  messageStatus: {
    marginLeft: 8,
  },
  statusIcon: {
    color: 'rgba(10, 10, 10, 0.6)',
    fontSize: 12,
  },
  statusIconRead: {
    color: '#10b981',
    fontSize: 12,
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  typingText: {
    fontSize: 14,
    color: '#9ca3af',
    marginRight: 8,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#67e8f9',
    marginHorizontal: 2,
  },
  typingDot1: {
    opacity: 0.4,
  },
  typingDot2: {
    opacity: 0.7,
  },
  typingDot3: {
    opacity: 1,
  },
  attachmentOptions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  attachmentOption: {
    alignItems: 'center',
    marginRight: 24,
  },
  attachmentOptionText: {
    fontSize: 12,
    color: '#67e8f9',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  attachButton: {
    padding: 12,
    marginRight: 8,
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  textInput: {
    color: '#ffffff',
    fontSize: 16,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#67e8f9',
    borderRadius: 20,
    padding: 12,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(103, 232, 249, 0.3)',
  },
});

export default ChatDetailScreen;









