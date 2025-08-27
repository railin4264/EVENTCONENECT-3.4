'use client';

import React from 'react';
import { TrendingUp, Users, Calendar, Star, Award } from 'lucide-react';

interface EstadisticasWidgetProps {
  widget: any;
  onRemove: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onSettingsChange: (settings: any) => void;
}

const EstadisticasWidget: React.FC<EstadisticasWidgetProps> = ({
  widget,
  onRemove,
  onMinimize,
  onMaximize,
  onSettingsChange
}) => {
  const stats = [
    { id: '1', label: 'Eventos Creados', value: '12', icon: Calendar, color: 'text-blue-500', bgColor: 'bg-blue-50' },
    { id: '2', label: 'Eventos Asistidos', value: '28', icon: Users, color: 'text-green-500', bgColor: 'bg-green-50' },
    { id: '3', label: 'Tribus Unidas', value: '5', icon: Users, color: 'text-purple-500', bgColor: 'bg-purple-50' },
    { id: '4', label: 'Puntuación', value: '4.8', icon: Star, color: 'text-yellow-500', bgColor: 'bg-yellow-50' }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Mis Estadísticas</h3>
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {stats.map(stat => {
            const IconComponent = stat.icon;
            return (
              <div key={stat.id} className="bg-white rounded-lg p-3 border border-gray-200">
                <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center mb-2`}>
                  <IconComponent className={`w-5 h-5 ${stat.color}`} />
                </div>
                
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-xs text-gray-600">{stat.label}</div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-blue-900">Nivel Actual</h4>
              <p className="text-xs text-blue-700">Experto en Eventos</p>
            </div>
            <Award className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 p-3">
        <button className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium">
          Ver estadísticas completas
        </button>
      </div>
    </div>
  );
};

export default EstadisticasWidget;