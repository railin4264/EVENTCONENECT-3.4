'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  Star, 
  Trophy, 
  Medal, 
  Crown, 
  Zap, 
  Heart, 
  Calendar, 
  Users, 
  MessageCircle,
  MapPin,
  Camera,
  Sparkles,
  Target,
  Flame
} from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'events' | 'social' | 'engagement' | 'special';
  requirement: string;
  progress?: number;
  maxProgress?: number;
  earned: boolean;
  earnedAt?: Date;
  points: number;
}

const BADGE_DEFINITIONS: Badge[] = [
  // Event Badges
  {
    id: 'first_event',
    name: 'Primer Paso',
    description: 'Asiste a tu primer evento',
    icon: <Calendar className="w-6 h-6" />,
    color: 'from-green-400 to-green-600',
    rarity: 'common',
    category: 'events',
    requirement: 'Asistir a 1 evento',
    earned: false,
    points: 50
  },
  {
    id: 'event_explorer',
    name: 'Explorador de Eventos',
    description: 'Asiste a 10 eventos diferentes',
    icon: <MapPin className="w-6 h-6" />,
    color: 'from-blue-400 to-blue-600',
    rarity: 'rare',
    category: 'events',
    requirement: 'Asistir a 10 eventos',
    progress: 3,
    maxProgress: 10,
    earned: false,
    points: 200
  },
  {
    id: 'event_master',
    name: 'Maestro de Eventos',
    description: 'Asiste a 50 eventos',
    icon: <Crown className="w-6 h-6" />,
    color: 'from-purple-400 to-purple-600',
    rarity: 'epic',
    category: 'events',
    requirement: 'Asistir a 50 eventos',
    progress: 3,
    maxProgress: 50,
    earned: false,
    points: 1000
  },
  
  // Social Badges
  {
    id: 'social_butterfly',
    name: 'Mariposa Social',
    description: 'Únete a 5 tribus diferentes',
    icon: <Users className="w-6 h-6" />,
    color: 'from-pink-400 to-pink-600',
    rarity: 'common',
    category: 'social',
    requirement: 'Unirse a 5 tribus',
    progress: 2,
    maxProgress: 5,
    earned: false,
    points: 100
  },
  {
    id: 'conversation_starter',
    name: 'Iniciador de Conversaciones',
    description: 'Envía 100 mensajes en chats',
    icon: <MessageCircle className="w-6 h-6" />,
    color: 'from-indigo-400 to-indigo-600',
    rarity: 'rare',
    category: 'social',
    requirement: 'Enviar 100 mensajes',
    progress: 47,
    maxProgress: 100,
    earned: false,
    points: 300
  },
  {
    id: 'community_leader',
    name: 'Líder Comunitario',
    description: 'Crea una tribu con más de 50 miembros',
    icon: <Trophy className="w-6 h-6" />,
    color: 'from-yellow-400 to-yellow-600',
    rarity: 'epic',
    category: 'social',
    requirement: 'Crear tribu con 50+ miembros',
    earned: false,
    points: 750
  },
  
  // Engagement Badges
  {
    id: 'early_bird',
    name: 'Madrugador',
    description: 'Asiste a 5 eventos antes de las 9 AM',
    icon: <Zap className="w-6 h-6" />,
    color: 'from-orange-400 to-orange-600',
    rarity: 'rare',
    category: 'engagement',
    requirement: 'Asistir a eventos matutinos',
    progress: 1,
    maxProgress: 5,
    earned: false,
    points: 250
  },
  {
    id: 'photo_memories',
    name: 'Capturador de Momentos',
    description: 'Sube 25 fotos a eventos',
    icon: <Camera className="w-6 h-6" />,
    color: 'from-teal-400 to-teal-600',
    rarity: 'common',
    category: 'engagement',
    requirement: 'Subir 25 fotos',
    progress: 8,
    maxProgress: 25,
    earned: false,
    points: 150
  },
  
  // Special Badges
  {
    id: 'founding_member',
    name: 'Miembro Fundador',
    description: 'Uno de los primeros 1000 usuarios',
    icon: <Sparkles className="w-6 h-6" />,
    color: 'from-gradient-start to-gradient-end',
    rarity: 'legendary',
    category: 'special',
    requirement: 'Registro temprano',
    earned: true,
    earnedAt: new Date('2024-01-15'),
    points: 2000
  },
  {
    id: 'streak_master',
    name: 'Racha Imparable',
    description: 'Asiste a eventos 7 días consecutivos',
    icon: <Flame className="w-6 h-6" />,
    color: 'from-red-400 to-red-600',
    rarity: 'epic',
    category: 'engagement',
    requirement: 'Racha de 7 días',
    progress: 3,
    maxProgress: 7,
    earned: false,
    points: 500
  }
];

interface BadgeSystemProps {
  userId: string;
  showAll?: boolean;
}

