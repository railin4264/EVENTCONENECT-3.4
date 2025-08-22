'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrophyIcon,
  StarIcon,
  FireIcon,
  SparklesIcon,
  ChevronRightIcon,
  GiftIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { GamificationService, ACHIEVEMENTS, USER_LEVELS } from '@/services/gamificationService';
import { User, Achievement } from '@/types';
import { useAuth } from '@/hooks/useAuth';

// ===== INTERFACES =====
interface UserProgressProps {
  user: User;
  showDetailed?: boolean;
  className?: string;
}

// ===== COMPONENTE DE PROGRESO PRINCIPAL =====
export const UserProgress: React.FC<UserProgressProps> = ({ 
  user, 
  showDetailed = false,
  className = '' 
}) => {
  const [showAchievements, setShowAchievements] = useState(false);
  const [recentAchievement, setRecentAchievement] = useState<Achievement | null>(null);
  
  const stats = GamificationService.getUserStats(user);
  const availableAchievements = GamificationService.getAvailableAchievements(user);
  
  // Simular logro reciente para demo
  useEffect(() => {
    if (user.recentAchievements && user.recentAchievements.length > 0) {
      const latest = user.recentAchievements[user.recentAchievements.length - 1];
      if (latest.unlockedAt && Date.now() - latest.unlockedAt.getTime() < 5000) {
        setRecentAchievement(latest);
        setTimeout(() => setRecentAchievement(null), 5000);
      }
    }
  }, [user.recentAchievements]);

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLevelEmoji = (level: number) => {
    if (level < 3) return '🌱';
    if (level < 5) return '🌿';
    if (level < 10) return '🌳';
    if (level < 15) return '🦋';
    if (level < 20) return '🦅';
    return '👑';
  };

  return (
    <div className={className}>
      {/* Progreso principal */}
      <motion.div 
        className="bg-gradient-to-r from-primary-500 to-purple-600 p-6 rounded-xl text-white shadow-lg"
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">{getLevelEmoji(stats.level.level)}</span>
              <div>
                <h3 className="font-bold text-xl">Nivel {stats.level.level}</h3>
                <p className="text-primary-100 text-sm">{stats.level.title}</p>
              </div>
            </div>
            
            {stats.pointsToNextLevel > 0 ? (
              <p className="text-primary-100 text-sm">
                {stats.pointsToNextLevel} puntos para siguiente nivel
              </p>
            ) : (
              <p className="text-yellow-200 text-sm font-medium">
                ¡Nivel máximo alcanzado! 🎉
              </p>
            )}
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold">{stats.totalPoints}</div>
            <div className="text-primary-200 text-sm">puntos totales</div>
          </div>
        </div>
        
        {/* Barra de progreso */}
        {stats.pointsToNextLevel > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-primary-100">
              <span>Progreso al siguiente nivel</span>
              <span>{stats.progressPercent}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <motion.div 
                className="bg-white h-full rounded-full shadow-sm"
                initial={{ width: 0 }}
                animate={{ width: `${stats.progressPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}
        
        {/* Logros recientes */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-3">
            <TrophyIcon className="w-5 h-5 text-yellow-300" />
            <span className="text-sm">
              {stats.achievementsUnlocked}/{stats.totalAchievements} logros
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAchievements(true)}
            className="text-white hover:bg-white/10"
          >
            Ver todos
            <ChevronRightIcon className="w-4 h-4 ml-1" />
          </Button>
        </div>
        
        {/* Últimos logros desbloqueados */}
        {user.recentAchievements && user.recentAchievements.length > 0 && (
          <div className="flex items-center mt-3 space-x-2">
            <span className="text-sm text-primary-200">Recientes:</span>
            {user.recentAchievements.slice(-3).map(achievement => (
              <motion.span 
                key={achievement.id}
                className="text-lg"
                whileHover={{ scale: 1.2 }}
                title={achievement.title}
              >
                {achievement.icon}
              </motion.span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Logros próximos a desbloquear */}
      {showDetailed && availableAchievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Próximos logros
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableAchievements.slice(0, 4).map((achievement) => (
              <Card key={achievement.id} className="p-4">
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl opacity-60">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-medium text-sm">{achievement.title}</h5>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(achievement.rarity)}`}>
                          {achievement.rarity}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-xs mb-2">
                        {achievement.description}
                      </p>
                      
                      {achievement.progress && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Progreso</span>
                            <span>{achievement.progress.current}/{achievement.progress.target}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <motion.div
                              className="bg-primary-500 h-full rounded-full"
                              initial={{ width: 0 }}
                              animate={{ 
                                width: `${(achievement.progress.current / achievement.progress.target) * 100}%` 
                              }}
                              transition={{ duration: 0.8 }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Modal de logros */}
      <Modal
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
        title="Tus Logros"
        size="lg"
      >
        <div className="space-y-6">
          {/* Estadísticas generales */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-primary-600">{stats.achievementsUnlocked}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Desbloqueados</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.totalPoints}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Puntos totales</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.completionRate}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completado</div>
            </div>
          </div>

          {/* Logros por categoría */}
          {(['events', 'social', 'creation', 'engagement'] as const).map(category => {
            const categoryAchievements = GamificationService.getAchievementsByCategory(category);
            const unlockedInCategory = categoryAchievements.filter(a => 
              user.recentAchievements?.some(ua => ua.id === a.id)
            );

            return (
              <div key={category}>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 capitalize">
                  {category === 'events' ? 'Eventos' : 
                   category === 'social' ? 'Social' :
                   category === 'creation' ? 'Creación' : 'Participación'}
                  <span className="text-gray-500 text-sm ml-2">
                    ({unlockedInCategory.length}/{categoryAchievements.length})
                  </span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categoryAchievements.map(achievement => {
                    const isUnlocked = user.recentAchievements?.some(a => a.id === achievement.id);
                    const progress = GamificationService.getAchievementProgress(user, achievement.id);
                    
                    return (
                      <div
                        key={achievement.id}
                        className={`p-3 rounded-lg border transition-all ${
                          isUnlocked 
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`text-xl ${isUnlocked ? '' : 'opacity-40'}`}>
                            {achievement.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className={`font-medium text-sm ${
                                isUnlocked ? 'text-green-800 dark:text-green-200' : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {achievement.title}
                              </h5>
                              {isUnlocked && (
                                <span className="text-green-600 text-xs">✓</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                              {achievement.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className={`px-2 py-1 rounded-full text-xs ${getRarityColor(achievement.rarity)}`}>
                                {achievement.points} pts
                              </span>
                              {!isUnlocked && progress.target > 1 && (
                                <span className="text-xs text-gray-500">
                                  {progress.current}/{progress.target}
                                </span>
                              )}
                            </div>
                            
                            {/* Barra de progreso para logros en progreso */}
                            {!isUnlocked && progress.target > 1 && progress.current > 0 && (
                              <div className="mt-2">
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                                  <motion.div
                                    className="bg-primary-500 h-full rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(progress.current / progress.target) * 100}%` }}
                                    transition={{ duration: 0.8 }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Modal>

      {/* Animación de logro reciente */}
      <AnimatePresence>
        {recentAchievement && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <Card className="p-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-xl">
              <CardContent>
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: 2 }}
                    className="text-3xl"
                  >
                    {recentAchievement.icon}
                  </motion.div>
                  <div>
                    <h4 className="font-bold text-sm">¡Nuevo logro!</h4>
                    <p className="text-xs opacity-90">{recentAchievement.title}</p>
                    <p className="text-xs opacity-75">+{recentAchievement.points} puntos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ===== COMPONENTE COMPACTO DE NIVEL =====
export const CompactUserLevel: React.FC<{ user: User; onClick?: () => void }> = ({ 
  user, 
  onClick 
}) => {
  const stats = GamificationService.getUserStats(user);
  
  return (
    <motion.button
      onClick={onClick}
      className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
        {stats.level.level}
      </div>
      
      <div className="flex-1 text-left">
        <div className="font-medium text-sm text-gray-900 dark:text-white">
          {stats.level.title}
        </div>
        <div className="text-xs text-gray-500">
          {stats.totalPoints} puntos
        </div>
      </div>
      
      <div className="flex items-center space-x-1">
        {user.recentAchievements?.slice(-2).map(achievement => (
          <span key={achievement.id} className="text-sm">
            {achievement.icon}
          </span>
        ))}
        <ChevronRightIcon className="w-4 h-4 text-gray-400" />
      </div>
    </motion.button>
  );
};

// ===== COMPONENTE DE LEADERBOARD =====
export const Leaderboard: React.FC<{ users: User[]; currentUser: User }> = ({ 
  users, 
  currentUser 
}) => {
  const leaderboard = GamificationService.getLeaderboard(users);
  const currentUserRank = leaderboard.findIndex(u => u.id === currentUser.id) + 1;
  
  return (
    <Card className="p-6">
      <CardTitle className="flex items-center mb-4">
        <TrophyIcon className="w-5 h-5 mr-2 text-yellow-500" />
        Leaderboard
      </CardTitle>
      
      <CardContent>
        <div className="space-y-3">
          {leaderboard.slice(0, 10).map((user, index) => {
            const stats = GamificationService.getUserStats(user);
            const isCurrentUser = user.id === currentUser.id;
            
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isCurrentUser 
                    ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-500 text-white' :
                  index === 1 ? 'bg-gray-400 text-white' :
                  index === 2 ? 'bg-orange-600 text-white' :
                  'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}>
                  {index + 1}
                </div>
                
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium">
                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                  </span>
                </div>
                
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900 dark:text-white">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-xs text-gray-500">
                    Nivel {stats.level.level} • {stats.level.title}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-primary-600">{stats.totalPoints}</div>
                  <div className="text-xs text-gray-500">puntos</div>
                </div>
              </motion.div>
            );
          })}
          
          {/* Posición del usuario actual si no está en top 10 */}
          {currentUserRank > 10 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
              <div className="flex items-center space-x-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {currentUserRank}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900 dark:text-white">
                    Tu posición
                  </div>
                  <div className="text-xs text-gray-500">
                    {GamificationService.getUserStats(currentUser).totalPoints} puntos
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// ===== COMPONENTE DE SIMULACIÓN (PARA DEMO) =====
export const GamificationDemo: React.FC<{ user: User; onUserUpdate: (user: User) => void }> = ({ 
  user, 
  onUserUpdate 
}) => {
  const [lastAction, setLastAction] = useState<string>('');
  
  const simulateAction = (action: string) => {
    const result = GamificationService.simulateUserAction(user, action);
    onUserUpdate(result.user);
    setLastAction(`${action}: +${result.pointsEarned} puntos, ${result.achievements.length} logros`);
    
    // Mostrar achievements si los hay
    if (result.achievements.length > 0) {
      result.achievements.forEach(achievement => {
        console.log(`🎉 ¡Nuevo logro desbloqueado: ${achievement.title}!`);
      });
    }
  };

  return (
    <Card className="p-6">
      <CardTitle className="mb-4">Demo de Gamificación</CardTitle>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => simulateAction('attended_event')}
            >
              Asistir a evento
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => simulateAction('created_event')}
            >
              Crear evento
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => simulateAction('joined_tribe')}
            >
              Unirse a tribu
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => simulateAction('early_join')}
            >
              Early bird
            </Button>
          </div>
          
          {lastAction && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm text-green-800 dark:text-green-200">
              {lastAction}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};