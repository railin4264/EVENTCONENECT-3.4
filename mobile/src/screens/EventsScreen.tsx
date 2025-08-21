import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, CardContent, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  Heart,
  Share,
  Clock,
  ArrowRight,
  Flame
} from 'lucide-react-native';

// const { width, height } = Dimensions.get('window');

// ===== EVENT CARD COMPONENT =====
const EventCard: React.FC<{
  event: {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    category: string;
    attendees: number;
    maxAttendees: number;
    price: string;
    image: string;
    isLiked: boolean;
    isTrending: boolean;
  };
  index: number;
}> = ({ event, index }) => {
  const translateY = useSharedValue(50);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      translateY.value = withSpring(0, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(1, { duration: 600 });
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    }, index * 100);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.eventCard, animatedStyle]}>
      <Card variant="glass">
        <CardContent padding="none">
          {/* Event Image */}
          <View style={styles.eventImageContainer}>
            <Image
              source={{ uri: event.image }}
              style={styles.eventImage}
              resizeMode="cover"
            />
            
            {/* Category Badge */}
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{event.category}</Text>
            </View>
            
            {/* Trending Badge */}
            {event.isTrending && (
              <View style={styles.trendingBadge}>
                <Flame size={16} color="#ffffff" />
                <Text style={styles.trendingText}>Trending</Text>
              </View>
            )}
            
            {/* Like Button */}
            <TouchableOpacity style={styles.likeButton}>
              <Heart 
                size={20} 
                color={event.isLiked ? "#ec4899" : "#ffffff"} 
                fill={event.isLiked ? "#ec4899" : "none"}
              />
            </TouchableOpacity>
          </View>

          {/* Event Content */}
          <View style={styles.eventContent}>
            <View style={styles.eventHeader}>
              <CardTitle style={{ fontSize: 16, marginBottom: 8 }}>{event.title}</CardTitle>
              <Text style={styles.eventDescription} numberOfLines={2}>
                {event.description}
              </Text>
            </View>

            {/* Event Details */}
            <View style={styles.eventDetails}>
              <View style={styles.detailRow}>
                <Calendar size={16} color="#06b6d4" />
                <Text style={styles.detailText}>{event.date}</Text>
                <Clock size={16} color="#06b6d4" />
                <Text style={styles.detailText}>{event.time}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <MapPin size={16} color="#06b6d4" />
                <Text style={styles.detailText} numberOfLines={1}>
                  {event.location}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Users size={16} color="#06b6d4" />
                <Text style={styles.detailText}>
                  {event.attendees}/{event.maxAttendees} asistentes
                </Text>
              </View>
            </View>

            {/* Event Footer */}
            <View style={styles.eventFooter}>
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Precio:</Text>
                <Text style={styles.priceValue}>{event.price}</Text>
              </View>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.shareButton}>
                  <Share size={16} color="#06b6d4" />
                </TouchableOpacity>
                
                <Button 
                  variant="primary" 
                  size="sm"
                >
                  <Text style={styles.joinButtonText}>Unirse</Text>
                  <ArrowRight size={16} style={{ marginLeft: 4 }} />
                </Button>
              </View>
            </View>
          </View>
        </CardContent>
      </Card>
    </Animated.View>
  );
};

