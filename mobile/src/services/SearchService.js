import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuración de la API
const API_URL = (process.env.EXPO_PUBLIC_API_URL
  ? `${process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '')}/api`
  : Platform.OS === 'android'
    ? 'http://10.0.2.2:5000/api'
    : 'http://localhost:5000/api');

class SearchService {
  constructor() {
    this.recentSearches = [];
    this.searchHistory = [];
  }

  // ==========================================
  // BÚSQUEDA GENERAL
  // ==========================================

  async globalSearch(query, filters = {}) {
    try {
      const response = await axios.get(`${API_URL}/search`, {
        params: {
          q: query,
          ...filters
        }
      });
      
      // Save to search history
      this.addToHistory(query, filters);
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error en la búsqueda global');
    }
  }

  async searchWithAutocomplete(query, type = 'all') {
    try {
      const response = await axios.get(`${API_URL}/search/autocomplete`, {
        params: { q: query, type }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error en autocompletado');
    }
  }

  // ==========================================
  // BÚSQUEDA DE EVENTOS
  // ==========================================

  async searchEvents(query, filters = {}) {
    try {
      const {
        category,
        location,
        date,
        dateRange,
        price,
        priceRange,
        sortBy = 'relevance',
        sortOrder = 'desc',
        page = 1,
        limit = 20,
        radius,
        latitude,
        longitude,
        tags,
        organizer,
        capacity,
        isOnline,
        isFree,
        language,
      } = filters;

      const response = await axios.get(`${API_URL}/search/events`, {
        params: {
          q: query,
          category,
          location,
          date,
          dateRange,
          price,
          priceRange,
          sortBy,
          sortOrder,
          page,
          limit,
          radius,
          latitude,
          longitude,
          tags: tags?.join(','),
          organizer,
          capacity,
          isOnline,
          isFree,
          language,
        }
      });

      this.addToHistory(query, { type: 'events', ...filters });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error buscando eventos');
    }
  }

  async getEventSuggestions(query) {
    try {
      const response = await axios.get(`${API_URL}/search/events/suggestions`, {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo sugerencias de eventos');
    }
  }

  // ==========================================
  // BÚSQUEDA DE TRIBUS
  // ==========================================

  async searchTribes(query, filters = {}) {
    try {
      const {
        category,
        location,
        memberCount,
        memberRange,
        sortBy = 'relevance',
        sortOrder = 'desc',
        page = 1,
        limit = 20,
        radius,
        latitude,
        longitude,
        tags,
        isPrivate,
        language,
        activityLevel,
      } = filters;

      const response = await axios.get(`${API_URL}/search/tribes`, {
        params: {
          q: query,
          category,
          location,
          memberCount,
          memberRange,
          sortBy,
          sortOrder,
          page,
          limit,
          radius,
          latitude,
          longitude,
          tags: tags?.join(','),
          isPrivate,
          language,
          activityLevel,
        }
      });

      this.addToHistory(query, { type: 'tribes', ...filters });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error buscando tribus');
    }
  }

  async getTribeSuggestions(query) {
    try {
      const response = await axios.get(`${API_URL}/search/tribes/suggestions`, {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo sugerencias de tribus');
    }
  }

  // ==========================================
  // BÚSQUEDA DE USUARIOS
  // ==========================================

  async searchUsers(query, filters = {}) {
    try {
      const {
        location,
        interests,
        sortBy = 'relevance',
        sortOrder = 'desc',
        page = 1,
        limit = 20,
        radius,
        latitude,
        longitude,
        isVerified,
        joinedAfter,
        joinedBefore,
      } = filters;

      const response = await axios.get(`${API_URL}/search/users`, {
        params: {
          q: query,
          location,
          interests: interests?.join(','),
          sortBy,
          sortOrder,
          page,
          limit,
          radius,
          latitude,
          longitude,
          isVerified,
          joinedAfter,
          joinedBefore,
        }
      });

      this.addToHistory(query, { type: 'users', ...filters });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error buscando usuarios');
    }
  }

  // ==========================================
  // BÚSQUEDA DE POSTS
  // ==========================================

  async searchPosts(query, filters = {}) {
    try {
      const {
        author,
        eventId,
        tribeId,
        hasMedia,
        sortBy = 'relevance',
        sortOrder = 'desc',
        page = 1,
        limit = 20,
        dateFrom,
        dateTo,
        tags,
      } = filters;

      const response = await axios.get(`${API_URL}/search/posts`, {
        params: {
          q: query,
          author,
          eventId,
          tribeId,
          hasMedia,
          sortBy,
          sortOrder,
          page,
          limit,
          dateFrom,
          dateTo,
          tags: tags?.join(','),
        }
      });

      this.addToHistory(query, { type: 'posts', ...filters });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error buscando posts');
    }
  }

  // ==========================================
  // BÚSQUEDA POR UBICACIÓN
  // ==========================================

  async searchNearby(latitude, longitude, radius = 10000, type = 'all') {
    try {
      const response = await axios.get(`${API_URL}/search/nearby`, {
        params: {
          latitude,
          longitude,
          radius,
          type, // 'all', 'events', 'tribes', 'users'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error en búsqueda por ubicación');
    }
  }

  async searchByAddress(address, type = 'all') {
    try {
      const response = await axios.get(`${API_URL}/search/address`, {
        params: { address, type }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error buscando por dirección');
    }
  }

  // ==========================================
  // FILTROS Y FACETAS
  // ==========================================

  async getSearchFilters(type = 'all') {
    try {
      const response = await axios.get(`${API_URL}/search/filters`, {
        params: { type }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo filtros');
    }
  }

  async getSearchFacets(query, type = 'all') {
    try {
      const response = await axios.get(`${API_URL}/search/facets`, {
        params: { q: query, type }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo facetas');
    }
  }

  async getPopularFilters(type = 'all') {
    try {
      const response = await axios.get(`${API_URL}/search/popular-filters`, {
        params: { type }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo filtros populares');
    }
  }

  // ==========================================
  // TENDENCIAS Y SUGERENCIAS
  // ==========================================

  async getTrendingSearches(limit = 10) {
    try {
      const response = await axios.get(`${API_URL}/search/trending`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo búsquedas trending');
    }
  }

  async getSearchSuggestions(query, type = 'all', limit = 10) {
    try {
      const response = await axios.get(`${API_URL}/search/suggestions`, {
        params: { q: query, type, limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo sugerencias');
    }
  }

  async getPersonalizedSuggestions(limit = 10) {
    try {
      const response = await axios.get(`${API_URL}/search/personalized-suggestions`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo sugerencias personalizadas');
    }
  }

  // ==========================================
  // BÚSQUEDA GUARDADA
  // ==========================================

  async getSavedSearches() {
    try {
      const response = await axios.get(`${API_URL}/search/saved`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo búsquedas guardadas');
    }
  }

  async saveSearch(query, filters, name) {
    try {
      const response = await axios.post(`${API_URL}/search/save`, {
        query,
        filters,
        name
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error guardando búsqueda');
    }
  }

  async deleteSavedSearch(searchId) {
    try {
      const response = await axios.delete(`${API_URL}/search/saved/${searchId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error eliminando búsqueda guardada');
    }
  }

  async executeSavedSearch(searchId) {
    try {
      const response = await axios.get(`${API_URL}/search/saved/${searchId}/execute`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error ejecutando búsqueda guardada');
    }
  }

  // ==========================================
  // HISTORIAL LOCAL
  // ==========================================

  addToHistory(query, filters = {}) {
    const historyItem = {
      id: Date.now(),
      query,
      filters,
      timestamp: new Date().toISOString(),
    };

    // Remove duplicates
    this.searchHistory = this.searchHistory.filter(
      item => !(item.query === query && JSON.stringify(item.filters) === JSON.stringify(filters))
    );

    // Add to beginning
    this.searchHistory.unshift(historyItem);

    // Keep only last 50 searches
    if (this.searchHistory.length > 50) {
      this.searchHistory = this.searchHistory.slice(0, 50);
    }

    this.saveHistoryToStorage();
  }

  getSearchHistory(limit = 10) {
    return this.searchHistory.slice(0, limit);
  }

  clearSearchHistory() {
    this.searchHistory = [];
    this.saveHistoryToStorage();
  }

  removeFromHistory(historyId) {
    this.searchHistory = this.searchHistory.filter(item => item.id !== historyId);
    this.saveHistoryToStorage();
  }

  async saveHistoryToStorage() {
    try {
      await AsyncStorage.setItem('search_history', JSON.stringify(this.searchHistory));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }

  async loadHistoryFromStorage() {
    try {
      const stored = await AsyncStorage.getItem('search_history');
      if (stored) {
        this.searchHistory = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  }

  // ==========================================
  // BÚSQUEDAS RECIENTES
  // ==========================================

  addToRecentSearches(query) {
    // Remove if already exists
    this.recentSearches = this.recentSearches.filter(item => item !== query);
    
    // Add to beginning
    this.recentSearches.unshift(query);
    
    // Keep only last 20
    if (this.recentSearches.length > 20) {
      this.recentSearches = this.recentSearches.slice(0, 20);
    }
    
    this.saveRecentSearchesToStorage();
  }

  getRecentSearches(limit = 10) {
    return this.recentSearches.slice(0, limit);
  }

  clearRecentSearches() {
    this.recentSearches = [];
    this.saveRecentSearchesToStorage();
  }

  async saveRecentSearchesToStorage() {
    try {
      await AsyncStorage.setItem('recent_searches', JSON.stringify(this.recentSearches));
    } catch (error) {
      console.error('Error saving recent searches:', error);
    }
  }

  async loadRecentSearchesFromStorage() {
    try {
      const stored = await AsyncStorage.getItem('recent_searches');
      if (stored) {
        this.recentSearches = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  }

  // ==========================================
  // ANALYTICS DE BÚSQUEDA
  // ==========================================

  async trackSearchEvent(eventType, data) {
    try {
      await axios.post(`${API_URL}/search/analytics`, {
        eventType, // 'search', 'result_click', 'filter_applied', 'search_saved'
        data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error tracking search event:', error);
    }
  }

  async getSearchAnalytics(timeframe = '30d') {
    try {
      const response = await axios.get(`${API_URL}/search/analytics`, {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo analytics de búsqueda');
    }
  }

  // ==========================================
  // UTILIDADES
  // ==========================================

  buildSearchQuery(filters) {
    const queryParts = [];
    
    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          queryParts.push(`${key}:${value.join(',')}`);
        } else {
          queryParts.push(`${key}:${value}`);
        }
      }
    });
    
    return queryParts.join(' ');
  }

  parseSearchQuery(queryString) {
    const filters = {};
    const terms = queryString.split(' ');
    
    terms.forEach(term => {
      if (term.includes(':')) {
        const [key, value] = term.split(':');
        if (value.includes(',')) {
          filters[key] = value.split(',');
        } else {
          filters[key] = value;
        }
      }
    });
    
    return filters;
  }

  formatSearchResults(results, type) {
    if (!results || !results.data) return [];
    
    return results.data.map(item => ({
      ...item,
      searchType: type,
      relevanceScore: item._score || 0,
      highlightedFields: item.highlight || {},
    }));
  }

  // ==========================================
  // INICIALIZACIÓN
  // ==========================================

  async initialize() {
    await Promise.all([
      this.loadHistoryFromStorage(),
      this.loadRecentSearchesFromStorage(),
    ]);
  }
}

// Exportar instancia única
const searchService = new SearchService();
export default searchService;






