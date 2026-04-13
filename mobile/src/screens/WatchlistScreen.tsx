import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

interface WatchlistItem {
  _id: string;
  eventId: string;
  event: {
    _id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    location: {
      address: string;
      city: string;
      country: string;
    };
    coverImage?: string;
    category: string;
    price?: number;
    organizer: {
      _id: string;
      firstName: string;
      lastName: string;
    };
  };
  addedAt: string;
}

export default function WatchlistScreen() {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWatchlist();
    }
  }, [user]);

  const fetchWatchlist = async () => {
    try {
      const response = await api.get('/watchlist');
      setWatchlist(response.data.data);
    } catch (error) {
      Alert.alert('Error', 'Error cargando watchlist');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWatchlist();
    setRefreshing(false);
  };

  const removeFromWatchlist = async (eventId: string) => {
    try {
      await api.delete(`/watchlist/${eventId}`);
      setWatchlist(watchlist.filter(item => item.eventId !== eventId));
      Alert.alert('Éxito', 'Evento removido de la watchlist');
    } catch (error) {
      Alert.alert('Error', 'Error removiendo evento');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderWatchlistItem = ({ item }: { item: WatchlistItem }) => (
    <View style={styles.eventCard}>
      {item.event.coverImage && (
        <Image source={{ uri: item.event.coverImage }} style={styles.eventImage} />
      )}
      
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle} numberOfLines={2}>
            {item.event.title}
          </Text>
          <TouchableOpacity
            onPress={() => removeFromWatchlist(item.eventId)}
            style={styles.removeButton}
          >
            <Ionicons name="close-circle" size={24} color="#e53e3e" />
          </TouchableOpacity>
        </View>

        <Text style={styles.eventDescription} numberOfLines={3}>
          {item.event.description}
        </Text>

        <View style={styles.eventDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {formatDate(item.event.startDate)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {item.event.location.city}, {item.event.location.country}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {item.event.organizer.firstName} {item.event.organizer.lastName}
            </Text>
          </View>
        </View>

        <View style={styles.eventFooter}>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{item.event.category}</Text>
          </View>
          
          {item.event.price && (
            <Text style={styles.priceText}>${item.event.price}</Text>
          )}
        </View>
      </View>
    </View>
  );

  if (!user) {
    return (
      <View style={styles.authContainer}>
        <Text style={styles.authTitle}>Inicia sesión</Text>
        <Text style={styles.authSubtitle}>
          Necesitas iniciar sesión para ver tu watchlist
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando watchlist...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Watchlist</Text>
        <Text style={styles.headerSubtitle}>
          {watchlist.length} evento{watchlist.length !== 1 ? 's' : ''} guardado{watchlist.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={watchlist}
        renderItem={renderWatchlistItem}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="bookmark-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>Tu watchlist está vacía</Text>
            <Text style={styles.emptySubtitle}>
              Guarda eventos que te interesen para verlos más tarde
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  eventCard: {
    backgroundColor: 'white',
    margin: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 200,
  },
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
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  removeButton: {
    padding: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  eventDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});