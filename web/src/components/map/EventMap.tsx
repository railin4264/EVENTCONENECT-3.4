'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { EventIcon, getEventConfig } from '@/lib/eventIcons';
import {
  MapPin,
  Navigation,
  Layers,
  Filter,
  Search,
  Calendar,
  Users,
  Clock,
  X,
  RotateCcw,
  Maximize,
  Minimize,
  Target
} from 'lucide-react';

// Simulación de API de mapas (en producción usarías Google Maps, Mapbox, etc.)
interface MapEvent {
  id: string;
  title: string;
  category: string;
  lat: number;
  lng: number;
  date: string;
  time: string;
  attendees: number;
  price: string;
  image: string;
}

interface EventMapProps {
  events: MapEvent[];
  userLocation?: { lat: number; lng: number } | null;
  onEventSelect?: (event: MapEvent) => void;
  className?: string;
}

export const EventMap: React.FC<EventMapProps> = ({
  events,
  userLocation,
  onEventSelect,
  className = ''
}) => {
  const [selectedEvent, setSelectedEvent] = useState<MapEvent | null>(null);
  const [mapCenter, setMapCenter] = useState(userLocation || { lat: 40.4168, lng: -3.7038 }); // Madrid por defecto
  const [zoom, setZoom] = useState(12);
  const [mapStyle, setMapStyle] = useState<'default' | 'satellite' | 'terrain'>('default');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  // Filtrar eventos por categorías seleccionadas
  const visibleEvents = filteredCategories.length > 0 
    ? events.filter(event => filteredCategories.includes(event.category))
    : events;

  const handleEventClick = (event: MapEvent) => {
    setSelectedEvent(event);
    setMapCenter({ lat: event.lat, lng: event.lng });
    onEventSelect?.(event);
  };

  const handleRecenter = () => {
    if (userLocation) {
      setMapCenter(userLocation);
      setZoom(12);
    }
  };

  const toggleCategory = (category: string) => {
    setFilteredCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setFilteredCategories([]);
  };

  // Obtener categorías únicas de los eventos
  const uniqueCategories = [...new Set(events.map(event => event.category))];

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Map Container */}
      <div 
        ref={mapRef}
        className={`relative w-full h-full bg-slate-800 rounded-xl overflow-hidden ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
        }`}
      >
        {/* Simulated Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900">
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div 
              className="w-full h-full"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px'
              }}
            />
          </div>
          
          {/* City Labels */}
          <div className="absolute inset-0">
            <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/30 text-sm font-medium">
              Madrid
            </div>
            <div className="absolute top-1/4 left-1/3 transform -translate-x-1/2 -translate-y-1/2 text-white/20 text-xs">
              Barcelona
            </div>
            <div className="absolute bottom-1/3 right-1/3 transform translate-x-1/2 translate-y-1/2 text-white/20 text-xs">
              Valencia
            </div>
          </div>
        </div>

        {/* Event Markers */}
        {visibleEvents.map((event, index) => {
          const config = getEventConfig(event.category);
          const isSelected = selectedEvent?.id === event.id;
          
          // Calcular posición en el mapa (simulada)
          const x = ((event.lng + 3.7038) * 100) % 80 + 10; // Posición X simulada
          const y = ((event.lat - 40.4168) * 100) % 70 + 15; // Posición Y simulada
          
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="absolute cursor-pointer group"
              style={{ left: `${x}%`, top: `${y}%` }}
              onClick={() => handleEventClick(event)}
            >
              {/* Marker */}
              <motion.div
                className={`relative ${isSelected ? 'z-20' : 'z-10'}`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                {/* Pulse animation */}
                <div className={`absolute inset-0 rounded-full ${config.bgColor} animate-ping opacity-75`} />
                
                {/* Main marker */}
                <div className={`relative w-10 h-10 bg-gradient-to-br ${config.color} rounded-full border-3 border-white shadow-lg flex items-center justify-center`}>
                  <EventIcon category={event.category} size="sm" variant="filled" className="text-white" />
                </div>
                
                {/* Selected indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -inset-2 border-2 border-cyan-400 rounded-full"
                  />
                )}
              </motion.div>

              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-black/90 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap">
                  <div className="font-medium">{event.title}</div>
                  <div className="text-gray-300">{event.date} • {event.attendees} asistentes</div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* User Location */}
        {userLocation && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute z-15"
            style={{ 
              left: `${((userLocation.lng + 3.7038) * 100) % 80 + 10}%`, 
              top: `${((userLocation.lat - 40.4168) * 100) % 70 + 15}%` 
            }}
          >
            <div className="relative">
              <div className="absolute inset-0 w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-75" />
              <div className="relative w-4 h-4 bg-blue-600 rounded-full border-2 border-white" />
            </div>
          </motion.div>
        )}

        {/* Map Controls */}
        <div className="absolute top-4 right-4 space-y-2">
          {/* Fullscreen toggle */}
          <motion.button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="w-10 h-10 bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </motion.button>

          {/* Recenter button */}
          {userLocation && (
            <motion.button
              onClick={handleRecenter}
              className="w-10 h-10 bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Target className="w-4 h-4" />
            </motion.button>
          )}

          {/* Layers button */}
          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            className="w-10 h-10 bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Filter className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Category Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="absolute top-4 right-16 w-64 bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">Filtrar Categorías</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {uniqueCategories.map(category => {
                  const config = getEventConfig(category);
                  const isSelected = filteredCategories.includes(category);
                  
                  return (
                    <motion.button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                        isSelected ? 'bg-white/20' : 'hover:bg-white/10'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <EventIcon category={category} size="sm" variant="gradient" />
                      <span className="text-white text-sm capitalize">{category}</span>
                      {isSelected && (
                        <div className="ml-auto w-2 h-2 bg-cyan-400 rounded-full" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {filteredCategories.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="w-full mt-3 py-2 text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  Limpiar filtros
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Event Details */}
        <AnimatePresence>
          {selectedEvent && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="absolute bottom-4 left-4 right-4 md:left-4 md:right-auto md:w-96"
            >
              <Card className="bg-black/80 backdrop-blur-xl border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      <EventIcon category={selectedEvent.category} size="lg" variant="gradient" />
                      <div>
                        <h3 className="text-white font-semibold text-lg line-clamp-2">
                          {selectedEvent.title}
                        </h3>
                        <p className="text-gray-400 text-sm capitalize">
                          {selectedEvent.category}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-gray-300 text-sm">
                      <Calendar className="w-4 h-4 text-cyan-400" />
                      <span>{selectedEvent.date}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300 text-sm">
                      <Clock className="w-4 h-4 text-green-400" />
                      <span>{selectedEvent.time}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300 text-sm">
                      <Users className="w-4 h-4 text-orange-400" />
                      <span>{selectedEvent.attendees} asistentes</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="primary" size="sm" fullWidth>
                      Ver Detalles
                    </Button>
                    <Button variant="outline" size="sm">
                      <Navigation className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map Info */}
        <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2">
          <div className="text-white text-xs">
            <div>{visibleEvents.length} eventos visibles</div>
            {filteredCategories.length > 0 && (
              <div className="text-cyan-400">{filteredCategories.length} filtros activos</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
