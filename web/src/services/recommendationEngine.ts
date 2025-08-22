import { Event, User } from '@/types';

// ===== INTERFACES =====
interface ScoredEvent extends Event {
  score: number;
  reasons: string[];
}

interface RecommendationContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: number;
  weather?: 'sunny' | 'rainy' | 'cloudy';
  userMood?: 'energetic' | 'relaxed' | 'social' | 'creative';
}

// ===== MOTOR DE RECOMENDACIONES =====
export class RecommendationEngine {
  /**
   * Obtiene eventos personalizados para el usuario
   */
  static getPersonalizedEvents(
    user: User, 
    events: Event[], 
    context?: RecommendationContext
  ): ScoredEvent[] {
    return events
      .map(event => this.scoreEvent(user, event, context))
      .filter(event => event.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20); // Top 20 recomendaciones
  }

  /**
   * Calcula el score de un evento para un usuario específico
   */
  private static scoreEvent(
    user: User, 
    event: Event, 
    context?: RecommendationContext
  ): ScoredEvent {
    let score = 0;
    const reasons: string[] = [];

    // 1. INTERESES DEL USUARIO (40% del score)
    const interestScore = this.calculateInterestScore(user, event);
    score += interestScore;
    if (interestScore > 0) {
      reasons.push(`Coincide con tus intereses en ${event.category}`);
    }

    // 2. PROXIMIDAD GEOGRÁFICA (25% del score)
    const locationScore = this.calculateLocationScore(user, event);
    score += locationScore;
    if (locationScore > 15) {
      reasons.push(`Está cerca de ti (${event.distance})`);
    }

    // 3. CONEXIONES SOCIALES (20% del score)
    const socialScore = this.calculateSocialScore(user, event);
    score += socialScore;
    if (socialScore > 0) {
      reasons.push(`${event.friendsAttending} amigos van a asistir`);
    }

    // 4. POPULARIDAD Y TENDENCIAS (10% del score)
    const popularityScore = this.calculatePopularityScore(event);
    score += popularityScore;
    if (event.isPopular) {
      reasons.push('Evento muy popular');
    }
    if (event.isTrending) {
      reasons.push('Tendencia del momento');
    }

    // 5. CONTEXTO TEMPORAL (5% del score)
    const contextScore = this.calculateContextScore(event, context);
    score += contextScore;

    return {
      ...event,
      score: Math.round(score),
      reasons
    };
  }

  /**
   * Calcula score basado en intereses del usuario
   */
  private static calculateInterestScore(user: User, event: Event): number {
    if (!user.interests || user.interests.length === 0) return 20; // Score neutral

    const userInterests = user.interests.map(i => i.toLowerCase());
    const eventCategory = event.category.toLowerCase();
    const eventTags = event.tags?.map(t => t.toLowerCase()) || [];

    // Coincidencia exacta de categoría
    if (userInterests.includes(eventCategory)) {
      return 40;
    }

    // Coincidencia de tags
    const matchingTags = eventTags.filter(tag => 
      userInterests.some(interest => 
        interest.includes(tag) || tag.includes(interest)
      )
    );

    if (matchingTags.length > 0) {
      return 30 + (matchingTags.length * 5);
    }

    // Coincidencia parcial (palabras clave)
    const hasPartialMatch = userInterests.some(interest =>
      eventCategory.includes(interest) || 
      event.title.toLowerCase().includes(interest) ||
      event.description?.toLowerCase().includes(interest)
    );

    return hasPartialMatch ? 25 : 10;
  }

  /**
   * Calcula score basado en proximidad geográfica
   */
  private static calculateLocationScore(user: User, event: Event): number {
    if (!event.distance) return 15; // Score neutral

    const distance = parseFloat(event.distance.replace('km', '').trim());
    
    if (distance <= 1) return 25;      // Muy cerca
    if (distance <= 5) return 20;      // Cerca
    if (distance <= 10) return 15;     // Distancia media
    if (distance <= 20) return 10;     // Lejos
    return 5;                          // Muy lejos
  }

