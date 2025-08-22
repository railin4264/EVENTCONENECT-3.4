'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPinIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  CalendarDaysIcon,
  UsersIcon,
  CurrencyEuroIcon
} from '@heroicons/react/24/outline';
import { Event } from '@/types';
import { OptimizedEventCard } from '@/components/events/OptimizedEventCard';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

// ===== INTERFACES =====
interface InteractiveEventMapProps {
  events: Event[];
  onEventSelect?: (event: Event) => void;
  onLocationChange?: (location: { lat: number; lng: number; zoom: number }) => void;
  className?: string;
}

interface MapEvent extends Event {
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

interface EventMarker {
  id: string;
  event: MapEvent;
  icon: string;
  color: string;
  position: { lat: number; lng: number };
}

// ===== CONFIGURACIÓN DE ICONOS POR CATEGORÍA =====
const CATEGORY_ICONS = {
  'Música': { icon: '🎵', color: '#EC4899', emoji: '🎤' },
  'Tecnología': { icon: '💻', color: '#3B82F6', emoji: '⚡' },
  'Gastronomía': { icon: '🍽️', color: '#F59E0B', emoji: '👨‍🍳' },
  'Arte': { icon: '🎨', color: '#8B5CF6', emoji: '🖼️' },
  'Deportes': { icon: '⚽', color: '#10B981', emoji: '🏃‍♂️' },
  'Educación': { icon: '📚', color: '#6366F1', emoji: '🎓' },
  'Negocios': { icon: '💼', color: '#6B7280', emoji: '📊' },
  'Bienestar': { icon: '🧘', color: '#14B8A6', emoji: '💆‍♀️' },
  'Cultura': { icon: '🏛️', color: '#A855F7', emoji: '🎭' },
  'Familia': { icon: '👨‍👩‍👧‍👦', color: '#F97316', emoji: '🎪' }
};

// ===== COMPONENTE PRINCIPAL =====
export const InteractiveEventMap: React.FC<InteractiveEventMapProps> = ({
  events,
  onEventSelect,
  onLocationChange,
  className = ''
}) => {
  // Estados
  const [selectedEvent, setSelectedEvent] = useState<MapEvent | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 40.4168, lng: -3.7038 }); // Madrid
  const [mapZoom, setMapZoom] = useState(13);
  const [filteredCategories, setFilteredCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Refs
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // Procesar eventos con coordenadas
  const mapEvents: MapEvent[] = events
    .filter(event => {
      // Solo eventos con coordenadas válidas
      if (typeof event.location === 'object' && event.location.coordinates) {
        return true;
      }
      return false;
    })
    .map(event => ({
      ...event,
      coordinates: (event.location as any).coordinates
    }))
    .filter(event => {
      // Filtro por categorías seleccionadas
      if (filteredCategories.length > 0) {
        return filteredCategories.includes(event.category);
      }
      return true;
    })
    .filter(event => {
      // Filtro por búsqueda
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          event.title.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.category.toLowerCase().includes(query)
        );
      }
      return true;
    });

  // Crear marcadores
  const eventMarkers: EventMarker[] = mapEvents.map(event => {
    const categoryConfig = CATEGORY_ICONS[event.category] || CATEGORY_ICONS['Cultura'];
    
    return {
      id: event.id,
      event,
      icon: categoryConfig.emoji,
      color: categoryConfig.color,
      position: {
        lat: event.coordinates.latitude,
        lng: event.coordinates.longitude
      }
    };
  });

  // Obtener categorías únicas
  const availableCategories = Array.from(
    new Set(events.map(e => e.category))
  ).sort();

  // Inicializar mapa (simulado)
  useEffect(() => {
    if (!mapRef.current) return;

    // En una implementación real, aquí cargarías Google Maps o Mapbox
    console.log('🗺️ Inicializando mapa interactivo...');
    
    setTimeout(() => {
      setMapLoaded(true);
      console.log('✅ Mapa cargado con', eventMarkers.length, 'marcadores');
    }, 1000);

  }, [eventMarkers.length]);

  // Handlers
  const handleMarkerClick = useCallback((marker: EventMarker) => {
    setSelectedEvent(marker.event);
    onEventSelect?.(marker.event);
  }, [onEventSelect]);

  const handleMapMove = useCallback((newCenter: { lat: number; lng: number }, newZoom: number) => {
    setMapCenter(newCenter);
    setMapZoom(newZoom);
    onLocationChange?.({ ...newCenter, zoom: newZoom });
  }, [onLocationChange]);

  const toggleCategoryFilter = (category: string) => {
    setFilteredCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setFilteredCategories([]);
    setSearchQuery('');
  };

  // Estadísticas del mapa
  const mapStats = {
    totalEvents: mapEvents.length,
    categoriesShown: filteredCategories.length || availableCategories.length,
    averageDistance: '2.3 km',
    nearestEvent: mapEvents.length > 0 ? mapEvents[0] : null
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Controles superiores */}
      <div className="absolute top-4 left-4 right-4 z-10 space-y-4">
        {/* Barra de búsqueda */}
        <Card className="p-4">
          <CardContent>
            <div className="flex items-center space-x-3">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar eventos en el mapa..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  >
                    <XMarkIcon className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
              
              <Button
                variant={showFilters ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <AdjustmentsHorizontalIcon className="w-4 h-4 mr-2" />
                Filtros
                {filteredCategories.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {filteredCategories.length}
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filtros de categoría */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-4">
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Filtrar por categoría
                      </h3>
                      {filteredCategories.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                          Limpiar todo
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {availableCategories.map(category => {
                        const isSelected = filteredCategories.includes(category);
                        const categoryConfig = CATEGORY_ICONS[category] || CATEGORY_ICONS['Cultura'];
                        const eventsInCategory = events.filter(e => e.category === category).length;
                        
                        return (
                          <button
                            key={category}
                            onClick={() => toggleCategoryFilter(category)}
                            className={`
                              px-3 py-2 rounded-full text-sm font-medium transition-all duration-200
                              flex items-center space-x-2
                              ${isSelected 
                                ? 'text-white shadow-lg transform scale-105' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                              }
                            `}
                            style={{
                              backgroundColor: isSelected ? categoryConfig.color : undefined
                            }}
                          >
                            <span>{categoryConfig.icon}</span>
                            <span>{category}</span>
                            <span className={`
                              px-1.5 py-0.5 rounded-full text-xs
                              ${isSelected ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'}
                            `}>
                              {eventsInCategory}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Estadísticas del mapa */}
      <div className="absolute top-4 right-4 z-10">
        <Card className="p-3">
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{mapStats.totalEvents}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">eventos visibles</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenedor del mapa */}
      <div 
        ref={mapRef}
        className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden relative"
      >
        {!mapLoaded ? (
          // Loading state
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Cargando mapa...</p>
            </div>
          </div>
        ) : (
          // Mapa simulado con marcadores
          <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-900">
            {/* Simulación de mapa base */}
            <div className="absolute inset-0 opacity-20">
              <svg viewBox="0 0 400 300" className="w-full h-full">
                {/* Calles simuladas */}
                <path d="M0,150 Q100,100 200,150 T400,150" stroke="#CBD5E1" strokeWidth="2" fill="none" />
                <path d="M200,0 Q150,100 200,200 T200,300" stroke="#CBD5E1" strokeWidth="2" fill="none" />
                <path d="M0,100 Q200,80 400,100" stroke="#CBD5E1" strokeWidth="1" fill="none" />
                <path d="M0,200 Q200,220 400,200" stroke="#CBD5E1" strokeWidth="1" fill="none" />
                
                {/* Parques simulados */}
                <circle cx="100" cy="100" r="30" fill="#10B981" opacity="0.3" />
                <circle cx="300" cy="200" r="40" fill="#10B981" opacity="0.3" />
              </svg>
            </div>

            {/* Marcadores de eventos */}
            {eventMarkers.map((marker, index) => {
              // Posición simulada en el mapa (convertir coordenadas reales a posición en el div)
              const x = ((marker.position.lng + 3.7038) * 2000) % 100; // Simulación
              const y = ((marker.position.lat - 40.4168) * 2000) % 100; // Simulación
              
              const left = Math.max(5, Math.min(95, 20 + (index * 15) % 60)); // Distribución visual
              const top = Math.max(5, Math.min(95, 20 + (index * 12) % 60));

              return (
                <motion.div
                  key={marker.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="absolute cursor-pointer group"
                  style={{ left: `${left}%`, top: `${top}%` }}
                  onClick={() => handleMarkerClick(marker)}
                >
                  {/* Marcador principal */}
                  <div className="relative">
                    {/* Pulso de fondo para eventos trending */}
                    {marker.event.isTrending && (
                      <div 
                        className="absolute inset-0 rounded-full animate-ping"
                        style={{ backgroundColor: `${marker.color}40` }}
                      />
                    )}
                    
                    {/* Icono del marcador */}
                    <div 
                      className="relative w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg transform group-hover:scale-110 transition-transform duration-200"
                      style={{ backgroundColor: marker.color }}
                    >
                      <span className="text-lg">{marker.icon}</span>
                      
                      {/* Badge de popularidad */}
                      {marker.event.isPopular && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-xs">🔥</span>
                        </div>
                      )}
                      
                      {/* Badge de amigos */}
                      {marker.event.friendsAttending && marker.event.friendsAttending > 0 && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-bold">
                            {marker.event.friendsAttending}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Tooltip hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <div className="bg-black/80 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap">
                        <div className="font-semibold">{marker.event.title}</div>
                        <div className="text-xs opacity-75">
                          {marker.event.attendees} asistentes • {marker.event.distance}
                        </div>
                        {marker.event.price === 0 ? (
                          <div className="text-xs text-green-300">GRATIS</div>
                        ) : (
                          <div className="text-xs">€{marker.event.price}</div>
                        )}
                      </div>
                      {/* Flecha del tooltip */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/80" />
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Controles de zoom simulados */}
            <div className="absolute bottom-4 right-4 space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMapZoom(prev => Math.min(18, prev + 1))}
                className="w-10 h-10 p-0 bg-white dark:bg-gray-800"
              >
                +
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMapZoom(prev => Math.max(8, prev - 1))}
                className="w-10 h-10 p-0 bg-white dark:bg-gray-800"
              >
                -
              </Button>
            </div>

            {/* Indicador de zoom */}
            <div className="absolute bottom-4 left-4">
              <div className="bg-white dark:bg-gray-800 px-3 py-1 rounded-lg text-sm text-gray-600 dark:text-gray-400">
                Zoom: {mapZoom}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Panel lateral con evento seleccionado */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute top-0 right-0 w-80 h-full bg-white dark:bg-gray-800 shadow-2xl z-20 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Detalles del evento
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEvent(null)}
                  className="p-2"
                >
                  <XMarkIcon className="w-5 h-5" />
                </Button>
              </div>
              
              <OptimizedEventCard 
                event={selectedEvent} 
                variant="compact"
                showActions={true}
              />
              
              {/* Información adicional del mapa */}
              <div className="mt-4 space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPinIcon className="w-4 h-4" />
                  <span>Coordenadas: {selectedEvent.coordinates.latitude.toFixed(4)}, {selectedEvent.coordinates.longitude.toFixed(4)}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <CalendarDaysIcon className="w-4 h-4" />
                  <span>{new Date(selectedEvent.date).toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                
                <Button className="w-full mt-4">
                  Ver detalles completos
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leyenda de categorías */}
      <div className="absolute bottom-4 left-4 z-10">
        <Card className="p-4 max-w-sm">
          <CardContent>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              Leyenda del mapa
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(CATEGORY_ICONS).slice(0, 6).map(([category, config]) => (
                <div key={category} className="flex items-center space-x-2">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm"
                    style={{ backgroundColor: config.color }}
                  >
                    {config.emoji}
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {category}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas flotantes */}
      <div className="absolute top-20 right-4 z-10">
        <Card className="p-3">
          <CardContent>
            <div className="space-y-2 text-center">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {mapStats.totalEvents} eventos
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {mapStats.categoriesShown} categorías
              </div>
              {mapStats.nearestEvent && (
                <div className="text-xs text-primary-600">
                  Más cercano: {mapStats.nearestEvent.distance}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ===== COMPONENTE DE MINI MAPA =====
export const MiniEventMap: React.FC<{
  events: Event[];
  height?: string;
  onEventClick?: (event: Event) => void;
}> = ({ events, height = '300px', onEventClick }) => {
  const mapEvents = events.slice(0, 10); // Máximo 10 eventos para mini mapa

  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700" style={{ height }}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-900">
        {/* Marcadores simplificados */}
        {mapEvents.map((event, index) => {
          const categoryConfig = CATEGORY_ICONS[event.category] || CATEGORY_ICONS['Cultura'];
          const left = 15 + (index * 8) % 70;
          const top = 20 + (index * 12) % 60;

          return (
            <motion.button
              key={event.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="absolute w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
              style={{ 
                left: `${left}%`, 
                top: `${top}%`,
                backgroundColor: categoryConfig.color 
              }}
              onClick={() => onEventClick?.(event)}
              title={event.title}
            >
              <span className="text-sm">{categoryConfig.emoji}</span>
            </motion.button>
          );
        })}
        
        {/* Overlay con información */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
          <div className="text-white text-sm">
            <div className="font-semibold">{events.length} eventos en el área</div>
            <div className="opacity-75">Haz clic en los marcadores para ver detalles</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveEventMap;