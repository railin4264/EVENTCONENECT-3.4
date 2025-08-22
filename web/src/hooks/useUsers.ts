'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  interests: string[];
  location: {
    coordinates: [number, number];
    address?: string;
    city?: string;
    country?: string;
  };
  badges: string[];
  stats: {
    eventsCreated: number;
    eventsAttended: number;
    postsCreated: number;
    reviewsGiven: number;
    tribesJoined: number;
  };
  preferences: {
    notifications: {
      events: boolean;
      messages: boolean;
      community: boolean;
    };
    privacy: {
      profileVisible: boolean;
      locationVisible: boolean;
    };
  };
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserFilters {
  search?: string;
  interests?: string[];
  location?: {
    coordinates: [number, number];
    radius?: number;
  };
  page?: number;
  limit?: number;
}

interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  bio?: string;
  interests?: string[];
  location?: {
    coordinates: [number, number];
    address?: string;
    city?: string;
    country?: string;
  };
  preferences?: {
    notifications?: {
      events?: boolean;
      messages?: boolean;
      community?: boolean;
    };
    privacy?: {
      profileVisible?: boolean;
      locationVisible?: boolean;
    };
  };
}

// Fetch users with filters
const fetchUsers = async (filters: UserFilters = {}): Promise<{ users: User[]; pagination: any }> => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (key === 'location' && typeof value === 'object') {
        params.append('location[coordinates]', value.coordinates.join(','));
        if (value.radius) params.append('radius', value.radius.toString());
      } else if (key === 'interests' && Array.isArray(value)) {
        value.forEach(interest => params.append('interests', interest));
      } else {
        params.append(key, value.toString());
      }
    }
  });

  return apiService.get(`/api/users?${params.toString()}`);
};

// Fetch single user
const fetchUser = async (id: string): Promise<User> => {
  return apiService.get(`/api/users/${id}`);
};

// Update user profile
const updateUser = async (data: UpdateUserData): Promise<User> => {
  return apiService.put('/api/users/profile', data);
};

// Follow user
const followUser = async (userId: string): Promise<void> => {
  await apiService.post(`/api/users/${userId}/follow`);
};

// Unfollow user
const unfollowUser = async (userId: string): Promise<void> => {
  await apiService.delete(`/api/users/${userId}/follow`);
};

// Get user followers
const fetchUserFollowers = async (userId: string): Promise<User[]> => {
  return apiService.get(`/api/users/${userId}/followers`);
};

// Get user following
const fetchUserFollowing = async (userId: string): Promise<User[]> => {
  return apiService.get(`/api/users/${userId}/following`);
};

// Get user recommendations
const fetchUserRecommendations = async (userId: string): Promise<User[]> => {
  return apiService.get(`/api/users/${userId}/recommendations`);
};

export const useUsers = (filters: UserFilters = {}) => {
  const queryClient = useQueryClient();

  // Main users query
  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['users', filters],
    queryFn: () => fetchUsers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (cacheTime renamed to gcTime in v4)
  });

  // Follow user mutation
  const followUserMutation = useMutation({
    mutationFn: followUser,
    onSuccess: (_: void, userId: string) => {
      // Invalidate user-related queries
      queryClient.invalidateQueries({ queryKey: ['users', userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Unfollow user mutation
  const unfollowUserMutation = useMutation({
    mutationFn: unfollowUser,
    onSuccess: (_: void, userId: string) => {
      // Invalidate user-related queries
      queryClient.invalidateQueries({ queryKey: ['users', userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return {
    // Data
    users: usersData?.users || [],
    pagination: usersData?.pagination,
    
    // State
    isLoading,
    error,
    
    // Actions
    refetch,
    followUser: followUserMutation.mutateAsync,
    unfollowUser: unfollowUserMutation.mutateAsync,
    
    // Mutations state
    isFollowing: followUserMutation.isPending,
    isUnfollowing: unfollowUserMutation.isPending,
  };
};

// Hook for single user
export const useUser = (id: string) => {
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['users', id],
    queryFn: () => fetchUser(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    user,
    isLoading,
    error,
    refetch,
  };
};

// Hook for user followers
export const useUserFollowers = (userId: string) => {
  const {
    data: followers,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['users', userId, 'followers'],
    queryFn: () => fetchUserFollowers(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    followers: followers || [],
    isLoading,
    error,
    refetch,
  };
};

// Hook for user following
export const useUserFollowing = (userId: string) => {
  const {
    data: following,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['users', userId, 'following'],
    queryFn: () => fetchUserFollowing(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    following: following || [],
    isLoading,
    error,
    refetch,
  };
};

// Hook for user recommendations
export const useUserRecommendations = (userId: string) => {
  const {
    data: recommendations,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['users', userId, 'recommendations'],
    queryFn: () => fetchUserRecommendations(userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes (cacheTime renamed to gcTime in v4)
  });

  return {
    recommendations: recommendations || [],
    isLoading,
    error,
    refetch,
  };
};

export type { User, UserFilters, UpdateUserData };