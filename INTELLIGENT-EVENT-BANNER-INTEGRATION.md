# 🎯 INTEGRACIÓN DEL BANNER INTELIGENTE DE EVENTOS

## 📋 RESUMEN

El **Banner Inteligente de Eventos** es una característica clave que muestra eventos destacados de manera personalizada tanto en la versión web como móvil de EVENT CONNECT. Utiliza un algoritmo inteligente que considera múltiples factores para recomendar los eventos más relevantes para cada usuario.

## 🧠 ALGORITMO DE PERSONALIZACIÓN

### Factores de Puntuación (Match Score 0-100):

1. **🎯 Coincidencia de Intereses (40%)**
   - Coincidencia exacta con categorías de interés del usuario
   - Coincidencia con tags o subcategorías relacionadas

2. **📍 Proximidad Geográfica (30%)**
   - < 5 km: 30 puntos
   - 5-10 km: 20 puntos  
   - 10-20 km: 10 puntos

3. **🔥 Popularidad del Evento (20%)**
   - Más de 100 asistentes: 10 puntos
   - Rating ≥ 4.5: 10 puntos

4. **⏰ Urgencia (10%)**
   - Eventos en los próximos 3 días: 10 puntos
   - Eventos en los próximos 7 días: 5 puntos

### Indicadores Especiales:
- **🔥 HOT/TRENDING**: Eventos con alta actividad (>500 vistas, >200 asistentes, >50 compartidos)
- **✨ % MATCH**: Se muestra cuando el score es ≥ 80%
- **⚠️ SPOTS LEFT**: Se muestra cuando quedan < 50 lugares

## 💻 IMPLEMENTACIÓN WEB

### Componente Principal
```typescript
// web/src/components/banners/IntelligentEventBanner.tsx
<IntelligentEventBanner
  userId={user?.id}
  userInterests={user?.interests}
  location={location}
/>
```

### Características Visuales:
- **Diseño Horizontal**: Cards grandes con imagen de fondo
- **Navegación**: Flechas laterales + dots de paginación
- **Auto-scroll**: Cambio automático cada 6 segundos
- **Gradientes**: Overlay para mejorar legibilidad
- **Animaciones**: Transiciones suaves con Framer Motion
- **Responsive**: Se adapta a diferentes tamaños de pantalla

### Integración en HomePage:
```typescript
// web/src/app/page.tsx
<main className='min-h-screen'>
  <ModernHeroSection />
  
  {/* Banner Inteligente - Posicionado prominentemente */}
  <section className="py-8 px-4 max-w-7xl mx-auto">
    <IntelligentEventBanner {...props} />
  </section>
  
  <NearbyEventsSection />
</main>
```

## 📱 IMPLEMENTACIÓN MÓVIL

### Componente Principal
```javascript
// mobile/src/components/banners/IntelligentEventBanner.tsx
<IntelligentEventBanner
  userId={user?.id}
  userInterests={user?.interests}
  location={userLocation}
  onEventPress={(eventId) => navigation.navigate('EventDetails', { eventId })}
/>
```

### Características Móviles:
- **Scroll Horizontal**: Optimizado para gestos táctiles
- **Haptic Feedback**: Vibración sutil en interacciones
- **Tamaño Adaptativo**: 32% de altura de pantalla
- **Performance**: Lazy loading de imágenes
- **Offline Support**: Mock data cuando no hay conexión
- **Gestos Nativos**: Swipe fluido entre eventos

### Integración en HomeScreen:
```javascript
// mobile/src/screens/home/IntelligentHomeScreen.tsx
<ScrollView>
  {renderPersonalizedHeader()}
  
  {/* Banner posicionado después del header */}
  <IntelligentEventBanner {...props} />
  
  {renderQuickActions()}
  {renderRecommendedEvents()}
</ScrollView>
```

## 🔌 BACKEND API

### Endpoint Principal
```
GET /api/events/featured
```

