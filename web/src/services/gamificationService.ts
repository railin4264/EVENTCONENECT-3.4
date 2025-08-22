import { Achievement, Badge, UserLevel, User } from '@/types';

// ===== CONFIGURACIÓN DE LOGROS =====
export const ACHIEVEMENTS: Achievement[] = [
  // Eventos
  {
    id: 'first_event',
    title: 'Primer Paso',
    description: 'Asististe a tu primer evento',
    icon: '🎉',
    points: 10,
    category: 'events',
    rarity: 'common'
  },
  {
    id: 'event_enthusiast',
    title: 'Entusiasta de Eventos',
    description: 'Asiste a 5 eventos',
    icon: '🎪',
    points: 50,
    category: 'events',
    rarity: 'common'
  },
  {
    id: 'social_butterfly',
    title: 'Mariposa Social',
    description: 'Asiste a 5 eventos en un mes',
    icon: '🦋',
    points: 75,
    category: 'social',
    rarity: 'rare'
  },
  {
    id: 'event_marathon',
    title: 'Maratón de Eventos',
    description: 'Asiste a 25 eventos',
    icon: '🏃‍♂️',
    points: 200,
    category: 'events',
    rarity: 'epic'
  },
  
  // Creación
  {
    id: 'event_creator',
    title: 'Creador de Experiencias',
    description: 'Organiza tu primer evento',
    icon: '🎨',
    points: 25,
    category: 'creation',
    rarity: 'common'
  },
  {
    id: 'community_builder',
    title: 'Constructor de Comunidad',
    description: 'Crea una tribu con más de 50 miembros',
    icon: '🏗️',
    points: 100,
    category: 'creation',
    rarity: 'rare'
  },
  {
    id: 'super_host',
    title: 'Super Anfitrión',
    description: 'Organiza 10 eventos exitosos',
    icon: '⭐',
    points: 300,
    category: 'creation',
    rarity: 'epic'
  },
  
  // Social
  {
    id: 'tribe_joiner',
    title: 'Explorador de Tribus',
    description: 'Únete a tu primera tribu',
    icon: '🔍',
    points: 15,
    category: 'social',
    rarity: 'common'
  },
  {
    id: 'networking_pro',
    title: 'Pro del Networking',
    description: 'Conecta con 50 personas nuevas',
    icon: '🤝',
    points: 150,
    category: 'social',
    rarity: 'rare'
  },
  
  // Engagement
  {
    id: 'early_bird',
    title: 'Madrugador',
    description: 'Sé el primero en unirte a 5 eventos',
    icon: '🐦',
    points: 60,
    category: 'engagement',
    rarity: 'rare'
  },
  {
    id: 'trend_setter',
    title: 'Creador de Tendencias',
    description: 'Tus eventos aparecen 3 veces en trending',
    icon: '🔥',
    points: 250,
    category: 'engagement',
    rarity: 'epic'
  },
  {
    id: 'legend',
    title: 'Leyenda de EventConnect',
    description: 'Alcanza el nivel 20',
    icon: '👑',
    points: 1000,
    category: 'engagement',
    rarity: 'legendary'
  }
];

// ===== CONFIGURACIÓN DE NIVELES =====
export const USER_LEVELS: UserLevel[] = [
  { level: 1, title: 'Explorador', pointsRequired: 0, benefits: ['Acceso básico'], badge: { id: 'explorer', name: 'Explorador', description: 'Nuevo en EventConnect', icon: '🌱', color: '#10B981', requirements: 'Nivel 1' } },
  { level: 2, title: 'Participante', pointsRequired: 50, benefits: ['Crear eventos', 'Unirse a tribus'], badge: { id: 'participant', name: 'Participante', description: 'Activo en la comunidad', icon: '🎯', color: '#3B82F6', requirements: 'Nivel 2' } },
  { level: 3, title: 'Entusiasta', pointsRequired: 150, benefits: ['Eventos destacados', 'Invitaciones exclusivas'], badge: { id: 'enthusiast', name: 'Entusiasta', description: 'Amante de los eventos', icon: '⚡', color: '#8B5CF6', requirements: 'Nivel 3' } },
  { level: 5, title: 'Influencer', pointsRequired: 400, benefits: ['Verificación', 'Analytics avanzados'], badge: { id: 'influencer', name: 'Influencer', description: 'Influye en la comunidad', icon: '🌟', color: '#F59E0B', requirements: 'Nivel 5' } },
  { level: 10, title: 'Embajador', pointsRequired: 1000, benefits: ['Programa beta', 'Soporte prioritario'], badge: { id: 'ambassador', name: 'Embajador', description: 'Representa EventConnect', icon: '🏆', color: '#EF4444', requirements: 'Nivel 10' } },
  { level: 20, title: 'Leyenda', pointsRequired: 2500, benefits: ['Acceso VIP', 'Eventos exclusivos'], badge: { id: 'legend', name: 'Leyenda', description: 'Leyenda de EventConnect', icon: '👑', color: '#7C3AED', requirements: 'Nivel 20' } }
];

