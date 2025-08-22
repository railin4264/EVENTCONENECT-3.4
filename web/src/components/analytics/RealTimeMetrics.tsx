'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UsersIcon,
  CalendarDaysIcon,
  TrendingUpIcon,
  ChartBarIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  ClockIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardTitle } from '@/components/ui/Card';
import { RealTimeMetrics as MetricsType } from '@/types';

// ===== INTERFACES =====
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  loading?: boolean;
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    color: string;
  }>;
}

// ===== COMPONENTE DE TARJETA DE MÉTRICA =====
const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend, 
  color = 'blue',
  loading = false 
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-200',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 border-green-200',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 border-orange-200',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 border-red-200'
  };

  const trendColor = trend?.startsWith('+') ? 'text-green-600' : 
                   trend?.startsWith('-') ? 'text-red-600' : 'text-gray-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card className={`p-6 border-l-4 ${colorClasses[color]}`}>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {title}
              </p>
              <div className="flex items-center space-x-2">
                {loading ? (
                  <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-16 rounded" />
                ) : (
                  <motion.p 
                    className="text-2xl font-bold text-gray-900 dark:text-white"
                    key={value}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' }}
                  >
                    {typeof value === 'number' ? value.toLocaleString() : value}
                  </motion.p>
                )}
                {trend && (
                  <span className={`text-sm font-medium ${trendColor}`}>
                    {trend}
                  </span>
                )}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ===== MINI GRÁFICO =====
const MiniChart: React.FC<{ data: number[]; color: string; height?: number }> = ({ 
  data, 
  color, 
  height = 40 
}) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <div className="flex items-end space-x-1" style={{ height }}>
      {data.map((value, index) => {
        const normalizedHeight = ((value - min) / range) * height;
        return (
          <motion.div
            key={index}
            className="flex-1 rounded-t-sm"
            style={{ 
              backgroundColor: color,
              height: Math.max(normalizedHeight, 2)
            }}
            initial={{ height: 0 }}
            animate={{ height: Math.max(normalizedHeight, 2) }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          />
        );
      })}
    </div>
  );
};