### Parámetros:
```javascript
{
  userId: string,        // ID del usuario para personalización
  interests: string[],   // Array de intereses del usuario
  location: {           // Ubicación actual
    latitude: number,
    longitude: number
  },
  radius: number,       // Radio de búsqueda en km (default: 25)
  limit: number,        // Cantidad de eventos (default: 5)
  algorithm: string     // Tipo de algoritmo (default: 'intelligent')
}
```

### Respuesta:
```javascript
{
  success: true,
  data: [
    {
      id: string,
      title: string,
      description: string,
      imageUrl: string,
      startDate: string,
      location: {
        address: string,
        coordinates: number[],
        distance: number     // Calculada dinámicamente
      },
      category: string,
      price: number,
      attendees: number,
      rating: number,
      organizer: {
        name: string,
        verified: boolean
      },
      matchScore: number,    // 0-100
      matchReasons: string[], // Razones del match
      isTrending: boolean,
      spotsLeft: number
    }
  ],
  meta: {
    algorithm: string,
    location: object,
    radius: number,
    total: number
  }
}
```

## 🎨 DISEÑO VISUAL

### Web:
- **Altura**: 500px fijo
- **Ancho de Card**: 85% del viewport
- **Spacing**: 16px entre cards
- **Border Radius**: 20px (rounded-2xl)
- **Sombras**: shadow-2xl para profundidad

### Móvil:
- **Altura**: 32% del viewport height
- **Ancho de Card**: 85% del screen width
- **Animaciones**: Escala 0.9-1.0 según posición
- **Opacidad**: 0.5-1.0 para cards no activos

## 🚀 OPTIMIZACIONES

### Performance:
1. **Cache Inteligente**: Resultados cacheados por 5 minutos
2. **Lazy Loading**: Imágenes se cargan según necesidad
3. **Debouncing**: Auto-scroll se pausa con interacción
4. **Memoización**: Cálculos de score optimizados

### UX:
1. **Loading States**: Skeleton loaders mientras carga
2. **Error Handling**: Fallback a mock data si falla API
3. **Accesibilidad**: Alto contraste y labels descriptivos
4. **Touch Targets**: Mínimo 44px para elementos táctiles

## 📊 MÉTRICAS DE ÉXITO

### KPIs Esperados:
- **CTR**: +250% vs banners estáticos
- **Engagement**: +180% en eventos visitados
- **Conversión**: +120% en registros a eventos
- **Retención**: Usuarios vuelven 3x más frecuentemente

### Tracking:
- Impresiones del banner
- Clicks en eventos
- Tiempo de visualización
- Conversiones (registro/compra)
- Match score promedio

## 🔧 CONFIGURACIÓN

### Variables de Entorno:
```env
# Backend
FEATURED_EVENTS_CACHE_TTL=300  # 5 minutos
FEATURED_EVENTS_MAX_RADIUS=50  # 50km máximo
FEATURED_EVENTS_DEFAULT_LIMIT=5

# Frontend
NEXT_PUBLIC_BANNER_AUTO_SCROLL_DELAY=6000
NEXT_PUBLIC_BANNER_ANIMATION_DURATION=500
```

## 🐛 DEBUGGING

### Logs del Backend:
```javascript
console.log('Featured Events Request:', {
  userId,
  interests,
  location,
  matchScores: events.map(e => ({ id: e.id, score: e.matchScore }))
});
```

### Verificar en Frontend:
1. Abrir DevTools > Network
2. Buscar request a `/api/events/featured`
3. Verificar parámetros enviados
4. Revisar respuesta y match scores

## 📝 NOTAS DE IMPLEMENTACIÓN

1. **Geolocalización**: Se solicita permiso automáticamente si no hay ubicación
2. **Fallback**: Siempre hay mock data para evitar espacios vacíos
3. **Sincronización**: El banner se actualiza al cambiar ubicación/intereses
4. **Cross-platform**: Código compartido entre web y móvil donde es posible

