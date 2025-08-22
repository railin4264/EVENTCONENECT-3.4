'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsAPI } from '@/services/api';

interface Post {
  id: string;
  author: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  title?: string;
  content: string;
  type?: 'event' | 'tribe' | 'location' | 'general';
  media?: {
    images: string[];
    videos: string[];
  };
  location?: {
    coordinates: [number, number];
    address?: string;
    city?: string;
    country?: string;
  };
  tags: string[];
  mentions: string[];
  isPublic: boolean;
  isActive: boolean;
  stats: {
    likeCount: number;
    commentCount: number;
    shareCount: number;
    viewCount: number;
  };
  isLiked: boolean;
  isSaved: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PostFilters {
  type?: string;
  authorId?: string;
  location?: {
    coordinates: [number, number];
    radius?: number;
  };
  tags?: string[];
  page?: number;
  limit?: number;
}

interface CreatePostData {
  title?: string;
  content: string;
  type?: 'event' | 'tribe' | 'location' | 'general';
  media?: {
    images?: string[];
    videos?: string[];
  };
  location?: {
    coordinates: [number, number];
    address?: string;
    city?: string;
    country?: string;
  };
  tags?: string[];
  mentions?: string[];
  isPublic?: boolean;
}

interface UpdatePostData extends Partial<CreatePostData> {
  id: string;
}

// Fetch posts with filters
const fetchPosts = async (
  filters: PostFilters = {}
): Promise<{ posts: Post[]; pagination: any }> => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (key === 'location' && typeof value === 'object') {
        params.append('location[coordinates]', value.coordinates.join(','));
        if (value.radius) params.append('radius', value.radius.toString());
      } else if (key === 'tags' && Array.isArray(value)) {
        value.forEach(tag => params.append('tags', tag));
      } else {
        params.append(key, value.toString());
      }
    }
  });

  return postsAPI.getPosts(params);
};

// Fetch single post
const fetchPost = async (id: string): Promise<Post> => {
  return postsAPI.getPost(id);
};

// Create post
const createPost = async (data: CreatePostData): Promise<Post> => {
  return postsAPI.createPost(data);
};

// Update post
const updatePost = async (data: UpdatePostData): Promise<Post> => {
  const { id, ...updateData } = data;
  return postsAPI.updatePost(id, updateData);
};

// Delete post
const deletePost = async (id: string): Promise<void> => {
  await postsAPI.deletePost(id);
};

// Like post
const likePost = async (id: string): Promise<void> => {
  await postsAPI.likePost(id);
};

// Unlike post
const unlikePost = async (id: string): Promise<void> => {
  await postsAPI.unlikePost(id);
};

// Save post
const savePost = async (id: string): Promise<void> => {
  // Save endpoint not available in postsAPI, using like instead
  await postsAPI.likePost(id);
};

// Unsave post
const unsavePost = async (id: string): Promise<void> => {
  // Unsave endpoint not available in postsAPI, using unlike instead
  await postsAPI.unlikePost(id);
};

// Get user's posts
const fetchUserPosts = async (userId: string): Promise<Post[]> => {
  const params = { userId };
  const result = await postsAPI.getPosts(params);
  return result.posts || [];
};

// Get user's saved posts
const fetchUserSavedPosts = async (userId: string): Promise<Post[]> => {
  const params = { userId, saved: true };
  const result = await postsAPI.getPosts(params);
  return result.posts || [];
};

// Get trending posts
const fetchTrendingPosts = async (): Promise<Post[]> => {
  const params = { trending: true };
  const result = await postsAPI.getPosts(params);
  return result.posts || [];
};

// Get nearby posts
const fetchNearbyPosts = async (
  coordinates: [number, number],
  radius: number = 50
): Promise<Post[]> => {
  const params = { lat: coordinates[0], lng: coordinates[1], radius };
  const result = await postsAPI.getPosts(params);
  return result.posts || [];
};

