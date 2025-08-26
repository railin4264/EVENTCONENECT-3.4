'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { EventIcon, getEventConfig } from '@/lib/eventIcons';
import { getUserLocation, formatDistance, calculateDistance, UserLocation } from '@/lib/geolocation';
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
  Target,
  Loader2
} from 'lucide-react';

// Tipos para eventos con ubicación
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
  image?: string;
  description?: string;
  address?: string;
}

interface GoogleEventMapProps {
  events: MapEvent[];
  userLocation?: UserLocation | null;
  onEventSelect?: (event: MapEvent) => void;
  className?: string;
  height?: string;
  showUserLocation?: boolean;
  enableGeolocation?: boolean;
}

export const GoogleEventMap: React.FC<GoogleEventMapProps> = ({
  events,
  userLocation: propUserLocation,
  onEventSelect,
  className = '',
  height = '500px',
  showUserLocation = true,
  enableGeolocation = true
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<MapEvent | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(propUserLocation || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState<string[]>([]);

  // Inicializar Google Maps
  useEffect(() => {
    const initMap = async () => {
      if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        setError('Google Maps API key no configurada');
        setLoading(false);
        return;
      }

      try {
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
          version: 'weekly',
          libraries: ['places', 'marker']
        });

        const { Map } = await loader.importLibrary('maps');
        
        if (mapRef.current) {
          const defaultCenter = userLocation || { 
            lat: 40.4168, 
            lng: -3.7038 
          };

          const mapInstance = new Map(mapRef.current, {
            center: defaultCenter,
            zoom: 12,
            mapId: 'EVENTCONNECT_MAP', // Necesario para Advanced Markers
            styles: [
              // Estilo oscuro personalizado
              {
                elementType: 'geometry',
                stylers: [{ color: '#1f2937' }]
              },
              {
                elementType: 'labels.text.stroke',
                stylers: [{ color: '#1f2937' }]
              },
              {
                elementType: 'labels.text.fill',
                stylers: [{ color: '#8b5cf6' }]
              },
              {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [{ color: '#374151' }]
              },
              {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{ color: '#0f172a' }]
              }
            ]
          });

          setMap(mapInstance);
        }
      } catch (err) {
        setError('Error cargando Google Maps');
        console.error('Error loading Google Maps:', err);
      } finally {
        setLoading(false);
      }
    };

    initMap();
  }, [userLocation]);

  // Obtener ubicación del usuario
  useEffect(() => {
    if (enableGeolocation && !propUserLocation) {
      const getLocation = async () => {
        try {
          const location = await getUserLocation();
          setUserLocation(location);
          
          // Centrar mapa en la ubicación del usuario
          if (map) {
            map.setCenter({ lat: location.lat, lng: location.lng });
            map.setZoom(14);
          }
        } catch (err) {
          console.warn('No se pudo obtener la ubicación del usuario:', err);
          // Usar ubicación por defecto (Madrid)
          const defaultLocation = { lat: 40.4168, lng: -3.7038 };
          setUserLocation(defaultLocation);
        }
      };

      getLocation();
    }
  }, [enableGeolocation, propUserLocation, map]);

  // Crear marcadores de eventos
  useEffect(() => {
    if (!map) return;

    const createEventMarkers = async () => {
      // Limpiar marcadores existentes
      markers.forEach(marker => marker.map = null);
      setMarkers([]);

      const { AdvancedMarkerElement } = await google.maps.importLibrary('marker') as google.maps.MarkerLibrary;
      
      // Filtrar eventos por categorías seleccionadas
      const visibleEvents = filteredCategories.length > 0 
        ? events.filter(event => filteredCategories.includes(event.category))
        : events;

      const newMarkers: google.maps.marker.AdvancedMarkerElement[] = [];

      visibleEvents.forEach(event => {
        const config = getEventConfig(event.category);
        
        // Crear elemento personalizado para el marcador
        const markerElement = document.createElement('div');
        markerElement.className = 'custom-marker';
        markerElement.innerHTML = `
          <div class="relative group cursor-pointer">
            <div class="w-12 h-12 bg-gradient-to-br ${config.color} rounded-full border-3 border-white shadow-lg flex items-center justify-center transform transition-transform group-hover:scale-110">
              <div class="w-6 h-6 text-white">
                ${getEventIconSVG(event.category)}
              </div>
            </div>
            ${userLocation ? `
              <div class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                ${formatDistance(calculateDistance(userLocation, event))}
              </div>
            ` : ''}
          </div>
        `;

        const marker = new AdvancedMarkerElement({
          map,
          position: { lat: event.lat, lng: event.lng },
          content: markerElement,
          title: event.title
        });

        // Click handler
        marker.addListener('click', () => {
          setSelectedEvent(event);
          map.setCenter({ lat: event.lat, lng: event.lng });
          onEventSelect?.(event);
        });

        newMarkers.push(marker);
      });

      setMarkers(newMarkers);
    };

    createEventMarkers();
  }, [map, events, filteredCategories, userLocation, onEventSelect]);

  // Crear marcador de ubicación del usuario
  useEffect(() => {
    if (!map || !userLocation || !showUserLocation) return;

    const createUserMarker = async () => {
      const { AdvancedMarkerElement } = await google.maps.importLibrary('marker') as google.maps.MarkerLibrary;
      
      const userMarkerElement = document.createElement('div');
      userMarkerElement.innerHTML = `
        <div class="relative">
          <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
          <div class="absolute inset-0 w-4 h-4 bg-blue-500/30 rounded-full animate-ping"></div>
        </div>
      `;

      new AdvancedMarkerElement({
        map,
        position: { lat: userLocation.lat, lng: userLocation.lng },
        content: userMarkerElement,
        title: 'Tu ubicación'
      });
    };

    createUserMarker();
  }, [map, userLocation, showUserLocation]);

  // Funciones de control
  const handleRecenter = () => {
    if (map && userLocation) {
      map.setCenter({ lat: userLocation.lat, lng: userLocation.lng });
      map.setZoom(14);
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

  // Obtener categorías únicas
  const uniqueCategories = [...new Set(events.map(event => event.category))];

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-slate-800 rounded-xl ${className}`} style={{ height }}>
        <div className="text-center text-white">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Cargando mapa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-slate-800 rounded-xl ${className}`} style={{ height }}>
        <div className="text-center text-white">
          <MapPin className="w-8 h-8 mx-auto mb-2 text-red-400" />
          <p className="text-red-400">{error}</p>
          <p className="text-sm text-gray-400 mt-1">
            Verifica tu Google Maps API key
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Map Container */}
      <div 
        className={`relative bg-slate-800 rounded-xl overflow-hidden ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
        }`}
        style={{ height: isFullscreen ? '100vh' : height }}
      >
        <div ref={mapRef} className="w-full h-full" />

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
              title="Centrar en mi ubicación"
            >
              <Target className="w-4 h-4" />
            </motion.button>
          )}

          {/* Filters button */}
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
                        {userLocation && (
                          <p className="text-cyan-400 text-sm">
                            📍 {formatDistance(calculateDistance(userLocation, selectedEvent))}
                          </p>
                        )}
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
            <div>{events.length} eventos disponibles</div>
            {filteredCategories.length > 0 && (
              <div className="text-cyan-400">{filteredCategories.length} filtros activos</div>
            )}
            {userLocation && (
              <div className="text-green-400">📍 Ubicación detectada</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Función auxiliar para obtener SVG del icono
const getEventIconSVG = (category: string): string => {
  // Esta es una versión simplificada, en producción usarías los SVGs reales
  const iconMap: Record<string, string> = {
    music: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>',
    sports: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 2C3.79 2 2 3.79 2 6s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm12 0c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-6 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/></svg>',
    food: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.20-1.10-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/></svg>',
    default: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>'
  };
  
  return iconMap[category] || iconMap.default;
};
