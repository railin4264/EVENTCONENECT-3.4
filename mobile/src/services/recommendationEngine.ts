import AsyncStorage from '@react-native-async-storage/async-storage';
import { Event, User } from '../types';

// ===== INTERFACES =====
interface ScoredEvent extends Event {
  score: number;
  reasons: string[];
}

interface MobileRecommendationContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: number;
  batteryLevel?: number;
  networkType?: 'wifi' | 'cellular' | 'none';
  deviceLocation?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  userActivity?: 'active' | 'background' | 'foreground';
}

interface RecommendationCache {
  userId: string;
  recommendations: ScoredEvent[];
  context: MobileRecommendationContext;
  timestamp: number;
  expiresAt: number;
}

// ===== MOTOR DE RECOMENDACIONES MÓVIL =====
export class MobileRecommendationEngine {
  private static readonly CACHE_KEY = 'eventconnect_recommendations';
  private static readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutos

  /**
   * Obtiene recomendaciones personalizadas optimizadas para móvil
   */
  static async getPersonalizedEvents(
    user: User,
    events: Event[],
    context?: MobileRecommendationContext
  ): Promise<ScoredEvent[]> {
    try {
      // Intentar obtener del caché primero
      const cached = await this.getCachedRecommendations(user.id, context);
      if (cached) {
        console.log('📱 Recomendaciones desde caché móvil');
        return cached;
      }

      // Generar nuevas recomendaciones
      const currentContext = context || await this.getCurrentMobileContext();
      const recommendations = this.calculateMobileRecommendations(user, events, currentContext);

      // Guardar en caché
      await this.cacheRecommendations(user.id, recommendations, currentContext);

      console.log(`📱 ${recommendations.length} recomendaciones generadas para móvil`);
      return recommendations;
      
    } catch (error) {
      console.error('Error generando recomendaciones móviles:', error);
      // Fallback: recomendaciones básicas sin caché
      return this.calculateMobileRecommendations(user, events);
    }
  }

  /**
   * Calcula recomendaciones optimizadas para móvil
   */
  private static calculateMobileRecommendations(
    user: User,
    events: Event[],
    context?: MobileRecommendationContext
  ): ScoredEvent[] {
    return events
      .map(event => this.scoreMobileEvent(user, event, context))
      .filter(event => event.score > 15) // Umbral más alto para móvil
      .sort((a, b) => b.score - a.score)
      .slice(0, 15); // Menos eventos para móvil (performance)
  }

  /**
   * Calcula score de evento optimizado para móvil
   */
  private static scoreMobileEvent(
    user: User,
    event: Event,
    context?: MobileRecommendationContext
  ): ScoredEvent {
    let score = 0;
    const reasons: string[] = [];

    // 1. INTERESES DEL USUARIO (45% - más peso en móvil)
    const interestScore = this.calculateInterestScore(user, event);
    score += interestScore * 1.125; // Boost para móvil
    if (interestScore > 30) {
      reasons.push(`Coincide con tus intereses en ${event.category}`);
    }

    // 2. PROXIMIDAD GEOGRÁFICA (30% - crítico en móvil)
    const locationScore = this.calculateLocationScore(user, event, context);
    score += locationScore * 1.2; // Boost para móvil
    if (locationScore > 20) {
      reasons.push(`Cerca de ti (${event.distance})`);
    }

    // 3. CONEXIONES SOCIALES (15% - menos peso en móvil)
    const socialScore = this.calculateSocialScore(user, event);
    score += socialScore * 0.75;
    if (socialScore > 0) {
      reasons.push(`${event.friendsAttending} amigos van`);
    }

    // 4. POPULARIDAD (10%)
    const popularityScore = this.calculatePopularityScore(event);
    score += popularityScore;
    if (event.isPopular) reasons.push('Muy popular');
    if (event.isTrending) reasons.push('Trending');

    // 5. CONTEXTO MÓVIL ESPECÍFICO (bonus)
    if (context) {
      const mobileBonus = this.calculateMobileContextBonus(event, context);
      score += mobileBonus;
    }

    return {
      ...event,
      score: Math.round(score),
      reasons: reasons.slice(0, 2) // Máximo 2 razones para UI móvil
    };
  }