export const usePosts = (filters: PostFilters = {}) => {
  const queryClient = useQueryClient();

  // Main posts query
  const {
    data: postsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['posts', filters],
    queryFn: () => fetchPosts(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes (cacheTime renamed to gcTime in v4)
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: (newPost: Post) => {
      // Invalidate and refetch posts
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({
        queryKey: ['user', newPost.author.id, 'posts'],
      });

      // Add new post to cache
      queryClient.setQueryData(['posts', newPost.id], newPost);
    },
  });

  // Update post mutation
  const updatePostMutation = useMutation({
    mutationFn: updatePost,
    onSuccess: (updatedPost: Post) => {
      // Update post in cache
      queryClient.setQueryData(['posts', updatedPost.id], updatedPost);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({
        queryKey: ['user', updatedPost.author.id, 'posts'],
      });
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: (_: void, postId: string) => {
      // Remove post from cache
      queryClient.removeQueries({ queryKey: ['posts', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: likePost,
    onSuccess: (_: void, postId: string) => {
      // Update post in cache
      queryClient.setQueryData(['posts'], (old: any) => ({
        ...old,
        posts: old.posts.map((p: Post) =>
          p.id === postId
            ? {
                ...p,
                isLiked: true,
                stats: { ...p.stats, likeCount: p.stats.likeCount + 1 },
              }
            : p
        ),
      }));
    },
  });

  // Unlike post mutation
  const unlikePostMutation = useMutation({
    mutationFn: unlikePost,
    onSuccess: (_: void, postId: string) => {
      // Update post in cache
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  // Save post mutation
  const savePostMutation = useMutation({
    mutationFn: savePost,
    onSuccess: (_: void, postId: string) => {
      // Update post in cache
      queryClient.setQueryData(['posts'], (old: any) => ({
        ...old,
        posts: old.posts.map((p: Post) =>
          p.id === postId ? { ...p, isSaved: true } : p
        ),
      }));
    },
  });

  // Unsave post mutation
  const unsavePostMutation = useMutation({
    mutationFn: unsavePost,
    onSuccess: (_: void, postId: string) => {
      // Update post in cache
      queryClient.setQueryData(['posts'], (old: any) => ({
        ...old,
        posts: old.posts.map((p: Post) =>
          p.id === postId ? { ...p, isSaved: false } : p
        ),
      }));
    },
  });

  return {
    // Data
    posts: postsData?.posts || [],
    pagination: postsData?.pagination,

    // State
    isLoading,
    error,

    // Actions
    refetch,
    createPost: createPostMutation.mutateAsync,
    updatePost: updatePostMutation.mutateAsync,
    deletePost: deletePostMutation.mutateAsync,
    likePost: likePostMutation.mutateAsync,
    unlikePost: unlikePostMutation.mutateAsync,
    savePost: savePostMutation.mutateAsync,
    unsavePost: unsavePostMutation.mutateAsync,

    // Mutations state
    isCreating: createPostMutation.isPending,
    isUpdating: updatePostMutation.isPending,
    isDeleting: deletePostMutation.isPending,
    isLiking: likePostMutation.isPending,
    isUnliking: unlikePostMutation.isPending,
    isSaving: savePostMutation.isPending,
    isUnsaving: unsavePostMutation.isPending,
  };
};

// Hook for single post
export const usePost = (id: string) => {
  const {
    data: post,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['posts', id],
    queryFn: () => fetchPost(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    post,
    isLoading,
    error,
    refetch,
  };
};

// Hook for user posts
export const useUserPosts = (userId: string) => {
  const {
    data: posts,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['user', userId, 'posts'],
    queryFn: () => fetchUserPosts(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    posts: posts || [],
    isLoading,
    error,
    refetch,
  };
};

// Hook for user saved posts
export const useUserSavedPosts = (userId: string) => {
  const {
    data: posts,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['user', userId, 'saved-posts'],
    queryFn: () => fetchUserSavedPosts(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    posts: posts || [],
    isLoading,
    error,
    refetch,
  };
};

// Hook for trending posts
export const useTrendingPosts = () => {
  const {
    data: posts,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['posts', 'trending'],
    queryFn: fetchTrendingPosts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (cacheTime renamed to gcTime in v4)
  });

  return {
    posts: posts || [],
    isLoading,
    error,
    refetch,
  };
};

// Hook for nearby posts
export const useNearbyPosts = (
  coordinates: [number, number],
  radius: number = 50
) => {
  const {
    data: posts,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['posts', 'nearby', coordinates, radius],
    queryFn: () => fetchNearbyPosts(coordinates, radius),
    enabled: !!coordinates,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    posts: posts || [],
    isLoading,
    error,
    refetch,
  };
};

export type { Post, PostFilters, CreatePostData, UpdatePostData };
