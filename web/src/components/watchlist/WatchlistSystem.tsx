'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { 
  Heart, 
  Calendar, 
  Users, 
  MapPin, 
  Clock, 
  Star,
  Eye,
  Bookmark,
  Trash2,
  Filter,
  Search,
  SortAsc,
  SortDesc
} from 'lucide-react';

interface WatchlistItem {
  id: string;
  entityId: string;
  entityType: 'event' | 'tribe' | 'post';
  entity: any; // Event, Tribe, or Post data
  addedAt: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
}

interface WatchlistFilters {
  entityType: 'all' | 'event' | 'tribe' | 'post';
  priority: 'all' | 'low' | 'medium' | 'high';
  search: string;
  tags: string[];
}

interface WatchlistSort {
  field: 'addedAt' | 'priority' | 'entityType';
  direction: 'asc' | 'desc';
}

export default function WatchlistSystem() {
  const [filters, setFilters] = useState<WatchlistFilters>({
    entityType: 'all',
    priority: 'all',
    search: '',
    tags: [],
  });
  
  const [sort, setSort] = useState<WatchlistSort>({
    field: 'addedAt',
    direction: 'desc',
  });
  
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch watchlist data
  const { data: watchlist, isLoading } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => api.watchlist.getWatchlist(),
  });

  // Fetch available tags
  const { data: availableTags } = useQuery({
    queryKey: ['watchlist-tags'],
    queryFn: () => api.watchlist.getAvailableTags(),
  });

  // Mutations
  const addToWatchlistMutation = useMutation({
    mutationFn: (data: { entityId: string; entityType: string; notes?: string; priority?: string; tags?: string[] }) =>
      api.watchlist.addToWatchlist(data.entityId, data.entityType, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      setShowAddModal(false);
    },
  });

  const removeFromWatchlistMutation = useMutation({
    mutationFn: (itemId: string) => api.watchlist.removeFromWatchlist(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      setSelectedItems([]);
    },
  });

  const updateWatchlistItemMutation = useMutation({
    mutationFn: (data: { id: string; notes?: string; priority?: string; tags?: string[] }) =>
      api.watchlist.updateWatchlistItem(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });

  const bulkRemoveMutation = useMutation({
    mutationFn: (itemIds: string[]) => api.watchlist.bulkRemoveFromWatchlist(itemIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      setSelectedItems([]);
    },
  });

  // Filter and sort watchlist
  const filteredAndSortedWatchlist = React.useMemo(() => {
    if (!watchlist) return [];

    let filtered = watchlist.filter((item) => {
      // Entity type filter
      if (filters.entityType !== 'all' && item.entityType !== filters.entityType) {
        return false;
      }

      // Priority filter
      if (filters.priority !== 'all' && item.priority !== filters.priority) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const entityName = item.entity.name || item.entity.title || '';
        const entityDescription = item.entity.description || '';
        
        if (!entityName.toLowerCase().includes(searchLower) && 
            !entityDescription.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag => 
          item.tags.includes(tag)
        );
        if (!hasMatchingTag) return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sort.field) {
        case 'addedAt':
          aValue = new Date(a.addedAt).getTime();
          bValue = new Date(b.addedAt).getTime();
          break;
        case 'priority':
          const priorityOrder = { low: 1, medium: 2, high: 3 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
          break;
        case 'entityType':
          aValue = a.entityType;
          bValue = b.entityType;
          break;
        default:
          return 0;
      }

      if (sort.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [watchlist, filters, sort]);

  // Handle bulk selection
  const handleSelectAll = () => {
    if (selectedItems.length === filteredAndSortedWatchlist.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredAndSortedWatchlist.map(item => item.id));
    }
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Handle bulk remove
  const handleBulkRemove = () => {
    if (selectedItems.length === 0) return;
    
    if (confirm(`¿Estás seguro de que quieres eliminar ${selectedItems.length} elementos de tu watchlist?`)) {
      bulkRemoveMutation.mutate(selectedItems);
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get entity type icon
  const getEntityTypeIcon = (entityType: string) => {
    switch (entityType) {
      case 'event': return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'tribe': return <Users className="w-4 h-4 text-green-600" />;
      case 'post': return <Star className="w-4 h-4 text-purple-600" />;
      default: return <Eye className="w-4 h-4 text-gray-600" />;
    }
  };

  // Get entity type color
  const getEntityTypeColor = (entityType: string) => {
    switch (entityType) {
      case 'event': return 'border-blue-200 bg-blue-50';
      case 'tribe': return 'border-green-200 bg-green-50';
      case 'post': return 'border-purple-200 bg-purple-50';
      default: return 'border-gray-200 bg-gray-50';
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📚 Mi Watchlist</h1>
            <p className="text-gray-600">Guarda y organiza tus eventos, tribus y posts favoritos</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Bookmark className="w-4 h-4 inline mr-2" />
              Agregar
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <Filter className="w-4 h-4 inline mr-2" />
              Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros y Búsqueda</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Buscar en watchlist..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Entity Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <select
                value={filters.entityType}
                onChange={(e) => setFilters(prev => ({ ...prev, entityType: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos</option>
                <option value="event">Eventos</option>
                <option value="tribe">Tribus</option>
                <option value="post">Posts</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <select
                multiple
                value={filters.tags}
                onChange={(e) => {
                  const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                  setFilters(prev => ({ ...prev, tags: selectedOptions }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableTags?.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setFilters({
                entityType: 'all',
                priority: 'all',
                search: '',
                tags: [],
              })}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      )}

      {/* Sort Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {filteredAndSortedWatchlist.length} elementos
          </span>
          
          {/* Sort */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Ordenar por:</span>
            <select
              value={sort.field}
              onChange={(e) => setSort(prev => ({ ...prev, field: e.target.value as any }))}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="addedAt">Fecha de agregado</option>
              <option value="priority">Prioridad</option>
              <option value="entityType">Tipo</option>
            </select>
            
            <button
              onClick={() => setSort(prev => ({ 
                ...prev, 
                direction: prev.direction === 'asc' ? 'desc' : 'asc' 
              }))}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {sort.direction === 'asc' ? (
                <SortAsc className="w-4 h-4" />
              ) : (
                <SortDesc className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              {selectedItems.length} seleccionados
            </span>
            <button
              onClick={handleBulkRemove}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <Trash2 className="w-4 h-4 inline mr-1" />
              Eliminar
            </button>
          </div>
        )}
      </div>

      {/* Watchlist Items */}
      <div className="space-y-4">
        {filteredAndSortedWatchlist.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tu watchlist está vacía</h3>
            <p className="text-gray-600 mb-4">
              {filters.entityType !== 'all' || filters.search || filters.tags.length > 0
                ? 'No hay elementos que coincidan con los filtros aplicados'
                : 'Comienza agregando eventos, tribus o posts que te interesen'
              }
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Agregar primer elemento
            </button>
          </div>
        ) : (
          filteredAndSortedWatchlist.map((item) => (
            <div
              key={item.id}
              className={`border rounded-lg p-4 transition-all duration-200 ${getEntityTypeColor(item.entityType)} hover:shadow-md`}
            >
              <div className="flex items-start space-x-4">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => handleSelectItem(item.id)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />

                {/* Entity Icon */}
                <div className="flex-shrink-0">
                  {getEntityTypeIcon(item.entityType)}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {item.entity.name || item.entity.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {item.entity.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Priority Badge */}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromWatchlistMutation.mutate(item.id)}
                        className="p-1 text-gray-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                        title="Eliminar de watchlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <span>Agregado el {new Date(item.addedAt).toLocaleDateString()}</span>
                    {item.entity.date && (
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(item.entity.date).toLocaleDateString()}
                      </span>
                    )}
                    {item.entity.location && (
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {item.entity.location}
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {item.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Notes */}
                  {item.notes && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                      <p className="text-sm text-yellow-800">
                        <strong>Notas:</strong> {item.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add to Watchlist Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Agregar a Watchlist</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              // Handle form submission
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de elemento</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="event">Evento</option>
                    <option value="tribe">Tribu</option>
                    <option value="post">Post</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ID del elemento</label>
                  <input
                    type="text"
                    placeholder="Ingresa el ID del elemento"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notas (opcional)</label>
                  <textarea
                    rows={3}
                    placeholder="Agrega notas sobre este elemento..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags (opcional)</label>
                  <input
                    type="text"
                    placeholder="tag1, tag2, tag3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Agregar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
