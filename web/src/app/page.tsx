'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { 
  Calendar, Users, FileText, Star, TrendingUp, MapPin, Clock, 
  Heart, Share2, Bookmark, Eye, Zap, Award, Globe, Lock,
  Plus, Search, Filter, ArrowRight, Bell, Settings, User
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import EventCreateForm from '@/components/forms/EventCreateForm';
import TribeCreateForm from '@/components/forms/TribeCreateForm';
import PostCreateForm from '@/components/forms/PostCreateForm';
import ReviewCreateForm from '@/components/forms/ReviewCreateForm';
import OAuthButtons from '@/components/auth/OAuthButtons';
import GamificationDashboard from '@/components/gamification/GamificationDashboard';
import WatchlistSystem from '@/components/watchlist/WatchlistSystem';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import SocialFeed from '@/components/social/SocialFeed';
import RealTimeNotifications from '@/components/notifications/RealTimeNotifications';
import RealTimeChat from '@/components/chat/RealTimeChat';
import AIRecommendationsSystem from '@/components/ai/AIRecommendationsSystem';

interface DashboardStats {
  totalEvents: number;
  totalTribes: number;
  totalPosts: number;
  totalUsers: number;
  totalReviews: number;
  activeEvents: number;
  trendingTopics: string[];
  recentActivity: any[];
}