// ===== SERVICIO DE GAMIFICACIÓN =====
export class GamificationService {
  /**
   * Verifica y otorga logros basado en acciones del usuario
   */
  static checkAchievements(user: User, action: string, data?: any): Achievement[] {
    const newAchievements: Achievement[] = [];
    const userAchievements = user.recentAchievements?.map(a => a.id) || [];
    
    switch (action) {
      case 'attended_event':
        // Primer evento
        if (user.eventsAttended === 1 && !userAchievements.includes('first_event')) {
          newAchievements.push(ACHIEVEMENTS.find(a => a.id === 'first_event')!);
        }
        
        // Entusiasta de eventos
        if (user.eventsAttended === 5 && !userAchievements.includes('event_enthusiast')) {
          newAchievements.push(ACHIEVEMENTS.find(a => a.id === 'event_enthusiast')!);
        }
        
        // Mariposa social (5 eventos en un mes)
        if (user.eventsAttendedThisMonth === 5 && !userAchievements.includes('social_butterfly')) {
          newAchievements.push(ACHIEVEMENTS.find(a => a.id === 'social_butterfly')!);
        }
        
        // Maratón de eventos
        if (user.eventsAttended === 25 && !userAchievements.includes('event_marathon')) {
          newAchievements.push(ACHIEVEMENTS.find(a => a.id === 'event_marathon')!);
        }
        break;
        
      case 'created_event':
        if (!userAchievements.includes('event_creator')) {
          newAchievements.push(ACHIEVEMENTS.find(a => a.id === 'event_creator')!);
        }
        
        // Super host (10 eventos organizados)
        if (data?.eventsCreated === 10 && !userAchievements.includes('super_host')) {
          newAchievements.push(ACHIEVEMENTS.find(a => a.id === 'super_host')!);
        }
        break;
        
      case 'joined_tribe':
        if (!userAchievements.includes('tribe_joiner')) {
          newAchievements.push(ACHIEVEMENTS.find(a => a.id === 'tribe_joiner')!);
        }
        break;
        
      case 'created_tribe':
        if (data?.tribeMembers >= 50 && !userAchievements.includes('community_builder')) {
          newAchievements.push(ACHIEVEMENTS.find(a => a.id === 'community_builder')!);
        }
        break;
        
      case 'early_join':
        // Madrugador (primero en unirse)
        if (data?.joinPosition === 1) {
          const earlyBirdProgress = this.getAchievementProgress(user, 'early_bird');
          if (earlyBirdProgress.current < 5) {
            this.updateAchievementProgress(user, 'early_bird', earlyBirdProgress.current + 1);
            
            if (earlyBirdProgress.current + 1 >= 5 && !userAchievements.includes('early_bird')) {
              newAchievements.push(ACHIEVEMENTS.find(a => a.id === 'early_bird')!);
            }
          }
        }
        break;
        
      case 'level_up':
        if (data?.newLevel === 20 && !userAchievements.includes('legend')) {
          newAchievements.push(ACHIEVEMENTS.find(a => a.id === 'legend')!);
        }
        break;
    }
    
    return newAchievements;
  }
  
  /**
   * Calcula el nivel del usuario basado en puntos totales
   */
  static calculateLevel(totalPoints: number): UserLevel {
    for (let i = USER_LEVELS.length - 1; i >= 0; i--) {
      if (totalPoints >= USER_LEVELS[i].pointsRequired) {
        return USER_LEVELS[i];
      }
    }
    return USER_LEVELS[0];
  }
  
  /**
   * Calcula puntos necesarios para el siguiente nivel
   */
  static getPointsToNextLevel(totalPoints: number): number {
    const currentLevel = this.calculateLevel(totalPoints);
    const nextLevelIndex = USER_LEVELS.findIndex(l => l.level === currentLevel.level) + 1;
    
    if (nextLevelIndex >= USER_LEVELS.length) {
      return 0; // Ya está en el nivel máximo
    }
    
    const nextLevel = USER_LEVELS[nextLevelIndex];
    return nextLevel.pointsRequired - totalPoints;
  }
  
