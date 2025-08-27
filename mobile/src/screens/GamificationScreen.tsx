import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Trophy, Star, Award, Target, TrendingUp, Users, 
  Calendar, MessageSquare, Heart, Share2, Zap, Crown
} from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';

const { width, height } = Dimensions.get('window');

interface Achievement {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: 'event' | 'social' | 'engagement' | 'special';
  points: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Badge {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  isEarned: boolean;
  earnedAt?: string;
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum';
}

interface LeaderboardEntry {
  _id: string;
  username: string;
  avatar?: string;
  points: number;
  rank: number;
  level: number;
  achievements: number;
  isCurrentUser: boolean;
}

interface UserStats {
  totalPoints: number;
  level: number;
  currentLevelPoints: number;
  nextLevelPoints: number;
  totalAchievements: number;
  totalBadges: number;
  rank: number;
  streak: number;
  eventsAttended: number;
  eventsHosted: number;
  postsCreated: number;
  tribesJoined: number;
}

export default function GamificationScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  
  const [selectedTab, setSelectedTab] = useState<'overview' | 'achievements' | 'badges' | 'leaderboard'>('overview');

  // Fetch user gamification stats
  const { data: userStats } = useQuery({
    queryKey: ['gamification-stats'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/api/gamification/stats');
        return response.data.stats;
      } catch (error) {
        console.error('Error fetching gamification stats:', error);
        // Return mock data for development
        return generateMockUserStats();
      }
    },
  });

  // Fetch achievements
  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/api/gamification/achievements');
        return response.data.achievements || [];
      } catch (error) {
        console.error('Error fetching achievements:', error);
        // Return mock data for development
        return generateMockAchievements();
      }
    },
  });

  // Fetch badges
  const { data: badges = [] } = useQuery({
    queryKey: ['badges'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/api/gamification/badges');
        return response.data.badges || [];
      } catch (error) {
        console.error('Error fetching badges:', error);
        // Return mock data for development
        return generateMockBadges();
      }
    },
  });

  // Fetch leaderboard
  const { data: leaderboard = [] } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/api/gamification/leaderboard');
        return response.data.leaderboard || [];
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        // Return mock data for development
        return generateMockLeaderboard();
      }
    },
  });

  // Generate mock data for development
  const generateMockUserStats = (): UserStats => ({
    totalPoints: 2847,
    level: 8,
    currentLevelPoints: 847,
    nextLevelPoints: 1000,
    totalAchievements: 12,
    totalBadges: 8,
    rank: 15,
    streak: 7,
    eventsAttended: 23,
    eventsHosted: 5,
    postsCreated: 18,
    tribesJoined: 6,
  });

  const generateMockAchievements = (): Achievement[] => {
    const mockAchievements: Achievement[] = [
      {
        _id: '1',
        name: 'Primer Evento',
        description: 'Asiste a tu primer evento',
        icon: 'calendar',
        category: 'event',
        points: 100,
        isUnlocked: true,
        unlockedAt: new Date(Date.now() - 86400000).toISOString(),
        progress: 1,
        maxProgress: 1,
        rarity: 'common',
      },
      {
        _id: '2',
        name: 'Anfitrión Estrella',
        description: 'Organiza 5 eventos exitosos',
        icon: 'star',
        category: 'event',
        points: 500,
        isUnlocked: false,
        progress: 3,
        maxProgress: 5,
        rarity: 'rare',
      },
      {
        _id: '3',
        name: 'Social Butterfly',
        description: 'Únete a 10 tribus diferentes',
        icon: 'users',
        category: 'social',
        points: 300,
        isUnlocked: false,
        progress: 6,
        maxProgress: 10,
        rarity: 'epic',
      },
      {
        _id: '4',
        name: 'Creador de Contenido',
        description: 'Publica 25 posts de calidad',
        icon: 'message-square',
        category: 'engagement',
        points: 400,
        isUnlocked: false,
        progress: 18,
        maxProgress: 25,
        rarity: 'rare',
      },
      {
        _id: '5',
        name: 'Leyenda de EventConnect',
        description: 'Alcanza el nivel 20',
        icon: 'crown',
        category: 'special',
        points: 1000,
        isUnlocked: false,
        progress: 8,
        maxProgress: 20,
        rarity: 'legendary',
      },
    ];

    return mockAchievements;
  };

  const generateMockBadges = (): Badge[] => {
    const mockBadges: Badge[] = [
      {
        _id: '1',
        name: 'Novato',
        description: 'Completa tu primer evento',
        icon: 'star',
        category: 'event',
        isEarned: true,
        earnedAt: new Date(Date.now() - 86400000).toISOString(),
        rarity: 'bronze',
      },
      {
        _id: '2',
        name: 'Anfitrión',
        description: 'Organiza tu primer evento',
        icon: 'crown',
        category: 'event',
        isEarned: true,
        earnedAt: new Date(Date.now() - 172800000).toISOString(),
        rarity: 'silver',
      },
      {
        _id: '3',
        name: 'Social',
        description: 'Únete a 5 tribus',
        icon: 'users',
        category: 'social',
        isEarned: false,
        rarity: 'gold',
      },
      {
        _id: '4',
        name: 'Influencer',
        description: 'Alcanza 100 seguidores',
        icon: 'trending-up',
        category: 'social',
        isEarned: false,
        rarity: 'platinum',
      },
    ];

    return mockBadges;
  };

  const generateMockLeaderboard = (): LeaderboardEntry[] => {
    const mockLeaderboard: LeaderboardEntry[] = [];
    
    for (let i = 1; i <= 20; i++) {
      const isCurrentUser = i === 15; // User is at rank 15
      
      mockLeaderboard.push({
        _id: `user-${i}`,
        username: isCurrentUser ? user?.username || 'usuario' : `usuario${i}`,
        avatar: undefined,
        points: 5000 - (i - 1) * 150,
        rank: i,
        level: Math.floor((5000 - (i - 1) * 150) / 1000) + 1,
        achievements: Math.floor(Math.random() * 20) + 5,
        isCurrentUser,
      });
    }

    return mockLeaderboard;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return '#9E9E9E';
      case 'rare':
        return '#2196F3';
      case 'epic':
        return '#9C27B0';
      case 'legendary':
        return '#FFD700';
      case 'bronze':
        return '#CD7F32';
      case 'silver':
        return '#C0C0C0';
      case 'gold':
        return '#FFD700';
      case 'platinum':
        return '#E5E4E2';
      default:
        return colors.primary;
    }
  };

  const getLevelProgress = () => {
    if (!userStats) return 0;
    const progress = (userStats.currentLevelPoints / userStats.nextLevelPoints) * 100;
    return Math.min(progress, 100);
  };

  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Level Progress */}
      <View style={[styles.levelCard, { backgroundColor: colors.surface }]}>
        <View style={styles.levelHeader}>
          <View style={styles.levelInfo}>
            <Text style={[styles.levelNumber, { color: colors.primary }]}>
              Nivel {userStats?.level || 0}
            </Text>
            <Text style={[styles.levelPoints, { color: colors.textSecondary }]}>
              {userStats?.currentLevelPoints || 0} / {userStats?.nextLevelPoints || 1000} puntos
            </Text>
          </View>
          <View style={[styles.levelIcon, { backgroundColor: colors.primary }]}>
            <Trophy size={32} color="white" />
          </View>
        </View>
        
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View 
            style={[
              styles.progressFill, 
              { 
                backgroundColor: colors.primary,
                width: `${getLevelProgress()}%`
              }
            ]} 
          />
        </View>
        
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          {userStats?.nextLevelPoints - (userStats?.currentLevelPoints || 0)} puntos para el siguiente nivel
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {[
          { label: 'Puntos Totales', value: userStats?.totalPoints || 0, icon: Star, color: '#FFD700' },
          { label: 'Ranking', value: `#${userStats?.rank || 0}`, icon: TrendingUp, color: '#4CAF50' },
          { label: 'Racha', value: userStats?.streak || 0, icon: Zap, color: '#FF9800' },
          { label: 'Logros', value: userStats?.totalAchievements || 0, icon: Award, color: '#9C27B0' },
        ].map((stat, index) => (
          <View key={index} style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
              <stat.icon size={24} color={stat.color} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {stat.value}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {stat.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Activity Stats */}
      <View style={[styles.activityCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Actividad Reciente
        </Text>
        
        <View style={styles.activityStats}>
          {[
            { label: 'Eventos Asistidos', value: userStats?.eventsAttended || 0, icon: Calendar },
            { label: 'Eventos Organizados', value: userStats?.eventsHosted || 0, icon: Star },
            { label: 'Posts Creados', value: userStats?.postsCreated || 0, icon: MessageSquare },
            { label: 'Tribus Unidas', value: userStats?.tribesJoined || 0, icon: Users },
          ].map((activity, index) => (
            <View key={index} style={styles.activityStat}>
              <View style={[styles.activityIcon, { backgroundColor: colors.primary + '20' }]}>
                <activity.icon size={20} color={colors.primary} />
              </View>
              <View style={styles.activityInfo}>
                <Text style={[styles.activityValue, { color: colors.text }]}>
                  {activity.value}
                </Text>
                <Text style={[styles.activityLabel, { color: colors.textSecondary }]}>
                  {activity.label}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderAchievements = () => (
    <View style={styles.tabContent}>
      <View style={styles.achievementsList}>
        {achievements.map((achievement) => (
          <View 
            key={achievement._id} 
            style={[
              styles.achievementCard, 
              { backgroundColor: colors.surface },
              achievement.isUnlocked && { opacity: 0.8 }
            ]}
          >
            <View style={styles.achievementHeader}>
              <View style={[styles.achievementIcon, { backgroundColor: getRarityColor(achievement.rarity) + '20' }]}>
                <Ionicons name={achievement.icon as any} size={24} color={getRarityColor(achievement.rarity)} />
              </View>
              
              <View style={styles.achievementInfo}>
                <Text style={[styles.achievementName, { color: colors.text }]}>
                  {achievement.name}
                </Text>
                <Text style={[styles.achievementDescription, { color: colors.textSecondary }]}>
                  {achievement.description}
                </Text>
                
                <View style={styles.achievementMeta}>
                  <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(achievement.rarity) }]}>
                    <Text style={styles.rarityText}>
                      {achievement.rarity.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={[styles.pointsText, { color: colors.primary }]}>
                    +{achievement.points} pts
                  </Text>
                </View>
              </View>
            </View>
            
            {!achievement.isUnlocked && (
              <View style={styles.progressSection}>
                <View style={styles.progressInfo}>
                  <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                    Progreso: {achievement.progress} / {achievement.maxProgress}
                  </Text>
                  <Text style={[styles.progressPercentage, { color: colors.primary }]}>
                    {Math.round((achievement.progress / achievement.maxProgress) * 100)}%
                  </Text>
                </View>
                
                <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        backgroundColor: colors.primary,
                        width: `${(achievement.progress / achievement.maxProgress) * 100}%`
                      }
                    ]} 
                  />
                </View>
              </View>
            )}
            
            {achievement.isUnlocked && (
              <View style={styles.unlockedInfo}>
                <Text style={[styles.unlockedText, { color: colors.primary }]}>
                  ✓ Desbloqueado {achievement.unlockedAt && 
                    new Date(achievement.unlockedAt).toLocaleDateString('es-ES')
                  }
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );

  const renderBadges = () => (
    <View style={styles.tabContent}>
      <View style={styles.badgesGrid}>
        {badges.map((badge) => (
          <TouchableOpacity
            key={badge._id}
            style={[
              styles.badgeCard,
              { backgroundColor: colors.surface },
              !badge.isEarned && { opacity: 0.6 }
            ]}
            onPress={() => {
              if (badge.isEarned) {
                Alert.alert(badge.name, badge.description);
              } else {
                Alert.alert('Badge Bloqueado', 'Aún no has desbloqueado este badge');
              }
            }}
          >
            <View style={[styles.badgeIcon, { backgroundColor: getRarityColor(badge.rarity) + '20' }]}>
              <Ionicons name={badge.icon as any} size={32} color={getRarityColor(badge.rarity)} />
            </View>
            
            <Text style={[styles.badgeName, { color: colors.text }]} numberOfLines={2}>
              {badge.name}
            </Text>
            
            <Text style={[styles.badgeCategory, { color: colors.textSecondary }]}>
              {badge.category}
            </Text>
            
            {badge.isEarned && (
              <View style={[styles.earnedBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.earnedText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderLeaderboard = () => (
    <View style={styles.tabContent}>
      <View style={styles.leaderboardList}>
        {leaderboard.map((entry) => (
          <View 
            key={entry._id} 
            style={[
              styles.leaderboardEntry,
              { backgroundColor: colors.surface },
              entry.isCurrentUser && { backgroundColor: colors.primary + '20' }
            ]}
          >
            <View style={styles.rankSection}>
              <View style={[
                styles.rankBadge,
                { 
                  backgroundColor: entry.rank <= 3 ? '#FFD700' : colors.primary,
                  borderColor: entry.rank <= 3 ? '#FFD700' : colors.primary
                }
              ]}>
                <Text style={[
                  styles.rankText,
                  { color: entry.rank <= 3 ? '#000' : 'white' }
                ]}>
                  #{entry.rank}
                </Text>
              </View>
            </View>
            
            <View style={styles.userSection}>
              <View style={styles.userInfo}>
                {entry.avatar ? (
                  <Image source={{ uri: entry.avatar }} style={styles.userAvatar} />
                ) : (
                  <View style={[styles.userAvatar, { backgroundColor: colors.primary }]}>
                    <Text style={styles.userInitial}>
                      {entry.username.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                
                <View style={styles.userDetails}>
                  <Text style={[
                    styles.username,
                    { color: entry.isCurrentUser ? colors.primary : colors.text }
                  ]}>
                    {entry.username}
                  </Text>
                  <Text style={[styles.userLevel, { color: colors.textSecondary }]}>
                    Nivel {entry.level}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.scoreSection}>
              <Text style={[styles.score, { color: colors.primary }]}>
                {entry.points.toLocaleString()}
              </Text>
              <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>
                puntos
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={[styles.tabsContainer, { backgroundColor: colors.surface }]}>
      {[
        { key: 'overview', label: 'Resumen', icon: 'grid' },
        { key: 'achievements', label: 'Logros', icon: 'trophy' },
        { key: 'badges', label: 'Badges', icon: 'star' },
        { key: 'leaderboard', label: 'Ranking', icon: 'trending-up' },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tab,
            selectedTab === tab.key && { backgroundColor: colors.primary + '20' }
          ]}
          onPress={() => setSelectedTab(tab.key as any)}
        >
          <Ionicons
            name={tab.icon as any}
            size={20}
            color={selectedTab === tab.key ? colors.primary : colors.textSecondary}
          />
          <Text style={[
            styles.tabLabel,
            { color: selectedTab === tab.key ? colors.primary : colors.textSecondary }
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Gamificación
        </Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => Alert.alert('Info', 'Ayuda de gamificación en desarrollo')}
        >
          <Ionicons name="help-circle" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      {renderTabs()}

      {/* Tab Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {selectedTab === 'overview' && renderOverview()}
        {selectedTab === 'achievements' && renderAchievements()}
        {selectedTab === 'badges' && renderBadges()}
        {selectedTab === 'leaderboard' && renderLeaderboard()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerButton: {
    padding: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 8,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  tabContent: {
    gap: 20,
  },
  levelCard: {
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelInfo: {
    flex: 1,
  },
  levelNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  levelPoints: {
    fontSize: 14,
  },
  levelIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (width - 44) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  activityCard: {
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  activityStats: {
    gap: 16,
  },
  activityStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityInfo: {
    flex: 1,
  },
  activityValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  activityLabel: {
    fontSize: 14,
  },
  achievementsList: {
    gap: 16,
  },
  achievementCard: {
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  achievementHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  achievementMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressSection: {
    marginTop: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  unlockedInfo: {
    marginTop: 8,
    alignItems: 'center',
  },
  unlockedText: {
    fontSize: 14,
    fontWeight: '600',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  badgeCard: {
    width: (width - 48) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    position: 'relative',
  },
  badgeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeCategory: {
    fontSize: 12,
    textAlign: 'center',
  },
  earnedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  earnedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  leaderboardList: {
    gap: 12,
  },
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  rankSection: {
    marginRight: 16,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  userSection: {
    flex: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInitial: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userLevel: {
    fontSize: 12,
  },
  scoreSection: {
    alignItems: 'flex-end',
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  scoreLabel: {
    fontSize: 12,
  },
});
