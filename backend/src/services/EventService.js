const { redis } = require('../config');
const { AppError } = require('../middleware/errorHandler');
const { Event, User, Post } = require('../models');

class EventService {
  /**
   * Get personalized event recommendations for a user
   * @param {string} userId - User ID
   * @param {number} limit - Number of recommendations
   * @returns {array} Event recommendations
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
   * @param {string} eventId - Event ID
   * @param {string} hostId - Host ID
   * @returns {object} Event analytics
   */
  async getEventAnalytics(eventId, hostId) {
    try {
      // Verify event ownership
      const event = await Event.findOne({ _id: eventId, host: hostId });
      if (!event) {
        throw new AppError('Evento no encontrado o no autorizado', 404);
      }

      // Get analytics data
      const analytics = {
        totalAttendees: event.attendees.length,
        totalLikes: event.likes.length,
        totalComments: event.comments.length,
        totalShares: event.shares || 0,
        engagementRate: this.calculateEngagementRate(event),
        attendeeGrowth: await this.getAttendeeGrowth(eventId),
        demographicData: await this.getDemographicData(eventId),
        revenueData: await this.getRevenueData(eventId),
        socialMediaMetrics: await this.getSocialMediaMetrics(eventId),
      };

      return analytics;
    } catch (error) {
      throw new AppError(
        `Error al obtener analytics del evento: ${error.message}`,
        500
      );
    }
  }

  /**
   * Get universal tribes for a user
   * @param {string} userId - User ID
   * @returns {array} Universal tribes
   */
  async getUniversalTribes(userId) {
    try {
      const user = await User.findById(userId).select('interests location');
      if (!user) {
        throw new AppError('Usuario no encontrado', 404);
      }

      const query = {
        isPrivate: false,
        status: 'active',
      };

      // Add location-based filtering if user has location
      if (user.location) {
        query.location = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [
                user.location.coordinates.lng,
                user.location.coordinates.lat,
              ],
            },
            $maxDistance: 100000, // 100km radius
          },
        };
      }

      const tribes = await Event.find(query)
        .populate('creator', 'username avatar rating')
        .sort({ memberCount: -1, rating: -1 })
        .limit(20);

      return tribes;
    } catch (error) {
      throw new AppError(
        `Error al obtener tribus universales: ${error.message}`,
        500
      );
    }
  }

  /**
   * Get pulse events (nearby events)
   * @param {string} userId - User ID
   * @param {number} latitude - User latitude
   * @param {number} longitude - User longitude
   * @param {number} radius - Search radius in km
   * @returns {array} Pulse events
   */
  async getPulseEvents(userId, latitude, longitude, radius = 10) {
    try {
      const query = {
        status: 'active',
        startDate: { $gte: new Date() },
        isPrivate: false,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
            $maxDistance: radius * 1000, // Convert to meters
          },
        },
      };

      const events = await Event.find(query)
        .populate('host', 'username avatar rating')
        .sort({ startDate: 1, attendeeCount: -1 })
        .limit(50);

      return events;
    } catch (error) {
      throw new AppError(
        `Error al obtener eventos del pulso: ${error.message}`,
        500
      );
    }
  }

  /**
   * Get user tribes
   * @param {string} userId - User ID
   * @returns {array} User tribes
   */
  async getUserTribes(userId) {
    try {
      const user = await User.findById(userId).populate('tribes');
      return user.tribes || [];
    } catch (error) {
      throw new AppError(
        `Error al obtener tribus del usuario: ${error.message}`,
        500
      );
    }
  }

  /**
   * Create a new event
   * @param {object} eventData - Event data
   * @returns {object} Created event
   */
  async createEvent(eventData) {
    try {
      const event = new Event(eventData);
      await event.save();
      return event;
    } catch (error) {
      throw new AppError(`Error al crear evento: ${error.message}`, 500);
    }
  }

  /**
   * Save a message
   * @param {object} messageData - Message data
   * @returns {object} Saved message
   */
  async saveMessage(messageData) {
    try {
      // This would typically save to a Chat model
      // For now, return the message data
      return {
        ...messageData,
        id: Date.now().toString(),
        timestamp: new Date(),
      };
    } catch (error) {
      throw new AppError(`Error al guardar mensaje: ${error.message}`, 500);
    }
  }

  /**
   * Update user location
   * @param {string} userId - User ID
   * @param {object} locationData - Location data
   * @returns {object} Updated user
   */
  async updateUserLocation(userId, locationData) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { location: locationData },
        { new: true }
      );
      return user;
    } catch (error) {
      throw new AppError(
        `Error al actualizar ubicación: ${error.message}`,
        500
      );
    }
  }

  /**
   * Get nearby users
   * @param {object} locationData - Location data
   * @returns {array} Nearby users
   */
  async getNearbyUsers(locationData) {
    try {
      const { latitude, longitude, radius = 5 } = locationData;
      const users = await User.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
            $maxDistance: radius * 1000, // Convert to meters
          },
        },
      })
        .select('username avatar location')
        .limit(20);

      return users;
    } catch (error) {
      throw new AppError(
        `Error al obtener usuarios cercanos: ${error.message}`,
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