---

*Última actualización: Diciembre 2024*

## 📋 RESUMEN

El **Banner Inteligente de Eventos** es una característica clave que muestra eventos destacados de manera personalizada tanto en la versión web como móvil de EVENT CONNECT. Utiliza un algoritmo inteligente que considera múltiples factores para recomendar los eventos más relevantes para cada usuario.

## 🧠 ALGORITMO DE PERSONALIZACIÓN

### Factores de Puntuación (Match Score 0-100):

1. **🎯 Coincidencia de Intereses (40%)**
   - Coincidencia exacta con categorías de interés del usuario
   - Coincidencia con tags o subcategorías relacionadas

2. **📍 Proximidad Geográfica (30%)**
   - < 5 km: 30 puntos
   - 5-10 km: 20 puntos  
   - 10-20 km: 10 puntos

3. **🔥 Popularidad del Evento (20%)**
   - Más de 100 asistentes: 10 puntos
   - Rating ≥ 4.5: 10 puntos

4. **⏰ Urgencia (10%)**
   - Eventos en los próximos 3 días: 10 puntos
   - Eventos en los próximos 7 días: 5 puntos

### Indicadores Especiales:
- **🔥 HOT/TRENDING**: Eventos con alta actividad (>500 vistas, >200 asistentes, >50 compartidos)
- **✨ % MATCH**: Se muestra cuando el score es ≥ 80%
- **⚠️ SPOTS LEFT**: Se muestra cuando quedan < 50 lugares

## 💻 IMPLEMENTACIÓN WEB

### Componente Principal
```typescript
// web/src/components/banners/IntelligentEventBanner.tsx
<IntelligentEventBanner
  userId={user?.id}
  userInterests={user?.interests}
  location={location}
/>
```

### Características Visuales:
- **Diseño Horizontal**: Cards grandes con imagen de fondo
- **Navegación**: Flechas laterales + dots de paginación
- **Auto-scroll**: Cambio automático cada 6 segundos
- **Gradientes**: Overlay para mejorar legibilidad
- **Animaciones**: Transiciones suaves con Framer Motion
- **Responsive**: Se adapta a diferentes tamaños de pantalla

### Integración en HomePage:
```typescript
// web/src/app/page.tsx
<main className='min-h-screen'>
  <ModernHeroSection />
  
  {/* Banner Inteligente - Posicionado prominentemente */}
  <section className="py-8 px-4 max-w-7xl mx-auto">
    <IntelligentEventBanner {...props} />
  </section>
  
  <NearbyEventsSection />
</main>
```

## 📱 IMPLEMENTACIÓN MÓVIL

### Componente Principal
```javascript
// mobile/src/components/banners/IntelligentEventBanner.tsx
<IntelligentEventBanner
  userId={user?.id}
  userInterests={user?.interests}
  location={userLocation}
  onEventPress={(eventId) => navigation.navigate('EventDetails', { eventId })}
/>
```

### Características Móviles:
- **Scroll Horizontal**: Optimizado para gestos táctiles
- **Haptic Feedback**: Vibración sutil en interacciones
- **Tamaño Adaptativo**: 32% de altura de pantalla
- **Performance**: Lazy loading de imágenes
- **Offline Support**: Mock data cuando no hay conexión
- **Gestos Nativos**: Swipe fluido entre eventos

### Integración en HomeScreen:
```javascript
// mobile/src/screens/home/IntelligentHomeScreen.tsx
<ScrollView>
  {renderPersonalizedHeader()}
  
  {/* Banner posicionado después del header */}
  <IntelligentEventBanner {...props} />
  
  {renderQuickActions()}
  {renderRecommendedEvents()}
</ScrollView>
```

## 🔌 BACKEND API

### Endpoint Principal
```
GET /api/events/featured
```

