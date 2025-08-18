'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Event, Location, SearchFilters, PaginationParams } from '@/types'
import { apiClient } from '@/services/apiClient'

interface UseEventsOptions {
  location?: Location | null
  filters?: SearchFilters
  pagination?: PaginationParams
  enabled?: boolean
}

interface UseEventsReturn {
  events: Event[]
  isLoading: boolean
  error: string | null
  refetch: () => void
  createEvent: (eventData: any) => Promise<void>
  updateEvent: (id: string, eventData: any) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
  joinEvent: (id: string) => Promise<void>
  leaveEvent: (id: string) => Promise<void>
  searchEvents: (query: string) => Promise<void>
  clearFilters: () => void
}

export function useEvents(options: UseEventsOptions = {}): UseEventsReturn {
  const {
    location,
    filters = {},
    pagination = { page: 1, limit: 20 },
    enabled = true
  } = options

  const queryClient = useQueryClient()
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters)
  const [searchQuery, setSearchQuery] = useState('')

  // Main events query
  const {
    data: eventsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['events', location, localFilters, pagination],
    queryFn: () => fetchEvents(location, localFilters, pagination),
    enabled: enabled && !!location,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  })

  // AI recommendations query
  const {
    data: recommendations,
    isLoading: recommendationsLoading
  } = useQuery({
    queryKey: ['event-recommendations', location],
    queryFn: () => fetchEventRecommendations(location),
    enabled: enabled && !!location,
    staleTime: 10 * 60 * 1000 // 10 minutes
  })

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: (eventData: any) => apiClient.post('/events', eventData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['event-recommendations'] })
    }
  })

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: ({ id, eventData }: { id: string; eventData: any }) =>
      apiClient.put(`/events/${id}`, eventData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    }
  })

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/events/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    }
  })

  // Join event mutation
  const joinEventMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/events/${id}/join`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['user-events'] })
    }
  })

  // Leave event mutation
  const leaveEventMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/events/${id}/leave`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['user-events'] })
    }
  })

  // Search events mutation
  const searchEventsMutation = useMutation({
    mutationFn: (query: string) => searchEventsByQuery(query, location),
    onSuccess: (data) => {
      // Update local state with search results
      queryClient.setQueryData(['events', location, localFilters, pagination], data)
    }
  })

  // Update filters when they change
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  // Fetch events function
  const fetchEvents = useCallback(async (
    userLocation: Location | null,
    searchFilters: SearchFilters,
    paginationParams: PaginationParams
  ): Promise<Event[]> => {
    if (!userLocation) {
      return []
    }

    try {
      const params = new URLSearchParams({
        lat: userLocation.latitude.toString(),
        lng: userLocation.longitude.toString(),
        page: paginationParams.page.toString(),
        limit: paginationParams.limit.toString(),
        ...searchFilters
      })

      const response = await apiClient.get(`/events/nearby?${params}`)
      return response.data.data || []
    } catch (error) {
      console.error('Error fetching events:', error)
      throw new Error('Error al cargar eventos')
    }
  }, [])

  // Fetch AI recommendations
  const fetchEventRecommendations = useCallback(async (userLocation: Location | null): Promise<Event[]> => {
    if (!userLocation) {
      return []
    }

    try {
      const response = await apiClient.get(`/events/recommendations?lat=${userLocation.latitude}&lng=${userLocation.longitude}`)
      return response.data.data || []
    } catch (error) {
      console.error('Error fetching recommendations:', error)
      return []
    }
  }, [])

  // Search events by query
  const searchEventsByQuery = useCallback(async (query: string, userLocation: Location | null): Promise<Event[]> => {
    if (!userLocation || !query.trim()) {
      return eventsData || []
    }

    try {
      const params = new URLSearchParams({
        q: query,
        lat: userLocation.latitude.toString(),
        lng: userLocation.longitude.toString(),
        page: '1',
        limit: '50'
      })

      const response = await apiClient.get(`/events/search?${params}`)
      return response.data.data || []
    } catch (error) {
      console.error('Error searching events:', error)
      return eventsData || []
    }
  }, [eventsData])

  // Action functions
  const createEvent = useCallback(async (eventData: any) => {
    await createEventMutation.mutateAsync(eventData)
  }, [createEventMutation])

  const updateEvent = useCallback(async (id: string, eventData: any) => {
    await updateEventMutation.mutateAsync({ id, eventData })
  }, [updateEventMutation])

  const deleteEvent = useCallback(async (id: string) => {
    await deleteEventMutation.mutateAsync(id)
  }, [deleteEventMutation])

  const joinEvent = useCallback(async (id: string) => {
    await joinEventMutation.mutateAsync(id)
  }, [joinEventMutation])

  const leaveEvent = useCallback(async (id: string) => {
    await leaveEventMutation.mutateAsync(id)
  }, [leaveEventMutation])

  const searchEvents = useCallback(async (query: string) => {
    setSearchQuery(query)
    await searchEventsMutation.mutateAsync(query)
  }, [searchEventsMutation])

  const clearFilters = useCallback(() => {
    setLocalFilters({})
    setSearchQuery('')
    refetch()
  }, [refetch])

  // Combine regular events with AI recommendations
  const allEvents = [...(eventsData || []), ...(recommendations || [])]
  
  // Remove duplicates and sort by AI score and popularity
  const uniqueEvents = allEvents
    .filter((event, index, self) => 
      index === self.findIndex(e => e.id === event.id)
    )
    .sort((a, b) => {
      // Sort by AI score first, then by popularity
      if (a.aiScore !== b.aiScore) {
        return b.aiScore - a.aiScore
      }
      return b.popularity - a.popularity
    })

  return {
    events: uniqueEvents,
    isLoading: isLoading || recommendationsLoading,
    error: error?.message || null,
    refetch,
    createEvent,
    updateEvent,
    deleteEvent,
    joinEvent,
    leaveEvent,
    searchEvents,
    clearFilters
  }
}

// Hook for user's own events
export function useUserEvents(userId?: string) {
  return useQuery({
    queryKey: ['user-events', userId],
    queryFn: () => apiClient.get(`/users/${userId}/events`).then(res => res.data.data),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000 // 2 minutes
  })
}

// Hook for event details
export function useEventDetails(eventId: string) {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: () => apiClient.get(`/events/${eventId}`).then(res => res.data.data),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}

// Hook for event categories
export function useEventCategories() {
  return useQuery({
    queryKey: ['event-categories'],
    queryFn: () => apiClient.get('/events/categories').then(res => res.data.data),
    staleTime: 60 * 60 * 1000 // 1 hour
  })
}

// Hook for trending events
export function useTrendingEvents(location?: Location | null) {
  return useQuery({
    queryKey: ['trending-events', location],
    queryFn: () => {
      if (!location) return Promise.resolve([])
      return apiClient.get(`/events/trending?lat=${location.latitude}&lng=${location.longitude}`)
        .then(res => res.data.data)
    },
    enabled: !!location,
    staleTime: 10 * 60 * 1000 // 10 minutes
  })
}
