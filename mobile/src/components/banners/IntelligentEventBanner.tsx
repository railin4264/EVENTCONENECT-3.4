import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useThemedStyles } from '../../contexts/ThemeContext';
import EventsService from '../../services/EventsService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BANNER_HEIGHT = SCREEN_HEIGHT * 0.32;
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_SPACING = 16;

// ===== INTERFACES =====
interface FeaturedEvent {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  startDate: string;
  location: {
    address: string;
    coordinates: number[];
    distance?: number;
  };
  category: string;
  price: number;
  attendees: number;
  rating: number;
  organizer: {
    name: string;
    verified: boolean;
  };
  matchScore: number; // 0-100 based on user interests
  matchReasons: string[];
  isTrending: boolean;
  spotsLeft?: number;
}

interface BannerProps {
  userId?: string;
  userInterests?: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
  onEventPress: (eventId: string) => void;
}

// ===== INTELLIGENT EVENT BANNER COMPONENT =====
export const IntelligentEventBanner: React.FC<BannerProps> = ({
  userId,
  userInterests = [],
  location: userLocation,
  onEventPress,
}) => {
  const styles = useThemedStyles();
  const [featuredEvents, setFeaturedEvents] = useState<FeaturedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const autoScrollTimer = useRef<NodeJS.Timeout | null>(null);

  // ===== LOAD FEATURED EVENTS =====
  useEffect(() => {
    loadFeaturedEvents();
    
    // Auto-scroll timer
    startAutoScroll();
    
    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, [userLocation, userInterests]);

  const startAutoScroll = () => {
    autoScrollTimer.current = setInterval(() => {
      scrollToNext();
    }, 5000); // Change slide every 5 seconds
  };

  const scrollToNext = () => {
    if (scrollViewRef.current && featuredEvents.length > 0) {
      const nextIndex = (currentIndex + 1) % featuredEvents.length;
      scrollViewRef.current.scrollTo({
        x: nextIndex * (CARD_WIDTH + CARD_SPACING),
        animated: true,
      });
    }
  };

  const loadFeaturedEvents = async () => {
    try {
      setIsLoading(true);
      
      // Get user location if not provided
      let location = userLocation;
      if (!location) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const currentLocation = await Location.getCurrentPositionAsync({});
          location = {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          };
        }
      }

      // Call intelligent API that considers:
      // 1. User interests
      // 2. Location proximity
      // 3. Trending events
      // 4. Past behavior
      // 5. Social connections
      const response = await EventsService.getFeaturedEvents({
        userId,
        interests: userInterests,
        location,
        radius: 25, // 25km radius
        limit: 10,
        algorithm: 'intelligent', // Uses AI to rank events
      });

      if (response.success) {
        // Process and enrich events with match scores
        const enrichedEvents = response.data.map((event: any) => ({
          ...event,
          matchScore: calculateMatchScore(event, userInterests, location),
          matchReasons: getMatchReasons(event, userInterests, location),
        }));

        // Sort by match score and trending status
        const sortedEvents = enrichedEvents.sort((a, b) => {
          if (a.isTrending && !b.isTrending) return -1;
          if (!a.isTrending && b.isTrending) return 1;
          return b.matchScore - a.matchScore;
        });

        setFeaturedEvents(sortedEvents.slice(0, 5)); // Top 5 events
      }
    } catch (error) {
      console.error('Error loading featured events:', error);
      // Load mock data as fallback
      loadMockEvents();
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMatchScore = (event: any, interests: string[], location?: any): number => {
    let score = 0;
    
    // Interest match (40%)
    if (interests.includes(event.category)) {
      score += 40;
    } else if (event.tags?.some((tag: string) => interests.includes(tag))) {
      score += 20;
    }
    
    // Location proximity (30%)
    if (location && event.location?.distance) {
      if (event.location.distance < 5) score += 30;
      else if (event.location.distance < 10) score += 20;
      else if (event.location.distance < 20) score += 10;
    }
    
    // Popularity (20%)
    if (event.attendees > 100) score += 10;
    if (event.rating >= 4.5) score += 10;
    
    // Urgency (10%)
    const daysUntilEvent = getDaysUntilEvent(event.startDate);
    if (daysUntilEvent <= 3) score += 10;
    else if (daysUntilEvent <= 7) score += 5;
    
    return Math.min(score, 100);
  };

  const getMatchReasons = (event: any, interests: string[], location?: any): string[] => {
    const reasons = [];
    
    if (interests.includes(event.category)) {
      reasons.push(`Matches your interest in ${event.category}`);
    }
    
    if (event.location?.distance && event.location.distance < 5) {
      reasons.push(`Only ${event.location.distance.toFixed(1)}km away`);
    }
    
    if (event.isTrending) {
      reasons.push('Trending in your area');
    }
    
    if (event.attendees > 100) {
      reasons.push(`${event.attendees}+ people attending`);
    }
    
    if (event.spotsLeft && event.spotsLeft < 20) {
      reasons.push(`Only ${event.spotsLeft} spots left!`);
    }
    
    return reasons;
  };

  const getDaysUntilEvent = (eventDate: string): number => {
    const now = new Date();
    const event = new Date(eventDate);
    const diffTime = Math.abs(event.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const loadMockEvents = () => {
    // Fallback mock data
    const mockEvents: FeaturedEvent[] = [
      {
        id: '1',
        title: 'Tech Conference 2024',
        description: 'The biggest tech event of the year',
        imageUrl: 'https://example.com/tech.jpg',
        startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        location: {
          address: 'Convention Center, Downtown',
          coordinates: [-3.7038, 40.4168],
          distance: 2.5,
        },
        category: 'technology',
        price: 45,
        attendees: 234,
        rating: 4.8,
        organizer: {
          name: 'TechHub Madrid',
          verified: true,
        },
        matchScore: 92,
        matchReasons: ['Matches your interest in technology', 'Only 2.5km away', 'Trending in your area'],
        isTrending: true,
        spotsLeft: 15,
      },
      // Add more mock events...
    ];
    
    setFeaturedEvents(mockEvents);
  };

  // ===== SCROLL HANDLER =====
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
      const index = Math.round(event.contentOffset.x / (CARD_WIDTH + CARD_SPACING));
      runOnJS(setCurrentIndex)(index);
    },
  });

  const handleUserInteraction = () => {
    // Reset auto-scroll timer when user interacts
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
      startAutoScroll();
    }
  };

  // ===== RENDER EVENT CARD =====
  const renderEventCard = (event: FeaturedEvent, index: number) => {
    const inputRange = [
      (index - 1) * (CARD_WIDTH + CARD_SPACING),
      index * (CARD_WIDTH + CARD_SPACING),
      (index + 1) * (CARD_WIDTH + CARD_SPACING),
    ];

    const animatedStyle = useAnimatedStyle(() => {
      const scale = interpolate(
        scrollX.value,
        inputRange,
        [0.9, 1, 0.9],
        Extrapolate.CLAMP
      );

      const opacity = interpolate(
        scrollX.value,
        inputRange,
        [0.5, 1, 0.5],
        Extrapolate.CLAMP
      );

      return {
        transform: [{ scale }],
        opacity,
      };
    });

    return (
      <Animated.View key={event.id} style={[animatedStyle, componentStyles.cardContainer]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onEventPress(event.id);
          }}
          onPressIn={handleUserInteraction}
          style={componentStyles.card}
        >
          {/* Background Image */}
          <Image
            source={{ uri: event.imageUrl }}
            style={componentStyles.cardImage}
            resizeMode="cover"
          />
          
          {/* Gradient Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={componentStyles.gradient}
          />

          {/* Content */}
          <View style={componentStyles.cardContent}>
            {/* Top Row: Category & Match Score */}
            <View style={componentStyles.topRow}>
              <View style={[componentStyles.categoryBadge, { backgroundColor: getCategoryColor(event.category) }]}>
                <Ionicons name={getCategoryIcon(event.category)} size={12} color="white" />
                <Text style={componentStyles.categoryText}>{event.category.toUpperCase()}</Text>
              </View>
              
              {event.matchScore >= 80 && (
                <View style={componentStyles.matchBadge}>
                  <Ionicons name="sparkles" size={12} color="#fbbf24" />
                  <Text style={componentStyles.matchText}>{event.matchScore}% Match</Text>
                </View>
              )}

              {event.isTrending && (
                <View style={componentStyles.trendingBadge}>
                  <Ionicons name="flame" size={12} color="#ef4444" />
                  <Text style={componentStyles.trendingText}>HOT</Text>
                </View>
              )}
            </View>

            {/* Title & Description */}
            <Text style={componentStyles.eventTitle} numberOfLines={2}>
              {event.title}
            </Text>
            
            {/* Event Meta */}
            <View style={componentStyles.metaContainer}>
              <View style={componentStyles.metaItem}>
                <Ionicons name="calendar-outline" size={14} color="white" />
                <Text style={componentStyles.metaText}>
                  {new Date(event.startDate).toLocaleDateString('es-ES', { 
                    day: 'numeric', 
                    month: 'short' 
                  })}
                </Text>
              </View>
              
              <View style={componentStyles.metaItem}>
                <Ionicons name="location-outline" size={14} color="white" />
                <Text style={componentStyles.metaText}>
                  {event.location.distance ? `${event.location.distance.toFixed(1)}km` : event.location.address}
                </Text>
              </View>
              
              <View style={componentStyles.metaItem}>
                <Ionicons name="people-outline" size={14} color="white" />
                <Text style={componentStyles.metaText}>{event.attendees}</Text>
              </View>
            </View>

            {/* Match Reasons */}
            {event.matchReasons.length > 0 && (
              <View style={componentStyles.reasonsContainer}>
                <Text style={componentStyles.reasonText}>
                  💡 {event.matchReasons[0]}
                </Text>
              </View>
            )}

            {/* Bottom Row: Price & Action */}
            <View style={componentStyles.bottomRow}>
              <View>
                <Text style={componentStyles.priceLabel}>From</Text>
                <Text style={componentStyles.price}>
                  {event.price === 0 ? 'FREE' : `$${event.price}`}
                </Text>
              </View>
              
              {event.spotsLeft && event.spotsLeft < 50 && (
                <View style={componentStyles.urgencyBadge}>
                  <Text style={componentStyles.urgencyText}>
                    {event.spotsLeft} spots left
                  </Text>
                </View>
              )}
              
              <TouchableOpacity style={componentStyles.actionButton}>
                <Text style={componentStyles.actionText}>View</Text>
                <Ionicons name="arrow-forward" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // ===== PAGINATION DOTS =====
  const renderPaginationDots = () => {
    return (
      <View style={componentStyles.pagination}>
        {featuredEvents.map((_, index) => {
          const inputRange = [
            (index - 1) * (CARD_WIDTH + CARD_SPACING),
            index * (CARD_WIDTH + CARD_SPACING),
            (index + 1) * (CARD_WIDTH + CARD_SPACING),
          ];

          const animatedDotStyle = useAnimatedStyle(() => {
            const width = interpolate(
              scrollX.value,
              inputRange,
              [8, 24, 8],
              Extrapolate.CLAMP
            );

            const opacity = interpolate(
              scrollX.value,
              inputRange,
              [0.3, 1, 0.3],
              Extrapolate.CLAMP
            );

            return {
              width,
              opacity,
            };
          });

          return (
            <Animated.View
              key={index}
              style={[
                componentStyles.paginationDot,
                animatedDotStyle,
                { backgroundColor: styles.colors.primary },
              ]}
            />
          );
        })}
      </View>
    );
  };

  // ===== HELPER FUNCTIONS =====
  const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      technology: '#3b82f6',
      music: '#8b5cf6',
      sports: '#10b981',
      art: '#f59e0b',
      food: '#ef4444',
      business: '#6366f1',
      education: '#14b8a6',
      health: '#ec4899',
    };
    return colors[category] || '#6b7280';
  };

  const getCategoryIcon = (category: string): any => {
    const icons: { [key: string]: any } = {
      technology: 'laptop-outline',
      music: 'musical-notes-outline',
      sports: 'fitness-outline',
      art: 'color-palette-outline',
      food: 'restaurant-outline',
      business: 'briefcase-outline',
      education: 'school-outline',
      health: 'heart-outline',
    };
    return icons[category] || 'calendar-outline';
  };

  if (isLoading) {
    return (
      <View style={[componentStyles.container, { height: BANNER_HEIGHT }]}>
        <ActivityIndicator size="large" color={styles.colors.primary} />
      </View>
    );
  }

  if (featuredEvents.length === 0) {
    return null;
  }

  return (
    <View style={componentStyles.container}>
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={componentStyles.scrollContent}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onTouchStart={handleUserInteraction}
      >
        {featuredEvents.map((event, index) => renderEventCard(event, index))}
      </Animated.ScrollView>
      
      {renderPaginationDots()}
    </View>
  );
};

