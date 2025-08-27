import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Image,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import { 
  Calendar, Users, FileText, Star, TrendingUp, MapPin, 
  Clock, Heart, Share2, Bookmark, Eye, Zap, Award
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  venue?: string;
  location: {
    city: string;
    country: string;
  };
  currentAttendees: number;
  maxAttendees: number;
  category: string;
  price: number;
  isOnline: boolean;
  host: {
    username: string;
    avatar?: string;
  };
}

interface Tribe {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  maxMembers: number;
  category: string;
  isPrivate: boolean;
  host: {
    username: string;
    avatar?: string;
  };
}

interface Post {
  id: string;
  title: string;
  content: string;
  type: string;
  likes: number;
  author: {
    username: string;
    avatar?: string;
  };
  createdAt: string;
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard data
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/dashboard-stats');
      return response.data;
    },
  });

  // Fetch recent events
  const { data: recentEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['recent-events'],
    queryFn: async () => {
      const response = await apiClient.get('/events?limit=5&sort=recent');
      return response.data;
    },
  });

  // Fetch trending tribes
  const { data: trendingTribes, isLoading: tribesLoading } = useQuery({
    queryKey: ['trending-tribes'],
    queryFn: async () => {
      const response = await apiClient.get('/tribes?sort=popular&limit=5');
      return response.data;
    },
  });

  // Fetch recent posts
  const { data: recentPosts, isLoading: postsLoading } = useQuery({
    queryKey: ['recent-posts'],
    queryFn: async () => {
      const response = await apiClient.get('/posts?limit=5&sort=recent');
      return response.data;
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // Refetch all queries
    await Promise.all([
      // Add refetch calls here
    ]);
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    if (diffInHours < 48) return 'Ayer';
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'event':
        navigation.navigate('CreateEvent' as never);
        break;
      case 'tribe':
        navigation.navigate('CreateTribe' as never);
        break;
      case 'post':
        navigation.navigate('CreatePost' as never);
        break;
    }
  };

  const renderStatsCard = (title: string, value: number, icon: React.ReactNode, color: string) => (
    <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.statsIcon, { backgroundColor: color + '20' }]}>
        {icon}
      </View>
      <Text style={[styles.statsValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>{title}</Text>
    </View>
  );

  const renderEventCard = (event: Event) => (
    <TouchableOpacity
      key={event.id}
      style={[styles.eventCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => navigation.navigate('EventDetail' as never, { eventId: event.id } as never)}
    >
      <View style={styles.eventHeader}>
        <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={2}>
          {event.title}
        </Text>
        <View style={styles.eventCategory}>
          <Text style={[styles.eventCategoryText, { color: colors.primary }]}>
            {event.category}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.eventDescription, { color: colors.textSecondary }]} numberOfLines={2}>
        {event.description}
      </Text>
      
      <View style={styles.eventDetails}>
        <View style={styles.eventDetail}>
          <Calendar size={16} color={colors.textSecondary} />
          <Text style={[styles.eventDetailText, { color: colors.textSecondary }]}>
            {formatDate(event.startDate)}
          </Text>
        </View>
        
        <View style={styles.eventDetail}>
          <MapPin size={16} color={colors.textSecondary} />
          <Text style={[styles.eventDetailText, { color: colors.textSecondary }]}>
            {event.venue || event.location.city}
          </Text>
        </View>
        
        <View style={styles.eventDetail}>
          <Users size={16} color={colors.textSecondary} />
          <Text style={[styles.eventDetailText, { color: colors.textSecondary }]}>
            {event.currentAttendees}/{event.maxAttendees}
          </Text>
        </View>
      </View>
      
      <View style={styles.eventFooter}>
        <View style={styles.eventHost}>
          {event.host.avatar ? (
            <Image source={{ uri: event.host.avatar }} style={styles.hostAvatar} />
          ) : (
            <View style={[styles.hostAvatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.hostInitial}>{event.host.username.charAt(0)}</Text>
            </View>
          )}
          <Text style={[styles.hostName, { color: colors.textSecondary }]}>
            @{event.host.username}
          </Text>
        </View>
        
        <View style={styles.eventActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Heart size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Bookmark size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Share2 size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTribeCard = (tribe: Tribe) => (
    <TouchableOpacity
      key={tribe.id}
      style={[styles.tribeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => navigation.navigate('TribeDetail' as never, { tribeId: tribe.id } as never)}
    >
      <View style={styles.tribeHeader}>
        <Text style={[styles.tribeName, { color: colors.text }]} numberOfLines={1}>
          {tribe.name}
        </Text>
        <View style={[styles.tribePrivacy, { backgroundColor: tribe.isPrivate ? colors.warning + '20' : colors.success + '20' }]}>
          <Text style={[styles.tribePrivacyText, { color: tribe.isPrivate ? colors.warning : colors.success }]}>
            {tribe.isPrivate ? 'Privada' : 'Pública'}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.tribeDescription, { color: colors.textSecondary }]} numberOfLines={2}>
        {tribe.description}
      </Text>
      
      <View style={styles.tribeDetails}>
        <View style={styles.tribeDetail}>
          <Users size={16} color={colors.textSecondary} />
          <Text style={[styles.tribeDetailText, { color: colors.textSecondary }]}>
            {tribe.memberCount}/{tribe.maxMembers} miembros
          </Text>
        </View>
        
        <View style={styles.tribeDetail}>
          <Text style={[styles.tribeCategory, { color: colors.primary }]}>
            {tribe.category}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPostCard = (post: Post) => (
    <TouchableOpacity
      key={post.id}
      style={[styles.postCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => navigation.navigate('PostDetail' as never, { postId: post.id } as never)}
    >
      <View style={styles.postHeader}>
        <View style={styles.postAuthor}>
          {post.author.avatar ? (
            <Image source={{ uri: post.author.avatar }} style={styles.authorAvatar} />
          ) : (
            <View style={[styles.authorAvatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.authorInitial}>{post.author.username.charAt(0)}</Text>
            </View>
          )}
          <View>
            <Text style={[styles.authorName, { color: colors.text }]}>
              @{post.author.username}
            </Text>
            <Text style={[styles.postTime, { color: colors.textSecondary }]}>
              {formatDate(post.createdAt)}
            </Text>
          </View>
        </View>
        
        <View style={styles.postType}>
          <Text style={[styles.postTypeText, { color: colors.secondary }]}>
            {post.type}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.postTitle, { color: colors.text }]} numberOfLines={2}>
        {post.title}
      </Text>
      
      <Text style={[styles.postContent, { color: colors.textSecondary }]} numberOfLines={3}>
        {post.content}
      </Text>
      
      <View style={styles.postFooter}>
        <View style={styles.postStats}>
          <View style={styles.postStat}>
            <Heart size={16} color={colors.primary} />
            <Text style={[styles.postStatText, { color: colors.textSecondary }]}>
              {post.likes}
            </Text>
          </View>
          
          <View style={styles.postStat}>
            <Eye size={16} color={colors.textSecondary} />
            <Text style={[styles.postStatText, { color: colors.textSecondary }]}>
              0
            </Text>
          </View>
        </View>
        
        <View style={styles.postActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Heart size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Bookmark size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Share2 size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.text }]}>
            ¡Hola, {user?.firstName || 'Usuario'}! 👋
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            ¿Qué te gustaría hacer hoy?
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.profileButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('Profile' as never)}
        >
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.profileAvatar} />
          ) : (
            <Text style={styles.profileInitial}>{user?.firstName?.charAt(0) || 'U'}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.quickAction, { backgroundColor: colors.primary }]}
          onPress={() => handleQuickAction('event')}
        >
          <Calendar size={24} color="white" />
          <Text style={styles.quickActionText}>Crear Evento</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.quickAction, { backgroundColor: colors.secondary }]}
          onPress={() => handleQuickAction('tribe')}
        >
          <Users size={24} color="white" />
          <Text style={styles.quickActionText}>Crear Tribu</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.quickAction, { backgroundColor: colors.info }]}
          onPress={() => handleQuickAction('post')}
        >
          <FileText size={24} color="white" />
          <Text style={styles.quickActionText}>Crear Post</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Resumen</Text>
        <View style={styles.statsGrid}>
          {renderStatsCard(
            'Eventos',
            stats?.totalEvents || 0,
            <Calendar size={20} color={colors.primary} />,
            colors.primary
          )}
          {renderStatsCard(
            'Tribus',
            stats?.totalTribes || 0,
            <Users size={20} color={colors.success} />,
            colors.success
          )}
          {renderStatsCard(
            'Posts',
            stats?.totalPosts || 0,
            <FileText size={20} color={colors.secondary} />,
            colors.secondary
          )}
          {renderStatsCard(
            'Usuarios',
            stats?.totalUsers || 0,
            <Star size={20} color={colors.warning} />,
            colors.warning
          )}
        </View>
      </View>

      {/* Recent Events */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Eventos Recientes</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Events' as never)}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {recentEvents?.map(renderEventCard)}
        </ScrollView>
      </View>

      {/* Trending Tribes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Tribus en Tendencia</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Tribes' as never)}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>Ver todas</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {trendingTribes?.map(renderTribeCard)}
        </ScrollView>
      </View>

      {/* Recent Posts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Posts Recientes</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Posts' as never)}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.postsGrid}>
          {recentPosts?.map(renderPostCard)}
        </View>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  profileInitial: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  quickAction: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 100,
  },
  quickActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statsCard: {
    width: (width - 60) / 2,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 12,
  },
  statsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  horizontalScroll: {
    paddingLeft: 20,
  },
  eventCard: {
    width: 280,
    marginRight: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  eventCategory: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#E0E7FF',
    borderRadius: 8,
  },
  eventCategoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  eventDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  eventDetails: {
    marginBottom: 12,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventDetailText: {
    fontSize: 12,
    marginLeft: 6,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventHost: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  hostInitial: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  hostName: {
    fontSize: 12,
  },
  eventActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 6,
    marginLeft: 4,
  },
  tribeCard: {
    width: 200,
    marginRight: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  tribeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tribeName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  tribePrivacy: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tribePrivacyText: {
    fontSize: 10,
    fontWeight: '600',
  },
  tribeDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  tribeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tribeDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tribeDetailText: {
    fontSize: 12,
    marginLeft: 6,
  },
  tribeCategory: {
    fontSize: 12,
    fontWeight: '600',
  },
  postsGrid: {
    paddingHorizontal: 20,
  },
  postCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  postAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  authorInitial: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
  },
  postTime: {
    fontSize: 12,
  },
  postType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F3E8FF',
    borderRadius: 8,
  },
  postTypeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  postStatText: {
    fontSize: 12,
    marginLeft: 4,
  },
  postActions: {
    flexDirection: 'row',
  },
  bottomSpacing: {
    height: 100,
  },
});