'use client';

import React from 'react';
import { Activity, Bell, MessageSquare, Heart, Share2 } from 'lucide-react';

interface ActividadWidgetProps {
  widget: any;
  onRemove: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onSettingsChange: (settings: any) => void;
}

const ActividadWidget: React.FC<ActividadWidgetProps> = ({
  widget,
  onRemove,
  onMinimize,
  onMaximize,
  onSettingsChange
}) => {
  const activities = [
    { id: '1', type: 'notification', text: 'Nueva notificación de EventConnect', time: '2 min', icon: Bell },
    { id: '2', type: 'message', text: 'Mensaje de Juan en Tribu Rock', time: '5 min', icon: MessageSquare },
    { id: '3', type: 'like', text: 'A María le gustó tu evento', time: '10 min', icon: Heart },
    { id: '4', type: 'share', text: 'Compartiste un evento', time: '15 min', icon: Share2 }
  ];

  const getIconColor = (type: string) => {
    switch (type) {
      case 'notification': return 'text-blue-500';
      case 'message': return 'text-green-500';
      case 'like': return 'text-red-500';
      case 'share': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
          <Activity className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="space-y-3">
          {activities.map(activity => {
            const IconComponent = activity.icon;
            return (
              <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className={`p-2 rounded-full bg-gray-100 ${getIconColor(activity.type)}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                
                <div className="flex-1">
                  <p className="text-sm text-gray-900 mb-1">{activity.text}</p>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="border-t border-gray-200 p-3">
        <button className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium">
          Ver toda la actividad
        </button>
      </div>
    </div>
  );
};

export default ActividadWidget;