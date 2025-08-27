import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Image,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { apiClient } from '../services/apiClient';
import { 
  Calendar, Users, MapPin, Clock, Heart, Share2, Bookmark, 
  Plus, Search, Filter, Star, Eye, MoreHorizontal
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
  tags: string[];
  status: 'upcoming' | 'today' | 'past' | 'cancelled';
}

export default function EventsScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Fetch events
  const { data: events, isLoading, refetch } = useQuery({
    queryKey: ['events', searchQuery, selectedCategory, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (sortBy) params.append('sort', sortBy);
      
      const response = await apiClient.get(`/events?${params.toString()}`);
      return response.data;
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
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

  const getEventStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'today';
    return 'past';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return colors.info;
      case 'today': return colors.success;
      case 'past': return colors.textSecondary;
      case 'cancelled': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Próximo';
      case 'today': return 'Hoy';
      case 'past': return 'Pasado';
      case 'cancelled': return 'Cancelado';
      default: return '';
    }
  };

  const categories = [
    { id: 'all', label: 'Todos', icon: 'grid' },
    { id: 'music', label: 'Música', icon: 'musical-notes' },
    { id: 'sports', label: 'Deportes', icon: 'football' },
    { id: 'technology', label: 'Tecnología', icon: 'laptop' },
    { id: 'business', label: 'Negocios', icon: 'briefcase' },
    { id: 'education', label: 'Educación', icon: 'school' },
    { id: 'entertainment', label: 'Entretenimiento', icon: 'film' },
  ];

  const sortOptions = [
    { id: 'recent', label: 'Más Recientes' },
    { id: 'popular', label: 'Más Populares' },
    { id: 'date', label: 'Por Fecha' },
    { id: 'price', label: 'Por Precio' },
  ];

  const renderEventCard = (event: Event) => {
    const status = getEventStatus(event.startDate, event.endDate);
    
    return (
      <TouchableOpacity
        key={event.id}
        style={[styles.eventCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => navigation.navigate('EventDetail' as never, { eventId: event.id } as never)}
      >
        {/* Event Header */}
        <View style={styles.eventHeader}>
          <View style={styles.eventTitleContainer}>
            <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={2}>
              {event.title}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                {getStatusText(status)}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.moreButton}>
            <MoreHorizontal size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Event Description */}
        <Text style={[styles.eventDescription, { color: colors.textSecondary }]} numberOfLines={2}>
          {event.description}
        </Text>

        {/* Event Details */}
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

        {/* Event Footer */}
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

        {/* Event Tags */}
        {event.tags && event.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {event.tags.slice(0, 3).map((tag, index) => (
              <View
                key={index}
                style={[styles.tag, { backgroundColor: colors.primary + '20' }]}
              >
                <Text style={[styles.tagText, { color: colors.primary }]}>
                  {tag}
                </Text>
              </View>
            ))}
            {event.tags.length > 3 && (
              <Text style={[styles.moreTagsText, { color: colors.textSecondary }]}>
                +{event.tags.length - 3} más
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Eventos</Text>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('CreateEvent' as never)}
          >
            <Plus size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar eventos..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && { backgroundColor: colors.primary }
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons
                name={category.icon as any}
                size={16}
                color={selectedCategory === category.id ? 'white' : colors.textSecondary}
              />
              <Text style={[
                styles.categoryButtonText,
                { color: selectedCategory === category.id ? 'white' : colors.textSecondary }
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sort Options */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.sortContainer}
        >
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.sortButton,
                sortBy === option.id && { backgroundColor: colors.primary }
              ]}
              onPress={() => setSortBy(option.id)}
            >
              <Text style={[
                styles.sortButtonText,
                { color: sortBy === option.id ? 'white' : colors.textSecondary }
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Events List */}
      <ScrollView
        style={styles.eventsContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Cargando eventos...
            </Text>
          </View>
        ) : events && events.length > 0 ? (
          <View style={styles.eventsList}>
            {events.map(renderEventCard)}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Calendar size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No se encontraron eventos
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {searchQuery || selectedCategory !== 'all' 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'No hay eventos disponibles en este momento'
              }
            </Text>
            <TouchableOpacity
              style={[styles.createEventButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('CreateEvent' as never)}
            >
              <Plus size={20} color="white" />
              <Text style={styles.createEventButtonText}>Crear Evento</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  filterButton: {
    padding: 4,
    marginLeft: 8,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  sortContainer: {
    marginBottom: 16,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  eventsContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
  },
  eventsList: {
    paddingHorizontal: 20,
  },
  eventCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 24,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  moreButton: {
    padding: 4,
  },
  eventDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  eventDetails: {
    marginBottom: 16,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventDetailText: {
    fontSize: 14,
    marginLeft: 8,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    marginRight: 8,
  },
  hostInitial: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  hostName: {
    fontSize: 14,
  },
  eventActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  moreTagsText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  createEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createEventButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 100,
  },
});