'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2,
  Download,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  Clock,
  MapPin,
  Filter
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalEvents: number;
    totalUsers: number;
    totalTribes: number;
    totalPosts: number;
    activeUsers: number;
    engagementRate: number;
  };
  trends: {
    events: TrendData[];
    users: TrendData[];
    engagement: TrendData[];
  };
  demographics: {
    ageGroups: DemographicData[];
    locations: DemographicData[];
    interests: DemographicData[];
  };
  performance: {
    topEvents: PerformanceData[];
    topTribes: PerformanceData[];
    topPosts: PerformanceData[];
  };
  insights: Insight[];
}

interface TrendData {
  date: string;
  value: number;
  change: number;
}

interface DemographicData {
  label: string;
  value: number;
  percentage: number;
}

interface PerformanceData {
  id: string;
  name: string;
  metric: string;
  value: number;
  change: number;
  category: string;
}

interface Insight {
  id: string;
  type: 'positive' | 'negative' | 'neutral';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  recommendation?: string;
}

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'demographics' | 'performance' | 'insights'>('overview');

  // Fetch analytics data
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', timeRange],
    queryFn: () => api.analytics.getAnalytics({ timeRange }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No se pudieron cargar los datos de analytics</p>
      </div>
    );
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive': return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'negative': return <TrendingUp className="w-5 h-5 text-red-600" />;
      case 'neutral': return <Activity className="w-5 h-5 text-blue-600" />;
      default: return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive': return 'border-green-200 bg-green-50';
      case 'negative': return 'border-red-200 bg-red-50';
      case 'neutral': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Dashboard de Analytics</h1>
            <p className="text-gray-600">Métricas y insights de tu plataforma EventConnect</p>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
              <option value="1y">Último año</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Resumen', icon: BarChart3 },
            { id: 'trends', label: 'Tendencias', icon: TrendingUp },
            { id: 'demographics', label: 'Demografía', icon: Users },
            { id: 'performance', label: 'Rendimiento', icon: Target },
            { id: 'insights', label: 'Insights', icon: Zap },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Eventos</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalEvents.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalUsers.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Eye className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.activeUsers.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tasa de Engagement</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.engagementRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tribus</h3>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{analytics.overview.totalTribes.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Tribus creadas</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Posts</h3>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{analytics.overview.totalPosts.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Posts publicados</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Crecimiento</h3>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">
                  {((analytics.overview.totalUsers / Math.max(analytics.overview.totalUsers - 100, 1)) * 100 - 100).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600">Crecimiento mensual</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📈 Tendencias Temporales</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Events Trend */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Eventos</h3>
                <div className="space-y-2">
                  {analytics.trends.events.slice(-5).map((trend, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{trend.date}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{trend.value}</span>
                        <span className={`text-xs ${trend.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {trend.change >= 0 ? '+' : ''}{trend.change}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Users Trend */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Usuarios</h3>
                <div className="space-y-2">
                  {analytics.trends.users.slice(-5).map((trend, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{trend.date}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{trend.value}</span>
                        <span className={`text-xs ${trend.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {trend.change >= 0 ? '+' : ''}{trend.change}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Engagement Trend */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Engagement</h3>
                <div className="space-y-2">
                  {analytics.trends.engagement.slice(-5).map((trend, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{trend.date}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{trend.value}%</span>
                        <span className={`text-xs ${trend.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {trend.change >= 0 ? '+' : ''}{trend.change}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'demographics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">👥 Demografía de Usuarios</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Age Groups */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Grupos de Edad</h3>
                <div className="space-y-2">
                  {analytics.demographics.ageGroups.map((group, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{group.label}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{group.value}</span>
                        <span className="text-xs text-gray-500">({group.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Locations */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Ubicaciones</h3>
                <div className="space-y-2">
                  {analytics.demographics.locations.map((location, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{location.label}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{location.value}</span>
                        <span className="text-xs text-gray-500">({location.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Intereses</h3>
                <div className="space-y-2">
                  {analytics.demographics.interests.map((interest, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{interest.label}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{interest.value}</span>
                        <span className="text-xs text-gray-500">({interest.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🏆 Top Performers</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top Events */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Eventos Destacados</h3>
                <div className="space-y-3">
                  {analytics.performance.topEvents.map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900">{event.name}</p>
                        <p className="text-xs text-gray-500">{event.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">{event.value}</p>
                        <p className={`text-xs ${event.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {event.change >= 0 ? '+' : ''}{event.change}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Tribes */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Tribus Populares</h3>
                <div className="space-y-3">
                  {analytics.performance.topTribes.map((tribe, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900">{tribe.name}</p>
                        <p className="text-xs text-gray-500">{tribe.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{tribe.value}</p>
                        <p className={`text-xs ${tribe.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {tribe.change >= 0 ? '+' : ''}{tribe.change}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Posts */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Posts Virales</h3>
                <div className="space-y-3">
                  {analytics.performance.topPosts.map((post, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900">{post.name}</p>
                        <p className="text-xs text-gray-500">{post.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-purple-600">{post.value}</p>
                        <p className={`text-xs ${post.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {post.change >= 0 ? '+' : ''}{post.change}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">💡 Insights y Recomendaciones</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {analytics.insights.map((insight) => (
                <div
                  key={insight.id}
                  className={`border rounded-lg p-4 ${getInsightColor(insight.type)}`}
                >
                  <div className="flex items-start space-x-3">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.impact)}`}>
                          {insight.impact}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
                      {insight.recommendation && (
                        <div className="bg-white bg-opacity-50 rounded p-3">
                          <p className="text-sm font-medium text-gray-800 mb-1">💡 Recomendación:</p>
                          <p className="text-sm text-gray-700">{insight.recommendation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Export Section */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Exportar Reportes</h3>
            <p className="text-sm text-gray-600">Descarga tus datos de analytics en diferentes formatos</p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500">
              <Download className="w-4 h-4 inline mr-2" />
              CSV
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500">
              <Download className="w-4 h-4 inline mr-2" />
              PDF
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <Download className="w-4 h-4 inline mr-2" />
              Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
