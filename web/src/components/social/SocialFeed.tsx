'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  UserPlus,
  UserMinus,
  Users,
  Eye,
  ThumbsUp,
  Bookmark,
  Flag,
  Edit,
  Trash2,
  Filter,
  Search,
  TrendingUp,
  Clock,
  MapPin,
  Calendar,
  Image,
  Video
} from 'lucide-react';

interface SocialPost {
  id: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
    isVerified: boolean;
    isFollowing: boolean;
  };
  content: string;
  images?: string[];
  videos?: string[];
  likes: number;
  comments: number;
  shares: number;
  views: number;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  location?: string;
  type: 'text' | 'image' | 'video' | 'event' | 'tribe';
  relatedEvent?: any;
  relatedTribe?: any;
}

interface UserProfile {
  id: string;
  username: string;
  avatar?: string;
  bio?: string;
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing: boolean;
  isBlocked: boolean;
}

interface SocialFeedFilters {
  type: 'all' | 'text' | 'image' | 'video' | 'event' | 'tribe';
  sort: 'latest' | 'trending' | 'most_liked' | 'most_commented';
  search: string;
  tags: string[];
}

export default function SocialFeed() {
  const [filters, setFilters] = useState<SocialFeedFilters>({
    type: 'all',
    sort: 'latest',
    search: '',
    tags: [],
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch social feed
  const { data: feed, isLoading } = useQuery({
    queryKey: ['social-feed', filters],
    queryFn: () => api.social.getFeed(filters),
  });

  // Fetch suggested users
  const { data: suggestedUsers } = useQuery({
    queryKey: ['suggested-users'],
    queryFn: () => api.social.getSuggestedUsers(),
  });

  // Fetch trending topics
  const { data: trendingTopics } = useQuery({
    queryKey: ['trending-topics'],
    queryFn: () => api.social.getTrendingTopics(),
  });

  // Mutations
  const likePostMutation = useMutation({
    mutationFn: (postId: string) => api.social.likePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
    },
  });

  const followUserMutation = useMutation({
    mutationFn: (userId: string) => api.social.followUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
      queryClient.invalidateQueries({ queryKey: ['suggested-users'] });
    },
  });

  const bookmarkPostMutation = useMutation({
    mutationFn: (postId: string) => api.social.bookmarkPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
    },
  });

  const sharePostMutation = useMutation({
    mutationFn: (postId: string) => api.social.sharePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
    },
  });

  // Handle post actions
  const handleLike = (postId: string) => {
    likePostMutation.mutate(postId);
  };

  const handleFollow = (userId: string) => {
    followUserMutation.mutate(userId);
  };

  const handleBookmark = (postId: string) => {
    bookmarkPostMutation.mutate(postId);
  };

  const handleShare = (postId: string) => {
    sharePostMutation.mutate(postId);
  };

  const handleViewPost = (post: SocialPost) => {
    setSelectedPost(post);
    setShowPostModal(true);
  };

  const handleViewUser = (user: UserProfile) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  // Get post type icon
  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'event': return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'tribe': return <Users className="w-4 h-4 text-green-600" />;
      case 'image': return <Image className="w-4 h-4 text-purple-600" />;
      case 'video': return <Video className="w-4 h-4 text-red-600" />;
      default: return <MessageCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  // Get post type color
  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'event': return 'bg-blue-100 text-blue-800';
      case 'tribe': return 'bg-green-100 text-green-800';
      case 'image': return 'bg-purple-100 text-purple-800';
      case 'video': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🌐 Feed Social</h1>
        <p className="text-gray-600">Conecta con la comunidad EventConnect</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Filters */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
            
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Buscar posts..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Post</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos</option>
                <option value="text">Texto</option>
                <option value="image">Imágenes</option>
                <option value="video">Videos</option>
                <option value="event">Eventos</option>
                <option value="tribe">Tribus</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
              <select
                value={filters.sort}
                onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="latest">Más recientes</option>
                <option value="trending">Tendencia</option>
                <option value="most_liked">Más gustados</option>
                <option value="most_commented">Más comentados</option>
              </select>
            </div>

            {/* Trending Topics */}
            {trendingTopics && trendingTopics.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Tendencias</h4>
                <div className="space-y-2">
                  {trendingTopics.slice(0, 5).map((topic, index) => (
                    <button
                      key={index}
                      onClick={() => setFilters(prev => ({ ...prev, search: topic.name }))}
                      className="w-full text-left px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                    >
                      #{topic.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Clear Filters */}
            <button
              onClick={() => setFilters({
                type: 'all',
                sort: 'latest',
                search: '',
                tags: [],
              })}
              className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {/* Main Feed */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {feed?.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Post Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {post.author.avatar ? (
                          <img src={post.author.avatar} alt={post.author.username} className="w-10 h-10 rounded-full" />
                        ) : (
                          post.author.username.charAt(0).toUpperCase()
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900">{post.author.username}</span>
                        {post.author.isVerified && (
                          <span className="text-blue-600">✓</span>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPostTypeColor(post.type)}`}>
                          {post.type}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        {post.location && (
                          <>
                            <MapPin className="w-3 h-3" />
                            <span>{post.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewUser(post.author)}
                        className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-4">
                  <p className="text-gray-900 mb-4">{post.content}</p>
                  
                  {/* Images */}
                  {post.images && post.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {post.images.slice(0, 4).map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Post ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}

                  {/* Videos */}
                  {post.videos && post.videos.length > 0 && (
                    <div className="mb-4">
                      {post.videos.map((video, index) => (
                        <video
                          key={index}
                          src={video}
                          controls
                          className="w-full rounded-lg"
                        />
                      ))}
                    </div>
                  )}

                  {/* Related Event/Tribe */}
                  {(post.relatedEvent || post.relatedTribe) && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center space-x-2">
                        {post.relatedEvent ? (
                          <>
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-900">
                              Evento: {post.relatedEvent.title}
                            </span>
                          </>
                        ) : (
                          <>
                            <Users className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-gray-900">
                              Tribu: {post.relatedTribe.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Post Actions */}
                <div className="px-4 py-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      {/* Like */}
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center space-x-2 ${
                          post.isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                        } focus:outline-none`}
                      >
                        <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                        <span className="text-sm">{post.likes}</span>
                      </button>

                      {/* Comment */}
                      <button
                        onClick={() => handleViewPost(post)}
                        className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 focus:outline-none"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm">{post.comments}</span>
                      </button>

                      {/* Share */}
                      <button
                        onClick={() => handleShare(post.id)}
                        className="flex items-center space-x-2 text-gray-500 hover:text-green-600 focus:outline-none"
                      >
                        <Share2 className="w-5 h-5" />
                        <span className="text-sm">{post.shares}</span>
                      </button>

                      {/* Views */}
                      <div className="flex items-center space-x-2 text-gray-500">
                        <Eye className="w-5 h-5" />
                        <span className="text-sm">{post.views}</span>
                      </div>
                    </div>

                    {/* Bookmark */}
                    <button
                      onClick={() => handleBookmark(post.id)}
                      className={`p-2 rounded-full ${
                        post.isBookmarked ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-blue-600'
                      } focus:outline-none`}
                    >
                      <Bookmark className={`w-5 h-5 ${post.isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {(!feed || feed.length === 0) && (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay posts para mostrar</h3>
                <p className="text-gray-600">
                  {filters.search || filters.type !== 'all'
                    ? 'No hay posts que coincidan con los filtros aplicados'
                    : 'Sé el primero en crear un post en la comunidad'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Suggested Users */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Usuarios Sugeridos</h3>
            
            {suggestedUsers?.map((user) => (
              <div key={user.id} className="flex items-center space-x-3 mb-4 p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username} className="w-10 h-10 rounded-full" />
                    ) : (
                      user.username.charAt(0).toUpperCase()
                    )}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{user.username}</span>
                    {user.isVerified && (
                      <span className="text-blue-600 text-sm">✓</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{user.followersCount} seguidores</p>
                </div>
                
                <button
                  onClick={() => handleFollow(user.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.isFollowing
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  {user.isFollowing ? 'Siguiendo' : 'Seguir'}
                </button>
              </div>
            ))}

            {(!suggestedUsers || suggestedUsers.length === 0) && (
              <p className="text-gray-500 text-sm">No hay usuarios sugeridos</p>
            )}
          </div>
        </div>
      </div>

      {/* Post Modal */}
      {showPostModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Post de {selectedPost.author.username}</h2>
                <button
                  onClick={() => setShowPostModal(false)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-900">{selectedPost.content}</p>
                
                {selectedPost.images && selectedPost.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {selectedPost.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Post ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{new Date(selectedPost.createdAt).toLocaleString()}</span>
                  <span>{selectedPost.views} vistas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Perfil de Usuario</h2>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  ✕
                </button>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
                  {selectedUser.avatar ? (
                    <img src={selectedUser.avatar} alt={selectedUser.username} className="w-20 h-20 rounded-full" />
                  ) : (
                    selectedUser.username.charAt(0).toUpperCase()
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedUser.username}</h3>
                  {selectedUser.isVerified && (
                    <span className="text-blue-600 text-sm">✓ Verificado</span>
                  )}
                </div>
                
                {selectedUser.bio && (
                  <p className="text-gray-600">{selectedUser.bio}</p>
                )}
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-blue-600">{selectedUser.postsCount}</p>
                    <p className="text-sm text-gray-500">Posts</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">{selectedUser.followersCount}</p>
                    <p className="text-sm text-gray-500">Seguidores</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-purple-600">{selectedUser.followingCount}</p>
                    <p className="text-sm text-gray-500">Siguiendo</p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleFollow(selectedUser.id)}
                  className={`w-full px-4 py-2 rounded-lg font-medium ${
                    selectedUser.isFollowing
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  {selectedUser.isFollowing ? 'Dejar de seguir' : 'Seguir'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
