import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useThemedStyles } from '../../contexts/ThemeContext';
import EventsService from '../../services/EventsService';

const { width } = Dimensions.get('window');

// ===== INTERFACES =====
interface HostStats {
  totalEvents: number;
  totalAttendees: number;
  averageRating: number;
  totalRevenue: number;
  growthMetrics: {
    eventsGrowth: number;
    attendeesGrowth: number;
    revenueGrowth: number;
    ratingGrowth: number;
  };
  thisMonth: {
    events: number;
    attendees: number;
    revenue: number;
    newFollowers: number;
  };
}

interface EventPerformance {
  id: string;
  title: string;
  date: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  attendees: {
    registered: number;
    confirmed: number;
    capacity: number;
  };
  revenue: number;
  rating: number;
  reviewCount: number;
  engagement: {
    views: number;
    shares: number;
    saves: number;
  };
}

interface Recommendation {
  type: 'pricing' | 'timing' | 'location' | 'content' | 'promotion';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  estimatedImprovement: string;
}

// ===== HOST DASHBOARD SCREEN COMPONENT =====
export const HostDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const styles = useThemedStyles();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hostStats, setHostStats] = useState<HostStats | null>(null);
  const [eventPerformance, setEventPerformance] = useState<EventPerformance[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [timeRange, setTimeRange] = useState('30d');

  // ===== LOAD DATA =====
  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Mock data - replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHostStats({
        totalEvents: 24,
        totalAttendees: 1847,
        averageRating: 4.7,
        totalRevenue: 18750,
        growthMetrics: {
          eventsGrowth: 15.3,
          attendeesGrowth: 23.7,
          revenueGrowth: 18.2,
          ratingGrowth: 2.1
        },
        thisMonth: {
          events: 3,
          attendees: 189,
          revenue: 2340,
          newFollowers: 47
        }
      });

      setEventPerformance([
        {
          id: '1',
          title: 'Conferencia Tech 2024',
          date: '2024-02-15',
          status: 'upcoming',
          attendees: { registered: 156, confirmed: 134, capacity: 200 },
          revenue: 7800,
          rating: 4.8,
          reviewCount: 23,
          engagement: { views: 1247, shares: 89, saves: 156 }
        },
        {
          id: '2',
          title: 'Workshop de Design UX',
          date: '2024-01-28',
          status: 'completed',
          attendees: { registered: 45, confirmed: 42, capacity: 50 },
          revenue: 2250,
          rating: 4.9,
          reviewCount: 38,
          engagement: { views: 567, shares: 34, saves: 67 }
        }
      ]);

      setRecommendations([
        {
          type: 'pricing',
          title: 'Optimizar precio de entrada',
          description: 'Podrías aumentar el precio 15% sin afectar la demanda',
          impact: 'high',
          estimatedImprovement: '+18% ingresos'
        },
        {
          type: 'timing',
          title: 'Mejor horario para eventos tech',
          description: 'Los martes y miércoles tienen 23% más asistencia',
          impact: 'medium',
          estimatedImprovement: '+23% asistencia'
        }
      ]);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return '#3b82f6';
      case 'ongoing': return '#10b981';
      case 'completed': return '#8b5cf6';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Próximo';
      case 'ongoing': return 'En curso';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'low': return '#6b7280';
      default: return '#6b7280';
    }
  };

  // ===== RENDER SECTIONS =====
  const renderHeader = () => (
    <LinearGradient
      colors={[styles.colors.background, styles.colors.surface + '40']}
      style={componentStyles.header}
    >
      <View style={componentStyles.headerContent}>
        <Text style={[componentStyles.headerTitle, { color: styles.colors.text }]}>
          Dashboard de Anfitrión
        </Text>
        <Text style={[componentStyles.headerSubtitle, { color: styles.colors.text + '80' }]}>
          Analiza y optimiza tus eventos
        </Text>
      </View>
      
      <TouchableOpacity
        style={[componentStyles.createButton, { backgroundColor: styles.colors.primary }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          navigation.navigate('CreateEvent');
        }}
      >
        <Ionicons name="add" size={20} color="white" />
        <Text style={componentStyles.createButtonText}>Crear</Text>
      </TouchableOpacity>
    </LinearGradient>
  );

  const renderStatsCards = () => (
    <View style={componentStyles.statsSection}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={componentStyles.statsScroll}
      >
        {[
          {
            title: 'Eventos',
            value: hostStats?.totalEvents || 0,
            change: hostStats?.growthMetrics.eventsGrowth || 0,
            icon: 'calendar-outline',
            color: '#06b6d4'
          },
          {
            title: 'Asistentes',
            value: hostStats?.totalAttendees || 0,
            change: hostStats?.growthMetrics.attendeesGrowth || 0,
            icon: 'people-outline',
            color: '#8b5cf6'
          },
          {
            title: 'Rating',
            value: hostStats?.averageRating || 0,
            change: hostStats?.growthMetrics.ratingGrowth || 0,
            icon: 'star-outline',
            color: '#fbbf24',
            format: 'rating'
          },
          {
            title: 'Ingresos',
            value: hostStats?.totalRevenue || 0,
            change: hostStats?.growthMetrics.revenueGrowth || 0,
            icon: 'cash-outline',
            color: '#10b981',
            format: 'currency'
          }
        ].map((stat, index) => (
          <View
            key={stat.title}
            style={[componentStyles.statCard, { backgroundColor: styles.colors.surface }]}
          >
            <View style={componentStyles.statCardHeader}>
              <View 
                style={[
                  componentStyles.statIcon,
                  { backgroundColor: stat.color + '20' }
                ]}
              >
                <Ionicons name={stat.icon as any} size={20} color={stat.color} />
              </View>
              
              <View 
                style={[
                  componentStyles.changeIndicator,
                  { 
                    backgroundColor: stat.change >= 0 ? '#10b981' + '20' : '#ef4444' + '20'
                  }
                ]}
              >
                <Ionicons 
                  name={stat.change >= 0 ? 'trending-up' : 'trending-down'} 
                  size={12} 
                  color={stat.change >= 0 ? '#10b981' : '#ef4444'} 
                />
                <Text 
                  style={[
                    componentStyles.changeText,
                    { color: stat.change >= 0 ? '#10b981' : '#ef4444' }
                  ]}
                >
                  {Math.abs(stat.change)}%
                </Text>
              </View>
            </View>

            <Text style={[componentStyles.statValue, { color: styles.colors.text }]}>
              {stat.format === 'currency' && '$'}
              {stat.format === 'rating' 
                ? stat.value.toFixed(1) 
                : stat.value.toLocaleString()
              }
            </Text>
            
            <Text style={[componentStyles.statLabel, { color: styles.colors.text + '80' }]}>
              {stat.title}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderEventPerformance = () => (
    <View style={componentStyles.section}>
      <View style={componentStyles.sectionHeader}>
        <Text style={[componentStyles.sectionTitle, { color: styles.colors.text }]}>
          Performance de Eventos
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('AllEvents')}>
          <Text style={[componentStyles.seeAll, { color: styles.colors.primary }]}>
            Ver todos
          </Text>
        </TouchableOpacity>
      </View>

      <View style={componentStyles.eventsContainer}>
        {eventPerformance.map((event, index) => (
          <TouchableOpacity
            key={event.id}
            style={[componentStyles.eventCard, { backgroundColor: styles.colors.surface }]}
            onPress={() => {
              Haptics.selectionAsync();
              navigation.navigate('EventAnalytics', { eventId: event.id });
            }}
            activeOpacity={0.7}
          >
            <View style={componentStyles.eventHeader}>
              <Text style={[componentStyles.eventTitle, { color: styles.colors.text }]} numberOfLines={1}>
                {event.title}
              </Text>
              <View 
                style={[
                  componentStyles.statusBadge,
                  { backgroundColor: getStatusColor(event.status) + '20' }
                ]}
              >
                <Text 
                  style={[
                    componentStyles.statusText,
                    { color: getStatusColor(event.status) }
                  ]}
                >
                  {getStatusLabel(event.status)}
                </Text>
              </View>
            </View>

            <View style={componentStyles.eventMetrics}>
              <View style={componentStyles.metricItem}>
                <Text style={[componentStyles.metricLabel, { color: styles.colors.text + '80' }]}>
                  Asistentes
                </Text>
                <Text style={[componentStyles.metricValue, { color: styles.colors.text }]}>
                  {event.attendees.confirmed}/{event.attendees.capacity}
                </Text>
              </View>

              <View style={componentStyles.metricItem}>
                <Text style={[componentStyles.metricLabel, { color: styles.colors.text + '80' }]}>
                  Rating
                </Text>
                <View style={componentStyles.ratingRow}>
                  <Ionicons name="star" size={14} color="#fbbf24" />
                  <Text style={[componentStyles.metricValue, { color: styles.colors.text }]}>
                    {event.rating}
                  </Text>
                </View>
              </View>

              <View style={componentStyles.metricItem}>
                <Text style={[componentStyles.metricLabel, { color: styles.colors.text + '80' }]}>
                  Ingresos
                </Text>
                <Text style={[componentStyles.metricValue, { color: '#10b981' }]}>
                  ${event.revenue.toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={componentStyles.engagementRow}>
              <View style={componentStyles.engagementItem}>
                <Ionicons name="eye-outline" size={14} color={styles.colors.text + '60'} />
                <Text style={[componentStyles.engagementText, { color: styles.colors.text + '60' }]}>
                  {event.engagement.views}
                </Text>
              </View>
              <View style={componentStyles.engagementItem}>
                <Ionicons name="share-outline" size={14} color={styles.colors.text + '60'} />
                <Text style={[componentStyles.engagementText, { color: styles.colors.text + '60' }]}>
                  {event.engagement.shares}
                </Text>
              </View>
              <View style={componentStyles.engagementItem}>
                <Ionicons name="bookmark-outline" size={14} color={styles.colors.text + '60'} />
                <Text style={[componentStyles.engagementText, { color: styles.colors.text + '60' }]}>
                  {event.engagement.saves}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderRecommendations = () => (
    <View style={componentStyles.section}>
      <View style={componentStyles.sectionHeader}>
        <View style={componentStyles.sectionTitleRow}>
          <Ionicons name="bulb-outline" size={20} color="#fbbf24" />
          <Text style={[componentStyles.sectionTitle, { color: styles.colors.text }]}>
            Recomendaciones IA
          </Text>
        </View>
      </View>

      <View style={componentStyles.recommendationsContainer}>
        {recommendations.map((rec, index) => (
          <TouchableOpacity
            key={index}
            style={[componentStyles.recommendationCard, { backgroundColor: styles.colors.surface }]}
            onPress={() => {
              Haptics.selectionAsync();
              // Handle recommendation action
            }}
            activeOpacity={0.7}
          >
            <View style={componentStyles.recommendationHeader}>
              <Text style={[componentStyles.recommendationTitle, { color: styles.colors.text }]}>
                {rec.title}
              </Text>
              <View 
                style={[
                  componentStyles.impactBadge,
                  { backgroundColor: getImpactColor(rec.impact) + '20' }
                ]}
              >
                <Text 
                  style={[
                    componentStyles.impactText,
                    { color: getImpactColor(rec.impact) }
                  ]}
                >
                  {rec.impact === 'high' ? 'Alto' : 
                   rec.impact === 'medium' ? 'Medio' : 'Bajo'} impacto
                </Text>
              </View>
            </View>

            <Text style={[componentStyles.recommendationDescription, { color: styles.colors.text + '80' }]}>
              {rec.description}
            </Text>

            <View style={componentStyles.improvementRow}>
              <Ionicons name="trending-up" size={16} color="#10b981" />
              <Text style={[componentStyles.improvementText, { color: '#10b981' }]}>
                {rec.estimatedImprovement}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={componentStyles.section}>
      <Text style={[componentStyles.sectionTitle, { color: styles.colors.text }]}>
        Acciones Rápidas
      </Text>

      <View style={componentStyles.actionsGrid}>
        {[
          { title: 'Analytics', icon: 'analytics-outline', color: '#8b5cf6', screen: 'Analytics' },
          { title: 'Reseñas', icon: 'chatbubble-outline', color: '#fbbf24', screen: 'Reviews' },
          { title: 'Configurar', icon: 'settings-outline', color: '#10b981', screen: 'Settings' },
          { title: 'Promocionar', icon: 'megaphone-outline', color: '#f59e0b', screen: 'Promote' }
        ].map((action, index) => (
          <TouchableOpacity
            key={action.title}
            style={[componentStyles.actionCard, { backgroundColor: styles.colors.surface }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate(action.screen);
            }}
            activeOpacity={0.7}
          >
            <View 
              style={[
                componentStyles.actionIcon,
                { backgroundColor: action.color + '20' }
              ]}
            >
              <Ionicons name={action.icon as any} size={24} color={action.color} />
            </View>
            <Text style={[componentStyles.actionTitle, { color: styles.colors.text }]}>
              {action.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[componentStyles.loadingContainer, { backgroundColor: styles.colors.background }]}>
        <Ionicons name="hourglass" size={48} color={styles.colors.primary} />
        <Text style={[componentStyles.loadingText, { color: styles.colors.text }]}>
          Cargando dashboard...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[componentStyles.container, { backgroundColor: styles.colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={styles.colors.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {renderHeader()}
      {renderStatsCards()}
      {renderEventPerformance()}
      {renderRecommendations()}
      {renderQuickActions()}
      
      <View style={componentStyles.bottomSpacer} />
    </ScrollView>
  );
};

// ===== STYLES =====
const componentStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  statsSection: {
    marginTop: 20,
  },
  statsScroll: {
    paddingHorizontal: 20,
    paddingRight: 40,
  },
  statCard: {
    width: width * 0.4,
    marginRight: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  changeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  eventsContainer: {
    gap: 12,
  },
  eventCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  eventMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  engagementRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  engagementText: {
    fontSize: 12,
  },
  recommendationsContainer: {
    gap: 12,
  },
  recommendationCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  impactBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  impactText: {
    fontSize: 10,
    fontWeight: '600',
  },
  recommendationDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  improvementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  improvementText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  actionCard: {
    width: (width - 52) / 2,
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 100,
  },
});

export default HostDashboardScreen;