// ===== STYLES =====
const componentStyles = StyleSheet.create({
  container: {
    height: BANNER_HEIGHT,
    marginVertical: 16,
  },
  scrollContent: {
    paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: '100%',
    marginHorizontal: CARD_SPACING / 2,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1e293b',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  cardImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  cardContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
  },
  topRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  categoryText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  matchText: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: '600',
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  trendingText: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: '600',
  },
  eventTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  metaContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
  },
  reasonsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },
  reasonText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    fontStyle: 'italic',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    marginBottom: 2,
  },
  price: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  urgencyBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  actionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
  },
});

export default IntelligentEventBanner;
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useThemedStyles } from '../../contexts/ThemeContext';
import EventsService from '../../services/EventsService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BANNER_HEIGHT = SCREEN_HEIGHT * 0.32;
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_SPACING = 16;

// ===== INTERFACES =====
interface FeaturedEvent {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  startDate: string;
  location: {
    address: string;
    coordinates: number[];
    distance?: number;
  };
  category: string;
  price: number;
  attendees: number;
  rating: number;
  organizer: {
    name: string;
    verified: boolean;
  };
  matchScore: number; // 0-100 based on user interests
  matchReasons: string[];
  isTrending: boolean;
  spotsLeft?: number;
}

interface BannerProps {
  userId?: string;
  userInterests?: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
  onEventPress: (eventId: string) => void;
}