// ===== COMPONENTE PRINCIPAL =====
export const RealTimeMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricsType>({
    activeUsers: 0,
    eventsToday: 0,
    newSignups: 0,
    engagementRate: 0,
    trendingEvents: [],
    lastUpdated: new Date().toISOString()
  });
  
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [historicalData, setHistoricalData] = useState<{
    activeUsers: number[];
    signups: number[];
    events: number[];
  }>({
    activeUsers: [],
    signups: [],
    events: []
  });

  // Simular datos en tiempo real
  useEffect(() => {
    // Simular conexión WebSocket
    const simulateWebSocket = () => {
      setConnected(true);
      setLoading(false);
      
      // Datos iniciales
      const initialMetrics: MetricsType = {
        activeUsers: Math.floor(Math.random() * 500) + 100,
        eventsToday: Math.floor(Math.random() * 50) + 10,
        newSignups: Math.floor(Math.random() * 20) + 5,
        engagementRate: Math.floor(Math.random() * 30) + 60,
        trendingEvents: ['1', '2', '3'],
        lastUpdated: new Date().toISOString()
      };
      
      setMetrics(initialMetrics);
      
      // Generar datos históricos
      const generateHistoricalData = () => {
        const hours = 24;
        const activeUsers = Array.from({ length: hours }, () => 
          Math.floor(Math.random() * 200) + 50
        );
        const signups = Array.from({ length: hours }, () => 
          Math.floor(Math.random() * 10) + 1
        );
        const events = Array.from({ length: hours }, () => 
          Math.floor(Math.random() * 8) + 1
        );
        
        setHistoricalData({ activeUsers, signups, events });
      };
      
      generateHistoricalData();
      
      // Actualizar métricas cada 5 segundos
      const interval = setInterval(() => {
        setMetrics(prev => ({
          activeUsers: prev.activeUsers + Math.floor(Math.random() * 10) - 5,
          eventsToday: prev.eventsToday + (Math.random() > 0.8 ? 1 : 0),
          newSignups: prev.newSignups + (Math.random() > 0.9 ? 1 : 0),
          engagementRate: Math.max(0, Math.min(100, prev.engagementRate + Math.floor(Math.random() * 6) - 3)),
          trendingEvents: prev.trendingEvents,
          lastUpdated: new Date().toISOString()
        }));
        
        // Actualizar datos históricos
        setHistoricalData(prev => ({
          activeUsers: [...prev.activeUsers.slice(1), prev.activeUsers[prev.activeUsers.length - 1] + Math.floor(Math.random() * 20) - 10],
          signups: [...prev.signups.slice(1), Math.floor(Math.random() * 3)],
          events: [...prev.events.slice(1), Math.floor(Math.random() * 2)]
        }));
      }, 5000);
      
      return () => clearInterval(interval);
    };

    // Simular delay de conexión
    const timer = setTimeout(simulateWebSocket, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Estado de conexión
  const connectionStatus = connected ? (
    <div className="flex items-center space-x-2 text-green-600">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      <span className="text-sm">En vivo</span>
    </div>
  ) : (
    <div className="flex items-center space-x-2 text-gray-500">
      <div className="w-2 h-2 bg-gray-400 rounded-full" />
      <span className="text-sm">Conectando...</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Métricas en Tiempo Real
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Dashboard de actividad de EventConnect
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {connectionStatus}
          <div className="text-sm text-gray-500">
            <ClockIcon className="w-4 h-4 inline mr-1" />
            Actualizado: {new Date(metrics.lastUpdated).toLocaleTimeString('es-ES')}
          </div>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Usuarios Activos"
          value={metrics.activeUsers}
          icon={<UsersIcon className="w-6 h-6" />}
          trend="+12%"
          color="blue"
          loading={loading}
        />
        <MetricCard
          title="Eventos Hoy"
          value={metrics.eventsToday}
          icon={<CalendarDaysIcon className="w-6 h-6" />}
          trend="+8%"
          color="green"
          loading={loading}
        />
        <MetricCard
          title="Nuevos Usuarios"
          value={metrics.newSignups}
          icon={<TrendingUpIcon className="w-6 h-6" />}
          trend="+15%"
          color="purple"
          loading={loading}
        />
        <MetricCard
          title="Engagement"
          value={`${metrics.engagementRate}%`}
          icon={<ChartBarIcon className="w-6 h-6" />}
          trend="+5%"
          color="orange"
          loading={loading}
        />
      </div>

      {/* Gráficos en tiempo real */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Usuarios activos */}
        <Card className="p-6">
          <CardTitle className="flex items-center justify-between mb-4">
            <span>Usuarios Activos (24h)</span>
            <UsersIcon className="w-5 h-5 text-blue-500" />
          </CardTitle>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold text-blue-600">
                {metrics.activeUsers}
              </div>
              <MiniChart 
                data={historicalData.activeUsers} 
                color="#3B82F6" 
                height={60}
              />
              <div className="text-sm text-gray-500">
                Pico: {Math.max(...historicalData.activeUsers)} usuarios
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nuevos registros */}
        <Card className="p-6">
          <CardTitle className="flex items-center justify-between mb-4">
            <span>Registros (24h)</span>
            <TrendingUpIcon className="w-5 h-5 text-green-500" />
          </CardTitle>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold text-green-600">
                {metrics.newSignups}
              </div>
              <MiniChart 
                data={historicalData.signups} 
                color="#10B981" 
                height={60}
              />
              <div className="text-sm text-gray-500">
                Total hoy: {historicalData.signups.reduce((a, b) => a + b, 0)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Eventos creados */}
        <Card className="p-6">
          <CardTitle className="flex items-center justify-between mb-4">
            <span>Eventos Creados (24h)</span>
            <CalendarDaysIcon className="w-5 h-5 text-purple-500" />
          </CardTitle>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold text-purple-600">
                {metrics.eventsToday}
              </div>
              <MiniChart 
                data={historicalData.events} 
                color="#8B5CF6" 
                height={60}
              />
              <div className="text-sm text-gray-500">
                Promedio/hora: {(historicalData.events.reduce((a, b) => a + b, 0) / 24).toFixed(1)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas de engagement detalladas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement por categoría */}
        <Card className="p-6">
          <CardTitle className="mb-4">Engagement por Categoría</CardTitle>
          <CardContent>
            <div className="space-y-4">
              {[
                { category: 'Música', engagement: 85, events: 12, color: 'bg-pink-500' },
                { category: 'Tecnología', engagement: 92, events: 8, color: 'bg-blue-500' },
                { category: 'Gastronomía', engagement: 78, events: 15, color: 'bg-orange-500' },
                { category: 'Arte', engagement: 71, events: 6, color: 'bg-purple-500' },
                { category: 'Deportes', engagement: 66, events: 9, color: 'bg-green-500' }
              ].map((item, index) => (
                <motion.div 
                  key={item.category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="font-medium text-sm">{item.category}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">{item.events} eventos</span>
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div
                        className={`h-full rounded-full ${item.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.engagement}%` }}
                        transition={{ delay: index * 0.1, duration: 0.8 }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8">{item.engagement}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actividad reciente */}
        <Card className="p-6">
          <CardTitle className="mb-4">Actividad Reciente</CardTitle>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: 'Nuevo evento creado', user: 'María García', time: 'hace 2 min', icon: CalendarDaysIcon, color: 'text-green-600' },
                { action: 'Usuario se unió a tribu', user: 'Carlos López', time: 'hace 5 min', icon: UsersIcon, color: 'text-blue-600' },
                { action: 'Evento compartido', user: 'Ana Martín', time: 'hace 8 min', icon: ShareIcon, color: 'text-purple-600' },
                { action: 'Nuevo registro', user: 'David Ruiz', time: 'hace 12 min', icon: TrendingUpIcon, color: 'text-orange-600' },
                { action: 'Evento marcado como favorito', user: 'Laura Sánchez', time: 'hace 15 min', icon: HeartIcon, color: 'text-red-600' }
              ].map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <div className={`p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 ${activity.color}`}>
                    <activity.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.user} • {activity.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Eventos trending en tiempo real */}
      <Card className="p-6">
        <CardTitle className="flex items-center justify-between mb-4">
          <span>Eventos Trending Ahora</span>
          <div className="flex items-center space-x-2">
            <FireIcon className="w-5 h-5 text-red-500" />
            <span className="text-sm text-gray-500">
              {metrics.trendingEvents.length} eventos
            </span>
          </div>
        </CardTitle>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { 
                id: '1', 
                title: 'AI Summit Madrid 2024', 
                velocity: '+45 usuarios/hora',
                score: 95,
                trend: 'Subiendo rápido'
              },
              { 
                id: '2', 
                title: 'Festival Gastronómico', 
                velocity: '+32 usuarios/hora',
                score: 87,
                trend: 'Muy popular'
              },
              { 
                id: '3', 
                title: 'Workshop React Native', 
                velocity: '+28 usuarios/hora',
                score: 82,
                trend: 'Creciendo'
              }
            ].map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg border border-red-200 dark:border-red-800"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                    {event.title}
                  </h4>
                  <div className="flex items-center space-x-1">
                    <FireIcon className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-bold text-red-600">
                      {event.score}
                    </span>
                  </div>
                </div>
                
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {event.velocity}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-red-600">
                    {event.trend}
                  </span>
                  <div className="flex items-center space-x-1">
                    <TrendingUpIcon className="w-3 h-3 text-red-500" />
                    <span className="text-xs text-gray-500">
                      Trending #{index + 1}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Métricas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Visualizaciones</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {(metrics.activeUsers * 3.2).toFixed(0)}K
              </p>
            </div>
            <EyeIcon className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Interacciones</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {(metrics.activeUsers * 1.8).toFixed(0)}K
              </p>
            </div>
            <HeartIcon className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Compartidos</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {(metrics.activeUsers * 0.6).toFixed(0)}K
              </p>
            </div>
            <ShareIcon className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Conversión</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {((metrics.newSignups / Math.max(metrics.activeUsers, 1)) * 100).toFixed(1)}%
              </p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};