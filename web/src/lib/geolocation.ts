// Servicio de geolocalización para eventos cercanos
import { useState, useEffect } from 'react';

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
}

export interface NearbyEventsOptions {
  userLocation: UserLocation;
  radiusKm?: number;
  maxResults?: number;
  categories?: string[];
}

// Obtener ubicación del usuario
export const getUserLocation = (): Promise<UserLocation> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalización no soportada por este navegador'));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutos
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now()
        });
      },
      (error) => {
        let errorMessage = 'Error desconocido';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso de ubicación denegado por el usuario';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Información de ubicación no disponible';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado para obtener ubicación';
            break;
        }
        
        reject(new Error(errorMessage));
      },
      options
    );
  });
};

// Calcular distancia entre dos puntos (fórmula de Haversine)
export const calculateDistance = (
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRadians(point2.lat - point1.lat);
  const dLng = toRadians(point2.lng - point1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.lat)) * Math.cos(toRadians(point2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Redondear a 2 decimales
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

// Filtrar eventos por proximidad
export const filterEventsByProximity = <T extends { lat: number; lng: number }>(
  events: T[],
  userLocation: UserLocation,
  radiusKm: number = 10
): Array<T & { distance: number }> => {
  return events
    .map(event => ({
      ...event,
      distance: calculateDistance(userLocation, event)
    }))
    .filter(event => event.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
};

// Obtener eventos cercanos desde la API
export const getNearbyEvents = async (options: NearbyEventsOptions) => {
  const { userLocation, radiusKm = 10, maxResults = 50, categories } = options;
  
  try {
    const params = new URLSearchParams({
      lat: userLocation.lat.toString(),
      lng: userLocation.lng.toString(),
      radius: radiusKm.toString(),
      limit: maxResults.toString(),
      ...(categories && categories.length > 0 && { categories: categories.join(',') })
    });

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/nearby?${params}`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error obteniendo eventos cercanos:', error);
    throw error;
  }
};

// Hook personalizado para geolocalización
export const useGeolocation = () => {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userLocation = await getUserLocation();
      setLocation(userLocation);
      
      // Guardar en localStorage para uso posterior
      localStorage.setItem('userLocation', JSON.stringify(userLocation));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      
      // Intentar cargar ubicación guardada
      const savedLocation = localStorage.getItem('userLocation');
      if (savedLocation) {
        try {
          const parsedLocation = JSON.parse(savedLocation);
          setLocation(parsedLocation);
        } catch (parseError) {
          console.error('Error parsing saved location:', parseError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Cargar ubicación guardada al inicializar
  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        const parsedLocation = JSON.parse(savedLocation);
        // Verificar si la ubicación no es muy antigua (más de 1 hora)
        if (parsedLocation.timestamp && Date.now() - parsedLocation.timestamp < 3600000) {
          setLocation(parsedLocation);
        }
      } catch (error) {
        console.error('Error loading saved location:', error);
      }
    }
  }, []);

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    clearLocation: () => {
      setLocation(null);
      localStorage.removeItem('userLocation');
    }
  };
};

// Formatear distancia para mostrar al usuario
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  } else if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)}km`;
  } else {
    return `${Math.round(distanceKm)}km`;
  }
};

// Obtener dirección aproximada usando geocoding inverso
export const getAddressFromCoordinates = async (
  lat: number, 
  lng: number
): Promise<string> => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    
    return 'Ubicación desconocida';
  } catch (error) {
    console.error('Error getting address:', error);
    return 'Ubicación desconocida';
  }
};

// Configuración por defecto
export const DEFAULT_LOCATION = {
  lat: parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LAT || '40.4168'),
  lng: parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LNG || '-3.7038')
};

export const DEFAULT_ZOOM = parseInt(process.env.NEXT_PUBLIC_DEFAULT_ZOOM || '12');
export const DEFAULT_RADIUS_KM = parseInt(process.env.NEXT_PUBLIC_SEARCH_RADIUS_KM || '10');
