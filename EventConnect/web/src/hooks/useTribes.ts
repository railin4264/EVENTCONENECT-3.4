'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Tribe, Location, SearchFilters, PaginationParams } from '@/types'
import { apiClient } from '@/services/apiClient'

interface UseTribesOptions {
  location?: Location | null
  filters?: SearchFilters
  pagination?: PaginationParams
  enabled?: boolean
}

interface UseTribesReturn {
  tribes: Tribe[]
  isLoading: boolean
  error: string | null
  refetch: () => void
  createTribe: (tribeData: any) => Promise<void>
  updateTribe: (id: string, tribeData: any) => Promise<void>
  deleteTribe: (id: string) => Promise<void>
  joinTribe: (id: string) => Promise<void>
  leaveTribe: (id: string) => Promise<void>
  searchTribes: (query: string) => Promise<void>
  clearFilters: () => void
}

export function useTribes(options: UseTribesOptions = {}): UseTribesReturn {
  const {
    location,
    filters = {},
    pagination = { page: 1, limit: 20 },
    enabled = true
  } = options

  const queryClient = useQueryClient()
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters)
  const [searchQuery, setSearchQuery] = useState('')

  // Main tribes query
  const {
    data: tribesData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['tribes', location, localFilters, pagination],
    queryFn: () => fetchTribes(location, localFilters, pagination),
    enabled: enabled && !!location,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  })

  // AI recommendations query
  const {
    data: recommendations,
    isLoading: recommendationsLoading
  } = useQuery({
    queryKey: ['tribe-recommendations', location],
    queryFn: () => fetchTribeRecommendations(location),
    enabled: enabled && !!location,
    staleTime: 10 * 60 * 1000 // 10 minutes
  })

  // Create tribe mutation
  const createTribeMutation = useMutation({
    mutationFn: (tribeData: any) => apiClient.post('/tribes', tribeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tribes'] })
      queryClient.invalidateQueries({ queryKey: ['tribe-recommendations'] })
    }
  })

  // Update tribe mutation
  const updateTribeMutation = useMutation({
    mutationFn: ({ id, tribeData }: { id: string; tribeData: any }) =>
      apiClient.put(`/tribes/${id}`, tribeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tribes'] })
    }
  })

  // Delete tribe mutation
  const deleteTribeMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/tribes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tribes'] })
    }
  })

  // Join tribe mutation
  const joinTribeMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/tribes/${id}/join`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tribes'] })
      queryClient.invalidateQueries({ queryKey: ['user-tribes'] })
    }
  })

  // Leave tribe mutation
  const leaveTribeMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/tribes/${id}/leave`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tribes'] })
      queryClient.invalidateQueries({ queryKey: ['user-tribes'] })
    }
  })

  // Search tribes mutation
  const searchTribesMutation = useMutation({
    mutationFn: (query: string) => searchTribesByQuery(query, location),
    onSuccess: (data) => {
      // Update local state with search results
      queryClient.setQueryData(['tribes', location, localFilters, pagination], data)
    }
  })

  // Update filters when they change
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  // Fetch tribes function
  const fetchTribes = useCallback(async (
    userLocation: Location | null,
    searchFilters: SearchFilters,
    paginationParams: PaginationParams
  ): Promise<Tribe[]> => {
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

      const response = await apiClient.get(`/tribes/nearby?${params}`)
      return response.data.data || []
    } catch (error) {
      console.error('Error fetching tribes:', error)
      throw new Error('Error al cargar tribus')
    }
  }, [])

  // Fetch AI recommendations
  const fetchTribeRecommendations = useCallback(async (userLocation: Location | null): Promise<Tribe[]> => {
    if (!userLocation) {
      return []
    }

    try {
      const response = await apiClient.get(`/tribes/recommendations?lat=${userLocation.latitude}&lng=${userLocation.longitude}`)
      return response.data.data || []
    } catch (error) {
      console.error('Error fetching recommendations:', error)
      return []
    }
  }, [])

  // Search tribes by query
  const searchTribesByQuery = useCallback(async (query: string, userLocation: Location | null): Promise<Tribe[]> => {
    if (!userLocation || !query.trim()) {
      return tribesData || []
    }

    try {
      const params = new URLSearchParams({
        q: query,
        lat: userLocation.latitude.toString(),
        lng: userLocation.longitude.toString(),
        page: '1',
        limit: '50'
      })

      const response = await apiClient.get(`/tribes/search?${params}`)
      return response.data.data || []
    } catch (error) {
      console.error('Error searching tribes:', error)
      return tribesData || []
    }
  }, [tribesData])

  // Action functions
  const createTribe = useCallback(async (tribeData: any) => {
    await createTribeMutation.mutateAsync(tribeData)
  }, [createTribeMutation])

  const updateTribe = useCallback(async (id: string, tribeData: any) => {
    await updateTribeMutation.mutateAsync({ id, tribeData })
  }, [updateTribeMutation])

  const deleteTribe = useCallback(async (id: string) => {
    await deleteTribeMutation.mutateAsync(id)
  }, [deleteTribeMutation])

  const joinTribe = useCallback(async (id: string) => {
    await joinTribeMutation.mutateAsync(id)
  }, [joinTribeMutation])

  const leaveTribe = useCallback(async (id: string) => {
    await leaveTribeMutation.mutateAsync(id)
  }, [leaveTribeMutation])

  const searchTribes = useCallback(async (query: string) => {
    setSearchQuery(query)
    await searchTribesMutation.mutateAsync(query)
  }, [searchTribesMutation])

  const clearFilters = useCallback(() => {
    setLocalFilters({})
    setSearchQuery('')
    refetch()
  }, [refetch])

  // Combine regular tribes with AI recommendations
  const allTribes = [...(tribesData || []), ...(recommendations || [])]
  
  // Remove duplicates and sort by AI score and activity level
  const uniqueTribes = allTribes
    .filter((tribe, index, self) => 
      index === self.findIndex(t => t.id === tribe.id)
    )
    .sort((a, b) => {
      // Sort by AI score first, then by activity level
      if (a.aiScore !== b.aiScore) {
        return b.aiScore - a.aiScore
      }
      
      // Activity level priority: high > medium > low
      const activityPriority = { high: 3, medium: 2, low: 1 }
      return activityPriority[b.activityLevel] - activityPriority[a.activityLevel]
    })

  return {
    tribes: uniqueTribes,
    isLoading: isLoading || recommendationsLoading,
    error: error?.message || null,
    refetch,
    createTribe,
    updateTribe,
    deleteTribe,
    joinTribe,
    leaveTribe,
    searchTribes,
    clearFilters
  }
}