// ===== FILTER CHIP COMPONENT =====
const FilterChip: React.FC<{
  label: string;
  isActive: boolean;
  onPress: () => void;
}> = ({ label, isActive, onPress }) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animatedStyle]}>
      <TouchableOpacity
        style={[
          styles.filterChip,
          isActive && styles.filterChipActive
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Text style={[
          styles.filterChipText,
          isActive && styles.filterChipTextActive
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ===== MAIN EVENTS SCREEN =====
export const EventsScreen: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery] = useState('');

  // ===== SAMPLE EVENTS DATA =====
  const events = [
    {
      id: '1',
      title: 'Tech Meetup Barcelona',
      description: 'Únete a desarrolladores y entusiastas de la tecnología para una noche de networking y charlas inspiradoras sobre el futuro del desarrollo web.',
      date: '15 Dic',
      time: '19:00',
      location: 'Barcelona, España',
      category: 'Tecnología',
      attendees: 45,
      maxAttendees: 80,
      price: 'Gratis',
      image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400',
      isLiked: true,
      isTrending: true,
    },
    {
      id: '2',
      title: 'Festival de Música Urbana',
      description: 'Celebra la cultura urbana con los mejores artistas del momento. Una noche llena de ritmo, baile y energía positiva.',
      date: '20 Dic',
      time: '22:00',
      location: 'Madrid, España',
      category: 'Música',
      attendees: 120,
      maxAttendees: 200,
      price: '€25',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
      isLiked: false,
      isTrending: false,
    },
    {
      id: '3',
      title: 'Workshop de Arte Digital',
      description: 'Aprende técnicas avanzadas de arte digital con herramientas modernas. Perfecto para artistas que quieren expandir sus habilidades.',
      date: '22 Dic',
      time: '16:00',
      location: 'Valencia, España',
      category: 'Arte',
      attendees: 18,
      maxAttendees: 25,
      price: '€45',
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400',
      isLiked: false,
      isTrending: true,
    },
    {
      id: '4',
      title: 'Networking Empresarial',
      description: 'Conecta con emprendedores y profesionales del sector empresarial. Oportunidades únicas de colaboración y crecimiento.',
      date: '25 Dic',
      time: '18:30',
      location: 'Sevilla, España',
      category: 'Negocios',
      attendees: 35,
      maxAttendees: 60,
      price: '€30',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
      isLiked: true,
      isTrending: false,
    },
  ];

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'technology', label: 'Tecnología' },
    { id: 'music', label: 'Música' },
    { id: 'art', label: 'Arte' },
    { id: 'business', label: 'Negocios' },
    { id: 'sports', label: 'Deportes' },
    { id: 'food', label: 'Gastronomía' },
  ];

  const filteredEvents = events.filter(event => {
    const matchesCategory = selectedCategory === 'all' || 
      event.category.toLowerCase() === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#0f0f23', '#1a1a2e', '#16213e']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Eventos</Text>
          <Text style={styles.headerSubtitle}>Descubre eventos increíbles</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Section */}
        <View style={styles.searchSection}>
          <Card variant="glass">
            <CardContent>
              <View style={styles.searchContainer}>
                <Search size={20} color="#9ca3af" style={styles.searchIcon} />
                <Text style={styles.searchPlaceholder}>
                  Buscar eventos...
                </Text>
              </View>
            </CardContent>
          </Card>
        </View>

        {/* Categories Filter */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Categorías</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <FilterChip
                key={category.id}
                label={category.label}
                isActive={selectedCategory === category.id}
                onPress={() => setSelectedCategory(category.id)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Events Grid */}
        <View style={styles.eventsSection}>
          <View style={styles.eventsHeader}>
            <Text style={styles.sectionTitle}>
              Eventos {selectedCategory !== 'all' && `- ${categories.find(c => c.id === selectedCategory)?.label}`}
            </Text>
            <Text style={styles.eventsCount}>
              {filteredEvents.length} eventos encontrados
            </Text>
          </View>

          <View style={styles.eventsGrid}>
            {filteredEvents.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                index={index}
              />
            ))}
          </View>

          {filteredEvents.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No se encontraron eventos</Text>
              <Text style={styles.emptyStateSubtitle}>
                Intenta cambiar los filtros o la búsqueda
              </Text>
            </View>
          )}
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Card variant="neon">
            <CardContent>
              <Text style={styles.ctaTitle}>
                ¿No encuentras lo que buscas?
              </Text>
              <Text style={styles.ctaSubtitle}>
                Crea tu propio evento y reúne a tu tribu
              </Text>
              <Button variant="primary" size="lg" glow>
                Crear Evento
              </Button>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
};

// ===== STYLES =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(10, 10, 10, 0.8)'
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchPlaceholder: {
    flex: 1,
    color: '#9ca3af',
    fontSize: 16,
  },
  categoriesSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  categoriesContainer: {
    paddingRight: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 12,
  },
  filterChipActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderColor: '#06b6d4',
  },
  filterChipText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#06b6d4',
  },
  eventsSection: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  eventsCount: {
    fontSize: 14,
    color: '#9ca3af',
  },
  eventsGrid: {
    gap: 16,
  },
  eventCard: {
    marginBottom: 16,
  },
  eventImageContainer: {
    position: 'relative',
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(6, 182, 212, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  trendingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(236, 72, 153, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendingText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  likeButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventContent: {
    padding: 16,
  },
  eventHeader: {
    marginBottom: 16,
  },
  eventDescription: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
  },
  eventDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#9ca3af',
    marginLeft: 8,
    flex: 1,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginRight: 8,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#06b6d4',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  ctaSection: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default EventsScreen;