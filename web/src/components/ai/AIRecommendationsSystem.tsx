'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Calendar, 
  MapPin, 
  Clock, 
  Star, 
  Heart, 
  Eye, 
  Share2, 
  Bookmark, 
  Filter, 
  Search, 
  RefreshCw, 
  Settings, 
  Zap, 
  Target, 
  Lightbulb, 
  BarChart3, 
  PieChart, 
  Activity, 
  Award, 
  Crown, 
  Fire, 
  Lightning, 
  Rocket, 
  Compass, 
  Globe, 
  Hash, 
  Tag,
  X,
  Check,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AIRecommendation {
  id: string;
  type: 'event' | 'tribe' | 'user' | 'content' | 'activity';
  title: string;
  description: string;
  confidence: number;
  reason: string;
  data: any;
  category: string;
  tags: string[];
  priority: 'high' | 'medium' | 'low';
  isPersonalized: boolean;
  createdAt: string;
  expiresAt?: string;
  actions: {
    label: string;
    action: string;
    url?: string;
    icon: string;
  }[];
}

interface RecommendationFilters {
  type: 'all' | 'event' | 'tribe' | 'user' | 'content' | 'activity';
  category: string;
  priority: 'all' | 'high' | 'medium' | 'low';
  confidence: number;
  search: string;
  tags: string[];
  personalized: boolean;
}

interface UserPreferences {
  interests: string[];
  location: {
    lat: number;
    lng: number;
    radius: number;
  };
  availability: {
    days: string[];
    timeSlots: string[];
  };
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  socialPreferences: {
    groupSize: 'small' | 'medium' | 'large';
    activityLevel: 'low' | 'medium' | 'high';
    privacy: 'public' | 'friends' | 'private';
  };
  learningGoals: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
}

interface AIInsights {
  userBehavior: {
    mostActiveHours: string[];
    preferredCategories: string[];
    socialConnections: number;
    engagementRate: number;
  };
  trends: {
    popularTopics: string[];
    emergingInterests: string[];
    seasonalPatterns: string[];
  };
  opportunities: {
    skillGaps: string[];
    networkingChances: string[];
    learningPaths: string[];
  };
}

