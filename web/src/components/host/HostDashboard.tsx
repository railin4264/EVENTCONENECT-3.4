'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarIcon,
  UsersIcon,
  StarIcon,
  CurrencyDollarIcon,
  TrendingUpIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  MapPinIcon,
  ClockIcon,
  ChartBarIcon,
  CogIcon,
  PlusIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  SparklesIcon,
  FireIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/Loading';
import { eventsAPI, userAPI } from '@/services/api';
import Link from 'next/link';

// ===== INTERFACES =====
interface HostStats {
  totalEvents: number;
  totalAttendees: number;
  averageRating: number;
  totalRevenue: number;
  growthMetrics: {
    eventsGrowth: number;
    attendeesGrowth: number;
    revenueGrowth: number;
    ratingGrowth: number;
  };
  thisMonth: {
    events: number;
    attendees: number;
    revenue: number;
    newFollowers: number;
  };
}

interface EventPerformance {
  id: string;
  title: string;
  date: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  attendees: {
    registered: number;
    confirmed: number;
    capacity: number;
  };
  revenue: number;
  rating: number;
  reviewCount: number;
  engagement: {
    views: number;
    shares: number;
    saves: number;
  };
  conversion: {
    viewToRegister: number;
    registerToAttend: number;
  };
}

interface AudienceInsight {
  demographic: 'age' | 'gender' | 'location' | 'interests';
  data: Array<{ label: string; value: number; percentage: number }>;
}

interface Recommendation {
  type: 'pricing' | 'timing' | 'location' | 'content' | 'promotion';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedImprovement: string;
}

