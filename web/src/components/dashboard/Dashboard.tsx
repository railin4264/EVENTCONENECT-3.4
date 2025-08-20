import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  MapPin, 
  Star, 
  Eye,
  Heart,
  Share,
  Activity,
  Target,
  Award,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { LoadingSpinner } from '@/components/ui/Loading';
import { cn } from '@/lib/utils';

// ===== CHART COMPONENT (SIMPLIFIED) =====
const Chart: React.FC<{
  data: number[];
  labels: string[];
  type: 'line' | 'bar' | 'area';
  className?: string;
}> = ({ data, labels, type, className }) => {
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue;

  return (
    <div className={cn('w-full h-64', className)}>
      <svg className="w-full h-full" viewBox="0 0 400 200">
        {/* Grid Lines */}
        {Array.from({ length: 5 }).map((_, i) => (
          <line
            key={i}
            x1="0"
            y1={40 + i * 32}
            x2="400"
            y2={40 + i * 32}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
          />
        ))}

        {/* Chart Path */}
        {type === 'line' && (
          <path
            d={data.map((value, index) => {
              const x = (index / (data.length - 1)) * 400;
              const y = 200 - ((value - minValue) / range) * 160 - 20;
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            stroke="url(#gradient)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {type === 'area' && (
          <path
            d={data.map((value, index) => {
              const x = (index / (data.length - 1)) * 400;
              const y = 200 - ((value - minValue) / range) * 160 - 20;
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ') + ' L 400 200 L 0 200 Z'}
            fill="url(#gradient)"
            fillOpacity="0.3"
          />
        )}

        {type === 'bar' && (
          <>
            {data.map((value, index) => {
              const x = (index / data.length) * 400;
              const width = 400 / data.length - 4;
              const height = ((value - minValue) / range) * 160;
              const y = 200 - height - 20;
              
              return (
                <rect
                  key={index}
                  x={x + 2}
                  y={y}
                  width={width}
                  height={height}
                  fill="url(#gradient)"
                  rx="2"
                />
              );
            })}
          </>
        )}

        {/* Gradient Definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00d4ff" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>

        {/* Data Points */}
        {data.map((value, index) => {
          const x = (index / (data.length - 1)) * 400;
          const y = 200 - ((value - minValue) / range) * 160 - 20;
          
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill="#00d4ff"
              className="hover:r-6 transition-all duration-200"
            />
          );
        })}
      </svg>
    </div>
  );
};

// ===== METRIC CARD COMPONENT =====
const MetricCard: React.FC<{
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
  className?: string;
}> = ({ title, value, change, icon, variant = 'primary', className }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'from-cyan-500 to-blue-600';
      case 'secondary':
        return 'from-purple-500 to-pink-600';
      case 'success':
        return 'from-green-500 to-emerald-600';
      case 'warning':
        return 'from-yellow-500 to-orange-600';
      default:
        return 'from-cyan-500 to-blue-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      <Card variant="glass" className="h-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white">
              {icon}
            </div>
            <div className={`text-sm font-medium px-2 py-1 rounded-full ${
              change >= 0 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {change >= 0 ? '+' : ''}{change}%
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-2">{value}</h3>
          <p className="text-gray-300 text-sm">{title}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ===== ACTIVITY FEED COMPONENT =====
const ActivityFeed: React.FC<{
  activities: Array<{
    id: string;
    type: 'event' | 'user' | 'achievement';
    title: string;
    description: string;
    time: string;
    icon: React.ReactNode;
  }>;
}> = ({ activities }) => {
  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <div className="flex items-start space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white">
              {activity.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">
                {activity.title}
              </p>
              <p className="text-sm text-gray-300">
                {activity.description}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {activity.time}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ===== MAIN DASHBOARD COMPONENT =====
export const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // ===== SAMPLE DATA =====
  const metrics = [
    {
      title: 'Total Eventos',
      value: '1,247',
      change: 12.5,
      icon: <Calendar className="w-6 h-6" />,
      variant: 'primary' as const,
    },
    {
      title: 'Usuarios Activos',
      value: '45.2K',
      change: 8.3,
      icon: <Users className="w-6 h-6" />,
      variant: 'secondary' as const,
    },
    {
      title: 'Eventos Creados',
      value: '89',
      change: 23.1,
      icon: <Target className="w-6 h-6" />,
      variant: 'success' as const,
    },
    {
      title: 'Rating Promedio',
      value: '4.8',
      change: 2.1,
      icon: <Star className="w-6 h-6" />,
      variant: 'warning' as const,
    },
  ];

  const chartData = {
    events: [45, 52, 38, 67, 89, 76, 94, 87, 65, 78, 82, 91],
    users: [1200, 1350, 1420, 1580, 1620, 1780, 1850, 1920, 2010, 2150, 2280, 2420],
    engagement: [78, 82, 75, 88, 91, 85, 89, 92, 87, 90, 94, 89],
  };

  const activities = [
    {
      id: '1',
      type: 'event' as const,
      title: 'Nuevo evento creado',
      description: 'Tech Meetup Barcelona ha sido creado por @techbarcelona',
      time: 'Hace 2 horas',
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: '2',
      type: 'user' as const,
      title: 'Nuevo usuario registrado',
      description: '@maria_garcia se ha unido a EventConnect',
      time: 'Hace 4 horas',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: '3',
      type: 'achievement' as const,
      title: 'Logro desbloqueado',
      description: 'Has alcanzado el nivel "Event Master"',
      time: 'Hace 6 horas',
      icon: <Award className="w-4 h-4" />,
    },
    {
      id: '4',
      type: 'event' as const,
      title: 'Evento completado',
      description: 'Festival de Música Urbana ha finalizado exitosamente',
      time: 'Hace 1 día',
      icon: <Calendar className="w-4 h-4" />,
    },
  ];

  const tabs = [
    {
      id: 'overview',
      label: 'Resumen',
      icon: <Activity className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, index) => (
              <MetricCard
                key={index}
                {...metric}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              />
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  <span>Eventos por Mes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Chart
                  data={chartData.events}
                  labels={['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']}
                  type="line"
                />
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span>Crecimiento de Usuarios</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Chart
                  data={chartData.users.map(v => v / 100)}
                  labels={['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']}
                  type="area"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <TrendingUp className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Métricas Detalladas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-2">89%</div>
                  <div className="text-gray-300">Tasa de Retención</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">2.4x</div>
                  <div className="text-gray-300">Crecimiento Mensual</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">4.8/5</div>
                  <div className="text-gray-300">Satisfacción del Usuario</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle>Engagement por Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <Chart
                data={chartData.engagement}
                labels={['Tecnología', 'Música', 'Arte', 'Deportes', 'Negocios', 'Educación', 'Salud', 'Cultura', 'Gastronomía', 'Viajes', 'Moda', 'Otros']}
                type="bar"
              />
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: 'activity',
      label: 'Actividad',
      icon: <Zap className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityFeed activities={activities} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Top Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Tech Meetup Barcelona', 'Festival de Música Urbana', 'Workshop de Arte Digital'].map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <span className="text-white font-medium">{event}</span>
                      <div className="flex items-center space-x-2">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">{(index + 1) * 150}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader>
                <CardTitle>Logros Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Event Master', 'Community Builder', 'Trend Setter'].map((achievement, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
                      <Award className="w-5 h-5 text-yellow-400" />
                      <span className="text-white font-medium">{achievement}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" variant="neon" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Dashboard
          </h1>
          <p className="text-gray-300">
            Monitorea el rendimiento y la actividad de EventConnect
          </p>
        </motion.div>

        {/* Tabs */}
        <Tabs
          tabs={tabs}
          defaultTab="overview"
          variant="glass"
          onChange={setActiveTab}
          className="mb-8"
        />

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {tabs.find(tab => tab.id === activeTab)?.content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;