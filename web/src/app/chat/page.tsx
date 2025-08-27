'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical,
  Phone,
  Video,
  Info,
  Users,
  Circle,
  Check,
  CheckCheck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  isGroup: boolean;
  participants?: string[];
}

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'file';
}

const ChatPage = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChats = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setChats([
        {
          id: '1',
          name: 'Desarrolladores React',
          avatar: 'https://ui-avatars.com/api/?name=DR&background=67e8f9&color=fff',
          lastMessage: '¿Alguien sabe cómo optimizar este hook?',
          lastMessageTime: '2m',
          unreadCount: 3,
          isOnline: true,
          isGroup: true,
          participants: ['Ana', 'Carlos', 'María', '+15 más'],
        },
        {
          id: '2',
          name: 'Ana García',
          avatar: 'https://ui-avatars.com/api/?name=Ana Garcia&background=10b981&color=fff',
          lastMessage: 'Perfecto, nos vemos mañana 👍',
          lastMessageTime: '5m',
          unreadCount: 0,
          isOnline: true,
          isGroup: false,
        },
        {
          id: '3',
          name: 'Fotógrafos Urbanos',
          avatar: 'https://ui-avatars.com/api/?name=FU&background=7c3aed&color=fff',
          lastMessage: 'Compartí las fotos de ayer en el álbum',
          lastMessageTime: '1h',
          unreadCount: 1,
          isOnline: false,
          isGroup: true,
          participants: ['Laura', 'Diego', 'Sofia', '+8 más'],
        },
        {
          id: '4',
          name: 'Carlos Mendez',
          avatar: 'https://ui-avatars.com/api/?name=Carlos Mendez&background=f59e0b&color=fff',
          lastMessage: '¡Excelente evento! 🎉',
          lastMessageTime: '2h',
          unreadCount: 0,
          isOnline: false,
          isGroup: false,
        },
        {
          id: '5',
          name: 'Runners Madrid',
          avatar: 'https://ui-avatars.com/api/?name=RM&background=ef4444&color=fff',
          lastMessage: 'Ruta para mañana: Retiro -> Casa de Campo',
          lastMessageTime: '3h',
          unreadCount: 2,
          isOnline: true,
          isGroup: true,
          participants: ['Pedro', 'Isabel', 'Javier', '+25 más'],
        },
      ]);
      setIsLoading(false);
    }, 1000);
  };

  const loadMessages = async (chatId: string) => {
    // Simulate API call
    setTimeout(() => {
      const mockMessages: Message[] = [
        {
          id: '1',
          content: '¡Hola! ¿Cómo está yendo tu proyecto?',
          sender: {
            id: '2',
            name: 'Ana García',
            avatar: 'https://ui-avatars.com/api/?name=Ana Garcia&background=10b981&color=fff',
          },
          timestamp: '10:30',
          status: 'read',
          type: 'text',
        },
        {
          id: '2',
          content: 'Todo bien, ya casi terminamos la implementación del chat en tiempo real 💪',
          sender: {
            id: '1',
            name: 'Yo',
            avatar: 'https://ui-avatars.com/api/?name=Yo&background=67e8f9&color=fff',
          },
          timestamp: '10:32',
          status: 'read',
          type: 'text',
        },
        {
          id: '3',
          content: '¡Genial! Me gustaría verlo cuando esté listo. ¿Usaste Socket.IO?',
          sender: {
            id: '2',
            name: 'Ana García',
            avatar: 'https://ui-avatars.com/api/?name=Ana Garcia&background=10b981&color=fff',
          },
          timestamp: '10:35',
          status: 'read',
          type: 'text',
        },
        {
          id: '4',
          content: 'Sí, exactamente! Socket.IO con Express y React. La experiencia es súper fluida',
          sender: {
            id: '1',
            name: 'Yo',
            avatar: 'https://ui-avatars.com/api/?name=Yo&background=67e8f9&color=fff',
          },
          timestamp: '10:36',
          status: 'delivered',
          type: 'text',
        },
      ];
      
      setMessages(mockMessages);
    }, 500);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending || !selectedChat) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    // Add optimistic message
    const tempMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      sender: {
        id: '1',
        name: 'Yo',
        avatar: 'https://ui-avatars.com/api/?name=Yo&background=67e8f9&color=fff',
      },
      timestamp: new Date().toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      status: 'sending',
      type: 'text',
    };

    setMessages(prev => [...prev, tempMessage]);

    // Simulate API call
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id 
          ? { ...msg, status: 'sent' as const }
          : msg
      ));
      setIsSending(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ChatListItem = ({ chat }: { chat: Chat }) => (
    <div
      onClick={() => setSelectedChat(chat)}
      className={`p-4 cursor-pointer border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
        selectedChat?.id === chat.id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={chat.avatar}
            alt={chat.name}
            className="w-12 h-12 rounded-full"
          />
          {chat.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-medium text-sm ${
              selectedChat?.id === chat.id 
                ? 'text-blue-900 dark:text-blue-100' 
                : 'text-gray-900 dark:text-white'
            }`}>
              {chat.name}
              {chat.isGroup && (
                <Users className="inline w-3 h-3 ml-1 text-gray-500" />
              )}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {chat.lastMessageTime}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {chat.isGroup && chat.participants && (
                <span className="text-xs text-gray-500 mr-1">
                  {chat.participants.join(', ')}:{' '}
                </span>
              )}
              {chat.lastMessage}
            </p>
            
            {chat.unreadCount > 0 && (
              <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {chat.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const MessageBubble = ({ message, isOwn }: { message: Message; isOwn: boolean }) => (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isOwn && (
        <img
          src={message.sender.avatar}
          alt={message.sender.name}
          className="w-8 h-8 rounded-full mr-3 mt-1"
        />
      )}
      
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-1' : 'order-2'}`}>
        {!isOwn && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-1">
            {message.sender.name}
          </p>
        )}
        
        <div className={`rounded-2xl px-4 py-2 ${
          isOwn
            ? 'bg-blue-500 text-white rounded-br-md'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
        }`}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        
        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {message.timestamp}
          </span>
          {isOwn && (
            <div className="text-gray-500 dark:text-gray-400">
              {message.status === 'sending' && <Circle className="w-3 h-3" />}
              {message.status === 'sent' && <Check className="w-3 h-3" />}
              {message.status === 'delivered' && <CheckCheck className="w-3 h-3" />}
              {message.status === 'read' && <CheckCheck className="w-3 h-3 text-blue-500" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-white dark:bg-gray-900 flex">
      {/* Chat List Sidebar */}
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Mensajes
            </h1>
            <Button size="sm" variant="outline" className="p-2">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar conversaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                No se encontraron conversaciones
              </p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <ChatListItem key={chat.id} chat={chat} />
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={selectedChat.avatar}
                      alt={selectedChat.name}
                      className="w-10 h-10 rounded-full"
                    />
                    {selectedChat.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                      {selectedChat.name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedChat.isOnline ? 'En línea' : 'Desconectado'}
                      {selectedChat.isGroup && selectedChat.participants && (
                        <span className="ml-2">• {selectedChat.participants.length} miembros</span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="p-2">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Info className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    Inicia una conversación
                  </p>
                  <p className="text-sm text-gray-400">
                    Envía un mensaje para comenzar a chatear
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwn={message.sender.id === '1'}
                    />
                  ))}
                  {isTyping && (
                    <div className="flex justify-start mb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={selectedChat.avatar}
                          alt={selectedChat.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-end gap-2">
                <Button variant="ghost" size="sm" className="p-2">
                  <Paperclip className="w-4 h-4" />
                </Button>
                
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Escribe un mensaje..."
                    rows={1}
                    className="w-full resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white"
                  />
                </div>
                
                <Button variant="ghost" size="sm" className="p-2">
                  <Smile className="w-4 h-4" />
                </Button>
                
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending}
                  size="sm"
                  className="p-2 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Selecciona una conversación
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Elige una conversación de la lista para comenzar a chatear
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;











