'use client';

import React from 'react';
import { Bell, MessageSquare, Calendar, Users, Settings } from 'lucide-react';

interface NotificacionesWidgetProps {
  widget: any;
  onRemove: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onSettingsChange: (settings: any) => void;
}

const NotificacionesWidget: React.FC<NotificacionesWidgetProps> = ({
  widget,
  onRemove,
  onMinimize,
  onMaximize,
  onSettingsChange
}) => {
  const notifications = [
    { id: '1', type: 'event', text: 'Festival de Música comienza en 2 horas', time: '2 min', unread: true },
    { id: '2', type: 'tribe', text: 'Nuevo mensaje en Tribu Rock', time: '5 min', unread: true },
    { id: '3', type: 'reminder', text: 'Recordatorio: Clase de Yoga mañana', time: '1 hora', unread: false },
    { id: '4', type: 'update', text: 'Evento actualizado: Conferencia Tech', time: '2 horas', unread: false }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'event': return Calendar;
      case 'tribe': return Users;
      case 'reminder': return Bell;
      case 'update': return MessageSquare;
      default: return Bell;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'event': return 'text-blue-500';
      case 'tribe': return 'text-purple-500';
      case 'reminder': return 'text-orange-500';
      case 'update': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
          <div className="flex items-center space-x-2">
            <button className="p-1 hover:bg-gray-100 rounded transition-colors">
              <Settings className="w-4 h-4 text-gray-600" />
            </button>
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          </div>
        </div>
        
        <div className="space-y-2">
          {notifications.map(notification => {
            const IconComponent = getIcon(notification.type);
            return (
              <div 
                key={notification.id} 
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  notification.unread ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-1 rounded-full ${getIconColor(notification.type)}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1">
                    <p className={`text-sm ${notification.unread ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                      {notification.text}
                    </p>
                    <span className="text-xs text-gray-500">{notification.time}</span>
                  </div>
                  
                  {notification.unread && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="border-t border-gray-200 p-3">
        <button className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium">
          Ver todas las notificaciones
        </button>
      </div>
    </div>
  );
};

export default NotificacionesWidget;