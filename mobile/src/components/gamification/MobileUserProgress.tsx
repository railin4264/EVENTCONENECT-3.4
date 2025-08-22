import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  withDelay
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { User, Achievement } from '../../types';

// ===== INTERFACES =====
interface MobileUserProgressProps {
  user: User;
  onAchievementPress?: (achievement: Achievement) => void;
  showDetailed?: boolean;
}

interface UserStats {
  level: { level: number; title: string; pointsRequired: number };
  totalPoints: number;
  pointsToNextLevel: number;
  progressPercent: number;
  achievementsUnlocked: number;
  totalAchievements: number;
}

// ===== CONFIGURACIÓN =====
const { width: screenWidth } = Dimensions.get('window');

const theme = {
  colors: {
    primary: '#4F46E5',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    textSecondary: '#6B7280'
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24
  }
};

// ===== DATOS MOCK =====
const MOCK_ACHIEVEMENTS: Achievement[] = [
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
    id: 'social_butterfly',
    title: 'Mariposa Social',
    description: 'Asiste a 5 eventos en un mes',
    icon: '🦋',
    points: 75,
    category: 'social',
    rarity: 'rare'
  },
  {
    id: 'event_creator',
    title: 'Creador de Experiencias',
    description: 'Organiza tu primer evento',
    icon: '🎨',
    points: 25,
    category: 'creation',
    rarity: 'common'
  }
];

