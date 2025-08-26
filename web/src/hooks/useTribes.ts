'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tribesAPI } from '@/services/api';

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
const fetchTribes = async (
  filters: TribeFilters = {}
): Promise<{ tribes: Tribe[]; pagination: any }> => {
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

  return tribesAPI.getTribes(params);
};

// Fetch single tribe
const fetchTribe = async (id: string): Promise<Tribe> => {
  return tribesAPI.getTribe(id);
};

// Create tribe
const createTribe = async (data: CreateTribeData): Promise<Tribe> => {
  return tribesAPI.createTribe(data);
};

// Update tribe
const updateTribe = async (data: UpdateTribeData): Promise<Tribe> => {
  const { id, ...updateData } = data;
  return tribesAPI.updateTribe(id, updateData);
};

// Delete tribe
const deleteTribe = async (id: string): Promise<void> => {
  await tribesAPI.deleteTribe(id);
};

// Join tribe
const joinTribe = async (tribeId: string): Promise<Tribe> => {
  return tribesAPI.joinTribe(tribeId);
};

// Leave tribe
const leaveTribe = async (tribeId: string): Promise<Tribe> => {
  return tribesAPI.leaveTribe(tribeId);
};

// Get user's tribes
const fetchUserTribes = async (
  userId: string,
  type: 'all' | 'created' | 'joined' | 'moderating' = 'all'
): Promise<Tribe[]> => {
  const params = { userId, type };
  const result = await tribesAPI.getTribes(params);
  return result.tribes || [];
};

export const useTribes = (filters: TribeFilters = {}) => {
  const queryClient = useQueryClient();

  // Main tribes query
  const {
    data: tribesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['tribes', filters],
    queryFn: () => fetchTribes(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (cacheTime renamed to gcTime in v4)
  });

  // Create tribe mutation
  const createTribeMutation = useMutation({
    mutationFn: createTribe,
    onSuccess: (newTribe: Tribe) => {
      // Invalidate and refetch tribes
      queryClient.invalidateQueries({ queryKey: ['tribes'] });
      queryClient.invalidateQueries({
        queryKey: ['user', newTribe.creator.id, 'tribes'],
      });

      // Add new tribe to cache
      queryClient.setQueryData(['tribes', newTribe.id], newTribe);
    },
  });

  // Update tribe mutation
  const updateTribeMutation = useMutation({
    mutationFn: updateTribe,
    onSuccess: (updatedTribe: Tribe) => {
      // Update tribe in cache
      queryClient.setQueryData(['tribes', updatedTribe.id], updatedTribe);
      queryClient.invalidateQueries({ queryKey: ['tribes'] });
      queryClient.invalidateQueries({
        queryKey: ['user', updatedTribe.creator.id, 'tribes'],
      });
    },
  });

  // Delete tribe mutation
  const deleteTribeMutation = useMutation({
    mutationFn: deleteTribe,
    onSuccess: (_: void, tribeId: string) => {
      // Remove tribe from cache
      queryClient.removeQueries({ queryKey: ['tribes', tribeId] });
      queryClient.invalidateQueries({ queryKey: ['tribes'] });
    },
  });

  // Join tribe mutation
  const joinTribeMutation = useMutation({
    mutationFn: joinTribe,
    onSuccess: (updatedTribe: Tribe) => {
      // Update tribe in cache
      queryClient.setQueryData(['tribes', updatedTribe.id], updatedTribe);
      queryClient.invalidateQueries({ queryKey: ['tribes'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'tribes'] });
    },
  });

  // Leave tribe mutation
  const leaveTribeMutation = useMutation({
    mutationFn: leaveTribe,
    onSuccess: (updatedTribe: Tribe) => {
      // Update tribe in cache
      queryClient.setQueryData(['tribes', updatedTribe.id], updatedTribe);
      queryClient.invalidateQueries({ queryKey: ['tribes'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'tribes'] });
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
    isCreating: createTribeMutation.isPending,
    isUpdating: updateTribeMutation.isPending,
    isDeleting: deleteTribeMutation.isPending,
    isJoining: joinTribeMutation.isPending,
    isLeaving: leaveTribeMutation.isPending,
  };
};

// Hook for single tribe
export const useTribe = (id: string) => {
  const {
    data: tribe,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['tribes', id],
    queryFn: () => fetchTribe(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    tribe,
    isLoading,
    error,
    refetch,
  };
};

// Hook for user tribes
export const useUserTribes = (
  userId: string,
  type: 'all' | 'created' | 'joined' | 'moderating' = 'all'
) => {
  const {
    data: tribes,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['user', userId, 'tribes', type],
    queryFn: () => fetchUserTribes(userId, type),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    tribes: tribes || [],
    isLoading,
    error,
    refetch,
  };
};

export type { Tribe, TribeFilters, CreateTribeData, UpdateTribeData };
