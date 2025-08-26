'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Input, Loading } from '../ui';
import {
  MapPin,
  Navigation,
  Target,
  Users,
  Clock,
  TrendingUp,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle,
  Zap,
} from 'lucide-react';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  speed?: number;
  heading?: number;
  altitude?: number;
}

interface Geofence {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  events: string[];
  isActive: boolean;
}

interface LocationEvent {
  id: string;
  type: 'enter' | 'exit' | 'nearby' | 'movement';
  geofenceId?: string;
  location: LocationData;
  timestamp: number;
  metadata?: any;
}

interface LocationAnalytics {
  totalDistance: number;
  averageSpeed: number;
  timeSpent: number;
  geofenceVisits: number;
  locationChanges: number;
}

const IntelligentLocationSystem: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(
    null
  );
  const [isTracking, setIsTracking] = useState(false);
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);
  const [locationEvents, setLocationEvents] = useState<LocationEvent[]>([]);
  const [analytics, setAnalytics] = useState<LocationAnalytics>({
    totalDistance: 0,
    averageSpeed: 0,
    timeSpent: 0,
    geofenceVisits: 0,
    locationChanges: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<
    'granted' | 'denied' | 'prompt'
  >('prompt');

  const watchIdRef = useRef<number | null>(null);
  const lastLocationRef = useRef<LocationData | null>(null);
  const trackingStartTimeRef = useRef<number | 0>(0);

  // Initialize location system
  useEffect(() => {
    checkLocationPermission();
    loadGeofences();
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Check location permission
  const checkLocationPermission = async () => {
    try {
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({
          name: 'geolocation' as PermissionName,
        });
        setPermissionStatus(
          permission.state as 'granted' | 'denied' | 'prompt'
        );

        permission.onchange = () => {
          setPermissionStatus(
            permission.state as 'granted' | 'denied' | 'prompt'
          );
        };
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
    }
  };

  // Load sample geofences
  const loadGeofences = () => {
    const sampleGeofences: Geofence[] = [
      {
        id: '1',
        name: 'Centro Comercial Plaza',
        latitude: 40.7128,
        longitude: -74.006,
        radius: 500,
        events: ['shopping', 'food', 'entertainment'],
        isActive: true,
      },
      {
        id: '2',
        name: 'Parque Central',
        latitude: 40.7589,
        longitude: -73.9851,
        radius: 300,
        events: ['outdoor', 'recreation', 'nature'],
        isActive: true,
      },
      {
        id: '3',
        name: 'Estadio Metropolitano',
        latitude: 40.7505,
        longitude: -73.9934,
        radius: 1000,
        events: ['sports', 'concerts', 'large-events'],
        isActive: true,
      },
    ];
    setGeofences(sampleGeofences);
  };

  // Get current location
  const getCurrentLocation = useCallback((): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            speed: position.coords.speed || undefined,
            heading: position.coords.heading || undefined,
            altitude: position.coords.altitude || undefined,
          };
          resolve(locationData);
        },
        error => {
          reject(new Error(`Error de geolocalización: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }, []);

  // Start location tracking
  const startTracking = async () => {
    try {
      setError(null);
      const initialLocation = await getCurrentLocation();

      setCurrentLocation(initialLocation);
      setLocationHistory([initialLocation]);
      lastLocationRef.current = initialLocation;
      trackingStartTimeRef.current = Date.now();
      setIsTracking(true);

      // Start watching location
      watchIdRef.current = navigator.geolocation.watchPosition(
        position => {
          const newLocation: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            speed: position.coords.speed || undefined,
            heading: position.coords.heading || undefined,
            altitude: position.coords.altitude || undefined,
          };

          setCurrentLocation(newLocation);
          setLocationHistory(prev => [...prev, newLocation]);

          // Check geofences
          checkGeofences(newLocation);

          // Update analytics
          updateAnalytics(newLocation);

          lastLocationRef.current = newLocation;
        },
        error => {
          setError(`Error de tracking: ${error.message}`);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        }
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  // Stop location tracking
  const stopTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  };

  // Check if location is within geofences
  const checkGeofences = (location: LocationData) => {
    geofences.forEach(geofence => {
      if (!geofence.isActive) return;

      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        geofence.latitude,
        geofence.longitude
      );

      if (distance <= geofence.radius) {
        // Entered geofence
        if (
          !locationEvents.some(
            event =>
              event.geofenceId === geofence.id &&
              event.type === 'enter' &&
              Date.now() - event.timestamp < 60000 // Within last minute
          )
        ) {
          const event: LocationEvent = {
            id: Date.now().toString(),
            type: 'enter',
            geofenceId: geofence.id,
            location,
            timestamp: Date.now(),
            metadata: { geofenceName: geofence.name },
          };
          setLocationEvents(prev => [...prev, event]);
        }
      } else {
        // Exited geofence
        if (
          !locationEvents.some(
            event =>
              event.geofenceId === geofence.id &&
              event.type === 'exit' &&
              Date.now() - event.timestamp < 60000 // Within last minute
          )
        ) {
          const event: LocationEvent = {
            id: Date.now().toString(),
            type: 'exit',
            geofenceId: geofence.id,
            location,
            timestamp: Date.now(),
            metadata: { geofenceName: geofence.name },
          };
          setLocationEvents(prev => [...prev, event]);
        }
      }
    });
  };

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // Update location analytics
  const updateAnalytics = (newLocation: LocationData) => {
    if (!lastLocationRef.current) return;

    const distance = calculateDistance(
      lastLocationRef.current.latitude,
      lastLocationRef.current.longitude,
      newLocation.latitude,
      newLocation.longitude
    );

    setAnalytics(prev => ({
      totalDistance: prev.totalDistance + distance,
      averageSpeed:
        prev.averageSpeed > 0
          ? (prev.averageSpeed + distance / 1000) / 2
          : distance / 1000,
      timeSpent: Date.now() - trackingStartTimeRef.current,
      geofenceVisits: locationEvents.filter(e => e.type === 'enter').length,
      locationChanges: prev.locationChanges + 1,
    }));
  };

  // Request location permission
  const requestPermission = async () => {
    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      setPermissionStatus('granted');
      setError(null);
    } catch (error) {
      setPermissionStatus('denied');
      setError(error instanceof Error ? error.message : 'Error de permisos');
    }
  };

  // Format distance
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  // Format time
  const formatTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='text-center'>
        <h2 className='text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent'>
          🗺️ Sistema de Geolocalización Inteligente
        </h2>
        <p className='text-gray-600 mt-2'>
          Tracking en tiempo real, geofencing automático y análisis de
          movimientos
        </p>
      </div>

      {/* Permission Status */}
      <Card variant='glass' className='p-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            {permissionStatus === 'granted' ? (
              <CheckCircle className='w-6 h-6 text-green-500' />
            ) : permissionStatus === 'denied' ? (
              <AlertCircle className='w-6 h-6 text-red-500' />
            ) : (
              <AlertCircle className='w-6 h-6 text-yellow-500' />
            )}
            <div>
              <h3 className='font-semibold'>Estado de Permisos</h3>
              <p className='text-sm text-gray-600'>
                {permissionStatus === 'granted' && '✅ Permisos concedidos'}
                {permissionStatus === 'denied' && '❌ Permisos denegados'}
                {permissionStatus === 'prompt' && '⏳ Esperando permisos'}
              </p>
            </div>
          </div>

          {permissionStatus !== 'granted' && (
            <Button onClick={requestPermission} variant='primary'>
              Solicitar Permisos
            </Button>
          )}
        </div>
      </Card>

      {/* Current Location */}
      {currentLocation && (
        <Card variant='glass' className='p-6'>
          <div className='flex items-center space-x-3 mb-4'>
            <MapPin className='w-6 h-6 text-blue-500' />
            <h3 className='text-xl font-semibold'>Ubicación Actual</h3>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='text-center'>
              <p className='text-sm text-gray-600'>Latitud</p>
              <p className='font-mono text-lg'>
                {currentLocation.latitude.toFixed(6)}
              </p>
            </div>
            <div className='text-center'>
              <p className='text-sm text-gray-600'>Longitud</p>
              <p className='font-mono text-lg'>
                {currentLocation.longitude.toFixed(6)}
              </p>
            </div>
            <div className='text-center'>
              <p className='text-sm text-gray-600'>Precisión</p>
              <p className='font-mono text-lg'>
                ±{Math.round(currentLocation.accuracy)}m
              </p>
            </div>
            <div className='text-center'>
              <p className='text-sm text-gray-600'>Velocidad</p>
              <p className='font-mono text-lg'>
                {currentLocation.speed
                  ? `${(currentLocation.speed * 3.6).toFixed(1)} km/h`
                  : 'N/A'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Tracking Controls */}
      <Card variant='glass' className='p-6'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center space-x-3'>
            <Navigation className='w-6 h-6 text-purple-500' />
            <h3 className='text-xl font-semibold'>Control de Tracking</h3>
          </div>

          <div className='flex items-center space-x-2'>
            {isTracking ? (
              <Button
                onClick={stopTracking}
                variant='outline'
                className='text-red-600 border-red-600'
              >
                <WifiOff className='w-4 h-4 mr-2' />
                Detener
              </Button>
            ) : (
              <Button
                onClick={startTracking}
                variant='primary'
                disabled={permissionStatus !== 'granted'}
              >
                <Wifi className='w-4 h-4 mr-2' />
                Iniciar Tracking
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-3 mb-4'>
            <p className='text-red-600 text-sm'>{error}</p>
          </div>
        )}

        {isTracking && (
          <div className='bg-green-50 border border-green-200 rounded-lg p-3'>
            <div className='flex items-center space-x-2'>
              <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
              <p className='text-green-700 text-sm'>
                Tracking activo - Monitoreando ubicación en tiempo real
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Analytics */}
      <Card variant='glass' className='p-6'>
        <div className='flex items-center space-x-3 mb-4'>
          <TrendingUp className='w-6 h-6 text-green-500' />
          <h3 className='text-xl font-semibold'>Análisis de Movimiento</h3>
        </div>

        <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
          <div className='text-center'>
            <p className='text-sm text-gray-600'>Distancia Total</p>
            <p className='font-semibold text-lg'>
              {formatDistance(analytics.totalDistance)}
            </p>
          </div>
          <div className='text-center'>
            <p className='text-sm text-gray-600'>Velocidad Promedio</p>
            <p className='font-semibold text-lg'>
              {analytics.averageSpeed.toFixed(1)} km/h
            </p>
          </div>
          <div className='text-center'>
            <p className='text-sm text-gray-600'>Tiempo Activo</p>
            <p className='font-semibold text-lg'>
              {formatTime(analytics.timeSpent)}
            </p>
          </div>
          <div className='text-center'>
            <p className='text-sm text-gray-600'>Visitas Geofence</p>
            <p className='font-semibold text-lg'>{analytics.geofenceVisits}</p>
          </div>
          <div className='text-center'>
            <p className='text-sm text-gray-600'>Cambios Ubicación</p>
            <p className='font-semibold text-lg'>{analytics.locationChanges}</p>
          </div>
        </div>
      </Card>

      {/* Geofences */}
      <Card variant='glass' className='p-6'>
        <div className='flex items-center space-x-3 mb-4'>
          <Target className='w-6 h-6 text-orange-500' />
          <h3 className='text-xl font-semibold'>Geofences Activos</h3>
        </div>

        <div className='space-y-3'>
          {geofences.map(geofence => (
            <div
              key={geofence.id}
              className='flex items-center justify-between p-3 bg-white/50 rounded-lg'
            >
              <div>
                <h4 className='font-medium'>{geofence.name}</h4>
                <p className='text-sm text-gray-600'>
                  Radio: {formatDistance(geofence.radius)} • Eventos:{' '}
                  {geofence.events.join(', ')}
                </p>
              </div>
              <div className='flex items-center space-x-2'>
                <div
                  className={`w-3 h-3 rounded-full ${geofence.isActive ? 'bg-green-500' : 'bg-gray-400'}`}
                ></div>
                <span className='text-sm text-gray-600'>
                  {geofence.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Location Events */}
      <Card variant='glass' className='p-6'>
        <div className='flex items-center space-x-3 mb-4'>
          <Clock className='w-6 h-6 text-indigo-500' />
          <h3 className='text-xl font-semibold'>Eventos de Ubicación</h3>
        </div>

        <div className='space-y-3 max-h-64 overflow-y-auto'>
          {locationEvents.length === 0 ? (
            <p className='text-gray-500 text-center py-4'>
              No hay eventos de ubicación aún
            </p>
          ) : (
            locationEvents
              .slice()
              .reverse()
              .map(event => (
                <div
                  key={event.id}
                  className='flex items-center space-x-3 p-3 bg-white/50 rounded-lg'
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      event.type === 'enter'
                        ? 'bg-green-500'
                        : event.type === 'exit'
                          ? 'bg-red-500'
                          : event.type === 'nearby'
                            ? 'bg-yellow-500'
                            : 'bg-blue-500'
                    }`}
                  ></div>
                  <div className='flex-1'>
                    <p className='font-medium'>
                      {event.type === 'enter' && '🚪 Entró a'}
                      {event.type === 'exit' && '🚪 Salió de'}
                      {event.type === 'nearby' && '📍 Cerca de'}
                      {event.type === 'movement' && '🔄 Movimiento'}
                      {event.metadata?.geofenceName || 'Ubicación'}
                    </p>
                    <p className='text-sm text-gray-600'>
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
          )}
        </div>
      </Card>

      {/* Location History */}
      {locationHistory.length > 0 && (
        <Card variant='glass' className='p-6'>
          <div className='flex items-center space-x-3 mb-4'>
            <Users className='w-6 h-6 text-pink-500' />
            <h3 className='text-xl font-semibold'>Historial de Ubicaciones</h3>
            <span className='text-sm text-gray-600'>
              ({locationHistory.length} puntos)
            </span>
          </div>

          <div className='max-h-48 overflow-y-auto'>
            <div className='space-y-2'>
              {locationHistory
                .slice()
                .reverse()
                .slice(0, 10)
                .map((location, index) => (
                  <div
                    key={index}
                    className='flex items-center space-x-3 p-2 bg-white/30 rounded'
                  >
                    <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                    <div className='flex-1'>
                      <p className='text-sm font-mono'>
                        {location.latitude.toFixed(4)},{' '}
                        {location.longitude.toFixed(4)}
                      </p>
                      <p className='text-xs text-gray-600'>
                        {new Date(location.timestamp).toLocaleTimeString()} •
                        Precisión: ±{Math.round(location.accuracy)}m
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default IntelligentLocationSystem;
