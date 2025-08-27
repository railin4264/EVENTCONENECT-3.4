'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { 
  Plus, Search, Users, MapPin, Calendar, Eye, Heart, Share2, Edit, Trash2, 
  MoreHorizontal, Lock, Globe, Hash, Star, MessageCircle, Bookmark, User, 
  CheckCircle, Award, Zap, Camera, Music, Gamepad2, Utensils, Plane, 
  GraduationCap, Briefcase, ShoppingBag, Home, Palette, Dumbbell, BookOpen
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  isVerified: boolean;
  isHost: boolean;
  isOnline: boolean;
  lastSeen: string;
  followers: number;
  following: number;
  events: number;
  tribes: number;
  posts: number;
  reviews: number;
  rating: number;
  badges: string[];
  interests: string[];
  skills: string[];
  createdAt: string;
  updatedAt: string;
  isFollowing: boolean;
  isBlocked: boolean;
  isMuted: boolean;
}

interface UserFilters {
  search: string;
  location: string;
  interests: string[];
  skills: string[];
  sort: 'recent' | 'popular' | 'rating' | 'followers' | 'activity';
}

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    location: '',
    interests: [],
    skills: [],
    sort: 'recent',
  });

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['users', filters],
    queryFn: () => api.users.getUsers(filters),
  });

  const handleFollow = async (userId: string) => {
    try {
      await api.users.followUser(userId);
      refetch();
      toast.success('Usuario seguido correctamente');
    } catch (error) {
      toast.error('Error al seguir usuario');
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      await api.users.unfollowUser(userId);
      refetch();
      toast.success('Usuario dejado de seguir');
    } catch (error) {
      toast.error('Error al dejar de seguir usuario');
    }
  };

  const handleBlock = async (userId: string) => {
    try {
      await api.users.blockUser(userId);
      refetch();
      toast.success('Usuario bloqueado');
    } catch (error) {
      toast.error('Error al bloquear usuario');
    }
  };

  const handleShare = async (user: User) => {
    try {
      await navigator.share({
        title: user.username,
        text: user.bio || `Conoce a ${user.username}`,
        url: window.location.href,
      });
    } catch (error) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Enlace copiado al portapapeles');
    }
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">👥 Usuarios</h1>
            <p className="text-gray-600">Conecta con personas increíbles en tu comunidad</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Buscar usuarios..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <select
                value={filters.sort}
                onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="recent">Más recientes</option>
                <option value="popular">Más populares</option>
                <option value="rating">Mejor calificados</option>
                <option value="followers">Más seguidores</option>
                <option value="activity">Más activos</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users?.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            {/* User Header */}
            <div className="relative h-32 bg-gradient-to-br from-blue-500 to-purple-600">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
              
              {/* Online Status */}
              <div className="absolute top-4 left-4">
                <div className={`w-3 h-3 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
              </div>

              {/* Verification Badge */}
              {user.isVerified && (
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Verificado</span>
                  </span>
                </div>
              )}

              {/* Host Badge */}
              {user.isHost && (
                <div className="absolute bottom-4 left-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center space-x-1">
                    <Award className="w-3 h-3" />
                    <span>Host</span>
                  </span>
                </div>
              )}
            </div>

            {/* User Content */}
            <div className="p-6">
              {/* Name and Username */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-gray-600">@{user.username}</p>
              </div>

              {/* Bio */}
              {user.bio && (
                <p className="text-gray-700 mb-4 line-clamp-2">{user.bio}</p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="text-center">
                  <p className="font-semibold text-gray-900">{user.followers}</p>
                  <p className="text-gray-600">Seguidores</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900">{user.following}</p>
                  <p className="text-gray-600">Siguiendo</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900">{user.events}</p>
                  <p className="text-gray-600">Eventos</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900">{user.rating.toFixed(1)}</p>
                  <p className="text-gray-600">Rating</p>
                </div>
              </div>

              {/* Location */}
              {user.location && (
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>{user.location}</span>
                </div>
              )}

              {/* Interests */}
              {user.interests.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {user.interests.slice(0, 3).map((interest, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {interest}
                    </span>
                  ))}
                  {user.interests.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{user.interests.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleShare(user)}
                    className="p-2 rounded-full text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors duration-200"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="p-2 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
                
                {user.isFollowing ? (
                  <button
                    onClick={() => handleUnfollow(user.id)}
                    className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                  >
                    Siguiendo
                  </button>
                ) : (
                  <button
                    onClick={() => handleFollow(user.id)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    Seguir
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {(!users || users.length === 0) && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay usuarios disponibles</h3>
          <p className="text-gray-600">
            {filters.search
              ? 'No hay usuarios que coincidan con la búsqueda'
              : 'No hay usuarios registrados en este momento'
            }
          </p>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Perfil de Usuario</h2>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {/* User Info */}
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                    {selectedUser.avatar ? (
                      <img src={selectedUser.avatar} alt={selectedUser.username} className="w-24 h-24 rounded-full" />
                    ) : (
                      selectedUser.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <p className="text-gray-600 mb-2">@{selectedUser.username}</p>
                  
                  {selectedUser.bio && (
                    <p className="text-gray-700 mb-4">{selectedUser.bio}</p>
                  )}
                  
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{selectedUser.followers} seguidores</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{selectedUser.following} siguiendo</span>
                    </span>
                  </div>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{selectedUser.events}</p>
                    <p className="text-gray-600">Eventos</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{selectedUser.tribes}</p>
                    <p className="text-gray-600">Tribus</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{selectedUser.posts}</p>
                    <p className="text-gray-600">Posts</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">{selectedUser.reviews}</p>
                    <p className="text-gray-600">Reviews</p>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex space-x-3">
                  {selectedUser.isFollowing ? (
                    <button
                      onClick={() => handleUnfollow(selectedUser.id)}
                      className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Dejar de Seguir
                    </button>
                  ) : (
                    <button
                      onClick={() => handleFollow(selectedUser.id)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Seguir
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleShare(selectedUser)}
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
