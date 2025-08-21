'use client'

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from './useAuth';

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  host: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    rating: number;
    reviewCount: number;
  };
  location: {
    coordinates: [number, number];
    address: string;
    city: string;
    country: string;
    venue?: string;
  };
  dateTime: {
    start: string;
    end: string;
    timezone: string;
  };
  capacity: {
    max: number;
    current: number;
    waitlist: number;
  };
  pricing: {
    isFree: boolean;
    amount?: number;
    currency?: string;
    earlyBird?: {
      amount: number;
      endDate: string;
    };
  };
  media: {
    images: string[];
    videos: string[];
  };
  attendees: Array<{
    user: {
      id: string;
      username: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
    status: 'confirmed' | 'pending' | 'waitlist' | 'cancelled';
    joinedAt: string;
    isHost: boolean;
  }>;
  reviews: Array<{
    id: string;
    user: {
      id: string;
      username: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
    rating: number;
    comment: string;
    createdAt: string;
  }>;
  stats: {
    viewCount: number;
    shareCount: number;
    saveCount: number;
    averageRating: number;
    reviewCount: number;
  };
  settings: {
    isPublic: boolean;
    allowComments: boolean;
    requireApproval: boolean;
    maxWaitlist: number;
  };
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EventFilters {
  category?: string;
  location?: {
    coordinates: [number, number];
    radius?: number;
  };
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  tags?: string[];
  hostId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

interface CreateEventData {
  title: string;
  description: string;
  category: string;
  tags?: string[];
  location: {
    coordinates: [number, number];
    address: string;
    city: string;
    country: string;
    venue?: string;
  };
  dateTime: {
    start: string;
    end: string;
    timezone: string;
  };
  capacity: {
    max: number;
  };
  pricing: {
    isFree: boolean;
    amount?: number;
    currency?: string;
    earlyBird?: {
      amount: number;
      endDate: string;
    };
  };
  settings?: {
    isPublic?: boolean;
    allowComments?: boolean;
    requireApproval?: boolean;
    maxWaitlist?: number;
  };
}

interface UpdateEventData extends Partial<CreateEventData> {
  id: string;
}

// Fetch events with filters
const fetchEvents = async (filters: EventFilters = {}): Promise<{ events: Event[]; pagination: any }> => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (key === 'location' && typeof value === 'object') {
        // Backend expects latitude/longitude explicitly
        const [latitude, longitude] = value.coordinates;
        params.append('latitude', latitude.toString());
        params.append('longitude', longitude.toString());
        if (value.radius) params.append('radius', value.radius.toString());
      } else if (key === 'dateRange' && typeof value === 'object') {
        params.append('dateRange[start]', value.start);
        params.append('dateRange[end]', value.end);
      } else if (key === 'priceRange' && typeof value === 'object') {
        params.append('priceRange[min]', value.min.toString());
        params.append('priceRange[max]', value.max.toString());
      } else if (key === 'tags' && Array.isArray(value)) {
        value.forEach(tag => params.append('tags', tag));
      } else {
        params.append(key, value.toString());
      }
    }
  });

  const response = await api.get(`/api/events?${params.toString()}`);
  return response.data;
};

// Fetch single event
const fetchEvent = async (id: string): Promise<Event> => {
  const response = await api.get(`/api/events/${id}`);
  return response.data.event;
};

// Create event
const createEvent = async (data: CreateEventData): Promise<Event> => {
  const response = await api.post('/api/events', data);
  return response.data.event;
};

// Update event
const updateEvent = async (data: UpdateEventData): Promise<Event> => {
  const { id, ...updateData } = data;
  const response = await api.put(`/api/events/${id}`, updateData);
  return response.data.event;
};

// Delete event
const deleteEvent = async (id: string): Promise<void> => {
  await api.delete(`/api/events/${id}`);
};

// Join event
const joinEvent = async (eventId: string): Promise<Event> => {
  const response = await api.post(`/api/events/${eventId}/join`);
  return response.data.event;
};

// Leave event
const leaveEvent = async (eventId: string): Promise<Event> => {
  const response = await api.delete(`/api/events/${eventId}/leave`);
  return response.data.event;
};

// Get user's events
const fetchUserEvents = async (userId: string, type: 'all' | 'created' | 'attending' | 'past' = 'all'): Promise<Event[]> => {
  const response = await api.get(`/api/events/user/${userId}?type=${type}`);
  return response.data.events;
};