  /**
   * Obtiene progreso de un logro específico
   */
  static getAchievementProgress(user: User, achievementId: string): { current: number; target: number } {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return { current: 0, target: 1 };
    
    // Aquí normalmente consultarías la base de datos
    // Por ahora, simularemos con localStorage
    const progress = localStorage.getItem(`achievement_progress_${user.id}_${achievementId}`);
    const current = progress ? parseInt(progress) : 0;
    
    // Targets por logro
    const targets: Record<string, number> = {
      'first_event': 1,
      'event_enthusiast': 5,
      'social_butterfly': 5,
      'event_marathon': 25,
      'early_bird': 5,
      'networking_pro': 50,
      'super_host': 10,
      'community_builder': 50
    };
    
    return {
      current,
      target: targets[achievementId] || 1
    };
  }
  
  /**
   * Actualiza progreso de un logro
   */
  static updateAchievementProgress(user: User, achievementId: string, newProgress: number): void {
    localStorage.setItem(`achievement_progress_${user.id}_${achievementId}`, newProgress.toString());
  }
  
  /**
   * Otorga puntos al usuario
   */
  static awardPoints(user: User, points: number, reason: string): User {
    const newTotalPoints = (user.totalPoints || 0) + points;
    const oldLevel = this.calculateLevel(user.totalPoints || 0);
    const newLevel = this.calculateLevel(newTotalPoints);
    
    const updatedUser = {
      ...user,
      totalPoints: newTotalPoints
    };
    
    // Si subió de nivel, verificar logros de nivel
    if (newLevel.level > oldLevel.level) {
      const levelAchievements = this.checkAchievements(updatedUser, 'level_up', { 
        newLevel: newLevel.level,
        oldLevel: oldLevel.level 
      });
      
      // Notificar subida de nivel
      this.notifyLevelUp(user, oldLevel, newLevel);
      
      // Añadir logros de nivel
      if (levelAchievements.length > 0) {
        this.notifyAchievements(user, levelAchievements);
      }
    }
    
    return updatedUser;
  }
  
  /**
   * Obtiene estadísticas de gamificación del usuario
   */
  static getUserStats(user: User) {
    const currentLevel = this.calculateLevel(user.totalPoints || 0);
    const pointsToNext = this.getPointsToNextLevel(user.totalPoints || 0);
    const progressPercent = currentLevel.pointsRequired > 0 
      ? Math.round(((user.totalPoints || 0) - currentLevel.pointsRequired) / 
          (this.getPointsToNextLevel(currentLevel.pointsRequired) || 1) * 100)
      : 0;
    
    return {
      level: currentLevel,
      totalPoints: user.totalPoints || 0,
      pointsToNextLevel: pointsToNext,
      progressPercent,
      achievementsUnlocked: user.recentAchievements?.length || 0,
      totalAchievements: ACHIEVEMENTS.length,
      completionRate: Math.round((user.recentAchievements?.length || 0) / ACHIEVEMENTS.length * 100)
    };
  }
  
  /**
   * Obtiene logros disponibles para desbloquear
   */
  static getAvailableAchievements(user: User): Achievement[] {
    const unlockedIds = user.recentAchievements?.map(a => a.id) || [];
    
    return ACHIEVEMENTS
      .filter(achievement => !unlockedIds.includes(achievement.id))
      .map(achievement => ({
        ...achievement,
        progress: this.getAchievementProgress(user, achievement.id)
      }))
      .sort((a, b) => {
        // Priorizar logros más cercanos a completar
        const progressA = a.progress ? a.progress.current / a.progress.target : 0;
        const progressB = b.progress ? b.progress.current / b.progress.target : 0;
        return progressB - progressA;
      });
  }
  
  /**
   * Obtiene leaderboard de usuarios
   */
  static getLeaderboard(users: User[], timeframe: 'week' | 'month' | 'all' = 'all'): User[] {
    return users
      .filter(user => user.totalPoints && user.totalPoints > 0)
      .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
      .slice(0, 50);
  }
  
  /**
   * Verifica si el usuario puede obtener un badge especial
   */
  static checkSpecialBadges(user: User): Badge[] {
    const specialBadges: Badge[] = [];
    const stats = this.getUserStats(user);
    
    // Badge de veterano (usuario desde hace 1 año)
    const accountAge = user.createdAt ? 
      (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24) : 0;
    
    if (accountAge >= 365) {
      specialBadges.push({
        id: 'veteran',
        name: 'Veterano',
        description: 'Miembro desde hace más de un año',
        icon: '🎖️',
        color: '#8B5CF6',
        requirements: '365 días de membresía'
      });
    }
    
    // Badge de completista (todos los logros desbloqueados)
    if (stats.completionRate === 100) {
      specialBadges.push({
        id: 'completionist',
        name: 'Completista',
        description: 'Desbloqueó todos los logros',
        icon: '💯',
        color: '#F59E0B',
        requirements: 'Todos los logros desbloqueados'
      });
    }
    
    return specialBadges;
  }
  