// ===== INTELLIGENT EVENT BANNER COMPONENT =====
export const IntelligentEventBanner: React.FC<BannerProps> = ({
  userId,
  userInterests = [],
  location: userLocation,
  onEventPress,
}) => {
  const styles = useThemedStyles();
  const [featuredEvents, setFeaturedEvents] = useState<FeaturedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const autoScrollTimer = useRef<NodeJS.Timeout | null>(null);

  // ===== LOAD FEATURED EVENTS =====
  useEffect(() => {
    loadFeaturedEvents();
    
    // Auto-scroll timer
    startAutoScroll();
    
    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, [userLocation, userInterests]);

  const startAutoScroll = () => {
    autoScrollTimer.current = setInterval(() => {
      scrollToNext();
    }, 5000); // Change slide every 5 seconds
  };

  const scrollToNext = () => {
    if (scrollViewRef.current && featuredEvents.length > 0) {
      const nextIndex = (currentIndex + 1) % featuredEvents.length;
      scrollViewRef.current.scrollTo({
        x: nextIndex * (CARD_WIDTH + CARD_SPACING),
        animated: true,
      });
    }
  };

  const loadFeaturedEvents = async () => {
    try {
      setIsLoading(true);
      
      // Get user location if not provided
      let location = userLocation;
      if (!location) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const currentLocation = await Location.getCurrentPositionAsync({});
          location = {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          };
        }
      }

      // Call intelligent API that considers:
      // 1. User interests
      // 2. Location proximity
      // 3. Trending events
      // 4. Past behavior
      // 5. Social connections
      const response = await EventsService.getFeaturedEvents({
        userId,
        interests: userInterests,
        location,
        radius: 25, // 25km radius
        limit: 10,
        algorithm: 'intelligent', // Uses AI to rank events
      });

      if (response.success) {
        // Process and enrich events with match scores
        const enrichedEvents = response.data.map((event: any) => ({
          ...event,
          matchScore: calculateMatchScore(event, userInterests, location),
          matchReasons: getMatchReasons(event, userInterests, location),
        }));

        // Sort by match score and trending status
        const sortedEvents = enrichedEvents.sort((a, b) => {
          if (a.isTrending && !b.isTrending) return -1;
          if (!a.isTrending && b.isTrending) return 1;
          return b.matchScore - a.matchScore;
        });

        setFeaturedEvents(sortedEvents.slice(0, 5)); // Top 5 events
      }
    } catch (error) {
      console.error('Error loading featured events:', error);
      // Load mock data as fallback
      loadMockEvents();
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMatchScore = (event: any, interests: string[], location?: any): number => {
    let score = 0;
    
    // Interest match (40%)
    if (interests.includes(event.category)) {
      score += 40;
    } else if (event.tags?.some((tag: string) => interests.includes(tag))) {
      score += 20;
    }
    
    // Location proximity (30%)
    if (location && event.location?.distance) {
      if (event.location.distance < 5) score += 30;
      else if (event.location.distance < 10) score += 20;
      else if (event.location.distance < 20) score += 10;
    }
    
    // Popularity (20%)
    if (event.attendees > 100) score += 10;
    if (event.rating >= 4.5) score += 10;
    
    // Urgency (10%)
    const daysUntilEvent = getDaysUntilEvent(event.startDate);
    if (daysUntilEvent <= 3) score += 10;
    else if (daysUntilEvent <= 7) score += 5;
    
    return Math.min(score, 100);
  };

  const getMatchReasons = (event: any, interests: string[], location?: any): string[] => {
    const reasons = [];
    
    if (interests.includes(event.category)) {
      reasons.push(`Matches your interest in ${event.category}`);
    }
    
    if (event.location?.distance && event.location.distance < 5) {
      reasons.push(`Only ${event.location.distance.toFixed(1)}km away`);
    }
    
    if (event.isTrending) {
      reasons.push('Trending in your area');
    }
    
    if (event.attendees > 100) {
      reasons.push(`${event.attendees}+ people attending`);
    }
    
    if (event.spotsLeft && event.spotsLeft < 20) {
      reasons.push(`Only ${event.spotsLeft} spots left!`);
    }
    
    return reasons;
  };

  const getDaysUntilEvent = (eventDate: string): number => {
    const now = new Date();
    const event = new Date(eventDate);
    const diffTime = Math.abs(event.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const loadMockEvents = () => {
    // Fallback mock data
    const mockEvents: FeaturedEvent[] = [
      {
        id: '1',
        title: 'Tech Conference 2024',
        description: 'The biggest tech event of the year',
        imageUrl: 'https://example.com/tech.jpg',
        startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        location: {
          address: 'Convention Center, Downtown',
          coordinates: [-3.7038, 40.4168],
          distance: 2.5,
        },
        category: 'technology',
        price: 45,
        attendees: 234,
        rating: 4.8,
        organizer: {
          name: 'TechHub Madrid',
          verified: true,
        },
        matchScore: 92,
        matchReasons: ['Matches your interest in technology', 'Only 2.5km away', 'Trending in your area'],
        isTrending: true,
        spotsLeft: 15,
      },
      // Add more mock events...
    ];
    
    setFeaturedEvents(mockEvents);
  };

  // ===== SCROLL HANDLER =====
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
      const index = Math.round(event.contentOffset.x / (CARD_WIDTH + CARD_SPACING));
      runOnJS(setCurrentIndex)(index);
    },
  });

  const handleUserInteraction = () => {
    // Reset auto-scroll timer when user interacts
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
      startAutoScroll();
    }
  };

  // ===== RENDER EVENT CARD =====
  const renderEventCard = (event: FeaturedEvent, index: number) => {
    const inputRange = [
      (index - 1) * (CARD_WIDTH + CARD_SPACING),
      index * (CARD_WIDTH + CARD_SPACING),
      (index + 1) * (CARD_WIDTH + CARD_SPACING),
    ];

    const animatedStyle = useAnimatedStyle(() => {
      const scale = interpolate(
        scrollX.value,
        inputRange,
        [0.9, 1, 0.9],
        Extrapolate.CLAMP
      );

      const opacity = interpolate(
        scrollX.value,
        inputRange,
        [0.5, 1, 0.5],
        Extrapolate.CLAMP
      );

      return {
        transform: [{ scale }],
        opacity,
      };
    });

    return (
      <Animated.View key={event.id} style={[animatedStyle, componentStyles.cardContainer]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onEventPress(event.id);
          }}
          onPressIn={handleUserInteraction}
          style={componentStyles.card}
        >
          {/* Background Image */}
          <Image
            source={{ uri: event.imageUrl }}
            style={componentStyles.cardImage}
            resizeMode="cover"
          />
          
          {/* Gradient Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={componentStyles.gradient}
          />

          {/* Content */}
          <View style={componentStyles.cardContent}>
            {/* Top Row: Category & Match Score */}
            <View style={componentStyles.topRow}>
              <View style={[componentStyles.categoryBadge, { backgroundColor: getCategoryColor(event.category) }]}>
                <Ionicons name={getCategoryIcon(event.category)} size={12} color="white" />
                <Text style={componentStyles.categoryText}>{event.category.toUpperCase()}</Text>
              </View>
              
              {event.matchScore >= 80 && (
                <View style={componentStyles.matchBadge}>
                  <Ionicons name="sparkles" size={12} color="#fbbf24" />
                  <Text style={componentStyles.matchText}>{event.matchScore}% Match</Text>
                </View>
              )}

              {event.isTrending && (
                <View style={componentStyles.trendingBadge}>
                  <Ionicons name="flame" size={12} color="#ef4444" />
                  <Text style={componentStyles.trendingText}>HOT</Text>
                </View>
              )}
            </View>

            {/* Title & Description */}
            <Text style={componentStyles.eventTitle} numberOfLines={2}>
              {event.title}
            </Text>
            
            {/* Event Meta */}
            <View style={componentStyles.metaContainer}>
              <View style={componentStyles.metaItem}>
                <Ionicons name="calendar-outline" size={14} color="white" />
                <Text style={componentStyles.metaText}>
                  {new Date(event.startDate).toLocaleDateString('es-ES', { 
                    day: 'numeric', 
                    month: 'short' 
                  })}
                </Text>
              </View>
              
              <View style={componentStyles.metaItem}>
                <Ionicons name="location-outline" size={14} color="white" />
                <Text style={componentStyles.metaText}>
                  {event.location.distance ? `${event.location.distance.toFixed(1)}km` : event.location.address}
                </Text>
              </View>
              
              <View style={componentStyles.metaItem}>
                <Ionicons name="people-outline" size={14} color="white" />
                <Text style={componentStyles.metaText}>{event.attendees}</Text>
              </View>
            </View>

            {/* Match Reasons */}
            {event.matchReasons.length > 0 && (
              <View style={componentStyles.reasonsContainer}>
                <Text style={componentStyles.reasonText}>
                  💡 {event.matchReasons[0]}
                </Text>
              </View>
            )}

            {/* Bottom Row: Price & Action */}
            <View style={componentStyles.bottomRow}>
              <View>
                <Text style={componentStyles.priceLabel}>From</Text>
                <Text style={componentStyles.price}>
                  {event.price === 0 ? 'FREE' : `$${event.price}`}
                </Text>
              </View>
              
              {event.spotsLeft && event.spotsLeft < 50 && (
                <View style={componentStyles.urgencyBadge}>
                  <Text style={componentStyles.urgencyText}>
                    {event.spotsLeft} spots left
                  </Text>
                </View>
              )}
              
              <TouchableOpacity style={componentStyles.actionButton}>
                <Text style={componentStyles.actionText}>View</Text>
                <Ionicons name="arrow-forward" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // ===== PAGINATION DOTS =====
  const renderPaginationDots = () => {
    return (
      <View style={componentStyles.pagination}>
        {featuredEvents.map((_, index) => {
          const inputRange = [
            (index - 1) * (CARD_WIDTH + CARD_SPACING),
            index * (CARD_WIDTH + CARD_SPACING),
            (index + 1) * (CARD_WIDTH + CARD_SPACING),
          ];

          const animatedDotStyle = useAnimatedStyle(() => {
            const width = interpolate(
              scrollX.value,
              inputRange,
              [8, 24, 8],
              Extrapolate.CLAMP
            );

            const opacity = interpolate(
              scrollX.value,
              inputRange,
              [0.3, 1, 0.3],
              Extrapolate.CLAMP
            );

            return {
              width,
              opacity,
            };
          });

          return (
            <Animated.View
              key={index}
              style={[
                componentStyles.paginationDot,
                animatedDotStyle,
                { backgroundColor: styles.colors.primary },
              ]}
            />
          );
        })}
      </View>
    );
  };

  // ===== HELPER FUNCTIONS =====
  const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      technology: '#3b82f6',
      music: '#8b5cf6',
      sports: '#10b981',
      art: '#f59e0b',
      food: '#ef4444',
      business: '#6366f1',
      education: '#14b8a6',
      health: '#ec4899',
    };
    return colors[category] || '#6b7280';
  };

  const getCategoryIcon = (category: string): any => {
    const icons: { [key: string]: any } = {
      technology: 'laptop-outline',
      music: 'musical-notes-outline',
      sports: 'fitness-outline',
      art: 'color-palette-outline',
      food: 'restaurant-outline',
      business: 'briefcase-outline',
      education: 'school-outline',
      health: 'heart-outline',
    };
    return icons[category] || 'calendar-outline';
  };

  if (isLoading) {
    return (
      <View style={[componentStyles.container, { height: BANNER_HEIGHT }]}>
        <ActivityIndicator size="large" color={styles.colors.primary} />
      </View>
    );
  }

  if (featuredEvents.length === 0) {
    return null;
  }

  return (
    <View style={componentStyles.container}>
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={componentStyles.scrollContent}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onTouchStart={handleUserInteraction}
      >
        {featuredEvents.map((event, index) => renderEventCard(event, index))}
      </Animated.ScrollView>
      
      {renderPaginationDots()}
    </View>
  );
};

