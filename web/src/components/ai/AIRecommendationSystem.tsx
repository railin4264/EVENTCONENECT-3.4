import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Sparkles, 
  Target, 
  Users, 
  Calendar,
  MapPin,
  Clock,
  Star,
  TrendingUp,
  Heart,
  Eye,
  Share,
  Search,
  Filter,
  Zap,
  Lightbulb,
  Rocket,
  Magic,
  Cpu,
  Network,
  Globe
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

// ===== AI RECOMMENDATION TYPES =====
export interface AIEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  time: string;
  price: string;
  image: string;
  confidence: number;
  reason: string;
  tags: string[];
  attendees: number;
  rating: number;
  trending: boolean;
}

export interface UserPreference {
  category: string;
  weight: number;
  lastInteraction: Date;
  frequency: number;
}

export interface AIInsight {
  type: 'trend' | 'pattern' | 'suggestion' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  icon: React.ReactNode;
  action?: string;
  data?: any;
}

// ===== AI RECOMMENDATION DATA =====
const aiEvents: AIEvent[] = [
  {
    id: '1',
    title: 'Tech Meetup Barcelona',
    description: 'Reunión de desarrolladores y emprendedores tech',
    category: 'Tecnología',
    location: 'Barcelona, España',
    date: '2024-02-15',
    time: '19:00',
    price: 'Gratis',
    image: '/api/placeholder/400/200',
    confidence: 0.95,
    reason: 'Basado en tu interés en tecnología y ubicación',
    tags: ['tech', 'networking', 'startup', 'barcelona'],
    attendees: 150,
    rating: 4.8,
    trending: true
  },
  {
    id: '2',
    title: 'Festival de Música Urbana',
    description: 'Celebración de la cultura urbana y hip-hop',
    category: 'Música',
    location: 'Madrid, España',
    date: '2024-02-20',
    time: '20:00',
    price: '€25',
    image: '/api/placeholder/400/200',
    confidence: 0.87,
    reason: 'Similar a eventos que has disfrutado anteriormente',
    tags: ['música', 'hip-hop', 'cultura urbana', 'madrid'],
    attendees: 500,
    rating: 4.6,
    trending: true
  },
  {
    id: '3',
    title: 'Workshop de Arte Digital',
    description: 'Aprende técnicas de arte digital y NFT',
    category: 'Arte',
    location: 'Valencia, España',
    date: '2024-02-18',
    time: '16:00',
    price: '€45',
    image: '/api/placeholder/400/200',
    confidence: 0.78,
    reason: 'Nuevo interés detectado en tu perfil',
    tags: ['arte', 'digital', 'nft', 'workshop', 'valencia'],
    attendees: 30,
    rating: 4.9,
    trending: false
  },
  {
    id: '4',
    title: 'Networking Empresarial',
    description: 'Conecta con líderes empresariales',
    category: 'Negocios',
    location: 'Bilbao, España',
    date: '2024-02-22',
    time: '18:30',
    price: '€60',
    image: '/api/placeholder/400/200',
    confidence: 0.82,
    reason: 'Alineado con tu perfil profesional',
    tags: ['negocios', 'networking', 'liderazgo', 'bilbao'],
    attendees: 80,
    rating: 4.7,
    trending: false
  }
];

const aiInsights: AIInsight[] = [
  {
    type: 'trend',
    title: 'Tecnología en Auge',
    description: 'Los eventos de tecnología han aumentado 45% este mes',
    confidence: 0.92,
    icon: <TrendingUp className="w-5 h-5" />
  },
  {
    type: 'pattern',
    title: 'Preferencia por Eventos Nocturnos',
    description: 'Prefieres eventos después de las 18:00 (87% de tus asistencias)',
    confidence: 0.87,
    icon: <Clock className="w-5 h-5" />
  },
  {
    type: 'suggestion',
    title: 'Explora Nuevas Categorías',
    description: 'Podrías disfrutar eventos de arte y cultura',
    confidence: 0.75,
    icon: <Lightbulb className="w-5 h-5" />
  },
  {
    type: 'prediction',
    title: 'Evento Recomendado',
    description: 'Tech Meetup Barcelona tiene 95% de probabilidad de gustarte',
    confidence: 0.95,
    icon: <Rocket className="w-5 h-5" />
  }
];