  /**
   * Notifica al usuario sobre subida de nivel
   */
  private static notifyLevelUp(user: User, oldLevel: UserLevel, newLevel: UserLevel): void {
    // Aquí se integraría con el sistema de notificaciones
    console.log(`¡${user.firstName} subió al nivel ${newLevel.level}: ${newLevel.title}!`);
    
    // Trigger confetti o animación especial
    if (typeof window !== 'undefined' && window.confetti) {
      window.confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }
  
  /**
   * Notifica al usuario sobre nuevos logros
   */
  private static notifyAchievements(user: User, achievements: Achievement[]): void {
    achievements.forEach(achievement => {
      console.log(`¡${user.firstName} desbloqueó: ${achievement.title}!`);
      
      // Aquí se integraría con el sistema de notificaciones
      // this.notificationService.send({
      //   type: 'achievement',
      //   title: '¡Nuevo logro desbloqueado!',
      //   message: `${achievement.icon} ${achievement.title}`,
      //   data: { achievementId: achievement.id }
      // });
    });
  }
  
  /**
   * Simula acciones del usuario para testing
   */
  static simulateUserAction(user: User, action: string, data?: any): {
    user: User;
    achievements: Achievement[];
    pointsEarned: number;
  } {
    let pointsEarned = 0;
    let updatedUser = { ...user };
    
    // Simular actualización de stats según la acción
    switch (action) {
      case 'attended_event':
        updatedUser.eventsAttended = (user.eventsAttended || 0) + 1;
        updatedUser.eventsAttendedThisMonth = (user.eventsAttendedThisMonth || 0) + 1;
        pointsEarned = 10;
        break;
        
      case 'created_event':
        pointsEarned = 25;
        break;
        
      case 'joined_tribe':
        pointsEarned = 15;
        break;
        
      case 'early_join':
        pointsEarned = 5;
        break;
    }
    
    // Otorgar puntos
    if (pointsEarned > 0) {
      updatedUser = this.awardPoints(updatedUser, pointsEarned, action);
    }
    
    // Verificar logros
    const newAchievements = this.checkAchievements(updatedUser, action, data);
    
    // Añadir nuevos logros al usuario
    if (newAchievements.length > 0) {
      updatedUser.recentAchievements = [
        ...(updatedUser.recentAchievements || []),
        ...newAchievements.map(a => ({ ...a, unlockedAt: new Date() }))
      ];
      
      // Puntos adicionales por logros
      const achievementPoints = newAchievements.reduce((sum, a) => sum + a.points, 0);
      updatedUser.totalPoints = (updatedUser.totalPoints || 0) + achievementPoints;
    }
    
    return {
      user: updatedUser,
      achievements: newAchievements,
      pointsEarned: pointsEarned + newAchievements.reduce((sum, a) => sum + a.points, 0)
    };
  }
  
  /**
   * Obtiene logros por categoría
   */
  static getAchievementsByCategory(category: Achievement['category']): Achievement[] {
    return ACHIEVEMENTS.filter(a => a.category === category);
  }
  
  /**
   * Obtiene logros por rareza
   */
  static getAchievementsByRarity(rarity: Achievement['rarity']): Achievement[] {
    return ACHIEVEMENTS.filter(a => a.rarity === rarity);
  }
  
  /**
   * Calcula estadísticas globales de gamificación
   */
  static getGlobalStats(users: User[]) {
    const totalUsers = users.length;
    const totalPoints = users.reduce((sum, user) => sum + (user.totalPoints || 0), 0);
    const averageLevel = users.reduce((sum, user) => {
      const level = this.calculateLevel(user.totalPoints || 0);
      return sum + level.level;
    }, 0) / totalUsers;
    
    const achievementDistribution = ACHIEVEMENTS.reduce((acc, achievement) => {
      const unlockedCount = users.filter(user => 
        user.recentAchievements?.some(a => a.id === achievement.id)
      ).length;
      
      acc[achievement.id] = {
        achievement,
        unlockedCount,
        unlockedPercentage: Math.round((unlockedCount / totalUsers) * 100)
      };
      
      return acc;
    }, {} as Record<string, any>);
    
    return {
      totalUsers,
      totalPoints,
      averageLevel: Math.round(averageLevel * 100) / 100,
      achievementDistribution,
      topUsers: this.getLeaderboard(users).slice(0, 10)
    };
  }
}