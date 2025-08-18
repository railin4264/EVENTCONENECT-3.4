'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  CalendarDaysIcon,
  UsersIcon,
  MapPinIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  StarIcon,
  PlayIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  FilterIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import { useGeolocation } from '@/hooks/useGeolocation';
import { cn } from '@/lib/utils';

const HeroSection = () => {
  const { isAuthenticated } = useAuth();
  const { location: userLocation, getCurrentPosition } = useGeolocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Todos', icon: '🎉' },
    { id: 'music', name: 'Música', icon: '🎵' },
    { id: 'sports', name: 'Deportes', icon: '⚽' },
    { id: 'food', name: 'Gastronomía', icon: '🍕' },
    { id: 'tech', name: 'Tecnología', icon: '💻' },
    { id: 'art', name: 'Arte', icon: '🎨' },
    { id: 'business', name: 'Negocios', icon: '💼' },
    { id: 'education', name: 'Educación', icon: '📚' },
  ];

  const features = [
    {
      icon: CalendarDaysIcon,
      title: 'Descubre Eventos',
      description: 'Encuentra eventos increíbles cerca de ti con nuestro sistema de recomendaciones inteligente',
      color: 'text-primary-600 dark:text-primary-400',
    },
    {
      icon: UsersIcon,
      title: 'Únete a Tribus',
      description: 'Conecta con personas que comparten tus intereses y pasiones',
      color: 'text-secondary-600 dark:text-secondary-400',
    },
    {
      icon: MapPinIcon,
      title: 'Mapa Interactivo',
      description: 'Explora eventos y lugares en tiempo real con geolocalización precisa',
      color: 'text-accent-600 dark:text-accent-400',
    },
    {
      icon: ChatBubbleLeftIcon,
      title: 'Chat en Tiempo Real',
      description: 'Comunícate con otros asistentes antes, durante y después de los eventos',
      color: 'text-green-600 dark:text-green-400',
    },
  ];

  const stats = [
    { number: '10K+', label: 'Eventos Activos' },
    { number: '50K+', label: 'Usuarios Registrados' },
    { number: '100+', label: 'Ciudades Cubiertas' },
    { number: '95%', label: 'Satisfacción' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to events page with search query
      window.location.href = `/events?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId !== 'all') {
      // Navigate to events page with category filter
      window.location.href = `/events?category=${categoryId}`;
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 dark:bg-primary-900/20 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200 dark:bg-secondary-900/20 rounded-full blur-3xl opacity-30 animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-200 dark:bg-accent-900/20 rounded-full blur-3xl opacity-20 animate-pulse delay-500" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-6xl mx-auto">
          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Conecta con{' '}
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Eventos Increíbles
              </span>
              <br />
              y{' '}
              <span className="bg-gradient-to-r from-secondary-600 to-accent-600 bg-clip-text text-transparent">
                Tribus Apasionadas
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Descubre, únete y vive experiencias únicas cerca de ti. La plataforma social que conecta 
              personas a través de eventos y pasiones compartidas.
            </p>
          </motion.div>

          {/* Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-12"
          >
            <div className="max-w-4xl mx-auto">
              {/* Main Search Bar */}
              <form onSubmit={handleSearch} className="mb-6">
                <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="¿Qué tipo de evento buscas?"
                      className="w-full pl-10 pr-4 py-4 text-lg border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-lg"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-lg font-semibold rounded-xl hover:from-primary-700 hover:to-secondary-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Buscar Eventos
                  </button>
                </div>
              </form>

              {/* Category Pills */}
              <div className="flex flex-wrap justify-center gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={cn(
                      'flex items-center space-x-2 px-4 py-2 rounded-full border-2 transition-all duration-300 hover:scale-105',
                      selectedCategory === category.id
                        ? 'border-primary-500 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-primary-300 dark:hover:border-primary-600'
                    )}
                  >
                    <span className="text-lg">{category.icon}</span>
                    <span className="font-medium">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-lg font-semibold rounded-xl hover:from-primary-700 hover:to-secondary-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Ir al Dashboard
                <ArrowRightIcon className="ml-2 w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-lg font-semibold rounded-xl hover:from-primary-700 hover:to-secondary-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Comenzar Gratis
                  <ArrowRightIcon className="ml-2 w-5 h-5" />
                </Link>
                
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-lg font-semibold rounded-xl hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300 bg-white dark:bg-gray-800"
                >
                  Ya tengo cuenta
                </Link>
              </>
            )}
          </motion.div>

          {/* Demo Video Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-16"
          >
            <button className="inline-flex items-center space-x-3 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group">
              <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <PlayIcon className="w-6 h-6 text-primary-600 ml-1" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Ver Demo</p>
                <p className="text-sm">2 min de video</p>
              </div>
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-200 dark:border-gray-700"
              >
                <div className={cn('w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center', feature.color)}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="text-center"
          >
            <p className="text-gray-500 dark:text-gray-400 mb-4">Confían en nosotros</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {/* Add company logos here */}
              <div className="text-2xl font-bold text-gray-400">🏢 Empresa A</div>
              <div className="text-2xl font-bold text-gray-400">🎯 Empresa B</div>
              <div className="text-2xl font-bold text-gray-400">🚀 Empresa C</div>
              <div className="text-2xl font-bold text-gray-400">💎 Empresa D</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 text-4xl opacity-20"
        >
          🎉
        </motion.div>
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 right-20 text-3xl opacity-20"
        >
          🎵
        </motion.div>
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-40 left-20 text-3xl opacity-20"
        >
          ⚽
        </motion.div>
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-10 text-4xl opacity-20"
        >
          🎨
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;