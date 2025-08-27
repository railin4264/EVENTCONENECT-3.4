'use client';

import React from 'react';
import { Users, Plus, MessageCircle } from 'lucide-react';

interface TribusWidgetProps {
  widget: any;
  onRemove: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onSettingsChange: (settings: any) => void;
}

const TribusWidget: React.FC<TribusWidgetProps> = ({
  widget,
  onRemove,
  onMinimize,
  onMaximize,
  onSettingsChange
}) => {
  const tribes = [
    { id: '1', name: 'Amantes del Rock', members: 1250, maxMembers: 2000, category: 'Música' },
    { id: '2', name: 'Emprendedores Tech', members: 890, maxMembers: 1000, category: 'Negocios' },
    { id: '3', name: 'Viajeros Aventureros', members: 2100, maxMembers: 3000, category: 'Viajes' }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Mis Tribus</h3>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        
        <div className="space-y-3">
          {tribes.map(tribe => (
            <div key={tribe.id} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 text-sm">{tribe.name}</h4>
                <span className="text-xs text-gray-500">{tribe.category}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-500 text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  <span>{tribe.members}/{tribe.maxMembers}</span>
                </div>
                
                <button className="p-1 hover:bg-blue-100 rounded transition-colors">
                  <MessageCircle className="w-3 h-3 text-blue-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="border-t border-gray-200 p-3">
        <button className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium">
          Ver todas las tribus
        </button>
      </div>
    </div>
  );
};

export default TribusWidget;