### Parámetros:
```javascript
{
  userId: string,        // ID del usuario para personalización
  interests: string[],   // Array de intereses del usuario
  location: {           // Ubicación actual
    latitude: number,
    longitude: number
  },
  radius: number,       // Radio de búsqueda en km (default: 25)
  limit: number,        // Cantidad de eventos (default: 5)
  algorithm: string     // Tipo de algoritmo (default: 'intelligent')
}
```

### Respuesta:
```javascript
{
  success: true,
  data: [
    {
      id: string,
      title: string,
      description: string,
      imageUrl: string,
      startDate: string,
      location: {
        address: string,
        coordinates: number[],
        distance: number     // Calculada dinámicamente
      },
      category: string,
      price: number,
      attendees: number,
      rating: number,
      organizer: {
        name: string,
        verified: boolean
      },
      matchScore: number,    // 0-100
      matchReasons: string[], // Razones del match
      isTrending: boolean,
      spotsLeft: number
    }
  ],
  meta: {
    algorithm: string,
    location: object,
    radius: number,
    total: number
  }
}
```

## 🎨 DISEÑO VISUAL

### Web:
- **Altura**: 500px fijo
- **Ancho de Card**: 85% del viewport
- **Spacing**: 16px entre cards
- **Border Radius**: 20px (rounded-2xl)
- **Sombras**: shadow-2xl para profundidad

### Móvil:
- **Altura**: 32% del viewport height
- **Ancho de Card**: 85% del screen width
- **Animaciones**: Escala 0.9-1.0 según posición
- **Opacidad**: 0.5-1.0 para cards no activos

## 🚀 OPTIMIZACIONES

### Performance:
1. **Cache Inteligente**: Resultados cacheados por 5 minutos
2. **Lazy Loading**: Imágenes se cargan según necesidad
3. **Debouncing**: Auto-scroll se pausa con interacción
4. **Memoización**: Cálculos de score optimizados

### UX:
1. **Loading States**: Skeleton loaders mientras carga
2. **Error Handling**: Fallback a mock data si falla API
3. **Accesibilidad**: Alto contraste y labels descriptivos
4. **Touch Targets**: Mínimo 44px para elementos táctiles

## 📊 MÉTRICAS DE ÉXITO

### KPIs Esperados:
- **CTR**: +250% vs banners estáticos
- **Engagement**: +180% en eventos visitados
- **Conversión**: +120% en registros a eventos
- **Retención**: Usuarios vuelven 3x más frecuentemente

### Tracking:
- Impresiones del banner
- Clicks en eventos
- Tiempo de visualización
- Conversiones (registro/compra)
- Match score promedio

## 🔧 CONFIGURACIÓN

### Variables de Entorno:
```env
# Backend
FEATURED_EVENTS_CACHE_TTL=300  # 5 minutos
FEATURED_EVENTS_MAX_RADIUS=50  # 50km máximo
FEATURED_EVENTS_DEFAULT_LIMIT=5

# Frontend
NEXT_PUBLIC_BANNER_AUTO_SCROLL_DELAY=6000
NEXT_PUBLIC_BANNER_ANIMATION_DURATION=500
```

## 🐛 DEBUGGING

### Logs del Backend:
```javascript
console.log('Featured Events Request:', {
  userId,
  interests,
  location,
  matchScores: events.map(e => ({ id: e.id, score: e.matchScore }))
});
```

### Verificar en Frontend:
1. Abrir DevTools > Network
2. Buscar request a `/api/events/featured`
3. Verificar parámetros enviados
4. Revisar respuesta y match scores

## 📝 NOTAS DE IMPLEMENTACIÓN

1. **Geolocalización**: Se solicita permiso automáticamente si no hay ubicación
2. **Fallback**: Siempre hay mock data para evitar espacios vacíos
3. **Sincronización**: El banner se actualiza al cambiar ubicación/intereses
4. **Cross-platform**: Código compartido entre web y móvil donde es posible

