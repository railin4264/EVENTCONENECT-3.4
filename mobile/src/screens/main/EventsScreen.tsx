import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

// ==========================================
// TIPOS E INTERFACES
// ==========================================

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  category: string;
  price: number;
  attendees: number;
  maxAttendees: number;
  isFeatured: boolean;
  isTrending: boolean;
}

// ==========================================
// DATOS MOCK PARA DESARROLLO
// ==========================================

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Festival de Música Electrónica',
    description: 'El evento más grande de música electrónica del año con los mejores DJs internacionales.',
    date: '31 Dic',
    time: '20:00',
    location: 'Parque Central, Buenos Aires',
    image: 'https://via.placeholder.com/300x200/6366f1/ffffff?text=Festival',
    category: 'Música',
    price: 150,
    attendees: 1500,
    maxAttendees: 2000,
    isFeatured: true,
    isTrending: true
  },
  {
    id: '2',
    title: 'Conferencia de Tecnología',
    description: 'Descubre las últimas tendencias en tecnología e innovación.',
    date: '15 Dic',
    time: '09:00',
    location: 'Centro de Convenciones, Córdoba',
    image: 'https://via.placeholder.com/300x200/8b5cf6/ffffff?text=Tech',
    category: 'Tecnología',
    price: 75,
    attendees: 300,
    maxAttendees: 500,
    isFeatured: true,
    isTrending: false
  },
  {
    id: '3',
    title: 'Clase de Yoga al Aire Libre',
    description: 'Conecta con la naturaleza mientras practicas yoga en un entorno único.',
    date: '20 Dic',
    time: '07:00',
    location: 'Reserva Ecológica, Mendoza',
    image: 'https://via.placeholder.com/300x200/10b981/ffffff?text=Yoga',
    category: 'Bienestar',
    price: 25,
    attendees: 45,
    maxAttendees: 60,
    isFeatured: false,
    isTrending: true
  }
];

const categories = [
  { id: 'all', name: 'Todos', icon: '🌟' },
  { id: 'music', name: 'Música', icon: '🎵' },
  { id: 'technology', name: 'Tecnología', icon: '💻' },
  { id: 'wellness', name: 'Bienestar', icon: '🧘' },
  { id: 'business', name: 'Negocios', icon: '💼' },
  { id: 'sports', name: 'Deportes', icon: '⚽' }
];

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

const EventsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'popularity' | 'price'>('date');

  // ==========================================
  // FUNCIONES
  // ==========================================
  
  const onRefresh = async () => {
    setRefreshing(true);
    // Simular carga de datos
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleEventPress = (event: Event) => {
    // Navegar al detalle del evento
    Alert.alert('Evento', `Abriendo: ${event.title}`);
  };

  const handleCreateEvent = () => {
    Alert.alert('Crear Evento', 'Funcionalidad de crear evento');
  };

  const handleFilterPress = () => {
    Alert.alert('Filtros', 'Funcionalidad de filtros avanzados');
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || event.category.toLowerCase().includes(selectedCategory.toLowerCase());
    
    return matchesSearch && matchesCategory;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'popularity':
        return b.attendees - a.attendees;
      case 'price':
        return a.price - b.price;
      default:
        return 0;
    }
  });

  // ==========================================
  // COMPONENTES DE RENDERIZADO
  // ==========================================
  
  const renderEventCard = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => handleEventPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.eventImageContainer}>
        <Image source={{ uri: item.image }} style={styles.eventImage} />
        {item.isFeatured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>⭐ Destacado</Text>
          </View>
        )}
        {item.isTrending && (
          <View style={styles.trendingBadge}>
            <Text style={styles.trendingText}>🔥 Trending</Text>
          </View>
        )}
      </View>
      
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>
        
        <Text style={styles.eventDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.eventDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#6b7280" />
            <Text style={styles.detailText}>{item.date} • {item.time}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color="#6b7280" />
            <Text style={styles.detailText} numberOfLines={1}>{item.location}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="people-outline" size={16} color="#6b7280" />
            <Text style={styles.detailText}>{item.attendees}/{item.maxAttendees} asistentes</Text>
          </View>
        </View>
        
        <View style={styles.eventFooter}>
          <Text style={styles.priceText}>
            {item.price === 0 ? 'Gratis' : `$${item.price}`}
          </Text>
          
          <TouchableOpacity style={styles.joinButton}>
            <Text style={styles.joinButtonText}>Unirse</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }: { item: typeof categories[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.categoryItemActive
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text style={[
        styles.categoryName,
        selectedCategory === item.id && styles.categoryNameActive
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // ==========================================
  // RENDERIZADO DEL COMPONENTE
  // ==========================================
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Eventos</Text>
          <Text style={styles.headerSubtitle}>Descubre experiencias increíbles</Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleFilterPress}>
            <Ionicons name="filter" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerButton} onPress={handleCreateEvent}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar eventos..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      {/* Categorías */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Ordenamiento */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Ordenar por:</Text>
        <View style={styles.sortButtons}>
          {[
            { key: 'date', label: 'Fecha', icon: 'calendar' },
            { key: 'popularity', label: 'Popularidad', icon: 'trending-up' },
            { key: 'price', label: 'Precio', icon: 'pricetag' }
          ].map(sort => (
            <TouchableOpacity
              key={sort.key}
              style={[
                styles.sortButton,
                sortBy === sort.key && styles.sortButtonActive
              ]}
              onPress={() => setSortBy(sort.key as any)}
            >
              <Ionicons 
                name={sort.icon as any} 
                size={16} 
                color={sortBy === sort.key ? '#6366f1' : '#6b7280'} 
              />
              <Text style={[
                styles.sortButtonText,
                sortBy === sort.key && styles.sortButtonTextActive
              ]}>
                {sort.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Lista de eventos */}
      <FlatList
        data={sortedEvents}
        renderItem={renderEventCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.eventsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No se encontraron eventos</Text>
            <Text style={styles.emptySubtitle}>
              Intenta ajustar los filtros o la búsqueda
            </Text>
          </View>
        }
      />
    </View>
  );
};

// ==========================================
// ESTILOS
// ==========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  
  // Header
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerActions: {
    flexDirection: 'row',
    position: 'absolute',
    top: 60,
    right: 20,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  
  // Búsqueda
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#1f2937',
  },
  
  // Categorías
  categoriesContainer: {
    backgroundColor: 'white',
    paddingVertical: 16,
  },
  categoriesList: {
    paddingHorizontal: 20,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  categoryItemActive: {
    backgroundColor: '#6366f1',
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  categoryNameActive: {
    color: 'white',
  },
  
  // Ordenamiento
  sortContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    gap: 6,
  },
  sortButtonActive: {
    backgroundColor: '#e0e7ff',
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  sortButtonTextActive: {
    color: '#6366f1',
  },
  
  // Lista de eventos
  eventsList: {
    padding: 20,
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  eventImageContainer: {
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  trendingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendingText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  
  // Contenido del evento
  eventContent: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
    marginRight: 12,
  },
  categoryBadge: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6366f1',
  },
  eventDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  
  // Detalles del evento
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
    color: '#6b7280',
    marginLeft: 8,
    flex: 1,
  },
  
  // Footer del evento
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  joinButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  
  // Estado vacío
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default EventsScreen;