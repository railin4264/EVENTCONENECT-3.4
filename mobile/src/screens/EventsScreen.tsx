import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
// import { LinearGradient } from 'expo-linear-gradient';
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
import * as Location from 'expo-location';

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
  userLocation?: { latitude: number; longitude: number } | null;
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

  const distanceLabel = null; // Demo data lacks coordinates; integrate when coords are available

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
                  {event.location}{distanceLabel ? ` · ${distanceLabel}` : ''}
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
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({});
        setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      } catch {}
    })();
  }, []);

  // ===== SAMPLE EVENTS DATA =====
  const events = [
    {
      id: '1',
      title: 'Fiesta de Verano',
      description: 'Disfruta de la mejor fiesta de verano con música en vivo y baile.',
      date: '2023-07-20',
      time: '18:00',
      location: 'Parque Central, Ciudad de México',
      category: 'Fiesta',
      attendees: 150,
      maxAttendees: 200,
      price: '$50',
      image: 'https://via.placeholder.com/150',
      isLiked: false,
      isTrending: true,
    },
    {
      id: '2',
      title: 'Concurso de Cocina',
      description: 'Participa en el concurso de cocina más emocionante de la ciudad.',
      date: '2023-07-25',
      time: '10:00',
      location: 'Restaurante Gourmet, Zona Rosa',
      category: 'Cocina',
      attendees: 80,
      maxAttendees: 100,
      price: '$20',
      image: 'https://via.placeholder.com/150',
      isLiked: true,
      isTrending: false,
    },
    {
      id: '3',
      title: 'Festival de Cine',
      description: 'Descubre las últimas películas de cine independiente.',
      date: '2023-07-30',
      time: '14:00',
      location: 'Cinepolis, Zona Sur',
      category: 'Cine',
      attendees: 120,
      maxAttendees: 150,
      price: '$15',
      image: 'https://via.placeholder.com/150',
      isLiked: false,
      isTrending: true,
    },
    {
      id: '4',
      title: 'Feria de Artesanías',
      description: 'Compra artesanías únicas y originales de diferentes artistas.',
      date: '2023-08-05',
      time: '11:00',
      location: 'Mercado de Artesanías, Centro Histórico',
      category: 'Artesanías',
      attendees: 200,
      maxAttendees: 250,
      price: '$10',
      image: 'https://via.placeholder.com/150',
      isLiked: true,
      isTrending: false,
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Eventos</Text>
          <View style={styles.searchBar}>
            <Search size={20} color="#6b7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar eventos..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.filterChips}>
          <FilterChip
            label="Todos"
            isActive={selectedCategory === 'all'}
            onPress={() => setSelectedCategory('all')}
          />
          <FilterChip
            label="Fiesta"
            isActive={selectedCategory === 'Fiesta'}
            onPress={() => setSelectedCategory('Fiesta')}
          />
          <FilterChip
            label="Cocina"
            isActive={selectedCategory === 'Cocina'}
            onPress={() => setSelectedCategory('Cocina')}
          />
          <FilterChip
            label="Cine"
            isActive={selectedCategory === 'Cine'}
            onPress={() => setSelectedCategory('Cine')}
          />
          <FilterChip
            label="Artesanías"
            isActive={selectedCategory === 'Artesanías'}
            onPress={() => setSelectedCategory('Artesanías')}
          />
        </View>

        <View style={styles.eventsList}>
          {events.map((event, index) => (
            <EventCard
              key={event.id}
              event={event}
              index={index}
              userLocation={userLocation}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingTop: StatusBar.currentHeight,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    marginLeft: 10,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 5,
    marginVertical: 5,
  },
  filterChipActive: {
    backgroundColor: '#06b6d4',
  },
  filterChipText: {
    fontSize: 14,
    color: '#4b5563',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  eventsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  eventCard: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  eventImageContainer: {
    position: 'relative',
    height: 180,
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  trendingBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ec4899',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendingText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  likeButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    padding: 5,
  },
  eventContent: {
    padding: 15,
  },
  eventHeader: {
    marginBottom: 10,
  },
  eventDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  eventDetails: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailText: {
    fontSize: 14,
    color: '#4b5563',
    marginLeft: 5,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceLabel: {
    fontSize: 14,
    color: '#4b5563',
    marginRight: 5,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareButton: {
    marginRight: 10,
  },
  joinButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});