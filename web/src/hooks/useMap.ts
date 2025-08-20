'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGeolocation } from './useGeolocation';

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface MapViewport {
  center: [number, number];
  zoom: number;
  bounds?: MapBounds;
}

interface MapMarker {
  id: string;
  position: [number, number];
  type: 'event' | 'tribe' | 'user' | 'venue';
  data: any;
  popup?: {
    title: string;
    content: string;
    image?: string;
  };
}

interface UseMapOptions {
  initialCenter?: [number, number];
  initialZoom?: number;
  enableClustering?: boolean;
  maxZoom?: number;
  minZoom?: number;
}

interface UseMapReturn {
  viewport: MapViewport;
  markers: MapMarker[];
  selectedMarker: MapMarker | null;
  isLoading: boolean;
  error: string | null;
  setViewport: (viewport: MapViewport) => void;
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  addMarker: (marker: MapMarker) => void;
  removeMarker: (id: string) => void;
  selectMarker: (id: string | null) => void;
  fitBounds: (bounds: MapBounds) => void;
  flyTo: (center: [number, number], zoom?: number) => void;
  getMapBounds: () => MapBounds | null;
  clearMarkers: () => void;
}

export const useMap = (options: UseMapOptions = {}): UseMapReturn => {
  const {
    initialCenter = [19.4326, -99.1332], // Mexico City default
    initialZoom = 12,
    enableClustering = true,
    maxZoom = 18,
    minZoom = 3,
  } = options;

  const { location: userLocation } = useGeolocation();
  const mapRef = useRef<any>(null);
  
  const [viewport, setViewport] = useState<MapViewport>({
    center: initialCenter,
    zoom: initialZoom,
  });
  
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update center when user location changes
  useEffect(() => {
    if (userLocation && !isLoading) {
      const newCenter: [number, number] = [userLocation.latitude, userLocation.longitude];
      setViewport(prev => ({
        ...prev,
        center: newCenter,
      }));
    }
  }, [userLocation, isLoading]);

  const setCenter = useCallback((center: [number, number]) => {
    setViewport(prev => ({
      ...prev,
      center,
    }));
  }, []);

  const setZoom = useCallback((zoom: number) => {
    const clampedZoom = Math.max(minZoom, Math.min(maxZoom, zoom));
    setViewport(prev => ({
      ...prev,
      zoom: clampedZoom,
    }));
  }, [minZoom, maxZoom]);

  const addMarker = useCallback((marker: MapMarker) => {
    setMarkers(prev => {
      // Check if marker already exists
      const exists = prev.find(m => m.id === marker.id);
      if (exists) {
        return prev.map(m => m.id === marker.id ? marker : m);
      }
      return [...prev, marker];
    });
  }, []);

  const removeMarker = useCallback((id: string) => {
    setMarkers(prev => prev.filter(m => m.id !== id));
    
    // Clear selection if removed marker was selected
    if (selectedMarker?.id === id) {
      setSelectedMarker(null);
    }
  }, [selectedMarker]);

  const selectMarker = useCallback((id: string | null) => {
    if (id === null) {
      setSelectedMarker(null);
      return;
    }
    
    const marker = markers.find(m => m.id === id);
    if (marker) {
      setSelectedMarker(marker);
      
      // Fly to marker position
      flyTo(marker.position, Math.max(viewport.zoom, 15));
    }
  }, [markers, viewport.zoom]);

  const fitBounds = useCallback((bounds: MapBounds) => {
    setViewport(prev => ({
      ...prev,
      bounds,
    }));
  }, []);

  const flyTo = useCallback((center: [number, number], zoom?: number) => {
    setViewport(prev => ({
      ...prev,
      center,
      zoom: zoom || prev.zoom,
    }));
  }, []);

  const getMapBounds = useCallback((): MapBounds | null => {
    if (!mapRef.current) return null;
    
    // This would typically get bounds from the map instance
    // For now, we'll calculate approximate bounds from markers
    if (markers.length === 0) return null;
    
    const lats = markers.map(m => m.position[0]);
    const lngs = markers.map(m => m.position[1]);
    
    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs),
    };
  }, [markers]);

  const clearMarkers = useCallback(() => {
    setMarkers([]);
    setSelectedMarker(null);
  }, []);

  // Filter markers by type
  const getMarkersByType = useCallback((type: string) => {
    return markers.filter(m => m.type === type);
  }, [markers]);

  // Get markers within current viewport
  const getMarkersInViewport = useCallback(() => {
    if (!viewport.bounds) return markers;
    
    return markers.filter(marker => {
      const [lat, lng] = marker.position;
      return (
        lat >= viewport.bounds!.south &&
        lat <= viewport.bounds!.north &&
        lng >= viewport.bounds!.west &&
        lng <= viewport.bounds!.east
      );
    });
  }, [markers, viewport.bounds]);

  // Search markers by query
  const searchMarkers = useCallback((query: string) => {
    if (!query.trim()) return markers;
    
    const searchTerm = query.toLowerCase();
    return markers.filter(marker => {
      const searchableText = [
        marker.data.title || '',
        marker.data.name || '',
        marker.data.description || '',
        marker.data.category || '',
        marker.data.tags?.join(' ') || '',
      ].join(' ').toLowerCase();
      
      return searchableText.includes(searchTerm);
    });
  }, [markers]);

  // Group markers by proximity for clustering
  const getClusteredMarkers = useCallback((clusterRadius: number = 0.01) => {
    if (!enableClustering) return markers;
    
    const clusters: MapMarker[][] = [];
    const processed = new Set<string>();
    
    markers.forEach(marker => {
      if (processed.has(marker.id)) return;
      
      const cluster = [marker];
      processed.add(marker.id);
      
      markers.forEach(otherMarker => {
        if (processed.has(otherMarker.id)) return;
        
        const distance = calculateDistance(marker.position, otherMarker.position);
        if (distance <= clusterRadius) {
          cluster.push(otherMarker);
          processed.add(otherMarker.id);
        }
      });
      
      if (cluster.length > 1) {
        clusters.push(cluster);
      } else {
        clusters.push([marker]);
      }
    });
    
    return clusters;
  }, [markers, enableClustering]);

  // Helper function to calculate distance between two points
  const calculateDistance = (pos1: [number, number], pos2: [number, number]): number => {
    const [lat1, lng1] = pos1;
    const [lat2, lng2] = pos2;
    
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return {
    viewport,
    markers,
    selectedMarker,
    isLoading,
    error,
    setViewport,
    setCenter,
    setZoom,
    addMarker,
    removeMarker,
    selectMarker,
    fitBounds,
    flyTo,
    getMapBounds,
    clearMarkers,
    // Additional utility functions
    getMarkersByType,
    getMarkersInViewport,
    searchMarkers,
    getClusteredMarkers,
  };
};

export default useMap;