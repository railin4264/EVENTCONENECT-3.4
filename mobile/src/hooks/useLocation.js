import { useState, useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import { useAuth } from './useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useLocation = () => {
  const { api } = useAuth();
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [locationServicesEnabled, setLocationServicesEnabled] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [lastKnownLocation, setLastKnownLocation] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [searchingNearby, setSearchingNearby] = useState(false);
  
  const locationRef = useRef(null);
  const permissionRef = useRef(null);

  // Verificar permisos al iniciar
  useEffect(() => {
    checkLocationPermissions();
    loadLastKnownLocation();
  }, []);

  // Verificar si los servicios de ubicación están habilitados
  useEffect(() => {
    checkLocationServices();
  }, []);

  const checkLocationServices = async () => {
    try {
      const enabled = await Location.hasServicesEnabledAsync();
      setLocationServicesEnabled(enabled);
      
      if (!enabled) {
        setErrorMsg('Los servicios de ubicación están deshabilitados');
      }
    } catch (error) {
      console.error('Error verificando servicios de ubicación:', error);
      setErrorMsg('Error verificando servicios de ubicación');
    }
  };

  const checkLocationPermissions = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionStatus(status);
      
      if (status === 'granted') {
        await getCurrentLocation();
      } else if (status === 'denied') {
        setErrorMsg('Permisos de ubicación denegados');
      }
    } catch (error) {
      console.error('Error verificando permisos:', error);
      setErrorMsg('Error verificando permisos de ubicación');
    }
  };

  const requestLocationPermissions = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      
      if (status === 'granted') {
        await getCurrentLocation();
        return true;
      } else {
        setErrorMsg('Permisos de ubicación denegados');
        return false;
      }
    } catch (error) {
      console.error('Error solicitando permisos:', error);
      setErrorMsg('Error solicitando permisos de ubicación');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = async (options = {}) => {
    try {
      setLoading(true);
      setErrorMsg(null);

      if (permissionStatus !== 'granted') {
        const granted = await requestLocationPermissions();
        if (!granted) return null;
      }

      const defaultOptions = {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
        distanceInterval: 10,
        ...options
      };

      const currentLocation = await Location.getCurrentPositionAsync(defaultOptions);
      
      const locationData = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        accuracy: currentLocation.coords.accuracy,
        altitude: currentLocation.coords.altitude,
        heading: currentLocation.coords.heading,
        speed: currentLocation.coords.speed,
        timestamp: currentLocation.timestamp,
        address: null
      };

      setLocation(locationData);
      setLastKnownLocation(locationData);
      setLocationHistory(prev => [locationData, ...prev.slice(0, 49)]); // Mantener solo 50 ubicaciones
      
      // Guardar en AsyncStorage
      await saveLocationToStorage(locationData);
      
      // Obtener dirección
      await getAddressFromCoordinates(locationData.latitude, locationData.longitude);
      
      return locationData;
    } catch (error) {
      console.error('Error obteniendo ubicación actual:', error);
      setErrorMsg('Error obteniendo ubicación actual');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const startLocationUpdates = useCallback(async (options = {}) => {
    try {
      if (permissionStatus !== 'granted') {
        const granted = await requestLocationPermissions();
        if (!granted) return false;
      }

      const defaultOptions = {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
        distanceInterval: 10,
        ...options
      };

      const id = await Location.watchPositionAsync(
        defaultOptions,
        (newLocation) => {
          const locationData = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            accuracy: newLocation.coords.accuracy,
            altitude: newLocation.coords.altitude,
            heading: newLocation.coords.heading,
            speed: newLocation.coords.speed,
            timestamp: newLocation.timestamp,
            address: null
          };

          setLocation(locationData);
          setLastKnownLocation(locationData);
          setLocationHistory(prev => [locationData, ...prev.slice(0, 49)]);
          
          // Guardar en AsyncStorage
          saveLocationToStorage(locationData);
        }
      );

      setWatchId(id);
      return true;
    } catch (error) {
      console.error('Error iniciando actualizaciones de ubicación:', error);
      setErrorMsg('Error iniciando actualizaciones de ubicación');
      return false;
    }
  }, [permissionStatus]);

  const stopLocationUpdates = useCallback(() => {
    if (watchId) {
      watchId.remove();
      setWatchId(null);
    }
  }, [watchId]);

  const getAddressFromCoordinates = async (latitude, longitude) => {
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const formattedAddress = [
          address.street,
          address.city,
          address.region,
          address.country
        ].filter(Boolean).join(', ');

        setLocation(prev => prev ? { ...prev, address: formattedAddress } : null);
        setLastKnownLocation(prev => prev ? { ...prev, address: formattedAddress } : null);
        
        return formattedAddress;
      }
    } catch (error) {
      console.error('Error obteniendo dirección:', error);
    }
    
    return null;
  };

  const getCoordinatesFromAddress = async (address) => {
    try {
      const geocode = await Location.geocodeAsync(address);
      
      if (geocode.length > 0) {
        const coordinates = geocode[0];
        return {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude
        };
      }
    } catch (error) {
      console.error('Error obteniendo coordenadas:', error);
    }
    
    return null;
  };

  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  const calculateBearing = useCallback((lat1, lon1, lat2, lon2) => {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    
    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    bearing = (bearing + 360) % 360;
    
    return bearing;
  }, []);

  const isWithinRadius = useCallback((centerLat, centerLon, targetLat, targetLon, radiusKm) => {
    const distance = calculateDistance(centerLat, centerLon, targetLat, targetLon);
    return distance <= radiusKm;
  }, [calculateDistance]);

  const getNearbyPlaces = useCallback(async (types = ['restaurant', 'bar', 'cafe'], radius = 5000) => {
    if (!api || !location) return [];

    try {
      setSearchingNearby(true);
      
      const response = await api.get('/location/nearby-places', {
        params: {
          lat: location.latitude,
          lng: location.longitude,
          radius,
          types: types.join(',')
        }
      });

      if (response?.data?.success) {
        setNearbyPlaces(response.data.data);
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error obteniendo lugares cercanos:', error);
      return [];
    } finally {
      setSearchingNearby(false);
    }
  }, [api, location]);

  const searchNearbyPlaces = useCallback(async (query, types = ['establishment'], radius = 5000) => {
    if (!api || !location) return [];

    try {
      setSearchingNearby(true);
      
      const response = await api.get('/location/search-places', {
        params: {
          query,
          lat: location.latitude,
          lng: location.longitude,
          radius,
          types: types.join(',')
        }
      });

      if (response?.data?.success) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error buscando lugares cercanos:', error);
      return [];
    } finally {
      setSearchingNearby(false);
    }
  }, [api, location]);

  const getRouteToDestination = useCallback(async (destinationLat, destinationLon, mode = 'driving') => {
    if (!api || !location) return null;

    try {
      const response = await api.post('/location/calculate-route', {
        origin: {
          lat: location.latitude,
          lng: location.longitude
        },
        destination: {
          lat: destinationLat,
          lng: destinationLon
        },
        mode
      });

      if (response?.data?.success) {
        return response.data.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error calculando ruta:', error);
      return null;
    }
  }, [api, location]);

  const validateAddress = useCallback(async (address) => {
    if (!api) return null;

    try {
      const response = await api.post('/location/validate-address', { address });
      
      if (response?.data?.success) {
        return response.data.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error validando dirección:', error);
      return null;
    }
  }, [api]);

  const saveLocationToStorage = async (locationData) => {
    try {
      await AsyncStorage.setItem('last_known_location', JSON.stringify(locationData));
    } catch (error) {
      console.error('Error guardando ubicación en storage:', error);
    }
  };

  const loadLastKnownLocation = async () => {
    try {
      const stored = await AsyncStorage.getItem('last_known_location');
      if (stored) {
        const locationData = JSON.parse(stored);
        setLastKnownLocation(locationData);
      }
    } catch (error) {
      console.error('Error cargando ubicación del storage:', error);
    }
  };

  const clearLocationHistory = useCallback(() => {
    setLocationHistory([]);
  }, []);

  const exportLocationHistory = useCallback(() => {
    return locationHistory.map(loc => ({
      ...loc,
      timestamp: new Date(loc.timestamp).toISOString()
    }));
  }, [locationHistory]);

  const getLocationStats = useCallback(() => {
    if (locationHistory.length === 0) return null;

    const totalDistance = locationHistory.reduce((total, loc, index) => {
      if (index === 0) return 0;
      const prevLoc = locationHistory[index - 1];
      return total + calculateDistance(
        prevLoc.latitude,
        prevLoc.longitude,
        loc.latitude,
        loc.longitude
      );
    }, 0);

    const avgSpeed = locationHistory.reduce((total, loc) => {
      return total + (loc.speed || 0);
    }, 0) / locationHistory.length;

    return {
      totalLocations: locationHistory.length,
      totalDistance: totalDistance.toFixed(2),
      averageSpeed: avgSpeed.toFixed(2),
      firstLocation: locationHistory[locationHistory.length - 1],
      lastLocation: locationHistory[0]
    };
  }, [locationHistory, calculateDistance]);

  const setCustomLocation = useCallback((latitude, longitude, address = null) => {
    const customLocation = {
      latitude,
      longitude,
      accuracy: 0,
      altitude: null,
      heading: null,
      speed: null,
      timestamp: Date.now(),
      address,
      isCustom: true
    };

    setLocation(customLocation);
    setLastKnownLocation(customLocation);
    setLocationHistory(prev => [customLocation, ...prev.slice(0, 49)]);
    
    saveLocationToStorage(customLocation);
  }, []);

  const resetLocation = useCallback(() => {
    setLocation(null);
    setErrorMsg(null);
    setLoading(false);
    stopLocationUpdates();
  }, [stopLocationUpdates]);

  return {
    // Estado
    location,
    errorMsg,
    loading,
    permissionStatus,
    locationServicesEnabled,
    nearbyPlaces,
    searchingNearby,
    lastKnownLocation,
    locationHistory,
    
    // Funciones principales
    getCurrentLocation,
    requestLocationPermissions,
    startLocationUpdates,
    stopLocationUpdates,
    
    // Funciones de geocoding
    getAddressFromCoordinates,
    getCoordinatesFromAddress,
    validateAddress,
    
    // Funciones de cálculo
    calculateDistance,
    calculateBearing,
    isWithinRadius,
    
    // Funciones de lugares cercanos
    getNearbyPlaces,
    searchNearbyPlaces,
    
    // Funciones de rutas
    getRouteToDestination,
    
    // Funciones de utilidad
    clearLocationHistory,
    exportLocationHistory,
    getLocationStats,
    setCustomLocation,
    resetLocation,
    
    // Utilidades
    hasLocation: !!location,
    hasPermission: permissionStatus === 'granted',
    isWatching: !!watchId,
    canGetLocation: permissionStatus === 'granted' && locationServicesEnabled,
  };
};