  /**
   * Calcula bonus específico para contexto móvil
   */
  private static calculateMobileContextBonus(
    event: Event,
    context: MobileRecommendationContext
  ): number {
    let bonus = 0;

    // Bonus por batería alta (usuario activo)
    if (context.batteryLevel && context.batteryLevel > 50) {
      bonus += 2;
    }

    // Bonus por WiFi (puede cargar más contenido)
    if (context.networkType === 'wifi') {
      bonus += 3;
    }

    // Bonus por ubicación precisa
    if (context.deviceLocation && context.deviceLocation.accuracy < 100) {
      bonus += 2;
    }

    // Penalty por batería baja
    if (context.batteryLevel && context.batteryLevel < 20) {
      bonus -= 3;
    }

    // Bonus por horario (eventos en horario apropiado)
    const eventHour = new Date(event.date).getHours();
    if (context.timeOfDay === 'evening' && eventHour >= 18) {
      bonus += 2;
    }
    if (context.timeOfDay === 'morning' && eventHour >= 8 && eventHour <= 12) {
      bonus += 2;
    }

    return bonus;
  }

  /**
   * Obtiene contexto actual del dispositivo móvil
   */
  private static async getCurrentMobileContext(): Promise<MobileRecommendationContext> {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    let timeOfDay: MobileRecommendationContext['timeOfDay'];
    if (hour >= 6 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon';
    else if (hour >= 18 && hour < 22) timeOfDay = 'evening';
    else timeOfDay = 'night';

    const context: MobileRecommendationContext = {
      timeOfDay,
      dayOfWeek
    };

    try {
      // Obtener información del dispositivo si está disponible
      if (typeof navigator !== 'undefined') {
        // Battery API (si está disponible)
        if ('getBattery' in navigator) {
          const battery = await (navigator as any).getBattery();
          context.batteryLevel = Math.round(battery.level * 100);
        }

        // Network API
        if ('connection' in navigator) {
          const connection = (navigator as any).connection;
          context.networkType = connection.type === 'wifi' ? 'wifi' : 'cellular';
        }
      }
    } catch (error) {
      console.log('Información del dispositivo no disponible:', error);
    }

    return context;
  }

  /**
   * Guarda recomendaciones en caché local
   */
  private static async cacheRecommendations(
    userId: string,
    recommendations: ScoredEvent[],
    context: MobileRecommendationContext
  ): Promise<void> {
    try {
      const cacheData: RecommendationCache = {
        userId,
        recommendations,
        context,
        timestamp: Date.now(),
        expiresAt: Date.now() + this.CACHE_TTL
      };

      await AsyncStorage.setItem(
        `${this.CACHE_KEY}_${userId}`,
        JSON.stringify(cacheData)
      );
    } catch (error) {
      console.error('Error guardando recomendaciones en caché:', error);
    }
  }

  /**
   * Obtiene recomendaciones desde caché local
   */
  private static async getCachedRecommendations(
    userId: string,
    currentContext?: MobileRecommendationContext
  ): Promise<ScoredEvent[] | null> {
    try {
      const cached = await AsyncStorage.getItem(`${this.CACHE_KEY}_${userId}`);
      if (!cached) return null;

      const cacheData: RecommendationCache = JSON.parse(cached);

      // Verificar expiración
      if (Date.now() > cacheData.expiresAt) {
        await AsyncStorage.removeItem(`${this.CACHE_KEY}_${userId}`);
        return null;
      }

      // Verificar si el contexto ha cambiado significativamente
      if (currentContext && this.hasContextChanged(cacheData.context, currentContext)) {
        return null;
      }

      return cacheData.recommendations;
    } catch (error) {
      console.error('Error obteniendo recomendaciones del caché:', error);
      return null;
    }
  }

  /**
   * Verifica si el contexto ha cambiado significativamente
   */
  private static hasContextChanged(
    oldContext: MobileRecommendationContext,
    newContext: MobileRecommendationContext
  ): boolean {
    // Cambio de momento del día
    if (oldContext.timeOfDay !== newContext.timeOfDay) return true;

    // Cambio de tipo de red
    if (oldContext.networkType !== newContext.networkType) return true;

    // Cambio significativo de batería
    if (oldContext.batteryLevel && newContext.batteryLevel) {
      const batteryDiff = Math.abs(oldContext.batteryLevel - newContext.batteryLevel);
      if (batteryDiff > 20) return true;
    }

    return false;
  }

  // Reutilizar métodos de scoring del web (adaptados)
  private static calculateInterestScore(user: User, event: Event): number {
    if (!user.interests || user.interests.length === 0) return 20;

    const userInterests = user.interests.map(i => i.toLowerCase());
    const eventCategory = event.category.toLowerCase();
    const eventTags = event.tags?.map(t => t.toLowerCase()) || [];

    if (userInterests.includes(eventCategory)) return 40;

    const matchingTags = eventTags.filter(tag =>
      userInterests.some(interest =>
        interest.includes(tag) || tag.includes(interest)
      )
    );

    if (matchingTags.length > 0) {
      return 30 + (matchingTags.length * 5);
    }

    const hasPartialMatch = userInterests.some(interest =>
      eventCategory.includes(interest) ||
      event.title.toLowerCase().includes(interest) ||
      event.description?.toLowerCase().includes(interest)
    );

    return hasPartialMatch ? 25 : 10;
  }

  private static calculateLocationScore(
    user: User,
    event: Event,
    context?: MobileRecommendationContext
  ): number {
    if (!event.distance) return 15;

    const distance = parseFloat(event.distance.replace('km', '').trim());

    // En móvil, penalizar más los eventos lejanos
    if (distance <= 0.5) return 30;  // Muy cerca
    if (distance <= 2) return 25;    // Cerca
    if (distance <= 5) return 20;    // Distancia media
    if (distance <= 10) return 15;   // Lejos
    if (distance <= 20) return 8;    // Muy lejos
    return 3;                        // Demasiado lejos para móvil
  }

  private static calculateSocialScore(user: User, event: Event): number {
    const friendsAttending = event.friendsAttending || 0;
    return Math.min(friendsAttending * 5, 15);
  }

  private static calculatePopularityScore(event: Event): number {
    let score = 0;
    if (event.isPopular) score += 5;
    if (event.isTrending) score += 5;

    const attendees = event.attendees || 0;
    if (attendees > 100) score += 3;
    else if (attendees > 50) score += 2;
    else if (attendees > 20) score += 1;

    return Math.min(score, 10);
  }

  /**
   * Limpia caché antiguo
   */
  static async cleanupCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const recommendationKeys = keys.filter(key => key.startsWith(this.CACHE_KEY));

      for (const key of recommendationKeys) {
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
          const cacheData: RecommendationCache = JSON.parse(cached);
          if (Date.now() > cacheData.expiresAt) {
            await AsyncStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.error('Error limpiando caché de recomendaciones:', error);
    }
  }

  /**
   * Precargar recomendaciones en background
   */
  static async preloadRecommendations(user: User, events: Event[]): Promise<void> {
    try {
      // Solo precargar si estamos en WiFi para ahorrar datos
      const context = await this.getCurrentMobileContext();
      
      if (context.networkType === 'wifi') {
        await this.getPersonalizedEvents(user, events, context);
        console.log('📱 Recomendaciones precargadas en background');
      }
    } catch (error) {
      console.error('Error precargando recomendaciones:', error);
    }
  }
}