export default function AIRecommendationsSystem() {
  const [selectedRecommendation, setSelectedRecommendation] = useState<AIRecommendation | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [activeTab, setActiveTab] = useState<'recommendations' | 'insights' | 'preferences'>('recommendations');
  
  const [filters, setFilters] = useState<RecommendationFilters>({
    type: 'all',
    category: '',
    priority: 'all',
    confidence: 0.5,
    search: '',
    tags: [],
    personalized: true,
  });
  
  const [preferences, setPreferences] = useState<UserPreferences>({
    interests: [],
    location: {
      lat: 0,
      lng: 0,
      radius: 50,
    },
    availability: {
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      timeSlots: ['morning', 'afternoon', 'evening', 'night'],
    },
    budget: {
      min: 0,
      max: 1000,
      currency: 'USD',
    },
    socialPreferences: {
      groupSize: 'medium',
      activityLevel: 'medium',
      privacy: 'public',
    },
    learningGoals: [],
    skillLevel: 'beginner',
  });

  const queryClient = useQueryClient();

  // Fetch AI recommendations
  const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ['ai-recommendations', filters],
    queryFn: () => api.aiRecommendations.getRecommendations(filters),
  });

  // Fetch user preferences
  const { data: fetchedPreferences } = useQuery({
    queryKey: ['user-preferences'],
    queryFn: () => api.aiRecommendations.getUserPreferences(),
  });

  // Fetch AI insights
  const { data: insights } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: () => api.aiRecommendations.getInsights(),
  });

  // Mutations
  const updatePreferencesMutation = useMutation({
    mutationFn: (newPreferences: UserPreferences) => api.aiRecommendations.updatePreferences(newPreferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
      toast.success('Preferencias actualizadas');
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: (data: { recommendationId: string; feedback: 'positive' | 'negative' | 'neutral'; reason?: string }) => 
      api.aiRecommendations.provideFeedback(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations'] });
      toast.success('Feedback enviado');
    },
  });

  const dismissRecommendationMutation = useMutation({
    mutationFn: (recommendationId: string) => api.aiRecommendations.dismissRecommendation(recommendationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations'] });
      toast.success('Recomendación descartada');
    },
  });

  // Update local state when fetched data changes
  useEffect(() => {
    if (fetchedPreferences) {
      setPreferences(fetchedPreferences);
    }
  }, [fetchedPreferences]);

  // Handle recommendation actions
  const handleRecommendationAction = async (recommendation: AIRecommendation, action: string) => {
    switch (action) {
      case 'view':
        if (recommendation.actions.find(a => a.action === 'view')?.url) {
          window.location.href = recommendation.actions.find(a => a.action === 'view')!.url!;
        }
        break;
      case 'join':
        // Handle join action
        break;
      case 'follow':
        // Handle follow action
        break;
      case 'bookmark':
        // Handle bookmark action
        break;
      case 'share':
        // Handle share action
        break;
    }
  };

  // Handle feedback
  const handleFeedback = async (recommendationId: string, feedback: 'positive' | 'negative' | 'neutral', reason?: string) => {
    await feedbackMutation.mutateAsync({ recommendationId, feedback, reason });
  };

  // Handle dismiss
  const handleDismiss = async (recommendationId: string) => {
    await dismissRecommendationMutation.mutateAsync(recommendationId);
  };

  // Get recommendation type icon
  const getRecommendationTypeIcon = (type: string) => {
    switch (type) {
      case 'event': return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'tribe': return <Users className="w-5 h-5 text-green-600" />;
      case 'user': return <User className="w-5 h-5 text-purple-600" />;
      case 'content': return <FileText className="w-5 h-5 text-orange-600" />;
      case 'activity': return <Activity className="w-5 h-5 text-red-600" />;
      default: return <Sparkles className="w-5 h-5 text-gray-600" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Update preferences
  const handlePreferencesUpdate = (newPreferences: Partial<UserPreferences>) => {
    const updatedPreferences = { ...preferences, ...newPreferences };
    setPreferences(updatedPreferences);
    updatePreferencesMutation.mutate(updatedPreferences);
  };

  // Filter recommendations based on current filters
  const filteredRecommendations = recommendations?.filter(rec => {
    if (filters.type !== 'all' && rec.type !== filters.type) return false;
    if (filters.category && rec.category !== filters.category) return false;
    if (filters.priority !== 'all' && rec.priority !== filters.priority) return false;
    if (filters.confidence > 0 && rec.confidence < filters.confidence) return false;
    if (filters.search && !rec.title.toLowerCase().includes(filters.search.toLowerCase()) && 
        !rec.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.tags.length > 0 && !filters.tags.some(tag => rec.tags.includes(tag))) return false;
    if (filters.personalized && !rec.isPersonalized) return false;
    
    return true;
  });

  if (recommendationsLoading) {
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
        <div className="flex items-center space-x-3 mb-2">
          <Brain className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">🤖 Sistema de Recomendaciones IA</h1>
        </div>
        <p className="text-gray-600">Descubre eventos, tribus y conexiones personalizadas con inteligencia artificial</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'recommendations'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Sparkles className="w-4 h-4 inline mr-2" />
              Recomendaciones
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'insights'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Insights
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'preferences'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Preferencias
            </button>
          </nav>
        </div>
      </div>

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div>
          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filtros y Búsqueda</h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
              >
                <Filter className="w-4 h-4" />
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Basic Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Buscar recomendaciones..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">Todos</option>
                    <option value="event">Eventos</option>
                    <option value="tribe">Tribus</option>
                    <option value="user">Usuarios</option>
                    <option value="content">Contenido</option>
                    <option value="activity">Actividades</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">Todas</option>
                    <option value="high">Alta</option>
                    <option value="medium">Media</option>
                    <option value="low">Baja</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confianza mínima</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={filters.confidence}
                    onChange={(e) => setFilters(prev => ({ ...prev, confidence: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                  <span className="text-sm text-gray-500">{Math.round(filters.confidence * 100)}%</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Personalizadas</label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.personalized}
                      onChange={(e) => setFilters(prev => ({ ...prev, personalized: e.target.checked }))}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Solo personalizadas</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Recommendations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecommendations?.map((recommendation) => (
              <div
                key={recommendation.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getRecommendationTypeIcon(recommendation.type)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(recommendation.priority)}`}>
                        {recommendation.priority}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleFeedback(recommendation.id, 'positive')}
                        className="p-1 text-green-600 hover:text-green-800"
                        title="Me gusta"
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDismiss(recommendation.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Descartar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-1">{recommendation.title}</h3>
                  <p className="text-sm text-gray-600">{recommendation.description}</p>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Confidence Score */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">Confianza IA:</span>
                    <span className={`text-sm font-medium ${getConfidenceColor(recommendation.confidence)}`}>
                      {Math.round(recommendation.confidence * 100)}%
                    </span>
                  </div>

                  {/* Reason */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">¿Por qué te lo recomendamos?</p>
                    <p className="text-sm text-gray-700">{recommendation.reason}</p>
                  </div>

                  {/* Tags */}
                  {recommendation.tags.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {recommendation.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                        {recommendation.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{recommendation.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-2">
                    {recommendation.actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecommendationAction(recommendation, action.action)}
                        className="w-full px-3 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{new Date(recommendation.createdAt).toLocaleDateString()}</span>
                    {recommendation.isPersonalized && (
                      <span className="flex items-center space-x-1 text-purple-600">
                        <Sparkles className="w-3 h-3" />
                        <span>Personalizada</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {(!filteredRecommendations || filteredRecommendations.length === 0) && (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay recomendaciones</h3>
              <p className="text-gray-600">
                {filters.search || filters.type !== 'all'
                  ? 'No hay recomendaciones que coincidan con los filtros aplicados'
                  : 'Estamos analizando tus preferencias para generar recomendaciones personalizadas'
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && insights && (
        <div className="space-y-6">
          {/* User Behavior */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Comportamiento del Usuario</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Horas más activas</p>
                <p className="text-lg font-semibold text-blue-900">
                  {insights.userBehavior.mostActiveHours.join(', ')}
                </p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Hash className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Categorías preferidas</p>
                <p className="text-lg font-semibold text-green-900">
                  {insights.userBehavior.preferredCategories.join(', ')}
                </p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Conexiones sociales</p>
                <p className="text-lg font-semibold text-purple-900">
                  {insights.userBehavior.socialConnections}
                </p>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Activity className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Tasa de engagement</p>
                <p className="text-lg font-semibold text-orange-900">
                  {Math.round(insights.userBehavior.engagementRate * 100)}%
                </p>
              </div>
            </div>
          </div>

          {/* Trends */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Tendencias</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">🔥 Temas Populares</h4>
                <div className="space-y-2">
                  {insights.trends.popularTopics.map((topic, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{topic}</span>
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">🚀 Intereses Emergentes</h4>
                <div className="space-y-2">
                  {insights.trends.emergingInterests.map((interest, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{interest}</span>
                      <Rocket className="w-4 h-4 text-blue-600" />
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">🌍 Patrones Estacionales</h4>
                <div className="space-y-2">
                  {insights.trends.seasonalPatterns.map((pattern, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{pattern}</span>
                      <Globe className="w-4 h-4 text-purple-600" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Opportunities */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Oportunidades</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">🎯 Brechas de Habilidades</h4>
                <div className="space-y-2">
                  {insights.opportunities.skillGaps.map((skill, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{skill}</span>
                      <Target className="w-4 h-4 text-red-600" />
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">🤝 Oportunidades de Networking</h4>
                <div className="space-y-2">
                  {insights.opportunities.networkingChances.map((chance, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{chance}</span>
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">📚 Rutas de Aprendizaje</h4>
                <div className="space-y-2">
                  {insights.opportunities.learningPaths.map((path, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{path}</span>
                      <Lightning className="w-4 h-4 text-yellow-600" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Configuración de Preferencias</h3>
            
            {/* Interests */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Intereses</h4>
              <div className="flex flex-wrap gap-2">
                {preferences.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center space-x-2"
                  >
                    <span>{interest}</span>
                    <button
                      onClick={() => handlePreferencesUpdate({
                        interests: preferences.interests.filter((_, i) => i !== index)
                      })}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={() => {
                    const newInterest = prompt('Agregar nuevo interés:');
                    if (newInterest && !preferences.interests.includes(newInterest)) {
                      handlePreferencesUpdate({
                        interests: [...preferences.interests, newInterest]
                      });
                    }
                  }}
                  className="px-3 py-1 border-2 border-dashed border-purple-300 text-purple-600 rounded-full text-sm hover:border-purple-400 hover:text-purple-700"
                >
                  <Plus className="w-3 h-3 inline mr-1" />
                  Agregar
                </button>
              </div>
            </div>

            {/* Location */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Ubicación</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Radio de búsqueda (km)</label>
                  <input
                    type="number"
                    value={preferences.location.radius}
                    onChange={(e) => handlePreferencesUpdate({
                      location: { ...preferences.location, radius: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Disponibilidad</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Días de la semana</label>
                  <div className="space-y-2">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                      <label key={day} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={preferences.availability.days.includes(day)}
                          onChange={(e) => {
                            const newDays = e.target.checked
                              ? [...preferences.availability.days, day]
                              : preferences.availability.days.filter(d => d !== day);
                            handlePreferencesUpdate({
                              availability: { ...preferences.availability, days: newDays }
                            });
                          }}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700 capitalize">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Horarios</label>
                  <div className="space-y-2">
                    {['morning', 'afternoon', 'evening', 'night'].map((time) => (
                      <label key={time} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={preferences.availability.timeSlots.includes(time)}
                          onChange={(e) => {
                            const newSlots = e.target.checked
                              ? [...preferences.availability.timeSlots, time]
                              : preferences.availability.timeSlots.filter(t => t !== time);
                            handlePreferencesUpdate({
                              availability: { ...preferences.availability, timeSlots: newSlots }
                            });
                          }}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700 capitalize">{time}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Budget */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Presupuesto</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mínimo</label>
                  <input
                    type="number"
                    value={preferences.budget.min}
                    onChange={(e) => handlePreferencesUpdate({
                      budget: { ...preferences.budget, min: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Máximo</label>
                  <input
                    type="number"
                    value={preferences.budget.max}
                    onChange={(e) => handlePreferencesUpdate({
                      budget: { ...preferences.budget, max: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                  <select
                    value={preferences.budget.currency}
                    onChange={(e) => handlePreferencesUpdate({
                      budget: { ...preferences.budget, currency: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Social Preferences */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Preferencias Sociales</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tamaño del grupo</label>
                  <select
                    value={preferences.socialPreferences.groupSize}
                    onChange={(e) => handlePreferencesUpdate({
                      socialPreferences: { ...preferences.socialPreferences, groupSize: e.target.value as any }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="small">Pequeño (2-5)</option>
                    <option value="medium">Mediano (6-15)</option>
                    <option value="large">Grande (16+)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nivel de actividad</label>
                  <select
                    value={preferences.socialPreferences.activityLevel}
                    onChange={(e) => handlePreferencesUpdate({
                      socialPreferences: { ...preferences.socialPreferences, activityLevel: e.target.value as any }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="low">Bajo</option>
                    <option value="medium">Medio</option>
                    <option value="high">Alto</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Privacidad</label>
                  <select
                    value={preferences.socialPreferences.privacy}
                    onChange={(e) => handlePreferencesUpdate({
                      socialPreferences: { ...preferences.socialPreferences, privacy: e.target.value as any }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="public">Público</option>
                    <option value="friends">Amigos</option>
                    <option value="private">Privado</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Learning Goals */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Metas de Aprendizaje</h4>
              <div className="flex flex-wrap gap-2">
                {preferences.learningGoals.map((goal, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center space-x-2"
                  >
                    <span>{goal}</span>
                    <button
                      onClick={() => handlePreferencesUpdate({
                        learningGoals: preferences.learningGoals.filter((_, i) => i !== index)
                      })}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={() => {
                    const newGoal = prompt('Agregar nueva meta de aprendizaje:');
                    if (newGoal && !preferences.learningGoals.includes(newGoal)) {
                      handlePreferencesUpdate({
                        learningGoals: [...preferences.learningGoals, newGoal]
                      });
                    }
                  }}
                  className="px-3 py-1 border-2 border-dashed border-blue-300 text-blue-600 rounded-full text-sm hover:border-blue-400 hover:text-blue-700"
                >
                  <Plus className="w-3 h-3 inline mr-1" />
                  Agregar
                </button>
              </div>
            </div>

            {/* Skill Level */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Nivel de Habilidad</h4>
              <select
                value={preferences.skillLevel}
                onChange={(e) => handlePreferencesUpdate({
                  skillLevel: e.target.value as any
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="beginner">Principiante</option>
                <option value="intermediate">Intermedio</option>
                <option value="advanced">Avanzado</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
