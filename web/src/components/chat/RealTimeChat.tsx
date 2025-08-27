'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { io, Socket } from 'socket.io-client';
import { 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  Video, 
  File, 
  Smile,
  MoreHorizontal,
  Search,
  Phone,
  Video as VideoIcon,
  UserPlus,
  Settings,
  Trash2,
  Block,
  Report,
  Archive,
  Pin,
  Edit,
  Copy,
  Download,
  Eye,
  EyeOff,
  Lock,
  Globe,
  Users,
  Crown,
  Shield,
  Check,
  X,
  Clock,
  MapPin,
  Calendar,
  MessageCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ChatMessage {
  id: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'file' | 'location' | 'event';
  sender: {
    id: string;
    username: string;
    avatar?: string;
    isOnline: boolean;
    role: 'user' | 'moderator' | 'admin' | 'owner';
  };
  timestamp: string;
  isEdited: boolean;
  isDeleted: boolean;
  reactions: {
    [key: string]: string[]; // emoji: [userId1, userId2, ...]
  };
  replyTo?: {
    id: string;
    content: string;
    sender: string;
  };
  attachments?: {
    url: string;
    name: string;
    size: number;
    type: string;
  }[];
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  event?: {
    id: string;
    title: string;
    date: string;
    location: string;
  };
}

interface ChatRoom {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'tribe' | 'event';
  avatar?: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
  isOnline: boolean;
  participants: {
    id: string;
    username: string;
    avatar?: string;
    isOnline: boolean;
    role: 'user' | 'moderator' | 'admin' | 'owner';
    lastSeen?: string;
  }[];
  settings: {
    isPrivate: boolean;
    allowInvites: boolean;
    allowFileSharing: boolean;
    allowVoiceMessages: boolean;
    slowMode: boolean;
    slowModeInterval: number;
  };
  pinnedMessages: string[];
  muted: boolean;
}

interface ChatFilters {
  search: string;
  type: 'all' | 'direct' | 'group' | 'tribe' | 'event';
  status: 'all' | 'online' | 'offline';
  unread: boolean;
}

export default function RealTimeChat() {
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showRoomSettings, setShowRoomSettings] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [filters, setFilters] = useState<ChatFilters>({
    search: '',
    type: 'all',
    status: 'all',
    unread: false,
  });
  
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Fetch chat rooms
  const { data: chatRooms, isLoading: roomsLoading } = useQuery({
    queryKey: ['chat-rooms', filters],
    queryFn: () => api.chat.getRooms(filters),
  });

  // Fetch messages for selected room
  const { data: fetchedMessages, isLoading: messagesLoading } = useQuery({
    queryKey: ['chat-messages', selectedRoom?.id],
    queryFn: () => selectedRoom ? api.chat.getMessages(selectedRoom.id) : Promise.resolve([]),
    enabled: !!selectedRoom,
  });

  // Mutations
  const sendMessageMutation = useMutation({
    mutationFn: (data: { roomId: string; content: string; type: string; attachments?: any[] }) => 
      api.chat.sendMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', selectedRoom?.id] });
      queryClient.invalidateQueries({ queryKey: ['chat-rooms'] });
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: (messageId: string) => api.chat.deleteMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', selectedRoom?.id] });
    },
  });

  const editMessageMutation = useMutation({
    mutationFn: (data: { messageId: string; content: string }) => api.chat.editMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', selectedRoom?.id] });
    },
  });

  const reactToMessageMutation = useMutation({
    mutationFn: (data: { messageId: string; emoji: string }) => api.chat.reactToMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', selectedRoom?.id] });
    },
  });

  // Initialize Socket.IO connection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      socketRef.current = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000', {
        transports: ['websocket'],
        auth: {
          token: localStorage.getItem('token'),
        },
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to chat socket');
      });

      socketRef.current.on('message', (newMessage: ChatMessage) => {
        if (selectedRoom && newMessage.roomId === selectedRoom.id) {
          setMessages(prev => [...prev, newMessage]);
        }
        queryClient.invalidateQueries({ queryKey: ['chat-rooms'] });
      });

      socketRef.current.on('typing', (data: { roomId: string; userId: string; username: string }) => {
        if (selectedRoom && data.roomId === selectedRoom.id) {
          setTypingUsers(prev => [...prev.filter(u => u !== data.username), data.username]);
        }
      });

      socketRef.current.on('stop_typing', (data: { roomId: string; userId: string; username: string }) => {
        if (selectedRoom && data.roomId === selectedRoom.id) {
          setTypingUsers(prev => prev.filter(u => u !== data.username));
        }
      });

      socketRef.current.on('user_joined', (data: { roomId: string; user: any }) => {
        if (selectedRoom && data.roomId === selectedRoom.id) {
          toast.success(`${data.user.username} se unió al chat`);
        }
      });

      socketRef.current.on('user_left', (data: { roomId: string; user: any }) => {
        if (selectedRoom && data.roomId === selectedRoom.id) {
          toast.info(`${data.user.username} salió del chat`);
        }
      });

      socketRef.current.on('message_edited', (data: { messageId: string; content: string }) => {
        setMessages(prev => prev.map(msg => 
          msg.id === data.messageId ? { ...msg, content: data.content, isEdited: true } : msg
        ));
      });

      socketRef.current.on('message_deleted', (data: { messageId: string }) => {
        setMessages(prev => prev.map(msg => 
          msg.id === data.messageId ? { ...msg, isDeleted: true, content: 'Mensaje eliminado' } : msg
        ));
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [selectedRoom, queryClient]);

  // Update local state when fetched data changes
  useEffect(() => {
    if (fetchedMessages) {
      setMessages(fetchedMessages);
    }
  }, [fetchedMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Join room when selected
  useEffect(() => {
    if (selectedRoom && socketRef.current) {
      socketRef.current.emit('join_room', { roomId: selectedRoom.id });
    }
  }, [selectedRoom]);

  // Handle typing
  const handleTyping = () => {
    if (selectedRoom && socketRef.current) {
      socketRef.current.emit('typing', { roomId: selectedRoom.id });
      setIsTyping(true);
      
      setTimeout(() => {
        setIsTyping(false);
        if (socketRef.current) {
          socketRef.current.emit('stop_typing', { roomId: selectedRoom.id });
        }
      }, 3000);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom) return;

    try {
      await sendMessageMutation.mutateAsync({
        roomId: selectedRoom.id,
        content: newMessage.trim(),
        type: 'text',
      });
      
      setNewMessage('');
      setShowEmojiPicker(false);
    } catch (error) {
      toast.error('Error al enviar el mensaje');
    }
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !selectedRoom) return;

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('roomId', selectedRoom.id);
        
        const response = await api.upload.uploadFile(formData);
        
        await sendMessageMutation.mutateAsync({
          roomId: selectedRoom.id,
          content: `Archivo: ${file.name}`,
          type: file.type.startsWith('image/') ? 'image' : 
                file.type.startsWith('video/') ? 'video' : 'file',
          attachments: [response.data],
        });
      }
    } catch (error) {
      toast.error('Error al subir el archivo');
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle message actions
  const handleMessageAction = async (message: ChatMessage, action: string, data?: any) => {
    switch (action) {
      case 'edit':
        const newContent = prompt('Editar mensaje:', message.content);
        if (newContent && newContent !== message.content) {
          await editMessageMutation.mutateAsync({
            messageId: message.id,
            content: newContent,
          });
        }
        break;
      case 'delete':
        if (confirm('¿Estás seguro de que quieres eliminar este mensaje?')) {
          await deleteMessageMutation.mutateAsync(message.id);
        }
        break;
      case 'react':
        await reactToMessageMutation.mutateAsync({
          messageId: message.id,
          emoji: data.emoji,
        });
        break;
      case 'reply':
        // Focus on message input and set reply context
        break;
      case 'pin':
        // Pin message
        break;
      case 'copy':
        navigator.clipboard.writeText(message.content);
        toast.success('Mensaje copiado');
        break;
    }
  };

  // Get message type icon
  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'file': return <File className="w-4 h-4" />;
      case 'location': return <MapPin className="w-4 h-4" />;
      case 'event': return <Calendar className="w-4 h-4" />;
      default: return null;
    }
  };

  // Get user role icon
  const getUserRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'admin': return <Shield className="w-4 h-4 text-red-600" />;
      case 'moderator': return <Shield className="w-4 h-4 text-blue-600" />;
      default: return null;
    }
  };

  if (roomsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar - Chat Rooms */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">💬 Chat</h2>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <UserPlus className="w-5 h-5" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Buscar chats..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Filters */}
          <div className="mt-3 flex space-x-2">
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos</option>
              <option value="direct">Directos</option>
              <option value="group">Grupos</option>
              <option value="tribe">Tribus</option>
              <option value="event">Eventos</option>
            </select>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos</option>
              <option value="online">En línea</option>
              <option value="offline">Desconectados</option>
            </select>
          </div>
        </div>

        {/* Chat Rooms List */}
        <div className="flex-1 overflow-y-auto">
          {chatRooms?.map((room) => (
            <div
              key={room.id}
              onClick={() => setSelectedRoom(room)}
              className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                selectedRoom?.id === room.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {room.avatar ? (
                      <img src={room.avatar} alt={room.name} className="w-12 h-12 rounded-full" />
                    ) : (
                      room.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  {room.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900 truncate">{room.name}</h3>
                    {room.type !== 'direct' && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        room.type === 'group' ? 'bg-blue-100 text-blue-800' :
                        room.type === 'tribe' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {room.type}
                      </span>
                    )}
                  </div>
                  
                  {room.lastMessage && (
                    <p className="text-sm text-gray-500 truncate">
                      {room.lastMessage.sender.username}: {room.lastMessage.content}
                    </p>
                  )}
                </div>
                
                <div className="text-right">
                  {room.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {room.unreadCount > 99 ? '99+' : room.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedRoom.avatar ? (
                      <img src={selectedRoom.avatar} alt={selectedRoom.name} className="w-10 h-10 rounded-full" />
                    ) : (
                      selectedRoom.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedRoom.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      {selectedRoom.type !== 'direct' && (
                        <span>{selectedRoom.participants.length} participantes</span>
                      )}
                      {selectedRoom.participants.filter(p => p.isOnline).length > 0 && (
                        <span className="text-green-600">
                          {selectedRoom.participants.filter(p => p.isOnline).length} en línea
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowParticipants(true)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <Users className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => setShowRoomSettings(true)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender.id === 'current-user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${
                      message.sender.id === 'current-user' ? 'order-2' : 'order-1'
                    }`}>
                      {message.sender.id !== 'current-user' && (
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {message.sender.avatar ? (
                              <img src={message.sender.avatar} alt={message.sender.username} className="w-6 h-6 rounded-full" />
                            ) : (
                              message.sender.username.charAt(0).toUpperCase()
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-700">{message.sender.username}</span>
                          {getUserRoleIcon(message.sender.role)}
                        </div>
                      )}
                      
                      <div className={`rounded-lg p-3 ${
                        message.sender.id === 'current-user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-900'
                      }`}>
                        {message.replyTo && (
                          <div className={`mb-2 p-2 rounded ${
                            message.sender.id === 'current-user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            <p className="text-xs font-medium">{message.replyTo.sender}</p>
                            <p className="text-xs">{message.replyTo.content}</p>
                          </div>
                        )}
                        
                        <div className="flex items-start space-x-2">
                          {getMessageTypeIcon(message.type)}
                          <div className="flex-1">
                            {message.isDeleted ? (
                              <p className="italic text-gray-500">{message.content}</p>
                            ) : (
                              <p>{message.content}</p>
                            )}
                            
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {message.attachments.map((attachment, index) => (
                                  <div key={index} className="flex items-center space-x-2">
                                    {attachment.type.startsWith('image/') ? (
                                      <img src={attachment.url} alt={attachment.name} className="w-20 h-20 object-cover rounded" />
                                    ) : attachment.type.startsWith('video/') ? (
                                      <video src={attachment.url} controls className="w-40 h-24 rounded" />
                                    ) : (
                                      <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded">
                                        <File className="w-4 h-4" />
                                        <span className="text-sm">{attachment.name}</span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {message.location && (
                              <div className="mt-2 p-2 bg-gray-100 rounded">
                                <MapPin className="w-4 h-4 inline mr-1" />
                                <span className="text-sm">{message.location.address}</span>
                              </div>
                            )}
                            
                            {message.event && (
                              <div className="mt-2 p-2 bg-gray-100 rounded">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                <span className="text-sm font-medium">{message.event.title}</span>
                                <p className="text-xs text-gray-600">{message.event.date} - {message.event.location}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2 text-xs">
                          <span className={message.sender.id === 'current-user' ? 'text-blue-200' : 'text-gray-500'}>
                            {new Date(message.timestamp).toLocaleTimeString()}
                            {message.isEdited && ' (editado)'}
                          </span>
                          
                          {message.sender.id === 'current-user' && (
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleMessageAction(message, 'edit')}
                                className="text-blue-200 hover:text-white"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleMessageAction(message, 'delete')}
                                className="text-red-200 hover:text-white"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Reactions */}
                      {Object.keys(message.reactions).length > 0 && (
                        <div className="flex items-center space-x-1 mt-1">
                          {Object.entries(message.reactions).map(([emoji, users]) => (
                            <button
                              key={emoji}
                              onClick={() => handleMessageAction(message, 'react', { emoji })}
                              className="px-2 py-1 bg-gray-100 rounded-full text-xs hover:bg-gray-200"
                            >
                              {emoji} {users.length}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              
              {/* Typing indicator */}
              {typingUsers.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="text-sm text-gray-500">
                      {typingUsers.join(', ')} está escribiendo...
                    </p>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowFileUpload(!showFileUpload)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <Smile className="w-5 h-5" />
                </button>
                
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage();
                      } else {
                        handleTyping();
                      }
                    }}
                    placeholder="Escribe un mensaje..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              
              {/* File Upload */}
              {showFileUpload && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="w-full"
                    accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona un chat</h3>
              <p className="text-gray-600">Elige una conversación para comenzar a chatear</p>
            </div>
          </div>
        )}
      </div>

      {/* Participants Modal */}
      {showParticipants && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Participantes</h2>
                <button
                  onClick={() => setShowParticipants(false)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-3">
                {selectedRoom.participants.map((participant) => (
                  <div key={participant.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {participant.avatar ? (
                          <img src={participant.avatar} alt={participant.username} className="w-10 h-10 rounded-full" />
                        ) : (
                          participant.username.charAt(0).toUpperCase()
                        )}
                      </div>
                      {participant.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{participant.username}</span>
                        {getUserRoleIcon(participant.role)}
                      </div>
                      <p className="text-sm text-gray-500">
                        {participant.isOnline ? 'En línea' : `Visto ${participant.lastSeen ? new Date(participant.lastSeen).toLocaleString() : 'recientemente'}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Room Settings Modal */}
      {showRoomSettings && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Configuración del Chat</h2>
                <button
                  onClick={() => setShowRoomSettings(false)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración General</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedRoom.settings.allowInvites}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Permitir invitaciones</span>
                    </label>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedRoom.settings.allowFileSharing}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Compartir archivos</span>
                    </label>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedRoom.settings.allowVoiceMessages}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Mensajes de voz</span>
                    </label>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedRoom.settings.slowMode}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Modo lento</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones</h3>
                  <div className="space-y-3">
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                      <Archive className="w-4 h-4 inline mr-2" />
                      Archivar chat
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                      <Block className="w-4 h-4 inline mr-2" />
                      Bloquear usuario
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                      <Report className="w-4 h-4 inline mr-2" />
                      Reportar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
