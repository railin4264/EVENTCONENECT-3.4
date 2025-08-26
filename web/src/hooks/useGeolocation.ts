'use client';

import { useState, useEffect, useCallback } from 'react';

interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

interface GeolocationError {
  code: number;
  message: string;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean;
}

interface UseGeolocationReturn {
  location: Location | null;
  error: GeolocationError | null;
  isLoading: boolean;
  getCurrentPosition: () => Promise<void>;
  watchPosition: () => void;
  clearWatch: () => void;
}

export const useGeolocation = (
  options: UseGeolocationOptions = {}
): UseGeolocationReturn => {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<GeolocationError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 60000,
    watch = false,
  } = options;

  const successCallback = useCallback((position: GeolocationPosition) => {
    const newLocation: Location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
    };

    setLocation(newLocation);
    setError(null);
    setIsLoading(false);

    // Save to localStorage for persistence
    localStorage.setItem('userLocation', JSON.stringify(newLocation));
  }, []);

  const errorCallback = useCallback(
    (geolocationError: GeolocationPositionError) => {
      const error: GeolocationError = {
        code: geolocationError.code,
        message: getErrorMessage(geolocationError.code),
      };

      setError(error);
      setIsLoading(false);
      setLocation(null);
    },
    []
  );

  const getCurrentPosition = useCallback(async (): Promise<void> => {
    if (!navigator.geolocation) {
      setError({
        code: 0,
        message: 'Geolocalización no está soportada en este navegador',
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy,
            timeout,
            maximumAge,
          });
        }
      );

      successCallback(position);
    } catch (geolocationError: any) {
      errorCallback(geolocationError);
    }
  }, [enableHighAccuracy, timeout, maximumAge, successCallback, errorCallback]);

  const watchPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError({
        code: 0,
        message: 'Geolocalización no está soportada en este navegador',
      });
      return;
    }

    const id = navigator.geolocation.watchPosition(
      successCallback,
      errorCallback,
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    );

    setWatchId(id);
  }, [enableHighAccuracy, timeout, maximumAge, successCallback, errorCallback]);

  const clearWatch = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  // Load saved location from localStorage on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        const parsedLocation = JSON.parse(savedLocation);
        setLocation(parsedLocation);
      } catch (error) {
        console.error('Error parsing saved location:', error);
        localStorage.removeItem('userLocation');
      }
    }
  }, []);

  // Auto-start watching if watch option is enabled
  useEffect(() => {
    if (watch && !watchId) {
      watchPosition();
    }

    return () => {
      if (watchId) {
        clearWatch();
      }
    };
  }, [watch, watchId, watchPosition, clearWatch]);

  // Get current position on mount if no saved location
  useEffect(() => {
    if (!location && !isLoading && !error) {
      getCurrentPosition();
    }
  }, [location, isLoading, error, getCurrentPosition]);

  return {
    location,
    error,
    isLoading,
    getCurrentPosition,
    watchPosition,
    clearWatch,
  };
};

// Helper function to get user-friendly error messages
const getErrorMessage = (code: number): string => {
  switch (code) {
    case 1:
      return 'Permiso denegado para acceder a la ubicación';
    case 2:
      return 'No se pudo obtener la ubicación actual';
    case 3:
      return 'Tiempo de espera agotado al obtener la ubicación';
    default:
      return 'Error desconocido al obtener la ubicación';
  }
};

// Hook for getting nearby places based on coordinates
export const useNearbyPlaces = (
  location: Location | null,
  radius: number = 5000
) => {
  const [places, setPlaces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNearbyPlaces = useCallback(async () => {
    if (!location) return;

    setIsLoading(true);
    setError(null);

    try {
      // This would typically call your backend API
      // For now, we'll simulate with a mock response
      const response = await fetch(
        `/api/places/nearby?lat=${location.latitude}&lng=${location.longitude}&radius=${radius}`
      );

      if (!response.ok) {
        throw new Error('Error al obtener lugares cercanos');
      }

      const data = await response.json();
      setPlaces(data.places || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [location, radius]);

  useEffect(() => {
    if (location) {
      fetchNearbyPlaces();
    }
  }, [location, fetchNearbyPlaces]);

  return {
    places,
    isLoading,
    error,
    refetch: fetchNearbyPlaces,
  };
};

// Hook for calculating distance between two points
export const useDistance = (
  point1: Location | null,
  point2: Location | null
) => {
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    if (point1 && point2) {
      const calculatedDistance = calculateDistance(point1, point2);
      setDistance(calculatedDistance);
    }
  }, [point1, point2]);

  return distance;
};

// Helper function to calculate distance between two points (Haversine formula)
const calculateDistance = (point1: Location, point2: Location): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const dLon = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1.latitude * Math.PI) / 180) *
      Math.cos((point2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default useGeolocation;
