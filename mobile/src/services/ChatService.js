import { io } from 'socket.io-client';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, SOCKET_BASE_URL } from './apiClient';

// Configuración de la API
const API_URL = API_BASE_URL;
const SOCKET_URL = SOCKET_BASE_URL;

class ChatService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.chats = [];
    this.listeners = [];
    this.messageListeners = [];
    this.currentUser = null;
    this.retryCount = 0;
    this.maxRetries = 5;
    this.reconnectTimeout = null;
  }

  // ==========================================
  // CONFIGURACIÓN DE SOCKET
  // ==========================================

  async initializeSocket(userId, userToken) {
    try {
      if (this.socket) {
        this.socket.disconnect();
      }

      this.currentUser = userId;
      
      this.socket = io(SOCKET_URL, {
        auth: {
          token: userToken,
          userId: userId
        },
        transports: ['websocket'],
        timeout: 10000,
        forceNew: true,
      });

      this.setupSocketListeners();
      
      console.log('Socket.IO initialized');
      return true;
    } catch (error) {
      console.error('Error initializing socket:', error);
      return false;
    }
  }

  setupSocketListeners() {
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.isConnected = true;
      this.retryCount = 0;
      this.notifyListeners('socket_connected');
      
      // Join user to their personal room
      this.socket.emit('join_user_room', this.currentUser);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
      this.notifyListeners('socket_disconnected', reason);
      
      // Auto-reconnect logic
      if (reason === 'io server disconnect') {
        // Server disconnected, manual reconnection needed
        this.attemptReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.notifyListeners('socket_error', error);
      this.attemptReconnect();
    });

    // ==========================================
    // EVENTOS DE CHAT
    // ==========================================

    this.socket.on('new_message', (data) => {
      console.log('New message received:', data);
      this.handleNewMessage(data);
    });

    this.socket.on('message_sent', (data) => {
      console.log('Message sent confirmation:', data);
      this.handleMessageSent(data);
    });

    this.socket.on('message_delivered', (data) => {
      console.log('Message delivered:', data);
      this.handleMessageDelivered(data);
    });

    this.socket.on('message_read', (data) => {
      console.log('Message read:', data);
      this.handleMessageRead(data);
    });

    this.socket.on('typing_start', (data) => {
      this.notifyMessageListeners('typing_start', data);
    });

    this.socket.on('typing_stop', (data) => {
      this.notifyMessageListeners('typing_stop', data);
    });

    this.socket.on('user_online', (data) => {
      console.log('User online:', data);
      this.handleUserStatusChange(data.userId, true);
    });

    this.socket.on('user_offline', (data) => {
      console.log('User offline:', data);
      this.handleUserStatusChange(data.userId, false);
    });

    this.socket.on('chat_created', (data) => {
      console.log('New chat created:', data);
      this.handleChatCreated(data);
    });

    this.socket.on('chat_updated', (data) => {
      console.log('Chat updated:', data);
      this.handleChatUpdated(data);
    });

    this.socket.on('user_joined_chat', (data) => {
      console.log('User joined chat:', data);
      this.handleUserJoinedChat(data);
    });

    this.socket.on('user_left_chat', (data) => {
      console.log('User left chat:', data);
      this.handleUserLeftChat(data);
    });
  }

  attemptReconnect() {
    if (this.retryCount >= this.maxRetries) {
      console.log('Max reconnection attempts reached');
      return;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    const delay = Math.min(1000 * Math.pow(2, this.retryCount), 30000); // Exponential backoff
    
    this.reconnectTimeout = setTimeout(() => {
      console.log(`Attempting to reconnect (${this.retryCount + 1}/${this.maxRetries})`);
      this.retryCount++;
      this.socket.connect();
    }, delay);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  // ==========================================
  // GESTIÓN DE CHATS
  // ==========================================

  async getChats(page = 1, limit = 20) {
    try {
      const response = await axios.get(`${API_URL}/chat/conversations`, {
        params: { page, limit }
      });
      
      this.chats = response.data.data || [];
      this.notifyListeners('chats_updated', this.chats);
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo chats');
    }
  }

  async getChatById(chatId) {
    try {
      const response = await axios.get(`${API_URL}/chat/${chatId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo chat');
    }
  }

  async createChat(participantIds, chatType = 'private', chatName = null) {
    try {
      const response = await axios.post(`${API_URL}/chat/create`, {
        participants: participantIds,
        type: chatType,
        name: chatName
      });
      
      const newChat = response.data.data;
      
      // Join the socket room for this chat
      if (this.socket) {
        this.socket.emit('join_chat', newChat._id);
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error creando chat');
    }
  }

  async joinChat(chatId) {
    try {
      const response = await axios.post(`${API_URL}/chat/${chatId}/join`);
      
      // Join the socket room
      if (this.socket) {
        this.socket.emit('join_chat', chatId);
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error uniéndose al chat');
    }
  }

  async leaveChat(chatId) {
    try {
      const response = await axios.post(`${API_URL}/chat/${chatId}/leave`);
      
      // Leave the socket room
      if (this.socket) {
        this.socket.emit('leave_chat', chatId);
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error saliendo del chat');
    }
  }

  // ==========================================
  // GESTIÓN DE MENSAJES
  // ==========================================

  async getMessages(chatId, page = 1, limit = 50) {
    try {
      const response = await axios.get(`${API_URL}/chat/${chatId}/messages`, {
        params: { page, limit }
      });
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo mensajes');
    }
  }

  async sendMessage(chatId, content, messageType = 'text', attachments = []) {
    try {
      const messageData = {
        chatId,
        content,
        type: messageType,
        attachments,
        tempId: Date.now().toString(), // Temporary ID for optimistic updates
      };

      // Optimistic update
      this.notifyMessageListeners('message_sending', messageData);

      // Send via socket for real-time delivery
      if (this.socket && this.isConnected) {
        this.socket.emit('send_message', messageData);
      } else {
        // Fallback to HTTP API if socket is not connected
        const response = await axios.post(`${API_URL}/chat/${chatId}/messages`, {
          content,
          type: messageType,
          attachments
        });
        
        this.notifyMessageListeners('message_sent', response.data.data);
        return response.data;
      }
    } catch (error) {
      this.notifyMessageListeners('message_error', { 
        error: error.message,
        chatId,
        content 
      });
      throw new Error(error.response?.data?.message || 'Error enviando mensaje');
    }
  }

  async editMessage(messageId, newContent) {
    try {
      const response = await axios.put(`${API_URL}/chat/messages/${messageId}`, {
        content: newContent
      });
      
      // Emit socket event for real-time update
      if (this.socket) {
        this.socket.emit('message_edited', {
          messageId,
          content: newContent
        });
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error editando mensaje');
    }
  }

  async deleteMessage(messageId) {
    try {
      const response = await axios.delete(`${API_URL}/chat/messages/${messageId}`);
      
      // Emit socket event for real-time update
      if (this.socket) {
        this.socket.emit('message_deleted', { messageId });
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error eliminando mensaje');
    }
  }

  async markMessageAsRead(messageId) {
    try {
      const response = await axios.put(`${API_URL}/chat/messages/${messageId}/read`);
      
      // Emit socket event for real-time update
      if (this.socket) {
        this.socket.emit('message_read', { messageId });
      }
      
      return response.data;
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }

  async markChatAsRead(chatId) {
    try {
      const response = await axios.put(`${API_URL}/chat/${chatId}/read`);
      
      // Emit socket event for real-time update
      if (this.socket) {
        this.socket.emit('chat_read', { chatId });
      }
      
      return response.data;
    } catch (error) {
      console.error('Error marking chat as read:', error);
    }
  }

  // ==========================================
  // INDICADORES DE ESCRITURA
  // ==========================================

  startTyping(chatId) {
    if (this.socket) {
      this.socket.emit('start_typing', { chatId });
    }
  }

  stopTyping(chatId) {
    if (this.socket) {
      this.socket.emit('stop_typing', { chatId });
    }
  }

  // ==========================================
  // ARCHIVOS Y MEDIA
  // ==========================================

  async uploadChatMedia(file, chatId) {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.type,
        name: file.name,
      });
      formData.append('chatId', chatId);

      const response = await axios.post(`${API_URL}/chat/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error subiendo archivo');
    }
  }

  // ==========================================
  // MANEJADORES DE EVENTOS
  // ==========================================

  handleNewMessage(data) {
    // Update local chat list
    this.updateChatWithNewMessage(data.chatId, data.message);
    
    // Notify listeners
    this.notifyMessageListeners('new_message', data);
    this.notifyListeners('chat_updated', data.chatId);
    
    // Store message locally for offline access
    this.storeMessageLocally(data.message);
  }

  handleMessageSent(data) {
    this.notifyMessageListeners('message_sent', data);
    
    // Update the message status in local storage
    this.updateMessageStatus(data.tempId || data.messageId, 'sent');
  }

  handleMessageDelivered(data) {
    this.notifyMessageListeners('message_delivered', data);
    this.updateMessageStatus(data.messageId, 'delivered');
  }

  handleMessageRead(data) {
    this.notifyMessageListeners('message_read', data);
    this.updateMessageStatus(data.messageId, 'read');
  }

  handleUserStatusChange(userId, isOnline) {
    // Update user status in chats
    this.chats = this.chats.map(chat => {
      if (chat.participants && chat.participants.some(p => p._id === userId)) {
        const updatedParticipants = chat.participants.map(p =>
          p._id === userId ? { ...p, isOnline } : p
        );
        return { ...chat, participants: updatedParticipants };
      }
      return chat;
    });
    
    this.notifyListeners('user_status_changed', { userId, isOnline });
  }

  handleChatCreated(data) {
    this.chats.unshift(data.chat);
    this.notifyListeners('chat_created', data.chat);
  }

  handleChatUpdated(data) {
    const chatIndex = this.chats.findIndex(chat => chat._id === data.chatId);
    if (chatIndex !== -1) {
      this.chats[chatIndex] = { ...this.chats[chatIndex], ...data.updates };
      this.notifyListeners('chat_updated', this.chats[chatIndex]);
    }
  }

  handleUserJoinedChat(data) {
    this.notifyMessageListeners('user_joined', data);
  }

  handleUserLeftChat(data) {
    this.notifyMessageListeners('user_left', data);
  }

  // ==========================================
  // UTILIDADES LOCALES
  // ==========================================

  updateChatWithNewMessage(chatId, message) {
    const chatIndex = this.chats.findIndex(chat => chat._id === chatId);
    if (chatIndex !== -1) {
      this.chats[chatIndex].lastMessage = message;
      this.chats[chatIndex].lastMessageTime = message.createdAt;
      this.chats[chatIndex].unreadCount = (this.chats[chatIndex].unreadCount || 0) + 1;
      
      // Move chat to top
      const chat = this.chats.splice(chatIndex, 1)[0];
      this.chats.unshift(chat);
    }
  }

  async storeMessageLocally(message) {
    try {
      const key = `messages_${message.chatId}`;
      const storedMessages = await AsyncStorage.getItem(key);
      const messages = storedMessages ? JSON.parse(storedMessages) : [];
      
      messages.unshift(message);
      
      // Keep only last 100 messages per chat
      if (messages.length > 100) {
        messages.splice(100);
      }
      
      await AsyncStorage.setItem(key, JSON.stringify(messages));
    } catch (error) {
      console.error('Error storing message locally:', error);
    }
  }

  async getStoredMessages(chatId) {
    try {
      const key = `messages_${chatId}`;
      const storedMessages = await AsyncStorage.getItem(key);
      return storedMessages ? JSON.parse(storedMessages) : [];
    } catch (error) {
      console.error('Error getting stored messages:', error);
      return [];
    }
  }

  updateMessageStatus(messageId, status) {
    // This would update the message status in the UI
    this.notifyMessageListeners('message_status_updated', {
      messageId,
      status
    });
  }

  // ==========================================
  // SISTEMA DE EVENTOS
  // ==========================================

  addListener(callback) {
    this.listeners.push(callback);
    
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  addMessageListener(callback) {
    this.messageListeners.push(callback);
    
    return () => {
      this.messageListeners = this.messageListeners.filter(listener => listener !== callback);
    };
  }

  notifyListeners(event, data) {
    this.listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Error in chat listener:', error);
      }
    });
  }

  notifyMessageListeners(event, data) {
    this.messageListeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Error in message listener:', error);
      }
    });
  }

  // ==========================================
  // BÚSQUEDA
  // ==========================================

  async searchChats(query) {
    try {
      const response = await axios.get(`${API_URL}/chat/search`, {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error buscando chats');
    }
  }

  async searchMessages(chatId, query) {
    try {
      const response = await axios.get(`${API_URL}/chat/${chatId}/search`, {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error buscando mensajes');
    }
  }

  // ==========================================
  // LIMPIEZA
  // ==========================================

  cleanup() {
    this.disconnect();
    this.listeners = [];
    this.messageListeners = [];
    this.chats = [];
  }

  // ==========================================
  // ESTADO DEL SERVICIO
  // ==========================================

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id,
      retryCount: this.retryCount,
    };
  }

  getChats() {
    return this.chats;
  }

  getChatById(chatId) {
    return this.chats.find(chat => chat._id === chatId);
  }
}

// Exportar instancia única
const chatService = new ChatService();
export default chatService;






