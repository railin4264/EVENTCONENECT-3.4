import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  Users, 
  Calendar,
  Award,
  Crown,
  Flame as Fire,
  Zap as Lightning,
  Diamond,
  Gem,
  CheckCircle,
  Gift,
  Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

// ===== ACHIEVEMENT TYPES =====
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'event' | 'social' | 'exploration' | 'mastery' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  points: number;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: Date;
  reward?: {
    type: 'xp' | 'badge' | 'title' | 'feature';
    value: string | number;
  };
}

export interface UserStats {
  level: number;
  xp: number;
  xpToNext: number;
  totalPoints: number;
  achievementsUnlocked: number;
  totalAchievements: number;
  streak: number;
  rank: string;
  badges: string[];
}

// ===== ACHIEVEMENT DATA =====
const achievements: Achievement[] = [
  // Event Achievements
  {
    id: 'first-event',
    title: 'Primer Evento',
    description: 'Crea tu primer evento en EventConnect',
    icon: <Calendar className="w-6 h-6" />,
    category: 'event',
    rarity: 'common',
    points: 10,
    progress: 1,
    maxProgress: 1,
    unlocked: true,
    unlockedAt: new Date(),
    reward: { type: 'xp', value: 100 }
  },
  {
    id: 'event-master',
    title: 'Maestro de Eventos',
    description: 'Crea 50 eventos exitosos',
    icon: <Trophy className="w-6 h-6" />,
    category: 'event',
    rarity: 'epic',
    points: 500,
    progress: 23,
    maxProgress: 50,
    unlocked: false,
    reward: { type: 'badge', value: 'Event Master' }
  },
  {
    id: 'trending-event',
    title: 'Evento Viral',
    description: 'Un evento tuyo alcanza 1000+ vistas',
    icon: <Fire className="w-6 h-6" />,
    category: 'event',
    rarity: 'rare',
    points: 200,
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    reward: { type: 'title', value: 'Viral Creator' }
  },

  // Social Achievements
  {
    id: 'social-butterfly',
    title: 'Mariposa Social',
    description: 'Conecta con 100 usuarios',
    icon: <Users className="w-6 h-6" />,
    category: 'social',
    rarity: 'rare',
    points: 300,
    progress: 67,
    maxProgress: 100,
    unlocked: false,
    reward: { type: 'xp', value: 500 }
  },
  {
    id: 'community-leader',
    title: 'Líder Comunitario',
    description: 'Organiza 10 eventos con 100+ asistentes',
    icon: <Crown className="w-6 h-6" />,
    category: 'social',
    rarity: 'legendary',
    points: 1000,
    progress: 3,
    maxProgress: 10,
    unlocked: false,
    reward: { type: 'badge', value: 'Community Leader' }
  },

  // Exploration Achievements
  {
    id: 'explorer',
    title: 'Explorador',
    description: 'Visita eventos en 5 ciudades diferentes',
    icon: <Target className="w-6 h-6" />,
    category: 'exploration',
    rarity: 'common',
    points: 150,
    progress: 2,
    maxProgress: 5,
    unlocked: false,
    reward: { type: 'xp', value: 200 }
  },
  {
    id: 'world-traveler',
    title: 'Viajero Mundial',
    description: 'Participa en eventos en 20 países',
    icon: <Diamond className="w-6 h-6" />,
    category: 'exploration',
    rarity: 'mythic',
    points: 2000,
    progress: 7,
    maxProgress: 20,
    unlocked: false,
    reward: { type: 'feature', value: 'Global Access' }
  },

  // Mastery Achievements
  {
    id: 'event-organizer',
    title: 'Organizador de Eventos',
    description: 'Organiza eventos por 30 días consecutivos',
    icon: <Lightning className="w-6 h-6" />,
    category: 'mastery',
    rarity: 'epic',
    points: 800,
    progress: 15,
    maxProgress: 30,
    unlocked: false,
    reward: { type: 'badge', value: 'Event Organizer' }
  },
  {
    id: 'ultimate-master',
    title: 'Maestro Supremo',
    description: 'Desbloquea todos los logros de una categoría',
    icon: <Gem className="w-6 h-6" />,
    category: 'mastery',
    rarity: 'mythic',
    points: 5000,
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    reward: { type: 'title', value: 'Ultimate Master' }
  }
];

