const { googleMaps } = require('../config/googleMaps');
const { AppError } = require('../middleware/errorHandler');

class LocationService {
  // Validar y normalizar direcciones
  async validateAndNormalizeAddress(address) {
    try {
      const geocodeResult = await googleMaps.geocodeAddress(address);
      
      if (geocodeResult.status === 'OK' && geocodeResult.results.length > 0) {
        const result = geocodeResult.results[0];
        const location = result.geometry.location;
        const addressComponents = result.address_components;
        
        return {
          coordinates: {
            lat: location.lat,
            lng: location.lng
          },
          formattedAddress: result.formatted_address,
          address: this.parseAddressComponents(addressComponents),
          placeId: result.place_id
        };
      }
      
      throw new AppError('No se pudo validar la dirección', 400);
    } catch (error) {
      throw new AppError(`Error validando dirección: ${error.message}`, 500);
    }
  }

  // Buscar lugares cercanos
  async findNearbyPlaces(lat, lng, radius = 5000, types = ['restaurant', 'bar', 'cafe']) {
    try {
      const places = [];
      
      for (const type of types) {
        const result = await googleMaps.searchNearbyPlaces(lat, lng, radius, type);
        if (result.status === 'OK') {
          places.push(...result.results.map(place => ({
            id: place.place_id,
            name: place.name,
            type: type,
            location: {
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng
            },
            rating: place.rating,
            address: place.vicinity,
            photos: place.photos?.map(photo => 
              `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY}`
            )
          })));
        }
      }
      
      return places;
    } catch (error) {
      throw new AppError(`Error buscando lugares cercanos: ${error.message}`, 500);
    }
  }

  // Calcular rutas y tiempos de viaje
  async calculateRoute(origin, destination, mode = 'driving') {
    try {
      const result = await googleMaps.getDistanceMatrix(
        [`${origin.lat},${origin.lng}`],
        [`${destination.lat},${destination.lng}`],
        mode
      );
      
      if (result.status === 'OK' && result.rows.length > 0) {
        const element = result.rows[0].elements[0];
        return {
          distance: element.distance,
          duration: element.duration,
          mode,
          status: element.status
        };
      }
      
      throw new AppError('No se pudo calcular la ruta', 400);
    } catch (error) {
      throw new AppError(`Error calculando ruta: ${error.message}`, 500);
    }
  }

  // Parsear componentes de dirección
  parseAddressComponents(components) {
    const address = {};
    
    components.forEach(component => {
      const types = component.types;
      if (types.includes('street_number')) {
        address.streetNumber = component.long_name;
      } else if (types.includes('route')) {
        address.street = component.long_name;
      } else if (types.includes('locality')) {
        address.city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        address.state = component.long_name;
      } else if (types.includes('country')) {
        address.country = component.long_name;
      } else if (types.includes('postal_code')) {
        address.zipCode = component.long_name;
      }
    });
    
    return address;
  }
}

module.exports = new LocationService();