// ===== STYLES =====
const componentStyles = StyleSheet.create({
  container: {
    height: BANNER_HEIGHT,
    marginVertical: 16,
  },
  scrollContent: {
    paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: '100%',
    marginHorizontal: CARD_SPACING / 2,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1e293b',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  cardImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  cardContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
  },
  topRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  categoryText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  matchText: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: '600',
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  trendingText: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: '600',
  },
  eventTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  metaContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
  },
  reasonsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },
  reasonText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    fontStyle: 'italic',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    marginBottom: 2,
  },
  price: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  urgencyBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  actionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
  },
});

export default IntelligentEventBanner;
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useThemedStyles } from '../../contexts/ThemeContext';
import EventsService from '../../services/EventsService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BANNER_HEIGHT = SCREEN_HEIGHT * 0.32;
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_SPACING = 16;

// ===== INTERFACES =====
interface FeaturedEvent {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  startDate: string;
  location: {
    address: string;
    coordinates: number[];
    distance?: number;
  };
  category: string;
  price: number;
  attendees: number;
  rating: number;
  organizer: {
    name: string;
    verified: boolean;
  };
  matchScore: number; // 0-100 based on user interests
  matchReasons: string[];
  isTrending: boolean;
  spotsLeft?: number;
}

interface BannerProps {
  userId?: string;
  userInterests?: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
  onEventPress: (eventId: string) => void;
}

