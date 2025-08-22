import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { InteractiveEventMap } from '../components/map/InteractiveEventMap';
import { OptimizedEventCard } from '../components/events/OptimizedEventCard';
import { Event, MobileTheme } from '../types';
import { useTheme } from '../hooks/useTheme';

// ===== MOCK DATA PARA DEMO =====
const mockEventsWithCoordinates: Event[] = [
  {
    id: '1',
    title: 'AI Summit Madrid 2024',
    description: 'El evento más grande de IA en España',
    category: 'Tecnología',
    date: '2024-12-25',
    location: {
      city: 'Madrid',
      venue: 'WiZink Center',
      coordinates: { latitude: 40.4168, longitude: -3.7038 }
    },
    distance: '2.1 km',
    attendees: 450,
    price: 75,
    host: { name: 'Tech Madrid', avatar: '/host1.jpg' },
    isPopular: true,
    isTrending: true,
    friendsAttending: 3,
    tags: ['ai', 'technology', 'networking'],
    likes: 230,
    shares: 45,
    comments: 67
  },
  {
    id: '2',
    title: 'Festival Gastronómico de Invierno',
    description: 'Los mejores chefs de Madrid se reúnen',
    category: 'Gastronomía',
    date: '2024-12-28',
    location: {
      city: 'Madrid',
      venue: 'Matadero Madrid',
      coordinates: { latitude: 40.3967, longitude: -3.6947 }
    },
    distance: '1.8 km',
    attendees: 320,
    price: 25,
    host: { name: 'Madrid Food', avatar: '/host2.jpg' },
    friendsAttending: 4,
    tags: ['food', 'chefs', 'madrid'],
    likes: 180,
    shares: 32,
    comments: 41
  },
  {
    id: '3',
    title: 'Concierto de Jazz en Vivo',
    description: 'Una noche mágica con los mejores músicos de jazz',
    category: 'Música',
    date: '2024-12-22',
    location: {
      city: 'Madrid',
      venue: 'Café Central',
      coordinates: { latitude: 40.4147, longitude: -3.6958 }
    },
    distance: '0.8 km',
    attendees: 85,
    price: 35,
    host: { name: 'Jazz Madrid', avatar: '/host3.jpg' },
    isPopular: true,
    friendsAttending: 1,
    tags: ['jazz', 'música', 'live'],
    likes: 95,
    shares: 18,
    comments: 23
  },
  {
    id: '4',
    title: 'Exposición de Arte Contemporáneo',
    description: 'Artistas emergentes exponen sus últimas obras',
    category: 'Arte',
    date: '2024-12-30',
    location: {
      city: 'Madrid',
      venue: 'Galería Marlborough',
      coordinates: { latitude: 40.4237, longitude: -3.6926 }
    },
    distance: '1.2 km',
    attendees: 150,
    price: 0,
    host: { name: 'Arte Madrid', avatar: '/host4.jpg' },
    friendsAttending: 0,
    tags: ['arte', 'exposición', 'contemporáneo'],
    likes: 67,
    shares: 12,
    comments: 8
  },
  {
    id: '5',
    title: 'Maratón de Madrid 2024',
    description: '42km recorriendo los lugares más emblemáticos',
    category: 'Deportes',
    date: '2024-12-26',
    location: {
      city: 'Madrid',
      venue: 'Puerta del Sol',
      coordinates: { latitude: 40.4169, longitude: -3.7035 }
    },
    distance: '0.3 km',
    attendees: 25000,
    price: 45,
    host: { name: 'Madrid Running', avatar: '/host5.jpg' },
    isPopular: true,
    isTrending: true,
    friendsAttending: 8,
    tags: ['maratón', 'running', 'deporte'],
    likes: 1250,
    shares: 340,
    comments: 567
  }
];

