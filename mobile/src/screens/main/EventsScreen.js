import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert,
  RefreshControl,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Search,
  Plus,
  Calendar,
  MapPin,
  Clock,
  Users,
  Filter,
  Heart,
  Share,
  Star,
  Bookmark,
  TrendingUp,
  Navigation
} from 'lucide-react-native';

import eventsService from '../../services/EventsService';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../hooks/useLocation';

const { width } = Dimensions.get('window');

const EventsScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { location } = useLocation();

  // Estados
  const [activeTab, setActiveTab] = useState('discover'); // discover, my-events, nearby, saved
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, [activeTab]);

  useEffect(() => {
    if (searchQuery) {
      handleSearch();
    } else {
      loadEvents();
    }
  }, [selectedCategory, selectedDate]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadEvents(),
        loadCategories()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await eventsService.getEventCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadEvents = async (reset = true) => {
    try {
      if (reset) {
        setPage(1);
        setEvents([]);
      }

      let response;
      const currentPage = reset ? 1 : page;

      switch (activeTab) {
        case 'my-events':
          response = await eventsService.getUserEvents();
          break;
        case 'nearby':
          if (location) {
            response = await eventsService.getNearbyEvents(
              location.coords.latitude,
              location.coords.longitude,
              10000 // 10km radius
            );
          } else {
            response = { data: [] };
          }
          break;
        case 'saved':
          response = await eventsService.getSavedEvents();
          break;
        default:
          response = await eventsService.getAllEvents({
            page: currentPage,
            category: selectedCategory,
            date: selectedDate,
          });
      }

      const newEvents = response.data || [];
      
      if (reset) {
        setEvents(newEvents);
      } else {
        setEvents(prev => [...prev, ...newEvents]);
      }

      setHasMore(newEvents.length === 20);
      if (!reset) setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading events:', error);
      Alert.alert('Error', 'No se pudieron cargar los eventos');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsLoading(true);
      const response = await eventsService.searchEvents(searchQuery, {
        category: selectedCategory,
        date: selectedDate
      });
      setEvents(response.data || []);
    } catch (error) {
      console.error('Error searching events:', error);
      Alert.alert('Error', 'Error en la búsqueda');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadEvents(true);
    setIsRefreshing(false);
  };

  const handleSaveEvent = async (eventId, isSaved) => {
    try {
      if (isSaved) {
        await eventsService.unsaveEvent(eventId);
      } else {
        await eventsService.saveEvent(eventId);
      }
      loadEvents(true);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleJoinEvent = async (eventId) => {
    try {
      await eventsService.joinEvent(eventId);
      Alert.alert('Éxito', 'Te has unido al evento');
      loadEvents(true);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderEventCard = ({ item: event }) => (
    <TouchableOpacity 
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetail', { eventId: event._id })}
    >
      <LinearGradient
        colors={['rgba(103,232,249,0.1)', 'rgba(124,58,237,0.1)']}
        style={styles.cardGradient}
      >
        {/* Imagen del evento */}
        <View style={styles.eventImageContainer}>
          {event.image ? (
            <Image source={{ uri: event.image }} style={styles.eventImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Calendar size={32} color="#67e8f9" />
            </View>
          )}
          
          {/* Badge de fecha */}
          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>{formatDate(event.date)}</Text>
          </View>

          {/* Botón de guardar */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => handleSaveEvent(event._id, event.isSaved)}
          >
            <Bookmark 
              size={20} 
              color={event.isSaved ? "#fbbf24" : "#9ca3af"}
              fill={event.isSaved ? "#fbbf24" : "transparent"}
            />
          </TouchableOpacity>
        </View>

        {/* Información del evento */}
        <View style={styles.eventInfo}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventTitle} numberOfLines={2}>
              {event.title}
            </Text>
            {event.isVerified && (
              <Star size={16} color="#fbbf24" fill="#fbbf24" />
            )}
          </View>

          <Text style={styles.eventDescription} numberOfLines={2}>
            {event.description}
          </Text>

          {/* Detalles del evento */}
          <View style={styles.eventDetails}>
            <View style={styles.detailItem}>
              <Clock size={16} color="#9ca3af" />
              <Text style={styles.detailText}>
                {formatTime(event.date)}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <MapPin size={16} color="#9ca3af" />
              <Text style={styles.detailText} numberOfLines={1}>
                {event.location?.name || 'Ubicación por confirmar'}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Users size={16} color="#9ca3af" />
              <Text style={styles.detailText}>
                {event.attendeeCount || 0} asistentes
              </Text>
            </View>
          </View>

          {/* Precio */}
          {event.price !== undefined && (
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>
                {event.price === 0 ? 'Gratis' : `$${event.price}`}
              </Text>
            </View>
          )}

          {/* Acciones */}
          <View style={styles.eventActions}>
            {event.isAttending ? (
              <TouchableOpacity style={[styles.actionButton, styles.attendingButton]}>
                <Text style={styles.attendingButtonText}>Asistiendo</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.actionButton, styles.joinButton]}
                onPress={() => handleJoinEvent(event._id)}
              >
                <Text style={styles.joinButtonText}>Unirse</Text>
              </TouchableOpacity>
            )}

            <View style={styles.secondaryActions}>
              <TouchableOpacity style={styles.iconButton}>
                <Heart size={20} color="#9ca3af" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Share size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Categoría */}
          {event.category && (
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{event.category}</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderCategoryFilter = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.categoryFilter}
      contentContainerStyle={styles.categoryFilterContent}
    >
      <TouchableOpacity
        style={[
          styles.categoryChip,
          !selectedCategory && styles.categoryChipActive
        ]}
        onPress={() => setSelectedCategory(null)}
      >
        <Text style={[
          styles.categoryChipText,
          !selectedCategory && styles.categoryChipTextActive
        ]}>
          Todas
        </Text>
      </TouchableOpacity>

      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryChip,
            selectedCategory === category.id && styles.categoryChipActive
          ]}
          onPress={() => setSelectedCategory(category.id)}
        >
          <Text style={[
            styles.categoryChipText,
            selectedCategory === category.id && styles.categoryChipTextActive
          ]}>
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {[
        { id: 'discover', label: 'Descubrir', icon: Search },
        { id: 'my-events', label: 'Mis Eventos', icon: Calendar },
        { id: 'nearby', label: 'Cercanos', icon: Navigation },
        { id: 'saved', label: 'Guardados', icon: Bookmark },
      ].map(({ id, label, icon: Icon }) => (
        <TouchableOpacity
          key={id}
          style={[
            styles.tabItem,
            activeTab === id && styles.tabItemActive
          ]}
          onPress={() => setActiveTab(id)}
        >
          <Icon 
            size={20} 
            color={activeTab === id ? '#67e8f9' : '#9ca3af'} 
          />
          <Text style={[
            styles.tabText,
            activeTab === id && styles.tabTextActive
          ]}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0f0f23', '#1a1a2e', '#16213e']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Eventos</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('CreateEvent')}
          >
            <Plus size={24} color="#67e8f9" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Filter size={24} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar eventos..."
            placeholderTextColor="#6b7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
        </View>
      </View>

      {/* Tab Bar */}
      {renderTabBar()}

      {/* Category Filter */}
      {activeTab === 'discover' && renderCategoryFilter()}

      {/* Events List */}
      <FlatList
        data={events}
        renderItem={renderEventCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.eventsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#67e8f9"
          />
        }
        onEndReached={() => {
          if (hasMore && !isLoading && activeTab === 'discover') {
            loadEvents(false);
          }
        }}
        onEndReachedThreshold={0.5}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInputContainer: {
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
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  tabItemActive: {
    backgroundColor: 'rgba(103, 232, 249, 0.2)',
  },
  tabText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#67e8f9',
  },
  categoryFilter: {
    marginBottom: 20,
  },
  categoryFilterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: 'rgba(103, 232, 249, 0.2)',
    borderColor: '#67e8f9',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#67e8f9',
  },
  eventsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  eventCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },
  eventImageContainer: {
    position: 'relative',
    height: 160,
  },
  eventImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  dateBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(103, 232, 249, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dateText: {
    fontSize: 12,
    color: '#0a0a0a',
    fontWeight: '600',
  },
  saveButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventInfo: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    marginRight: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
    marginBottom: 12,
  },
  eventDetails: {
    gap: 6,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#9ca3af',
    flex: 1,
  },
  priceContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  priceText: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '600',
  },
  eventActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  joinButton: {
    backgroundColor: '#67e8f9',
  },
  joinButtonText: {
    color: '#0a0a0a',
    fontWeight: '600',
    fontSize: 14,
  },
  attendingButton: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  attendingButtonText: {
    color: '#22c55e',
    fontWeight: '600',
    fontSize: 14,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryTagText: {
    fontSize: 12,
    color: '#a855f7',
    fontWeight: '500',
  },
});

export default EventsScreen;