// ===== ACHIEVEMENT CARD COMPONENT =====
const AchievementCard: React.FC<{
  achievement: Achievement;
}> = ({ achievement }) => {
  const getRarityStyles = () => {
    switch (achievement.rarity) {
      case 'common':
        return 'border-gray-400 bg-gray-400/10';
      case 'rare':
        return 'border-blue-400 bg-blue-400/10';
      case 'epic':
        return 'border-purple-400 bg-purple-400/10';
      case 'legendary':
        return 'border-yellow-400 bg-yellow-400/10';
      case 'mythic':
        return 'border-red-400 bg-red-400/10';
      default:
        return 'border-gray-400 bg-gray-400/10';
    }
  };

  // Removed unused getRarityColor helper

  const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <Card 
        variant={achievement.unlocked ? "neon" : "glass"}
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          achievement.unlocked && "ring-2 ring-cyan-400/50"
        )}
      >
        {/* Rarity Border */}
        <div className={cn(
          "absolute top-0 left-0 right-0 h-1",
          getRarityStyles()
        )} />

        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            {/* Icon */}
            <div className={cn(
              "flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center",
              achievement.unlocked 
                ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white"
                : "bg-white/10 text-gray-400"
            )}>
              {achievement.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-bold text-white">
                  {achievement.title}
                </h3>
                <span className={cn(
                  "text-xs font-medium px-2 py-1 rounded-full",
                  getRarityStyles()
                )}>
                  {achievement.rarity.toUpperCase()}
                </span>
              </div>

              <p className="text-gray-300 mb-3">
                {achievement.description}
              </p>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Progreso</span>
                  <span className="text-white">
                    {achievement.progress} / {achievement.maxProgress}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </div>
              </div>

              {/* Points and Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-white font-medium">
                    {achievement.points} pts
                  </span>
                </div>

                {achievement.unlocked ? (
                  <div className="flex items-center space-x-2 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Desbloqueado</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">
                    {Math.round(progressPercentage)}% completado
                  </span>
                )}
              </div>

              {/* Reward Info */}
              {achievement.reward && (
                <div className="mt-3 p-2 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Gift className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm text-cyan-400">
                      Recompensa: {achievement.reward.value}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        {/* Unlock Animation */}
        {achievement.unlocked && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="absolute top-2 right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
          >
            <CheckCircle className="w-5 h-5 text-white" />
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

// ===== LEADERBOARD COMPONENT =====
const Leaderboard: React.FC<{
  users: Array<{
    id: string;
    name: string;
    avatar: string;
    level: number;
    xp: number;
    rank: number;
    achievements: number;
  }>;
}> = ({ users }) => {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Trophy className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-orange-400" />;
    return <span className="text-lg font-bold text-white">{rank}</span>;
  };

  return (
    <Card variant="glass" className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Crown className="w-5 h-5 text-yellow-400" />
          <span>Leaderboard</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center space-x-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200"
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                {getRankIcon(user.rank)}
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                {user.name.charAt(0)}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white truncate">
                  {user.name}
                </h4>
                <p className="text-sm text-gray-300">
                  Nivel {user.level} • {user.achievements} logros
                </p>
              </div>

              {/* XP */}
              <div className="text-right">
                <div className="text-lg font-bold text-cyan-400">
                  {user.xp.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">XP</div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// ===== PROGRESS TRACKER COMPONENT =====
const ProgressTracker: React.FC<{
  stats: UserStats;
}> = ({ stats }) => {
  const levelProgress = (stats.xp / stats.xpToNext) * 100;

  return (
    <Card variant="glass" className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-cyan-400" />
          <span>Tu Progreso</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Level Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-medium">
              Nivel {stats.level}
            </span>
            <span className="text-cyan-400 font-medium">
              {stats.xp} / {stats.xpToNext} XP
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {stats.achievementsUnlocked}
            </div>
            <div className="text-sm text-gray-300">Logros</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {stats.totalPoints}
            </div>
            <div className="text-sm text-gray-300">Puntos</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-2xl font-bold text-orange-400 mb-1">
              {stats.streak}
            </div>
            <div className="text-sm text-gray-300">Racha</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {stats.rank}
            </div>
            <div className="text-sm text-gray-300">Rango</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ===== MAIN ACHIEVEMENT SYSTEM COMPONENT =====
export const AchievementSystem: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');

  // Sample user stats
  const userStats: UserStats = {
    level: 15,
    xp: 12500,
    xpToNext: 15000,
    totalPoints: 8500,
    achievementsUnlocked: 8,
    totalAchievements: achievements.length,
    streak: 7,
    rank: 'Plata',
    badges: ['Event Creator', 'Social Butterfly', 'Explorer']
  };

  // Sample leaderboard data
  const leaderboardUsers = [
    { id: '1', name: 'Alex Johnson', avatar: '', level: 25, xp: 45000, rank: 1, achievements: 15 },
    { id: '2', name: 'Maria Garcia', avatar: '', level: 22, xp: 38000, rank: 2, achievements: 14 },
    { id: '3', name: 'Carlos Rodriguez', avatar: '', level: 20, xp: 32000, rank: 3, achievements: 12 },
    { id: '4', name: 'Ana Martinez', avatar: '', level: 18, xp: 28000, rank: 4, achievements: 11 },
    { id: '5', name: 'Luis Fernandez', avatar: '', level: 16, xp: 24000, rank: 5, achievements: 10 },
  ];

  const categories = [
    { id: 'all', label: 'Todos', icon: <Star className="w-4 h-4" /> },
    { id: 'event', label: 'Eventos', icon: <Calendar className="w-4 h-4" /> },
    { id: 'social', label: 'Social', icon: <Users className="w-4 h-4" /> },
    { id: 'exploration', label: 'Exploración', icon: <Target className="w-4 h-4" /> },
    { id: 'mastery', label: 'Maestría', icon: <Trophy className="w-4 h-4" /> },
    { id: 'special', label: 'Especiales', icon: <Zap className="w-4 h-4" /> },
  ];

  const rarities = [
    { id: 'all', label: 'Todas', color: 'text-gray-400' },
    { id: 'common', label: 'Común', color: 'text-gray-400' },
    { id: 'rare', label: 'Rara', color: 'text-blue-400' },
    { id: 'epic', label: 'Épica', color: 'text-purple-400' },
    { id: 'legendary', label: 'Legendaria', color: 'text-yellow-400' },
    { id: 'mythic', label: 'Mítica', color: 'text-red-400' },
  ];

  const filteredAchievements = achievements.filter(achievement => {
    const categoryMatch = selectedCategory === 'all' || achievement.category === selectedCategory;
    const rarityMatch = selectedRarity === 'all' || achievement.rarity === selectedRarity;
    return categoryMatch && rarityMatch;
  });

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
            Sistema de Gamificación
          </h1>
          <p className="text-gray-300">
            Desbloquea logros, sube de nivel y compite en el leaderboard
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Progress & Stats */}
          <div className="space-y-6">
            <ProgressTracker stats={userStats} />
            <Leaderboard users={leaderboardUsers} />
          </div>

          {/* Right Column - Achievements */}
          <div className="lg:col-span-2">
            {/* Filters */}
            <div className="mb-6 space-y-4">
              {/* Category Filter */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Categorías</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={cn(
                        "flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200",
                        selectedCategory === category.id
                          ? "bg-cyan-500 text-white"
                          : "bg-white/10 text-gray-300 hover:bg-white/20"
                      )}
                    >
                      {category.icon}
                      <span>{category.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rarity Filter */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Rareza</h3>
                <div className="flex flex-wrap gap-2">
                  {rarities.map((rarity) => (
                    <button
                      key={rarity.id}
                      onClick={() => setSelectedRarity(rarity.id)}
                      className={cn(
                        "px-3 py-2 rounded-lg transition-all duration-200",
                        selectedRarity === rarity.id
                          ? "bg-purple-500 text-white"
                          : "bg-white/10 text-gray-300 hover:bg-white/20"
                      )}
                    >
                      {rarity.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                />
              ))}
            </div>

            {filteredAchievements.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  No se encontraron logros
                </h3>
                <p className="text-gray-400">
                  Intenta ajustar los filtros para ver más logros
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementSystem;