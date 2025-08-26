'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { EventIcon } from '@/lib/eventIcons';
import { GoogleEventMap } from '@/components/map/GoogleEventMap';
import { useGeolocation, formatDistance, getNearbyEvents, UserLocation } from '@/lib/geolocation';
import {
  MapPin,
  Navigation,
  Calendar,
  Users,
  Clock,
  Grid,
  Map,
  Loader2,
  AlertCircle,
  RefreshCw,
  Settings
} from 'lucide-react';

interface NearbyEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  distance: number;
  price: number;
  attendees: number;
  maxAttendees: number;
  organizer: {
    username: string;
    firstName: string;
    lastName: string;
  };
  images: string[];
}

interface NearbyEventsSectionProps {
  className?: string;
  maxEvents?: number;
  defaultRadius?: number;
}

export const NearbyEventsSection: React.FC<NearbyEventsSectionProps> = ({
  className = '',
  maxEvents = 6,
  defaultRadius = 10
}) => {
  const [events, setEvents] = useState<NearbyEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [radius, setRadius] = useState(defaultRadius);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const { 
    location, 
    loading: locationLoading, 
    error: locationError, 
    getCurrentLocation 
  } = useGeolocation();

  // Cargar eventos cercanos
  const loadNearbyEvents = async (userLocation: UserLocation) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getNearbyEvents({
        userLocation,
        radiusKm: radius,
        maxResults: maxEvents * 2, // Obtener más para tener opciones
        categories: selectedCategories.length > 0 ? selectedCategories : undefined
      });
      
      setEvents(response.data.events || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando eventos cercanos');
      console.error('Error loading nearby events:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar eventos cuando cambie la ubicación
  useEffect(() => {
    if (location) {
      loadNearbyEvents(location);
    }
  }, [location, radius, selectedCategories]);

  // Solicitar ubicación al montar el componente
  useEffect(() => {
    if (!location && !locationLoading && !locationError) {
      getCurrentLocation();
    }
  }, []);

  const handleRefresh = () => {
    if (location) {
      loadNearbyEvents(location);
    } else {
      getCurrentLocation();
    }
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Obtener categorías únicas de los eventos
  const availableCategories = [...new Set(events.map(event => event.category))];

  if (locationError && !location) {
    return (
      <section className={`py-12 ${className}`}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Ubicación no disponible
            </h2>
            <p className="text-gray-400 mb-6">
              Para ver eventos cercanos, necesitamos acceso a tu ubicación
            </p>
            <Button onClick={getCurrentLocation} className="mb-4">
              <MapPin className="w-4 h-4 mr-2" />
              Permitir ubicación
            </Button>
            <p className="text-sm text-gray-500">
              También puedes buscar eventos por ciudad en la página de eventos
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-12 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Eventos Cercanos
            </h2>
            <p className="text-gray-400">
              {location ? (
                <>
                  📍 Eventos en un radio de {radius}km de tu ubicación
                  {events.length > 0 && (
                    <span className="ml-2 text-cyan-400">
                      • {events.length} eventos encontrados
                    </span>
                  )}
                </>
              ) : (
                'Detectando tu ubicación...'
              )}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading || locationLoading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>

            {/* View Mode Toggle */}
            <div className="flex bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  viewMode === 'map'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Map className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        {availableCategories.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {availableCategories.map(category => (
                <motion.button
                  key={category}
                  onClick={() => handleCategoryToggle(category)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedCategories.includes(category)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category}
                </motion.button>
              ))}
              {selectedCategories.length > 0 && (
                <button
                  onClick={() => setSelectedCategories([])}
                  className="px-3 py-1 rounded-full text-sm bg-red-600/20 text-red-400 hover:bg-red-600/30"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {(loading || locationLoading) && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
              <p className="text-gray-400">
                {locationLoading ? 'Obteniendo tu ubicación...' : 'Cargando eventos cercanos...'}
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Error cargando eventos
            </h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button onClick={handleRefresh}>
              Intentar de nuevo
            </Button>
          </div>
        )}

        {/* Content */}
        {!loading && !locationLoading && !error && location && (
          <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {events.slice(0, maxEvents).map((event, index) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    index={index}
                    userLocation={location}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="map"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-96 rounded-xl overflow-hidden"
              >
                <GoogleEventMap
                  events={events.map(event => ({
                    id: event.id,
                    title: event.title,
                    category: event.category,
                    lat: event.location.lat,
                    lng: event.location.lng,
                    date: event.date,
                    time: event.time,
                    attendees: event.attendees,
                    price: event.price.toString()
                  }))}
                  userLocation={location}
                  showUserLocation={true}
                  enableGeolocation={false}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Empty State */}
        {!loading && !locationLoading && !error && events.length === 0 && location && (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No hay eventos cercanos
            </h3>
            <p className="text-gray-400 mb-4">
              No encontramos eventos en un radio de {radius}km de tu ubicación
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setRadius(radius + 10)}
              >
                Ampliar búsqueda a {radius + 10}km
              </Button>
              <Button href="/events">
                Ver todos los eventos
              </Button>
            </div>
          </div>
        )}

        {/* View All Button */}
        {events.length > maxEvents && (
          <div className="text-center mt-8">
            <Button href="/events" size="lg">
              Ver todos los eventos cercanos ({events.length})
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

// Componente de tarjeta de evento
interface EventCardProps {
  event: NearbyEvent;
  index: number;
  userLocation: UserLocation;
}

const EventCard: React.FC<EventCardProps> = ({ event, index, userLocation }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all duration-300 group">
        <CardContent className="p-0">
          {/* Event Image */}
          <div className="relative h-48 overflow-hidden rounded-t-lg">
            {event.images && event.images.length > 0 ? (
              <img
                src={event.images[0]}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                <EventIcon category={event.category} size="xl" variant="gradient" />
              </div>
            )}
            
            {/* Distance Badge */}
            <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
              📍 {formatDistance(event.distance)}
            </div>
            
            {/* Category Badge */}
            <div className="absolute top-3 left-3 bg-blue-600/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full capitalize">
              {event.category}
            </div>
          </div>

          {/* Event Info */}
          <div className="p-4">
            <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
              {event.title}
            </h3>
            
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>{event.date}</span>
                <Clock className="w-4 h-4 text-green-400 ml-2" />
                <span>{event.time}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-orange-400" />
                <span className="line-clamp-1">{event.location.address}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span>{event.attendees} asistentes</span>
                {event.price > 0 && (
                  <>
                    <span className="mx-2">•</span>
                    <span className="text-green-400 font-medium">
                      ${event.price}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-4">
              <Button variant="primary" size="sm" fullWidth>
                Ver Detalles
              </Button>
              <Button variant="outline" size="sm" className="ml-2">
                <Navigation className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
