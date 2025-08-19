import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from './useAuth';

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
const fetchPosts = async (filters: PostFilters = {}): Promise<{ posts: Post[]; pagination: any }> => {
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

  const response = await api.get(`/api/posts?${params.toString()}`);
  return response.data;
};

// Fetch single post
const fetchPost = async (id: string): Promise<Post> => {
  const response = await api.get(`/api/posts/${id}`);
  return response.data.post;
};

// Create post
const createPost = async (data: CreatePostData): Promise<Post> => {
  const response = await api.post('/api/posts', data);
  return response.data.post;
};

// Update post
const updatePost = async (data: UpdatePostData): Promise<Post> => {
  const { id, ...updateData } = data;
  const response = await api.put(`/api/posts/${id}`, updateData);
  return response.data.post;
};

// Delete post
const deletePost = async (id: string): Promise<void> => {
  await api.delete(`/api/posts/${id}`);
};

// Like post
const likePost = async (id: string): Promise<void> => {
  await api.post(`/api/posts/${id}/like`);
};

// Unlike post
const unlikePost = async (id: string): Promise<void> => {
  await api.delete(`/api/posts/${id}/like`);
};

// Save post
const savePost = async (id: string): Promise<void> => {
  await api.post(`/api/posts/${id}/save`);
};

// Unsave post
const unsavePost = async (id: string): Promise<void> => {
  await api.delete(`/api/posts/${id}/save`);
};

// Get user's posts
const fetchUserPosts = async (userId: string): Promise<Post[]> => {
  const response = await api.get(`/api/posts/user/${userId}`);
  return response.data.posts;
};

// Get user's saved posts
const fetchUserSavedPosts = async (userId: string): Promise<Post[]> => {
  const response = await api.get(`/api/posts/user/${userId}/saved`);
  return response.data.posts;
};

// Get trending posts
const fetchTrendingPosts = async (): Promise<Post[]> => {
  const response = await api.get('/api/posts/trending');
  return response.data.posts;
};

// Get nearby posts
const fetchNearbyPosts = async (coordinates: [number, number], radius: number = 50): Promise<Post[]> => {
  const response = await api.get(`/api/posts/nearby?lat=${coordinates[0]}&lng=${coordinates[1]}&radius=${radius}`);
  return response.data.posts;
};

export const usePosts = (filters: PostFilters = {}) => {
  const queryClient = useQueryClient();

  // Main posts query
  const {
    data: postsData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['posts', filters],
    () => fetchPosts(filters),
    {
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  // Create post mutation
  const createPostMutation = useMutation(createPost, {
    onSuccess: (newPost) => {
      // Invalidate and refetch posts
      queryClient.invalidateQueries(['posts']);
      queryClient.invalidateQueries(['user', newPost.author.id, 'posts']);
      
      // Add new post to cache
      queryClient.setQueryData(['posts', newPost.id], newPost);
    },
  });

  // Update post mutation
  const updatePostMutation = useMutation(updatePost, {
    onSuccess: (updatedPost) => {
      // Update post in cache
      queryClient.setQueryData(['posts', updatedPost.id], updatedPost);
      queryClient.invalidateQueries(['posts']);
      queryClient.invalidateQueries(['user', updatedPost.author.id, 'posts']);
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation(deletePost, {
    onSuccess: (_, postId) => {
      // Remove post from cache
      queryClient.removeQueries(['posts', postId]);
      queryClient.invalidateQueries(['posts']);
    },
  });

  // Like post mutation
  const likePostMutation = useMutation(likePost, {
    onSuccess: (_, postId) => {
      // Update post in cache
      queryClient.setQueryData(['posts'], (old: any) => ({
        ...old,
        posts: old.posts.map((p: Post) =>
          p.id === postId 
            ? { ...p, isLiked: true, stats: { ...p.stats, likeCount: p.stats.likeCount + 1 } }
            : p
        ),
      }));
    },
  });

  // Unlike post mutation
  const unlikePostMutation = useMutation(unlikePost, {
    onSuccess: (_, postId) => {
      // Update post in cache
      queryClient.setQueryData(['posts'], (old: any) => ({
        ...old,
        posts: old.posts.map((p: Post) =>
          p.id === postId 
            ? { ...p, isLiked: false, stats: { ...p.stats, likeCount: Math.max(0, p.stats.likeCount - 1) } }
            : p
        ),
      }));
    },
  });

  // Save post mutation
  const savePostMutation = useMutation(savePost, {
    onSuccess: (_, postId) => {
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
  const unsavePostMutation = useMutation(unsavePost, {
    onSuccess: (_, postId) => {
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
    isCreating: createPostMutation.isLoading,
    isUpdating: updatePostMutation.isLoading,
    isDeleting: deletePostMutation.isLoading,
    isLiking: likePostMutation.isLoading,
    isUnliking: unlikePostMutation.isLoading,
    isSaving: savePostMutation.isLoading,
    isUnsaving: unsavePostMutation.isLoading,
  };
};

// Hook for single post
export const usePost = (id: string) => {
  const queryClient = useQueryClient();

  const {
    data: post,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['posts', id],
    () => fetchPost(id),
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );

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
  } = useQuery(
    ['user', userId, 'posts'],
    () => fetchUserPosts(userId),
    {
      enabled: !!userId,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );

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
  } = useQuery(
    ['user', userId, 'saved-posts'],
    () => fetchUserSavedPosts(userId),
    {
      enabled: !!userId,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );

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
  } = useQuery(
    ['posts', 'trending'],
    fetchTrendingPosts,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  return {
    posts: posts || [],
    isLoading,
    error,
    refetch,
  };
};

// Hook for nearby posts
export const useNearbyPosts = (coordinates: [number, number], radius: number = 50) => {
  const {
    data: posts,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['posts', 'nearby', coordinates, radius],
    () => fetchNearbyPosts(coordinates, radius),
    {
      enabled: !!coordinates,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );

  return {
    posts: posts || [],
    isLoading,
    error,
    refetch,
  };
};

export type { Post, PostFilters, CreatePostData, UpdatePostData };