// ===== COMPONENTE PRINCIPAL =====
export const MobileUserProgress: React.FC<MobileUserProgressProps> = ({
  user,
  onAchievementPress,
  showDetailed = false
}) => {
  // Estados
  const [showAchievements, setShowAchievements] = useState(false);
  const [recentAchievement, setRecentAchievement] = useState<Achievement | null>(null);
  
  // Valores animados
  const progressWidth = useSharedValue(0);
  const achievementScale = useSharedValue(0);
  
  // Calcular estadísticas del usuario
  const getUserStats = (): UserStats => {
    const totalPoints = user.totalPoints || 0;
    const level = totalPoints < 50 ? 1 : totalPoints < 150 ? 2 : totalPoints < 400 ? 3 : 4;
    const levelTitles = ['Explorador', 'Participante', 'Entusiasta', 'Influencer'];
    const pointsRequired = [0, 50, 150, 400][level - 1];
    const nextLevelPoints = [50, 150, 400, 1000][level - 1] || 1000;
    const pointsToNext = Math.max(0, nextLevelPoints - totalPoints);
    const progressPercent = level < 4 ? 
      Math.round(((totalPoints - pointsRequired) / (nextLevelPoints - pointsRequired)) * 100) : 100;
    
    return {
      level: { level, title: levelTitles[level - 1], pointsRequired },
      totalPoints,
      pointsToNextLevel: pointsToNext,
      progressPercent: Math.max(0, Math.min(100, progressPercent)),
      achievementsUnlocked: user.recentAchievements?.length || 0,
      totalAchievements: MOCK_ACHIEVEMENTS.length
    };
  };

  const stats = getUserStats();

  // Efectos
  useEffect(() => {
    // Animar barra de progreso
    progressWidth.value = withDelay(500, withTiming(stats.progressPercent / 100, { duration: 1000 }));
  }, [stats.progressPercent]);

  useEffect(() => {
    // Mostrar logro reciente si existe
    if (user.recentAchievements && user.recentAchievements.length > 0) {
      const latest = user.recentAchievements[user.recentAchievements.length - 1];
      if (latest.unlockedAt && Date.now() - latest.unlockedAt.getTime() < 5000) {
        setRecentAchievement(latest);
        achievementScale.value = withSequence(
          withSpring(1.2),
          withSpring(1),
          withDelay(3000, withTiming(0))
        );
        
        // Vibración de logro
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        setTimeout(() => setRecentAchievement(null), 4000);
      }
    }
  }, [user.recentAchievements]);

  // Funciones helper
  const getLevelEmoji = (level: number) => {
    const emojis = ['🌱', '🌿', '🌳', '🦋', '🦅', '👑'];
    return emojis[Math.min(level - 1, emojis.length - 1)];
  };

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return '#6B7280';
      case 'rare': return '#3B82F6';
      case 'epic': return '#8B5CF6';
      case 'legendary': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  // Estilos animados
  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`
  }));

  const achievementAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: achievementScale.value }],
    opacity: achievementScale.value
  }));

  return (
    <View style={styles.container}>
      {/* Tarjeta principal de progreso */}
      <LinearGradient
        colors={[theme.colors.primary, '#8B5CF6']}
        style={styles.progressCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.progressHeader}>
          <View style={styles.levelInfo}>
            <Text style={styles.levelEmoji}>{getLevelEmoji(stats.level.level)}</Text>
            <View style={styles.levelText}>
              <Text style={styles.levelNumber}>Nivel {stats.level.level}</Text>
              <Text style={styles.levelTitle}>{stats.level.title}</Text>
            </View>
          </View>
          
          <View style={styles.pointsInfo}>
            <Text style={styles.totalPoints}>{stats.totalPoints}</Text>
            <Text style={styles.pointsLabel}>puntos</Text>
          </View>
        </View>
        
        {stats.pointsToNextLevel > 0 ? (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>
                Progreso al siguiente nivel
              </Text>
              <Text style={styles.progressPercent}>
                {stats.progressPercent}%
              </Text>
            </View>
            
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground} />
              <Animated.View style={[styles.progressBarFill, progressAnimatedStyle]} />
            </View>
            
            <Text style={styles.pointsToNext}>
              {stats.pointsToNextLevel} puntos para siguiente nivel
            </Text>
          </View>
        ) : (
          <View style={styles.maxLevelContainer}>
            <Text style={styles.maxLevelText}>¡Nivel máximo alcanzado! 🎉</Text>
          </View>
        )}
        
        {/* Logros recientes */}
        <View style={styles.achievementsSection}>
          <View style={styles.achievementsHeader}>
            <View style={styles.achievementsInfo}>
              <Ionicons name="trophy-outline" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.achievementsText}>
                {stats.achievementsUnlocked}/{stats.totalAchievements} logros
              </Text>
            </View>
            
            <TouchableOpacity
              onPress={() => setShowAchievements(true)}
              style={styles.viewAllButton}
            >
              <Text style={styles.viewAllText}>Ver todos</Text>
              <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>
          
          {/* Últimos logros */}
          {user.recentAchievements && user.recentAchievements.length > 0 && (
            <View style={styles.recentAchievements}>
              <Text style={styles.recentLabel}>Recientes:</Text>
              <View style={styles.recentIcons}>
                {user.recentAchievements.slice(-3).map(achievement => (
                  <TouchableOpacity
                    key={achievement.id}
                    onPress={() => onAchievementPress?.(achievement)}
                    style={styles.achievementIcon}
                  >
                    <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Modal de logros */}
      <Modal
        visible={showAchievements}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Tus Logros</Text>
            <TouchableOpacity
              onPress={() => setShowAchievements(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          {/* Estadísticas generales */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.achievementsUnlocked}</Text>
              <Text style={styles.statLabel}>Desbloqueados</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalPoints}</Text>
              <Text style={styles.statLabel}>Puntos totales</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {Math.round((stats.achievementsUnlocked / stats.totalAchievements) * 100)}%
              </Text>
              <Text style={styles.statLabel}>Completado</Text>
            </View>
          </View>
          
          {/* Lista de logros */}
          <ScrollView style={styles.achievementsList}>
            {MOCK_ACHIEVEMENTS.map(achievement => {
              const isUnlocked = user.recentAchievements?.some(a => a.id === achievement.id);
              
              return (
                <TouchableOpacity
                  key={achievement.id}
                  style={[
                    styles.achievementItem,
                    isUnlocked && styles.achievementUnlocked
                  ]}
                  onPress={() => onAchievementPress?.(achievement)}
                >
                  <View style={styles.achievementIcon}>
                    <Text style={[
                      styles.achievementEmoji,
                      !isUnlocked && styles.achievementEmojiLocked
                    ]}>
                      {achievement.icon}
                    </Text>
                  </View>
                  
                  <View style={styles.achievementContent}>
                    <View style={styles.achievementHeader}>
                      <Text style={[
                        styles.achievementTitle,
                        isUnlocked && styles.achievementTitleUnlocked
                      ]}>
                        {achievement.title}
                      </Text>
                      {isUnlocked && (
                        <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                      )}
                    </View>
                    
                    <Text style={styles.achievementDescription}>
                      {achievement.description}
                    </Text>
                    
                    <View style={styles.achievementFooter}>
                      <View style={[
                        styles.rarityBadge,
                        { backgroundColor: `${getRarityColor(achievement.rarity)}20` }
                      ]}>
                        <Text style={[
                          styles.rarityText,
                          { color: getRarityColor(achievement.rarity) }
                        ]}>
                          {achievement.points} pts
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Modal>

      {/* Animación de logro reciente */}
      {recentAchievement && (
        <Animated.View style={[styles.achievementNotification, achievementAnimatedStyle]}>
          <LinearGradient
            colors={['#F59E0B', '#F97316']}
            style={styles.achievementNotificationGradient}
          >
            <Text style={styles.achievementNotificationEmoji}>
              {recentAchievement.icon}
            </Text>
            <View style={styles.achievementNotificationContent}>
              <Text style={styles.achievementNotificationTitle}>¡Nuevo logro!</Text>
              <Text style={styles.achievementNotificationText}>
                {recentAchievement.title}
              </Text>
              <Text style={styles.achievementNotificationPoints}>
                +{recentAchievement.points} puntos
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>
      )}
    </View>
  );
};

// ===== COMPONENTE COMPACTO =====
export const CompactMobileUserLevel: React.FC<{
  user: User;
  onPress?: () => void;
}> = ({ user, onPress }) => {
  const totalPoints = user.totalPoints || 0;
  const level = totalPoints < 50 ? 1 : totalPoints < 150 ? 2 : totalPoints < 400 ? 3 : 4;
  const levelTitles = ['Explorador', 'Participante', 'Entusiasta', 'Influencer'];

  return (
    <TouchableOpacity 
      style={styles.compactCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[theme.colors.primary, '#8B5CF6']}
        style={styles.compactGradient}
      >
        <Text style={styles.compactLevel}>{level}</Text>
      </LinearGradient>
      
      <View style={styles.compactInfo}>
        <Text style={styles.compactTitle}>{levelTitles[level - 1]}</Text>
        <Text style={styles.compactPoints}>{totalPoints} puntos</Text>
      </View>
      
      <View style={styles.compactAchievements}>
        {user.recentAchievements?.slice(-2).map(achievement => (
          <Text key={achievement.id} style={styles.compactAchievementIcon}>
            {achievement.icon}
          </Text>
        ))}
        <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
};

// ===== ESTILOS =====
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  
  // Tarjeta principal
  progressCard: {
    margin: theme.spacing.lg,
    borderRadius: 16,
    padding: theme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6
  },
  
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg
  },
  
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md
  },
  
  levelEmoji: {
    fontSize: 32
  },
  
  levelText: {
    gap: 2
  },
  
  levelNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white'
  },
  
  levelTitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)'
  },
  
  pointsInfo: {
    alignItems: 'flex-end'
  },
  
  totalPoints: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white'
  },
  
  pointsLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)'
  },
  
  // Progreso
  progressSection: {
    gap: theme.spacing.sm
  },
  
  progressLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)'
  },
  
  progressPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white'
  },
  
  progressBarContainer: {
    position: 'relative',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden'
  },
  
  progressBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.3)'
  },
  
  progressBarFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: 'white',
    borderRadius: 4
  },
  
  pointsToNext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center'
  },
  
  maxLevelContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md
  },
  
  maxLevelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FDE047'
  },
  
  // Logros
  achievementsSection: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.sm
  },
  
  achievementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  
  achievementsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm
  },
  
  achievementsText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)'
  },
  
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  
  viewAllText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)'
  },
  
  recentAchievements: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm
  },
  
  recentLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)'
  },
  
  recentIcons: {
    flexDirection: 'row',
    gap: theme.spacing.xs
  },
  
  achievementIcon: {
    padding: theme.spacing.xs
  },
  
  achievementEmoji: {
    fontSize: 18
  },
  
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface
  },
  
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text
  },
  
  closeButton: {
    padding: theme.spacing.sm
  },
  
  statsGrid: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    gap: theme.spacing.md
  },
  
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: 12,
    alignItems: 'center'
  },
  
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary
  },
  
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4
  },
  
  achievementsList: {
    flex: 1,
    padding: theme.spacing.lg
  },
  
  achievementItem: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
    gap: theme.spacing.md
  },
  
  achievementUnlocked: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#BBF7D0'
  },
  
  achievementContent: {
    flex: 1,
    gap: 4
  },
  
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text
  },
  
  achievementTitleUnlocked: {
    color: '#059669'
  },
  
  achievementDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary
  },
  
  achievementFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  
  rarityBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 12
  },
  
  rarityText: {
    fontSize: 12,
    fontWeight: '600'
  },
  
  achievementEmojiLocked: {
    opacity: 0.4
  },
  
  // Notificación de logro
  achievementNotification: {
    position: 'absolute',
    bottom: 100,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8
  },
  
  achievementNotificationGradient: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.md
  },
  
  achievementNotificationEmoji: {
    fontSize: 32
  },
  
  achievementNotificationContent: {
    flex: 1,
    gap: 2
  },
  
  achievementNotificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white'
  },
  
  achievementNotificationText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)'
  },
  
  achievementNotificationPoints: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)'
  },
  
  // Componente compacto
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: theme.spacing.md,
    margin: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    gap: theme.spacing.md
  },
  
  compactGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  compactLevel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white'
  },
  
  compactInfo: {
    flex: 1,
    gap: 2
  },
  
  compactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text
  },
  
  compactPoints: {
    fontSize: 12,
    color: theme.colors.textSecondary
  },
  
  compactAchievements: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs
  },
  
  compactAchievementIcon: {
    fontSize: 14
  }
});

export default MobileUserProgress;