const axios = require('axios');

class GoogleMapsService {
  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
    this.baseUrl = 'https://maps.googleapis.com/maps/api';
  }

  // Geocoding: Dirección → Coordenadas
  async geocodeAddress(address) {
    try {
      const response = await axios.get(`${this.baseUrl}/geocode/json`, {
        params: {
          address,
          key: this.apiKey
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error en geocoding: ${error.message}`);
    }
  }

  // Reverse Geocoding: Coordenadas → Dirección
  async reverseGeocode(lat, lng) {
    try {
      const response = await axios.get(`${this.baseUrl}/geocode/json`, {
        params: {
          latlng: `${lat},${lng}`,
          key: this.apiKey
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error en reverse geocoding: ${error.message}`);
    }
  }

  // Places API: Buscar lugares cercanos
  async searchNearbyPlaces(lat, lng, radius = 5000, type = 'establishment') {
    try {
      const response = await axios.get(`${this.baseUrl}/place/nearbysearch/json`, {
        params: {
          location: `${lat},${lng}`,
          radius,
          type,
          key: this.apiKey
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error buscando lugares: ${error.message}`);
    }
  }

  // Distance Matrix: Calcular distancias y tiempos
  async getDistanceMatrix(origins, destinations, mode = 'driving') {
    try {
      const response = await axios.get(`${this.baseUrl}/distancematrix/json`, {
        params: {
          origins: origins.join('|'),
          destinations: destinations.join('|'),
          mode,
          key: this.apiKey
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error calculando distancias: ${error.message}`);
    }
  }

  // Autocomplete: Sugerencias de direcciones
  async getPlaceAutocomplete(input, sessionToken) {
    try {
      const response = await axios.get(`${this.baseUrl}/place/autocomplete/json`, {
        params: {
          input,
          sessiontoken: sessionToken,
          key: this.apiKey
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error en autocompletado: ${error.message}`);
    }
  }
}

module.exports = new GoogleMapsService();