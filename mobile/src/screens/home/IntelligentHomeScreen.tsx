import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useThemedStyles } from '../../contexts/ThemeContext';
import { PullToRefresh } from '../../components/gestures/PullToRefresh';
import EventsService from '../../services/EventsService';

const { width, height } = Dimensions.get('window');

// ===== INTERFACES =====
interface User {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  location?: {
    city: string;
    coordinates: number[];
  };
  interests: string[];
  stats: {
    eventsAttended: number;
    eventsHosted: number;
    followers: number;
    following: number;
  };
}

interface RecommendedEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  location: {
    address: string;
    distance: number;
  };
  organizer: {
    name: string;
    avatar: string;
    rating: number;
  };
  attendees: number;
  price: number;
  rating: number;
  reasons: string[];
  confidence: number;
  category: string;
}

interface LocalDemand {
  category: string;
  demandCount: number;
  potentialAttendees: number;
  competitionLevel: 'low' | 'medium' | 'high';
  trending: boolean;
  opportunityScore: number;
}

interface TopHost {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  totalEvents: number;
  specialties: string[];
  followerCount: number;
  isFollowing: boolean;
}

// ===== INTELLIGENT HOME SCREEN COMPONENT =====
export const IntelligentHomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const styles = useThemedStyles();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [recommendedEvents, setRecommendedEvents] = useState<RecommendedEvent[]>([]);
  const [localDemand, setLocalDemand] = useState<LocalDemand[]>([]);
  const [topHosts, setTopHosts] = useState<TopHost[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // ===== LOAD DATA =====
  useEffect(() => {
    loadHomeData();
    
    // Update time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const loadHomeData = async () => {
    try {
      setIsLoading(true);
      
      // Mock data - replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
      
      setUser({
        id: '1',
        firstName: 'María',
        lastName: 'González',
        avatar: 'https://example.com/avatar.jpg',
        location: { city: 'Madrid', coordinates: [-3.7038, 40.4168] },
        interests: ['music', 'technology', 'art'],
        stats: { eventsAttended: 23, eventsHosted: 5, followers: 156, following: 89 }
      });

      setRecommendedEvents([
        {
          id: '1',
          title: 'Conferencia Tech Madrid 2024',
          description: 'Las últimas tendencias en tecnología',
          startDate: '2024-02-15T18:00:00Z',
          location: { address: 'Centro de Convenciones', distance: 2.3 },
          organizer: { name: 'Tech Hub', avatar: 'url', rating: 4.8 },
          attendees: 234,
          price: 45,
          rating: 4.9,
          reasons: ['Coincide con tu interés en tecnología', 'Cerca de tu ubicación'],
          confidence: 92,
          category: 'technology'
        },
        {
          id: '2',
          title: 'Concierto Indie Rock',
          description: 'Bandas emergentes de la escena local',
          startDate: '2024-02-18T21:00:00Z',
          location: { address: 'Sala But', distance: 1.8 },
          organizer: { name: 'Music Events', avatar: 'url', rating: 4.6 },
          attendees: 89,
          price: 25,
          rating: 4.7,
          reasons: ['Te gusta la música indie', 'Evento muy bien valorado'],
          confidence: 87,
          category: 'music'
        }
      ]);

      setLocalDemand([
        {
          category: 'Música',
          demandCount: 125,
          potentialAttendees: 89,
          competitionLevel: 'medium',
          trending: true,
          opportunityScore: 78
        },
        {
          category: 'Tecnología',
          demandCount: 89,
          potentialAttendees: 67,
          competitionLevel: 'low',
          trending: true,
          opportunityScore: 85
        },
        {
          category: 'Arte',
          demandCount: 67,
          potentialAttendees: 45,
          competitionLevel: 'high',
          trending: false,
          opportunityScore: 62
        }
      ]);

      setTopHosts([
        {
          id: '1',
          name: 'Juan Rodríguez',
          avatar: 'https://example.com/host1.jpg',
          rating: 4.9,
          totalEvents: 32,
          specialties: ['Tecnología', 'Negocios'],
          followerCount: 890,
          isFollowing: false
        },
        {
          id: '2',
          name: 'Ana Martín',
          avatar: 'https://example.com/host2.jpg',
          rating: 4.7,
          totalEvents: 28,
          specialties: ['Música', 'Arte'],
          followerCount: 650,
          isFollowing: true
        }
      ]);
      
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadHomeData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return '¡Buenos días';
    if (hour < 18) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) return `${Math.round(distance * 1000)}m`;
    return `${distance.toFixed(1)}km`;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      'technology': 'laptop-outline',
      'music': 'musical-notes-outline',
      'art': 'color-palette-outline',
      'business': 'briefcase-outline',
      'sports': 'fitness-outline',
      'food': 'restaurant-outline'
    };
    return icons[category] || 'calendar-outline';
  };

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // ===== RENDER SECTIONS =====
  const renderPersonalizedHeader = () => (
    <LinearGradient
      colors={[styles.colors.background, styles.colors.surface + '40']}
      style={componentStyles.headerGradient}
    >
      <View style={componentStyles.headerContent}>
        <View style={componentStyles.greetingSection}>
          <Text style={[componentStyles.greeting, { color: styles.colors.text }]}>
            {getGreeting()}{user ? `, ${user.firstName}` : ''}!
          </Text>
          
          {user && (
            <View style={componentStyles.locationInfo}>
              <Ionicons name="location" size={16} color={styles.colors.primary} />
              <Text style={[componentStyles.locationText, { color: styles.colors.text }]}>
                {user.location?.city || 'Madrid'}
              </Text>
              <View style={componentStyles.statsRow}>
                <View style={componentStyles.statItem}>
                  <Ionicons name="flame" size={14} color="#f59e0b" />
                  <Text style={[componentStyles.statText, { color: styles.colors.text }]}>
                    {recommendedEvents.length} recomendados
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={componentStyles.profileImage}
          onPress={() => navigation.navigate('Profile')}
        >
          <Image 
            source={{ uri: user?.avatar || 'https://via.placeholder.com/50' }}
            style={componentStyles.avatar}
          />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const renderQuickActions = () => (
    <View style={componentStyles.quickActions}>
      <TouchableOpacity 
        style={[componentStyles.actionButton, { backgroundColor: styles.colors.primary }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          navigation.navigate('CreateEvent');
        }}
      >
        <Ionicons name="add" size={20} color="white" />
        <Text style={componentStyles.actionButtonText}>Crear Evento</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[componentStyles.actionButton, { backgroundColor: styles.colors.secondary }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          navigation.navigate('Explore');
        }}
      >
        <Ionicons name="search" size={20} color="white" />
        <Text style={componentStyles.actionButtonText}>Explorar</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRecommendedEvents = () => (
    <View style={componentStyles.section}>
      <View style={componentStyles.sectionHeader}>
        <View style={componentStyles.sectionTitleRow}>
          <Ionicons name="sparkles" size={24} color={styles.colors.primary} />
          <Text style={[componentStyles.sectionTitle, { color: styles.colors.text }]}>
            Recomendado para ti
          </Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Recommendations')}>
          <Text style={[componentStyles.seeAll, { color: styles.colors.primary }]}>
            Ver todos
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={componentStyles.horizontalScroll}
      >
        {recommendedEvents.map((event, index) => (
          <TouchableOpacity
            key={event.id}
            style={[componentStyles.eventCard, { backgroundColor: styles.colors.surface }]}
            onPress={() => {
              Haptics.selectionAsync();
              navigation.navigate('EventDetails', { eventId: event.id });
            }}
            activeOpacity={0.7}
          >
            <View style={componentStyles.eventCardHeader}>
              <View style={componentStyles.categoryBadge}>
                <Ionicons 
                  name={getCategoryIcon(event.category)} 
                  size={12} 
                  color={styles.colors.primary} 
                />
              </View>
              <View style={componentStyles.confidenceBadge}>
                <Text style={componentStyles.confidenceText}>{event.confidence}%</Text>
              </View>
            </View>

            <Text style={[componentStyles.eventTitle, { color: styles.colors.text }]} numberOfLines={2}>
              {event.title}
            </Text>

            <View style={componentStyles.eventMeta}>
              <View style={componentStyles.metaRow}>
                <Ionicons name="location-outline" size={14} color={styles.colors.text + '80'} />
                <Text style={[componentStyles.metaText, { color: styles.colors.text + '80' }]}>
                  {formatDistance(event.location.distance)}
                </Text>
              </View>
              
              <View style={componentStyles.metaRow}>
                <Ionicons name="people-outline" size={14} color={styles.colors.text + '80'} />
                <Text style={[componentStyles.metaText, { color: styles.colors.text + '80' }]}>
                  {event.attendees}
                </Text>
              </View>
            </View>

            <View style={componentStyles.aiReason}>
              <Text style={[componentStyles.aiReasonText, { color: styles.colors.primary }]}>
                💡 {event.reasons[0]}
              </Text>
            </View>

            <View style={componentStyles.eventFooter}>
              <Text style={[componentStyles.eventPrice, { color: styles.colors.text }]}>
                {event.price === 0 ? 'Gratis' : `$${event.price}`}
              </Text>
              <View style={componentStyles.ratingRow}>
                <Ionicons name="star" size={14} color="#fbbf24" />
                <Text style={[componentStyles.ratingText, { color: styles.colors.text }]}>
                  {event.rating}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderLocalDemand = () => (
    <View style={componentStyles.section}>
      <View style={componentStyles.sectionHeader}>
        <View style={componentStyles.sectionTitleRow}>
          <Ionicons name="trending-up" size={24} color="#10b981" />
          <Text style={[componentStyles.sectionTitle, { color: styles.colors.text }]}>
            Oportunidades cerca
          </Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('MarketInsights')}>
          <Text style={[componentStyles.seeAll, { color: styles.colors.primary }]}>
            Análisis
          </Text>
        </TouchableOpacity>
      </View>

      <View style={componentStyles.demandGrid}>
        {localDemand.slice(0, 3).map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[componentStyles.demandCard, { backgroundColor: styles.colors.surface }]}
            onPress={() => {
              Haptics.selectionAsync();
              navigation.navigate('CreateEvent', { suggestedCategory: item.category.toLowerCase() });
            }}
            activeOpacity={0.7}
          >
            <View style={componentStyles.demandHeader}>
              <Text style={[componentStyles.demandCategory, { color: styles.colors.text }]}>
                {item.category}
              </Text>
              {item.trending && (
                <Ionicons name="flame" size={16} color="#f59e0b" />
              )}
            </View>

            <View style={componentStyles.demandStats}>
              <Text style={[componentStyles.demandCount, { color: styles.colors.primary }]}>
                {item.demandCount} personas buscan
              </Text>
              <Text style={[componentStyles.demandPotential, { color: styles.colors.text + '80' }]}>
                ~{item.potentialAttendees} asistentes potenciales
              </Text>
            </View>

            <View style={componentStyles.competitionRow}>
              <View 
                style={[
                  componentStyles.competitionBadge,
                  { backgroundColor: getCompetitionColor(item.competitionLevel) + '20' }
                ]}
              >
                <Text 
                  style={[
                    componentStyles.competitionText,
                    { color: getCompetitionColor(item.competitionLevel) }
                  ]}
                >
                  {item.competitionLevel === 'low' ? 'Baja competencia' :
                   item.competitionLevel === 'medium' ? 'Competencia media' :
                   'Alta competencia'}
                </Text>
              </View>
            </View>

            <View style={componentStyles.opportunityScore}>
              <Text style={[componentStyles.scoreText, { color: styles.colors.text }]}>
                Oportunidad: {item.opportunityScore}/100
              </Text>
              <View style={componentStyles.scoreBar}>
                <View 
                  style={[
                    componentStyles.scoreProgress,
                    { 
                      width: `${item.opportunityScore}%`,
                      backgroundColor: item.opportunityScore > 70 ? '#10b981' : '#f59e0b'
                    }
                  ]}
                />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderTopHosts = () => (
    <View style={componentStyles.section}>
      <View style={componentStyles.sectionHeader}>
        <View style={componentStyles.sectionTitleRow}>
          <Ionicons name="star" size={24} color="#fbbf24" />
          <Text style={[componentStyles.sectionTitle, { color: styles.colors.text }]}>
            Anfitriones destacados
          </Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('TopHosts')}>
          <Text style={[componentStyles.seeAll, { color: styles.colors.primary }]}>
            Ver todos
          </Text>
        </TouchableOpacity>
      </View>

      <View style={componentStyles.hostsList}>
        {topHosts.map((host, index) => (
          <TouchableOpacity
            key={host.id}
            style={[componentStyles.hostCard, { backgroundColor: styles.colors.surface }]}
            onPress={() => {
              Haptics.selectionAsync();
              navigation.navigate('HostProfile', { hostId: host.id });
            }}
            activeOpacity={0.7}
          >
            <Image 
              source={{ uri: host.avatar }}
              style={componentStyles.hostAvatar}
            />
            
            <View style={componentStyles.hostInfo}>
              <Text style={[componentStyles.hostName, { color: styles.colors.text }]}>
                {host.name}
              </Text>
              
              <View style={componentStyles.hostMeta}>
                <View style={componentStyles.metaRow}>
                  <Ionicons name="star" size={12} color="#fbbf24" />
                  <Text style={[componentStyles.hostRating, { color: styles.colors.text }]}>
                    {host.rating}
                  </Text>
                </View>
                <Text style={[componentStyles.hostEvents, { color: styles.colors.text + '80' }]}>
                  {host.totalEvents} eventos
                </Text>
              </View>

              <View style={componentStyles.specialtiesRow}>
                {host.specialties.slice(0, 2).map((specialty, i) => (
                  <View 
                    key={i} 
                    style={[
                      componentStyles.specialtyBadge,
                      { backgroundColor: styles.colors.primary + '20' }
                    ]}
                  >
                    <Text 
                      style={[
                        componentStyles.specialtyText,
                        { color: styles.colors.primary }
                      ]}
                    >
                      {specialty}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[
                componentStyles.followButton,
                { 
                  backgroundColor: host.isFollowing 
                    ? styles.colors.surface 
                    : styles.colors.primary,
                  borderColor: styles.colors.primary
                }
              ]}
              onPress={(e) => {
                e.stopPropagation();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // Handle follow/unfollow
              }}
            >
              <Text 
                style={[
                  componentStyles.followButtonText,
                  { 
                    color: host.isFollowing 
                      ? styles.colors.primary 
                      : 'white'
                  }
                ]}
              >
                {host.isFollowing ? 'Siguiendo' : 'Seguir'}
              </Text>
            </TouchableOpacity>
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
          Cargando tu contenido personalizado...
        </Text>
      </View>
    );
  }

  return (
    <PullToRefresh onRefresh={onRefresh} refreshing={refreshing}>
      <ScrollView 
        style={[componentStyles.container, { backgroundColor: styles.colors.background }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={styles.colors.primary}
          />
        }
      >
        {renderPersonalizedHeader()}
        {renderQuickActions()}
        {renderRecommendedEvents()}
        {renderLocalDemand()}
        {renderTopHosts()}
        
        <View style={componentStyles.bottomSpacer} />
      </ScrollView>
    </PullToRefresh>
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
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  locationText: {
    marginLeft: 4,
    fontSize: 14,
    marginRight: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    marginLeft: 4,
    fontSize: 12,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
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
  horizontalScroll: {
    paddingRight: 20,
  },
  eventCard: {
    width: width * 0.7,
    marginRight: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  eventCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confidenceBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#10b981',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 20,
  },
  eventMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  aiReason: {
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  aiReasonText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  demandGrid: {
    gap: 12,
  },
  demandCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  demandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  demandCategory: {
    fontSize: 16,
    fontWeight: '600',
  },
  demandStats: {
    marginBottom: 12,
  },
  demandCount: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  demandPotential: {
    fontSize: 12,
  },
  competitionRow: {
    marginBottom: 12,
  },
  competitionBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  competitionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  opportunityScore: {
    gap: 4,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scoreBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  scoreProgress: {
    height: '100%',
    borderRadius: 2,
  },
  hostsList: {
    gap: 12,
  },
  hostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  hostAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  hostInfo: {
    flex: 1,
  },
  hostName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  hostMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  hostRating: {
    fontSize: 12,
    marginLeft: 2,
  },
  hostEvents: {
    fontSize: 12,
  },
  specialtiesRow: {
    flexDirection: 'row',
    gap: 6,
  },
  specialtyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  specialtyText: {
    fontSize: 10,
    fontWeight: '500',
  },
  followButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  followButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 100,
  },
});

export default IntelligentHomeScreen;
