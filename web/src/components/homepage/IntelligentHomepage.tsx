'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPinIcon,
  StarIcon,
  UsersIcon,
  TrendingUpIcon,
  SparklesIcon,
  CalendarIcon,
  FireIcon,
  HeartIcon,
  EyeIcon,
  ClockIcon,
  ArrowRightIcon,
  ChartBarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/Loading';
import { eventsAPI, userAPI, aiAPI } from '@/services/api';
import Link from 'next/link';

// ===== INTERFACES =====
interface User {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  location?: {
    city: string;
    coordinates: number[];
  };
  interests: string[];
  stats: {
    eventsAttended: number;
    eventsHosted: number;
    followers: number;
    following: number;
  };
}

interface RecommendedEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  location: {
    address: string;
    distance: number;
  };
  organizer: {
    name: string;
    avatar: string;
    rating: number;
  };
  attendees: number;
  price: number;
  rating: number;
  reasons: string[];
  confidence: number;
}

interface LocalDemand {
  category: string;
  demandCount: number;
  potentialAttendees: number;
  competitionLevel: 'low' | 'medium' | 'high';
  suggestedPrice: number;
  bestTimeSlots: string[];
  trending: boolean;
}

interface TopHost {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  totalEvents: number;
  specialties: string[];
  followerCount: number;
  isFollowing: boolean;
}

interface NetworkActivity {
  id: string;
  type: 'attending' | 'hosting' | 'interested' | 'review';
  user: {
    name: string;
    avatar: string;
  };
  event: {
    title: string;
    date: string;
  };
  timestamp: string;
}

