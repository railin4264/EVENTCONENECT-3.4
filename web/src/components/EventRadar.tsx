'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, Calendar, Navigation, Activity } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Event, Tribe, Location } from '@/types';

// Dynamically import map components to avoid SSR issues
const Map = dynamic(() => import('react-map-gl'), { ssr: false });
const Marker = dynamic(
  () => import('react-map-gl').then(mod => ({ default: mod.Marker })),
  { ssr: false }
);

interface EventRadarProps {
  events?: Event[];
  tribes?: Tribe[];
  userLocation?: Location | null;
  isLoading?: boolean;
}

export function EventRadar({
  events = [],
  tribes = [],
  userLocation,
  isLoading,
}: EventRadarProps) {
  const [viewState, setViewState] = useState({
    longitude: userLocation?.coordinates?.longitude || -99.1332,
    latitude: userLocation?.coordinates?.latitude || 19.4326,
    zoom: 12,
  });
  const [selectedItem, setSelectedItem] = useState<Event | Tribe | null>(null);
  const [radarActive, setRadarActive] = useState(true);

  useEffect(() => {
    if (userLocation) {
      setViewState(prev => ({
        ...prev,
        longitude: userLocation.coordinates.longitude,
        latitude: userLocation.coordinates.latitude,
      }));
    }
  }, [userLocation]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRadarActive(prev => !prev);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleMarkerClick = (item: Event | Tribe) => {
    setSelectedItem(item);
  };

  const getMarkerColor = (type: 'event' | 'tribe') => {
    return type === 'event' ? '#0ea5e9' : '#d946ef';
  };

  const getMarkerIcon = (type: 'event' | 'tribe') => {
    return type === 'event' ? Calendar : Users;
  };

  if (isLoading) {
    return (
      <div className='map-container bg-muted animate-pulse'>
        <div className='w-full h-full flex items-center justify-center'>
          <div className='text-center'>
            <div className='w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4' />
            <p className='text-muted-foreground'>Cargando mapa...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='relative'>
      {/* Radar Header */}
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center space-x-3'>
          <div className='relative'>
            <Activity
              className={`w-6 h-6 text-pulse-500 ${radarActive ? 'animate-pulse' : ''}`}
            />
            {radarActive && (
              <div className='absolute inset-0 w-6 h-6 bg-pulse-500 rounded-full animate-ping opacity-75' />
            )}
          </div>
          <h3 className='text-xl font-semibold text-foreground'>
            Radar de Eventos
          </h3>
          <span className='text-sm text-muted-foreground'>
            {events.length + tribes.length} elementos detectados
          </span>
        </div>

        <div className='flex items-center space-x-2'>
          <button
            onClick={() => setRadarActive(!radarActive)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              radarActive
                ? 'bg-pulse-500 text-white'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {radarActive ? 'Radar ON' : 'Radar OFF'}
          </button>
        </div>
      </div>

      {/* Interactive Map */}
      <div className='map-container relative overflow-hidden'>
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapStyle='mapbox://styles/mapbox/streets-v12'
          mapboxAccessToken={process.env['NEXT_PUBLIC_MAPBOX_TOKEN'] || ''}
          style={{ width: '100%', height: '100%' }}
        >
          {/* User Location Marker */}
          {userLocation && (
            <Marker
              longitude={userLocation.coordinates.longitude}
              latitude={userLocation.coordinates.latitude}
              anchor='center'
            >
              <div className='relative'>
                <div className='w-6 h-6 bg-primary rounded-full border-2 border-white shadow-lg' />
                <div className='absolute inset-0 w-6 h-6 bg-primary rounded-full animate-ping opacity-75' />
              </div>
            </Marker>
          )}

          {/* Event Markers */}
          {events.map(event => (
            <Marker
              key={`event-${event.id}`}
              longitude={event.location.coordinates.longitude}
              latitude={event.location.coordinates.latitude}
              anchor='bottom'
            >
              <motion.div
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleMarkerClick(event)}
                className='cursor-pointer'
              >
                <div className='relative'>
                  <div
                    className='w-8 h-8 bg-event-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center'
                    style={{ backgroundColor: getMarkerColor('event') }}
                  >
                    <Calendar className='w-4 h-4 text-white' />
                  </div>
                  {radarActive && (
                    <div className='absolute inset-0 w-8 h-8 bg-event-500 rounded-full animate-ping opacity-50' />
                  )}
                </div>
              </motion.div>
            </Marker>
          ))}

          {/* Tribe Markers - Commented out since Tribe doesn't have location
          {tribes.map((tribe) => (
            <Marker
              key={`tribe-${tribe.id}`}
              longitude={tribe.location.coordinates.longitude}
              latitude={tribe.location.coordinates.latitude}
              anchor="bottom"
            >
              <motion.div
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleMarkerClick(tribe)}
                className="cursor-pointer"
              >
                <div className="relative">
                  <div 
                    className="w-8 h-8 bg-tribe-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                    style={{ backgroundColor: getMarkerColor('tribe') }}
                  >
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  {radarActive && (
                    <div className="absolute inset-0 w-8 h-8 bg-tribe-500 rounded-full animate-ping opacity-50" />
                  )}
                </div>
              </motion.div>
            </Marker>
          ))}
          */}

          {/* Radar Scan Effect */}
          {radarActive && (
            <div className='absolute inset-0 pointer-events-none'>
              <div className='absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent animate-pulse' />
              <div
                className='absolute inset-0 bg-gradient-conic from-primary/5 via-transparent to-primary/5 animate-spin'
                style={{ animationDuration: '10s' }}
              />
            </div>
          )}
        </Map>

        {/* Map Controls */}
        <div className='absolute top-4 right-4 space-y-2'>
          <button
            onClick={() => {
              if (userLocation) {
                setViewState({
                  longitude: userLocation.coordinates.longitude,
                  latitude: userLocation.coordinates.latitude,
                  zoom: 14,
                });
              }
            }}
            className='w-10 h-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow'
            title='Centrar en mi ubicación'
          >
            <Navigation className='w-5 h-5 text-gray-600 dark:text-gray-300' />
          </button>
        </div>

        {/* Legend */}
        <div className='absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg'>
          <div className='space-y-2 text-sm'>
            <div className='flex items-center space-x-2'>
              <div className='w-4 h-4 bg-event-500 rounded-full' />
              <span className='text-gray-700 dark:text-gray-300'>Eventos</span>
            </div>
            <div className='flex items-center space-x-2'>
              <div className='w-4 h-4 bg-tribe-500 rounded-full' />
              <span className='text-gray-700 dark:text-gray-300'>Tribus</span>
            </div>
            <div className='flex items-center space-x-2'>
              <div className='w-4 h-4 bg-primary rounded-full' />
              <span className='text-gray-700 dark:text-gray-300'>
                Tu ubicación
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Item Details */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className='absolute top-4 left-4 right-4 z-10 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-xl border border-gray-200 dark:border-gray-700'
          >
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <div className='flex items-center space-x-2 mb-2'>
                  {getMarkerIcon('type' in selectedItem ? 'event' : 'tribe')({
                    className: 'w-5 h-5 text-primary',
                  })}
                  <span className='text-sm font-medium text-gray-500 uppercase tracking-wide'>
                    {'type' in selectedItem ? 'Evento' : 'Tribu'}
                  </span>
                </div>
                <h4 className='text-lg font-semibold text-gray-900 dark:text-white mb-1'>
                  {'title' in selectedItem
                    ? selectedItem.title
                    : selectedItem.name}
                </h4>
                <p className='text-gray-600 dark:text-gray-300 text-sm mb-3'>
                  {selectedItem.description}
                </p>
                <div className='flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400'>
                  <div className='flex items-center space-x-1'>
                    <MapPin className='w-4 h-4' />
                    <span>
                      {'location' in selectedItem
                        ? selectedItem.location.address
                        : 'Location not available'}
                    </span>
                  </div>
                  {'startDate' in selectedItem && (
                    <div className='flex items-center space-x-1'>
                      <Calendar className='w-4 h-4' />
                      <span>{selectedItem.startDate}</span>
                    </div>
                  )}
                  {'memberCount' in selectedItem ? (
                    <div className='flex items-center space-x-1'>
                      <Users className='w-4 h-4' />
                      <span>{selectedItem.memberCount} members</span>
                    </div>
                  ) : (
                    <div className='flex items-center space-x-1'>
                      <Users className='w-4 h-4' />
                      <span>{selectedItem.currentAttendees} attendees</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors'
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Radar Status */}
      <div className='mt-4 text-center'>
        <div className='inline-flex items-center space-x-2 bg-muted/50 rounded-full px-4 py-2'>
          <div
            className={`w-2 h-2 rounded-full ${radarActive ? 'bg-green-500' : 'bg-red-500'}`}
          />
          <span className='text-sm text-muted-foreground'>
            {radarActive ? 'Escaneando área...' : 'Radar pausado'}
          </span>
        </div>
      </div>
    </div>
  );
}
