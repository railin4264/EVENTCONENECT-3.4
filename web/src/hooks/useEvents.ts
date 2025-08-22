'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsAPI } from '@/services/api';

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
  priceRange?: {
    min: number;
    max: number;
  };
  tags?: string[];
  status?: string;
  hostId?: string;
  userId?: string;
  type?: 'all' | 'created' | 'attending' | 'past';
  recommendations?: boolean;
}

interface CreateEventData {
  title: string;
  description: string;
  category: string;
  tags: string[];
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
  settings: {
    isPublic: boolean;
    allowComments: boolean;
    requireApproval: boolean;
    maxWaitlist: number;
  };
}

interface UpdateEventData {
  id: string;
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  location?: {
    coordinates: [number, number];
    address: string;
    city: string;
    country: string;
    venue?: string;
  };
  dateTime?: {
    start: string;
    end: string;
    timezone: string;
  };
  capacity?: {
    max: number;
  };
  pricing?: {
    isFree: boolean;
    amount?: number;
    currency?: string;
    earlyBird?: {
      amount: number;
      endDate: string;
    };
  };
  settings?: {
    isPublic: boolean;
    allowComments: boolean;
    requireApproval: boolean;
    maxWaitlist: number;
  };
}

// Fetch events with filters
const fetchEvents = async (
  filters: EventFilters = {}
): Promise<{ events: Event[]; pagination: any }> => {
  const params: any = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (key === 'location' && typeof value === 'object') {
        // Backend expects latitude/longitude explicitly
        const [latitude, longitude] = value.coordinates;
        params.latitude = latitude;
        params.longitude = longitude;
        if (value.radius) params.radius = value.radius;
      } else if (key === 'dateRange' && typeof value === 'object') {
        params.dateRange = value;
      } else if (key === 'priceRange' && typeof value === 'object') {
        params.priceRange = value;
      } else if (key === 'tags' && Array.isArray(value)) {
        params.tags = value;
      } else {
        params[key] = value;
      }
    }
  });

  return eventsAPI.getEvents(params);
};

// Fetch single event
const fetchEvent = async (id: string): Promise<Event> => {
  return eventsAPI.getEvent(id);
};

// Create event
const createEvent = async (data: CreateEventData): Promise<Event> => {
  return eventsAPI.createEvent(data);
};

// Update event
const updateEvent = async (data: UpdateEventData): Promise<Event> => {
  const { id, ...updateData } = data;
  return eventsAPI.updateEvent(id, updateData);
};

// Delete event
const deleteEvent = async (id: string): Promise<void> => {
  await eventsAPI.deleteEvent(id);
};

// Join event
const joinEvent = async (eventId: string): Promise<Event> => {
  return eventsAPI.joinEvent(eventId);
};

// Leave event
const leaveEvent = async (eventId: string): Promise<Event> => {
  return eventsAPI.leaveEvent(eventId);
};

// Get user's events
const fetchUserEvents = async (
  userId: string,
  type: 'all' | 'created' | 'attending' | 'past' = 'all'
): Promise<Event[]> => {
  const params = { userId, type };
  const result = await eventsAPI.getEvents(params);
  return result.events || [];
};

// Get nearby events
const fetchNearbyEvents = async (
  coordinates: [number, number],
  radius: number = 50
): Promise<Event[]> => {
  const params = { lat: coordinates[0], lng: coordinates[1], radius };
  const result = await eventsAPI.getEvents(params);
  return result.events || [];
};

// Get event recommendations
const fetchEventRecommendations = async (_userId: string): Promise<Event[]> => {
  const params = { recommendations: true };
  const result = await eventsAPI.getEvents(params);
  return result.events || [];
};

export const useEvents = (filters: EventFilters = {}) => {
  const queryClient = useQueryClient();

  // Main events query
  const {
    data: eventsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['events', filters],
    queryFn: () => fetchEvents(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (cacheTime renamed to gcTime in v4)
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: (newEvent: Event) => {
      // Invalidate and refetch events
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({
        queryKey: ['user', newEvent.host.id, 'events'],
      });

      // Add new event to cache
      queryClient.setQueryData(['events', newEvent.id], newEvent);
    },
  });

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: updateEvent,
    onSuccess: (updatedEvent: Event) => {
      // Update event in cache
      queryClient.setQueryData(['events', updatedEvent.id], updatedEvent);
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({
        queryKey: ['user', updatedEvent.host.id, 'events'],
      });
    },
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: (_: void, eventId: string) => {
      // Remove event from cache
      queryClient.removeQueries({ queryKey: ['events', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  // Join event mutation
  const joinEventMutation = useMutation({
    mutationFn: joinEvent,
    onSuccess: (updatedEvent: Event) => {
      // Update event in cache
      queryClient.setQueryData(['events', updatedEvent.id], updatedEvent);
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'events'] });
    },
  });

  // Leave event mutation
  const leaveEventMutation = useMutation({
    mutationFn: leaveEvent,
    onSuccess: (updatedEvent: Event) => {
      // Update event in cache
      queryClient.setQueryData(['events', updatedEvent.id], updatedEvent);
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'events'] });
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
    isCreating: createEventMutation.isPending,
    isUpdating: updateEventMutation.isPending,
    isDeleting: deleteEventMutation.isPending,
    isJoining: joinEventMutation.isPending,
    isLeaving: leaveEventMutation.isPending,
  };
};

// Hook for single event
export const useEvent = (id: string) => {
  const {
    data: event,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['events', id],
    queryFn: () => fetchEvent(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    event,
    isLoading,
    error,
    refetch,
  };
};

// Hook for user events
export const useUserEvents = (
  userId: string,
  type: 'all' | 'created' | 'attending' | 'past' = 'all'
) => {
  const {
    data: events,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['user', userId, 'events', type],
    queryFn: () => fetchUserEvents(userId, type),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    events: events || [],
    isLoading,
    error,
    refetch,
  };
};

// Hook for nearby events
export const useNearbyEvents = (
  coordinates: [number, number],
  radius: number = 50
) => {
  const {
    data: events,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['events', 'nearby', coordinates, radius],
    queryFn: () => fetchNearbyEvents(coordinates, radius),
    enabled: !!coordinates,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

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
  } = useQuery({
    queryKey: ['events', 'recommendations', userId],
    queryFn: () => fetchEventRecommendations(userId),
    enabled: !!userId,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  return {
    events: events || [],
    isLoading,
    error,
    refetch,
  };
};

export type { Event, EventFilters, CreateEventData, UpdateEventData };
