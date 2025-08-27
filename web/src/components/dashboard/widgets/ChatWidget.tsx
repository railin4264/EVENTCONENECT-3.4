'use client';

import React, { useState } from 'react';
import { MessageCircle, Send, Users, MoreHorizontal } from 'lucide-react';

interface ChatWidgetProps {
  widget: any;
  onRemove: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onSettingsChange: (settings: any) => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({
  widget,
  onRemove,
  onMinimize,
  onMaximize,
  onSettingsChange
}) => {
  const [message, setMessage] = useState('');
  const [activeChat, setActiveChat] = useState('tribu-rock');

  const chats = [
    { id: 'tribu-rock', name: 'Tribu Rock', unread: 3, lastMessage: '¡El concierto fue increíble!' },
    { id: 'evento-festival', name: 'Festival Música', unread: 1, lastMessage: '¿Quién va al festival?' },
    { id: 'tribu-tech', name: 'Emprendedores Tech', unread: 0, lastMessage: 'Nueva oportunidad de networking' }
  ];

  const messages = [
    { id: '1', sender: 'Juan', message: '¡Hola a todos! ¿Cómo están?', time: '10:30', isOwn: false },
    { id: '2', sender: 'María', message: '¡Muy bien! Preparándome para el evento', time: '10:32', isOwn: false },
    { id: '3', sender: 'Tú', message: '¡Genial! Yo también estoy emocionado', time: '10:35', isOwn: true }
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      // Aquí se enviaría el mensaje
      setMessage('');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Chat Rápido</h3>
          <MessageCircle className="w-5 h-5 text-gray-400" />
        </div>
        
        {/* Selector de chats */}
        <div className="mb-4">
          <select
            value={activeChat}
            onChange={(e) => setActiveChat(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {chats.map(chat => (
              <option key={chat.id} value={chat.id}>
                {chat.name} {chat.unread > 0 && `(${chat.unread})`}
              </option>
            ))}
          </select>
        </div>
        
        {/* Mensajes */}
        <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs p-2 rounded-lg text-xs ${
                msg.isOwn 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <div className="font-medium mb-1">{msg.sender}</div>
                <div>{msg.message}</div>
                <div className={`text-xs mt-1 ${
                  msg.isOwn ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {msg.time}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Input de mensaje */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="border-t border-gray-200 p-3">
        <button className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium">
          Abrir chat completo
        </button>
      </div>
    </div>
  );
};

export default ChatWidget;