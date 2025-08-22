const Event = require('../models/Event');
const User = require('../models/User');
const cache = require('../config/cache');

// ===== SERVICIO DE RECOMENDACIONES =====
class RecommendationService {
  /**
   * Genera recomendaciones personalizadas para un usuario
   */
  static async generatePersonalizedRecommendations(userId, options = {}) {
    const {
      limit = 20,
      category,
      includeReasons = false,
      context
    } = options;

    try {
      // Verificar caché primero
      const cacheKey = `recommendations:${userId}:${JSON.stringify(options)}`;
      const cached = await cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Obtener usuario y sus datos
      const user = await User.findById(userId)
        .populate('interests')
        .populate('friends')
        .lean();

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Obtener eventos disponibles
      let eventsQuery = Event.find({
        dateTime: { $gte: new Date() }, // Solo eventos futuros
        status: 'published'
      });

      if (category) {
        eventsQuery = eventsQuery.where('category').equals(category);
      }

      const events = await eventsQuery
        .populate('host', 'firstName lastName avatar rating')
        .populate('attendees.user', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(100) // Obtener más eventos para mejor scoring
        .lean();

      // Calcular scores para cada evento
      const scoredEvents = await Promise.all(
        events.map(event => this.scoreEventForUser(user, event, context, includeReasons))
      );

      // Filtrar y ordenar por score
      const recommendations = scoredEvents
        .filter(event => event.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      // Guardar en caché por 10 minutos
      await cache.set(cacheKey, recommendations, 10 * 60);

      return recommendations;

    } catch (error) {
      console.error('Error generando recomendaciones:', error);
      throw error;
    }
  }

  /**
   * Calcula score de un evento para un usuario específico
   */
  static async scoreEventForUser(user, event, context, includeReasons = false) {
    let score = 0;
    const reasons = [];

    // 1. INTERESES DEL USUARIO (40%)
    const interestScore = this.calculateInterestScore(user, event);
    score += interestScore;
    if (interestScore > 30 && includeReasons) {
      reasons.push(`Coincide con tus intereses en ${event.category}`);
    }

    // 2. PROXIMIDAD GEOGRÁFICA (25%)
    const locationScore = await this.calculateLocationScore(user, event);
    score += locationScore;
    if (locationScore > 15 && includeReasons) {
      const distance = await this.calculateDistance(user.location, event.location);
      reasons.push(`Está cerca de ti (${distance.toFixed(1)} km)`);
    }

    // 3. CONEXIONES SOCIALES (20%)
    const socialScore = await this.calculateSocialScore(user, event);
    score += socialScore;
    if (socialScore > 0 && includeReasons) {
      const friendsCount = await this.getFriendsAttendingCount(user, event);
      if (friendsCount > 0) {
        reasons.push(`${friendsCount} amigos van a asistir`);
      }
    }

    // 4. POPULARIDAD Y TENDENCIAS (10%)
    const popularityScore = this.calculatePopularityScore(event);
    score += popularityScore;
    if (event.stats?.isTrending && includeReasons) {
      reasons.push('Tendencia del momento');
    }

    // 5. CONTEXTO TEMPORAL (5%)
    const contextScore = this.calculateContextScore(event, context);
    score += contextScore;

    return {
      ...event,
      score: Math.round(score),
      reasons: includeReasons ? reasons : undefined
    };
  }

  /**
   * Calcula score basado en intereses del usuario
   */
  static calculateInterestScore(user, event) {
    if (!user.interests || user.interests.length === 0) return 20;

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

    // Coincidencia parcial
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
  static async calculateLocationScore(user, event) {
    if (!user.location?.coordinates || !event.location?.coordinates) {
      return 15; // Score neutral si no hay ubicación
    }

    const distance = await this.calculateDistance(
      user.location.coordinates,
      event.location.coordinates
    );

    if (distance <= 1) return 25;      // Muy cerca
    if (distance <= 5) return 20;      // Cerca
    if (distance <= 10) return 15;     // Distancia media
    if (distance <= 20) return 10;     // Lejos
    return 5;                          // Muy lejos
  }

  /**
   * Calcula score basado en conexiones sociales
   */
  static async calculateSocialScore(user, event) {
    let score = 0;

    // Amigos asistiendo al evento
    const friendsAttending = await this.getFriendsAttendingCount(user, event);
    score += Math.min(friendsAttending * 5, 15);

    // Amigos en la tribu organizadora
    if (event.tribe && user.friends) {
      const friendsInTribe = await this.getFriendsInTribe(user.friends, event.tribe);
      score += Math.min(friendsInTribe * 2, 5);
    }

    return score;
  }

  /**
   * Calcula score basado en popularidad
   */
  static calculatePopularityScore(event) {
    let score = 0;

    // Popularidad general
    if (event.stats?.isPopular) score += 5;
    if (event.stats?.isTrending) score += 5;

    // Número de asistentes (normalizado)
    const attendeeCount = event.attendees?.length || 0;
    if (attendeeCount > 100) score += 3;
    else if (attendeeCount > 50) score += 2;
    else if (attendeeCount > 20) score += 1;

    return Math.min(score, 10);
  }

  /**
   * Calcula score basado en contexto temporal
   */
  static calculateContextScore(event, context) {
    if (!context) return 0;

    let score = 0;
    const eventDate = new Date(event.dateTime.start);
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

    return score;
  }

  /**
   * Obtiene eventos trending
   */
  static async getTrendingEvents(options = {}) {
    const {
      timeWindow = '24h',
      location = 'city',
      category,
      userId
    } = options;

    try {
      const cacheKey = `trending:${timeWindow}:${location}:${category || 'all'}`;
      const cached = await cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Calcular ventana de tiempo
      const timeWindowMs = this.getTimeWindowMs(timeWindow);
      const cutoffDate = new Date(Date.now() - timeWindowMs);

      // Query base para eventos
      let query = {
        dateTime: { $gte: new Date() },
        status: 'published',
        createdAt: { $gte: cutoffDate }
      };

      if (category) {
        query.category = category;
      }

      const events = await Event.find(query)
        .populate('host', 'firstName lastName avatar rating')
        .populate('attendees.user', 'firstName lastName')
        .lean();

      // Calcular trending score para cada evento
      const trendingEvents = events
        .map(event => ({
          ...event,
          trendingScore: this.calculateTrendingScore(event, timeWindowMs),
          velocityMetrics: this.calculateVelocityMetrics(event, timeWindowMs)
        }))
        .filter(event => event.trendingScore > 10)
        .sort((a, b) => b.trendingScore - a.trendingScore)
        .slice(0, 20);

      // Guardar en caché por 5 minutos
      await cache.set(cacheKey, trendingEvents, 5 * 60);

      return trendingEvents;

    } catch (error) {
      console.error('Error obteniendo trending events:', error);
      throw error;
    }
  }

  /**
   * Calcula trending score para un evento
   */
  static calculateTrendingScore(event, timeWindowMs) {
    const now = Date.now();
    const eventCreated = new Date(event.createdAt).getTime();
    const hoursActive = Math.max(1, (now - eventCreated) / (1000 * 60 * 60));

    // Métricas de velocidad
    const attendeeVelocity = (event.attendees?.length || 0) / hoursActive;
    const viewVelocity = (event.stats?.viewCount || 0) / hoursActive;
    const shareVelocity = (event.stats?.shareCount || 0) / hoursActive;

    // Calcular score trending
    let score = 0;
    score += Math.min(attendeeVelocity * 10, 40);  // 40% peso
    score += Math.min(viewVelocity * 0.1, 25);     // 25% peso
    score += Math.min(shareVelocity * 20, 20);     // 20% peso

    // Bonificaciones
    if (event.stats?.isPopular) score *= 1.2;
    if (event.pricing?.isFree) score *= 1.1;

    // Penalización por eventos muy lejanos en el tiempo
    const daysUntilEvent = (new Date(event.dateTime.start).getTime() - now) / (1000 * 60 * 60 * 24);
    if (daysUntilEvent > 30) score *= 0.8;

    return Math.round(score);
  }

  /**
   * Calcula métricas de velocidad
   */
  static calculateVelocityMetrics(event, timeWindowMs) {
    const now = Date.now();
    const eventCreated = new Date(event.createdAt).getTime();
    const hoursActive = Math.max(1, (now - eventCreated) / (1000 * 60 * 60));

    return {
      attendeeVelocity: (event.attendees?.length || 0) / hoursActive,
      viewVelocity: (event.stats?.viewCount || 0) / hoursActive,
      shareVelocity: (event.stats?.shareCount || 0) / hoursActive,
      engagementRate: event.attendees?.length > 0 ? 
        (event.stats?.likeCount || 0) / event.attendees.length : 0
    };
  }

  /**
   * Obtiene eventos similares
   */
  static async getSimilarEvents(eventId, limit = 5, userId = null) {
    try {
      const baseEvent = await Event.findById(eventId).lean();
      if (!baseEvent) {
        throw new Error('Evento no encontrado');
      }

      // Buscar eventos similares
      const similarEvents = await Event.find({
        _id: { $ne: eventId },
        dateTime: { $gte: new Date() },
        status: 'published',
        $or: [
          { category: baseEvent.category },
          { tags: { $in: baseEvent.tags || [] } },
          { 'host.id': baseEvent.host.id }
        ]
      })
      .populate('host', 'firstName lastName avatar rating')
      .limit(limit * 2) // Obtener más para mejor filtrado
      .lean();

      // Calcular similaridad
      const scoredSimilar = similarEvents
        .map(event => ({
          ...event,
          similarity: this.calculateSimilarity(baseEvent, event)
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      return scoredSimilar;

    } catch (error) {
      console.error('Error obteniendo eventos similares:', error);
      throw error;
    }
  }

  /**
   * Calcula similaridad entre dos eventos
   */
  static calculateSimilarity(event1, event2) {
    let similarity = 0;

    // Misma categoría (40%)
    if (event1.category === event2.category) similarity += 40;

    // Tags similares (30%)
    const tags1 = event1.tags || [];
    const tags2 = event2.tags || [];
    const commonTags = tags1.filter(tag => tags2.includes(tag));
    similarity += Math.min(commonTags.length * 10, 30);

    // Mismo organizador (20%)
    if (event1.host?.id === event2.host?.id) similarity += 20;

    // Precio similar (10%)
    const price1 = event1.pricing?.amount || 0;
    const price2 = event2.pricing?.amount || 0;
    const priceDiff = Math.abs(price1 - price2);
    if (priceDiff < 10) similarity += 10;
    else if (priceDiff < 25) similarity += 5;

    return similarity;
  }

  /**
   * Obtiene contexto del usuario
   */
  static async getUserContext(userId) {
    try {
      const user = await User.findById(userId).lean();
      const now = new Date();
      const hour = now.getHours();
      const dayOfWeek = now.getDay();

      let timeOfDay;
      if (hour >= 6 && hour < 12) timeOfDay = 'morning';
      else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon';
      else if (hour >= 18 && hour < 22) timeOfDay = 'evening';
      else timeOfDay = 'night';

      return {
        userId,
        timeOfDay,
        dayOfWeek,
        userLocation: user.location,
        userInterests: user.interests,
        recentActivity: await this.getRecentUserActivity(userId)
      };

    } catch (error) {
      console.error('Error obteniendo contexto del usuario:', error);
      return {
        timeOfDay: 'afternoon',
        dayOfWeek: new Date().getDay()
      };
    }
  }

  /**
   * Registra feedback del usuario
   */
  static async recordFeedback(userId, eventId, action, context = {}) {
    try {
      // Aquí guardarías el feedback en una colección específica
      // para entrenar el algoritmo de ML en el futuro
      
      const feedbackData = {
        userId,
        eventId,
        action,
        context,
        timestamp: new Date(),
        userAgent: context.userAgent,
        platform: context.platform || 'web'
      };

      // Por ahora, solo loggeamos
      console.log('📊 Feedback registrado:', feedbackData);

      // Invalidar caché de recomendaciones del usuario
      const pattern = `recommendations:${userId}:*`;
      await cache.deletePattern(pattern);

      return feedbackData;

    } catch (error) {
      console.error('Error registrando feedback:', error);
      throw error;
    }
  }

  /**
   * Actualiza perfil de usuario
   */
  static async updateUserProfile(userId, updates) {
    try {
      await User.findByIdAndUpdate(userId, {
        $set: updates,
        $inc: { 'stats.profileUpdates': 1 }
      });

      // Invalidar caché relacionado
      await cache.deletePattern(`recommendations:${userId}:*`);
      await cache.delete(`user:${userId}`);

    } catch (error) {
      console.error('Error actualizando perfil:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de recomendaciones
   */
  static async getRecommendationStats(userId) {
    try {
      // Estadísticas del usuario
      const user = await User.findById(userId).lean();
      
      // Estadísticas de eventos recomendados vs. unidos
      const recommendationHistory = await this.getRecommendationHistory(userId);
      
      return {
        user: {
          totalRecommendations: recommendationHistory.length,
          joinedFromRecommendations: recommendationHistory.filter(r => r.joined).length,
          conversionRate: recommendationHistory.length > 0 ? 
            (recommendationHistory.filter(r => r.joined).length / recommendationHistory.length * 100) : 0,
          favoriteCategories: await this.getFavoriteCategories(userId),
          averageEventDistance: await this.getAverageEventDistance(userId)
        },
        algorithm: {
          version: '2.0',
          lastUpdated: new Date().toISOString(),
          accuracy: await this.calculateAlgorithmAccuracy(userId)
        }
      };

    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  // ===== MÉTODOS HELPER =====

  /**
   * Calcula distancia entre dos puntos geográficos
   */
  static async calculateDistance(coord1, coord2) {
    if (!coord1 || !coord2) return 999;

    const R = 6371; // Radio de la Tierra en km
    const dLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
    const dLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(coord1.latitude * Math.PI / 180) * Math.cos(coord2.latitude * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Obtiene número de amigos asistiendo a un evento
   */
  static async getFriendsAttendingCount(user, event) {
    if (!user.friends || !event.attendees) return 0;

    const friendIds = user.friends.map(f => f.toString());
    const attendeeIds = event.attendees.map(a => a.user.toString());

    return friendIds.filter(friendId => attendeeIds.includes(friendId)).length;
  }

  /**
   * Obtiene actividad reciente del usuario
   */
  static async getRecentUserActivity(userId) {
    // Aquí obtendrías la actividad reciente del usuario
    // Por ahora, retornamos un array vacío
    return [];
  }

  /**
   * Obtiene historial de recomendaciones
   */
  static async getRecommendationHistory(userId) {
    // Aquí consultarías el historial de recomendaciones
    // Por ahora, retornamos datos mock
    return [];
  }

  /**
   * Obtiene categorías favoritas del usuario
   */
  static async getFavoriteCategories(userId) {
    try {
      const userEvents = await Event.aggregate([
        {
          $match: {
            'attendees.user': userId
          }
        },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 5
        }
      ]);

      return userEvents.map(item => ({
        category: item._id,
        count: item.count
      }));

    } catch (error) {
      console.error('Error obteniendo categorías favoritas:', error);
      return [];
    }
  }

  /**
   * Calcula distancia promedio de eventos del usuario
   */
  static async getAverageEventDistance(userId) {
    // Implementación simplificada
    return 5.2; // km promedio
  }

  /**
   * Calcula precisión del algoritmo
   */
  static async calculateAlgorithmAccuracy(userId) {
    // Implementación simplificada
    return 87.5; // % de precisión
  }

  /**
   * Convierte ventana de tiempo a milisegundos
   */
  static getTimeWindowMs(timeWindow) {
    switch (timeWindow) {
      case '1h': return 60 * 60 * 1000;
      case '6h': return 6 * 60 * 60 * 1000;
      case '24h': return 24 * 60 * 60 * 1000;
      case '7d': return 7 * 24 * 60 * 60 * 1000;
      default: return 24 * 60 * 60 * 1000;
    }
  }

  /**
   * Obtiene amigos en una tribu
   */
  static async getFriendsInTribe(friendIds, tribeId) {
    // Implementación simplificada
    return 0;
  }
}

module.exports = RecommendationService;