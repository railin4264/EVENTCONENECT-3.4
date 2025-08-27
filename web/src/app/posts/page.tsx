'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { 
  Plus, 
  Search, 
  Filter, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  Edit,
  Trash2,
  Image as ImageIcon,
  Video,
  Link,
  FileText,
  User,
  Calendar,
  Eye,
  ThumbsUp,
  MessageSquare,
  ExternalLink,
  MapPin,
  Hash,
  TrendingUp,
  Clock,
  Users
} from 'lucide-react';
import PostCreateForm from '@/components/forms/PostCreateForm';
import { toast } from 'react-hot-toast';

interface Post {
  id: string;
  type: 'text' | 'image' | 'video' | 'link' | 'event' | 'tribe';
  title: string;
  content: string;
  media?: {
    type: 'image' | 'video' | 'document';
    url: string;
    thumbnail?: string;
    filename?: string;
    size?: number;
  }[];
  link?: {
    url: string;
    title?: string;
    description?: string;
    image?: string;
  };
  author: {
    id: string;
    username: string;
    avatar?: string;
    isVerified: boolean;
    isHost: boolean;
  };
  event?: {
    id: string;
    title: string;
    date: string;
    location: string;
  };
  tribe?: {
    id: string;
    name: string;
    image?: string;
  };
  tags: string[];
  location?: string;
  isPublic: boolean;
  allowComments: boolean;
  allowSharing: boolean;
  createdAt: string;
  updatedAt: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  isLiked: boolean;
  isBookmarked: boolean;
  isShared: boolean;
  isAuthor: boolean;
  isFollowing: boolean;
}

interface PostFilters {
  search: string;
  type: string;
  author: string;
  tags: string[];
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  sort: 'recent' | 'popular' | 'trending' | 'likes' | 'comments';
}

