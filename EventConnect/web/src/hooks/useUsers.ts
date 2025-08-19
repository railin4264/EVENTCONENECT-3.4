import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from './useAuth';

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

  const response = await api.get(`/api/users?${params.toString()}`);
  return response.data;
};

// Fetch single user
const fetchUser = async (id: string): Promise<User> => {
  const response = await api.get(`/api/users/${id}`);
  return response.data.user;
};

// Update user profile
const updateUser = async (data: UpdateUserData): Promise<User> => {
  const response = await api.put('/api/users/profile', data);
  return response.data.user;
};

// Follow user
const followUser = async (userId: string): Promise<void> => {
  await api.post(`/api/users/${userId}/follow`);
};

// Unfollow user
const unfollowUser = async (userId: string): Promise<void> => {
  await api.delete(`/api/users/${userId}/follow`);
};

// Get user followers
const fetchUserFollowers = async (userId: string): Promise<User[]> => {
  const response = await api.get(`/api/users/${userId}/followers`);
  return response.data.followers;
};

// Get user following
const fetchUserFollowing = async (userId: string): Promise<User[]> => {
  const response = await api.get(`/api/users/${userId}/following`);
  return response.data.following;
};

// Get user recommendations
const fetchUserRecommendations = async (userId: string): Promise<User[]> => {
  const response = await api.get(`/api/users/${userId}/recommendations`);
  return response.data.recommendations;
};

export const useUsers = (filters: UserFilters = {}) => {
  const queryClient = useQueryClient();

  // Main users query
  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['users', filters],
    () => fetchUsers(filters),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  // Follow user mutation
  const followUserMutation = useMutation(followUser, {
    onSuccess: (_, userId) => {
      // Invalidate user-related queries
      queryClient.invalidateQueries(['users', userId]);
      queryClient.invalidateQueries(['users']);
    },
  });

  // Unfollow user mutation
  const unfollowUserMutation = useMutation(unfollowUser, {
    onSuccess: (_, userId) => {
      // Invalidate user-related queries
      queryClient.invalidateQueries(['users', userId]);
      queryClient.invalidateQueries(['users']);
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
    isFollowing: followUserMutation.isLoading,
    isUnfollowing: unfollowUserMutation.isLoading,
  };
};

// Hook for single user
export const useUser = (id: string) => {
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['users', id],
    () => fetchUser(id),
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );

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
  } = useQuery(
    ['users', userId, 'followers'],
    () => fetchUserFollowers(userId),
    {
      enabled: !!userId,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );

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
  } = useQuery(
    ['users', userId, 'following'],
    () => fetchUserFollowing(userId),
    {
      enabled: !!userId,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );

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
  } = useQuery(
    ['users', userId, 'recommendations'],
    () => fetchUserRecommendations(userId),
    {
      enabled: !!userId,
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 15 * 60 * 1000, // 15 minutes
    }
  );

  return {
    recommendations: recommendations || [],
    isLoading,
    error,
    refetch,
  };
};

export type { User, UserFilters, UpdateUserData };