// Get nearby events
const fetchNearbyEvents = async (coordinates: [number, number], radius: number = 50): Promise<Event[]> => {
  const response = await api.get(`/api/events/nearby?lat=${coordinates[0]}&lng=${coordinates[1]}&radius=${radius}`);
  return response.data.events;
};

// Get event recommendations
const fetchEventRecommendations = async (userId: string): Promise<Event[]> => {
  const response = await api.get(`/api/events/recommendations`);
  return response.data.events;
};

export const useEvents = (filters: EventFilters = {}) => {
  const queryClient = useQueryClient();

  // Main events query
  const {
    data: eventsData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['events', filters],
    () => fetchEvents(filters),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  // Create event mutation
  const createEventMutation = useMutation(createEvent, {
    onSuccess: (newEvent) => {
      // Invalidate and refetch events
      queryClient.invalidateQueries(['events']);
      queryClient.invalidateQueries(['user', newEvent.host.id, 'events']);
      
      // Add new event to cache
      queryClient.setQueryData(['events', newEvent.id], newEvent);
    },
  });

  // Update event mutation
  const updateEventMutation = useMutation(updateEvent, {
    onSuccess: (updatedEvent) => {
      // Update event in cache
      queryClient.setQueryData(['events', updatedEvent.id], updatedEvent);
      queryClient.invalidateQueries(['events']);
      queryClient.invalidateQueries(['user', updatedEvent.host.id, 'events']);
    },
  });

  // Delete event mutation
  const deleteEventMutation = useMutation(deleteEvent, {
    onSuccess: (_, eventId) => {
      // Remove event from cache
      queryClient.removeQueries(['events', eventId]);
      queryClient.invalidateQueries(['events']);
    },
  });

  // Join event mutation
  const joinEventMutation = useMutation(joinEvent, {
    onSuccess: (updatedEvent) => {
      // Update event in cache
      queryClient.setQueryData(['events', updatedEvent.id], updatedEvent);
      queryClient.invalidateQueries(['events']);
      queryClient.invalidateQueries(['user', 'events']);
    },
  });

  // Leave event mutation
  const leaveEventMutation = useMutation(leaveEvent, {
    onSuccess: (updatedEvent) => {
      // Update event in cache
      queryClient.setQueryData(['events', updatedEvent.id], updatedEvent);
      queryClient.invalidateQueries(['events']);
      queryClient.invalidateQueries(['user', 'events']);
    },
  });

  return {
    // Data
    events: eventsData?.events || [],
    pagination: eventsData?.pagination,
    
    // State
    isLoading,
    error,
    
    // Actions
    refetch,
    createEvent: createEventMutation.mutateAsync,
    updateEvent: updateEventMutation.mutateAsync,
    deleteEvent: deleteEventMutation.mutateAsync,
    joinEvent: joinEventMutation.mutateAsync,
    leaveEvent: leaveEventMutation.mutateAsync,
    
    // Mutations state
    isCreating: createEventMutation.isLoading,
    isUpdating: updateEventMutation.isLoading,
    isDeleting: deleteEventMutation.isLoading,
    isJoining: joinEventMutation.isLoading,
    isLeaving: leaveEventMutation.isLoading,
  };
};

// Hook for single event
export const useEvent = (id: string) => {
  const queryClient = useQueryClient();

  const {
    data: event,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['events', id],
    () => fetchEvent(id),
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );

  return {
    event,
    isLoading,
    error,
    refetch,
  };
};

// Hook for user events
export const useUserEvents = (userId: string, type: 'all' | 'created' | 'attending' | 'past' = 'all') => {
  const {
    data: events,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['user', userId, 'events', type],
    () => fetchUserEvents(userId, type),
    {
      enabled: !!userId,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );

  return {
    events: events || [],
    isLoading,
    error,
    refetch,
  };
};

// Hook for nearby events
export const useNearbyEvents = (coordinates: [number, number], radius: number = 50) => {
  const {
    data: events,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['events', 'nearby', coordinates, radius],
    () => fetchNearbyEvents(coordinates, radius),
    {
      enabled: !!coordinates,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );

  return {
    events: events || [],
    isLoading,
    error,
    refetch,
  };
};

// Hook for event recommendations
export const useEventRecommendations = (userId: string) => {
  const {
    data: events,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['events', 'recommendations', userId],
    () => fetchEventRecommendations(userId),
    {
      enabled: !!userId,
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 15 * 60 * 1000, // 15 minutes
    }
  );

  return {
    events: events || [],
    isLoading,
    error,
    refetch,
  };
};

export type { Event, EventFilters, CreateEventData, UpdateEventData };