export default function DashboardPage() {
  const [showEventForm, setShowEventForm] = useState(false);
  const [showTribeForm, setShowTribeForm] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch dashboard data
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.analytics.getDashboardStats(),
  });

  // Fetch recent events
  const { data: recentEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['recent-events'],
    queryFn: () => api.events.getEvents({ limit: 5, sort: 'recent' }),
  });

  // Fetch trending tribes
  const { data: trendingTribes, isLoading: tribesLoading } = useQuery({
    queryKey: ['trending-tribes'],
    queryFn: () => api.tribes.getTribes({ sort: 'popular', limit: 5 }),
  });

  // Fetch recent posts
  const { data: recentPosts, isLoading: postsLoading } = useQuery({
    queryKey: ['recent-posts'],
    queryFn: () => api.posts.getPosts({ limit: 5, sort: 'recent' }),
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    if (diffInHours < 48) return 'Ayer';
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'event':
        setShowEventForm(true);
        break;
      case 'tribe':
        setShowTribeForm(true);
        break;
      case 'post':
        setShowPostForm(true);
        break;
      case 'review':
        setShowReviewForm(true);
        break;
    }
  };

  if (statsLoading || eventsLoading || tribesLoading || postsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">🏠 Dashboard</h1>
            <p className="text-xl text-gray-600">Bienvenido a EventConnect - Tu centro de conexiones</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
              <Bell className="w-6 h-6" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
              <Settings className="w-6 h-6" />
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => handleQuickAction('event')}
            className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-3"
          >
            <Calendar className="w-8 h-8" />
            <div className="text-left">
              <p className="font-semibold">Crear Evento</p>
              <p className="text-blue-100 text-sm">Organiza algo increíble</p>
            </div>
          </button>

          <button
            onClick={() => handleQuickAction('tribe')}
            className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-3"
          >
            <Users className="w-8 h-8" />
            <div className="text-left">
              <p className="font-semibold">Crear Tribu</p>
              <p className="text-green-100 text-sm">Conecta personas</p>
            </div>
          </button>

          <button
            onClick={() => handleQuickAction('post')}
            className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-3"
          >
            <FileText className="w-8 h-8" />
            <div className="text-left">
              <p className="font-semibold">Crear Post</p>
              <p className="text-purple-100 text-sm">Comparte contenido</p>
            </div>
          </button>

          <button
            onClick={() => handleQuickAction('review')}
            className="p-6 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 flex items-center space-x-3"
          >
            <Star className="w-8 h-8" />
            <div className="text-left">
              <p className="font-semibold">Escribir Review</p>
              <p className="text-yellow-100 text-sm">Comparte tu opinión</p>
            </div>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Eventos</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalEvents || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+12% este mes</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tribus</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalTribes || 0}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+8% este mes</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalPosts || 0}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+15% este mes</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <User className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+20% este mes</span>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Vista General', icon: Eye },
              { id: 'events', label: 'Eventos', icon: Calendar },
              { id: 'tribes', label: 'Tribus', icon: Users },
              { id: 'posts', label: 'Posts', icon: FileText },
              { id: 'gamification', label: 'Gamificación', icon: Award },
              { id: 'ai', label: 'IA & Recomendaciones', icon: Zap },
              { id: 'social', label: 'Feed Social', icon: Heart },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
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

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Recent Events */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Eventos Recientes</h3>
                  <a href="/events" className="text-blue-600 hover:text-blue-700 flex items-center space-x-1">
                    <span>Ver todos</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentEvents?.slice(0, 3).map((event) => (
                    <div key={event.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-3 mb-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <h4 className="font-semibold text-gray-900">{event.title}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{formatDate(event.startDate)}</span>
                        <span>{event.currentAttendees} asistentes</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending Tribes */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Tribus en Tendencia</h3>
                  <a href="/tribes" className="text-blue-600 hover:text-blue-700 flex items-center space-x-1">
                    <span>Ver todas</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trendingTribes?.slice(0, 3).map((tribe) => (
                    <div key={tribe.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-3 mb-2">
                        <Users className="w-5 h-5 text-green-600" />
                        <h4 className="font-semibold text-gray-900">{tribe.name}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{tribe.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{tribe.memberCount} miembros</span>
                        <span className="capitalize">{tribe.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Posts */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Posts Recientes</h3>
                  <a href="/posts" className="text-blue-600 hover:text-blue-700 flex items-center space-x-1">
                    <span>Ver todos</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentPosts?.slice(0, 3).map((post) => (
                    <div key={post.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-3 mb-2">
                        <FileText className="w-5 h-5 text-purple-600" />
                        <h4 className="font-semibold text-gray-900">{post.title}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{post.content}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{formatDate(post.createdAt)}</span>
                        <span>{post.likes} me gusta</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Gestión de Eventos</h3>
                <button
                  onClick={() => setShowEventForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Plus className="w-4 h-4 mr-2 inline" />
                  Crear Evento
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentEvents?.map((event) => (
                  <div key={event.id} className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">{event.title}</h4>
                    <p className="text-sm text-gray-600 mb-4">{event.description}</p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{event.venue || event.location.city}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>{event.currentAttendees}/{event.maxAttendees} asistentes</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tribes Tab */}
          {activeTab === 'tribes' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Gestión de Tribus</h3>
                <button
                  onClick={() => setShowTribeForm(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <Plus className="w-4 h-4 mr-2 inline" />
                  Crear Tribu
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingTribes?.map((tribe) => (
                  <div key={tribe.id} className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">{tribe.name}</h4>
                    <p className="text-sm text-gray-600 mb-4">{tribe.description}</p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>{tribe.memberCount}/{tribe.maxMembers} miembros</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="capitalize">{tribe.category}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {tribe.isPrivate ? (
                          <Lock className="w-4 h-4" />
                        ) : (
                          <Globe className="w-4 h-4" />
                        )}
                        <span>{tribe.isPrivate ? 'Privada' : 'Pública'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Gestión de Posts</h3>
                <button
                  onClick={() => setShowPostForm(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <Plus className="w-4 h-4 mr-2 inline" />
                  Crear Post
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentPosts?.map((post) => (
                  <div key={post.id} className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">{post.title}</h4>
                    <p className="text-sm text-gray-600 mb-4">{post.content}</p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <span className="capitalize">{post.type}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Heart className="w-4 h-4" />
                        <span>{post.likes} me gusta</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gamification Tab */}
          {activeTab === 'gamification' && <GamificationDashboard />}

          {/* AI Tab */}
          {activeTab === 'ai' && <AIRecommendationsSystem />}

          {/* Social Tab */}
          {activeTab === 'social' && <SocialFeed />}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && <AnalyticsDashboard />}
        </div>
      </div>

      {/* Modals */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Crear Nuevo Evento</h2>
                <button
                  onClick={() => setShowEventForm(false)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  ✕
                </button>
              </div>
              <EventCreateForm
                onSuccess={() => {
                  setShowEventForm(false);
                  toast.success('Evento creado correctamente');
                }}
                onCancel={() => setShowEventForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {showTribeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Crear Nueva Tribu</h2>
                <button
                  onClick={() => setShowTribeForm(false)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  ✕
                </button>
              </div>
              <TribeCreateForm
                onSuccess={() => {
                  setShowTribeForm(false);
                  toast.success('Tribu creada correctamente');
                }}
                onCancel={() => setShowTribeForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {showPostForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Crear Nuevo Post</h2>
                <button
                  onClick={() => setShowPostForm(false)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  ✕
                </button>
              </div>
              <PostCreateForm
                onSuccess={() => {
                  setShowPostForm(false);
                  toast.success('Post creado correctamente');
                }}
                onCancel={() => setShowPostForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Escribir Nuevo Review</h2>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  ✕
                </button>
              </div>
              <ReviewCreateForm
                onSuccess={() => {
                  setShowReviewForm(false);
                  toast.success('Review creado correctamente');
                }}
                onCancel={() => setShowReviewForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