// ===== INTELLIGENT EVENT BANNER COMPONENT =====
export const IntelligentEventBanner: React.FC<BannerProps> = ({
  userId,
  userInterests = [],
  location: userLocation,
  onEventPress,
}) => {
  const styles = useThemedStyles();
  const [featuredEvents, setFeaturedEvents] = useState<FeaturedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const autoScrollTimer = useRef<NodeJS.Timeout | null>(null);

  // ===== LOAD FEATURED EVENTS =====
  useEffect(() => {
    loadFeaturedEvents();
    
    // Auto-scroll timer
    startAutoScroll();
    
    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, [userLocation, userInterests]);

  const startAutoScroll = () => {
    autoScrollTimer.current = setInterval(() => {
      scrollToNext();
    }, 5000); // Change slide every 5 seconds
  };

  const scrollToNext = () => {
    if (scrollViewRef.current && featuredEvents.length > 0) {
      const nextIndex = (currentIndex + 1) % featuredEvents.length;
      scrollViewRef.current.scrollTo({
        x: nextIndex * (CARD_WIDTH + CARD_SPACING),
        animated: true,
      });
    }
  };

  const loadFeaturedEvents = async () => {
    try {
      setIsLoading(true);
      
      // Get user location if not provided
      let location = userLocation;
      if (!location) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const currentLocation = await Location.getCurrentPositionAsync({});
          location = {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          };
        }
      }

      // Call intelligent API that considers:
      // 1. User interests
      // 2. Location proximity
      // 3. Trending events
      // 4. Past behavior
      // 5. Social connections
      const response = await EventsService.getFeaturedEvents({
        userId,
        interests: userInterests,
        location,
        radius: 25, // 25km radius
        limit: 10,
        algorithm: 'intelligent', // Uses AI to rank events
      });

      if (response.success) {
        // Process and enrich events with match scores
        const enrichedEvents = response.data.map((event: any) => ({
          ...event,
          matchScore: calculateMatchScore(event, userInterests, location),
          matchReasons: getMatchReasons(event, userInterests, location),
        }));

        // Sort by match score and trending status
        const sortedEvents = enrichedEvents.sort((a, b) => {
          if (a.isTrending && !b.isTrending) return -1;
          if (!a.isTrending && b.isTrending) return 1;
          return b.matchScore - a.matchScore;
        });

        setFeaturedEvents(sortedEvents.slice(0, 5)); // Top 5 events
      }
    } catch (error) {
      console.error('Error loading featured events:', error);
      // Load mock data as fallback
      loadMockEvents();
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMatchScore = (event: any, interests: string[], location?: any): number => {
    let score = 0;
    
    // Interest match (40%)
    if (interests.includes(event.category)) {
      score += 40;
    } else if (event.tags?.some((tag: string) => interests.includes(tag))) {
      score += 20;
    }
    
    // Location proximity (30%)
    if (location && event.location?.distance) {
      if (event.location.distance < 5) score += 30;
      else if (event.location.distance < 10) score += 20;
      else if (event.location.distance < 20) score += 10;
    }
    
    // Popularity (20%)
    if (event.attendees > 100) score += 10;
    if (event.rating >= 4.5) score += 10;
    
    // Urgency (10%)
    const daysUntilEvent = getDaysUntilEvent(event.startDate);
    if (daysUntilEvent <= 3) score += 10;
    else if (daysUntilEvent <= 7) score += 5;
    
    return Math.min(score, 100);
  };

  const getMatchReasons = (event: any, interests: string[], location?: any): string[] => {
    const reasons = [];
    
    if (interests.includes(event.category)) {
      reasons.push(`Matches your interest in ${event.category}`);
    }
    
    if (event.location?.distance && event.location.distance < 5) {
      reasons.push(`Only ${event.location.distance.toFixed(1)}km away`);
    }
    
    if (event.isTrending) {
      reasons.push('Trending in your area');
    }
    
    if (event.attendees > 100) {
      reasons.push(`${event.attendees}+ people attending`);
    }
    
    if (event.spotsLeft && event.spotsLeft < 20) {
      reasons.push(`Only ${event.spotsLeft} spots left!`);
    }
    
    return reasons;
  };

  const getDaysUntilEvent = (eventDate: string): number => {
    const now = new Date();
    const event = new Date(eventDate);
    const diffTime = Math.abs(event.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const loadMockEvents = () => {
    // Fallback mock data
    const mockEvents: FeaturedEvent[] = [
      {
        id: '1',
        title: 'Tech Conference 2024',
        description: 'The biggest tech event of the year',
        imageUrl: 'https://example.com/tech.jpg',
        startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        location: {
          address: 'Convention Center, Downtown',
          coordinates: [-3.7038, 40.4168],
          distance: 2.5,
        },
        category: 'technology',
        price: 45,
        attendees: 234,
        rating: 4.8,
        organizer: {
          name: 'TechHub Madrid',
          verified: true,
        },
        matchScore: 92,
        matchReasons: ['Matches your interest in technology', 'Only 2.5km away', 'Trending in your area'],
        isTrending: true,
        spotsLeft: 15,
      },
      // Add more mock events...
    ];
    
    setFeaturedEvents(mockEvents);
  };

  // ===== SCROLL HANDLER =====
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
      const index = Math.round(event.contentOffset.x / (CARD_WIDTH + CARD_SPACING));
      runOnJS(setCurrentIndex)(index);
    },
  });

  const handleUserInteraction = () => {
    // Reset auto-scroll timer when user interacts
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
      startAutoScroll();
    }
  };

  // ===== RENDER EVENT CARD =====
  const renderEventCard = (event: FeaturedEvent, index: number) => {
    const inputRange = [
      (index - 1) * (CARD_WIDTH + CARD_SPACING),
      index * (CARD_WIDTH + CARD_SPACING),
      (index + 1) * (CARD_WIDTH + CARD_SPACING),
    ];

    const animatedStyle = useAnimatedStyle(() => {
      const scale = interpolate(
        scrollX.value,
        inputRange,
        [0.9, 1, 0.9],
        Extrapolate.CLAMP
      );

      const opacity = interpolate(
        scrollX.value,
        inputRange,
        [0.5, 1, 0.5],
        Extrapolate.CLAMP
      );

      return {
        transform: [{ scale }],
        opacity,
      };
    });

    return (
      <Animated.View key={event.id} style={[animatedStyle, componentStyles.cardContainer]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onEventPress(event.id);
          }}
          onPressIn={handleUserInteraction}
          style={componentStyles.card}
        >
          {/* Background Image */}
          <Image
            source={{ uri: event.imageUrl }}
            style={componentStyles.cardImage}
            resizeMode="cover"
          />
          
          {/* Gradient Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={componentStyles.gradient}
          />

          {/* Content */}
          <View style={componentStyles.cardContent}>
            {/* Top Row: Category & Match Score */}
            <View style={componentStyles.topRow}>
              <View style={[componentStyles.categoryBadge, { backgroundColor: getCategoryColor(event.category) }]}>
                <Ionicons name={getCategoryIcon(event.category)} size={12} color="white" />
                <Text style={componentStyles.categoryText}>{event.category.toUpperCase()}</Text>
              </View>
              
              {event.matchScore >= 80 && (
                <View style={componentStyles.matchBadge}>
                  <Ionicons name="sparkles" size={12} color="#fbbf24" />
                  <Text style={componentStyles.matchText}>{event.matchScore}% Match</Text>
                </View>
              )}

              {event.isTrending && (
                <View style={componentStyles.trendingBadge}>
                  <Ionicons name="flame" size={12} color="#ef4444" />
                  <Text style={componentStyles.trendingText}>HOT</Text>
                </View>
              )}
            </View>

            {/* Title & Description */}
            <Text style={componentStyles.eventTitle} numberOfLines={2}>
              {event.title}
            </Text>
            
            {/* Event Meta */}
            <View style={componentStyles.metaContainer}>
              <View style={componentStyles.metaItem}>
                <Ionicons name="calendar-outline" size={14} color="white" />
                <Text style={componentStyles.metaText}>
                  {new Date(event.startDate).toLocaleDateString('es-ES', { 
                    day: 'numeric', 
                    month: 'short' 
                  })}
                </Text>
              </View>
              
              <View style={componentStyles.metaItem}>
                <Ionicons name="location-outline" size={14} color="white" />
                <Text style={componentStyles.metaText}>
                  {event.location.distance ? `${event.location.distance.toFixed(1)}km` : event.location.address}
                </Text>
              </View>
              
              <View style={componentStyles.metaItem}>
                <Ionicons name="people-outline" size={14} color="white" />
                <Text style={componentStyles.metaText}>{event.attendees}</Text>
              </View>
            </View>

            {/* Match Reasons */}
            {event.matchReasons.length > 0 && (
              <View style={componentStyles.reasonsContainer}>
                <Text style={componentStyles.reasonText}>
                  💡 {event.matchReasons[0]}
                </Text>
              </View>
            )}

            {/* Bottom Row: Price & Action */}
            <View style={componentStyles.bottomRow}>
              <View>
                <Text style={componentStyles.priceLabel}>From</Text>
                <Text style={componentStyles.price}>
                  {event.price === 0 ? 'FREE' : `$${event.price}`}
                </Text>
              </View>
              
              {event.spotsLeft && event.spotsLeft < 50 && (
                <View style={componentStyles.urgencyBadge}>
                  <Text style={componentStyles.urgencyText}>
                    {event.spotsLeft} spots left
                  </Text>
                </View>
              )}
              
              <TouchableOpacity style={componentStyles.actionButton}>
                <Text style={componentStyles.actionText}>View</Text>
                <Ionicons name="arrow-forward" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // ===== PAGINATION DOTS =====
  const renderPaginationDots = () => {
    return (
      <View style={componentStyles.pagination}>
        {featuredEvents.map((_, index) => {
          const inputRange = [
            (index - 1) * (CARD_WIDTH + CARD_SPACING),
            index * (CARD_WIDTH + CARD_SPACING),
            (index + 1) * (CARD_WIDTH + CARD_SPACING),
          ];

          const animatedDotStyle = useAnimatedStyle(() => {
            const width = interpolate(
              scrollX.value,
              inputRange,
              [8, 24, 8],
              Extrapolate.CLAMP
            );

            const opacity = interpolate(
              scrollX.value,
              inputRange,
              [0.3, 1, 0.3],
              Extrapolate.CLAMP
            );

            return {
              width,
              opacity,
            };
          });

          return (
            <Animated.View
              key={index}
              style={[
                componentStyles.paginationDot,
                animatedDotStyle,
                { backgroundColor: styles.colors.primary },
              ]}
            />
          );
        })}
      </View>
    );
  };

  // ===== HELPER FUNCTIONS =====
  const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      technology: '#3b82f6',
      music: '#8b5cf6',
      sports: '#10b981',
      art: '#f59e0b',
      food: '#ef4444',
      business: '#6366f1',
      education: '#14b8a6',
      health: '#ec4899',
    };
    return colors[category] || '#6b7280';
  };

  const getCategoryIcon = (category: string): any => {
    const icons: { [key: string]: any } = {
      technology: 'laptop-outline',
      music: 'musical-notes-outline',
      sports: 'fitness-outline',
      art: 'color-palette-outline',
      food: 'restaurant-outline',
      business: 'briefcase-outline',
      education: 'school-outline',
      health: 'heart-outline',
    };
    return icons[category] || 'calendar-outline';
  };

  if (isLoading) {
    return (
      <View style={[componentStyles.container, { height: BANNER_HEIGHT }]}>
        <ActivityIndicator size="large" color={styles.colors.primary} />
      </View>
    );
  }

  if (featuredEvents.length === 0) {
    return null;
  }

  return (
    <View style={componentStyles.container}>
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={componentStyles.scrollContent}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onTouchStart={handleUserInteraction}
      >
        {featuredEvents.map((event, index) => renderEventCard(event, index))}
      </Animated.ScrollView>
      
      {renderPaginationDots()}
    </View>
  );
};

// ===== STYLES =====
const componentStyles = StyleSheet.create({
  container: {
    height: BANNER_HEIGHT,
    marginVertical: 16,
  },
  scrollContent: {
    paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: '100%',
    marginHorizontal: CARD_SPACING / 2,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1e293b',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  cardImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  cardContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
  },
  topRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  categoryText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  matchText: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: '600',
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  trendingText: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: '600',
  },
  eventTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  metaContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
  },
  reasonsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },
  reasonText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    fontStyle: 'italic',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    marginBottom: 2,
  },
  price: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  urgencyBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  actionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
  },
});

export default IntelligentEventBanner;



