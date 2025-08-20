'use client'

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from './useAuth';

interface Tribe {
  id: string;
  name: string;
  description: string;
  category: string;
  creator: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  moderators: Array<{
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  }>;
  members: Array<{
    user: {
      id: string;
      username: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
    role: 'member' | 'moderator' | 'admin';
    joinedAt: string;
  }>;
  location: {
    coordinates: [number, number];
    city?: string;
    country?: string;
    isGlobal: boolean;
  };
  avatar?: string;
  coverImage?: string;
  tags: string[];
  rules: Array<{
    title: string;
    description: string;
  }>;
  privacy: 'public' | 'private' | 'invite_only';
  stats: {
    memberCount: number;
    eventCount: number;
    postCount: number;
  };
  settings: {
    allowMemberPosts: boolean;
    requireApproval: boolean;
    maxMembers?: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TribeFilters {
  category?: string;
  location?: {
    coordinates: [number, number];
    radius?: number;
  };
  search?: string;
  privacy?: string;
  page?: number;
  limit?: number;
}

interface CreateTribeData {
  name: string;
  description: string;
  category: string;
  location?: {
    coordinates: [number, number];
    city?: string;
    country?: string;
    isGlobal?: boolean;
  };
  tags?: string[];
  rules?: Array<{
    title: string;
    description: string;
  }>;
  privacy: 'public' | 'private' | 'invite_only';
  settings?: {
    allowMemberPosts?: boolean;
    requireApproval?: boolean;
    maxMembers?: number;
  };
}

interface UpdateTribeData extends Partial<CreateTribeData> {
  id: string;
}

// Fetch tribes with filters
const fetchTribes = async (filters: TribeFilters = {}): Promise<{ tribes: Tribe[]; pagination: any }> => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (key === 'location' && typeof value === 'object') {
        params.append('location[coordinates]', value.coordinates.join(','));
        if (value.radius) params.append('radius', value.radius.toString());
      } else {
        params.append(key, value.toString());
      }
    }
  });

  const response = await api.get(`/api/tribes?${params.toString()}`);
  return response.data;
};

// Fetch single tribe
const fetchTribe = async (id: string): Promise<Tribe> => {
  const response = await api.get(`/api/tribes/${id}`);
  return response.data.tribe;
};

// Create tribe
const createTribe = async (data: CreateTribeData): Promise<Tribe> => {
  const response = await api.post('/api/tribes', data);
  return response.data.tribe;
};

// Update tribe
const updateTribe = async (data: UpdateTribeData): Promise<Tribe> => {
  const { id, ...updateData } = data;
  const response = await api.put(`/api/tribes/${id}`, updateData);
  return response.data.tribe;
};

// Delete tribe
const deleteTribe = async (id: string): Promise<void> => {
  await api.delete(`/api/tribes/${id}`);
};

// Join tribe
const joinTribe = async (tribeId: string): Promise<Tribe> => {
  const response = await api.post(`/api/tribes/${tribeId}/join`);
  return response.data.tribe;
};

// Leave tribe
const leaveTribe = async (tribeId: string): Promise<Tribe> => {
  const response = await api.delete(`/api/tribes/${tribeId}/leave`);
  return response.data.tribe;
};

// Get user's tribes
const fetchUserTribes = async (userId: string, type: 'all' | 'created' | 'joined' | 'moderating' = 'all'): Promise<Tribe[]> => {
  const response = await api.get(`/api/tribes/user/${userId}?type=${type}`);
  return response.data.tribes;
};

export const useTribes = (filters: TribeFilters = {}) => {
  const queryClient = useQueryClient();

  // Main tribes query
  const {
    data: tribesData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['tribes', filters],
    () => fetchTribes(filters),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  // Create tribe mutation
  const createTribeMutation = useMutation(createTribe, {
    onSuccess: (newTribe) => {
      // Invalidate and refetch tribes
      queryClient.invalidateQueries(['tribes']);
      queryClient.invalidateQueries(['user', newTribe.creator.id, 'tribes']);
      
      // Add new tribe to cache
      queryClient.setQueryData(['tribes', newTribe.id], newTribe);
    },
  });

  // Update tribe mutation
  const updateTribeMutation = useMutation(updateTribe, {
    onSuccess: (updatedTribe) => {
      // Update tribe in cache
      queryClient.setQueryData(['tribes', updatedTribe.id], updatedTribe);
      queryClient.invalidateQueries(['tribes']);
      queryClient.invalidateQueries(['user', updatedTribe.creator.id, 'tribes']);
    },
  });

  // Delete tribe mutation
  const deleteTribeMutation = useMutation(deleteTribe, {
    onSuccess: (_, tribeId) => {
      // Remove tribe from cache
      queryClient.removeQueries(['tribes', tribeId]);
      queryClient.invalidateQueries(['tribes']);
    },
  });

  // Join tribe mutation
  const joinTribeMutation = useMutation(joinTribe, {
    onSuccess: (updatedTribe) => {
      // Update tribe in cache
      queryClient.setQueryData(['tribes', updatedTribe.id], updatedTribe);
      queryClient.invalidateQueries(['tribes']);
      queryClient.invalidateQueries(['user', 'tribes']);
    },
  });

  // Leave tribe mutation
  const leaveTribeMutation = useMutation(leaveTribe, {
    onSuccess: (updatedTribe) => {
      // Update tribe in cache
      queryClient.setQueryData(['tribes', updatedTribe.id], updatedTribe);
      queryClient.invalidateQueries(['tribes']);
      queryClient.invalidateQueries(['user', 'tribes']);
    },
  });

  return {
    // Data
    tribes: tribesData?.tribes || [],
    pagination: tribesData?.pagination,
    
    // State
    isLoading,
    error,
    
    // Actions
    refetch,
    createTribe: createTribeMutation.mutateAsync,
    updateTribe: updateTribeMutation.mutateAsync,
    deleteTribe: deleteTribeMutation.mutateAsync,
    joinTribe: joinTribeMutation.mutateAsync,
    leaveTribe: leaveTribeMutation.mutateAsync,
    
    // Mutations state
    isCreating: createTribeMutation.isLoading,
    isUpdating: updateTribeMutation.isLoading,
    isDeleting: deleteTribeMutation.isLoading,
    isJoining: joinTribeMutation.isLoading,
    isLeaving: leaveTribeMutation.isLoading,
  };
};

// Hook for single tribe
export const useTribe = (id: string) => {
  const queryClient = useQueryClient();

  const {
    data: tribe,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['tribes', id],
    () => fetchTribe(id),
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );

  return {
    tribe,
    isLoading,
    error,
    refetch,
  };
};

// Hook for user tribes
export const useUserTribes = (userId: string, type: 'all' | 'created' | 'joined' | 'moderating' = 'all') => {
  const {
    data: tribes,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['user', userId, 'tribes', type],
    () => fetchUserTribes(userId, type),
    {
      enabled: !!userId,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );

  return {
    tribes: tribes || [],
    isLoading,
    error,
    refetch,
  };
};

export type { Tribe, TribeFilters, CreateTribeData, UpdateTribeData };
