'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Eye,
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  Clock,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  Award,
  Globe,
  Smartphone,
  Monitor,
  ChevronUp,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface AnalyticsData {
  overview: {
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    growth: {
      views: number;
      likes: number;
      comments: number;
      shares: number;
    };
  };
  events: {
    totalEvents: number;
    totalAttendees: number;
    averageRating: number;
    upcomingEvents: number;
    growth: {
      events: number;
      attendees: number;
      rating: number;
    };
  };
  engagement: {
    engagementRate: number;
    avgTimeSpent: string;
    bounceRate: number;
    returnVisitors: number;
  };
  demographics: {
    ageGroups: Array<{ range: string; percentage: number; count: number }>;
    locations: Array<{ city: string; percentage: number; count: number }>;
    devices: Array<{ type: string; percentage: number; count: number }>;
  };
  timeline: Array<{
    date: string;
    views: number;
    likes: number;
    comments: number;
    events: number;
  }>;
  topContent: Array<{
    id: string;
    type: 'post' | 'event';
    title: string;
    views: number;
    engagement: number;
    date: string;
  }>;
}

const AnalyticsPage = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'views' | 'engagement' | 'events'>('views');

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setData({
        overview: {
          totalViews: 12845,
          totalLikes: 2341,
          totalComments: 892,
          totalShares: 456,
          growth: {
            views: 12.5,
            likes: 8.3,
            comments: -2.1,
            shares: 15.7,
          },
        },
        events: {
          totalEvents: 24,
          totalAttendees: 1872,
          averageRating: 4.6,
          upcomingEvents: 8,
          growth: {
            events: 25.0,
            attendees: 18.4,
            rating: 0.3,
          },
        },
        engagement: {
          engagementRate: 6.8,
          avgTimeSpent: '3m 42s',
          bounceRate: 34.2,
          returnVisitors: 68.5,
        },
        demographics: {
          ageGroups: [
            { range: '18-24', percentage: 28, count: 1520 },
            { range: '25-34', percentage: 42, count: 2280 },
            { range: '35-44', percentage: 20, count: 1085 },
            { range: '45+', percentage: 10, count: 540 },
          ],
          locations: [
            { city: 'Madrid', percentage: 35, count: 1896 },
            { city: 'Barcelona', percentage: 22, count: 1192 },
            { city: 'Valencia', percentage: 15, count: 813 },
            { city: 'Sevilla', percentage: 12, count: 650 },
            { city: 'Otros', percentage: 16, count: 867 },
          ],
          devices: [
            { type: 'Móvil', percentage: 65, count: 3520 },
            { type: 'Desktop', percentage: 28, count: 1516 },
            { type: 'Tablet', percentage: 7, count: 379 },
          ],
        },
        timeline: [
          { date: '2024-01-01', views: 420, likes: 78, comments: 23, events: 2 },
          { date: '2024-01-02', views: 380, likes: 65, comments: 19, events: 1 },
          { date: '2024-01-03', views: 520, likes: 92, comments: 31, events: 3 },
          { date: '2024-01-04', views: 610, likes: 108, comments: 45, events: 2 },
          { date: '2024-01-05', views: 490, likes: 87, comments: 28, events: 1 },
          { date: '2024-01-06', views: 720, likes: 134, comments: 56, events: 4 },
          { date: '2024-01-07', views: 680, likes: 121, comments: 39, events: 2 },
        ],
        topContent: [
          {
            id: '1',
            type: 'post',
            title: 'Guía completa de React Hooks avanzados',
            views: 1240,
            engagement: 8.5,
            date: '2024-01-05',
          },
          {
            id: '2',
            type: 'event',
            title: 'Workshop: TypeScript para principiantes',
            views: 980,
            engagement: 12.3,
            date: '2024-01-03',
          },
          {
            id: '3',
            type: 'post',
            title: 'Mejores prácticas en UX/UI Design',
            views: 856,
            engagement: 6.9,
            date: '2024-01-02',
          },
          {
            id: '4',
            type: 'event',
            title: 'Meetup: Fotografía urbana Madrid',
            views: 723,
            engagement: 15.2,
            date: '2024-01-01',
          },
        ],
      });
      setIsLoading(false);
    }, 1500);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <ArrowUp className="w-3 h-3 text-green-500" />;
    if (growth < 0) return <ArrowDown className="w-3 h-3 text-red-500" />;
    return <Minus className="w-3 h-3 text-gray-500" />;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-500';
    if (growth < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const StatCard = ({ 
    title, 
    value, 
    growth, 
    icon: Icon, 
    format = 'number' 
  }: {
    title: string;
    value: number | string;
    growth?: number;
    icon: any;
    format?: 'number' | 'percentage' | 'time';
  }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        {growth !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${getGrowthColor(growth)}`}>
            {getGrowthIcon(growth)}
            <span>{Math.abs(growth)}%</span>
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {format === 'number' && typeof value === 'number' ? formatNumber(value) : value}
          {format === 'percentage' && '%'}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
      </div>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-64 mb-4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-96" />
          </div>
          
          {/* Stats grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(8)].map((_, index) => (
              <Card key={index} className="p-6">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
                <div className="space-y-2">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitorea el rendimiento de tu perfil y contenido
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg p-1">
              {[
                { key: '7d', label: '7d' },
                { key: '30d', label: '30d' },
                { key: '90d', label: '90d' },
                { key: '1y', label: '1y' },
              ].map((range) => (
                <Button
                  key={range.key}
                  variant={timeRange === range.key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTimeRange(range.key as any)}
                >
                  {range.label}
                </Button>
              ))}
            </div>
            
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            
            <Button variant="outline" size="sm" onClick={loadAnalyticsData}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Vistas totales"
            value={data?.overview.totalViews || 0}
            growth={data?.overview.growth.views}
            icon={Eye}
          />
          <StatCard
            title="Total de likes"
            value={data?.overview.totalLikes || 0}
            growth={data?.overview.growth.likes}
            icon={Heart}
          />
          <StatCard
            title="Comentarios"
            value={data?.overview.totalComments || 0}
            growth={data?.overview.growth.comments}
            icon={MessageCircle}
          />
          <StatCard
            title="Compartidos"
            value={data?.overview.totalShares || 0}
            growth={data?.overview.growth.shares}
            icon={Share2}
          />
        </div>

        {/* Events & Engagement Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Eventos creados"
            value={data?.events.totalEvents || 0}
            growth={data?.events.growth.events}
            icon={Calendar}
          />
          <StatCard
            title="Total asistentes"
            value={data?.events.totalAttendees || 0}
            growth={data?.events.growth.attendees}
            icon={Users}
          />
          <StatCard
            title="Rating promedio"
            value={data?.events.averageRating || 0}
            growth={data?.events.growth.rating}
            icon={Award}
            format="number"
          />
          <StatCard
            title="Tasa de engagement"
            value={data?.engagement.engagementRate || 0}
            icon={Activity}
            format="percentage"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Timeline Chart */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Tendencia temporal
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant={selectedMetric === 'views' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMetric('views')}
                >
                  Vistas
                </Button>
                <Button
                  variant={selectedMetric === 'engagement' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMetric('engagement')}
                >
                  Engagement
                </Button>
                <Button
                  variant={selectedMetric === 'events' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMetric('events')}
                >
                  Eventos
                </Button>
              </div>
            </div>
            
            {/* Simple chart placeholder */}
            <div className="h-64 bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg flex items-end justify-around p-4">
              {data?.timeline.map((point, index) => (
                <div
                  key={index}
                  className="bg-blue-500 rounded-t-lg relative group cursor-pointer hover:bg-blue-600 transition-colors"
                  style={{
                    height: `${(point.views / 800) * 100}%`,
                    width: '40px',
                  }}
                >
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {new Date(point.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                    <br />
                    {formatNumber(point.views)} vistas
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Insights */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Insights rápidos
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Mejor día de la semana
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Los sábados generan +45% más engagement
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Mejor hora
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    18:00-20:00 es tu horario dorado
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Audiencia principal
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Desarrolladores 25-34 años en Madrid
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <Zap className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Contenido estrella
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Posts técnicos obtienen +60% más likes
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Content */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Contenido más popular
            </h3>
            
            <div className="space-y-4">
              {data?.topContent.map((content, index) => (
                <div key={content.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full text-sm font-medium text-blue-600 dark:text-blue-400">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {content.title}
                      </p>
                      <Badge variant={content.type === 'event' ? 'default' : 'secondary'} className="text-xs">
                        {content.type === 'event' ? 'Evento' : 'Post'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {formatNumber(content.views)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        {content.engagement}%
                      </span>
                      <span>{new Date(content.date).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>
                  
                  <ChevronUp className={`w-4 h-4 ${
                    index === 0 ? 'text-green-500' : index === 1 ? 'text-yellow-500' : 'text-gray-400'
                  }`} />
                </div>
              ))}
            </div>
          </Card>

          {/* Demographics */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Demografía de audiencia
            </h3>
            
            <div className="space-y-6">
              {/* Age Groups */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Grupos de edad
                </h4>
                <div className="space-y-2">
                  {data?.demographics.ageGroups.map((group) => (
                    <div key={group.range} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {group.range} años
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${group.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                          {group.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Devices */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Dispositivos
                </h4>
                <div className="space-y-2">
                  {data?.demographics.devices.map((device) => (
                    <div key={device.type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {device.type === 'Móvil' && <Smartphone className="w-4 h-4 text-gray-500" />}
                        {device.type === 'Desktop' && <Monitor className="w-4 h-4 text-gray-500" />}
                        {device.type === 'Tablet' && <Smartphone className="w-4 h-4 text-gray-500" />}
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {device.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${device.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                          {device.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Locations */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Ubicaciones principales
                </h4>
                <div className="space-y-2">
                  {data?.demographics.locations.slice(0, 3).map((location) => (
                    <div key={location.city} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {location.city}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {location.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Tiempo promedio"
            value={data?.engagement.avgTimeSpent || '0s'}
            icon={Clock}
            format="time"
          />
          <StatCard
            title="Tasa de rebote"
            value={data?.engagement.bounceRate || 0}
            icon={Activity}
            format="percentage"
          />
          <StatCard
            title="Visitantes recurrentes"
            value={data?.engagement.returnVisitors || 0}
            icon={Users}
            format="percentage"
          />
          <StatCard
            title="Próximos eventos"
            value={data?.events.upcomingEvents || 0}
            icon={Calendar}
          />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;











