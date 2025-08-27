const { Event, User, Tribe, UserInteraction } = require('../models');

class AIRecommendationService {
  constructor() {
    this.MLModelEndpoint =
      process.env.ML_MODEL_ENDPOINT || 'http://localhost:8000';
    this.useMLModel = process.env.USE_ML_MODEL === 'true';
    this.fallbackToRules = true;
  }

  // ==========================================
  // RECOMENDACIONES DE EVENTOS
  // ==========================================

  async getEventRecommendations(user, options = {}) {
    try {
      const { location, radius = 25, limit = 10 } = options;

      if (this.useMLModel) {
        // Intentar usar modelo de ML
        try {
          return await this.getMLEventRecommendations(user, options);
        } catch (mlError) {
          console.warn(
            'ML model failed, using rule-based fallback:',
            mlError.message
          );
        }
      }

      // Fallback a sistema basado en reglas
      return await this.getRuleBasedEventRecommendations(user, options);
    } catch (error) {
      console.error('Error in getEventRecommendations:', error);
      return [];
    }
  }

  async getRuleBasedEventRecommendations(user, options) {
    const { location, radius = 25, limit = 10 } = options;

    // Construir query de eventos
    const query = {
      status: 'published',
      startDate: { $gte: new Date() },
      isPrivate: false,
    };

    // Filtro geográfico
    if (location || user.location?.coordinates) {
      const coords = location
        ? [location.lng, location.lat]
        : user.location.coordinates;
      query.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: coords },
          $maxDistance: radius * 1000,
        },
      };
    }

    // Obtener eventos base
    const events = await Event.find(query)
      .populate('organizer', 'firstName lastName avatar')
      .populate('tribe', 'name avatar')
      .limit(limit * 2) // Obtener más para filtrar
      .sort({ createdAt: -1 });

    // Sistema de scoring basado en reglas
    const scoredEvents = events.map(event => {
      let score = 0;
      const reasons = [];

      // Score por intereses del usuario
      const userInterests = user.interests || [];
      const eventCategories = event.categories || [];
      const interestMatch = eventCategories.filter(cat =>
        userInterests.includes(cat)
      ).length;

      if (interestMatch > 0) {
        score += interestMatch * 20;
        reasons.push(`Coincide con ${interestMatch} de tus intereses`);
      }

      // Score por popularidad
      const attendeesCount = event.attendees?.length || 0;
      if (attendeesCount > 0) {
        score += Math.min(attendeesCount / 10, 15);
        if (attendeesCount > 20) {
          reasons.push('Evento popular');
        }
      }

      // Score por novedad
      const daysSinceCreated =
        (Date.now() - event.createdAt) / (1000 * 60 * 60 * 24);
      if (daysSinceCreated < 3) {
        score += 10;
        reasons.push('Evento reciente');
      }

      // Score por tiempo hasta el evento
      const daysUntilEvent =
        (event.startDate - Date.now()) / (1000 * 60 * 60 * 24);
      if (daysUntilEvent >= 1 && daysUntilEvent <= 14) {
        score += 15;
        reasons.push('Fecha ideal para planear');
      }

      // Score por rating del organizador
      const organizerRating = event.organizer?.stats?.averageRating || 0;
      if (organizerRating > 4) {
        score += 10;
        reasons.push('Organizador con alta calificación');
      }

      // Score por horario preferido del usuario
      const eventHour = new Date(event.startDate).getHours();
      const userPreferredTimes = user.preferences?.preferredEventTimes || [];
      if (userPreferredTimes.includes(this.getTimeSlot(eventHour))) {
        score += 8;
        reasons.push('En tu horario preferido');
      }

      // Penalizar eventos muy caros si el usuario tiene preferencia de presupuesto
      const userBudget = user.preferences?.maxEventPrice;
      if (userBudget && event.price > userBudget) {
        score -= 20;
        reasons.push('Por encima de tu presupuesto preferido');
      }

      return {
        ...event.toObject(),
        recommendationScore: Math.max(score, 0),
        recommendationReasons: reasons,
        recommendationType: 'rule_based',
        confidence: this.calculateConfidence(score, reasons.length),
      };
    });

    // Ordenar por score y aplicar diversidad
    const finalRecommendations = this.applyDiversityFilter(
      scoredEvents.sort(
        (a, b) => b.recommendationScore - a.recommendationScore
      ),
      limit,
      'categories'
    );

    return finalRecommendations.slice(0, limit);
  }

  // ==========================================
  // RECOMENDACIONES DE TRIBUS
  // ==========================================

  async getTribeRecommendations(user, options = {}) {
    const { limit = 5 } = options;

    try {
      const userInterests = user.interests || [];
      const userLocation = user.location?.coordinates;

      // Query para tribus
      const query = {
        isPrivate: false,
        isActive: true,
      };

      if (userLocation) {
        query.location = {
          $near: {
            $geometry: { type: 'Point', coordinates: userLocation },
            $maxDistance: 50000, // 50km para tribus
          },
        };
      }

      const tribes = await Tribe.find(query)
        .populate('creator', 'firstName lastName avatar')
        .limit(limit * 2);

      const scoredTribes = tribes.map(tribe => {
        let score = 0;
        const reasons = [];

        // Score por intereses
        const tribeInterests = tribe.interests || [];
        const interestMatch = tribeInterests.filter(interest =>
          userInterests.includes(interest)
        ).length;

        if (interestMatch > 0) {
          score += interestMatch * 25;
          reasons.push(`${interestMatch} intereses en común`);
        }

        // Score por tamaño óptimo
        const memberCount = tribe.members?.length || 0;
        if (memberCount >= 10 && memberCount <= 500) {
          score += 15;
          reasons.push('Tamaño de comunidad ideal');
        }

        // Score por actividad reciente
        const daysSinceLastActivity =
          (Date.now() - tribe.lastActivityAt) / (1000 * 60 * 60 * 24);
        if (daysSinceLastActivity < 7) {
          score += 20;
          reasons.push('Comunidad activa');
        }

        // Score por rating
        const rating = tribe.stats?.averageRating || 0;
        if (rating > 4) {
          score += 10;
          reasons.push('Alta calificación');
        }

        return {
          ...tribe.toObject(),
          recommendationScore: score,
          recommendationReasons: reasons,
          recommendationType: 'rule_based',
          confidence: this.calculateConfidence(score, reasons.length),
        };
      });

      return scoredTribes
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, limit);
    } catch (error) {
      console.error('Error in getTribeRecommendations:', error);
      return [];
    }
  }

  // ==========================================
  // RECOMENDACIONES DE PERSONAS
  // ==========================================

  async getPeopleRecommendations(user, options = {}) {
    const { location, radius = 25, limit = 5 } = options;

    try {
      // Query para usuarios
      const query = {
        _id: { $ne: user._id },
        isActive: true,
        'privacy.profileVisibility': { $ne: 'private' },
      };

      // Filtro geográfico
      if (location || user.location?.coordinates) {
        const coords = location
          ? [location.lng, location.lat]
          : user.location.coordinates;
        query.location = {
          $near: {
            $geometry: { type: 'Point', coordinates: coords },
            $maxDistance: radius * 1000,
          },
        };
      }

      const users = await User.find(query)
        .select('firstName lastName avatar bio interests stats')
        .limit(limit * 2);

      const scoredUsers = users.map(targetUser => {
        let score = 0;
        const reasons = [];

        // Score por intereses comunes
        const userInterests = user.interests || [];
        const targetInterests = targetUser.interests || [];
        const commonInterests = userInterests.filter(interest =>
          targetInterests.includes(interest)
        );

        if (commonInterests.length > 0) {
          score += commonInterests.length * 15;
          reasons.push(`${commonInterests.length} intereses en común`);
        }

        // Score por actividad
        const eventsAttended = targetUser.stats?.eventsAttended || 0;
        if (eventsAttended > 5) {
          score += 10;
          reasons.push('Usuario activo en eventos');
        }

        // Score por rating como participante
        const userRating = targetUser.stats?.averageRating || 0;
        if (userRating > 4) {
          score += 8;
          reasons.push('Valoraciones positivas');
        }

        return {
          ...targetUser.toObject(),
          recommendationScore: score,
          recommendationReasons: reasons,
          recommendationType: 'rule_based',
          confidence: this.calculateConfidence(score, reasons.length),
          commonInterests,
        };
      });

      return scoredUsers
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, limit);
    } catch (error) {
      console.error('Error in getPeopleRecommendations:', error);
      return [];
    }
  }

  // ==========================================
  // RECOMENDACIONES MIXTAS
  // ==========================================

  async getMixedRecommendations(user, options = {}) {
    const { limit = 10 } = options;

    const eventLimit = Math.ceil(limit * 0.6); // 60% eventos
    const tribeLimit = Math.ceil(limit * 0.3); // 30% tribus
    const peopleLimit = Math.ceil(limit * 0.1); // 10% personas

    try {
      const [events, tribes, people] = await Promise.all([
        this.getEventRecommendations(user, { ...options, limit: eventLimit }),
        this.getTribeRecommendations(user, { ...options, limit: tribeLimit }),
        this.getPeopleRecommendations(user, { ...options, limit: peopleLimit }),
      ]);

      // Combinar y mezclar
      const mixed = [
        ...events.map(item => ({ ...item, itemType: 'event' })),
        ...tribes.map(item => ({ ...item, itemType: 'tribe' })),
        ...people.map(item => ({ ...item, itemType: 'user' })),
      ];

      // Intercalar tipos para diversidad
      return this.interleaveByType(mixed).slice(0, limit);
    } catch (error) {
      console.error('Error in getMixedRecommendations:', error);
      return [];
    }
  }

  // ==========================================
  // TRENDING CONTENT
  // ==========================================

  async getTrendingContent(options = {}) {
    const {
      userId,
      timeframe = '24h',
      location,
      limit = 10,
      category,
    } = options;

    try {
      const timeframeDays = this.parseTimeframe(timeframe);
      const since = new Date(Date.now() - timeframeDays * 24 * 60 * 60 * 1000);

      // Query para eventos trending
      const query = {
        createdAt: { $gte: since },
        status: 'published',
        isPrivate: false,
      };

      if (category) {
        query.categories = category;
      }

      if (location) {
        query.location = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [location.lng, location.lat],
            },
            $maxDistance: 50000, // 50km para trending
          },
        };
      }

      const events = await Event.find(query)
        .populate('organizer', 'firstName lastName avatar')
        .limit(limit * 2);

      // Calcular trending score
      const trendingEvents = events.map(event => {
        const daysSinceCreated =
          (Date.now() - event.createdAt) / (1000 * 60 * 60 * 24);
        const attendeesCount = event.attendees?.length || 0;
        const interactionsCount = event.stats?.interactions || 0;

        // Algoritmo de trending (similar a Reddit/HackerNews)
        const score =
          (attendeesCount + interactionsCount) /
          Math.pow(daysSinceCreated + 1, 1.5);

        return {
          ...event.toObject(),
          trendingScore: score,
          growthRate: this.calculateGrowthRate(event),
          recommendationType: 'trending',
        };
      });

      const sortedTrending = trendingEvents
        .sort((a, b) => b.trendingScore - a.trendingScore)
        .slice(0, limit);

      return {
        items: sortedTrending,
        algorithm: 'trending_score',
        totalInteractions: sortedTrending.reduce(
          (sum, item) => sum + (item.stats?.interactions || 0),
          0
        ),
        growthRate: this.calculateAverageGrowthRate(sortedTrending),
        userMatch: userId
          ? await this.calculateUserMatch(userId, sortedTrending)
          : null,
      };
    } catch (error) {
      console.error('Error in getTrendingContent:', error);
      return { items: [], algorithm: 'error_fallback' };
    }
  }

  // ==========================================
  // FEEDBACK Y APRENDIZAJE
  // ==========================================

  async recordFeedback(feedbackData) {
    try {
      // Simular registro de feedback en base de datos
      const feedback = {
        id: `feedback_${Date.now()}`,
        ...feedbackData,
        impact: this.calculateFeedbackImpact(feedbackData.action),
        processed: false,
      };

      // En un sistema real, esto se guardaría en la base de datos
      console.log('Feedback recorded:', feedback);

      // Simular próximas recomendaciones ajustadas
      const nextRecommendations =
        await this.adjustRecommendationsBasedOnFeedback(
          feedbackData.userId,
          feedbackData
        );

      return {
        id: feedback.id,
        impact: feedback.impact,
        nextRecommendations: nextRecommendations.slice(0, 3),
      };
    } catch (error) {
      console.error('Error recording feedback:', error);
      return { id: null, impact: 'minimal', nextRecommendations: [] };
    }
  }

  async updateMLModel(userId, feedbackData) {
    try {
      if (!this.useMLModel) {
        console.log('ML model updates disabled, using rule-based adjustments');
        return;
      }

      // En un sistema real, esto enviaría datos al modelo de ML
      console.log(
        `Updating ML model for user ${userId} with feedback:`,
        feedbackData
      );

      // Simular llamada a API de ML
      // const response = await fetch(`${this.MLModelEndpoint}/update`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId, feedback: feedbackData })
      // });
    } catch (error) {
      console.error('Error updating ML model:', error);
    }
  }

  // ==========================================
  // UTILIDADES
  // ==========================================

  getTimeSlot(hour) {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 24) return 'evening';
    return 'night';
  }

  calculateConfidence(score, reasonCount) {
    // Calcular confianza basada en score y número de razones
    const normalizedScore = Math.min(score / 100, 1);
    const reasonBonus = Math.min(reasonCount / 5, 1);
    return Math.round((normalizedScore * 0.7 + reasonBonus * 0.3) * 100);
  }

  applyDiversityFilter(items, limit, diversityField) {
    if (!diversityField || items.length <= limit) return items;

    const diverse = [];
    const seenValues = new Set();
    const maxPerCategory = Math.ceil(limit / 3);
    const categoryCount = {};

    for (const item of items) {
      const values = item[diversityField] || [];
      const category = values[0]; // Usar primera categoría como principal

      if (!category) {
        diverse.push(item);
        continue;
      }

      const currentCount = categoryCount[category] || 0;
      if (currentCount < maxPerCategory) {
        diverse.push(item);
        categoryCount[category] = currentCount + 1;
      }

      if (diverse.length >= limit) break;
    }

    // Completar con items restantes si no se alcanzó el límite
    if (diverse.length < limit) {
      for (const item of items) {
        if (!diverse.includes(item)) {
          diverse.push(item);
          if (diverse.length >= limit) break;
        }
      }
    }

    return diverse;
  }

  interleaveByType(items) {
    const byType = {};
    items.forEach(item => {
      if (!byType[item.itemType]) byType[item.itemType] = [];
      byType[item.itemType].push(item);
    });

    const types = Object.keys(byType);
    const result = [];
    const maxLength = Math.max(...Object.values(byType).map(arr => arr.length));

    for (let i = 0; i < maxLength; i++) {
      for (const type of types) {
        if (byType[type][i]) {
          result.push(byType[type][i]);
        }
      }
    }

    return result;
  }

  parseTimeframe(timeframe) {
    const match = timeframe.match(/(\d+)([hdw])/);
    if (!match) return 1;

    const [, num, unit] = match;
    const number = parseInt(num);

    switch (unit) {
      case 'h':
        return number / 24;
      case 'd':
        return number;
      case 'w':
        return number * 7;
      default:
        return 1;
    }
  }

  calculateGrowthRate(event) {
    // Simular cálculo de tasa de crecimiento
    const daysSinceCreated =
      (Date.now() - event.createdAt) / (1000 * 60 * 60 * 24);
    const attendeesCount = event.attendees?.length || 0;

    if (daysSinceCreated < 1) return attendeesCount * 100; // 100% growth per attendee in first day
    return (attendeesCount / daysSinceCreated) * 10; // Normalize growth rate
  }

  calculateAverageGrowthRate(items) {
    if (items.length === 0) return 0;
    const totalGrowth = items.reduce(
      (sum, item) => sum + (item.growthRate || 0),
      0
    );
    return totalGrowth / items.length;
  }

  async calculateUserMatch(userId, items) {
    try {
      const user = await User.findById(userId).select('interests preferences');
      if (!user || items.length === 0) return 0;

      const userInterests = user.interests || [];
      let totalMatch = 0;

      items.forEach(item => {
        const itemCategories = item.categories || [];
        const matches = itemCategories.filter(cat =>
          userInterests.includes(cat)
        ).length;
        totalMatch += matches / Math.max(itemCategories.length, 1);
      });

      return Math.round((totalMatch / items.length) * 100);
    } catch (error) {
      console.error('Error calculating user match:', error);
      return 0;
    }
  }

  calculateFeedbackImpact(action) {
    const impacts = {
      like: 'positive',
      dislike: 'negative',
      ignore: 'minimal',
      interact: 'high_positive',
      share: 'very_positive',
      hide: 'negative',
      report: 'very_negative',
    };
    return impacts[action] || 'minimal';
  }

  async adjustRecommendationsBasedOnFeedback(userId, feedbackData) {
    // Simular ajuste de recomendaciones basado en feedback
    try {
      const user = await User.findById(userId);
      if (!user) return [];

      // En un sistema real, esto ajustaría los algoritmos
      console.log(
        `Adjusting recommendations for user ${userId} based on ${feedbackData.action} feedback`
      );

      // Retornar recomendaciones simuladas ajustadas
      return await this.getEventRecommendations(user, { limit: 5 });
    } catch (error) {
      console.error('Error adjusting recommendations:', error);
      return [];
    }
  }

  async findSimilarItems(options) {
    const { itemId, itemType, userId, limit = 5 } = options;

    try {
      if (itemType === 'event') {
        const sourceEvent = await Event.findById(itemId);
        if (!sourceEvent) return [];

        const similarEvents = await Event.find({
          _id: { $ne: itemId },
          categories: { $in: sourceEvent.categories || [] },
          status: 'published',
          isPrivate: false,
        })
          .limit(limit * 2)
          .populate('organizer', 'firstName lastName avatar');

        return similarEvents.slice(0, limit).map(event => ({
          ...event.toObject(),
          similarityScore: this.calculateSimilarityScore(sourceEvent, event),
          similarityReasons: this.getSimilarityReasons(sourceEvent, event),
        }));
      }

      return [];
    } catch (error) {
      console.error('Error finding similar items:', error);
      return [];
    }
  }

  calculateSimilarityScore(sourceEvent, targetEvent) {
    let score = 0;

    // Similitud por categorías
    const sourceCategories = sourceEvent.categories || [];
    const targetCategories = targetEvent.categories || [];
    const commonCategories = sourceCategories.filter(cat =>
      targetCategories.includes(cat)
    );
    score += commonCategories.length * 20;

    // Similitud por ubicación
    if (
      sourceEvent.location?.coordinates &&
      targetEvent.location?.coordinates
    ) {
      const distance = this.calculateDistance(
        sourceEvent.location.coordinates,
        targetEvent.location.coordinates
      );
      if (distance < 10) score += 15; // Menos de 10km
    }

    // Similitud por precio
    const priceDiff = Math.abs(
      (sourceEvent.price || 0) - (targetEvent.price || 0)
    );
    if (priceDiff < 50) score += 10; // Diferencia menor a $50

    return Math.min(score, 100);
  }

  getSimilarityReasons(sourceEvent, targetEvent) {
    const reasons = [];

    const sourceCategories = sourceEvent.categories || [];
    const targetCategories = targetEvent.categories || [];
    const commonCategories = sourceCategories.filter(cat =>
      targetCategories.includes(cat)
    );

    if (commonCategories.length > 0) {
      reasons.push(`Misma categoría: ${commonCategories.join(', ')}`);
    }

    if (
      sourceEvent.location?.coordinates &&
      targetEvent.location?.coordinates
    ) {
      const distance = this.calculateDistance(
        sourceEvent.location.coordinates,
        targetEvent.location.coordinates
      );
      if (distance < 10) {
        reasons.push('Ubicación cercana');
      }
    }

    const priceDiff = Math.abs(
      (sourceEvent.price || 0) - (targetEvent.price || 0)
    );
    if (priceDiff < 50) {
      reasons.push('Precio similar');
    }

    return reasons;
  }

  calculateDistance(coords1, coords2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(coords2[1] - coords1[1]);
    const dLon = this.deg2rad(coords2[0] - coords1[0]);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(coords1[1])) *
        Math.cos(this.deg2rad(coords2[1])) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }
}

module.exports = new AIRecommendationService();
