'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapIcon,
  ListBulletIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { InteractiveEventMap, MiniEventMap } from '@/components/map/InteractiveEventMap';
import { OptimizedEventCard } from '@/components/events/OptimizedEventCard';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardTitle } from '@/components/ui/Card';
import { useEvents } from '@/hooks/useEvents';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Event } from '@/types';

// ===== MOCK DATA PARA DEMO =====
const mockEventsWithCoordinates: Event[] = [
  {
    id: '1',
    title: 'AI Summit Madrid 2024',
    description: 'El evento más grande de IA en España',
    category: 'Tecnología',
    date: '2024-12-25',
    location: {
      city: 'Madrid',
      venue: 'WiZink Center',
      coordinates: { latitude: 40.4168, longitude: -3.7038 }
    },
    distance: '2.1 km',
    attendees: 450,
    price: 75,
    host: { name: 'Tech Madrid', avatar: '/host1.jpg' },
    isPopular: true,
    isTrending: true,
    friendsAttending: 3,
    tags: ['ai', 'technology', 'networking'],
    likes: 230,
    shares: 45,
    comments: 67
  },
  {
    id: '2',
    title: 'Festival Gastronómico de Invierno',
    description: 'Los mejores chefs de Madrid se reúnen',
    category: 'Gastronomía',
    date: '2024-12-28',
    location: {
      city: 'Madrid',
      venue: 'Matadero Madrid',
      coordinates: { latitude: 40.3967, longitude: -3.6947 }
    },
    distance: '1.8 km',
    attendees: 320,
    price: 25,
    host: { name: 'Madrid Food', avatar: '/host2.jpg' },
    friendsAttending: 4,
    tags: ['food', 'chefs', 'madrid'],
    likes: 180,
    shares: 32,
    comments: 41
  },
  {
    id: '3',
    title: 'Concierto de Jazz en Vivo',
    description: 'Una noche mágica con los mejores músicos de jazz',
    category: 'Música',
    date: '2024-12-22',
    location: {
      city: 'Madrid',
      venue: 'Café Central',
      coordinates: { latitude: 40.4147, longitude: -3.6958 }
    },
    distance: '0.8 km',
    attendees: 85,
    price: 35,
    host: { name: 'Jazz Madrid', avatar: '/host3.jpg' },
    isPopular: true,
    friendsAttending: 1,
    tags: ['jazz', 'música', 'live'],
    likes: 95,
    shares: 18,
    comments: 23
  },
  {
    id: '4',
    title: 'Exposición de Arte Contemporáneo',
    description: 'Artistas emergentes exponen sus últimas obras',
    category: 'Arte',
    date: '2024-12-30',
    location: {
      city: 'Madrid',
      venue: 'Galería Marlborough',
      coordinates: { latitude: 40.4237, longitude: -3.6926 }
    },
    distance: '1.2 km',
    attendees: 150,
    price: 0,
    host: { name: 'Arte Madrid', avatar: '/host4.jpg' },
    friendsAttending: 0,
    tags: ['arte', 'exposición', 'contemporáneo'],
    likes: 67,
    shares: 12,
    comments: 8
  },
  {
    id: '5',
    title: 'Maratón de Madrid 2024',
    description: '42km recorriendo los lugares más emblemáticos',
    category: 'Deportes',
    date: '2024-12-26',
    location: {
      city: 'Madrid',
      venue: 'Puerta del Sol',
      coordinates: { latitude: 40.4169, longitude: -3.7035 }
    },
    distance: '0.3 km',
    attendees: 25000,
    price: 45,
    host: { name: 'Madrid Running', avatar: '/host5.jpg' },
    isPopular: true,
    isTrending: true,
    friendsAttending: 8,
    tags: ['maratón', 'running', 'deporte'],
    likes: 1250,
    shares: 340,
    comments: 567
  }
];

// ===== COMPONENTE PRINCIPAL =====
export default function MapPage() {
  // Estados
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [mapLocation, setMapLocation] = useState({ lat: 40.4168, lng: -3.7038, zoom: 13 });
  
  // Hooks
  const { location } = useGeolocation();
  const { events: userEvents } = useEvents();

  // Combinar eventos del usuario con mock data
  const allEvents = [...mockEventsWithCoordinates, ...userEvents];

  // Estadísticas
  const mapStats = {
    totalEvents: allEvents.length,
    categoriesCount: new Set(allEvents.map(e => e.category)).size,
    averageDistance: '1.8 km',
    nearbyEvents: allEvents.filter(e => {
      if (e.distance) {
        const distance = parseFloat(e.distance.replace('km', ''));
        return distance <= 5;
      }
      return false;
    }).length
  };

  // Handlers
  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleLocationChange = (newLocation: { lat: number; lng: number; zoom: number }) => {
    setMapLocation(newLocation);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Mapa de Eventos
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Descubre eventos cerca de ti en {location?.city || 'Madrid'}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Estadísticas rápidas */}
              <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-primary-500 rounded-full" />
                  <span>{mapStats.totalEvents} eventos</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>{mapStats.nearbyEvents} cerca de ti</span>
                </div>
              </div>
              
              {/* Toggle vista */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <Button
                  variant={viewMode === 'map' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                  className="px-3 py-1"
                >
                  <MapIcon className="w-4 h-4 mr-1" />
                  Mapa
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="px-3 py-1"
                >
                  <ListBulletIcon className="w-4 h-4 mr-1" />
                  Lista
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {viewMode === 'map' ? (
          // Vista de mapa
          <div className="h-[calc(100vh-200px)]">
            <InteractiveEventMap
              events={allEvents}
              onEventSelect={handleEventSelect}
              onLocationChange={handleLocationChange}
              className="w-full h-full"
            />
          </div>
        ) : (
          // Vista de lista con mini mapa
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* Lista de eventos */}
            <div className="lg:col-span-2 space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Eventos en tu área
                </h2>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {allEvents.length} eventos encontrados
                </div>
              </div>
              
              {allEvents.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <OptimizedEventCard 
                    event={event} 
                    variant="compact"
                    showActions={true}
                  />
                </motion.div>
              ))}
            </div>
            
            {/* Mini mapa lateral */}
            <div className="space-y-4">
              <Card className="p-4">
                <CardTitle className="mb-4">Vista del mapa</CardTitle>
                <CardContent>
                  <MiniEventMap
                    events={allEvents}
                    height="400px"
                    onEventClick={handleEventSelect}
                  />
                </CardContent>
              </Card>
              
              {/* Estadísticas */}
              <Card className="p-4">
                <CardTitle className="mb-4">Estadísticas del área</CardTitle>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total eventos:</span>
                      <span className="font-semibold">{mapStats.totalEvents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Categorías:</span>
                      <span className="font-semibold">{mapStats.categoriesCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Cerca de ti:</span>
                      <span className="font-semibold text-green-600">{mapStats.nearbyEvents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Distancia media:</span>
                      <span className="font-semibold">{mapStats.averageDistance}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}