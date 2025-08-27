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
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { apiClient } from '../services/apiClient';
import { 
  Users, MapPin, Lock, Globe, Heart, Share2, Bookmark, 
  Plus, Search, Filter, Star, Eye, MoreHorizontal, Hash
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface Tribe {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  maxMembers: number;
  category: string;
  isPrivate: boolean;
  location?: string;
  tags: string[];
  host: {
    username: string;
    avatar?: string;
  };
  createdAt: string;
  isJoined: boolean;
  isLiked: boolean;
}

export default function TribesScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  // Fetch tribes
  const { data: tribes, isLoading, refetch } = useQuery({
    queryKey: ['tribes', searchQuery, selectedCategory, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (sortBy) params.append('sort', sortBy);
      
      const response = await apiClient.get(`/tribes?${params.toString()}`);
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

  const categories = [
    { id: 'all', label: 'Todas', icon: 'grid' },
    { id: 'technology', label: 'Tecnología', icon: 'laptop' },
    { id: 'music', label: 'Música', icon: 'musical-notes' },
    { id: 'sports', label: 'Deportes', icon: 'football' },
    { id: 'business', label: 'Negocios', icon: 'briefcase' },
    { id: 'education', label: 'Educación', icon: 'school' },
    { id: 'entertainment', label: 'Entretenimiento', icon: 'film' },
    { id: 'gaming', label: 'Gaming', icon: 'game-controller' },
  ];

  const sortOptions = [
    { id: 'popular', label: 'Más Populares' },
    { id: 'recent', label: 'Más Recientes' },
    { id: 'members', label: 'Más Miembros' },
    { id: 'name', label: 'Por Nombre' },
  ];

  const renderTribeCard = (tribe: Tribe) => (
    <TouchableOpacity
      key={tribe.id}
      style={[styles.tribeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => navigation.navigate('TribeDetail' as never, { tribeId: tribe.id } as never)}
    >
      {/* Tribe Header */}
      <View style={styles.tribeHeader}>
        <View style={styles.tribeTitleContainer}>
          <Text style={[styles.tribeTitle, { color: colors.text }]} numberOfLines={2}>
            {tribe.name}
          </Text>
          <View style={[
            styles.privacyBadge,
            { backgroundColor: tribe.isPrivate ? colors.warning + '20' : colors.success + '20' }
          ]}>
            {tribe.isPrivate ? (
              <Lock size={12} color={colors.warning} />
            ) : (
              <Globe size={12} color={colors.success} />
            )}
            <Text style={[
              styles.privacyText,
              { color: tribe.isPrivate ? colors.warning : colors.success }
            ]}>
              {tribe.isPrivate ? 'Privada' : 'Pública'}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.moreButton}>
          <MoreHorizontal size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Tribe Description */}
      <Text style={[styles.tribeDescription, { color: colors.textSecondary }]} numberOfLines={2}>
        {tribe.description}
      </Text>

      {/* Tribe Details */}
      <View style={styles.tribeDetails}>
        <View style={styles.tribeDetail}>
          <Users size={16} color={colors.textSecondary} />
          <Text style={[styles.tribeDetailText, { color: colors.textSecondary }]}>
            {tribe.memberCount}/{tribe.maxMembers} miembros
          </Text>
        </View>
        
        <View style={styles.tribeDetail}>
          <Hash size={16} color={colors.textSecondary} />
          <Text style={[styles.tribeDetailText, { color: colors.textSecondary }]}>
            {tribe.category}
          </Text>
        </View>
        
        {tribe.location && (
          <View style={styles.tribeDetail}>
            <MapPin size={16} color={colors.textSecondary} />
            <Text style={[styles.tribeDetailText, { color: colors.textSecondary }]}>
              {tribe.location}
            </Text>
          </View>
        )}
      </View>

      {/* Tribe Footer */}
      <View style={styles.tribeFooter}>
        <View style={styles.tribeHost}>
          {tribe.host.avatar ? (
            <Image source={{ uri: tribe.host.avatar }} style={styles.hostAvatar} />
          ) : (
            <View style={[styles.hostAvatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.hostInitial}>{tribe.host.username.charAt(0)}</Text>
            </View>
          )}
          <Text style={[styles.hostName, { color: colors.textSecondary }]}>
            @{tribe.host.username}
          </Text>
        </View>
        
        <View style={styles.tribeActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Heart size={16} color={tribe.isLiked ? colors.error : colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Bookmark size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Share2 size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tribe Tags */}
      {tribe.tags && tribe.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {tribe.tags.slice(0, 3).map((tag, index) => (
            <View
              key={index}
              style={[styles.tag, { backgroundColor: colors.secondary + '20' }]}
            >
              <Text style={[styles.tagText, { color: colors.secondary }]}>
                {tag}
              </Text>
            </View>
          ))}
          {tribe.tags.length > 3 && (
            <Text style={[styles.moreTagsText, { color: colors.textSecondary }]}>
              +{tribe.tags.length - 3} más
            </Text>
          )}
        </View>
      )}

      {/* Join Button */}
      <TouchableOpacity
        style={[
          styles.joinButton,
          tribe.isJoined 
            ? { backgroundColor: colors.textSecondary }
            : { backgroundColor: colors.primary }
        ]}
        onPress={() => {
          // Handle join/leave logic
          Alert.alert('Info', 'Función de unirse/salir en desarrollo');
        }}
      >
        <Text style={styles.joinButtonText}>
          {tribe.isJoined ? 'Salir' : 'Unirse'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Tribus</Text>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('CreateTribe' as never)}
          >
            <Plus size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar tribus..."
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

      {/* Tribes List */}
      <ScrollView
        style={styles.tribesContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Cargando tribus...
            </Text>
          </View>
        ) : tribes && tribes.length > 0 ? (
          <View style={styles.tribesList}>
            {tribes.map(renderTribeCard)}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Users size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No se encontraron tribus
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {searchQuery || selectedCategory !== 'all' 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'No hay tribus disponibles en este momento'
              }
            </Text>
            <TouchableOpacity
              style={[styles.createTribeButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('CreateTribe' as never)}
            >
              <Plus size={20} color="white" />
              <Text style={styles.createTribeButtonText}>Crear Tribu</Text>
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
  tribesContainer: {
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
  tribesList: {
    paddingHorizontal: 20,
  },
  tribeCard: {
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
  tribeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tribeTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  tribeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 24,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  privacyText: {
    fontSize: 10,
    fontWeight: '600',
  },
  moreButton: {
    padding: 4,
  },
  tribeDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  tribeDetails: {
    marginBottom: 16,
  },
  tribeDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tribeDetailText: {
    fontSize: 14,
    marginLeft: 8,
  },
  tribeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tribeHost: {
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
  tribeActions: {
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
    marginBottom: 16,
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
  joinButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
  createTribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createTribeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 100,
  },
});
