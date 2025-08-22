'use client';

import { useState, useEffect } from 'react';

// ===== INTERFACES =====
interface LocationData {
  city: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

interface GeolocationState {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
}

// ===== MOCK DATA PARA DEMO =====
const mockLocation: LocationData = {
  city: 'Madrid',
  country: 'España',
  coordinates: {
    latitude: 40.4168,
    longitude: -3.7038
  }
};

// ===== HOOK PRINCIPAL =====
export const useGeolocation = (): GeolocationState => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simular obtención de ubicación
    const timer = setTimeout(() => {
      // Para demo, usar ubicación mock
      setLocation(mockLocation);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return {
    location,
    loading,
    error
  };
};

// Hook for getting nearby places based on coordinates
export const useNearbyPlaces = (location: LocationData | null, radius: number = 5000) => {
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
        `/api/places/nearby?lat=${location.coordinates.latitude}&lng=${location.coordinates.longitude}&radius=${radius}`
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
export const useDistance = (point1: LocationData | null, point2: LocationData | null) => {
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
const calculateDistance = (point1: LocationData, point2: LocationData): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (point2.coordinates.latitude - point1.coordinates.latitude) * Math.PI / 180;
  const dLon = (point2.coordinates.longitude - point1.coordinates.longitude) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(point1.coordinates.latitude * Math.PI / 180) * Math.cos(point2.coordinates.latitude * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default useGeolocation;