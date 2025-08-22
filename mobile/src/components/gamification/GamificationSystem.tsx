import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width: screenWidth } = Dimensions.get('window');

interface UserLevel {
  level: number;
  experience: number;
  experienceToNext: number;
  title: string;
  color: string;
  badge: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
}

interface GamificationSystemProps {
  userId: string;
  style?: any;
}

// Componente de badge 3D
const Badge3D: React.FC<{ badge: Badge; isUnlocked: boolean }> = ({ badge, isUnlocked }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;
  const glowValue = useRef(new Animated.Value(0)).current;

  const rarityColors = {
    common: '#6b7280',
    rare: '#3b82f6',
    epic: '#8b5cf6',
    legendary: '#fbbf24'
  };

  const color = rarityColors[badge.rarity];

  // Animación de rotación continua
  useEffect(() => {
    const rotationAnimation = Animated.loop(
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );
    rotationAnimation.start();

    return () => rotationAnimation.stop();
  }, [rotateValue]);

  // Animación de brillo para badges desbloqueados
  useEffect(() => {
    if (isUnlocked) {
      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowValue, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(glowValue, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      );
      glowAnimation.start();

      return () => glowAnimation.stop();
    }
    
    return () => {
      // Cleanup when not unlocked
    };
  }, [isUnlocked, glowValue]);

  const handlePress = () => {
    if (isUnlocked) {
      // Feedback háptico
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Animación de escala
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const rotation = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glowValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={styles.badgeContainer}
    >
      <Animated.View
        style={[
          styles.badge3D,
          {
            transform: [
              { scale: scaleValue },
              { rotateY: rotation },
            ],
          },
        ]}
      >
        {/* Badge principal */}
        <LinearGradient
          colors={[color, color + '80']}
          style={styles.badgeGradient}
        >
          <Text style={styles.badgeIcon}>{badge.icon}</Text>

          {/* Check mark para badges desbloqueados */}
          {isUnlocked && (
            <View style={styles.unlockIndicator}>
              <Text style={styles.unlockText}>✓</Text>
            </View>
          )}
        </LinearGradient>

        {/* Efecto de brillo */}
        {isUnlocked && (
          <Animated.View
            style={[
              styles.badgeGlow,
              {
                opacity: glowOpacity,
                backgroundColor: color,
              },
            ]}
          />
        )}
      </Animated.View>

      {/* Información del badge */}
      <View style={styles.badgeInfo}>
        <Text style={styles.badgeName} numberOfLines={2}>
          {badge.name}
        </Text>
        <Text style={styles.badgeDescription} numberOfLines={2}>
          {badge.description}
        </Text>

        <View style={[
          styles.rarityIndicator,
          { backgroundColor: color + '20' }
        ]}>
          <Text style={[styles.rarityText, { color }]}>
            {badge.rarity.toUpperCase()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Componente principal de gamificación
export const GamificationSystem: React.FC<GamificationSystemProps> = ({
  style = {}
}) => {
  const [userLevel, setUserLevel] = useState<UserLevel>({
    level: 1,
    experience: 0,
    experienceToNext: 100,
    title: 'Novato',
    color: '#6b7280',
    badge: '🌟'
  });

  const [badges] = useState<Badge[]>([
    {
      id: 'first-event',
      name: 'Primer Evento',
      description: 'Asististe a tu primer evento',
      icon: '🎉',
      rarity: 'common',
      unlocked: false
    },
    {
      id: 'event-creator',
      name: 'Creador de Eventos',
      description: 'Creaste tu primer evento',
      icon: '✨',
      rarity: 'rare',
      unlocked: false
    },
    {
      id: 'social-butterfly',
      name: 'Mariposa Social',
      description: 'Conectaste con 50 personas',
      icon: '🦋',
      rarity: 'epic',
      unlocked: false
    },
    {
      id: 'event-master',
      name: 'Maestro de Eventos',
      description: 'Organizaste 10 eventos exitosos',
      icon: '👑',
      rarity: 'legendary',
      unlocked: false
    }
  ]);

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'event-attendance',
      name: 'Asistente Fiel',
      description: 'Asiste a eventos regularmente',
      icon: '📅',
      category: 'attendance',
      unlocked: false,
      progress: 0,
      maxProgress: 10
    },
    {
      id: 'community-builder',
      name: 'Constructor de Comunidad',
      description: 'Construye comunidades activas',
      icon: '🏗️',
      category: 'community',
      unlocked: false,
      progress: 0,
      maxProgress: 5
    }
  ]);

  const [recentUnlock, setRecentUnlock] = useState<Badge | Achievement | null>(null);
  const progressBarWidth = useRef(new Animated.Value(0)).current;

  // Simular progreso del usuario
  useEffect(() => {
    const interval = setInterval(() => {
      setUserLevel(prev => {
        const newExp = prev.experience + Math.floor(Math.random() * 10);
        if (newExp >= prev.experienceToNext) {
          // Subir de nivel
          const newLevel = prev.level + 1;
          const newExpToNext = prev.experienceToNext * 1.5;

          // Feedback háptico
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

          return {
            ...prev,
            level: newLevel,
            experience: newExp - prev.experienceToNext,
            experienceToNext: newExpToNext,
            title: getLevelTitle(newLevel),
            color: getLevelColor(newLevel),
            badge: getLevelBadge(newLevel)
          };
        }
        return { ...prev, experience: newExp };
      });
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Animar barra de progreso
  useEffect(() => {
    const progress = (userLevel.experience / userLevel.experienceToNext) * 100;
    Animated.timing(progressBarWidth, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
    
    return () => {
      // Cleanup
    };
  }, [userLevel.experience, userLevel.experienceToNext, progressBarWidth]);

  const getLevelTitle = (level: number): string => {
    if (level < 5) return 'Novato';
    if (level < 10) return 'Aprendiz';
    if (level < 20) return 'Experto';
    if (level < 50) return 'Maestro';
    return 'Leyenda';
  };

  const getLevelColor = (level: number): string => {
    if (level < 5) return '#6b7280';
    if (level < 10) return '#3b82f6';
    if (level < 20) return '#8b5cf6';
    if (level < 50) return '#fbbf24';
    return '#ef4444';
  };

  const getLevelBadge = (level: number): string => {
    if (level < 5) return '🌟';
    if (level < 10) return '⭐';
    if (level < 20) return '💫';
    if (level < 50) return '✨';
    return '👑';
  };

  const unlockAchievement = (achievementId: string) => {
    setAchievements(prev => prev.map(achievement =>
      achievement.id === achievementId
        ? { ...achievement, unlocked: true, unlockedAt: new Date() }
        : achievement
    ));

    setRecentUnlock(achievements.find(a => a.id === achievementId) || null);

    // Feedback háptico
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Limpiar notificación después de 3 segundos
    setTimeout(() => setRecentUnlock(null), 3000);
  };

  return (
    <ScrollView style={[styles.container, style]} showsVerticalScrollIndicator={false}>
      {/* Nivel del usuario */}
      <View style={styles.levelCard}>
        <LinearGradient
          colors={['#8b5cf6', '#7c3aed']}
          style={styles.levelGradient}
        >
          <View style={styles.levelHeader}>
            <View style={styles.levelInfo}>
              <Text style={styles.levelTitle}>
                Nivel {userLevel.level} - {userLevel.title}
              </Text>
              <Text style={styles.levelExperience}>
                {userLevel.experience} / {userLevel.experienceToNext} XP
              </Text>
            </View>

            <View style={styles.levelBadgeContainer}>
              <Text style={styles.levelBadge}>{userLevel.badge}</Text>
            </View>
          </View>

          {/* Barra de progreso */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressBarWidth.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Badges */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Badges</Text>
        <View style={styles.badgesGrid}>
          {badges.map((badge) => (
            <Badge3D
              key={badge.id}
              badge={badge}
              isUnlocked={badge.unlocked}
            />
          ))}
        </View>
      </View>

      {/* Logros */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Logros</Text>
        {achievements.map((achievement) => (
          <TouchableOpacity
            key={achievement.id}
            style={styles.achievementCard}
            onPress={() => !achievement.unlocked && unlockAchievement(achievement.id)}
            activeOpacity={0.7}
          >
            <View style={styles.achievementIcon}>
              <Text style={styles.achievementIconText}>{achievement.icon}</Text>
            </View>

            <View style={styles.achievementInfo}>
              <Text style={styles.achievementName}>{achievement.name}</Text>
              <Text style={styles.achievementDescription}>
                {achievement.description}
              </Text>

              {/* Barra de progreso del logro */}
              <View style={styles.achievementProgress}>
                <View style={styles.achievementProgressBar}>
                  <View
                    style={[
                      styles.achievementProgressFill,
                      {
                        width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.achievementProgressText}>
                  {achievement.progress} / {achievement.maxProgress}
                </Text>
              </View>
            </View>

            <View style={[
              styles.achievementStatus,
              {
                backgroundColor: achievement.unlocked ? '#22c55e' : '#6b7280',
              }
            ]}>
              <Text style={styles.achievementStatusText}>
                {achievement.unlocked ? '✓' : '🔒'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Notificación de desbloqueo reciente */}
      {recentUnlock && (
        <View style={styles.unlockNotification}>
          <LinearGradient
            colors={['#22c55e', '#16a34a']}
            style={styles.unlockGradient}
          >
            <Text style={styles.unlockIcon}>🎉</Text>
            <View style={styles.unlockContent}>
              <Text style={styles.unlockTitle}>¡Desbloqueado!</Text>
              <Text style={styles.unlockName}>{recentUnlock.name}</Text>
            </View>
          </LinearGradient>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  levelCard: {
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  levelGradient: {
    padding: 20,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  levelExperience: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  levelBadgeContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelBadge: {
    fontSize: 30,
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeContainer: {
    width: (screenWidth - 64) / 2,
    marginBottom: 16,
    alignItems: 'center',
  },
  badge3D: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  badgeGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badgeIcon: {
    fontSize: 32,
  },
  unlockIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlockText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  badgeGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 50,
    opacity: 0.3,
  },
  badgeInfo: {
    alignItems: 'center',
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  rarityIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementIconText: {
    fontSize: 24,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  achievementProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginRight: 8,
    overflow: 'hidden',
  },
  achievementProgressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  achievementProgressText: {
    fontSize: 12,
    color: '#6b7280',
    minWidth: 40,
  },
  achievementStatus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementStatusText: {
    color: '#fff',
    fontSize: 16,
  },
  unlockNotification: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  unlockGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  unlockIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  unlockContent: {
    flex: 1,
  },
  unlockTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  unlockName: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
});

export default GamificationSystem;