// ===== AI EVENT CARD COMPONENT =====
const AIEventCard: React.FC<{
  event: AIEvent;
  onInteract?: (event: AIEvent, action: 'view' | 'like' | 'share') => void;
}> = ({ event, onInteract }) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-400';
    if (confidence >= 0.8) return 'text-blue-400';
    if (confidence >= 0.7) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return 'Muy Alta';
    if (confidence >= 0.8) return 'Alta';
    if (confidence >= 0.7) return 'Media';
    return 'Baja';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <Card variant="glass" className="relative overflow-hidden group">
        {/* AI Confidence Badge */}
        <div className="absolute top-4 right-4 z-10">
          <div className={cn(
            "px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm",
            getConfidenceColor(event.confidence),
            "bg-black/20 border border-current/20"
          )}>
            <div className="flex items-center space-x-1">
              <Brain className="w-3 h-3" />
              <span>{getConfidenceLabel(event.confidence)}</span>
            </div>
          </div>
        </div>

        {/* Event Image */}
        <div className="relative h-48 overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 to-purple-600/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Trending Badge */}
          {event.trending && (
            <div className="absolute top-4 left-4">
              <div className="px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-medium rounded-full flex items-center space-x-1">
                <TrendingUp className="w-3 h-3" />
                <span>Trending</span>
              </div>
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute bottom-4 left-4">
            <div className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-lg">
              {event.category}
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          {/* Title and Rating */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors duration-200">
              {event.title}
            </h3>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-white font-medium">{event.rating}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-300 mb-4 line-clamp-2">
            {event.description}
          </p>

          {/* AI Reason */}
          <div className="mb-4 p-3 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg border border-cyan-400/20">
            <div className="flex items-start space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-cyan-400 font-medium mb-1">¿Por qué te recomendamos esto?</p>
                <p className="text-sm text-gray-300">{event.reason}</p>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">{event.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">{event.date}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">{event.time}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">{event.attendees} asistentes</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {event.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-white/10 text-white text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold text-cyan-400">
              {event.price}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onInteract?.(event, 'view')}
                className="text-gray-400 hover:text-white"
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onInteract?.(event, 'like')}
                className="text-gray-400 hover:text-red-400"
              >
                <Heart className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onInteract?.(event, 'share')}
                className="text-gray-400 hover:text-cyan-400"
              >
                <Share className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ===== AI INSIGHT CARD COMPONENT =====
const AIInsightCard: React.FC<{
  insight: AIInsight;
  onAction?: (insight: AIInsight) => void;
}> = ({ insight, onAction }) => {
  const getInsightStyles = () => {
    switch (insight.type) {
      case 'trend':
        return 'border-green-400/30 bg-green-400/10';
      case 'pattern':
        return 'border-blue-400/30 bg-blue-400/10';
      case 'suggestion':
        return 'border-purple-400/30 bg-purple-400/10';
      case 'prediction':
        return 'border-orange-400/30 bg-orange-400/10';
      default:
        return 'border-gray-400/30 bg-gray-400/10';
    }
  };

  const getInsightIconColor = () => {
    switch (insight.type) {
      case 'trend':
        return 'text-green-400';
      case 'pattern':
        return 'text-blue-400';
      case 'suggestion':
        return 'text-purple-400';
      case 'prediction':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <Card variant="glass" className={cn("border", getInsightStyles())}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", getInsightStyles())}>
              <div className={getInsightIconColor()}>
                {insight.icon}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-white mb-1">
                {insight.title}
              </h4>
              <p className="text-sm text-gray-300 mb-2">
                {insight.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  Confianza: {Math.round(insight.confidence * 100)}%
                </div>
                {insight.action && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAction?.(insight)}
                    className="text-cyan-400 hover:text-cyan-300"
                  >
                    {insight.action}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ===== AI SEARCH COMPONENT =====
const AISearch: React.FC<{
  onSearch: (query: string, filters: any) => void;
}> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    location: 'all',
    date: 'all',
    price: 'all'
  });

  const handleSearch = () => {
    onSearch(query, filters);
  };

  return (
    <Card variant="glass" className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <span>Búsqueda Inteligente con IA</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Input
            placeholder="Describe el evento que buscas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pr-12"
            variant="glass"
          />
          <Button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            size="sm"
            variant="neon"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {/* AI Suggestions */}
        <div className="space-y-2">
          <p className="text-sm text-gray-400">Sugerencias de IA:</p>
          <div className="flex flex-wrap gap-2">
            {['Eventos de tecnología en Barcelona', 'Música urbana este fin de semana', 'Workshops de arte digital', 'Networking empresarial'].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setQuery(suggestion)}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-sm rounded-full transition-all duration-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
          >
            <option value="all">Todas las categorías</option>
            <option value="tech">Tecnología</option>
            <option value="music">Música</option>
            <option value="art">Arte</option>
            <option value="business">Negocios</option>
          </select>

          <select
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
          >
            <option value="all">Todas las ubicaciones</option>
            <option value="barcelona">Barcelona</option>
            <option value="madrid">Madrid</option>
            <option value="valencia">Valencia</option>
            <option value="bilbao">Bilbao</option>
          </select>

          <select
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
          >
            <option value="all">Todas las fechas</option>
            <option value="today">Hoy</option>
            <option value="weekend">Este fin de semana</option>
            <option value="month">Este mes</option>
          </select>

          <select
            value={filters.price}
            onChange={(e) => setFilters({ ...filters, price: e.target.value })}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
          >
            <option value="all">Todos los precios</option>
            <option value="free">Gratis</option>
            <option value="low">€0-25</option>
            <option value="medium">€25-50</option>
            <option value="high">€50+</option>
          </select>
        </div>
      </CardContent>
    </Card>
  );
};

// ===== MAIN AI RECOMMENDATION SYSTEM COMPONENT =====
export const AIRecommendationSystem: React.FC = () => {
  const [searchResults, setSearchResults] = useState<AIEvent[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (query: string, filters: any) => {
    setIsSearching(true);
    // Simulate AI search
    setTimeout(() => {
      setSearchResults(aiEvents.filter(event => 
        event.title.toLowerCase().includes(query.toLowerCase()) ||
        event.description.toLowerCase().includes(query.toLowerCase())
      ));
      setIsSearching(false);
    }, 1000);
  };

  const handleEventInteract = (event: AIEvent, action: 'view' | 'like' | 'share') => {
    console.log(`User ${action}ed event:`, event.title);
    // Here you would send this interaction to your AI system for learning
  };

  const handleInsightAction = (insight: AIInsight) => {
    console.log('Insight action:', insight);
    // Handle insight actions
  };

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
            Sistema de IA y Recomendaciones
          </h1>
          <p className="text-gray-300">
            Descubre eventos personalizados con inteligencia artificial
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - AI Search & Insights */}
          <div className="space-y-6">
            <AISearch onSearch={handleSearch} />
            
            {/* AI Insights */}
            <Card variant="glass" className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  <span>Insights de IA</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiInsights.map((insight, index) => (
                  <AIInsightCard
                    key={index}
                    insight={insight}
                    onAction={handleInsightAction}
                  />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - AI Recommendations */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                Recomendaciones Personalizadas
              </h2>
              <p className="text-gray-300">
                Eventos seleccionados especialmente para ti por nuestra IA
              </p>
            </div>

            {isSearching ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                  <Brain className="w-8 h-8 text-cyan-400 animate-pulse" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  IA analizando tus preferencias...
                </h3>
                <p className="text-gray-400">
                  Buscando los mejores eventos para ti
                </p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {searchResults.map((event) => (
                  <AIEventCard
                    key={event.id}
                    event={event}
                    onInteract={handleEventInteract}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {aiEvents.map((event) => (
                  <AIEventCard
                    key={event.id}
                    event={event}
                    onInteract={handleEventInteract}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIRecommendationSystem;