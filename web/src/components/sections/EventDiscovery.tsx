'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CalendarDaysIcon,
  MapPinIcon,
  UsersIcon,
  StarIcon,
  FilterIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { useEvents } from '@/hooks/useEvents';
import { useGeolocation } from '@/hooks/useGeolocation';
import EventCard from '@/components/events/EventCard';
import { cn } from '@/lib/utils';
import { AnimatePresence } from 'framer-motion';

interface EventDiscoveryProps {
  className?: string;
  title?: string;
  subtitle?: string;
  showFilters?: boolean;
  limit?: number;
  category?: string;
  location?: {
    coordinates: [number, number];
    radius: number;
  };
}

const EventDiscovery = ({
  className,
  title = 'Descubre Eventos Increíbles',
  subtitle = 'Encuentra eventos que se adapten a tus intereses y ubicación',
  showFilters = true,
  limit = 12,
  category,
  location,
}: EventDiscoveryProps) => {
  const { location: userLocation } = useGeolocation();
  const [activeFilters, setActiveFilters] = useState({
    category: category || 'all',
    dateRange: 'all',
    priceRange: 'all',
    location: location || null,
    sortBy: 'date',
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Use location from props or user location
  const searchLocation = activeFilters.location || (userLocation ? {
    coordinates: [userLocation.latitude, userLocation.longitude],
    radius: 50,
  } : null);

  const { events, isLoading, error } = useEvents({
    category: activeFilters.category !== 'all' ? activeFilters.category : undefined,
    location: searchLocation,
    search: searchQuery || undefined,
    limit,
  });

  const categories = [
    { id: 'all', name: 'Todos', icon: '🎉' },
    { id: 'music', name: 'Música', icon: '🎵' },
    { id: 'sports', name: 'Deportes', icon: '⚽' },
    { id: 'food', name: 'Gastronomía', icon: '🍕' },
    { id: 'tech', name: 'Tecnología', icon: '💻' },
    { id: 'art', name: 'Arte', icon: '🎨' },
    { id: 'business', name: 'Negocios', icon: '💼' },
    { id: 'education', name: 'Educación', icon: '📚' },
    { id: 'health', name: 'Salud', icon: '🏥' },
    { id: 'travel', name: 'Viajes', icon: '✈️' },
  ];

  const dateRanges = [
    { id: 'all', name: 'Cualquier fecha' },
    { id: 'today', name: 'Hoy' },
    { id: 'tomorrow', name: 'Mañana' },
    { id: 'week', name: 'Esta semana' },
    { id: 'month', name: 'Este mes' },
  ];

  const priceRanges = [
    { id: 'all', name: 'Cualquier precio' },
    { id: 'free', name: 'Gratis' },
    { id: 'low', name: 'Económico (<$50)' },
    { id: 'medium', name: 'Moderado ($50-$200)' },
    { id: 'high', name: 'Premium (>$200)' },
  ];

  const sortOptions = [
    { id: 'date', name: 'Fecha' },
    { id: 'popularity', name: 'Popularidad' },
    { id: 'rating', name: 'Calificación' },
    { id: 'distance', name: 'Distancia' },
    { id: 'price', name: 'Precio' },
  ];

  const handleFilterChange = (filterType: string, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the useEvents hook
  };

  const clearFilters = () => {
    setActiveFilters({
      category: 'all',
      dateRange: 'all',
      priceRange: 'all',
      location: null,
      sortBy: 'date',
    });
    setSearchQuery('');
  };

  const getFilteredEvents = () => {
    let filtered = [...events];

    // Apply date range filter
    if (activeFilters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (activeFilters.dateRange) {
        case 'today':
          filtered = filtered.filter(event => {
            const eventDate = new Date(event.dateTime.start);
            const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
            return eventDay.getTime() === today.getTime();
          });
          break;
        case 'tomorrow':
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          filtered = filtered.filter(event => {
            const eventDate = new Date(event.dateTime.start);
            const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
            return eventDay.getTime() === tomorrow.getTime();
          });
          break;
        case 'week':
          const weekEnd = new Date(today);
          weekEnd.setDate(weekEnd.getDate() + 7);
          filtered = filtered.filter(event => {
            const eventDate = new Date(event.dateTime.start);
            return eventDate >= today && eventDate <= weekEnd;
          });
          break;
        case 'month':
          const monthEnd = new Date(today);
          monthEnd.setMonth(monthEnd.getMonth() + 1);
          filtered = filtered.filter(event => {
            const eventDate = new Date(event.dateTime.start);
            return eventDate >= today && eventDate <= monthEnd;
          });
          break;
      }
    }

    // Apply price range filter
    if (activeFilters.priceRange !== 'all') {
      switch (activeFilters.priceRange) {
        case 'free':
          filtered = filtered.filter(event => event.pricing.isFree);
          break;
        case 'low':
          filtered = filtered.filter(event => !event.pricing.isFree && event.pricing.amount && event.pricing.amount < 50);
          break;
        case 'medium':
          filtered = filtered.filter(event => !event.pricing.isFree && event.pricing.amount && event.pricing.amount >= 50 && event.pricing.amount <= 200);
          break;
        case 'high':
          filtered = filtered.filter(event => !event.pricing.isFree && event.pricing.amount && event.pricing.amount > 200);
          break;
      }
    }

    // Apply sorting
    switch (activeFilters.sortBy) {
      case 'date':
        filtered.sort((a, b) => new Date(a.dateTime.start).getTime() - new Date(b.dateTime.start).getTime());
        break;
      case 'popularity':
        filtered.sort((a, b) => (b.stats?.viewCount || 0) - (a.stats?.viewCount || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.stats?.averageRating || 0) - (a.stats?.averageRating || 0));
        break;
      case 'distance':
        // Sort by distance if location is available
        if (searchLocation) {
          filtered.sort((a, b) => {
            const distanceA = calculateDistance(
              searchLocation.coordinates,
              a.location.coordinates
            );
            const distanceB = calculateDistance(
              searchLocation.coordinates,
              b.location.coordinates
            );
            return distanceA - distanceB;
          });
        }
        break;
      case 'price':
        filtered.sort((a, b) => {
          const priceA = a.pricing.isFree ? 0 : (a.pricing.amount || 0);
          const priceB = b.pricing.isFree ? 0 : (b.pricing.amount || 0);
          return priceA - priceB;
        });
        break;
    }

    return filtered;
  };

  const calculateDistance = (coord1: [number, number], coord2: [number, number]): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (coord2[0] - coord1[0]) * Math.PI / 180;
    const dLon = (coord2[1] - coord1[1]) * Math.PI / 180;
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(coord1[0] * Math.PI / 180) * Math.cos(coord2[0] * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filteredEvents = getFilteredEvents();

  return (
    <section className={cn('py-16 bg-gray-50 dark:bg-gray-900', className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4"
          >
            {title}
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto"
          >
            {subtitle}
          </motion.p>
        </div>

        {/* Search and Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar eventos, lugares, organizadores..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
                  >
                    Buscar
                  </button>
                </div>
              </form>

              {/* Basic Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categoría
                  </label>
                  <select
                    value={activeFilters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha
                  </label>
                  <select
                    value={activeFilters.dateRange}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {dateRanges.map((range) => (
                      <option key={range.id} value={range.id}>
                        {range.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Precio
                  </label>
                  <select
                    value={activeFilters.priceRange}
                    onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {priceRanges.map((range) => (
                      <option key={range.id} value={range.id}>
                        {range.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ordenar por
                  </label>
                  <select
                    value={activeFilters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Advanced Filters Toggle */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                >
                  <AdjustmentsHorizontalIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {showAdvancedFilters ? 'Ocultar' : 'Mostrar'} filtros avanzados
                  </span>
                </button>

                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>

              {/* Advanced Filters */}
              <AnimatePresence>
                {showAdvancedFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Location Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Ubicación
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="Ciudad o dirección"
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            className="px-3 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors text-sm"
                          >
                            <MapPinIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Radius Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Radio de búsqueda
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                          <option value="5">5 km</option>
                          <option value="10">10 km</option>
                          <option value="25">25 km</option>
                          <option value="50" selected>50 km</option>
                          <option value="100">100 km</option>
                        </select>
                      </div>

                      {/* Tags Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Etiquetas
                        </label>
                        <input
                          type="text"
                          placeholder="Etiquetas separadas por comas"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-gray-600 dark:text-gray-400">
            {isLoading ? (
              'Cargando eventos...'
            ) : (
              `${filteredEvents.length} evento${filteredEvents.length !== 1 ? 's' : ''} encontrado${filteredEvents.length !== 1 ? 's' : ''}`
            )}
          </div>
          
          {searchLocation && (
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <MapPinIcon className="w-4 h-4" />
              <span>Buscando cerca de tu ubicación</span>
            </div>
          )}
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Cargando eventos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 dark:text-red-400 mb-4">
              Error al cargar eventos: {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarDaysIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No se encontraron eventos
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Intenta ajustar los filtros o buscar en otra ubicación
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <EventCard event={event} variant="default" />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Load More Button */}
        {filteredEvents.length > 0 && filteredEvents.length >= limit && (
          <div className="text-center mt-12">
            <button className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300 font-medium">
              Cargar más eventos
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default EventDiscovery;