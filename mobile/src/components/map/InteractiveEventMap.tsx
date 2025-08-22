import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Event, MobileTheme } from '../../types';
import { OptimizedEventCard } from '../events/OptimizedEventCard';

// ===== INTERFACES =====
interface InteractiveEventMapProps {
  events: Event[];
  onEventSelect?: (event: Event) => void;
  onLocationChange?: (location: { lat: number; lng: number; zoom: number }) => void;
  theme: MobileTheme;
}

interface MapEvent extends Event {
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

interface EventMarker {
  id: string;
  event: MapEvent;
  icon: string;
  color: string;
  position: { lat: number; lng: number };
}

// ===== CONFIGURACIÓN DE ICONOS POR CATEGORÍA =====
const CATEGORY_ICONS = {
  'Música': { icon: '🎵', color: '#EC4899', emoji: '🎤' },
  'Tecnología': { icon: '💻', color: '#3B82F6', emoji: '⚡' },
  'Gastronomía': { icon: '🍽️', color: '#F59E0B', emoji: '👨‍🍳' },
  'Arte': { icon: '🎨', color: '#8B5CF6', emoji: '🖼️' },
  'Deportes': { icon: '⚽', color: '#10B981', emoji: '🏃‍♂️' },
  'Educación': { icon: '📚', color: '#6366F1', emoji: '🎓' },
  'Negocios': { icon: '💼', color: '#6B7280', emoji: '📊' },
  'Bienestar': { icon: '🧘', color: '#14B8A6', emoji: '💆‍♀️' },
  'Cultura': { icon: '🏛️', color: '#A855F7', emoji: '🎭' },
  'Familia': { icon: '👨‍👩‍👧‍👦', color: '#F97316', emoji: '🎪' }
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ===== COMPONENTE PRINCIPAL =====
export const InteractiveEventMap: React.FC<InteractiveEventMapProps> = ({
  events,
  onEventSelect,
  onLocationChange,
  theme
}) => {
  // Estados
  const [selectedEvent, setSelectedEvent] = useState<MapEvent | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 40.4168, lng: -3.7038 }); // Madrid
  const [mapZoom, setMapZoom] = useState(13);
  const [filteredCategories, setFilteredCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  
  // Animaciones
  const mapOpacity = useRef(new Animated.Value(0)).current;
  const filterHeight = useRef(new Animated.Value(0)).current;
  const markerAnimations = useRef<{ [key: string]: Animated.Value }>({}).current;

  // Procesar eventos con coordenadas
  const mapEvents: MapEvent[] = events
    .filter(event => {
      if (typeof event.location === 'object' && event.location.coordinates) {
        return true;
      }
      return false;
    })
    .map(event => ({
      ...event,
      coordinates: (event.location as any).coordinates
    }))
    .filter(event => {
      // Filtro por categorías
      if (filteredCategories.length > 0) {
        return filteredCategories.includes(event.category);
      }
      return true;
    })
    .filter(event => {
      // Filtro por búsqueda
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          event.title.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.category.toLowerCase().includes(query)
        );
      }
      return true;
    });

  // Crear marcadores
  const eventMarkers: EventMarker[] = mapEvents.map(event => {
    const categoryConfig = CATEGORY_ICONS[event.category] || CATEGORY_ICONS['Cultura'];
    
    // Inicializar animación si no existe
    if (!markerAnimations[event.id]) {
      markerAnimations[event.id] = new Animated.Value(0);
    }
    
    return {
      id: event.id,
      event,
      icon: categoryConfig.emoji,
      color: categoryConfig.color,
      position: {
        lat: event.coordinates.latitude,
        lng: event.coordinates.longitude
      }
    };
  });

  // Categorías disponibles
  const availableCategories = Array.from(
    new Set(events.map(e => e.category))
  ).sort();

  // Efectos
  useEffect(() => {
    // Simular carga del mapa
    const timer = setTimeout(() => {
      setMapLoaded(true);
      Animated.timing(mapOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      // Animar marcadores
      eventMarkers.forEach((marker, index) => {
        Animated.timing(markerAnimations[marker.id], {
          toValue: 1,
          duration: 300,
          delay: index * 100,
          useNativeDriver: true,
        }).start();
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [eventMarkers.length]);

  useEffect(() => {
    // Animar filtros
    Animated.timing(filterHeight, {
      toValue: showFilters ? 200 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [showFilters]);

  // Handlers
  const handleMarkerPress = async (marker: EventMarker) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedEvent(marker.event);
    setShowEventModal(true);
    onEventSelect?.(marker.event);
  };

  const toggleCategoryFilter = async (category: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilteredCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setFilteredCategories([]);
    setSearchQuery('');
  };

  const handleZoom = async (direction: 'in' | 'out') => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMapZoom(prev => 
      direction === 'in' 
        ? Math.min(18, prev + 1)
        : Math.max(8, prev - 1)
    );
    onLocationChange?.({ ...mapCenter, zoom: mapZoom });
  };

  // Estadísticas
  const mapStats = {
    totalEvents: mapEvents.length,
    categoriesShown: filteredCategories.length || availableCategories.length,
    nearbyEvents: mapEvents.filter(e => {
      if (e.distance) {
        const distance = parseFloat(e.distance.replace('km', ''));
        return distance <= 5;
      }
      return false;
    }).length
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header con búsqueda */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.searchContainer}>
          <Ionicons 
            name="search" 
            size={20} 
            color={theme.colors.textSecondary} 
            style={styles.searchIcon} 
          />
          <TextInput
            style={[styles.searchInput, { 
              color: theme.colors.text,
              backgroundColor: theme.colors.background 
            }]}
            placeholder="Buscar eventos en el mapa..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.filterButton, { 
            backgroundColor: showFilters ? theme.colors.primary : 'transparent',
            borderColor: theme.colors.primary 
          }]}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowFilters(!showFilters);
          }}
        >
          <Ionicons 
            name="options" 
            size={20} 
            color={showFilters ? 'white' : theme.colors.primary} 
          />
          {filteredCategories.length > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{filteredCategories.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Filtros de categoría */}
      <Animated.View style={[styles.filtersContainer, { height: filterHeight }]}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          {availableCategories.map(category => {
            const isSelected = filteredCategories.includes(category);
            const categoryConfig = CATEGORY_ICONS[category] || CATEGORY_ICONS['Cultura'];
            const eventsInCategory = events.filter(e => e.category === category).length;
            
            return (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  { 
                    backgroundColor: isSelected ? categoryConfig.color : theme.colors.surface,
                    borderColor: categoryConfig.color 
                  }
                ]}
                onPress={() => toggleCategoryFilter(category)}
              >
                <Text style={styles.categoryEmoji}>{categoryConfig.icon}</Text>
                <Text style={[
                  styles.categoryText,
                  { color: isSelected ? 'white' : theme.colors.text }
                ]}>
                  {category}
                </Text>
                <View style={[
                  styles.categoryCount,
                  { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : theme.colors.background }
                ]}>
                  <Text style={[
                    styles.categoryCountText,
                    { color: isSelected ? 'white' : theme.colors.textSecondary }
                  ]}>
                    {eventsInCategory}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {filteredCategories.length > 0 && (
          <TouchableOpacity 
            style={[styles.clearFiltersButton, { backgroundColor: theme.colors.error }]}
            onPress={clearFilters}
          >
            <Text style={styles.clearFiltersText}>Limpiar filtros</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Estadísticas */}
      <View style={[styles.statsContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.statsText, { color: theme.colors.primary }]}>
          {mapStats.totalEvents}
        </Text>
        <Text style={[styles.statsLabel, { color: theme.colors.textSecondary }]}>
          eventos visibles
        </Text>
      </View>

      {/* Contenedor del mapa */}
      <View style={styles.mapContainer}>
        {!mapLoaded ? (
          // Loading state
          <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
            <Animated.View style={styles.loadingSpinner}>
              <Ionicons name="map" size={40} color={theme.colors.primary} />
            </Animated.View>
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              Cargando mapa...
            </Text>
          </View>
        ) : (
          // Mapa simulado con marcadores
          <Animated.View style={[styles.mapView, { opacity: mapOpacity }]}>
            <LinearGradient
              colors={[
                theme.isDark ? '#1F2937' : '#EFF6FF',
                theme.isDark ? '#374151' : '#DBEAFE'
              ]}
              style={styles.mapBackground}
            >
              {/* Calles simuladas */}
              <View style={styles.streetsOverlay}>
                {/* Simulación de calles con líneas */}
                <View style={[styles.street, styles.streetHorizontal, { backgroundColor: theme.colors.border }]} />
                <View style={[styles.street, styles.streetVertical, { backgroundColor: theme.colors.border }]} />
                <View style={[styles.street, styles.streetDiagonal, { backgroundColor: theme.colors.border }]} />
              </View>

              {/* Marcadores de eventos */}
              {eventMarkers.map((marker, index) => {
                const left = Math.max(5, Math.min(90, 15 + (index * 12) % 70));
                const top = Math.max(5, Math.min(85, 15 + (index * 10) % 70));

                return (
                  <Animated.View
                    key={marker.id}
                    style={[
                      styles.marker,
                      {
                        left: `${left}%`,
                        top: `${top}%`,
                        opacity: markerAnimations[marker.id],
                        transform: [{
                          scale: markerAnimations[marker.id].interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 1]
                          })
                        }]
                      }
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() => handleMarkerPress(marker)}
                      style={styles.markerTouchable}
                    >
                      {/* Pulso para eventos trending */}
                      {marker.event.isTrending && (
                        <Animated.View 
                          style={[
                            styles.markerPulse,
                            { backgroundColor: `${marker.color}40` }
                          ]}
                        />
                      )}
                      
                      {/* Icono del marcador */}
                      <View style={[styles.markerIcon, { backgroundColor: marker.color }]}>
                        <Text style={styles.markerEmoji}>{marker.icon}</Text>
                        
                        {/* Badge de popularidad */}
                        {marker.event.isPopular && (
                          <View style={styles.popularBadge}>
                            <Text style={styles.badgeEmoji}>🔥</Text>
                          </View>
                        )}
                        
                        {/* Badge de amigos */}
                        {marker.event.friendsAttending && marker.event.friendsAttending > 0 && (
                          <View style={styles.friendsBadge}>
                            <Text style={styles.friendsBadgeText}>
                              {marker.event.friendsAttending}
                            </Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}

              {/* Controles de zoom */}
              <View style={styles.zoomControls}>
                <TouchableOpacity
                  style={[styles.zoomButton, { backgroundColor: theme.colors.surface }]}
                  onPress={() => handleZoom('in')}
                >
                  <Ionicons name="add" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.zoomButton, { backgroundColor: theme.colors.surface }]}
                  onPress={() => handleZoom('out')}
                >
                  <Ionicons name="remove" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              {/* Indicador de zoom */}
              <View style={[styles.zoomIndicator, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.zoomText, { color: theme.colors.textSecondary }]}>
                  Zoom: {mapZoom}
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>
        )}
      </View>

      {/* Modal de evento seleccionado */}
      <Modal
        visible={showEventModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEventModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Detalles del evento
            </Text>
            <TouchableOpacity
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowEventModal(false);
                setSelectedEvent(null);
              }}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {selectedEvent && (
              <View style={styles.eventDetailsContainer}>
                <OptimizedEventCard 
                  event={selectedEvent} 
                  variant="compact"
                  showActions={true}
                />
                
                {/* Información adicional del mapa */}
                <View style={styles.mapInfo}>
                  <View style={styles.mapInfoRow}>
                    <Ionicons name="location" size={16} color={theme.colors.textSecondary} />
                    <Text style={[styles.mapInfoText, { color: theme.colors.textSecondary }]}>
                      Coordenadas: {selectedEvent.coordinates.latitude.toFixed(4)}, {selectedEvent.coordinates.longitude.toFixed(4)}
                    </Text>
                  </View>
                  
                  <View style={styles.mapInfoRow}>
                    <Ionicons name="calendar" size={16} color={theme.colors.textSecondary} />
                    <Text style={[styles.mapInfoText, { color: theme.colors.textSecondary }]}>
                      {new Date(selectedEvent.date).toLocaleDateString('es-ES', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={[styles.viewDetailsButton, { backgroundColor: theme.colors.primary }]}
                  onPress={async () => {
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    // Aquí iría la navegación a la pantalla de detalles
                  }}
                >
                  <Text style={styles.viewDetailsText}>Ver detalles completos</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Leyenda */}
      <View style={[styles.legend, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.legendTitle, { color: theme.colors.text }]}>
          Leyenda
        </Text>
        <View style={styles.legendItems}>
          {Object.entries(CATEGORY_ICONS).slice(0, 4).map(([category, config]) => (
            <View key={category} style={styles.legendItem}>
              <View style={[styles.legendIcon, { backgroundColor: config.color }]}>
                <Text style={styles.legendEmoji}>{config.emoji}</Text>
              </View>
              <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
                {category}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

// ===== ESTILOS =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  filtersContainer: {
    overflow: 'hidden',
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 6,
  },
  categoryCount: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  categoryCountText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  clearFiltersButton: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  clearFiltersText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    position: 'absolute',
    top: 110,
    right: 16,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    zIndex: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsLabel: {
    fontSize: 12,
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinner: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  mapView: {
    flex: 1,
  },
  mapBackground: {
    flex: 1,
    position: 'relative',
  },
  streetsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
  street: {
    position: 'absolute',
  },
  streetHorizontal: {
    height: 2,
    width: '80%',
    top: '50%',
    left: '10%',
  },
  streetVertical: {
    width: 2,
    height: '80%',
    left: '50%',
    top: '10%',
  },
  streetDiagonal: {
    height: 1,
    width: '60%',
    top: '30%',
    left: '20%',
    transform: [{ rotate: '45deg' }],
  },
  marker: {
    position: 'absolute',
  },
  markerTouchable: {
    position: 'relative',
  },
  markerPulse: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    top: -6,
    left: -6,
    opacity: 0.6,
  },
  markerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  markerEmoji: {
    fontSize: 20,
  },
  popularBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeEmoji: {
    fontSize: 10,
  },
  friendsBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EC4899',
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendsBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  zoomControls: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  zoomButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  zoomIndicator: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  zoomText: {
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  eventDetailsContainer: {
    flex: 1,
  },
  mapInfo: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  mapInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  mapInfoText: {
    marginLeft: 8,
    fontSize: 14,
  },
  viewDetailsButton: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewDetailsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  legend: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    padding: 12,
    borderRadius: 12,
    maxWidth: SCREEN_WIDTH * 0.6,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  legendIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  legendEmoji: {
    fontSize: 12,
  },
  legendText: {
    fontSize: 10,
  },
});

export default InteractiveEventMap;