'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  TrendingUp, 
  Heart, 
  MapPin, 
  Calendar, 
  Users, 
  Star,
  RefreshCw,
  Filter,
  Clock,
  ThumbsUp,
  ThumbsDown,
  X
} from 'lucide-react';

interface RecommendationEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  date: Date;
  location: string;
  image?: string;
  attendeeCount: number;
  price: number;
  currency: string;
  rating: number;
  tags: string[];
  hostName: string;
  matchScore: number;
  reasons: string[];
}

interface RecommendationEngine {
  type: 'trending' | 'personalized' | 'location' | 'social' | 'time' | 'weather';
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const RECOMMENDATION_ENGINES: RecommendationEngine[] = [
  {
    type: 'personalized',
    title: 'Para Ti',
    description: 'Basado en tus intereses y actividad',
    icon: <Heart className="w-5 h-5" />,
    color: 'from-pink-500 to-rose-500'
  },
  {
    type: 'trending',
    title: 'Tendencias',
    description: 'Lo más popular en tu área',
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    type: 'location',
    title: 'Cerca de Ti',
    description: 'Eventos en tu ubicación',
    icon: <MapPin className="w-5 h-5" />,
    color: 'from-green-500 to-emerald-500'
  },
  {
    type: 'social',
    title: 'Tu Red Social',
    description: 'Eventos de tus amigos y tribus',
    icon: <Users className="w-5 h-5" />,
    color: 'from-purple-500 to-violet-500'
  },
  {
    type: 'time',
    title: 'Momento Perfecto',
    description: 'Basado en tu horario libre',
    icon: <Clock className="w-5 h-5" />,
    color: 'from-orange-500 to-amber-500'
  },
  {
    type: 'weather',
    title: 'Según el Clima',
    description: 'Eventos ideales para el clima actual',
    icon: <Sparkles className="w-5 h-5" />,
    color: 'from-indigo-500 to-blue-500'
  }
];

// Datos simulados para demostración
const MOCK_RECOMMENDATIONS: Record<string, RecommendationEvent[]> = {
  personalized: [
    {
      id: '1',
      title: 'Workshop de React Hooks Avanzados',
      description: 'Aprende patrones avanzados de React con expertos de la industria',
      category: 'technology',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      location: 'Madrid Tech Hub',
      attendeeCount: 45,
      price: 65,
      currency: 'EUR',
      rating: 4.8,
      tags: ['React', 'JavaScript', 'Frontend'],
      hostName: 'María González',
      matchScore: 95,
      reasons: ['Coincide con tu interés en tecnología', 'Similar a eventos que has asistido', 'Organizado por un desarrollador verificado']
    },
    {
      id: '2',
      title: 'Meetup de Fotografía Urbana',
      description: 'Explora la ciudad mientras capturas momentos únicos',
      category: 'photography',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      location: 'Centro Histórico',
      attendeeCount: 28,
      price: 0,
      currency: 'EUR',
      rating: 4.6,
      tags: ['Fotografía', 'Arte', 'Urbano'],
      hostName: 'Carlos Rodríguez',
      matchScore: 87,
      reasons: ['Te gusta la fotografía según tu perfil', 'Evento gratuito como prefieres', 'Ubicación conveniente']
    }
  ],
  trending: [
    {
      id: '3',
      title: 'Festival de Música Electrónica 2024',
      description: 'Los mejores DJs internacionales en una noche épica',
      category: 'music',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      location: 'Palacio de Deportes',
      attendeeCount: 2500,
      price: 45,
      currency: 'EUR',
      rating: 4.9,
      tags: ['Música', 'Festival', 'Electrónica'],
      hostName: 'Music Events Madrid',
      matchScore: 78,
      reasons: ['Muy popular esta semana', 'Gran demanda de entradas', 'Valoraciones excelentes']
    }
  ],
  location: [
    {
      id: '4',
      title: 'Clase de Yoga al Amanecer',
      description: 'Comienza tu día con energía positiva en el parque',
      category: 'health',
      date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      location: 'Parque del Retiro',
      attendeeCount: 15,
      price: 12,
      currency: 'EUR',
      rating: 4.7,
      tags: ['Yoga', 'Bienestar', 'Mañana'],
      hostName: 'Ana López',
      matchScore: 82,
      reasons: ['A solo 5 minutos de tu ubicación', 'Horario compatible con tu rutina', 'Grupo pequeño e íntimo']
    }
  ],
  social: [
    {
      id: '5',
      title: 'Reunión de Desarrolladores Frontend',
      description: 'Networking y charlas técnicas con la comunidad',
      category: 'technology',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      location: 'Coworking Space Central',
      attendeeCount: 60,
      price: 0,
      currency: 'EUR',
      rating: 4.5,
      tags: ['Networking', 'Frontend', 'Comunidad'],
      hostName: 'Tribu Desarrolladores',
      matchScore: 91,
      reasons: ['Organizado por tu tribu "Desarrolladores Frontend"', '3 amigos van a asistir', 'Tema de tu interés profesional']
    }
  ],
  time: [
    {
      id: '6',
      title: 'Taller de Cocina Italiana',
      description: 'Aprende a hacer pasta fresca como un auténtico chef',
      category: 'food',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      location: 'Escuela Culinaria',
      attendeeCount: 12,
      price: 35,
      currency: 'EUR',
      rating: 4.8,
      tags: ['Cocina', 'Italia', 'Hands-on'],
      hostName: 'Chef Giuseppe',
      matchScore: 85,
      reasons: ['Coincide con tu tiempo libre del sábado', 'Duración perfecta (2 horas)', 'No interfiere con otros compromisos']
    }
  ],
  weather: [
    {
      id: '7',
      title: 'Picnic y Juegos al Aire Libre',
      description: 'Disfruta del buen tiempo con actividades divertidas',
      category: 'outdoors',
      date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      location: 'Casa de Campo',
      attendeeCount: 35,
      price: 8,
      currency: 'EUR',
      rating: 4.4,
      tags: ['Outdoor', 'Picnic', 'Juegos'],
      hostName: 'Grupo Aventureros',
      matchScore: 76,
      reasons: ['Perfecto para el clima soleado previsto', 'Actividad al aire libre ideal', 'Temperatura óptima (22°C)']
    }
  ]
};

interface PersonalizedRecommendationsProps {
  userId: string;
  userInterests: string[];
  userLocation?: { lat: number; lng: number };
}

export default function PersonalizedRecommendations({ 
  userId, 
  userInterests, 
  userLocation 
}: PersonalizedRecommendationsProps) {
  const [activeEngine, setActiveEngine] = useState<string>('personalized');
  const [recommendations, setRecommendations] = useState<RecommendationEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, 'like' | 'dislike'>>({});
  const [dismissedEvents, setDismissedEvents] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadRecommendations(activeEngine);
  }, [activeEngine, userId]);

  const loadRecommendations = async (engineType: string) => {
    setIsLoading(true);
    
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // En producción, esto sería una llamada real a la API
    const engineRecommendations = MOCK_RECOMMENDATIONS[engineType] || [];
    
    setRecommendations(engineRecommendations);
    setIsLoading(false);
  };

  const handleFeedback = async (eventId: string, type: 'like' | 'dislike') => {
    setFeedback(prev => ({ ...prev, [eventId]: type }));
    
    // Enviar feedback a la API para mejorar recomendaciones
    try {
      await fetch('/api/recommendations/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          eventId,
          feedback: type,
          engine: activeEngine
        })
      });
    } catch (error) {
      console.error('Error sending feedback:', error);
    }
  };

  const handleDismiss = (eventId: string) => {
    setDismissedEvents(prev => new Set([...prev, eventId]));
  };

  const refreshRecommendations = () => {
    loadRecommendations(activeEngine);
  };

  const filteredRecommendations = recommendations.filter(
    event => !dismissedEvents.has(event.id)
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Recomendaciones Personalizadas
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Descubre eventos perfectos para ti con nuestra IA avanzada
        </p>
      </div>

      {/* Recommendation Engines */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {RECOMMENDATION_ENGINES.map((engine) => (
          <button
            key={engine.type}
            onClick={() => setActiveEngine(engine.type)}
            className={`p-4 rounded-xl transition-all duration-300 ${
              activeEngine === engine.type
                ? 'bg-white dark:bg-gray-800 shadow-lg ring-2 ring-blue-500 transform scale-105'
                : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r ${engine.color} flex items-center justify-center text-white`}>
              {engine.icon}
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              {engine.title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {engine.description}
            </p>
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {filteredRecommendations.length} recomendaciones
          </span>
        </div>
        <button
          onClick={refreshRecommendations}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Recommendations Grid */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <motion.div
            key={activeEngine}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredRecommendations.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Event Image */}
                <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-600 relative">
                  <div className="absolute top-3 left-3">
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      {event.matchScore}% match
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 flex space-x-1">
                    <button
                      onClick={() => handleFeedback(event.id, 'like')}
                      className={`p-2 rounded-full transition-colors ${
                        feedback[event.id] === 'like'
                          ? 'bg-green-500 text-white'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleFeedback(event.id, 'dislike')}
                      className={`p-2 rounded-full transition-colors ${
                        feedback[event.id] === 'dislike'
                          ? 'bg-red-500 text-white'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDismiss(event.id)}
                      className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Event Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                      {event.category}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">{event.rating}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {event.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  {/* Event Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{event.date.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>{event.attendeeCount} asistentes</span>
                    </div>
                  </div>

                  {/* Recommendation Reasons */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ¿Por qué te recomendamos esto?
                    </h4>
                    <ul className="space-y-1">
                      {event.reasons.slice(0, 2).map((reason, index) => (
                        <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-start space-x-2">
                          <Sparkles className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105">
                    {event.price === 0 ? 'Unirse Gratis' : `Unirse por €${event.price}`}
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!isLoading && filteredRecommendations.length === 0 && (
        <div className="text-center py-12">
          <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No hay recomendaciones disponibles
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Prueba con un motor de recomendación diferente o actualiza la página
          </p>
        </div>
      )}
    </div>
  );
}

