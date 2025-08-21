import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useEvents = () => {
  const { api, isAuthenticated } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    location: null,
    radius: 50,
    date: 'all',
    price: 'all',
    status: 'active'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    hasMore: true
  });

  // Cargar eventos del cache local
  useEffect(() => {
    loadCachedEvents();
  }, []);

  // Cargar eventos cuando cambien los filtros
  useEffect(() => {
    if (isAuthenticated) {
      loadEvents();
    }
  }, [filters, pagination.page, isAuthenticated]);

  const loadCachedEvents = async () => {
    try {
      const cached = await AsyncStorage.getItem('cached_events');
      if (cached) {
        setEvents(JSON.parse(cached));
      }
    } catch (error) {
      console.error('Error cargando eventos del cache:', error);
    }
  };

  const cacheEvents = async (eventsToCache) => {
    try {
      await AsyncStorage.setItem('cached_events', JSON.stringify(eventsToCache));
    } catch (error) {
      console.error('Error guardando eventos en cache:', error);
    }
  };

  const loadEvents = useCallback(async (resetPagination = false) => {
    if (!api) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: resetPagination ? 1 : pagination.page,
        limit: pagination.limit,
        ...filters
      });

      const response = await api.get(`/api/events?${params}`);
      
      if (response?.data?.success) {
        const newEvents = response.data.data.events;
        
        if (resetPagination || pagination.page === 1) {
          setEvents(newEvents);
        } else {
          setEvents(prev => [...prev, ...newEvents]);
        }

        setPagination(prev => ({
          ...prev,
          page: resetPagination ? 1 : prev.page + 1,
          hasMore: newEvents.length === pagination.limit
        }));

        // Cachear eventos
        await cacheEvents(newEvents);
      }
    } catch (error) {
      console.error('Error cargando eventos:', error);
      setError(error.message || 'Error cargando eventos');
    } finally {
      setLoading(false);
    }
  }, [api, filters, pagination.page, pagination.limit]);

  const loadMoreEvents = useCallback(() => {
    if (!loading && pagination.hasMore) {
      loadEvents(false);
    }
  }, [loading, pagination.hasMore, loadEvents]);

  const refreshEvents = useCallback(() => {
    setPagination(prev => ({ ...prev, page: 1, hasMore: true }));
    loadEvents(true);
  }, [loadEvents]);

  const createEvent = useCallback(async (eventData) => {
    if (!api) throw new Error('API no disponible');

    try {
      setLoading(true);
      setError(null);

      const response = await api.post('/api/events', eventData);
      
      if (response?.data?.success) {
        const newEvent = response.data.data;
        setEvents(prev => [newEvent, ...prev]);
        await cacheEvents([newEvent, ...events]);
        return { success: true, event: newEvent };
      } else {
        throw new Error(response?.data?.message || 'Error creando evento');
      }
    } catch (error) {
      console.error('Error creando evento:', error);
      setError(error.message || 'Error creando evento');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [api, events]);

  const updateEvent = useCallback(async (eventId, updateData) => {
    if (!api) throw new Error('API no disponible');

    try {
      setLoading(true);
      setError(null);

      const response = await api.put(`/api/events/${eventId}`, updateData);
      
      if (response?.data?.success) {
        const updatedEvent = response.data.data;
        setEvents(prev => prev.map(event => 
          event._id === eventId ? updatedEvent : event
        ));
        await cacheEvents(events.map(event => 
          event._id === eventId ? updatedEvent : event
        ));
        return { success: true, event: updatedEvent };
      } else {
        throw new Error(response?.data?.message || 'Error actualizando evento');
      }
    } catch (error) {
      console.error('Error actualizando evento:', error);
      setError(error.message || 'Error actualizando evento');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [api, events]);

  const deleteEvent = useCallback(async (eventId) => {
    if (!api) throw new Error('API no disponible');

    try {
      setLoading(true);
      setError(null);

      const response = await api.delete(`/api/events/${eventId}`);
      
      if (response?.data?.success) {
        setEvents(prev => prev.filter(event => event._id !== eventId));
        await cacheEvents(events.filter(event => event._id !== eventId));
        return { success: true };
      } else {
        throw new Error(response?.data?.message || 'Error eliminando evento');
      }
    } catch (error) {
      console.error('Error eliminando evento:', error);
      setError(error.message || 'Error eliminando evento');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [api, events]);

  const joinEvent = useCallback(async (eventId) => {
    if (!api) throw new Error('API no disponible');

    try {
      setError(null);

      const response = await api.post(`/api/events/${eventId}/join`);
      
      if (response?.data?.success) {
        setEvents(prev => prev.map(event => 
          event._id === eventId 
            ? { ...event, attendees: [...(event.attendees || []), response.data.data.userId] }
            : event
        ));
        return { success: true };
      } else {
        throw new Error(response?.data?.message || 'Error uniéndose al evento');
      }
    } catch (error) {
      console.error('Error uniéndose al evento:', error);
      setError(error.message || 'Error uniéndose al evento');
      throw error;
    }
  }, [api]);

  const leaveEvent = useCallback(async (eventId) => {
    if (!api) throw new Error('API no disponible');

    try {
      setError(null);

      const response = await api.delete(`/api/events/${eventId}/leave`);
      
      if (response?.data?.success) {
        setEvents(prev => prev.map(event => 
          event._id === eventId 
            ? { ...event, attendees: (event.attendees || []).filter(id => id !== response.data.data.userId) }
            : event
        ));
        return { success: true };
      } else {
        throw new Error(response?.data?.message || 'Error saliendo del evento');
      }
    } catch (error) {
      console.error('Error saliendo del evento:', error);
      setError(error.message || 'Error saliendo del evento');
      throw error;
    }
  }, [api]);

  const likeEvent = useCallback(async (eventId) => {
    if (!api) throw new Error('API no disponible');

    try {
      setError(null);

      const response = await api.post(`/api/events/${eventId}/like`);
      
      if (response?.data?.success) {
        setEvents(prev => prev.map(event => 
          event._id === eventId 
            ? { ...event, likes: [...(event.likes || []), response.data.data.userId] }
            : event
        ));
        return { success: true };
      } else {
        throw new Error(response?.data?.message || 'Error dando like al evento');
      }
    } catch (error) {
      console.error('Error dando like al evento:', error);
      setError(error.message || 'Error dando like al evento');
      throw error;
    }
  }, [api]);

  const unlikeEvent = useCallback(async (eventId) => {
    if (!api) throw new Error('API no disponible');

    try {
      setError(null);

      const response = await api.post(`/api/events/${eventId}/unlike`);
      
      if (response?.data?.success) {
        setEvents(prev => prev.map(event => 
          event._id === eventId 
            ? { ...event, likes: (event.likes || []).filter(id => id !== response.data.data.userId) }
            : event
        ));
        return { success: true };
      } else {
        throw new Error(response?.data?.message || 'Error quitando like del evento');
      }
    } catch (error) {
      console.error('Error quitando like del evento:', error);
      setError(error.message || 'Error quitando like del evento');
      throw error;
    }
  }, [api]);

  const shareEvent = useCallback(async (eventId, platform) => {
    if (!api) throw new Error('API no disponible');

    try {
      setError(null);

      const response = await api.post(`/api/events/${eventId}/share`, { platform });
      
      if (response?.data?.success) {
        setEvents(prev => prev.map(event => 
          event._id === eventId 
            ? { ...event, shares: (event.shares || 0) + 1 }
            : event
        ));
        return { success: true };
      } else {
        throw new Error(response?.data?.message || 'Error compartiendo evento');
      }
    } catch (error) {
      console.error('Error compartiendo evento:', error);
      setError(error.message || 'Error compartiendo evento');
      throw error;
    }
  }, [api]);

  const saveEvent = useCallback(async (eventId) => {
    if (!api) throw new Error('API no disponible');

    try {
      setError(null);

      const response = await api.post(`/api/events/${eventId}/save`);
      
      if (response?.data?.success) {
        setEvents(prev => prev.map(event => 
          event._id === eventId 
            ? { ...event, saved: true }
            : event
        ));
        return { success: true };
      } else {
        throw new Error(response?.data?.message || 'Error guardando evento');
      }
    } catch (error) {
      console.error('Error guardando evento:', error);
      setError(error.message || 'Error guardando evento');
      throw error;
    }
  }, [api]);

  const unsaveEvent = useCallback(async (eventId) => {
    if (!api) throw new Error('API no disponible');

    try {
      setError(null);

      const response = await api.post(`/api/events/${eventId}/unsave`);
      
      if (response?.data?.success) {
        setEvents(prev => prev.map(event => 
          event._id === eventId 
            ? { ...event, saved: false }
            : event
        ));
        return { success: true };
      } else {
        throw new Error(response?.data?.message || 'Error quitando evento de guardados');
      }
    } catch (error) {
      console.error('Error quitando evento de guardados:', error);
      setError(error.message || 'Error quitando evento de guardados');
      throw error;
    }
  }, [api]);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1, hasMore: true }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      category: 'all',
      location: null,
      radius: 50,
      date: 'all',
      price: 'all',
      status: 'active'
    });
    setPagination(prev => ({ ...prev, page: 1, hasMore: true }));
  }, []);

  const getEventById = useCallback((eventId) => {
    return events.find(event => event._id === eventId);
  }, [events]);

  const getEventsByCategory = useCallback((category) => {
    if (category === 'all') return events;
    return events.filter(event => event.category === category);
  }, [events]);

  const getEventsByLocation = useCallback((latitude, longitude, radius) => {
    return events.filter(event => {
      if (!event.location?.coordinates) return false;
      
      const distance = calculateDistance(
        latitude,
        longitude,
        event.location.coordinates[1],
        event.location.coordinates[0]
      );
      
      return distance <= radius;
    });
  }, [events]);

  const getUpcomingEvents = useCallback(() => {
    const now = new Date();
    return events.filter(event => new Date(event.startDate) > now);
  }, [events]);

  const getPastEvents = useCallback(() => {
    const now = new Date();
    return events.filter(event => new Date(event.endDate) < now);
  }, [events]);

  const getTodayEvents = useCallback(() => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate >= startOfDay && eventDate < endOfDay;
    });
  }, [events]);

  const getWeekendEvents = useCallback(() => {
    const today = new Date();
    const daysUntilWeekend = 6 - today.getDay();
    const startOfWeekend = new Date(today.getTime() + daysUntilWeekend * 24 * 60 * 60 * 1000);
    const endOfWeekend = new Date(startOfWeekend.getTime() + 2 * 24 * 60 * 60 * 1000);
    
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate >= startOfWeekend && eventDate < endOfWeekend;
    });
  }, [events]);

  const getFreeEvents = useCallback(() => {
    return events.filter(event => event.price === 0 || !event.price);
  }, [events]);

  const getPaidEvents = useCallback(() => {
    return events.filter(event => event.price > 0);
  }, [events]);

  const getTrendingEvents = useCallback(() => {
    return [...events]
      .sort((a, b) => {
        const aScore = (a.likes?.length || 0) + (a.attendees?.length || 0) * 2 + (a.shares || 0) * 3;
        const bScore = (b.likes?.length || 0) + (b.attendees?.length || 0) * 2 + (b.shares || 0) * 3;
        return bScore - aScore;
      })
      .slice(0, 10);
  }, [events]);

  const getPopularEvents = useCallback(() => {
    return [...events]
      .sort((a, b) => (b.attendees?.length || 0) - (a.attendees?.length || 0))
      .slice(0, 10);
  }, [events]);

  const getNearbyEvents = useCallback(async (latitude, longitude, radius = 50) => {
    if (!api) return [];

    try {
      const response = await api.get(`/api/events/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`);
      
      if (response?.data?.success) {
        return response.data.data.events;
      }
      return [];
    } catch (error) {
      console.error('Error obteniendo eventos cercanos:', error);
      return [];
    }
  }, [api]);

  const searchEvents = useCallback(async (query, options = {}) => {
    if (!api) return [];

    try {
      const params = new URLSearchParams({
        q: query,
        ...options
      });

      const response = await api.get(`/api/events/search?${params}`);
      
      if (response?.data?.success) {
        return response.data.data.events;
      }
      return [];
    } catch (error) {
      console.error('Error buscando eventos:', error);
      return [];
    }
  }, [api]);

  // Función auxiliar para calcular distancia
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return {
    // Estado
    events,
    loading,
    error,
    filters,
    pagination,
    
    // Acciones principales
    loadEvents,
    loadMoreEvents,
    refreshEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    
    // Interacciones
    joinEvent,
    leaveEvent,
    likeEvent,
    unlikeEvent,
    shareEvent,
    saveEvent,
    unsaveEvent,
    
    // Filtros
    updateFilters,
    clearFilters,
    
    // Búsqueda y filtrado
    getEventById,
    getEventsByCategory,
    getEventsByLocation,
    getUpcomingEvents,
    getPastEvents,
    getTodayEvents,
    getWeekendEvents,
    getFreeEvents,
    getPaidEvents,
    getTrendingEvents,
    getPopularEvents,
    getNearbyEvents,
    searchEvents,
    
    // Utilidades
    hasMore: pagination.hasMore,
    totalEvents: events.length,
  };
};