// ===== INTELLIGENT HOMEPAGE COMPONENT =====
export const IntelligentHomepage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [recommendedEvents, setRecommendedEvents] = useState<RecommendedEvent[]>([]);
  const [localDemand, setLocalDemand] = useState<LocalDemand[]>([]);
  const [topHosts, setTopHosts] = useState<TopHost[]>([]);
  const [networkActivity, setNetworkActivity] = useState<NetworkActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // ===== LOAD DATA =====
  useEffect(() => {
    loadHomepageData();
    
    // Update time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const loadHomepageData = async () => {
    try {
      setIsLoading(true);
      
      // Load user data and personalized content
      const [
        userResponse,
        recommendationsResponse,
        demandResponse,
        hostsResponse,
        activityResponse
      ] = await Promise.all([
        userAPI.getCurrentUser(),
        aiAPI.getRecommendations({ type: 'events', limit: 6 }),
        aiAPI.getLocalDemand(),
        getTopHosts(),
        getNetworkActivity()
      ]);

      if (userResponse.success) setUser(userResponse.data);
      if (recommendationsResponse.success) setRecommendedEvents(recommendationsResponse.data.recommendations);
      if (demandResponse.success) setLocalDemand(demandResponse.data);
      if (hostsResponse.success) setTopHosts(hostsResponse.data);
      if (activityResponse.success) setNetworkActivity(activityResponse.data);
      
    } catch (error) {
      console.error('Error loading homepage data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ===== HELPER FUNCTIONS =====
  const getTopHosts = async () => {
    // Mock function - replace with actual API call
    return {
      success: true,
      data: [
        {
          id: '1',
          name: 'María González',
          avatar: '/avatars/maria.jpg',
          rating: 4.9,
          totalEvents: 45,
          specialties: ['Música', 'Arte'],
          followerCount: 1250,
          isFollowing: false
        },
        {
          id: '2',
          name: 'Juan Rodríguez',
          avatar: '/avatars/juan.jpg',
          rating: 4.8,
          totalEvents: 32,
          specialties: ['Tecnología', 'Negocios'],
          followerCount: 890,
          isFollowing: true
        },
        {
          id: '3',
          name: 'Tech Hub Madrid',
          avatar: '/avatars/techhub.jpg',
          rating: 4.7,
          totalEvents: 28,
          specialties: ['Tecnología', 'Networking'],
          followerCount: 2100,
          isFollowing: false
        }
      ]
    };
  };

  const getNetworkActivity = async () => {
    // Mock function - replace with actual API call
    return {
      success: true,
      data: [
        {
          id: '1',
          type: 'attending',
          user: { name: 'Ana López', avatar: '/avatars/ana.jpg' },
          event: { title: 'Concierto de Jazz', date: 'Mañana' },
          timestamp: '2h'
        },
        {
          id: '2',
          type: 'hosting',
          user: { name: 'Carlos Ruiz', avatar: '/avatars/carlos.jpg' },
          event: { title: 'Meetup Tech', date: 'Viernes' },
          timestamp: '4h'
        },
        {
          id: '3',
          type: 'review',
          user: { name: 'Laura Silva', avatar: '/avatars/laura.jpg' },
          event: { title: 'Workshop Design', date: 'Ayer' },
          timestamp: '1d'
        }
      ]
    };
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return '¡Buenos días';
    if (hour < 18) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) return `${Math.round(distance * 1000)}m`;
    return `${distance.toFixed(1)}km`;
  };

  // ===== RENDER SECTIONS =====
  const renderPersonalizedHero = () => (
    <section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-600/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-cyan-600/30 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8">
          {/* Personalized Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white">
              {getGreeting()}{user ? `, ${user.firstName}` : ''}!
            </h1>
            
            {user && (
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-lg text-gray-300">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5 text-cyan-400" />
                  <span>{user.location?.city || 'Madrid'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FireIcon className="w-5 h-5 text-orange-400" />
                  <span>{recommendedEvents.length} eventos recomendados</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUpIcon className="w-5 h-5 text-green-400" />
                  <span>12 eventos trending cerca</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              variant="primary"
              className="flex items-center gap-2"
            >
              <SparklesIcon className="w-5 h-5" />
              Ver Mis Recomendaciones
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="flex items-center gap-2"
            >
              <CalendarIcon className="w-5 h-5" />
              Crear Evento
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );

  const renderRecommendedEvents = () => (
    <section className="py-16 bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <SparklesIcon className="w-8 h-8 text-cyan-400" />
              Recomendado para ti
            </h2>
            <p className="text-gray-400 mt-2">
              Eventos seleccionados basados en tus intereses y ubicación
            </p>
          </div>
          
          <Button variant="ghost" className="text-cyan-400">
            Ver todos
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedEvents.slice(0, 6).map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card variant="glass" className="h-full hover:border-cyan-500/50 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Event Title */}
                    <h3 className="text-xl font-semibold text-white line-clamp-2">
                      {event.title}
                    </h3>

                    {/* Event Meta */}
                    <div className="space-y-2 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{formatDistance(event.location.distance)} • {event.location.address}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <StarIcon className="w-4 h-4 text-yellow-400" />
                        <span>{event.organizer.name} • ⭐ {event.organizer.rating}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <UsersIcon className="w-4 h-4" />
                        <span>{event.attendees} asistentes</span>
                      </div>
                    </div>

                    {/* AI Reasons */}
                    <div className="bg-cyan-500/10 rounded-lg p-3">
                      <p className="text-xs text-cyan-400 font-medium mb-1">
                        ¿Por qué te recomendamos esto?
                      </p>
                      <p className="text-xs text-gray-300">
                        {event.reasons[0]}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-lg font-bold text-white">
                        {event.price === 0 ? 'Gratis' : `$${event.price}`}
                      </span>
                      
                      <Button size="sm" variant="primary">
                        Ver detalles
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* AI Confidence Indicator */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            🤖 Estas recomendaciones tienen un 
            <span className="text-cyan-400 font-semibold"> 94% de precisión</span> basado en tu perfil
          </p>
        </div>
      </div>
    </section>
  );

  const renderLocalDemand = () => (
    <section className="py-16 bg-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <ChartBarIcon className="w-8 h-8 text-green-400" />
            Oportunidades en tu área
          </h2>
          <p className="text-gray-400 mt-2">
            Descubre qué tipos de eventos busca la gente cerca de ti
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { category: 'Música', demand: 125, potential: 89, trending: true, competition: 'medium' },
            { category: 'Tecnología', demand: 89, potential: 67, trending: true, competition: 'low' },
            { category: 'Arte', demand: 67, potential: 45, trending: false, competition: 'high' },
            { category: 'Deportes', demand: 54, potential: 78, trending: false, competition: 'medium' },
            { category: 'Gastronomía', demand: 43, potential: 56, trending: true, competition: 'low' },
            { category: 'Negocios', demand: 38, potential: 67, trending: false, competition: 'high' }
          ].map((item, index) => (
            <motion.div
              key={item.category}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card variant="glass" className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Category Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        {item.trending && <FireIcon className="w-5 h-5 text-orange-400" />}
                        {item.category}
                      </h3>
                      
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.competition === 'low' ? 'bg-green-500/20 text-green-400' :
                        item.competition === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {item.competition === 'low' ? 'Baja competencia' :
                         item.competition === 'medium' ? 'Competencia media' :
                         'Alta competencia'}
                      </div>
                    </div>

                    {/* Demand Stats */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Personas buscando:</span>
                        <span className="text-white font-semibold">{item.demand}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Asistentes potenciales:</span>
                        <span className="text-green-400 font-semibold">{item.potential}</span>
                      </div>

                      {/* Demand Bar */}
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-cyan-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((item.demand / 150) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Action */}
                    <Button 
                      variant={item.competition === 'low' ? 'primary' : 'outline'} 
                      size="sm" 
                      fullWidth
                      className="flex items-center justify-center gap-2"
                    >
                      <CalendarIcon className="w-4 h-4" />
                      Crear evento de {item.category}
                      {item.competition === 'low' && <span className="text-xs">🔥</span>}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );

  const renderNetworkActivity = () => (
    <section className="py-16 bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Network Activity */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <UserGroupIcon className="w-7 h-7 text-purple-400" />
              Tu red está activa
            </h2>
            
            <div className="space-y-4">
              {networkActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10"
                >
                  <img 
                    src={activity.user.avatar} 
                    alt={activity.user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  
                  <div className="flex-1">
                    <p className="text-white text-sm">
                      <span className="font-semibold">{activity.user.name}</span>
                      {activity.type === 'attending' && ' va a '}
                      {activity.type === 'hosting' && ' creó '}
                      {activity.type === 'review' && ' valoró '}
                      <span className="text-cyan-400">"{activity.event.title}"</span>
                    </p>
                    <p className="text-gray-400 text-xs">
                      {activity.event.date} • hace {activity.timestamp}
                    </p>
                  </div>
                  
                  <Button size="sm" variant="ghost">
                    Ver
                  </Button>
                </motion.div>
              ))}
            </div>
            
            <Button variant="outline" className="w-full mt-6">
              Ver toda la actividad
            </Button>
          </div>

          {/* Top Hosts */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <StarIcon className="w-7 h-7 text-yellow-400" />
              Anfitriones destacados
            </h2>
            
            <div className="space-y-4">
              {topHosts.map((host, index) => (
                <motion.div
                  key={host.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10"
                >
                  <img 
                    src={host.avatar} 
                    alt={host.name}
                    className="w-12 h-12 rounded-full"
                  />
                  
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{host.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <StarIcon className="w-4 h-4 text-yellow-400" />
                        {host.rating}
                      </span>
                      <span>{host.totalEvents} eventos</span>
                      <span>{host.followerCount} seguidores</span>
                    </div>
                    <div className="flex gap-1 mt-1">
                      {host.specialties.map(specialty => (
                        <span 
                          key={specialty}
                          className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    size="sm" 
                    variant={host.isFollowing ? "outline" : "primary"}
                  >
                    {host.isFollowing ? 'Siguiendo' : 'Seguir'}
                  </Button>
                </motion.div>
              ))}
            </div>
            
            <Button variant="outline" className="w-full mt-6">
              Ver todos los anfitriones
            </Button>
          </div>
        </div>
      </div>
    </section>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" variant="neon" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {renderPersonalizedHero()}
      {renderRecommendedEvents()}
      {renderLocalDemand()}
      {renderNetworkActivity()}
    </div>
  );
};

export default IntelligentHomepage;
