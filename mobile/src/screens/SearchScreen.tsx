import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { apiClient } from '../services/apiClient';
import { 
  Search, Filter, Calendar, Users, FileText, Star, MapPin, 
  Heart, Share2, Bookmark, Eye, MoreHorizontal, Hash
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface SearchResult {
  id: string;
  type: 'event' | 'tribe' | 'post' | 'user' | 'review';
  title: string;
  description?: string;
  content?: string;
  author?: {
    username: string;
    avatar?: string;
  };
  host?: {
    username: string;
    avatar?: string;
  };
  location?: string;
  date?: string;
  rating?: number;
  likes?: number;
  views?: number;
  memberCount?: number;
  category?: string;
  tags?: string[];
  highlights?: string[];
}

export default function SearchScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  // Fetch search results
  const { data: searchResults, isLoading, refetch } = useQuery({
    queryKey: ['search', searchQuery, selectedType, selectedCategory, sortBy],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      
      const params = new URLSearchParams();
      params.append('query', searchQuery);
      if (selectedType !== 'all') params.append('type', selectedType);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (sortBy) params.append('sort', sortBy);
      
      const response = await apiClient.get(`/search?${params.toString()}`);
      return response.data;
    },
    enabled: searchQuery.trim().length > 0,
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      refetch();
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'event': return <Calendar size={16} color={colors.primary} />;
      case 'tribe': return <Users size={16} color={colors.secondary} />;
      case 'post': return <FileText size={16} color={colors.info} />;
      case 'user': return <Star size={16} color={colors.warning} />;
      case 'review': return <Star size={16} color={colors.success} />;
      default: return <Search size={16} color={colors.textSecondary} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'event': return 'Evento';
      case 'tribe': return 'Tribu';
      case 'post': return 'Post';
      case 'user': return 'Usuario';
      case 'review': return 'Review';
      default: return 'Resultado';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'event': return colors.primary;
      case 'tribe': return colors.secondary;
      case 'post': return colors.info;
      case 'user': return colors.warning;
      case 'review': return colors.success;
      default: return colors.textSecondary;
    }
  };

  const types = [
    { id: 'all', label: 'Todos', icon: 'grid' },
    { id: 'event', label: 'Eventos', icon: 'calendar' },
    { id: 'tribe', label: 'Tribus', icon: 'people' },
    { id: 'post', label: 'Posts', icon: 'document-text' },
    { id: 'user', label: 'Usuarios', icon: 'person' },
    { id: 'review', label: 'Reviews', icon: 'star' },
  ];

  const categories = [
    { id: 'all', label: 'Todas', icon: 'grid' },
    { id: 'technology', label: 'Tecnología', icon: 'laptop' },
    { id: 'music', label: 'Música', icon: 'musical-notes' },
    { id: 'sports', label: 'Deportes', icon: 'football' },
    { id: 'business', label: 'Negocios', icon: 'briefcase' },
    { id: 'education', label: 'Educación', icon: 'school' },
    { id: 'entertainment', label: 'Entretenimiento', icon: 'film' },
  ];

  const sortOptions = [
    { id: 'relevance', label: 'Relevancia' },
    { id: 'recent', label: 'Más Recientes' },
    { id: 'popular', label: 'Más Populares' },
    { id: 'rating', label: 'Mejor Valorados' },
  ];

  const renderSearchResult = (result: SearchResult) => (
    <TouchableOpacity
      key={`${result.type}-${result.id}`}
      style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => {
        switch (result.type) {
          case 'event':
            navigation.navigate('EventDetail' as never, { eventId: result.id } as never);
            break;
          case 'tribe':
            navigation.navigate('TribeDetail' as never, { tribeId: result.id } as never);
            break;
          case 'post':
            navigation.navigate('PostDetail' as never, { postId: result.id } as never);
            break;
          case 'user':
            navigation.navigate('UserProfile' as never, { userId: result.id } as never);
            break;
          case 'review':
            // Navigate to review detail or related entity
            break;
        }
      }}
    >
      {/* Result Header */}
      <View style={styles.resultHeader}>
        <View style={styles.resultType}>
          {getTypeIcon(result.type)}
          <Text style={[styles.resultTypeText, { color: getTypeColor(result.type) }]}>
            {getTypeLabel(result.type)}
          </Text>
        </View>
        
        <TouchableOpacity style={styles.moreButton}>
          <MoreHorizontal size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Result Content */}
      <View style={styles.resultContent}>
        <Text style={[styles.resultTitle, { color: colors.text }]} numberOfLines={2}>
          {result.title}
        </Text>
        
        {(result.description || result.content) && (
          <Text style={[styles.resultDescription, { color: colors.textSecondary }]} numberOfLines={2}>
            {result.description || result.content}
          </Text>
        )}

        {/* Highlights */}
        {result.highlights && result.highlights.length > 0 && (
          <View style={styles.highlightsContainer}>
            <Text style={[styles.highlightsLabel, { color: colors.primary }]}>
              Coincidencias:
            </Text>
            {result.highlights.map((highlight, index) => (
              <Text key={index} style={[styles.highlight, { color: colors.textSecondary }]}>
                • {highlight}
              </Text>
            ))}
          </View>
        )}

        {/* Result Meta */}
        <View style={styles.resultMeta}>
          {(result.author || result.host) && (
            <View style={styles.authorInfo}>
              {(result.author?.avatar || result.host?.avatar) ? (
                <Image 
                  source={{ uri: result.author?.avatar || result.host?.avatar }} 
                  style={styles.authorAvatar} 
                />
              ) : (
                <View style={[styles.authorAvatar, { backgroundColor: colors.primary }]}>
                  <Text style={styles.authorInitial}>
                    {(result.author?.username || result.host?.username || 'U').charAt(0)}
                  </Text>
                </View>
              )}
              <Text style={[styles.authorName, { color: colors.textSecondary }]}>
                @{result.author?.username || result.host?.username}
              </Text>
            </View>
          )}

          <View style={styles.metaDetails}>
            {result.location && (
              <View style={styles.metaDetail}>
                <MapPin size={14} color={colors.textSecondary} />
                <Text style={[styles.metaDetailText, { color: colors.textSecondary }]}>
                  {result.location}
                </Text>
              </View>
            )}
            
            {result.date && (
              <View style={styles.metaDetail}>
                <Calendar size={14} color={colors.textSecondary} />
                <Text style={[styles.metaDetailText, { color: colors.textSecondary }]}>
                  {result.date}
                </Text>
              </View>
            )}
            
            {result.rating && (
              <View style={styles.metaDetail}>
                <Star size={14} color={colors.warning} />
                <Text style={[styles.metaDetailText, { color: colors.textSecondary }]}>
                  {result.rating}/5
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Result Tags */}
        {result.tags && result.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {result.tags.slice(0, 3).map((tag, index) => (
              <View
                key={index}
                style={[styles.tag, { backgroundColor: colors.primary + '20' }]}
              >
                <Hash size={12} color={colors.primary} />
                <Text style={[styles.tagText, { color: colors.primary }]}>
                  {tag}
                </Text>
              </View>
            ))}
            {result.tags.length > 3 && (
              <Text style={[styles.moreTagsText, { color: colors.textSecondary }]}>
                +{result.tags.length - 3} más
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Result Footer */}
      <View style={styles.resultFooter}>
        <View style={styles.resultStats}>
          {result.likes !== undefined && (
            <View style={styles.resultStat}>
              <Heart size={14} color={colors.primary} />
              <Text style={[styles.resultStatText, { color: colors.textSecondary }]}>
                {result.likes}
              </Text>
            </View>
          )}
          
          {result.views !== undefined && (
            <View style={styles.resultStat}>
              <Eye size={14} color={colors.textSecondary} />
              <Text style={[styles.resultStatText, { color: colors.textSecondary }]}>
                {result.views}
              </Text>
            </View>
          )}
          
          {result.memberCount !== undefined && (
            <View style={styles.resultStat}>
              <Users size={14} color={colors.secondary} />
              <Text style={[styles.resultStatText, { color: colors.textSecondary }]}>
                {result.memberCount}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.resultActions}>
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
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Header */}
      <View style={[styles.searchHeader, { backgroundColor: colors.surface }]}>
        <View style={styles.searchBar}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar eventos, tribus, posts, usuarios..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={[styles.searchButtonText, { color: colors.primary }]}>
              Buscar
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Types */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.typesContainer}
        >
          {types.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeButton,
                selectedType === type.id && { backgroundColor: colors.primary }
              ]}
              onPress={() => setSelectedType(type.id)}
            >
              <Ionicons
                name={type.icon as any}
                size={16}
                color={selectedType === type.id ? 'white' : colors.textSecondary}
              />
              <Text style={[
                styles.typeButtonText,
                { color: selectedType === type.id ? 'white' : colors.textSecondary }
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

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
                selectedCategory === category.id && { backgroundColor: colors.secondary }
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
                sortBy === option.id && { backgroundColor: colors.info }
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

      {/* Search Results */}
      <ScrollView
        style={styles.resultsContainer}
        showsVerticalScrollIndicator={false}
      >
        {!searchQuery.trim() ? (
          <View style={styles.emptyState}>
            <Search size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              ¿Qué estás buscando?
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Busca eventos, tribus, posts, usuarios y más en EventConnect
            </Text>
          </View>
        ) : isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Buscando...
            </Text>
          </View>
        ) : searchResults && searchResults.length > 0 ? (
          <View style={styles.resultsList}>
            {searchResults.map(renderSearchResult)}
          </View>
        ) : (
          <View style={styles.noResultsContainer}>
            <Search size={64} color={colors.textSecondary} />
            <Text style={[styles.noResultsTitle, { color: colors.text }]}>
              No se encontraron resultados
            </Text>
            <Text style={[styles.noResultsSubtitle, { color: colors.textSecondary }]}>
              Intenta ajustar los filtros de búsqueda o usar términos diferentes
            </Text>
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
  searchHeader: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  searchButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  typesContainer: {
    marginBottom: 16,
  },
  typeButton: {
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
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
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
  resultsContainer: {
    flex: 1,
  },
  emptyState: {
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
  resultsList: {
    paddingHorizontal: 20,
  },
  resultCard: {
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
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resultTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  moreButton: {
    padding: 4,
  },
  resultContent: {
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 24,
  },
  resultDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  highlightsContainer: {
    marginBottom: 12,
  },
  highlightsLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  highlight: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 2,
  },
  resultMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  authorInitial: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  authorName: {
    fontSize: 12,
  },
  metaDetails: {
    alignItems: 'flex-end',
  },
  metaDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaDetailText: {
    fontSize: 10,
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 4,
    gap: 3,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '600',
  },
  moreTagsText: {
    fontSize: 10,
    fontStyle: 'italic',
  },
  resultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  resultStatText: {
    fontSize: 10,
    marginLeft: 4,
  },
  resultActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 6,
    marginLeft: 2,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  noResultsSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomSpacing: {
    height: 100,
  },
});