export default function BadgeSystem({ userId, showAll = false }: BadgeSystemProps) {
  const [badges, setBadges] = useState<Badge[]>(BADGE_DEFINITIONS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [newlyEarned, setNewlyEarned] = useState<Badge[]>([]);

  const categories = [
    { id: 'all', name: 'Todos', icon: <Star className="w-4 h-4" /> },
    { id: 'events', name: 'Eventos', icon: <Calendar className="w-4 h-4" /> },
    { id: 'social', name: 'Social', icon: <Users className="w-4 h-4" /> },
    { id: 'engagement', name: 'Participación', icon: <Heart className="w-4 h-4" /> },
    { id: 'special', name: 'Especiales', icon: <Crown className="w-4 h-4" /> }
  ];

  const rarityConfig = {
    common: { border: 'border-gray-300', bg: 'bg-gray-50', text: 'text-gray-600' },
    rare: { border: 'border-blue-300', bg: 'bg-blue-50', text: 'text-blue-600' },
    epic: { border: 'border-purple-300', bg: 'bg-purple-50', text: 'text-purple-600' },
    legendary: { border: 'border-yellow-300', bg: 'bg-yellow-50', text: 'text-yellow-600' }
  };

  const filteredBadges = badges.filter(badge => 
    selectedCategory === 'all' || badge.category === selectedCategory
  );

  const earnedBadges = badges.filter(badge => badge.earned);
  const totalPoints = earnedBadges.reduce((sum, badge) => sum + badge.points, 0);

  useEffect(() => {
    // Simular verificación de nuevos badges
    const checkForNewBadges = () => {
      // Aquí iría la lógica real para verificar nuevos badges
      // Por ahora simulamos
    };

    checkForNewBadges();
  }, [userId]);

  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge);
  };

  const closeBadgeModal = () => {
    setSelectedBadge(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Sistema de Logros
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Desbloquea badges participando en la comunidad
        </p>
        
        {/* Stats */}
        <div className="flex justify-center space-x-8 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{earnedBadges.length}</div>
            <div className="text-sm text-gray-500">Badges Ganados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{totalPoints}</div>
            <div className="text-sm text-gray-500">Puntos Totales</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round((earnedBadges.length / badges.length) * 100)}%
            </div>
            <div className="text-sm text-gray-500">Completado</div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              selectedCategory === category.id
                ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-2 border-purple-300'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border-2 border-transparent'
            }`}
          >
            {category.icon}
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBadges.map((badge) => (
          <motion.div
            key={badge.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            onClick={() => handleBadgeClick(badge)}
            className={`relative cursor-pointer group ${
              badge.earned ? 'opacity-100' : 'opacity-60'
            }`}
          >
            <div className={`
              p-6 rounded-xl border-2 transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-lg
              ${rarityConfig[badge.rarity].border}
              ${rarityConfig[badge.rarity].bg}
              ${badge.earned ? 'ring-2 ring-green-300' : ''}
            `}>
              {/* Badge Icon */}
              <div className={`
                w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${badge.color} 
                flex items-center justify-center text-white shadow-lg
                ${badge.earned ? 'animate-pulse' : 'grayscale'}
              `}>
                {badge.icon}
              </div>

              {/* Badge Info */}
              <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white mb-2">
                {badge.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-3">
                {badge.description}
              </p>

              {/* Progress Bar */}
              {badge.progress !== undefined && badge.maxProgress && !badge.earned && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{badge.progress}/{badge.maxProgress}</span>
                    <span>{Math.round((badge.progress / badge.maxProgress) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`bg-gradient-to-r ${badge.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${(badge.progress / badge.maxProgress) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Points */}
              <div className="flex justify-between items-center">
                <span className={`text-xs font-medium ${rarityConfig[badge.rarity].text}`}>
                  {badge.rarity.toUpperCase()}
                </span>
                <span className="text-sm font-bold text-yellow-600">
                  +{badge.points} pts
                </span>
              </div>

              {/* Earned Status */}
              {badge.earned && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <Award className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeBadgeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Badge Icon */}
              <div className={`
                w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r ${selectedBadge.color} 
                flex items-center justify-center text-white shadow-lg
              `}>
                {selectedBadge.icon}
              </div>

              {/* Badge Info */}
              <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
                {selectedBadge.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
                {selectedBadge.description}
              </p>

              {/* Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-500">Rareza:</span>
                  <span className={`font-medium ${rarityConfig[selectedBadge.rarity].text}`}>
                    {selectedBadge.rarity.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Puntos:</span>
                  <span className="font-medium text-yellow-600">+{selectedBadge.points}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Requisito:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {selectedBadge.requirement}
                  </span>
                </div>
                {selectedBadge.earnedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Obtenido:</span>
                    <span className="font-medium text-green-600">
                      {selectedBadge.earnedAt.toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Progress */}
              {selectedBadge.progress !== undefined && selectedBadge.maxProgress && !selectedBadge.earned && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>Progreso</span>
                    <span>{selectedBadge.progress}/{selectedBadge.maxProgress}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`bg-gradient-to-r ${selectedBadge.color} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${(selectedBadge.progress / selectedBadge.maxProgress) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={closeBadgeModal}
                className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

