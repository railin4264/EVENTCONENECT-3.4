'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { 
  Plus, 
  Search, 
  Users, 
  MapPin, 
  Calendar, 
  Eye, 
  Heart, 
  Share2, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Lock,
  Globe,
  Hash,
  Star,
  MessageCircle,
  Bookmark
} from 'lucide-react';
import TribeCreateForm from '@/components/forms/TribeCreateForm';
import { toast } from 'react-hot-toast';

interface Tribe {
  id: string;
  name: string;
  description: string;
  category: string;
  isPrivate: boolean;
  memberCount: number;
  maxMembers: number;
  image?: string;
  tags: string[];
  rules: string[];
  location?: string;
  createdAt: string;
  updatedAt: string;
  host: {
    id: string;
    username: string;
    avatar?: string;
    isVerified: boolean;
  };
  isMember: boolean;
  isHost: boolean;
  rating: number;
  views: number;
  isLiked: boolean;
  isBookmarked: boolean;
}

interface TribeFilters {
  search: string;
  category: string;
  privacy: 'all' | 'public' | 'private';
  sort: 'name' | 'members' | 'rating' | 'created';
}

export default function TribesPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTribe, setEditingTribe] = useState<Tribe | null>(null);
  const [selectedTribe, setSelectedTribe] = useState<Tribe | null>(null);
  const [filters, setFilters] = useState<TribeFilters>({
    search: '',
    category: '',
    privacy: 'all',
    sort: 'name',
  });

  // Fetch tribes
  const { data: tribes, isLoading, refetch } = useQuery({
    queryKey: ['tribes', filters],
    queryFn: () => api.tribes.getTribes(filters),
  });

  // Handle tribe actions
  const handleJoin = async (tribeId: string) => {
    try {
      await api.tribes.joinTribe(tribeId);
      refetch();
      toast.success('Te has unido a la tribu');
    } catch (error) {
      toast.error('Error al unirse a la tribu');
    }
  };

  const handleLeave = async (tribeId: string) => {
    try {
      await api.tribes.leaveTribe(tribeId);
      refetch();
      toast.success('Has abandonado la tribu');
    } catch (error) {
      toast.error('Error al abandonar la tribu');
    }
  };

  const handleLike = async (tribeId: string) => {
    try {
      await api.tribes.likeTribe(tribeId);
      refetch();
      toast.success('Tribu marcada como favorita');
    } catch (error) {
      toast.error('Error al marcar tribu');
    }
  };

  const handleBookmark = async (tribeId: string) => {
    try {
      await api.tribes.bookmarkTribe(tribeId);
      refetch();
      toast.success('Tribu agregada a favoritos');
    } catch (error) {
      toast.error('Error al agregar a favoritos');
    }
  };

  const handleShare = async (tribe: Tribe) => {
    try {
      await navigator.share({
        title: tribe.name,
        text: tribe.description,
        url: window.location.href,
      });
    } catch (error) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Enlace copiado al portapapeles');
    }
  };

  const handleDelete = async (tribeId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta tribu?')) {
      try {
        await api.tribes.deleteTribe(tribeId);
        refetch();
        toast.success('Tribu eliminada correctamente');
      } catch (error) {
        toast.error('Error al eliminar tribu');
      }
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'tecnologia': 'bg-blue-100 text-blue-800',
      'musica': 'bg-purple-100 text-purple-800',
      'deportes': 'bg-green-100 text-green-800',
      'arte': 'bg-pink-100 text-pink-800',
      'negocios': 'bg-gray-100 text-gray-800',
      'educacion': 'bg-yellow-100 text-yellow-800',
      'social': 'bg-red-100 text-red-800',
      'gaming': 'bg-indigo-100 text-indigo-800',
      'fitness': 'bg-orange-100 text-orange-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">👥 Tribus</h1>
            <p className="text-gray-600">Conecta con comunidades que comparten tus intereses</p>
          </div>
          
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Crear Tribu</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Buscar tribus..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Todas las categorías</option>
                <option value="tecnologia">Tecnología</option>
                <option value="musica">Música</option>
                <option value="deportes">Deportes</option>
                <option value="arte">Arte</option>
                <option value="negocios">Negocios</option>
                <option value="educacion">Educación</option>
                <option value="social">Social</option>
                <option value="gaming">Gaming</option>
                <option value="fitness">Fitness</option>
              </select>
            </div>

            {/* Privacy Filter */}
            <div>
              <select
                value={filters.privacy}
                onChange={(e) => setFilters(prev => ({ ...prev, privacy: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">Todas las privacidades</option>
                <option value="public">Públicas</option>
                <option value="private">Privadas</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tribes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tribes?.map((tribe) => (
          <div
            key={tribe.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            {/* Tribe Image */}
            <div className="relative h-48 bg-gradient-to-br from-green-500 to-blue-600">
              {tribe.image ? (
                <img
                  src={tribe.image}
                  alt={tribe.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                  {tribe.name.charAt(0).toUpperCase()}
                </div>
              )}
              
              {/* Privacy Badge */}
              <div className="absolute top-4 left-4">
                {tribe.isPrivate ? (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center space-x-1">
                    <Lock className="w-3 h-3" />
                    <span>Privada</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center space-x-1">
                    <Globe className="w-3 h-3" />
                    <span>Pública</span>
                  </span>
                )}
              </div>

              {/* Category Badge */}
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(tribe.category)}`}>
                  {tribe.category}
                </span>
              </div>

              {/* Action Menu */}
              {(tribe.isHost || tribe.isMember) && (
                <div className="absolute top-4 right-4">
                  <div className="relative">
                    <button className="p-2 bg-white bg-opacity-90 rounded-full text-gray-600 hover:text-gray-800">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <div className="py-2">
                        {tribe.isHost && (
                          <button
                            onClick={() => setEditingTribe(tribe)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Editar</span>
                          </button>
                        )}
                        {tribe.isHost && (
                          <button
                            onClick={() => handleDelete(tribe.id)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Eliminar</span>
                          </button>
                        )}
                        {tribe.isMember && !tribe.isHost && (
                          <button
                            onClick={() => handleLeave(tribe.id)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                          >
                            <Users className="w-4 h-4" />
                            <span>Abandonar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tribe Content */}
            <div className="p-6">
              {/* Title and Host */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{tribe.name}</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {tribe.host.avatar ? (
                      <img src={tribe.host.avatar} alt={tribe.host.username} className="w-6 h-6 rounded-full" />
                    ) : (
                      tribe.host.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-sm text-gray-600">Creada por {tribe.host.username}</span>
                  {tribe.host.isVerified && (
                    <span className="text-blue-600 text-sm">✓</span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-4 line-clamp-2">{tribe.description}</p>

              {/* Tribe Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  <span>{tribe.memberCount}/{tribe.maxMembers} miembros</span>
                </div>
                
                {tribe.location && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>{tribe.location}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Creada {formatDate(tribe.createdAt)}</span>
                </div>
              </div>

              {/* Tags */}
              {tribe.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {tribe.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                  {tribe.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{tribe.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{tribe.rating.toFixed(1)}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{tribe.views}</span>
                  </span>
                </div>
                <span>{formatDate(tribe.updatedAt)}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleLike(tribe.id)}
                    className={`p-2 rounded-full ${
                      tribe.isLiked ? 'text-red-600 bg-red-50' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                    } transition-colors duration-200`}
                  >
                    <Heart className={`w-5 h-5 ${tribe.isLiked ? 'fill-current' : ''}`} />
                  </button>
                  
                  <button
                    onClick={() => handleBookmark(tribe.id)}
                    className={`p-2 rounded-full ${
                      tribe.isBookmarked ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                    } transition-colors duration-200`}
                  >
                    <Bookmark className={`w-5 h-5 ${tribe.isBookmarked ? 'fill-current' : ''}`} />
                  </button>
                  
                  <button
                    onClick={() => handleShare(tribe)}
                    className="p-2 rounded-full text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors duration-200"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
                
                {tribe.isMember ? (
                  <button
                    onClick={() => setSelectedTribe(tribe)}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
                  >
                    Ver Tribu
                  </button>
                ) : (
                  <button
                    onClick={() => handleJoin(tribe.id)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    Unirse
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {(!tribes || tribes.length === 0) && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tribus disponibles</h3>
          <p className="text-gray-600">
            {filters.search || filters.category || filters.privacy !== 'all'
              ? 'No hay tribus que coincidan con los filtros aplicados'
              : 'Sé el primero en crear una tribu en tu comunidad'
            }
          </p>
        </div>
      )}

      {/* Create Tribe Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Crear Nueva Tribu</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  ✕
                </button>
              </div>
              
              <TribeCreateForm
                onSuccess={() => {
                  setShowCreateForm(false);
                  refetch();
                  toast.success('Tribu creada correctamente');
                }}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Tribe Modal */}
      {editingTribe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Editar Tribu</h2>
                <button
                  onClick={() => setEditingTribe(null)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  ✕
                </button>
              </div>
              
              <TribeCreateForm
                tribe={editingTribe}
                onSuccess={() => {
                  setEditingTribe(null);
                  refetch();
                  toast.success('Tribu actualizada correctamente');
                }}
                onCancel={() => setEditingTribe(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tribe Details Modal */}
      {selectedTribe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Detalles de la Tribu</h2>
                <button
                  onClick={() => setSelectedTribe(null)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Tribe Image */}
                {selectedTribe.image && (
                  <img
                    src={selectedTribe.image}
                    alt={selectedTribe.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
                
                {/* Tribe Info */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedTribe.name}</h3>
                  <p className="text-gray-600 mb-4">{selectedTribe.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="font-medium text-gray-700">Categoría:</span>
                      <p className="text-gray-600 capitalize">{selectedTribe.category}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Privacidad:</span>
                      <p className="text-gray-600">
                        {selectedTribe.isPrivate ? 'Privada' : 'Pública'}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Miembros:</span>
                      <p className="text-gray-600">{selectedTribe.memberCount}/{selectedTribe.maxMembers}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Creada:</span>
                      <p className="text-gray-600">{formatDate(selectedTribe.createdAt)}</p>
                    </div>
                  </div>
                  
                  {/* Rules */}
                  {selectedTribe.rules.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-2">Reglas de la Tribu:</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {selectedTribe.rules.map((rule, index) => (
                          <li key={index}>{rule}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex space-x-3">
                  <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
                    Ver Miembros
                  </button>
                  <button
                    onClick={() => handleShare(selectedTribe)}
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