---

*Última actualización: Diciembre 2024*

## 📋 RESUMEN

El **Banner Inteligente de Eventos** es una característica clave que muestra eventos destacados de manera personalizada tanto en la versión web como móvil de EVENT CONNECT. Utiliza un algoritmo inteligente que considera múltiples factores para recomendar los eventos más relevantes para cada usuario.

## 🧠 ALGORITMO DE PERSONALIZACIÓN

### Factores de Puntuación (Match Score 0-100):

1. **🎯 Coincidencia de Intereses (40%)**
   - Coincidencia exacta con categorías de interés del usuario
   - Coincidencia con tags o subcategorías relacionadas

2. **📍 Proximidad Geográfica (30%)**
   - < 5 km: 30 puntos
   - 5-10 km: 20 puntos  
   - 10-20 km: 10 puntos

3. **🔥 Popularidad del Evento (20%)**
   - Más de 100 asistentes: 10 puntos
   - Rating ≥ 4.5: 10 puntos

4. **⏰ Urgencia (10%)**
   - Eventos en los próximos 3 días: 10 puntos
   - Eventos en los próximos 7 días: 5 puntos

### Indicadores Especiales:
- **🔥 HOT/TRENDING**: Eventos con alta actividad (>500 vistas, >200 asistentes, >50 compartidos)
- **✨ % MATCH**: Se muestra cuando el score es ≥ 80%
- **⚠️ SPOTS LEFT**: Se muestra cuando quedan < 50 lugares

## 💻 IMPLEMENTACIÓN WEB

### Componente Principal
```typescript
// web/src/components/banners/IntelligentEventBanner.tsx
<IntelligentEventBanner
  userId={user?.id}
  userInterests={user?.interests}
  location={location}
/>
```

### Características Visuales:
- **Diseño Horizontal**: Cards grandes con imagen de fondo
- **Navegación**: Flechas laterales + dots de paginación
- **Auto-scroll**: Cambio automático cada 6 segundos
- **Gradientes**: Overlay para mejorar legibilidad
- **Animaciones**: Transiciones suaves con Framer Motion
- **Responsive**: Se adapta a diferentes tamaños de pantalla

### Integración en HomePage:
```typescript
// web/src/app/page.tsx
<main className='min-h-screen'>
  <ModernHeroSection />
  
  {/* Banner Inteligente - Posicionado prominentemente */}
  <section className="py-8 px-4 max-w-7xl mx-auto">
    <IntelligentEventBanner {...props} />
  </section>
  
  <NearbyEventsSection />
</main>
```

## 📱 IMPLEMENTACIÓN MÓVIL

### Componente Principal
```javascript
// mobile/src/components/banners/IntelligentEventBanner.tsx
<IntelligentEventBanner
  userId={user?.id}
  userInterests={user?.interests}
  location={userLocation}
  onEventPress={(eventId) => navigation.navigate('EventDetails', { eventId })}
/>
```

### Características Móviles:
- **Scroll Horizontal**: Optimizado para gestos táctiles
- **Haptic Feedback**: Vibración sutil en interacciones
- **Tamaño Adaptativo**: 32% de altura de pantalla
- **Performance**: Lazy loading de imágenes
- **Offline Support**: Mock data cuando no hay conexión
- **Gestos Nativos**: Swipe fluido entre eventos

### Integración en HomeScreen:
```javascript
// mobile/src/screens/home/IntelligentHomeScreen.tsx
<ScrollView>
  {renderPersonalizedHeader()}
  
  {/* Banner posicionado después del header */}
  <IntelligentEventBanner {...props} />
  
  {renderQuickActions()}
  {renderRecommendedEvents()}
</ScrollView>
```

## 🔌 BACKEND API

### Endpoint Principal
```
GET /api/events/featured
```

