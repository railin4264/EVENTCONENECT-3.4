import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.eventListeners = new Map();
    this.messageQueue = [];
    this.typingUsers = new Map();
    this.onlineUsers = new Set();
    this.currentChat = null;
    this.authToken = null;
  }

  // Inicializar conexión
  initialize(token, options = {}) {
    if (this.socket) {
      this.disconnect();
    }

    this.authToken = token;

    const socketOptions = {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      auth: {
        token: `Bearer ${token}`,
      },
      query: {
        client: 'web',
        version: '1.0.0',
      },
      ...options,
    };

    this.socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000',
      socketOptions
    );

    this.setupEventListeners();
    this.setupReconnection();

    console.log('🚀 Socket.IO client inicializado');
  }

  // Configurar listeners de eventos
  setupEventListeners() {
    if (!this.socket) return;

    // Conexión establecida
    this.socket.on('connect', () => {
      console.log('✅ Conectado al servidor Socket.IO');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('user_online');

      // Procesar mensajes en cola
      this.processMessageQueue();

      // Notificar cambio de estado
      this.notifyConnectionChange(true);
    });

    // Desconexión
    this.socket.on('disconnect', reason => {
      console.log('❌ Desconectado del servidor:', reason);
      this.isConnected = false;
      this.notifyConnectionChange(false);

      if (reason === 'io server disconnect') {
        // Desconexión iniciada por el servidor
        this.reconnect();
      }
    });

    // Error de conexión
    this.socket.on('connect_error', error => {
      console.error('❌ Error de conexión Socket.IO:', error);
      this.isConnected = false;
      this.notifyConnectionChange(false);

      if (error.message === 'Authentication failed') {
        toast.error(
          'Error de autenticación. Por favor, inicia sesión nuevamente.'
        );
        this.disconnect();
      }
    });

    // Reconexión
    this.socket.on('reconnect', attemptNumber => {
      console.log(`🔄 Reconectado después de ${attemptNumber} intentos`);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('user_online');
      this.notifyConnectionChange(true);

      // Procesar mensajes en cola
      this.processMessageQueue();
    });

    // Error de reconexión
    this.socket.on('reconnect_error', error => {
      console.error('❌ Error de reconexión:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        toast.error('No se pudo reconectar. Verifica tu conexión a internet.');
        this.disconnect();
      }
    });

    // Mensajes del chat
    this.socket.on('new_message', message => {
      console.log('💬 Nuevo mensaje recibido:', message);
      this.handleNewMessage(message);
    });

    this.socket.on('message_updated', data => {
      console.log('✏️ Mensaje actualizado:', data);
      this.handleMessageUpdate(data);
    });

    this.socket.on('message_deleted', data => {
      console.log('🗑️ Mensaje eliminado:', data);
      this.handleMessageDelete(data);
    });

    // Indicadores de escritura
    this.socket.on('user_typing', data => {
      console.log('✍️ Usuario escribiendo:', data);
      this.handleUserTyping(data);
    });

    this.socket.on('user_stopped_typing', data => {
      console.log('⏹️ Usuario dejó de escribir:', data);
      this.handleUserStoppedTyping(data);
    });

    // Estado de usuarios
    this.socket.on('user_status_changed', data => {
      console.log('🔄 Estado de usuario cambiado:', data);
      this.handleUserStatusChange(data);
    });

    this.socket.on('user_online', data => {
      console.log('🟢 Usuario en línea:', data);
      this.handleUserOnline(data);
    });

    this.socket.on('user_offline', data => {
      console.log('🔴 Usuario desconectado:', data);
      this.handleUserOffline(data);
    });

    // Notificaciones
    this.socket.on('notification', notification => {
      console.log('🔔 Notificación recibida:', notification);
      this.handleNotification(notification);
    });

    // Eventos del chat
    this.socket.on('chat_created', data => {
      console.log('✨ Chat creado:', data);
      this.handleChatCreated(data);
    });

    this.socket.on('user_joined_chat', data => {
      console.log('👋 Usuario se unió al chat:', data);
      this.handleUserJoinedChat(data);
    });

    this.socket.on('user_left_chat', data => {
      console.log('👋 Usuario salió del chat:', data);
      this.handleUserLeftChat(data);
    });

    // Errores
    this.socket.on('error', error => {
      console.error('❌ Error del servidor:', error);
      this.handleServerError(error);
    });

    // Respuestas a eventos
    this.socket.on('chat_created_success', data => {
      console.log('✅ Chat creado exitosamente:', data);
      this.handleChatCreatedSuccess(data);
    });

    this.socket.on('search_results', data => {
      console.log('🔍 Resultados de búsqueda:', data);
      this.handleSearchResults(data);
    });

    // Mensajes en cola
    this.socket.on('queued_message', message => {
      console.log('📬 Mensaje en cola recibido:', message);
      this.handleQueuedMessage(message);
    });
  }

  // Configurar reconexión automática
  setupReconnection() {
    if (!this.socket) return;

    this.socket.on('disconnect', () => {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(
          () => {
            this.reconnect();
          },
          this.reconnectDelay * Math.pow(2, this.reconnectAttempts)
        );
      }
    });
  }

  // Conectar manualmente
  connect() {
    if (this.socket && !this.isConnected) {
      this.socket.connect();
    }
  }

  // Desconectar
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.notifyConnectionChange(false);
      console.log('🔌 Socket.IO client desconectado');
    }
  }

  // Reconectar
  reconnect() {
    if (this.socket && this.reconnectAttempts < this.maxReconnectAttempts) {
      console.log(
        `🔄 Intentando reconectar... (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`
      );
      this.socket.connect();
    }
  }

  // Emitir evento
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
      console.log(`📤 Evento emitido: ${event}`, data);
    } else {
      // Agregar a la cola si no está conectado
      this.messageQueue.push({ event, data, timestamp: Date.now() });
      console.log(`📬 Evento agregado a cola: ${event}`);
    }
  }

  // Procesar mensajes en cola
  processMessageQueue() {
    if (this.messageQueue.length === 0) return;

    console.log(
      `📬 Procesando ${this.messageQueue.length} mensajes en cola...`
    );

    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutos

    this.messageQueue = this.messageQueue.filter(item => {
      if (now - item.timestamp > maxAge) {
        console.log(`⏰ Mensaje en cola expirado: ${item.event}`);
        return false;
      }

      if (this.isConnected) {
        this.emit(item.event, item.data);
        return false;
      }

      return true;
    });
  }

  // Unirse a chat
  joinChat(chatId) {
    this.currentChat = chatId;
    this.emit('join_chat', { chatId });
    console.log(`🏠 Unido al chat: ${chatId}`);
  }

  // Salir de chat
  leaveChat(chatId) {
    this.emit('leave_chat', { chatId });
    if (this.currentChat === chatId) {
      this.currentChat = null;
    }
    console.log(`🚪 Salido del chat: ${chatId}`);
  }

  // Enviar mensaje
  sendMessage(
    chatId,
    content,
    type = 'text',
    replyTo = null,
    attachments = []
  ) {
    const messageData = {
      chatId,
      content,
      type,
      replyTo,
      attachments,
      timestamp: new Date().toISOString(),
    };

    this.emit('send_message', messageData);
    console.log(`💬 Mensaje enviado:`, messageData);

    return messageData;
  }

  // Indicar que está escribiendo
  startTyping(chatId) {
    this.emit('typing_start', { chatId });
  }

  // Indicar que dejó de escribir
  stopTyping(chatId) {
    this.emit('typing_stop', { chatId });
  }

  // Marcar mensajes como leídos
  markMessagesAsRead(chatId, messageIds) {
    this.emit('mark_read', { chatId, messageIds });
  }

  // Reaccionar a mensaje
  reactToMessage(chatId, messageId, reaction) {
    this.emit('react_to_message', { chatId, messageId, reaction });
  }

  // Pin/Unpin mensaje
  pinMessage(chatId, messageId, pin = true) {
    this.emit('pin_message', { chatId, messageId, pin });
  }

  // Buscar mensajes
  searchMessages(chatId, query, limit = 50) {
    this.emit('search_messages', { chatId, query, limit });
  }

  // Crear chat
  createChat(
    type,
    participants,
    name = null,
    description = null,
    isPrivate = false
  ) {
    const chatData = {
      type,
      participants,
      name,
      description,
      isPrivate,
    };

    this.emit('create_chat', chatData);
    console.log(`✨ Creando chat:`, chatData);

    return chatData;
  }

  // Invitar usuario a chat
  inviteUserToChat(chatId, userId) {
    this.emit('invite_user', { chatId, userId });
  }

  // Remover usuario de chat
  removeUserFromChat(chatId, userId) {
    this.emit('remove_user', { chatId, userId });
  }

  // Actualizar configuración del chat
  updateChatSettings(chatId, settings) {
    this.emit('update_chat_settings', { chatId, settings });
  }

  // Heartbeat
  ping() {
    this.emit('ping');
  }

  // Manejadores de eventos
  handleNewMessage(message) {
    // Notificar a los listeners
    this.notifyListeners('new_message', message);

    // Mostrar notificación si no está en el chat actual
    if (this.currentChat !== message.chatId) {
      this.showMessageNotification(message);
    }
  }

  handleMessageUpdate(data) {
    this.notifyListeners('message_updated', data);
  }

  handleMessageDelete(data) {
    this.notifyListeners('message_deleted', data);
  }

  handleUserTyping(data) {
    this.typingUsers.set(data.chatId, data.userId);
    this.notifyListeners('user_typing', data);
  }

  handleUserStoppedTyping(data) {
    this.typingUsers.delete(data.chatId);
    this.notifyListeners('user_stopped_typing', data);
  }

  handleUserStatusChange(data) {
    if (data.status === 'online') {
      this.onlineUsers.add(data.userId);
    } else {
      this.onlineUsers.delete(data.userId);
    }

    this.notifyListeners('user_status_changed', data);
  }

  handleUserOnline(data) {
    this.onlineUsers.add(data.userId);
    this.notifyListeners('user_online', data);
  }

  handleUserOffline(data) {
    this.onlineUsers.delete(data.userId);
    this.notifyListeners('user_offline', data);
  }

  handleNotification(notification) {
    this.notifyListeners('notification', notification);

    // Mostrar toast
    if (notification.type === 'success') {
      toast.success(notification.message);
    } else if (notification.type === 'error') {
      toast.error(notification.message);
    } else if (notification.type === 'warning') {
      toast.error(notification.message);
    } else {
      toast(notification.message);
    }
  }

  handleChatCreated(data) {
    this.notifyListeners('chat_created', data);
  }

  handleUserJoinedChat(data) {
    this.notifyListeners('user_joined_chat', data);
  }

  handleUserLeftChat(data) {
    this.notifyListeners('user_left_chat', data);
  }

  handleServerError(error) {
    this.notifyListeners('error', error);

    if (error.message) {
      toast.error(`Error del servidor: ${error.message}`);
    }
  }

  handleChatCreatedSuccess(data) {
    this.notifyListeners('chat_created_success', data);
  }

  handleSearchResults(data) {
    this.notifyListeners('search_results', data);
  }

  handleQueuedMessage(message) {
    this.notifyListeners('queued_message', message);
  }

  // Mostrar notificación de mensaje
  showMessageNotification(message) {
    const { sender, content, chatId } = message;

    // Crear notificación del navegador si está disponible
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(
        `Nuevo mensaje de ${sender.firstName}`,
        {
          body: content,
          icon: sender.avatar || '/images/user-avatar.jpg',
          tag: `chat-${chatId}`,
          requireInteraction: false,
          silent: false,
        }
      );

      notification.onclick = () => {
        window.focus();
        notification.close();
        // Navegar al chat
        window.location.href = `/chat/${chatId}`;
      };
    }
  }

  // Sistema de listeners
  addEventListener(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(callback);
  }

  removeEventListener(event, callback) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).delete(callback);
    }
  }

  notifyListeners(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error en listener de ${event}:`, error);
        }
      });
    }
  }

  // Notificar cambio de conexión
  notifyConnectionChange(isConnected) {
    this.notifyListeners('connection_change', { isConnected });
  }

  // Getters
  get connectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
    };
  }

  get currentChatId() {
    return this.currentChat;
  }

  get typingUsersList() {
    return Array.from(this.typingUsers.values());
  }

  get onlineUsersList() {
    return Array.from(this.onlineUsers);
  }

  get messageQueueLength() {
    return this.messageQueue.length;
  }

  // Limpiar recursos
  cleanup() {
    this.disconnect();
    this.eventListeners.clear();
    this.messageQueue = [];
    this.typingUsers.clear();
    this.onlineUsers.clear();
    this.currentChat = null;
    this.authToken = null;

    console.log('🧹 Socket.IO client limpiado');
  }
}

// Crear instancia singleton
const socketService = new SocketService();

export default socketService;
