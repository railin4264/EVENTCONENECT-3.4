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
  Users,
  MapPin,
  TrendingUp,
  Filter,
  Heart,
  MessageCircle,
  Calendar,
  Settings,
  Crown,
  Star
} from 'lucide-react-native';

import tribesService from '../../services/TribesService';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

const TribesScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  // Estados
  const [activeTab, setActiveTab] = useState('discover'); // discover, my-tribes, trending, nearby
  const [tribes, setTribes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
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
      loadTribes();
    }
  }, [selectedCategory]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadTribes(),
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
      const response = await tribesService.getTribesCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadTribes = async (reset = true) => {
    try {
      if (reset) {
        setPage(1);
        setTribes([]);
      }

      let response;
      const currentPage = reset ? 1 : page;

      switch (activeTab) {
        case 'my-tribes':
          response = await tribesService.getMyTribes();
          break;
        case 'trending':
          response = await tribesService.getTrendingTribes();
          break;
        case 'nearby':
          // TODO: Get user location
          response = await tribesService.getNearbyTribes(0, 0);
          break;
        default:
          response = await tribesService.getAllTribes({
            page: currentPage,
            category: selectedCategory,
          });
      }

      const newTribes = response.data || [];
      
      if (reset) {
        setTribes(newTribes);
      } else {
        setTribes(prev => [...prev, ...newTribes]);
      }

      setHasMore(newTribes.length === 20);
      if (!reset) setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading tribes:', error);
      Alert.alert('Error', 'No se pudieron cargar las tribus');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsLoading(true);
      const response = await tribesService.searchTribes(searchQuery, {
        category: selectedCategory
      });
      setTribes(response.data || []);
    } catch (error) {
      console.error('Error searching tribes:', error);
      Alert.alert('Error', 'Error en la búsqueda');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadTribes(true);
    setIsRefreshing(false);
  };

  const handleJoinTribe = async (tribeId) => {
    try {
      await tribesService.joinTribe(tribeId);
      Alert.alert('Éxito', 'Te has unido a la tribu');
      loadTribes(true);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleLeaveTribe = async (tribeId) => {
    Alert.alert(
      'Salir de Tribu',
      '¿Estás seguro de que quieres salir de esta tribu?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            try {
              await tribesService.leaveTribe(tribeId);
              Alert.alert('Éxito', 'Has salido de la tribu');
              loadTribes(true);
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          }
        }
      ]
    );
  };

  const renderTribeCard = ({ item: tribe }) => (
    <TouchableOpacity 
      style={styles.tribeCard}
      onPress={() => navigation.navigate('TribeDetail', { tribeId: tribe._id })}
    >
      <LinearGradient
        colors={['rgba(103,232,249,0.1)', 'rgba(124,58,237,0.1)']}
        style={styles.cardGradient}
      >
        {/* Imagen de la tribu */}
        <View style={styles.tribeImageContainer}>
          {tribe.image ? (
            <Image source={{ uri: tribe.image }} style={styles.tribeImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Users size={32} color="#67e8f9" />
            </View>
          )}
          
          {/* Badge de categoría */}
          {tribe.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{tribe.category}</Text>
            </View>
          )}
        </View>

        {/* Información de la tribu */}
        <View style={styles.tribeInfo}>
          <View style={styles.tribeHeader}>
            <Text style={styles.tribeName} numberOfLines={2}>
              {tribe.name}
            </Text>
            {tribe.isVerified && (
              <Star size={16} color="#fbbf24" fill="#fbbf24" />
            )}
          </View>

          <Text style={styles.tribeDescription} numberOfLines={3}>
            {tribe.description}
          </Text>

          {/* Estadísticas */}
          <View style={styles.tribeStats}>
            <View style={styles.statItem}>
              <Users size={16} color="#9ca3af" />
              <Text style={styles.statText}>
                {tribe.memberCount || 0} miembros
              </Text>
            </View>
            
            {tribe.location && (
              <View style={styles.statItem}>
                <MapPin size={16} color="#9ca3af" />
                <Text style={styles.statText}>{tribe.location}</Text>
              </View>
            )}
          </View>

          {/* Acciones */}
          <View style={styles.tribeActions}>
            {tribe.isMember ? (
              <>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.leaveButton]}
                  onPress={() => handleLeaveTribe(tribe._id)}
                >
                  <Text style={styles.leaveButtonText}>Salir</Text>
                </TouchableOpacity>
                
                {tribe.isOwner && (
                  <TouchableOpacity style={styles.ownerBadge}>
                    <Crown size={16} color="#fbbf24" />
                    <Text style={styles.ownerText}>Propietario</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <TouchableOpacity 
                style={[styles.actionButton, styles.joinButton]}
                onPress={() => handleJoinTribe(tribe._id)}
              >
                <Text style={styles.joinButtonText}>Unirse</Text>
              </TouchableOpacity>
            )}

            <View style={styles.secondaryActions}>
              <TouchableOpacity style={styles.iconButton}>
                <Heart size={20} color="#9ca3af" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <MessageCircle size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>
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
        { id: 'my-tribes', label: 'Mis Tribus', icon: Users },
        { id: 'trending', label: 'Trending', icon: TrendingUp },
        { id: 'nearby', label: 'Cercanas', icon: MapPin },
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
        <Text style={styles.title}>Tribus</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('CreateTribe')}
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
            placeholder="Buscar tribus..."
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

      {/* Tribes List */}
      <FlatList
        data={tribes}
        renderItem={renderTribeCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.tribesList}
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
            loadTribes(false);
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
  tribesList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tribeCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },
  tribeImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  tribeImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
  },
  placeholderImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(103, 232, 249, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    color: '#0a0a0a',
    fontWeight: '600',
  },
  tribeInfo: {
    flex: 1,
  },
  tribeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tribeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    marginRight: 8,
  },
  tribeDescription: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
    marginBottom: 12,
  },
  tribeStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  tribeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
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
  leaveButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  leaveButtonText: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: 14,
  },
  ownerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderRadius: 6,
  },
  ownerText: {
    fontSize: 12,
    color: '#fbbf24',
    fontWeight: '500',
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
});

export default TribesScreen;

