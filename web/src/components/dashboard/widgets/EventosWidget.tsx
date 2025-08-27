'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, Plus } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  date: Date;
  location: string;
  attendees: number;
  maxAttendees: number;
  isUpcoming: boolean;
}

interface EventosWidgetProps {
  widget: any;
  onRemove: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onSettingsChange: (settings: any) => void;
}

const EventosWidget: React.FC<EventosWidgetProps> = ({
  widget,
  onRemove,
  onMinimize,
  onMaximize,
  onSettingsChange
}) => {
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Festival de Música Electrónica',
      date: new Date('2024-12-31T20:00:00Z'),
      location: 'Parque Central, Buenos Aires',
      attendees: 1500,
      maxAttendees: 2000,
      isUpcoming: true
    },
    {
      id: '2',
      title: 'Conferencia de Tecnología',
      date: new Date('2024-12-15T09:00:00Z'),
      location: 'Centro de Convenciones, Córdoba',
      attendees: 300,
      maxAttendees: 500,
      isUpcoming: true
    },
    {
      id: '3',
      title: 'Clase de Yoga al Aire Libre',
      date: new Date('2024-12-20T07:00:00Z'),
      location: 'Reserva Ecológica, Mendoza',
      attendees: 45,
      maxAttendees: 60,
      isUpcoming: true
    }
  ]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeUntil = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return 'Hoy';
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Próximos Eventos</h3>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        
        <div className="space-y-3">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-1">
                    {event.title}
                  </h4>
                  
                  <div className="flex items-center text-gray-500 text-xs mb-2">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-500 text-xs mb-2">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-500 text-xs">
                      <Users className="w-3 h-3 mr-1" />
                      <span>{event.attendees}/{event.maxAttendees}</span>
                    </div>
                    
                    <div className="flex items-center text-orange-500 text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{getTimeUntil(event.date)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {events.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No tienes eventos próximos</p>
            <button className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium">
              Crear evento
            </button>
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-200 p-3">
        <button className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium">
          Ver todos los eventos
        </button>
      </div>
    </div>
  );
};

export default EventosWidget;