// Hook for user's own tribes
export function useUserTribes(userId?: string) {
  return useQuery({
    queryKey: ['user-tribes', userId],
    queryFn: () => apiClient.get(`/users/${userId}/tribes`).then(res => res.data.data),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000 // 2 minutes
  })
}

// Hook for tribe details
export function useTribeDetails(tribeId: string) {
  return useQuery({
    queryKey: ['tribe', tribeId],
    queryFn: () => apiClient.get(`/tribes/${tribeId}`).then(res => res.data.data),
    enabled: !!tribeId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}

// Hook for tribe categories
export function useTribeCategories() {
  return useQuery({
    queryKey: ['tribe-categories'],
    queryFn: () => apiClient.get('/tribes/categories').then(res => res.data.data),
    staleTime: 60 * 60 * 1000 // 1 hour
  })
}

// Hook for trending tribes
export function useTrendingTribes(location?: Location | null) {
  return useQuery({
    queryKey: ['trending-tribes', location],
    queryFn: () => {
      if (!location) return Promise.resolve([])
      return apiClient.get(`/tribes/trending?lat=${location.latitude}&lng=${location.longitude}`)
        .then(res => res.data.data)
    },
    enabled: !!location,
    staleTime: 10 * 60 * 1000 // 10 minutes
  })
}

// Hook for tribe posts
export function useTribePosts(tribeId: string) {
  return useQuery({
    queryKey: ['tribe-posts', tribeId],
    queryFn: () => apiClient.get(`/tribes/${tribeId}/posts`).then(res => res.data.data),
    enabled: !!tribeId,
    staleTime: 2 * 60 * 1000 // 2 minutes
  })
}

// Hook for tribe members
export function useTribeMembers(tribeId: string) {
  return useQuery({
    queryKey: ['tribe-members', tribeId],
    queryFn: () => apiClient.get(`/tribes/${tribeId}/members`).then(res => res.data.data),
    enabled: !!tribeId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}