  /**
   * Calcula score basado en conexiones sociales
   */
  private static calculateSocialScore(user: User, event: Event): number {
    const friendsAttending = event.friendsAttending || 0;
    const friendsInTribes = event.hostTribe?.members?.filter(
      member => user.friends?.includes(member.id)
    ).length || 0;

    let score = 0;
    
    // Amigos asistiendo
    score += Math.min(friendsAttending * 5, 15);
    
    // Amigos en la tribu organizadora
    score += Math.min(friendsInTribes * 2, 5);

    return score;
  }

  /**
   * Calcula score basado en popularidad
   */
  private static calculatePopularityScore(event: Event): number {
    let score = 0;

    // Popularidad general
    if (event.isPopular) score += 5;
    if (event.isTrending) score += 5;

    // Número de asistentes (normalizado)
    const attendees = event.attendees || 0;
    if (attendees > 100) score += 3;
    else if (attendees > 50) score += 2;
    else if (attendees > 20) score += 1;

    return Math.min(score, 10);
  }

  /**
   * Calcula score basado en contexto temporal
   */
  private static calculateContextScore(
    event: Event, 
    context?: RecommendationContext
  ): number {
    if (!context) return 0;

    let score = 0;
    const eventDate = new Date(event.date);
    const eventHour = eventDate.getHours();

    // Coincidencia con momento del día
    switch (context.timeOfDay) {
      case 'morning':
        if (eventHour >= 8 && eventHour <= 12) score += 3;
        break;
      case 'afternoon':
        if (eventHour >= 12 && eventHour <= 18) score += 3;
        break;
      case 'evening':
        if (eventHour >= 18 && eventHour <= 23) score += 3;
        break;
      case 'night':
        if (eventHour >= 20 || eventHour <= 2) score += 3;
        break;
    }

    // Coincidencia con día de la semana
    const eventDayOfWeek = eventDate.getDay();
    if (Math.abs(eventDayOfWeek - context.dayOfWeek) <= 1) {
      score += 2;
    }

    return score;
  }

  /**
   * Obtiene contexto actual del usuario
   */
  static getCurrentContext(): RecommendationContext {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    let timeOfDay: RecommendationContext['timeOfDay'];
    if (hour >= 6 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon';
    else if (hour >= 18 && hour < 22) timeOfDay = 'evening';
    else timeOfDay = 'night';

    return {
      timeOfDay,
      dayOfWeek
    };
  }

  /**
   * Obtiene eventos similares a uno dado
   */
  static getSimilarEvents(targetEvent: Event, allEvents: Event[], limit = 5): Event[] {
    return allEvents
      .filter(event => event.id !== targetEvent.id)
      .map(event => ({
        ...event,
        similarity: this.calculateSimilarity(targetEvent, event)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  /**
   * Calcula similaridad entre dos eventos
   */
  private static calculateSimilarity(event1: Event, event2: Event): number {
    let similarity = 0;

    // Misma categoría
    if (event1.category === event2.category) similarity += 40;

    // Tags similares
    const tags1 = event1.tags || [];
    const tags2 = event2.tags || [];
    const commonTags = tags1.filter(tag => tags2.includes(tag));
    similarity += commonTags.length * 10;

    // Mismo organizador/tribu
    if (event1.host?.id === event2.host?.id) similarity += 20;

    // Ubicación similar
    if (event1.location && event2.location) {
      const distance1 = parseFloat(event1.distance?.replace('km', '') || '999');
      const distance2 = parseFloat(event2.distance?.replace('km', '') || '999');
      if (Math.abs(distance1 - distance2) < 5) similarity += 15;
    }

    // Precio similar
    const price1 = event1.price || 0;
    const price2 = event2.price || 0;
    if (Math.abs(price1 - price2) < 10) similarity += 10;

    return similarity;
  }
}