// ===== COMPONENTE PRINCIPAL =====
export const MapScreen: React.FC = () => {
  // Estados
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  
  // Hooks
  const { theme } = useTheme();

  // Efectos
  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Solicitar permisos de ubicación
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        setLocationPermission(true);
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          lat: location.coords.latitude,
          lng: location.coords.longitude
        });
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setLocationPermission(false);
        Alert.alert(
          'Ubicación requerida',
          'Para mostrar eventos cerca de ti, necesitamos acceso a tu ubicación.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Configuración', onPress: () => {/* Abrir configuración */} }
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setLocationPermission(false);
    }
  };

  // Handlers
  const handleEventSelect = async (event: Event) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedEvent(event);
  };

  const handleLocationChange = (location: { lat: number; lng: number; zoom: number }) => {
    // Aquí podrías actualizar la ubicación del usuario si es necesario
    console.log('Map location changed:', location);
  };

  const toggleViewMode = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setViewMode(prev => prev === 'map' ? 'list' : 'map');
  };

  // Estadísticas
  const mapStats = {
    totalEvents: mockEventsWithCoordinates.length,
    categoriesCount: new Set(mockEventsWithCoordinates.map(e => e.category)).size,
    nearbyEvents: mockEventsWithCoordinates.filter(e => {
      if (e.distance) {
        const distance = parseFloat(e.distance.replace('km', ''));
        return distance <= 5;
      }
      return false;
    }).length
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.surface}
      />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              Mapa de Eventos
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              Descubre eventos cerca de ti {userLocation ? `en ${userLocation.lat.toFixed(2)}, ${userLocation.lng.toFixed(2)}` : 'en Madrid'}
            </Text>
          </View>
          
          {/* Toggle vista */}
          <View style={[styles.viewToggle, { backgroundColor: theme.colors.background }]}>
            <TouchableOpacity
              style={[
                styles.viewButton,
                viewMode === 'map' && { backgroundColor: theme.colors.primary }
              ]}
              onPress={toggleViewMode}
            >
              <Ionicons 
                name="map" 
                size={20} 
                color={viewMode === 'map' ? 'white' : theme.colors.textSecondary} 
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewButton,
                viewMode === 'list' && { backgroundColor: theme.colors.primary }
              ]}
              onPress={toggleViewMode}
            >
              <Ionicons 
                name="list" 
                size={20} 
                color={viewMode === 'list' ? 'white' : theme.colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Estadísticas rápidas */}
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <View style={[styles.statDot, { backgroundColor: theme.colors.primary }]} />
            <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
              {mapStats.totalEvents} eventos
            </Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statDot, { backgroundColor: '#10B981' }]} />
            <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
              {mapStats.nearbyEvents} cerca de ti
            </Text>
          </View>
        </View>
      </View>

      {/* Contenido principal */}
      {viewMode === 'map' ? (
        // Vista de mapa
        <View style={styles.mapContainer}>
          <InteractiveEventMap
            events={mockEventsWithCoordinates}
            onEventSelect={handleEventSelect}
            onLocationChange={handleLocationChange}
            theme={theme}
          />
        </View>
      ) : (
        // Vista de lista
        <ScrollView 
          style={styles.listContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.listHeader}>
            <Text style={[styles.listTitle, { color: theme.colors.text }]}>
              Eventos en tu área
            </Text>
            <Text style={[styles.listCount, { color: theme.colors.textSecondary }]}>
              {mockEventsWithCoordinates.length} eventos encontrados
            </Text>
          </View>
          
          {mockEventsWithCoordinates.map((event, index) => (
            <View key={event.id} style={styles.eventCardContainer}>
              <OptimizedEventCard 
                event={event} 
                variant="compact"
                showActions={true}
              />
            </View>
          ))}
          
          {/* Estadísticas de la lista */}
          <View style={[styles.listStats, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.listStatsTitle, { color: theme.colors.text }]}>
              Estadísticas del área
            </Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                  {mapStats.totalEvents}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Total eventos
                </Text>
              </View>
              
              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: '#10B981' }]}>
                  {mapStats.categoriesCount}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Categorías
                </Text>
              </View>
              
              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: '#F59E0B' }]}>
                  {mapStats.nearbyEvents}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Cerca de ti
                </Text>
              </View>
              
              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: '#8B5CF6' }]}>
                  1.8 km
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Distancia media
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {/* FAB para cambiar ubicación */}
      {!locationPermission && (
        <TouchableOpacity
          style={[styles.locationFab, { backgroundColor: theme.colors.primary }]}
          onPress={requestLocationPermission}
        >
          <Ionicons name="location" size={24} color="white" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

// ===== ESTILOS =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  viewToggle: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 2,
  },
  viewButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statText: {
    fontSize: 12,
  },
  mapContainer: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  listHeader: {
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  listCount: {
    fontSize: 14,
  },
  eventCardContainer: {
    marginBottom: 12,
  },
  listStats: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  listStatsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  locationFab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});

export default MapScreen;