### Parámetros:
```javascript
{
  userId: string,        // ID del usuario para personalización
  interests: string[],   // Array de intereses del usuario
  location: {           // Ubicación actual
    latitude: number,
    longitude: number
  },
  radius: number,       // Radio de búsqueda en km (default: 25)
  limit: number,        // Cantidad de eventos (default: 5)
  algorithm: string     // Tipo de algoritmo (default: 'intelligent')
}
```

### Respuesta:
```javascript
{
  success: true,
  data: [
    {
      id: string,
      title: string,
      description: string,
      imageUrl: string,
      startDate: string,
      location: {
        address: string,
        coordinates: number[],
        distance: number     // Calculada dinámicamente
      },
      category: string,
      price: number,
      attendees: number,
      rating: number,
      organizer: {
        name: string,
        verified: boolean
      },
      matchScore: number,    // 0-100
      matchReasons: string[], // Razones del match
      isTrending: boolean,
      spotsLeft: number
    }
  ],
  meta: {
    algorithm: string,
    location: object,
    radius: number,
    total: number
  }
}
```

## 🎨 DISEÑO VISUAL

### Web:
- **Altura**: 500px fijo
- **Ancho de Card**: 85% del viewport
- **Spacing**: 16px entre cards
- **Border Radius**: 20px (rounded-2xl)
- **Sombras**: shadow-2xl para profundidad

### Móvil:
- **Altura**: 32% del viewport height
- **Ancho de Card**: 85% del screen width
- **Animaciones**: Escala 0.9-1.0 según posición
- **Opacidad**: 0.5-1.0 para cards no activos

## 🚀 OPTIMIZACIONES

### Performance:
1. **Cache Inteligente**: Resultados cacheados por 5 minutos
2. **Lazy Loading**: Imágenes se cargan según necesidad
3. **Debouncing**: Auto-scroll se pausa con interacción
4. **Memoización**: Cálculos de score optimizados

### UX:
1. **Loading States**: Skeleton loaders mientras carga
2. **Error Handling**: Fallback a mock data si falla API
3. **Accesibilidad**: Alto contraste y labels descriptivos
4. **Touch Targets**: Mínimo 44px para elementos táctiles

## 📊 MÉTRICAS DE ÉXITO

### KPIs Esperados:
- **CTR**: +250% vs banners estáticos
- **Engagement**: +180% en eventos visitados
- **Conversión**: +120% en registros a eventos
- **Retención**: Usuarios vuelven 3x más frecuentemente

### Tracking:
- Impresiones del banner
- Clicks en eventos
- Tiempo de visualización
- Conversiones (registro/compra)
- Match score promedio

## 🔧 CONFIGURACIÓN

### Variables de Entorno:
```env
# Backend
FEATURED_EVENTS_CACHE_TTL=300  # 5 minutos
FEATURED_EVENTS_MAX_RADIUS=50  # 50km máximo
FEATURED_EVENTS_DEFAULT_LIMIT=5

# Frontend
NEXT_PUBLIC_BANNER_AUTO_SCROLL_DELAY=6000
NEXT_PUBLIC_BANNER_ANIMATION_DURATION=500
```

## 🐛 DEBUGGING

### Logs del Backend:
```javascript
console.log('Featured Events Request:', {
  userId,
  interests,
  location,
  matchScores: events.map(e => ({ id: e.id, score: e.matchScore }))
});
```

### Verificar en Frontend:
1. Abrir DevTools > Network
2. Buscar request a `/api/events/featured`
3. Verificar parámetros enviados
4. Revisar respuesta y match scores

## 📝 NOTAS DE IMPLEMENTACIÓN

1. **Geolocalización**: Se solicita permiso automáticamente si no hay ubicación
2. **Fallback**: Siempre hay mock data para evitar espacios vacíos
3. **Sincronización**: El banner se actualiza al cambiar ubicación/intereses
4. **Cross-platform**: Código compartido entre web y móvil donde es posible

---

*Última actualización: Diciembre 2024*



