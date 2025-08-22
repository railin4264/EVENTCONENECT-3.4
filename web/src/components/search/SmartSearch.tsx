'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  MapPinIcon,
  CalendarDaysIcon,
  TagIcon,
  CurrencyEuroIcon,
  AdjustmentsHorizontalIcon,
  ClockIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { OptimizedEventCard } from '@/components/events/OptimizedEventCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonGrid } from '@/components/ui/Skeleton';
import { Event, SearchFilters, SearchResult } from '@/types';
import { debounce } from '@/lib/utils';
import { useGeolocation } from '@/hooks/useGeolocation';

// ===== INTERFACES =====
interface SmartSearchProps {
  onResultsChange?: (results: SearchResult<Event>) => void;
  initialQuery?: string;
  showFilters?: boolean;
  compact?: boolean;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'category' | 'location' | 'trending' | 'recent';
  icon: React.ReactNode;
  count?: number;
}

// ===== CONFIGURACIÓN =====
const CATEGORIES = [
  { id: 'musica', label: 'Música', icon: '🎵', color: 'bg-pink-100 text-pink-700' },
  { id: 'tecnologia', label: 'Tecnología', icon: '💻', color: 'bg-blue-100 text-blue-700' },
  { id: 'gastronomia', label: 'Gastronomía', icon: '🍽️', color: 'bg-orange-100 text-orange-700' },
  { id: 'arte', label: 'Arte', icon: '🎨', color: 'bg-purple-100 text-purple-700' },
  { id: 'deportes', label: 'Deportes', icon: '⚽', color: 'bg-green-100 text-green-700' },
  { id: 'educacion', label: 'Educación', icon: '📚', color: 'bg-indigo-100 text-indigo-700' },
  { id: 'negocios', label: 'Negocios', icon: '💼', color: 'bg-gray-100 text-gray-700' },
  { id: 'bienestar', label: 'Bienestar', icon: '🧘', color: 'bg-teal-100 text-teal-700' }
];

const TRENDING_SEARCHES = [
  'conciertos madrid',
  'eventos gratis',
  'networking tech',
  'workshops creativos',
  'festivales invierno'
];

// ===== MOTOR DE BÚSQUEDA =====
class SearchEngine {
  static search(events: Event[], filters: SearchFilters): SearchResult<Event> {
    let filteredEvents = [...events];
    
    // Filtro por texto
    if (filters.query && filters.query.trim()) {
      const query = filters.query.toLowerCase().trim();
      filteredEvents = filteredEvents.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.category.toLowerCase().includes(query) ||
        event.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        (typeof event.location === 'string' && event.location.toLowerCase().includes(query))
      );
    }
    
    // Filtro por categoría
    if (filters.category) {
      filteredEvents = filteredEvents.filter(event =>
        event.category.toLowerCase() === filters.category?.toLowerCase()
      );
    }
    
    // Filtro por distancia
    if (filters.location) {
      filteredEvents = filteredEvents.filter(event => {
        if (!event.distance) return true;
        const distance = parseFloat(event.distance.replace('km', ''));
        return distance <= filters.location!.radius;
      });
    }
    
