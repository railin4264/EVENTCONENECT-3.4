import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert,
  Modal,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Search,
  Filter,
  X,
  Clock,
  TrendingUp,
  MapPin,
  Calendar,
  Users,
  Star,
  Bookmark,
  Settings,
  ChevronDown,
  ChevronUp,
  Sliders
} from 'lucide-react-native';

import searchService from '../services/SearchService';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../hooks/useLocation';

const SearchScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { location } = useLocation();
  
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, events, tribes, users, posts
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Search state
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  
  // Filters state
  const [filters, setFilters] = useState({
    location: '',
    category: '',
    date: null,
    priceRange: [0, 1000],
    radius: 10000,
    sortBy: 'relevance',
    sortOrder: 'desc',
    tags: [],
    isOnline: null,
    isFree: null,
  });
  
  const searchInputRef = useRef(null);
  const debounceTimeout = useRef(null);

  useEffect(() => {
    initializeSearch();
  }, []);

  useEffect(() => {
    if (query.length > 2) {
      debouncedSearch();
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, activeTab]);

  const initializeSearch = async () => {
    try {
      await searchService.initialize();
      
      const [recent, trending, history] = await Promise.all([
        searchService.getRecentSearches(10),
        searchService.getTrendingSearches(10),
        searchService.getSearchHistory(10)
      ]);
      
      setRecentSearches(recent);
      setTrendingSearches(trending.data || []);
      setSearchHistory(history);
    } catch (error) {
      console.error('Error initializing search:', error);
    }
  };

  const debouncedSearch = () => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    debounceTimeout.current = setTimeout(() => {
      getSuggestions();
    }, 300);
  };

  const getSuggestions = async () => {
    try {
      const response = await searchService.getSearchSuggestions(query, activeTab, 8);
      setSuggestions(response.data || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error getting suggestions:', error);
    }
  };

  const performSearch = async (searchQuery = query, searchFilters = filters) => {
    if (!searchQuery.trim()) return;
    
    try {
      setIsLoading(true);
      setShowSuggestions(false);
      
      let response;
      
      switch (activeTab) {
        case 'events':
          response = await searchService.searchEvents(searchQuery, searchFilters);
          break;
        case 'tribes':
          response = await searchService.searchTribes(searchQuery, searchFilters);
          break;
        case 'users':
          response = await searchService.searchUsers(searchQuery, searchFilters);
          break;
        case 'posts':
          response = await searchService.searchPosts(searchQuery, searchFilters);
          break;
        default:
          response = await searchService.globalSearch(searchQuery, searchFilters);
      }
      
      setResults(response.data || []);
      
      // Add to recent searches
      searchService.addToRecentSearches(searchQuery);
      setRecentSearches(searchService.getRecentSearches(10));
      
      // Track search event
      await searchService.trackSearchEvent('search', {
        query: searchQuery,
        type: activeTab,
        resultsCount: response.data?.length || 0,
        filters: searchFilters
      });
      
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionPress = (suggestion) => {
    setQuery(suggestion.text || suggestion);
    setShowSuggestions(false);
    performSearch(suggestion.text || suggestion);
  };

  const handleRecentSearchPress = (recentQuery) => {
    setQuery(recentQuery);
    performSearch(recentQuery);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyFilters = () => {
    setShowFilters(false);
    if (query.trim()) {
      performSearch();
    }
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      category: '',
      date: null,
      priceRange: [0, 1000],
      radius: 10000,
      sortBy: 'relevance',
      sortOrder: 'desc',
      tags: [],
      isOnline: null,
      isFree: null,
    });
  };

  const handleResultPress = async (item) => {
    // Track click
    await searchService.trackSearchEvent('result_click', {
      resultId: item._id,
      resultType: item.searchType || activeTab,
      query,
      position: results.indexOf(item)
    });
    
    // Navigate based on type
    switch (item.searchType || activeTab) {
      case 'events':
        navigation.navigate('EventDetail', { eventId: item._id });
        break;
      case 'tribes':
        navigation.navigate('TribeDetail', { tribeId: item._id });
        break;
      case 'users':
        navigation.navigate('UserProfile', { userId: item._id });
        break;
      case 'posts':
        navigation.navigate('PostDetail', { postId: item._id });
        break;
    }
  };

  const renderSearchHeader = () => (
    <View style={styles.searchHeader}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="¿Qué estás buscando?"
            placeholderTextColor="#6b7280"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => performSearch()}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => setQuery('')}
              style={styles.clearButton}
            >
              <X size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Filter size={20} color="#67e8f9" />
        </TouchableOpacity>
      </View>
      
      {/* Search Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {[
          { key: 'all', label: 'Todo', icon: Search },
          { key: 'events', label: 'Eventos', icon: Calendar },
          { key: 'tribes', label: 'Tribus', icon: Users },
          { key: 'users', label: 'Usuarios', icon: Users },
          { key: 'posts', label: 'Posts', icon: Star },
        ].map(({ key, label, icon: Icon }) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.tab,
              activeTab === key && styles.activeTab
            ]}
            onPress={() => setActiveTab(key)}
          >
            <Icon 
              size={16} 
              color={activeTab === key ? '#ffffff' : '#9ca3af'} 
            />
            <Text style={[
              styles.tabText,
              activeTab === key && styles.activeTabText
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderSuggestions = () => {
    if (!showSuggestions || suggestions.length === 0) return null;
    
    return (
      <View style={styles.suggestionsContainer}>
        {suggestions.map((suggestion, index) => (
          <TouchableOpacity
            key={index}
            style={styles.suggestionItem}
            onPress={() => handleSuggestionPress(suggestion)}
          >
            <Search size={16} color="#9ca3af" />
            <Text style={styles.suggestionText}>
              {suggestion.text || suggestion}
            </Text>
            {suggestion.count && (
              <Text style={styles.suggestionCount}>
                {suggestion.count} resultados
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderEmptyState = () => {
    if (query.trim()) {
      return (
        <View style={styles.emptyState}>
          <Search size={64} color="#6b7280" />
          <Text style={styles.emptyStateTitle}>No se encontraron resultados</Text>
          <Text style={styles.emptyStateText}>
            Intenta con otros términos de búsqueda o ajusta los filtros
          </Text>
        </View>
      );
    }
    
    return (
      <ScrollView style={styles.emptyContent}>
        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Búsquedas recientes</Text>
            {recentSearches.map((recentQuery, index) => (
              <TouchableOpacity
                key={index}
                style={styles.recentSearchItem}
                onPress={() => handleRecentSearchPress(recentQuery)}
              >
                <Clock size={16} color="#9ca3af" />
                <Text style={styles.recentSearchText}>{recentQuery}</Text>
                <TouchableOpacity
                  onPress={() => {
                    searchService.removeFromHistory(index);
                    setRecentSearches(searchService.getRecentSearches(10));
                  }}
                >
                  <X size={16} color="#6b7280" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.clearAllButton}
              onPress={() => {
                searchService.clearRecentSearches();
                setRecentSearches([]);
              }}
            >
              <Text style={styles.clearAllText}>Limpiar historial</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Trending Searches */}
        {trendingSearches.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tendencias</Text>
            <View style={styles.trendingGrid}>
              {trendingSearches.map((trending, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.trendingItem}
                  onPress={() => handleSuggestionPress(trending.query || trending)}
                >
                  <TrendingUp size={16} color="#67e8f9" />
                  <Text style={styles.trendingText}>
                    {trending.query || trending}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderResultItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleResultPress(item)}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
        style={styles.resultGradient}
      >
        {/* Result content based on type */}
        <View style={styles.resultContent}>
          <Text style={styles.resultTitle} numberOfLines={2}>
            {item.title || item.name || item.content}
          </Text>
          
          {item.description && (
            <Text style={styles.resultDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          
          <View style={styles.resultMeta}>
            {item.category && (
              <View style={styles.resultTag}>
                <Text style={styles.resultTagText}>{item.category}</Text>
              </View>
            )}
            
            {item.location && (
              <View style={styles.resultMetaItem}>
                <MapPin size={12} color="#9ca3af" />
                <Text style={styles.resultMetaText}>{item.location}</Text>
              </View>
            )}
            
            {item.date && (
              <View style={styles.resultMetaItem}>
                <Calendar size={12} color="#9ca3af" />
                <Text style={styles.resultMetaText}>
                  {new Date(item.date).toLocaleDateString('es-ES')}
                </Text>
              </View>
            )}
            
            {item.rating && (
              <View style={styles.resultMetaItem}>
                <Star size={12} color="#fbbf24" />
                <Text style={styles.resultMetaText}>{item.rating}</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderFiltersModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowFilters(false)}
    >
      <SafeAreaView style={styles.filtersModal}>
        <View style={styles.filtersHeader}>
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <X size={24} color="#9ca3af" />
          </TouchableOpacity>
          <Text style={styles.filtersTitle}>Filtros</Text>
          <TouchableOpacity onPress={clearFilters}>
            <Text style={styles.clearFiltersText}>Limpiar</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.filtersContent}>
          {/* Location Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Ubicación</Text>
            <TextInput
              style={styles.filterInput}
              placeholder="Ciudad, país..."
              placeholderTextColor="#6b7280"
              value={filters.location}
              onChangeText={(value) => handleFilterChange('location', value)}
            />
          </View>
          
          {/* Category Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Categoría</Text>
            <TextInput
              style={styles.filterInput}
              placeholder="Seleccionar categoría..."
              placeholderTextColor="#6b7280"
              value={filters.category}
              onChangeText={(value) => handleFilterChange('category', value)}
            />
          </View>
          
          {/* Online Events Filter */}
          <View style={styles.filterSection}>
            <View style={styles.filterRow}>
              <Text style={styles.filterSectionTitle}>Solo eventos online</Text>
              <Switch
                value={filters.isOnline === true}
                onValueChange={(value) => handleFilterChange('isOnline', value ? true : null)}
                trackColor={{ false: '#6b7280', true: '#67e8f9' }}
                thumbColor={filters.isOnline === true ? '#ffffff' : '#9ca3af'}
              />
            </View>
          </View>
          
          {/* Free Events Filter */}
          <View style={styles.filterSection}>
            <View style={styles.filterRow}>
              <Text style={styles.filterSectionTitle}>Solo eventos gratuitos</Text>
              <Switch
                value={filters.isFree === true}
                onValueChange={(value) => handleFilterChange('isFree', value ? true : null)}
                trackColor={{ false: '#6b7280', true: '#67e8f9' }}
                thumbColor={filters.isFree === true ? '#ffffff' : '#9ca3af'}
              />
            </View>
          </View>
        </ScrollView>
        
        <View style={styles.filtersFooter}>
          <TouchableOpacity
            style={styles.applyFiltersButton}
            onPress={applyFilters}
          >
            <Text style={styles.applyFiltersText}>Aplicar filtros</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0f0f23', '#1a1a2e', '#16213e']}
        style={StyleSheet.absoluteFillObject}
      />
      
      {renderSearchHeader()}
      {renderSuggestions()}
      
      {results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderResultItem}
          keyExtractor={(item, index) => `${item._id || index}`}
          style={styles.resultsList}
          contentContainerStyle={styles.resultsListContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyState()
      )}
      
      {renderFiltersModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  searchHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(103, 232, 249, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    marginBottom: 8,
  },
  tabsContent: {
    paddingRight: 20,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeTab: {
    backgroundColor: '#67e8f9',
    borderColor: '#67e8f9',
  },
  tabText: {
    fontSize: 14,
    color: '#9ca3af',
    marginLeft: 6,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#ffffff',
  },
  suggestionsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  suggestionText: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 12,
  },
  suggestionCount: {
    fontSize: 12,
    color: '#9ca3af',
  },
  resultsList: {
    flex: 1,
  },
  resultsListContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  resultItem: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  resultGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  resultDescription: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
    marginBottom: 12,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  resultTag: {
    backgroundColor: 'rgba(103, 232, 249, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  resultTagText: {
    fontSize: 12,
    color: '#67e8f9',
    fontWeight: '600',
  },
  resultMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resultMetaText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    marginBottom: 8,
  },
  recentSearchText: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 12,
  },
  clearAllButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  clearAllText: {
    fontSize: 14,
    color: '#67e8f9',
    fontWeight: '500',
  },
  trendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(103, 232, 249, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(103, 232, 249, 0.3)',
  },
  trendingText: {
    fontSize: 14,
    color: '#67e8f9',
    marginLeft: 6,
    fontWeight: '500',
  },
  // Filters Modal Styles
  filtersModal: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  filtersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  filtersTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  clearFiltersText: {
    fontSize: 16,
    color: '#67e8f9',
    fontWeight: '500',
  },
  filtersContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  filterSection: {
    marginVertical: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  filterInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 16,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filtersFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  applyFiltersButton: {
    backgroundColor: '#67e8f9',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyFiltersText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0a0a0a',
  },
});

export default SearchScreen;









