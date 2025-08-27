'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { 
  Plus, 
  Search, 
  Filter, 
  Star, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  Edit,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  User,
  Calendar,
  Eye,
  TrendingUp,
  Clock,
  MapPin,
  Hash,
  Award,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  ImageIcon,
  Video,
  FileText,
  ExternalLink,
  Users,
  CalendarDays,
  Building
} from 'lucide-react';
import ReviewCreateForm from '@/components/forms/ReviewCreateForm';
import { toast } from 'react-hot-toast';

interface Review {
  id: string;
  entityType: 'event' | 'tribe' | 'post' | 'user';
  entityId: string;
  entityName: string;
  entityImage?: string;
  title: string;
  content: string;
  rating: number;
  isAnonymous: boolean;
  isHelpful: boolean;
  media?: {
    type: 'image' | 'video' | 'document';
    url: string;
    thumbnail?: string;
    filename?: string;
    size?: number;
  }[];
  author: {
    id: string;
    username: string;
    avatar?: string;
    isVerified: boolean;
    isHost: boolean;
  };
  createdAt: string;
  updatedAt: string;
  likes: number;
  dislikes: number;
  comments: number;
  shares: number;
  views: number;
  isLiked: boolean;
  isDisliked: boolean;
  isBookmarked: boolean;
  isAuthor: boolean;
  helpfulCount: number;
  isMarkedHelpful: boolean;
  tags: string[];
  location?: string;
  category?: string;
}

interface ReviewFilters {
  search: string;
  entityType: string;
  rating: number;
  author: string;
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  sort: 'recent' | 'rating' | 'helpful' | 'likes' | 'comments';
  category: string;
}

