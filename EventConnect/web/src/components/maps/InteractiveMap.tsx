'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPinIcon,
  CalendarDaysIcon,
  UsersIcon,
  StarIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FilterIcon,
  LocationMarkerIcon
} from '@heroicons/react/24/outline';
import { useMap } from '@/hooks/useMap';
import { useEvents } from '@/hooks/useEvents';
import { useTribes } from '@/hooks/useTribes';
import { useGeolocation } from '@/hooks/useGeolocation';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface InteractiveMapProps {
  className?: string;
  showEvents?: boolean;
  showTribes?: boolean;
  showUsers?: boolean;
  onMarkerClick?: (marker: any) => void;
  onMapClick?: (coordinates: [number, number]) => void;
}

const InteractiveMap = ({
  className,
  showEvents = true,
  showTribes = true,
  showUsers = false,
  onMarkerClick,
  onMapClick,
}: InteractiveMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    events: true,
    tribes: true,
    users: false,
  });

  const { location: userLocation, getCurrentPosition } = useGeolocation();
  const { events } = useEvents();
  const { tribes } = useTribes();
  
  const {
    viewport,
    markers,
    selectedMarker,
    setViewport,
    addMarker,
    removeMarker,
    selectMarker,
    clearMarkers,
  } = useMap({
    initialCenter: userLocation ? [userLocation.latitude, userLocation.longitude] : [19.4326, -99.1332],
    initialZoom: 12,
  });

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Check if Mapbox is available
    if (typeof window !== 'undefined' && (window as any).mapboxgl) {
      const mapboxgl = (window as any).mapboxgl;
      
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: viewport.center,
        zoom: viewport.zoom,
        accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
      });

      // Add navigation controls
      mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Add geolocate control
      const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
      });
      mapRef.current.addControl(geolocateControl, 'top-left');

      // Add fullscreen control
      mapRef.current.addControl(new mapboxgl.FullscreenControl());

      // Map event listeners
      mapRef.current.on('load', () => {
        setMapLoaded(true);
        addMapSources();
      });

      mapRef.current.on('click', (e: any) => {
        const coordinates: [number, number] = [e.lngLat.lat, e.lngLat.lng];
        onMapClick?.(coordinates);
      });

      mapRef.current.on('move', () => {
        if (mapRef.current) {
          const center = mapRef.current.getCenter();
          setViewport(prev => ({
            ...prev,
            center: [center.lat, center.lng],
            zoom: mapRef.current.getZoom(),
          }));
        }
      });

      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    }
  }, []);

  // Add map sources and layers
  const addMapSources = useCallback(() => {
    if (!mapRef.current || !mapLoaded) return;

    // Add custom markers layer
    mapRef.current.addSource('markers', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    });

    mapRef.current.addLayer({
      id: 'markers-layer',
      type: 'circle',
      source: 'markers',
      paint: {
        'circle-radius': 8,
        'circle-color': '#3B82F6',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#FFFFFF',
      },
    });
  }, [mapLoaded]);

  // Update markers when data changes
  useEffect(() => {
    if (!mapLoaded) return;

    clearMarkers();

    // Add event markers
    if (showEvents && activeFilters.events) {
      events.forEach((event) => {
        addMarker({
          id: `event-${event.id}`,
          position: event.location.coordinates,
          type: 'event',
          data: event,
          popup: {
            title: event.title,
            content: event.description,
            image: event.media?.images?.[0],
          },
        });
      });
    }

    // Add tribe markers
    if (showTribes && activeFilters.tribes) {
      tribes.forEach((tribe) => {
        addMarker({
          id: `tribe-${tribe.id}`,
          position: tribe.location.coordinates,
          type: 'tribe',
          data: tribe,
          popup: {
            title: tribe.name,
            content: tribe.description,
            image: tribe.avatar,
          },
        });
      });
    }
  }, [events, tribes, showEvents, showTribes, activeFilters, mapLoaded, addMarker, clearMarkers]);

  // Update map when viewport changes
  useEffect(() => {
    if (mapRef.current && mapLoaded) {
      mapRef.current.flyTo({
        center: viewport.center,
        zoom: viewport.zoom,
        duration: 1000,
      });
    }
  }, [viewport, mapLoaded]);

  // Handle marker click
  const handleMarkerClick = useCallback((marker: any) => {
    selectMarker(marker.id);
    onMarkerClick?.(marker);
  }, [selectMarker, onMarkerClick]);

  // Handle filter change
  const handleFilterChange = useCallback((filterType: string, value: boolean) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value,
    }));
  }, []);

  // Handle location button click
  const handleLocationClick = useCallback(() => {
    if (userLocation) {
      setViewport(prev => ({
        ...prev,
        center: [userLocation.latitude, userLocation.longitude],
        zoom: 15,
      }));
    } else {
      getCurrentPosition();
    }
  }, [userLocation, getCurrentPosition, setViewport]);

  if (typeof window === 'undefined') {
    return (
      <div className={cn('w-full h-96 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center', className)}>
        <p className="text-gray-500 dark:text-gray-400">Cargando mapa...</p>
      </div>
    );
  }

  return (
    <div className={cn('relative w-full h-full', className)}>
      {/* Map Container */}
      <div
        ref={mapContainer}
        className="w-full h-full rounded-lg overflow-hidden"
      />

      {/* Controls Overlay */}
      <div className="absolute top-4 left-4 space-y-2">
        {/* Location Button */}
        <button
          onClick={handleLocationClick}
          className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Ir a mi ubicación"
        >
          <LocationMarkerIcon className="w-5 h-5 text-primary-600" />
        </button>

        {/* Filters Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Filtros"
        >
          <FilterIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-4 left-20 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 min-w-48"
          >
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Filtros del Mapa
            </h3>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={activeFilters.events}
                  onChange={(e) => handleFilterChange('events', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <CalendarDaysIcon className="w-4 h-4 text-primary-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Eventos</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={activeFilters.tribes}
                  onChange={(e) => handleFilterChange('tribes', e.target.checked)}
                  className="rounded border-gray-300 text-secondary-600 focus:ring-secondary-500"
                />
                <UsersIcon className="w-4 h-4 text-secondary-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Tribus</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={activeFilters.users}
                  onChange={(e) => handleFilterChange('users', e.target.checked)}
                  className="rounded border-gray-300 text-accent-600 focus:ring-accent-500"
                />
                <MapPinIcon className="w-4 h-4 text-accent-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Usuarios</span>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Marker Info */}
      <AnimatePresence>
        {selectedMarker && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  {selectedMarker.type === 'event' && (
                    <CalendarDaysIcon className="w-5 h-5 text-primary-500" />
                  )}
                  {selectedMarker.type === 'tribe' && (
                    <UsersIcon className="w-5 h-5 text-secondary-500" />
                  )}
                  {selectedMarker.type === 'user' && (
                    <MapPinIcon className="w-5 h-5 text-accent-500" />
                  )}
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {selectedMarker.popup?.title}
                  </h3>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {selectedMarker.popup?.content}
                </p>

                {selectedMarker.type === 'event' && (
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      {formatDistanceToNow(new Date(selectedMarker.data.dateTime.start), { 
                        addSuffix: true, 
                        locale: es 
                      })}
                    </span>
                    <span>{selectedMarker.data.location.city}</span>
                    {selectedMarker.data.pricing.isFree ? (
                      <span className="text-green-600">Gratis</span>
                    ) : (
                      <span>${selectedMarker.data.pricing.amount}</span>
                    )}
                  </div>
                )}

                {selectedMarker.type === 'tribe' && (
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>{selectedMarker.data.stats.memberCount} miembros</span>
                    <span>{selectedMarker.data.category}</span>
                    <span>{selectedMarker.data.location.city}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => selectMarker(null)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-white dark:bg-gray-900 bg-opacity-90 dark:bg-opacity-90 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">Cargando mapa...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;