    // Filtro por fecha
    if (filters.dateRange) {
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      
      filteredEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= startDate && eventDate <= endDate;
      });
    }
    
    // Filtro por precio
    if (filters.priceRange) {
      filteredEvents = filteredEvents.filter(event => {
        const price = event.price || 0;
        return price >= filters.priceRange!.min && price <= filters.priceRange!.max;
      });
    }
    
    // Filtro por tags
    if (filters.tags && filters.tags.length > 0) {
      filteredEvents = filteredEvents.filter(event =>
        event.tags?.some(tag => filters.tags!.includes(tag))
      );
    }
    
    // Ordenamiento
    if (filters.sortBy) {
      filteredEvents = this.sortEvents(filteredEvents, filters.sortBy, filters.sortOrder);
    }
    
    return {
      items: filteredEvents,
      total: filteredEvents.length,
      page: 1,
      limit: filteredEvents.length,
      hasMore: false,
      filters,
      suggestions: this.generateSuggestions(filters.query, filteredEvents)
    };
  }
  
  private static sortEvents(events: Event[], sortBy: string, order: 'asc' | 'desc' = 'desc'): Event[] {
    const sorted = [...events].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'distance':
          const distA = parseFloat(a.distance?.replace('km', '') || '999');
          const distB = parseFloat(b.distance?.replace('km', '') || '999');
          comparison = distA - distB;
          break;
        case 'popularity':
          comparison = (a.attendees || 0) - (b.attendees || 0);
          break;
        case 'price':
          comparison = (a.price || 0) - (b.price || 0);
          break;
        default: // relevance
          comparison = (b.attendees || 0) - (a.attendees || 0);
      }
      
      return order === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }
  
  private static generateSuggestions(query?: string, results?: Event[]): string[] {
    if (!query || query.length < 2) return TRENDING_SEARCHES;
    
    const suggestions: string[] = [];
    
    // Sugerencias basadas en categorías
    CATEGORIES.forEach(category => {
      if (category.label.toLowerCase().includes(query.toLowerCase())) {
        suggestions.push(category.label);
      }
    });
    
    // Sugerencias basadas en resultados
    if (results) {
      const uniqueCategories = [...new Set(results.map(e => e.category))];
      uniqueCategories.forEach(category => {
        if (!suggestions.includes(category)) {
          suggestions.push(category);
        }
      });
    }
    
    return suggestions.slice(0, 5);
  }
}

