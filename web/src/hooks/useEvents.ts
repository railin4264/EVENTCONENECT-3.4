'use client'

import { useState, useEffect } from 'react';

// ===== INTERFACES =====
interface Event {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  location: string;
  distance: string;
  attendees: number;
  price: number;
  category: string;
  host: {
    name: string;
    avatar: string;
  };
  isPopular?: boolean;
  isTrending?: boolean;
  friendsAttending?: number;
}

interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  joinEvent: (eventId: string) => Promise<void>;
  leaveEvent: (eventId: string) => Promise<void>;
  createEvent: (eventData: Partial<Event>) => Promise<void>;
}

// ===== HOOK PRINCIPAL =====
export const useEvents = (): UseEventsReturn => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const joinEvent = async (eventId: string) => {
    setLoading(true);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Actualizar eventos localmente
      setEvents(prev => 
        prev.map(event => 
          event.id === eventId 
            ? { ...event, attendees: event.attendees + 1 }
            : event
        )
      );
    } catch (err) {
      setError('Error al unirse al evento');
    } finally {
      setLoading(false);
    }
  };

  const leaveEvent = async (eventId: string) => {
    setLoading(true);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Actualizar eventos localmente
      setEvents(prev => 
        prev.map(event => 
          event.id === eventId 
            ? { ...event, attendees: Math.max(0, event.attendees - 1) }
            : event
        )
      );
    } catch (err) {
      setError('Error al abandonar el evento');
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: Partial<Event>) => {
    setLoading(true);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newEvent: Event = {
        id: Date.now().toString(),
        title: eventData.title || '',
        description: eventData.description || '',
        image: eventData.image || '',
        date: eventData.date || '',
        location: eventData.location || '',
        distance: '0 km',
        attendees: 1,
        price: eventData.price || 0,
        category: eventData.category || '',
        host: {
          name: 'Usuario Actual',
          avatar: '/avatars/user.jpg'
        }
      };
      
      setEvents(prev => [newEvent, ...prev]);
    } catch (err) {
      setError('Error al crear el evento');
    } finally {
      setLoading(false);
    }
  };

  return {
    events,
    loading,
    error,
    joinEvent,
    leaveEvent,
    createEvent
  };
};
