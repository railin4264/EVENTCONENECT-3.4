import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      setIsLoading(true);
      
      // Request foreground location permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setHasPermission(false);
        setIsLoading(false);
        return;
      }

      setHasPermission(true);
      await getCurrentLocation();
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setErrorMsg('Error requesting location permission');
      setIsLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      });
      
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp,
      });
      
      setErrorMsg(null);
    } catch (error) {
      console.error('Error getting current location:', error);
      setErrorMsg('Error getting current location');
      
      // Try to get last known location as fallback
      try {
        const lastKnownLocation = await Location.getLastKnownPositionAsync();
        if (lastKnownLocation) {
          setLocation({
            latitude: lastKnownLocation.coords.latitude,
            longitude: lastKnownLocation.coords.longitude,
            accuracy: lastKnownLocation.coords.accuracy,
            timestamp: lastKnownLocation.timestamp,
            isLastKnown: true,
          });
        }
      } catch (lastKnownError) {
        console.error('Error getting last known location:', lastKnownError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const result = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      
      if (result && result.length > 0) {
        return result[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  };

  const geocode = async (address) => {
    try {
      const result = await Location.geocodeAsync(address);
      
      if (result && result.length > 0) {
        return result[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error geocoding:', error);
      return null;
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance; // Distance in kilometers
  };

  const getDistanceToPoint = (targetLat, targetLon) => {
    if (!location) return null;
    
    return calculateDistance(
      location.latitude,
      location.longitude,
      targetLat,
      targetLon
    );
  };

  const formatDistance = (distance) => {
    if (distance === null) return 'Distancia desconocida';
    
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    } else if (distance < 10) {
      return `${distance.toFixed(1)}km`;
    } else {
      return `${Math.round(distance)}km`;
    }
  };

  const requestPermissionWithAlert = async () => {
    Alert.alert(
      'Acceso a Ubicación',
      'Esta app necesita acceso a tu ubicación para mostrarte eventos y comunidades cercanas.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Permitir',
          onPress: requestLocationPermission,
        },
      ]
    );
  };

  return {
    location,
    errorMsg,
    isLoading,
    hasPermission,
    getCurrentLocation,
    reverseGeocode,
    geocode,
    calculateDistance,
    getDistanceToPoint,
    formatDistance,
    requestPermissionWithAlert,
  };
};