// ===== HOST DASHBOARD COMPONENT =====
export const HostDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [hostStats, setHostStats] = useState<HostStats | null>(null);
  const [eventPerformance, setEventPerformance] = useState<EventPerformance[]>([]);
  const [audienceInsights, setAudienceInsights] = useState<AudienceInsight[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [timeRange, setTimeRange] = useState('30d');

  // ===== LOAD DATA =====
  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API calls - replace with actual API endpoints
      const [statsRes, eventsRes, insightsRes, recommendationsRes] = await Promise.all([
        getHostStats(),
        getEventPerformance(),
        getAudienceInsights(),
        getHostRecommendations()
      ]);

      setHostStats(statsRes.data);
      setEventPerformance(eventsRes.data);
      setAudienceInsights(insightsRes.data);
      setRecommendations(recommendationsRes.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ===== MOCK API FUNCTIONS (Replace with real API calls) =====
  const getHostStats = async () => ({
    data: {
      totalEvents: 24,
      totalAttendees: 1847,
      averageRating: 4.7,
      totalRevenue: 18750,
      growthMetrics: {
        eventsGrowth: 15.3,
        attendeesGrowth: 23.7,
        revenueGrowth: 18.2,
        ratingGrowth: 2.1
      },
      thisMonth: {
        events: 3,
        attendees: 189,
        revenue: 2340,
        newFollowers: 47
      }
    }
  });

  const getEventPerformance = async () => ({
    data: [
      {
        id: '1',
        title: 'Conferencia Tech 2024',
        date: '2024-02-15',
        status: 'upcoming',
        attendees: { registered: 156, confirmed: 134, capacity: 200 },
        revenue: 7800,
        rating: 4.8,
        reviewCount: 23,
        engagement: { views: 1247, shares: 89, saves: 156 },
        conversion: { viewToRegister: 12.5, registerToAttend: 85.9 }
      },
      {
        id: '2',
        title: 'Workshop de Design UX',
        date: '2024-01-28',
        status: 'completed',
        attendees: { registered: 45, confirmed: 42, capacity: 50 },
        revenue: 2250,
        rating: 4.9,
        reviewCount: 38,
        engagement: { views: 567, shares: 34, saves: 67 },
        conversion: { viewToRegister: 7.9, registerToAttend: 93.3 }
      },
      {
        id: '3',
        title: 'Meetup Startups',
        date: '2024-01-15',
        status: 'completed',
        attendees: { registered: 89, confirmed: 76, capacity: 100 },
        revenue: 0,
        rating: 4.6,
        reviewCount: 51,
        engagement: { views: 892, shares: 67, saves: 123 },
        conversion: { viewToRegister: 9.9, registerToAttend: 85.4 }
      }
    ]
  });

  const getAudienceInsights = async () => ({
    data: [
      {
        demographic: 'age',
        data: [
          { label: '18-24', value: 234, percentage: 18.2 },
          { label: '25-34', value: 567, percentage: 44.1 },
          { label: '35-44', value: 342, percentage: 26.6 },
          { label: '45+', value: 143, percentage: 11.1 }
        ]
      },
      {
        demographic: 'interests',
        data: [
          { label: 'Tecnología', value: 678, percentage: 52.7 },
          { label: 'Negocios', value: 456, percentage: 35.4 },
          { label: 'Design', value: 234, percentage: 18.2 },
          { label: 'Marketing', value: 189, percentage: 14.7 }
        ]
      }
    ]
  });

  const getHostRecommendations = async () => ({
    data: [
      {
        type: 'pricing',
        title: 'Optimizar precio de entrada',
        description: 'Basado en eventos similares, podrías aumentar el precio 15% sin afectar la demanda',
        impact: 'high',
        difficulty: 'easy',
        estimatedImprovement: '+18% ingresos'
      },
      {
        type: 'timing',
        title: 'Mejor horario para eventos tech',
        description: 'Los eventos de tecnología tienen 23% más asistencia los martes y miércoles por la tarde',
        impact: 'medium',
        difficulty: 'easy',
        estimatedImprovement: '+23% asistencia'
      },
      {
        type: 'promotion',
        title: 'Crear contenido previo',
        description: 'Eventos con 3+ posts promocionales tienen 40% más engagement',
        impact: 'high',
        difficulty: 'medium',
        estimatedImprovement: '+40% engagement'
      }
    ]
  });

  // ===== RENDER COMPONENTS =====
  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[
        {
          title: 'Total de Eventos',
          value: hostStats?.totalEvents || 0,
          change: hostStats?.growthMetrics.eventsGrowth || 0,
          icon: CalendarIcon,
          color: 'text-cyan-400',
          bgColor: 'bg-cyan-500/20'
        },
        {
          title: 'Total Asistentes',
          value: hostStats?.totalAttendees || 0,
          change: hostStats?.growthMetrics.attendeesGrowth || 0,
          icon: UsersIcon,
          color: 'text-purple-400',
          bgColor: 'bg-purple-500/20'
        },
        {
          title: 'Calificación Promedio',
          value: hostStats?.averageRating || 0,
          change: hostStats?.growthMetrics.ratingGrowth || 0,
          icon: StarIcon,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/20',
          format: 'rating'
        },
        {
          title: 'Ingresos Totales',
          value: hostStats?.totalRevenue || 0,
          change: hostStats?.growthMetrics.revenueGrowth || 0,
          icon: CurrencyDollarIcon,
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          format: 'currency'
        }
      ].map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {stat.format === 'currency' && '$'}
                    {stat.format === 'rating' ? stat.value.toFixed(1) : stat.value.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-2">
                    {stat.change >= 0 ? (
                      <ArrowUpIcon className="w-4 h-4 text-green-400 mr-1" />
                    ) : (
                      <ArrowDownIcon className="w-4 h-4 text-red-400 mr-1" />
                    )}
                    <span className={`text-sm ${stat.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {Math.abs(stat.change)}%
                    </span>
                    <span className="text-gray-400 text-sm ml-1">vs mes anterior</span>
                  </div>
                </div>
                
                <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const renderEventPerformance = () => (
    <Card variant="glass" className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ChartBarIcon className="w-6 h-6 text-cyan-400" />
            Performance de Eventos
          </CardTitle>
          <Button variant="outline" size="sm">
            <PlusIcon className="w-4 h-4 mr-2" />
            Nuevo Evento
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {eventPerformance.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-white font-semibold">{event.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    event.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' :
                    event.status === 'ongoing' ? 'bg-green-500/20 text-green-400' :
                    event.status === 'completed' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {event.status === 'upcoming' ? 'Próximo' :
                     event.status === 'ongoing' ? 'En curso' :
                     event.status === 'completed' ? 'Completado' :
                     'Cancelado'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Asistentes:</span>
                    <span className="text-white ml-1">
                      {event.attendees.confirmed}/{event.attendees.capacity}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Rating:</span>
                    <span className="text-yellow-400 ml-1 flex items-center">
                      <StarIcon className="w-4 h-4 mr-1" />
                      {event.rating} ({event.reviewCount})
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Ingresos:</span>
                    <span className="text-green-400 ml-1">
                      ${event.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Conversión:</span>
                    <span className="text-cyan-400 ml-1">
                      {event.conversion.viewToRegister}%
                    </span>
                  </div>
                </div>
              </div>
              
              <Button variant="ghost" size="sm">
                Ver detalles
                <ArrowRightIcon className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderAudienceInsights = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {audienceInsights.map((insight, index) => (
        <motion.div
          key={insight.demographic}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.2 }}
        >
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="capitalize">
                {insight.demographic === 'age' ? 'Distribución por Edad' :
                 insight.demographic === 'interests' ? 'Intereses Principales' :
                 insight.demographic}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insight.data.map((item, i) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-medium">{item.label}</span>
                      <span className="text-gray-400 text-sm">({item.value})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-cyan-400 to-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-cyan-400 text-sm w-12 text-right">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const renderRecommendations = () => (
    <Card variant="glass" className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SparklesIcon className="w-6 h-6 text-yellow-400" />
          Recomendaciones IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-lg bg-white/5 border border-white/10"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-white font-semibold">{rec.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rec.impact === 'high' ? 'bg-green-500/20 text-green-400' :
                      rec.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {rec.impact === 'high' ? 'Alto impacto' :
                       rec.impact === 'medium' ? 'Medio impacto' :
                       'Bajo impacto'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rec.difficulty === 'easy' ? 'bg-blue-500/20 text-blue-400' :
                      rec.difficulty === 'medium' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {rec.difficulty === 'easy' ? 'Fácil' :
                       rec.difficulty === 'medium' ? 'Medio' :
                       'Difícil'}
                    </span>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-2">{rec.description}</p>
                  
                  <div className="flex items-center gap-2">
                    <TrendingUpIcon className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm font-medium">
                      {rec.estimatedImprovement}
                    </span>
                  </div>
                </div>
                
                <Button variant="primary" size="sm">
                  Aplicar
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderQuickActions = () => (
    <Card variant="glass">
      <CardHeader>
        <CardTitle>Acciones Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { 
              title: 'Crear Evento', 
              description: 'Organiza tu próximo evento',
              icon: PlusIcon,
              color: 'text-cyan-400',
              bgColor: 'bg-cyan-500/20'
            },
            { 
              title: 'Ver Analytics', 
              description: 'Analiza el rendimiento',
              icon: ChartBarIcon,
              color: 'text-purple-400',
              bgColor: 'bg-purple-500/20'
            },
            { 
              title: 'Gestionar Eventos', 
              description: 'Edita eventos existentes',
              icon: CogIcon,
              color: 'text-green-400',
              bgColor: 'bg-green-500/20'
            },
            { 
              title: 'Ver Reseñas', 
              description: 'Lee feedback de asistentes',
              icon: ChatBubbleLeftIcon,
              color: 'text-yellow-400',
              bgColor: 'bg-yellow-500/20'
            }
          ].map((action, index) => (
            <motion.button
              key={action.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 text-left"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${action.bgColor} flex items-center justify-center`}>
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                </div>
                <div>
                  <h3 className="text-white font-medium">{action.title}</h3>
                  <p className="text-gray-400 text-sm">{action.description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" variant="neon" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard de Anfitrión</h1>
            <p className="text-gray-400 mt-2">
              Gestiona tus eventos y analiza su rendimiento
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
              <option value="1y">Último año</option>
            </select>
            
            <Button variant="primary">
              <PlusIcon className="w-5 h-5 mr-2" />
              Crear Evento
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {renderStatsCards()}

        {/* Event Performance */}
        {renderEventPerformance()}

        {/* Audience Insights & Recommendations */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <div className="xl:col-span-2">
            {renderAudienceInsights()}
          </div>
          <div>
            {renderQuickActions()}
          </div>
        </div>

        {/* AI Recommendations */}
        {renderRecommendations()}
      </div>
    </div>
  );
};

export default HostDashboard;
