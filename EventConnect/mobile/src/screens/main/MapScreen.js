import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const MapScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const mapRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [mapType, setMapType] = useState('standard');

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  useEffect(() => {
    // TODO: Fetch events from API
    const mockEvents = [
      {
        id: '1',
        title: 'Fiesta de Cumpleaños',
        description: 'Celebración en el parque',
        coordinate: {
          latitude: 19.4326,
          longitude: -99.1332,
        },
        type: 'party',
        attendees: 25,
        date: '2024-01-15',
      },
      {
        id: '2',
        title: 'Meetup Tech',
        description: 'Discusión sobre React Native',
        coordinate: {
          latitude: 19.4326,
          longitude: -99.1332,
        },
        type: 'tech',
        attendees: 15,
        date: '2024-01-16',
      },
      {
        id: '3',
        title: 'Yoga en el Parque',
        description: 'Clase de yoga gratuita',
        coordinate: {
          latitude: 19.4326,
          longitude: -99.1332,
        },
        type: 'wellness',
        attendees: 30,
        date: '2024-01-17',
      },
    ];
    setEvents(mockEvents);
  }, []);

  const handleEventPress = (event) => {
    setSelectedEvent(event);
    // TODO: Show event details modal
  };

  const handleMyLocation = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const handleMapTypeChange = () => {
    setMapType(mapType === 'standard' ? 'satellite' : 'standard');
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'party':
        return '🎉';
      case 'tech':
        return '💻';
      case 'wellness':
        return '🧘';
      default:
        return '📍';
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'party':
        return '#FF6B6B';
      case 'tech':
        return '#4ECDC4';
      case 'wellness':
        return '#45B7D1';
      default:
        return '#96CEB4';
    }
  };

  if (errorMsg) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!location) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Obteniendo ubicación...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        mapType={mapType}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        showsTraffic={false}
        showsBuildings={true}
        showsIndoors={true}
        showsIndoorLevelPicker={true}
        showsPointsOfInterest={true}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        showsTraffic={false}
        showsBuildings={true}
        showsIndoors={true}
        showsIndoorLevelPicker={true}
        showsPointsOfInterest={true}
      >
        {events.map((event) => (
          <Marker
            key={event.id}
            coordinate={event.coordinate}
            title={event.title}
            description={event.description}
            onPress={() => handleEventPress(event)}
          >
            <View style={[styles.markerContainer, { backgroundColor: getEventColor(event.type) }]}>
              <Text style={styles.markerIcon}>{getEventIcon(event.type)}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Map Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, isDark && styles.controlButtonDark]}
          onPress={handleMyLocation}
        >
          <Ionicons name="locate" size={24} color={isDark ? '#fff' : '#333'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, isDark && styles.controlButtonDark]}
          onPress={handleMapTypeChange}
        >
          <Ionicons
            name={mapType === 'standard' ? 'map' : 'map-outline'}
            size={24}
            color={isDark ? '#fff' : '#333'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, isDark && styles.controlButtonDark]}
          onPress={() => navigation.navigate('CreateEvent')}
        >
          <Ionicons name="add" size={24} color={isDark ? '#fff' : '#333'} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, isDark && styles.searchContainerDark]}>
        <TouchableOpacity
          style={[styles.searchBar, isDark && styles.searchBarDark]}
          onPress={() => navigation.navigate('Search')}
        >
          <Ionicons
            name="search"
            size={20}
            color={isDark ? '#ccc' : '#666'}
            style={styles.searchIcon}
          />
          <Text style={[styles.searchText, isDark && styles.searchTextDark]}>
            Buscar eventos cerca de ti...
          </Text>
        </TouchableOpacity>
      </View>

      {/* Event Details Modal */}
      {selectedEvent && (
        <View style={[styles.eventModal, isDark && styles.eventModalDark]}>
          <View style={styles.eventModalHeader}>
            <Text style={[styles.eventModalTitle, isDark && styles.eventModalTitleDark]}>
              {selectedEvent.title}
            </Text>
            <TouchableOpacity
              onPress={() => setSelectedEvent(null)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={isDark ? '#fff' : '#333'} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.eventModalDescription, isDark && styles.eventModalDescriptionDark]}>
            {selectedEvent.description}
          </Text>
          <View style={styles.eventModalDetails}>
            <View style={styles.eventDetail}>
              <Ionicons name="people" size={16} color="#666" />
              <Text style={[styles.eventDetailText, isDark && styles.eventDetailTextDark]}>
                {selectedEvent.attendees} asistentes
              </Text>
            </View>
            <View style={styles.eventDetail}>
              <Ionicons name="calendar" size={16} color="#666" />
              <Text style={[styles.eventDetailText, isDark && styles.eventDetailTextDark]}>
                {selectedEvent.date}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => {
              // TODO: Join event
              Alert.alert('Éxito', 'Te has unido al evento');
              setSelectedEvent(null);
            }}
          >
            <Text style={styles.joinButtonText}>Unirse al Evento</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  map: {
    flex: 1,
  },
  controlsContainer: {
    position: 'absolute',
    right: 20,
    top: 100,
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  controlButtonDark: {
    backgroundColor: '#2a2a2a',
  },
  searchContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
  },
  searchContainerDark: {
    backgroundColor: 'transparent',
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchBarDark: {
    backgroundColor: '#2a2a2a',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchText: {
    color: '#666',
    fontSize: 16,
    flex: 1,
  },
  searchTextDark: {
    color: '#ccc',
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerIcon: {
    fontSize: 20,
  },
  eventModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  eventModalDark: {
    backgroundColor: '#2a2a2a',
  },
  eventModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  eventModalTitleDark: {
    color: '#fff',
  },
  closeButton: {
    padding: 4,
  },
  eventModalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  eventModalDescriptionDark: {
    color: '#ccc',
  },
  eventModalDetails: {
    marginBottom: 20,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventDetailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  eventDetailTextDark: {
    color: '#ccc',
  },
  joinButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});

export default MapScreen;