export default function PostsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [filters, setFilters] = useState<PostFilters>({
    search: '',
    type: '',
    author: '',
    tags: [],
    dateRange: 'all',
    sort: 'recent',
  });

  // Fetch posts
  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ['posts', filters],
    queryFn: () => api.posts.getPosts(filters),
  });

  // Handle post actions
  const handleLike = async (postId: string) => {
    try {
      await api.posts.likePost(postId);
      refetch();
      toast.success('Post marcado como me gusta');
    } catch (error) {
      toast.error('Error al marcar post');
    }
  };

  const handleBookmark = async (postId: string) => {
    try {
      await api.posts.bookmarkPost(postId);
      refetch();
      toast.success('Post agregado a favoritos');
    } catch (error) {
      toast.error('Error al agregar a favoritos');
    }
  };

  const handleShare = async (post: Post) => {
    try {
      await navigator.share({
        title: post.title,
        text: post.content,
        url: window.location.href,
      });
    } catch (error) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Enlace copiado al portapapeles');
    }
  };

  const handleDelete = async (postId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este post?')) {
      try {
        await api.posts.deletePost(postId);
        refetch();
        toast.success('Post eliminado correctamente');
      } catch (error) {
        toast.error('Error al eliminar post');
      }
    }
  };

  const handleFollow = async (authorId: string) => {
    try {
      await api.users.followUser(authorId);
      refetch();
      toast.success('Usuario seguido correctamente');
    } catch (error) {
      toast.error('Error al seguir usuario');
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'link':
        return <Link className="w-4 h-4" />;
      case 'event':
        return <Calendar className="w-4 h-4" />;
      case 'tribe':
        return <Users className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getPostTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'text': 'bg-gray-100 text-gray-800',
      'image': 'bg-blue-100 text-blue-800',
      'video': 'bg-purple-100 text-purple-800',
      'link': 'bg-green-100 text-green-800',
      'event': 'bg-orange-100 text-orange-800',
      'tribe': 'bg-indigo-100 text-indigo-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} horas`;
    } else if (diffInHours < 48) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📝 Posts</h1>
            <p className="text-gray-600">Comparte y descubre contenido increíble en tu comunidad</p>
          </div>
          
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Crear Post</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Buscar posts..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los tipos</option>
                <option value="text">Texto</option>
                <option value="image">Imagen</option>
                <option value="video">Video</option>
                <option value="link">Enlace</option>
                <option value="event">Evento</option>
                <option value="tribe">Tribu</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas las fechas</option>
                <option value="today">Hoy</option>
                <option value="week">Esta semana</option>
                <option value="month">Este mes</option>
                <option value="year">Este año</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <select
                value={filters.sort}
                onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="recent">Más recientes</option>
                <option value="popular">Más populares</option>
                <option value="trending">Tendencia</option>
                <option value="likes">Más me gusta</option>
                <option value="comments">Más comentarios</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="space-y-6">
        {posts?.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            {/* Post Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {post.author.avatar ? (
                      <img src={post.author.avatar} alt={post.author.username} className="w-10 h-10 rounded-full" />
                    ) : (
                      post.author.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">{post.author.username}</span>
                      {post.author.isVerified && (
                        <span className="text-blue-600 text-sm">✓</span>
                      )}
                      {post.author.isHost && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Host</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(post.createdAt)}</span>
                      {post.location && (
                        <>
                          <span>•</span>
                          <MapPin className="w-3 h-3" />
                          <span>{post.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Post Type Badge */}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPostTypeColor(post.type)} flex items-center space-x-1`}>
                    {getPostTypeIcon(post.type)}
                    <span className="capitalize">{post.type}</span>
                  </span>
                  
                  {/* Action Menu */}
                  {(post.isAuthor || post.isFollowing) && (
                    <div className="relative">
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      
                      {/* Dropdown Menu */}
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                        <div className="py-2">
                          {post.isAuthor && (
                            <button
                              onClick={() => setEditingPost(post)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                            >
                              <Edit className="w-4 h-4" />
                              <span>Editar</span>
                            </button>
                          )}
                          {post.isAuthor && (
                            <button
                              onClick={() => handleDelete(post.id)}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Eliminar</span>
                            </button>
                          )}
                          {!post.isAuthor && !post.isFollowing && (
                            <button
                              onClick={() => handleFollow(post.author.id)}
                              className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center space-x-2"
                            >
                              <User className="w-4 h-4" />
                              <span>Seguir</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Post Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h3>
              
              {/* Post Content */}
              <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full flex items-center space-x-1"
                    >
                      <Hash className="w-3 h-3" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Post Media */}
            {post.media && post.media.length > 0 && (
              <div className="p-6 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {post.media.map((media, index) => (
                    <div key={index} className="relative">
                      {media.type === 'image' && (
                        <img
                          src={media.url}
                          alt="Post media"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      )}
                      {media.type === 'video' && (
                        <div className="relative w-full h-48 bg-gray-900 rounded-lg flex items-center justify-center">
                          <video
                            src={media.url}
                            poster={media.thumbnail}
                            controls
                            className="w-full h-full rounded-lg"
                          />
                        </div>
                      )}
                      {media.type === 'document' && (
                        <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center space-x-2 p-4">
                          <FileText className="w-8 h-8 text-gray-400" />
                          <div className="text-left">
                            <p className="text-sm font-medium text-gray-900">{media.filename}</p>
                            <p className="text-xs text-gray-500">{media.size && formatFileSize(media.size)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Link Preview */}
            {post.link && (
              <div className="px-6 pb-6">
                <a
                  href={post.link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors duration-200"
                >
                  <div className="flex items-start space-x-3">
                    {post.link.image && (
                      <img
                        src={post.link.image}
                        alt="Link preview"
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">{post.link.title}</h4>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{post.link.description}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <ExternalLink className="w-3 h-3" />
                        <span className="truncate">{post.link.url}</span>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            )}

            {/* Event Preview */}
            {post.event && (
              <div className="px-6 pb-6">
                <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-8 h-8 text-orange-600" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{post.event.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{formatDate(post.event.date)}</span>
                        <span>•</span>
                        <span>{post.event.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tribe Preview */}
            {post.tribe && (
              <div className="px-6 pb-6">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Users className="w-8 h-8 text-indigo-600" />
                    <div className="flex items-center space-x-3">
                      {post.tribe.image && (
                        <img
                          src={post.tribe.image}
                          alt={post.tribe.name}
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <span className="font-medium text-gray-900">{post.tribe.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Post Actions */}
            <div className="px-6 py-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                      post.isLiked ? 'text-red-600 bg-red-50' : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                    <span className="text-sm font-medium">{post.likes}</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{post.comments}</span>
                  </button>
                  
                  <button
                    onClick={() => handleShare(post)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors duration-200"
                  >
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm font-medium">{post.shares}</span>
                  </button>
                  
                  <button
                    onClick={() => handleBookmark(post.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                      post.isBookmarked ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <Bookmark className={`w-5 h-5 ${post.isBookmarked ? 'fill-current' : ''}`} />
                  </button>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{post.views}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>#{post.id}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(!posts || posts.length === 0) && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay posts disponibles</h3>
          <p className="text-gray-600">
            {filters.search || filters.type || filters.dateRange !== 'all'
              ? 'No hay posts que coincidan con los filtros aplicados'
              : 'Sé el primero en crear un post en tu comunidad'
            }
          </p>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Crear Nuevo Post</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  ✕
                </button>
              </div>
              
              <PostCreateForm
                onSuccess={() => {
                  setShowCreateForm(false);
                  refetch();
                  toast.success('Post creado correctamente');
                }}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {editingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Editar Post</h2>
                <button
                  onClick={() => setEditingPost(null)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  ✕
                </button>
              </div>
              
              <PostCreateForm
                post={editingPost}
                onSuccess={() => {
                  setEditingPost(null);
                  refetch();
                  toast.success('Post actualizado correctamente');
                }}
                onCancel={() => setEditingPost(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Post Details Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Detalles del Post</h2>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Post Info */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedPost.title}</h3>
                  <p className="text-gray-600 mb-4">{selectedPost.content}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="font-medium text-gray-700">Tipo:</span>
                      <p className="text-gray-600 capitalize">{selectedPost.type}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Autor:</span>
                      <p className="text-gray-600">{selectedPost.author.username}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Creado:</span>
                      <p className="text-gray-600">{formatDate(selectedPost.createdAt)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Vistas:</span>
                      <p className="text-gray-600">{selectedPost.views}</p>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex space-x-3">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    Ver Comentarios
                  </button>
                  <button
                    onClick={() => handleShare(selectedPost)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Compartir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
