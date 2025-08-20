const { redis } = require('../config');
const { AppError } = require('../middleware/errorHandler');
const { Event, User, Review, Post } = require('../models');

class EventService {
  /**
   * Get personalized event recommendations for a user
   * @param userId
   * @param limit
   */
  async getPersonalizedRecommendations(userId, limit = 10) {
    try {
      const user = await User.findById(userId).select(
        'interests location following'
      );
      if (!user) {
        throw new AppError('Usuario no encontrado', 404);
      }

      // Get user preferences and location
      const userInterests = user.interests || [];
      const userLocation = user.location;
      const following = user.following || [];

      // Build recommendation query
      const query = {
        status: 'active',
        startDate: { $gte: new Date() },
        isPrivate: false,
      };

      // Add location-based filtering if user has location
      if (userLocation) {
        query.location = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [
                userLocation.coordinates.lng,
                userLocation.coordinates.lat,
              ],
            },
            $maxDistance: 50000, // 50km radius
          },
        };
      }

      // Get events with user interests
      const interestEvents = await Event.find({
        ...query,
        category: { $in: userInterests },
        attendees: { $nin: [userId] },
      })
        .populate('host', 'username avatar rating')
        .sort({ startDate: 1, attendeeCount: -1 })
        .limit(limit);

      // Get events from followed users
      const followedEvents = await Event.find({
        ...query,
        host: { $in: following },
        attendees: { $nin: [userId] },
      })
        .populate('host', 'username avatar rating')
        .sort({ startDate: 1 })
        .limit(limit);

      // Get trending events
      const trendingEvents = await Event.find({
        ...query,
        attendees: { $nin: [userId] },
      })
        .sort({ attendeeCount: -1, likeCount: -1 })
        .limit(limit);

      // Combine and rank recommendations
      const recommendations = this.rankRecommendations(
        [...interestEvents, ...followedEvents, ...trendingEvents],
        userInterests,
        userLocation
      );

      // Remove duplicates and limit results
      const uniqueRecommendations = this.removeDuplicates(recommendations);
      return uniqueRecommendations.slice(0, limit);
    } catch (error) {
      throw new AppError(
        `Error al obtener recomendaciones: ${error.message}`,
        500
      );
    }
  }

  /**
   * Get event analytics and insights
   * @param eventId
   * @param hostId
   */
  async getEventAnalytics(eventId, hostId) {
    try {
      const event = await Event.findById(eventId);
      if (!event) {
        throw new AppError('Evento no encontrado', 404);
      }

      if (event.host.toString() !== hostId) {
        throw new AppError(
          'No autorizado para ver analytics de este evento',
          403
        );
      }

      // Get attendee demographics
      const attendees = await User.find({
        _id: { $in: event.attendees },
      }).select('age gender location interests');

      // Get engagement metrics
      const posts = await Post.find({
        event: eventId,
        createdAt: { $gte: event.createdAt },
      });

      // Calculate analytics
      const analytics = {
        totalAttendees: event.attendees.length,
        capacityUtilization: (event.attendees.length / event.capacity) * 100,
        engagement: {
          posts: posts.length,
          likes: event.likeCount,
          shares: event.shareCount,
          comments: posts.reduce((sum, post) => sum + post.commentCount, 0),
        },
        demographics: this.calculateDemographics(attendees),
        growth: await this.calculateEventGrowth(eventId),
        revenue: await this.calculateEventRevenue(eventId),
        retention: await this.calculateRetentionRate(eventId),
      };

      // Cache analytics for 1 hour
      await redis.set(
        `event:analytics:${eventId}`,
        JSON.stringify(analytics),
        3600
      );

      return analytics;
    } catch (error) {
      throw new AppError(`Error al obtener analytics: ${error.message}`, 500);
    }
  }

  /**
   * Process event creation with validation and setup
   * @param eventData
   * @param hostId
   */
  async processEventCreation(eventData, hostId) {
    try {
      // Validate event data
      const validationResult = await this.validateEventData(eventData);
      if (!validationResult.isValid) {
        throw new AppError(
          `Datos del evento inválidos: ${validationResult.errors.join(', ')}`,
          400
        );
      }

      // Check host capacity and limits
      const hostEventCount = await Event.countDocuments({
        host: hostId,
        startDate: { $gte: new Date() },
      });

      if (hostEventCount >= 10) {
        throw new AppError(
          'Has alcanzado el límite de eventos activos (10)',
          400
        );
      }

      // Check for duplicate events
      const duplicateCheck = await this.checkDuplicateEvent(eventData, hostId);
      if (duplicateCheck.isDuplicate) {
        throw new AppError('Ya tienes un evento similar programado', 400);
      }

      // Create event
      const event = new Event({
        ...eventData,
        host: hostId,
        status: 'active',
      });

      await event.save();

      // Send notifications to relevant users
      await this.notifyRelevantUsers(event);

      // Update host statistics
      await this.updateHostStats(hostId);

      return event;
    } catch (error) {
      throw new AppError(`Error al crear evento: ${error.message}`, 500);
    }
  }

  /**
   * Handle event cancellation with refunds and notifications
   * @param eventId
   * @param hostId
   * @param reason
   */
  async cancelEvent(eventId, hostId, reason) {
    try {
      const event = await Event.findById(eventId);
      if (!event) {
        throw new AppError('Evento no encontrado', 404);
      }

      if (event.host.toString() !== hostId) {
        throw new AppError('No autorizado para cancelar este evento', 403);
      }

      if (event.status === 'cancelled') {
        throw new AppError('El evento ya está cancelado', 400);
      }

      // Process refunds if applicable
      if (event.pricing && event.pricing.price > 0) {
        await this.processRefunds(event);
      }

      // Update event status
      event.status = 'cancelled';
      event.cancellationReason = reason;
      event.cancelledAt = new Date();
      await event.save();

      // Notify attendees
      await this.notifyEventCancellation(event);

      // Update host statistics
      await this.updateHostStats(hostId);

      // Process any related posts or content
      await this.handleEventCancellationContent(event);

      return event;
    } catch (error) {
      throw new AppError(`Error al cancelar evento: ${error.message}`, 500);
    }
  }

  /**
   * Get nearby events with intelligent filtering
   * @param location
   * @param radius
   * @param filters
   */
  async getNearbyEvents(location, radius = 50, filters = {}) {
    try {
      const query = {
        status: 'active',
        startDate: { $gte: new Date() },
        isPrivate: false,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [location.lng, location.lat],
            },
            $maxDistance: radius * 1000, // Convert km to meters
          },
        },
      };

      // Apply additional filters
      if (filters.category) {
        query.category = {
          $in: Array.isArray(filters.category)
            ? filters.category
            : [filters.category],
        };
      }

      if (filters.dateRange) {
        query.startDate = {
          $gte: filters.dateRange.start,
          $lte: filters.dateRange.end,
        };
      }

      if (filters.priceRange) {
        query['pricing.price'] = {
          $gte: filters.priceRange.min || 0,
          $lte: filters.priceRange.max || Number.MAX_SAFE_INTEGER,
        };
      }

      const events = await Event.find(query)
        .populate('host', 'username avatar rating')
        .sort({ startDate: 1, attendeeCount: -1 })
        .limit(filters.limit || 50);

      return events;
    } catch (error) {
      throw new AppError(
        `Error al obtener eventos cercanos: ${error.message}`,
        500
      );
    }
  }

  // Helper methods
  rankRecommendations(events, userInterests, userLocation) {
    return events
      .map(event => {
        let score = 0;

        // Interest match
        if (userInterests.includes(event.category)) {
          score += 10;
        }

        // Location proximity
        if (userLocation && event.location) {
          const distance = this.calculateDistance(
            userLocation.coordinates.lat,
            userLocation.coordinates.lng,
            event.location.coordinates.lat,
            event.location.coordinates.lng
          );
          score += Math.max(0, 10 - distance / 10);
        }

        // Popularity
        score += Math.min(5, event.attendeeCount / 10);
        score += Math.min(3, event.likeCount / 20);

        // Time urgency
        const daysUntilEvent = Math.ceil(
          (event.startDate - new Date()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilEvent <= 7) score += 5;
        else if (daysUntilEvent <= 30) score += 2;

        return { ...event.toObject(), recommendationScore: score };
      })
      .sort((a, b) => b.recommendationScore - a.recommendationScore);
  }

  removeDuplicates(events) {
    const seen = new Set();
    return events.filter(event => {
      const duplicate = seen.has(event._id.toString());
      seen.add(event._id.toString());
      return !duplicate;
    });
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  calculateDemographics(attendees) {
    const demographics = {
      ageGroups: { '18-25': 0, '26-35': 0, '36-45': 0, '46+': 0 },
      gender: { male: 0, female: 0, other: 0 },
      topInterests: {},
    };

    attendees.forEach(attendee => {
      // Age groups
      if (attendee.age) {
        if (attendee.age <= 25) demographics.ageGroups['18-25']++;
        else if (attendee.age <= 35) demographics.ageGroups['26-35']++;
        else if (attendee.age <= 45) demographics.ageGroups['36-45']++;
        else demographics.ageGroups['46+']++;
      }

      // Gender
      if (attendee.gender) {
        demographics.gender[attendee.gender] =
          (demographics.gender[attendee.gender] || 0) + 1;
      }

      // Interests
      if (attendee.interests) {
        attendee.interests.forEach(interest => {
          demographics.topInterests[interest] =
            (demographics.topInterests[interest] || 0) + 1;
        });
      }
    });

    // Sort top interests
    demographics.topInterests = Object.entries(demographics.topInterests)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

    return demographics;
  }

  async calculateEventGrowth(eventId) {
    // Implementation for event growth calculation
    return { growthRate: 0, trend: 'stable' };
  }

  async calculateEventRevenue(eventId) {
    // Implementation for revenue calculation
    return { totalRevenue: 0, averageTicketPrice: 0 };
  }

  async calculateRetentionRate(eventId) {
    // Implementation for retention calculation
    return { retentionRate: 0, repeatAttendees: 0 };
  }

  async validateEventData(eventData) {
    const errors = [];

    if (!eventData.title || eventData.title.length < 3) {
      errors.push('El título debe tener al menos 3 caracteres');
    }

    if (!eventData.startDate || new Date(eventData.startDate) <= new Date()) {
      errors.push('La fecha de inicio debe ser futura');
    }

    if (eventData.capacity && eventData.capacity < 1) {
      errors.push('La capacidad debe ser mayor a 0');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async checkDuplicateEvent(eventData, hostId) {
    const duplicate = await Event.findOne({
      host: hostId,
      title: eventData.title,
      startDate: {
        $gte: new Date(eventData.startDate.getTime() - 24 * 60 * 60 * 1000),
        $lte: new Date(eventData.startDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    return { isDuplicate: !!duplicate, duplicateEvent: duplicate };
  }

  async notifyRelevantUsers(event) {
    // Implementation for user notifications
    // This would integrate with the notification service
  }

  async updateHostStats(hostId) {
    // Implementation for host statistics update
    // This would update user statistics
  }

  async processRefunds(event) {
    // Implementation for refund processing
    // This would integrate with payment services
  }

  async notifyEventCancellation(event) {
    // Implementation for cancellation notifications
    // This would integrate with the notification service
  }

  async handleEventCancellationContent(event) {
    // Implementation for content handling
    // This would update related posts and content
  }
}

module.exports = new EventService();
