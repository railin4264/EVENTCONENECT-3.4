# 🗺️ INTEGRACIÓN CON GOOGLE MAPS API

## 📍 **Estado Actual:**
❌ **NO usa Google Maps API** - Es un mapa simulado con CSS

## 🚀 **Para integrar Google Maps REAL:**

### **1. Obtener API Key de Google Maps**
```bash
# 1. Ve a Google Cloud Console
https://console.cloud.google.com/

# 2. Crea un proyecto o selecciona uno existente

# 3. Habilita las APIs necesarias:
- Maps JavaScript API
- Places API
- Geocoding API
- Geolocation API

# 4. Crea credenciales (API Key)

# 5. Configura restricciones de la API Key
```

### **2. Instalar dependencias**
```bash
# Para Web (Next.js)
npm install @googlemaps/js-api-loader

# Para Mobile (React Native)
npm install react-native-maps
```

### **3. Configurar variables de entorno**
```env
# web/.env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu-api-key-aqui

# mobile/.env
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=tu-api-key-aqui
```

### **4. Componente de Google Maps para Web**
```tsx
// web/src/components/map/GoogleEventMap.tsx
'use client';

import { Loader } from '@googlemaps/js-api-loader';
import { useEffect, useRef, useState } from 'react';

interface GoogleEventMapProps {
  events: Array<{
    id: string;
    title: string;
    lat: number;
    lng: number;
    category: string;
  }>;
  center?: { lat: number; lng: number };
}

export const GoogleEventMap: React.FC<GoogleEventMapProps> = ({
  events,
  center = { lat: 40.4168, lng: -3.7038 } // Madrid
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        version: 'weekly',
        libraries: ['places']
      });

      const { Map } = await loader.importLibrary('maps');
      const { AdvancedMarkerElement } = await loader.importLibrary('marker');

      if (mapRef.current) {
        const mapInstance = new Map(mapRef.current, {
          center,
          zoom: 12,
          mapId: 'DEMO_MAP_ID', // Necesario para Advanced Markers
          styles: [
            // Estilos personalizados del mapa
            {
              featureType: 'all',
              elementType: 'geometry.fill',
              stylers: [{ color: '#1f2937' }]
            }
          ]
        });

        setMap(mapInstance);

        // Agregar marcadores de eventos
        events.forEach(event => {
          const marker = new AdvancedMarkerElement({
            map: mapInstance,
            position: { lat: event.lat, lng: event.lng },
            title: event.title,
            content: createCustomMarker(event)
          });

          // Click handler
          marker.addListener('click', () => {
            // Mostrar detalles del evento
            console.log('Event clicked:', event);
          });
        });
      }
    };

    initMap();
  }, [events, center]);

  const createCustomMarker = (event: any) => {
    const div = document.createElement('div');
    div.className = 'custom-marker';
    div.innerHTML = `
      <div class="w-10 h-10 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
        <span class="text-white text-xs font-bold">${event.category[0].toUpperCase()}</span>
      </div>
    `;
    return div;
  };

  return (
    <div className="w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-xl" />
    </div>
  );
};
```

### **5. Componente para React Native (Mobile)**
```tsx
// mobile/src/components/GoogleEventMap.tsx
import React from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { View, StyleSheet } from 'react-native';

interface GoogleEventMapProps {
  events: Array<{
    id: string;
    title: string;
    lat: number;
    lng: number;
    category: string;
  }>;
  center?: { lat: number; lng: number };
}

export const GoogleEventMap: React.FC<GoogleEventMapProps> = ({
  events,
  center = { lat: 40.4168, lng: -3.7038 }
}) => {
  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: center.lat,
          longitude: center.lng,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        customMapStyle={darkMapStyle} // Estilo oscuro personalizado
      >
        {events.map(event => (
          <Marker
            key={event.id}
            coordinate={{
              latitude: event.lat,
              longitude: event.lng,
            }}
            title={event.title}
            description={event.category}
            pinColor="#3B82F6" // Color personalizado
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

const darkMapStyle = [
  // Estilo de mapa oscuro personalizado
  {
    elementType: 'geometry',
    stylers: [{ color: '#1f2937' }],
  },
  // ... más estilos
];
```

### **6. Funcionalidades adicionales que podrías agregar:**

#### **🔍 Búsqueda de lugares**
```tsx
const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);

// Implementar búsqueda de lugares con Places API
```

#### **📍 Geolocalización del usuario**
```tsx
const getUserLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        map?.setCenter(userLocation);
      },
      (error) => console.error('Error getting location:', error)
    );
  }
};
```

#### **🗺️ Direcciones y rutas**
```tsx
const directionsService = new google.maps.DirectionsService();
const directionsRenderer = new google.maps.DirectionsRenderer();

// Calcular ruta desde ubicación del usuario al evento
```

### **7. Costos de Google Maps API:**
- **$7 USD por 1,000 cargas de mapa**
- **$5 USD por 1,000 búsquedas de lugares**
- **$5 USD por 1,000 geocodificaciones**
- **Incluye $200 USD de crédito gratis mensual**

### **8. Alternativas gratuitas:**
- **OpenStreetMap** con Leaflet
- **Mapbox** (más generoso en plan gratuito)
- **Apple Maps** (solo iOS)

## 🎯 **¿Quieres que implemente Google Maps real?**

Solo necesitas:
1. **API Key de Google Maps**
2. **Decidir si quieres la versión completa o una alternativa gratuita**

¡Puedo implementar cualquiera de las opciones! 🚀
