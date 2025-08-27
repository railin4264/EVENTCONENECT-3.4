'use client';

import React from 'react';
import { MapPin, Navigation, Users, Calendar } from 'lucide-react';

interface MapaWidgetProps {
  widget: any;
  onRemove: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onSettingsChange: (settings: any) => void;
}

const MapaWidget: React.FC<MapaWidgetProps> = ({
  widget,
  onRemove,
  onMinimize,
  onMaximize,
  onSettingsChange
}) => {
  const nearbyEvents = [
    { id: '1', name: 'Festival de Música', distance: '0.5 km', attendees: 1500, time: '20:00' },
    { id: '2', name: 'Clase de Yoga', distance: '1.2 km', attendees: 45, time: '07:00' },
    { id: '3', name: 'Conferencia Tech', distance: '2.1 km', attendees: 300, time: '09:00' }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Mapa de Eventos</h3>
          <Navigation className="w-5 h-5 text-gray-400" />
        </div>
        
        {/* Placeholder del mapa */}
        <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg h-32 mb-4 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-blue-700 font-medium">Mapa Interactivo</p>
            <p className="text-xs text-blue-600">3 eventos cerca de ti</p>
          </div>
        </div>
        
        {/* Lista de eventos cercanos */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Eventos Cercanos</h4>
          {nearbyEvents.map(event => (
            <div key={event.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex-1">
                <h5 className="text-sm font-medium text-gray-900">{event.name}</h5>
                <div className="flex items-center text-xs text-gray-500">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span>{event.distance}</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center text-xs text-gray-500 mb-1">
                  <Users className="w-3 h-3 mr-1" />
                  <span>{event.attendees}</span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>{event.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="border-t border-gray-200 p-3">
        <button className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium">
          Ver mapa completo
        </button>
      </div>
    </div>
  );
};

export default MapaWidget;