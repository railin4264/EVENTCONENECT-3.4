import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    getCurrentLocation();
    loadNearbyEvents();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos', 'Se requieren permisos de ubicación');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener la ubicación');
    }
  };

  const loadNearbyEvents = async () => {
    // Simular eventos cercanos
    const mockEvents = [
      {
        id: 1,
        title: 'Concierto en el Parque',
        description: 'Música en vivo al aire libre',
        latitude: 40.7128,
        longitude: -74.0060,
        type: 'music',
      },
      {
        id: 2,
        title: 'Meetup de Desarrolladores',
        description: 'Networking y charlas técnicas',
        latitude: 40.7589,
        longitude: -73.9851,
        type: 'tech',
      },
    ];
    setEvents(mockEvents);
  };

  const handleEventPress = (event) => {
    setSelectedEvent(event);
  };

  const getMarkerColor = (type) => {
    switch (type) {
      case 'music': return '#ef4444';
      case 'tech': return '#3b82f6';
      case 'food': return '#f59e0b';
      default: return '#10b981';
    }
  };

  if (!location) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando mapa...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={location}
        showsUserLocation
        showsMyLocationButton
      >
        {events.map((event) => (
          <Marker
            key={event.id}
            coordinate={{
              latitude: event.latitude,
              longitude: event.longitude,
            }}
            title={event.title}
            description={event.description}
            onPress={() => handleEventPress(event)}
            pinColor={getMarkerColor(event.type)}
          />
        ))}
      </MapView>

      {selectedEvent && (
        <View style={styles.eventCard}>
          <Text style={styles.eventTitle}>{selectedEvent.title}</Text>
          <Text style={styles.eventDescription}>{selectedEvent.description}</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedEvent(null)}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
        <Text style={styles.locationButtonText}>📍</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
  },
  eventCard: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  eventTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  eventDescription: {
    color: '#888888',
    fontSize: 14,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ef4444',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationButton: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: '#3b82f6',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  locationButtonText: {
    fontSize: 20,
  },
});