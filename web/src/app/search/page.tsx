'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { 
  Search, Filter, Users, Calendar, FileText, Star, MapPin, Clock, 
  Eye, Heart, Share2, Bookmark, MoreHorizontal, Edit, Trash2, 
  User, CheckCircle, Award, Zap, Camera, Music, Gamepad2, Utensils, 
  Plane, GraduationCap, Briefcase, ShoppingBag, Home, Palette, 
  Dumbbell, BookOpen, Hash, TrendingUp, ExternalLink, Globe, Lock
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SearchResult {
  id: string;
  type: 'event' | 'tribe' | 'post' | 'user' | 'review';
  title: string;
  description?: string;
  content?: string;
  category?: string;
  tags?: string[];
  location?: string;
  date?: string;
  author?: {
    id: string;
    username: string;
    avatar?: string;
    isVerified: boolean;
  };
  rating?: number;
  views?: number;
  likes?: number;
  followers?: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
  relevance: number;
  highlights: string[];
}

interface SearchFilters {
  query: string;
  types: string[];
  categories: string[];
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  location: string;
  sort: 'relevance' | 'date' | 'popularity' | 'rating';
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useState<URLSearchParams>();
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    types: [],
    categories: [],
    dateRange: 'all',
    location: '',
    sort: 'relevance',
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearchParams(params);
    const query = params.get('q') || '';
    setFilters(prev => ({ ...prev, query }));
  }, []);

  const { data: results, isLoading, refetch } = useQuery({
    queryKey: ['search', filters],
    queryFn: () => api.search.globalSearch(filters),
    enabled: !!filters.query,
  });

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, query }));
    if (searchParams) {
      searchParams.set('q', query);
      window.history.pushState({}, '', `?${searchParams.toString()}`);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleTypeToggle = (type: string) => {
    setFilters(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }));
  };

  const handleCategoryToggle = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: any } = {
      'event': Calendar,
      'tribe': Users,
      'post': FileText,
      'user': User,
      'review': Star,
    };
    return icons[type] || FileText;
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'event': 'bg-orange-100 text-orange-800',
      'tribe': 'bg-indigo-100 text-indigo-800',
      'post': 'bg-blue-100 text-blue-800',
      'user': 'bg-green-100 text-green-800',
      'review': 'bg-yellow-100 text-yellow-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: any } = {
      'musica': Music,
      'deportes': Dumbbell,
      'tecnologia': Zap,
      'arte': Palette,
      'gastronomia': Utensils,
      'viajes': Plane,
      'educacion': GraduationCap,
      'negocios': Briefcase,
      'social': Users,
      'shopping': ShoppingBag,
      'hogar': Home,
      'gaming': Gamepad2,
      'fitness': Dumbbell,
      'cultura': BookOpen,
    };
    return icons[category] || Hash;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    if (diffInHours < 48) return 'Ayer';
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  };

  const handleLike = async (resultId: string, type: string) => {
    try {
      switch (type) {
        case 'event':
          await api.events.likeEvent(resultId);
          break;
        case 'post':
          await api.posts.likePost(resultId);
          break;
        case 'tribe':
          await api.tribes.likeTribe(resultId);
          break;
        case 'review':
          await api.reviews.likeReview(resultId);
          break;
      }
      refetch();
      toast.success('Elemento marcado como me gusta');
    } catch (error) {
      toast.error('Error al marcar elemento');
    }
  };

  const handleBookmark = async (resultId: string, type: string) => {
    try {
      switch (type) {
        case 'event':
          await api.events.bookmarkEvent(resultId);
          break;
        case 'post':
          await api.posts.bookmarkPost(resultId);
          break;
        case 'tribe':
          await api.tribes.bookmarkTribe(resultId);
          break;
        case 'review':
          await api.reviews.bookmarkReview(resultId);
          break;
      }
      refetch();
      toast.success('Elemento agregado a favoritos');
    } catch (error) {
      toast.error('Error al agregar a favoritos');
    }
  };

  const handleShare = async (result: SearchResult) => {
    try {
      await navigator.share({
        title: result.title,
        text: result.description || result.content || '',
        url: window.location.href,
      });
    } catch (error) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Enlace copiado al portapapeles');
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      await api.users.followUser(userId);
      refetch();
      toast.success('Usuario seguido correctamente');
    } catch (error) {
      toast.error('Error al seguir usuario');
    }
  };

  const renderSearchResult = (result: SearchResult) => {
    const TypeIcon = getTypeIcon(result.type);
    
    return (
      <div
        key={`${result.type}-${result.id}`}
        className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
      >
        {/* Result Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                <TypeIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(result.type)}`}>
                    {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                  </span>
                  {result.category && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 flex items-center space-x-1">
                      {React.createElement(getCategoryIcon(result.category), { className: "w-3 h-3" })}
                      <span className="capitalize">{result.category}</span>
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mt-2">{result.title}</h3>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {result.relevance.toFixed(1)}% relevancia
              </span>
            </div>
          </div>

          {/* Description */}
          {(result.description || result.content) && (
            <p className="text-gray-700 mb-4 line-clamp-2">
              {result.description || result.content}
            </p>
          )}

          {/* Highlights */}
          {result.highlights.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 mb-2">
                <strong>Coincidencias encontradas:</strong>
              </p>
              <div className="text-sm text-yellow-700">
                {result.highlights.map((highlight, index) => (
                  <span key={index} className="inline-block mr-2 mb-1">
                    "...{highlight}..."
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {result.tags && result.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {result.tags.slice(0, 5).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full flex items-center space-x-1"
                >
                  <Hash className="w-3 h-3" />
                  <span>{tag}</span>
                </span>
              ))}
              {result.tags.length > 5 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{result.tags.length - 5}
                </span>
              )}
            </div>
          )}

          {/* Meta Info */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              {result.author && (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs">
                    {result.author.avatar ? (
                      <img src={result.author.avatar} alt={result.author.username} className="w-5 h-5 rounded-full" />
                    ) : (
                      result.author.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span>{result.author.username}</span>
                  {result.author.isVerified && (
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  )}
                </div>
              )}
              
              {result.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{result.location}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{formatDate(result.createdAt)}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {result.rating && (
                <span className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{result.rating.toFixed(1)}</span>
                </span>
              )}
              
              {result.views && (
                <span className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{result.views}</span>
                </span>
              )}
              
              {result.likes && (
                <span className="flex items-center space-x-1">
                  <Heart className="w-4 h-4" />
                  <span>{result.likes}</span>
                </span>
              )}
              
              {result.followers && (
                <span className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{result.followers}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Result Actions */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleLike(result.id, result.type)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <Heart className="w-5 h-5" />
                <span className="text-sm">Me gusta</span>
              </button>
              
              <button
                onClick={() => handleBookmark(result.id, result.type)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
              >
                <Bookmark className="w-5 h-5" />
                <span className="text-sm">Guardar</span>
              </button>
              
              <button
                onClick={() => handleShare(result)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors duration-200"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-sm">Compartir</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              {result.type === 'user' && (
                <button
                  onClick={() => handleFollow(result.id)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Seguir
                </button>
              )}
              
              <button className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200">
                Ver {result.type === 'user' ? 'Perfil' : 'Detalles'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🔍 Búsqueda Global</h1>
          <p className="text-xl text-gray-600">Encuentra eventos, tribus, posts, usuarios y más en tu comunidad</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              value={filters.query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Buscar eventos, tribus, posts, usuarios, reviews..."
              className="w-full pl-14 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              Buscar
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Type Filters */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipos de contenido</label>
              <div className="flex flex-wrap gap-2">
                {['event', 'tribe', 'post', 'user', 'review'].map((type) => (
                  <button
                    key={type}
                    onClick={() => handleTypeToggle(type)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                      filters.types.includes(type)
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rango de fechas</label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas las fechas</option>
                <option value="today">Hoy</option>
                <option value="week">Esta semana</option>
                <option value="month">Este mes</option>
                <option value="year">Este año</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="relevance">Relevancia</option>
                <option value="date">Fecha</option>
                <option value="popularity">Popularidad</option>
                <option value="rating">Calificación</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {filters.query && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : results && results.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Resultados de búsqueda para "{filters.query}"
                </h2>
                <p className="text-gray-600">{results.length} resultados encontrados</p>
              </div>
              
              {results.map(renderSearchResult)}
            </>
          ) : (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron resultados</h3>
              <p className="text-gray-600">
                No hay resultados que coincidan con "{filters.query}". Intenta con otros términos de búsqueda.
              </p>
            </div>
          )}
        </div>
      )}

      {/* No Search Query */}
      {!filters.query && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Comienza tu búsqueda</h3>
          <p className="text-gray-600">
            Escribe en el campo de búsqueda para encontrar eventos, tribus, posts, usuarios y más en tu comunidad.
          </p>
        </div>
      )}
    </div>
  );
}