// ===== COMPONENTE PRINCIPAL =====
export const SmartSearch: React.FC<SmartSearchProps> = ({
  onResultsChange,
  initialQuery = '',
  showFilters = true,
  compact = false
}) => {
  // Estados principales
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>({
    query: initialQuery,
    sortBy: 'relevance',
    sortOrder: 'desc'
  });
  const [results, setResults] = useState<SearchResult<Event>>({
    items: [],
    total: 0,
    page: 1,
    limit: 20,
    hasMore: false,
    filters
  });
  const [loading, setLoading] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { location } = useGeolocation();
  
  // Mock events para demo
  const mockEvents: Event[] = [
    {
      id: '1',
      title: 'Festival de Música Indie Madrid 2024',
      description: 'Los mejores artistas indie de la escena nacional e internacional se reúnen en Madrid',
      category: 'Música',
      date: '2024-12-20',
      location: 'WiZink Center, Madrid',
      distance: '2.3 km',
      attendees: 1250,
      price: 35,
      host: { name: 'MusicEvents Madrid', avatar: '/host1.jpg' },
      isPopular: true,
      friendsAttending: 3,
      tags: ['indie', 'música', 'madrid', 'festival'],
      likes: 450,
      shares: 89,
      comments: 123
    },
    {
      id: '2',
      title: 'Workshop: React y Next.js Avanzado',
      description: 'Aprende las últimas técnicas de desarrollo web moderno con React 18 y Next.js 14',
      category: 'Tecnología',
      date: '2024-12-18',
      location: 'Campus Madrid, Chamberí',
      distance: '1.8 km',
      attendees: 45,
      price: 0,
      host: { name: 'Tech Community Madrid', avatar: '/host2.jpg' },
      isTrending: true,
      tags: ['react', 'nextjs', 'javascript', 'workshop'],
      likes: 89,
      shares: 23,
      comments: 34
    },
    {
      id: '3',
      title: 'Mercado Gastronómico de Invierno',
      description: 'Degusta los mejores platos de temporada preparados por chefs locales',
      category: 'Gastronomía',
      date: '2024-12-22',
      location: 'Matadero Madrid',
      distance: '3.1 km',
      attendees: 890,
      price: 15,
      host: { name: 'Foodie Madrid', avatar: '/host3.jpg' },
      friendsAttending: 1,
      tags: ['gastronomía', 'chefs', 'mercado', 'invierno'],
      likes: 234,
      shares: 56,
      comments: 78
    }
  ];

  // Búsqueda con debounce
  const debouncedSearch = useMemo(
    () => debounce((searchQuery: string, searchFilters: SearchFilters) => {
      setLoading(true);
      
      // Simular delay de API
      setTimeout(() => {
        const searchResults = SearchEngine.search(mockEvents, {
          ...searchFilters,
          query: searchQuery
        });
        
        setResults(searchResults);
        setSuggestions(this.generateSmartSuggestions(searchQuery, searchResults.items));
        onResultsChange?.(searchResults);
        setLoading(false);
      }, 300);
    }, 300),
    [mockEvents, onResultsChange]
  );

  // Generar sugerencias inteligentes
  const generateSmartSuggestions = (query: string, events: Event[]): SearchSuggestion[] => {
    const suggestions: SearchSuggestion[] = [];
    
    // Sugerencias de categorías
    CATEGORIES.forEach(category => {
      const categoryEvents = events.filter(e => e.category.toLowerCase() === category.id);
      if (categoryEvents.length > 0) {
        suggestions.push({
          id: `category-${category.id}`,
          text: category.label,
          type: 'category',
          icon: <TagIcon className="w-4 h-4" />,
          count: categoryEvents.length
        });
      }
    });
    
    // Sugerencias trending
    if (!query || query.length < 2) {
      TRENDING_SEARCHES.forEach((trending, index) => {
        suggestions.push({
          id: `trending-${index}`,
          text: trending,
          type: 'trending',
          icon: <FireIcon className="w-4 h-4" />
        });
      });
    }
    
    // Sugerencias de ubicación
    if (location) {
      suggestions.push({
        id: 'location-near',
        text: `Eventos cerca de ${location.city}`,
        type: 'location',
        icon: <MapPinIcon className="w-4 h-4" />,
        count: events.filter(e => e.distance && parseFloat(e.distance.replace('km', '')) <= 5).length
      });
    }
    
    return suggestions.slice(0, 6);
  };

  // Efectos
  useEffect(() => {
    debouncedSearch(query, filters);
  }, [query, filters, debouncedSearch]);

  // Handlers
  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    setShowSuggestions(newQuery.length > 0);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'category') {
      setFilters(prev => ({ ...prev, category: suggestion.text }));
    } else {
      setQuery(suggestion.text);
    }
    setShowSuggestions(false);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      query: query,
      sortBy: 'relevance',
      sortOrder: 'desc'
    });
  };

  const clearSearch = () => {
    setQuery('');
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  // Contar filtros activos
  const activeFiltersCount = Object.keys(filters).filter(key => 
    key !== 'query' && key !== 'sortBy' && key !== 'sortOrder' && filters[key as keyof SearchFilters]
  ).length;

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda principal */}
      <div className="relative">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar eventos, categorías, ubicaciones..."
            className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
          />
          
          {/* Botón limpiar */}
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <XMarkIcon className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
        
        {/* Sugerencias de búsqueda */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
            >
              <div className="p-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-gray-400">
                        {suggestion.icon}
                      </div>
                      <span className="text-gray-900 dark:text-white">
                        {suggestion.text}
                      </span>
                      {suggestion.type === 'trending' && (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                          Trending
                        </span>
                      )}
                    </div>
                    {suggestion.count && (
                      <span className="text-gray-500 text-sm">
                        {suggestion.count} eventos
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filtros rápidos */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Categorías rápidas */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.slice(0, 6).map(category => (
            <button
              key={category.id}
              onClick={() => handleFilterChange('category', 
                filters.category === category.label ? undefined : category.label
              )}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                filters.category === category.label 
                  ? category.color
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <span className="mr-1">{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>

        {/* Botón filtros avanzados */}
        {showFilters && (
          <Button
            variant={showAdvancedFilters ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="relative"
          >
            <FunnelIcon className="w-4 h-4 mr-2" />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        )}

        {/* Limpiar filtros */}
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <XMarkIcon className="w-4 h-4 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Filtros avanzados */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6">
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Filtro de fecha */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
                      Fecha
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === 'custom') {
                          // Abrir date picker personalizado
                        } else if (value) {
                          const today = new Date();
                          const endDate = new Date();
                          
                          switch (value) {
                            case 'today':
                              endDate.setDate(today.getDate() + 1);
                              break;
                            case 'week':
                              endDate.setDate(today.getDate() + 7);
                              break;
                            case 'month':
                              endDate.setMonth(today.getMonth() + 1);
                              break;
                          }
                          
                          handleFilterChange('dateRange', {
                            start: today.toISOString().split('T')[0],
                            end: endDate.toISOString().split('T')[0]
                          });
                        } else {
                          handleFilterChange('dateRange', undefined);
                        }
                      }}
                    >
                      <option value="">Cualquier fecha</option>
                      <option value="today">Hoy</option>
                      <option value="week">Esta semana</option>
                      <option value="month">Este mes</option>
                      <option value="custom">Personalizado</option>
                    </select>
                  </div>

                  {/* Filtro de distancia */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <MapPinIcon className="w-4 h-4 inline mr-1" />
                      Distancia máxima
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                      onChange={(e) => {
                        const radius = parseInt(e.target.value);
                        handleFilterChange('location', radius ? {
                          coordinates: [location?.coordinates.latitude || 40.4168, location?.coordinates.longitude || -3.7038],
                          radius
                        } : undefined);
                      }}
                    >
                      <option value="">Cualquier distancia</option>
                      <option value="1">1 km</option>
                      <option value="5">5 km</option>
                      <option value="10">10 km</option>
                      <option value="25">25 km</option>
                      <option value="50">50 km</option>
                    </select>
                  </div>

                  {/* Filtro de precio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <CurrencyEuroIcon className="w-4 h-4 inline mr-1" />
                      Precio
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                      onChange={(e) => {
                        const value = e.target.value;
                        switch (value) {
                          case 'free':
                            handleFilterChange('priceRange', { min: 0, max: 0 });
                            break;
                          case 'low':
                            handleFilterChange('priceRange', { min: 0, max: 20 });
                            break;
                          case 'medium':
                            handleFilterChange('priceRange', { min: 20, max: 50 });
                            break;
                          case 'high':
                            handleFilterChange('priceRange', { min: 50, max: 999 });
                            break;
                          default:
                            handleFilterChange('priceRange', undefined);
                        }
                      }}
                    >
                      <option value="">Cualquier precio</option>
                      <option value="free">Gratis</option>
                      <option value="low">€0 - €20</option>
                      <option value="medium">€20 - €50</option>
                      <option value="high">€50+</option>
                    </select>
                  </div>

                  {/* Ordenamiento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <AdjustmentsHorizontalIcon className="w-4 h-4 inline mr-1" />
                      Ordenar por
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    >
                      <option value="relevance">Relevancia</option>
                      <option value="date">Fecha</option>
                      <option value="distance">Distancia</option>
                      <option value="popularity">Popularidad</option>
                      <option value="price">Precio</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resultados */}
      <div>
        {/* Header de resultados */}
        {(results.total > 0 || loading) && (
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {loading ? 'Buscando...' : `${results.total} eventos encontrados`}
              </h2>
              {query && (
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Resultados para "{query}"
                </p>
              )}
            </div>
            
            {results.total > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <ClockIcon className="w-4 h-4" />
                <span>Actualizado hace un momento</span>
              </div>
            )}
          </div>
        )}

        {/* Grid de resultados */}
        {loading ? (
          <SkeletonGrid type="event" columns={compact ? 1 : 3} count={6} />
        ) : results.total > 0 ? (
          <div className={`grid gap-6 ${
            compact 
              ? 'grid-cols-1' 
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {results.items.map((event) => (
              <OptimizedEventCard 
                key={event.id} 
                event={event} 
                variant={compact ? 'compact' : 'default'}
              />
            ))}
          </div>
        ) : query ? (
          <EmptyState
            type="search"
            title="No encontramos resultados"
            description={`No hay eventos que coincidan con "${query}". Intenta con otros términos o explora nuestras categorías.`}
            primaryAction={{
              label: 'Limpiar búsqueda',
              onClick: clearSearch
            }}
            secondaryAction={{
              label: 'Ver trending',
              onClick: () => setQuery('trending')
            }}
          />
        ) : (
          <EmptyState
            type="events"
            title="Comienza tu búsqueda"
            description="Usa la barra de búsqueda para encontrar eventos increíbles cerca de ti."
            illustration="minimal"
          />
        )}
      </div>

      {/* Sugerencias adicionales */}
      {results.suggestions && results.suggestions.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            También podrías buscar:
          </h3>
          <div className="flex flex-wrap gap-2">
            {results.suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setQuery(suggestion)}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-primary-100 hover:text-primary-700 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};