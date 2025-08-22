'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPinIcon, 
  ClockIcon, 
  UsersIcon, 
  FireIcon,
  SparklesIcon,
  HeartIcon,
  CalendarDaysIcon,
  TagIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { OptimizedEventCard } from '@/components/events/OptimizedEventCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/hooks/useAuth';
import { useGeolocation } from '@/hooks/useGeolocation';

// ===== INTERFACES =====
interface Event {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  location: string;
  distance: string;
  attendees: number;
  price: number;
  category: string;
  host: {
    name: string;
    avatar: string;
  };
  isPopular?: boolean;
  isTrending?: boolean;
  friendsAttending?: number;
}

interface Tribe {
  id: string;
  name: string;
  description: string;
  image: string;
  members: number;
  category: string;
  isRecommended?: boolean;
}

// ===== MOCK DATA =====
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Festival de Música Indie Madrid',
    description: 'Los mejores artistas indie de la escena nacional e internacional',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
    date: '2024-12-20',
    location: 'WiZink Center, Madrid',
    distance: '2.3 km',
    attendees: 1250,
    price: 35,
    category: 'Música',
    host: { name: 'MusicEvents Madrid', avatar: '/avatars/host1.jpg' },
    isPopular: true,
    friendsAttending: 3
  },
  {
    id: '2',
    title: 'Workshop de React y Next.js',
    description: 'Aprende las últimas técnicas de desarrollo web moderno',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
    date: '2024-12-18',
    location: 'Campus Madrid, Chamberí',
    distance: '1.8 km',
    attendees: 45,
    price: 0,
    category: 'Tecnología',
    host: { name: 'Tech Community Madrid', avatar: '/avatars/host2.jpg' },
    isTrending: true
  },
  {
    id: '3',
    title: 'Mercado Gastronómico de Invierno',
    description: 'Degusta los mejores platos de temporada de chefs locales',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
    date: '2024-12-22',
    location: 'Matadero Madrid',
    distance: '3.1 km',
    attendees: 890,
    price: 15,
    category: 'Gastronomía',
    host: { name: 'Foodie Madrid', avatar: '/avatars/host3.jpg' },
    friendsAttending: 1
  }
];

const mockTribes: Tribe[] = [
  {
    id: '1',
    name: 'Developers Madrid',
    description: 'Comunidad de desarrolladores apasionados por la tecnología',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&h=200&fit=crop',
    members: 2340,
    category: 'Tecnología',
    isRecommended: true
  },
  {
    id: '2',
    name: 'Amantes del Indie',
    description: 'Para los que viven y respiran música independiente',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop',
    members: 1890,
    category: 'Música'
  }
];

// ===== COMPONENTE PRINCIPAL =====
export const PersonalizedHome: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { location } = useGeolocation();
  const [activeTab, setActiveTab] = useState<'para-ti' | 'cerca' | 'trending'>('para-ti');

  // ===== SECCIÓN HERO PERSONALIZADA =====
  const PersonalizedHero = () => (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white">
      <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
      
      <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="flex items-center justify-center mb-4">
            <SparklesIcon className="w-8 h-8 text-yellow-400 mr-2" />
            <span className="text-lg font-medium text-primary-200">Para ti</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Hola{isAuthenticated ? `, ${user?.firstName}` : ''}! 👋
          </h1>
          
          <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
            Descubre eventos perfectos para ti{location ? ` cerca de ${location.city}` : ''} 
            y conecta con tu tribu
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="xl" glow>
              <CalendarDaysIcon className="w-5 h-5 mr-2" />
              Ver Mi Agenda
            </Button>
            <Button variant="ghost" size="xl">
              <UserGroupIcon className="w-5 h-5 mr-2" />
              Mis Tribus
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );

  // ===== TABS DE NAVEGACIÓN =====
  const NavigationTabs = () => (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8">
          {[
            { key: 'para-ti', label: 'Para Ti', icon: SparklesIcon },
            { key: 'cerca', label: 'Cerca de Ti', icon: MapPinIcon },
            { key: 'trending', label: 'Trending', icon: ArrowTrendingUpIcon }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );

  // Usar el componente OptimizedEventCard

  // ===== SECCIÓN DE TRIBUS RECOMENDADAS =====
  const RecommendedTribes = () => (
    <section className="py-12 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Tribus que podrían interesarte
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Conecta con comunidades que comparten tus pasiones
          </p>
        </motion.div>
        
        {mockTribes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockTribes.map((tribe, index) => (
              <motion.div
                key={tribe.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card variant="glass" className="p-6 h-full">
                  <div className="flex items-center space-x-4">
                    <img
                      src={tribe.image}
                      alt={tribe.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">{tribe.name}</h3>
                        {tribe.isRecommended && (
                          <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs font-medium">
                            Recomendado
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                        {tribe.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {tribe.members.toLocaleString()} miembros
                        </span>
                        <Button variant="outline" size="sm">
                          Unirse
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState
            type="tribes"
            size="sm"
            illustration="minimal"
            primaryAction={{
              label: 'Explorar tribus',
              onClick: () => console.log('Explorar tribus')
            }}
            secondaryAction={{
              label: 'Crear tribu',
              onClick: () => console.log('Crear tribu')
            }}
          />
        )}
      </div>
    </section>
  );

  // ===== RENDER PRINCIPAL =====
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <PersonalizedHero />
      <NavigationTabs />
      
      {/* Contenido principal */}
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {mockEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {mockEvents.map((event) => (
                  <OptimizedEventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <EmptyState
                type="events"
                illustration="floating"
                primaryAction={{
                  label: 'Crear mi primer evento',
                  onClick: () => console.log('Crear evento')
                }}
                secondaryAction={{
                  label: 'Explorar eventos',
                  onClick: () => setActiveTab('cerca')
                }}
              />
            )}
          </motion.div>
        </div>
      </main>
      
      <RecommendedTribes />
    </div>
  );
};