export default function ReviewsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [filters, setFilters] = useState<ReviewFilters>({
    search: '',
    entityType: '',
    rating: 0,
    author: '',
    dateRange: 'all',
    sort: 'recent',
    category: '',
  });

  // Fetch reviews
  const { data: reviews, isLoading, refetch } = useQuery({
    queryKey: ['reviews', filters],
    queryFn: () => api.reviews.getReviews(filters),
  });

  // Handle review actions
  const handleLike = async (reviewId: string) => {
    try {
      await api.reviews.likeReview(reviewId);
      refetch();
      toast.success('Review marcado como me gusta');
    } catch (error) {
      toast.error('Error al marcar review');
    }
  };

  const handleDislike = async (reviewId: string) => {
    try {
      await api.reviews.dislikeReview(reviewId);
      refetch();
      toast.success('Review marcado como no me gusta');
    } catch (error) {
      toast.error('Error al marcar review');
    }
  };

  const handleBookmark = async (reviewId: string) => {
    try {
      await api.reviews.bookmarkReview(reviewId);
      refetch();
      toast.success('Review agregado a favoritos');
    } catch (error) {
      toast.error('Error al agregar a favoritos');
    }
  };

  const handleShare = async (review: Review) => {
    try {
      await navigator.share({
        title: review.title,
        text: review.content,
        url: window.location.href,
      });
    } catch (error) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Enlace copiado al portapapeles');
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este review?')) {
      try {
        await api.reviews.deleteReview(reviewId);
        refetch();
        toast.success('Review eliminado correctamente');
      } catch (error) {
        toast.error('Error al eliminar review');
      }
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await api.reviews.markHelpful(reviewId);
      refetch();
      toast.success('Review marcado como útil');
    } catch (error) {
      toast.error('Error al marcar review como útil');
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

  const getEntityTypeIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <CalendarDays className="w-4 h-4" />;
      case 'tribe':
        return <Users className="w-4 h-4" />;
      case 'post':
        return <FileText className="w-4 h-4" />;
      case 'user':
        return <User className="w-4 h-4" />;
      default:
        return <Building className="w-4 h-4" />;
    }
  };

  const getEntityTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'event': 'bg-orange-100 text-orange-800',
      'tribe': 'bg-indigo-100 text-indigo-800',
      'post': 'bg-blue-100 text-blue-800',
      'user': 'bg-green-100 text-green-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'fill-current text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">⭐ Reviews</h1>
            <p className="text-gray-600">Descubre opiniones honestas y comparte tus experiencias</p>
          </div>
          
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Escribir Review</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Buscar reviews..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>

            {/* Entity Type Filter */}
            <div>
              <select
                value={filters.entityType}
                onChange={(e) => setFilters(prev => ({ ...prev, entityType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">Todos los tipos</option>
                <option value="event">Eventos</option>
                <option value="tribe">Tribus</option>
                <option value="post">Posts</option>
                <option value="user">Usuarios</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <select
                value={filters.rating}
                onChange={(e) => setFilters(prev => ({ ...prev, rating: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value={0}>Todas las calificaciones</option>
                <option value={5}>5 estrellas</option>
                <option value={4}>4+ estrellas</option>
                <option value={3}>3+ estrellas</option>
                <option value={2}>2+ estrellas</option>
                <option value={1}>1+ estrella</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="recent">Más recientes</option>
                <option value="rating">Mejor calificados</option>
                <option value="helpful">Más útiles</option>
                <option value="likes">Más me gusta</option>
                <option value="comments">Más comentarios</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="space-y-6">
        {reviews?.map((review) => (
          <div
            key={review.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            {/* Review Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                    {review.author.avatar ? (
                      <img src={review.author.avatar} alt={review.author.username} className="w-10 h-10 rounded-full" />
                    ) : (
                      review.author.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">
                        {review.isAnonymous ? 'Usuario Anónimo' : review.author.username}
                      </span>
                      {review.author.isVerified && (
                        <span className="text-blue-600 text-sm">✓</span>
                      )}
                      {review.author.isHost && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Host</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(review.createdAt)}</span>
                      {review.location && (
                        <>
                          <span>•</span>
                          <MapPin className="w-3 h-3" />
                          <span>{review.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Entity Type Badge */}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEntityTypeColor(review.entityType)} flex items-center space-x-1`}>
                    {getEntityTypeIcon(review.entityType)}
                    <span className="capitalize">{review.entityType}</span>
                  </span>
                  
                  {/* Action Menu */}
                  {(review.isAuthor || review.isBookmarked) && (
                    <div className="relative">
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      
                      {/* Dropdown Menu */}
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                        <div className="py-2">
                          {review.isAuthor && (
                            <button
                              onClick={() => setEditingReview(review)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                            >
                              <Edit className="w-4 h-4" />
                              <span>Editar</span>
                            </button>
                          )}
                          {review.isAuthor && (
                            <button
                              onClick={() => handleDelete(review.id)}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Eliminar</span>
                            </button>
                          )}
                          {!review.isAuthor && !review.isBookmarked && (
                            <button
                              onClick={() => handleFollow(review.author.id)}
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

              {/* Entity Info */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {review.entityImage ? (
                    <img
                      src={review.entityImage}
                      alt={review.entityName}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {review.entityName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900">{review.entityName}</h4>
                    <p className="text-sm text-gray-600 capitalize">{review.entityType}</p>
                  </div>
                </div>
              </div>

              {/* Review Title and Rating */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{review.title}</h3>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {renderStars(review.rating)}
                  </div>
                  <span className={`text-lg font-semibold ${getRatingColor(review.rating)}`}>
                    {review.rating.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500">/ 5</span>
                </div>
              </div>
              
              {/* Review Content */}
              <p className="text-gray-700 mb-4 leading-relaxed">{review.content}</p>

              {/* Tags */}
              {review.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {review.tags.map((tag, index) => (
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

            {/* Review Media */}
            {review.media && review.media.length > 0 && (
              <div className="p-6 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {review.media.map((media, index) => (
                    <div key={index} className="relative">
                      {media.type === 'image' && (
                        <img
                          src={media.url}
                          alt="Review media"
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

            {/* Review Actions */}
            <div className="px-6 py-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => handleLike(review.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                      review.isLiked ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                    }`}
                  >
                    <ThumbsUp className={`w-5 h-5 ${review.isLiked ? 'fill-current' : ''}`} />
                    <span className="text-sm font-medium">{review.likes}</span>
                  </button>
                  
                  <button
                    onClick={() => handleDislike(review.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                      review.isDisliked ? 'text-red-600 bg-red-50' : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <ThumbsDown className={`w-5 h-5 ${review.isDisliked ? 'fill-current' : ''}`} />
                    <span className="text-sm font-medium">{review.dislikes}</span>
                  </button>
                  
                  <button
                    onClick={() => handleMarkHelpful(review.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                      review.isMarkedHelpful ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <Award className={`w-5 h-5 ${review.isMarkedHelpful ? 'fill-current' : ''}`} />
                    <span className="text-sm font-medium">{review.helpfulCount}</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{review.comments}</span>
                  </button>
                  
                  <button
                    onClick={() => handleShare(review)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors duration-200"
                  >
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm font-medium">{review.shares}</span>
                  </button>
                  
                  <button
                    onClick={() => handleBookmark(review.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                      review.isBookmarked ? 'text-yellow-600 bg-yellow-50' : 'text-gray-600 hover:text-yellow-600 hover:bg-yellow-50'
                    }`}
                  >
                    <Bookmark className={`w-5 h-5 ${review.isBookmarked ? 'fill-current' : ''}`} />
                  </button>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{review.views}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>#{review.id}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(!reviews || reviews.length === 0) && (
        <div className="text-center py-12">
          <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reviews disponibles</h3>
          <p className="text-gray-600">
            {filters.search || filters.entityType || filters.rating > 0
              ? 'No hay reviews que coincidan con los filtros aplicados'
              : 'Sé el primero en escribir un review en tu comunidad'
            }
          </p>
        </div>
      )}

      {/* Create Review Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Escribir Nuevo Review</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  ✕
                </button>
              </div>
              
              <ReviewCreateForm
                onSuccess={() => {
                  setShowCreateForm(false);
                  refetch();
                  toast.success('Review creado correctamente');
                }}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Review Modal */}
      {editingReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Editar Review</h2>
                <button
                  onClick={() => setEditingReview(null)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  ✕
                </button>
              </div>
              
              <ReviewCreateForm
                review={editingReview}
                onSuccess={() => {
                  setEditingReview(null);
                  refetch();
                  toast.success('Review actualizado correctamente');
                }}
                onCancel={() => setEditingReview(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Review Details Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Detalles del Review</h2>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Review Info */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedReview.title}</h3>
                  <p className="text-gray-600 mb-4">{selectedReview.content}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="font-medium text-gray-700">Tipo:</span>
                      <p className="text-gray-600 capitalize">{selectedReview.entityType}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Autor:</span>
                      <p className="text-gray-600">
                        {selectedReview.isAnonymous ? 'Anónimo' : selectedReview.author.username}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Calificación:</span>
                      <p className="text-gray-600">{selectedReview.rating}/5</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Vistas:</span>
                      <p className="text-gray-600">{selectedReview.views}</p>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex space-x-3">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    Ver Comentarios
                  </button>
                  <button
                    onClick={() => handleShare(selectedReview)}
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
