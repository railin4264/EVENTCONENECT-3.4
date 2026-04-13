'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { eventService, tribeService, aiRecommendationService } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

// Componentes
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import EventCard from '@/components/events/EventCard';
import TribeCard from '@/components/tribes/TribeCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SearchBar from '@/components/ui/SearchBar';
import CategoryFilter from '@/components/ui/CategoryFilter';

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const { connected: wsConnected } = useWebSocket();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('events'); // 'events' | 'tribes'

  // Queries para datos
  const {
    data: events,
    isLoading: eventsLoading,
    error: eventsError,
    refetch: refetchEvents,
  } = useQuery({
    queryKey: ['events', selectedCategory],
    queryFn: () => eventService.getEvents({ category: selectedCategory !== 'all' ? selectedCategory : undefined }),
    enabled: viewMode === 'events',
  });

  const {
    data: tribes,
    isLoading: tribesLoading,
    error: tribesError,
    refetch: refetchTribes,
  } = useQuery({
    queryKey: ['tribes', selectedCategory],
    queryFn: () => tribeService.getTribes({ category: selectedCategory !== 'all' ? selectedCategory : undefined }),
    enabled: viewMode === 'tribes',
  });

  const {
    data: recommendations,
    isLoading: recommendationsLoading,
  } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => aiRecommendationService.getEventRecommendations(),
    enabled: isAuthenticated,
  });

  // Manejar búsqueda
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        if (viewMode === 'events') {
          await refetchEvents();
        } else {
          await refetchTribes();
        }
      } catch (error) {
        toast.error('Error al buscar');
      }
    }
  };

  // Manejar cambio de categoría
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  // Manejar cambio de vista
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setSelectedCategory('all');
    setSearchQuery('');
  };

  // Mostrar estado de conexión
  useEffect(() => {
    if (!wsConnected && isAuthenticated) {
      toast.error('Sin conexión en tiempo real');
    }
  }, [wsConnected, isAuthenticated]);

  // Manejar errores
  useEffect(() => {
    if (eventsError) {
      toast.error('Error al cargar eventos');
    }
    if (tribesError) {
      toast.error('Error al cargar tribus');
    }
  }, [eventsError, tribesError]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Conecta con{' '}
            <span className="text-blue-600">Eventos</span> y{' '}
            <span className="text-green-600">Tribus</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Descubre eventos increíbles, únete a tribus y conecta con personas que comparten tus intereses.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <SearchBar onSearch={handleSearch} placeholder="Buscar eventos, tribus o personas..." />
          </div>

          {/* View Mode Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-1">
              <button
                onClick={() => handleViewModeChange('events')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  viewMode === 'events'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Eventos
              </button>
              <button
                onClick={() => handleViewModeChange('tribes')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  viewMode === 'tribes'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Tribus
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            viewMode={viewMode}
          />
        </section>

        {/* Content Section */}
        <section className="mb-12">
          {viewMode === 'events' ? (
            // Events View
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {searchQuery ? `Resultados para "${searchQuery}"` : 'Eventos Destacados'}
                </h2>
                <div className="text-sm text-gray-500">
                  {eventsLoading ? 'Cargando...' : `${events?.length || 0} eventos`}
                </div>
              </div>

              {eventsLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : eventsError ? (
                <div className="text-center py-12">
                  <p className="text-red-600">Error al cargar eventos</p>
                  <button
                    onClick={refetchEvents}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Reintentar
                  </button>
                </div>
              ) : events?.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No se encontraron eventos</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events?.map((event) => (
                    <EventCard key={event._id} event={event} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Tribes View
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {searchQuery ? `Resultados para "${searchQuery}"` : 'Tribus Populares'}
                </h2>
                <div className="text-sm text-gray-500">
                  {tribesLoading ? 'Cargando...' : `${tribes?.length || 0} tribus`}
                </div>
              </div>

              {tribesLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : tribesError ? (
                <div className="text-center py-12">
                  <p className="text-red-600">Error al cargar tribus</p>
                  <button
                    onClick={refetchTribes}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Reintentar
                  </button>
                </div>
              ) : tribes?.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No se encontraron tribus</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tribes?.map((tribe) => (
                    <TribeCard key={tribe._id} tribe={tribe} />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Recommendations Section (solo para usuarios autenticados) */}
        {isAuthenticated && recommendations && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Recomendaciones para ti
            </h2>
            
            {recommendationsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.events?.slice(0, 6).map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Call to Action */}
        <section className="text-center py-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg text-white">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para conectar?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Únete a EventConnect y descubre una nueva forma de conectar con eventos y personas.
          </p>
          <div className="space-x-4">
            {!isAuthenticated ? (
              <>
                <a
                  href="/auth/register"
                  className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Registrarse
                </a>
                <a
                  href="/auth/login"
                  className="inline-block px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Iniciar Sesión
                </a>
              </>
            ) : (
              <a
                href="/dashboard"
                className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Ir al Dashboard
              </a>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}