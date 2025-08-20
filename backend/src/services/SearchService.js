const { Event, Tribe, User, Post } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { redis } = require('../config');

class SearchService {
  /**
   * Global search across all entities
   */
  async globalSearch(query, filters = {}, userId = null, page = 1, limit = 20) {
    try {
      const searchQuery = this.buildSearchQuery(query, filters);
      const cacheKey = `search:global:${JSON.stringify(searchQuery)}:${page}:${limit}`;
      
      // Check cache first
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Execute searches in parallel
      const [events, tribes, users, posts] = await Promise.all([
        this.searchEvents(query, filters, page, limit),
        this.searchTribes(query, filters, page, limit),
        this.searchUsers(query, filters, page, limit),
        this.searchPosts(query, filters, page, limit)
      ]);

      // Combine and rank results
      const combinedResults = this.combineAndRankResults(
        { events, tribes, users, posts },
        query,
        userId
      );

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedResults = combinedResults.slice(startIndex, endIndex);

      const results = {
        query,
        filters,
        results: paginatedResults,
        pagination: {
          page,
          limit,
          total: combinedResults.length,
          totalPages: Math.ceil(combinedResults.length / limit),
          hasNext: endIndex < combinedResults.length,
          hasPrev: page > 1
        },
        facets: await this.generateSearchFacets(query, filters),
        suggestions: await this.generateSearchSuggestions(query)
      };

      // Cache results for 5 minutes
      await redis.set(cacheKey, JSON.stringify(results), 300);

      return results;

    } catch (error) {
      throw new AppError(`Error en búsqueda global: ${error.message}`, 500);
    }
  }

  /**
   * Search events with advanced filtering
   */
  async searchEvents(query, filters = {}, page = 1, limit = 20) {
    try {
      const searchQuery = this.buildEventSearchQuery(query, filters);
      
      const events = await Event.find(searchQuery)
        .populate('host', 'username avatar rating')
        .sort(this.getEventSortCriteria(filters.sort))
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      // Calculate relevance scores
      const scoredEvents = events.map(event => ({
        ...event,
        relevanceScore: this.calculateEventRelevance(event, query, filters),
        type: 'event'
      }));

      return scoredEvents.sort((a, b) => b.relevanceScore - a.relevanceScore);

    } catch (error) {
      throw new AppError(`Error en búsqueda de eventos: ${error.message}`, 500);
    }
  }

  /**
   * Search tribes with advanced filtering
   */
  async searchTribes(query, filters = {}, page = 1, limit = 20) {
    try {
      const searchQuery = this.buildTribeSearchQuery(query, filters);
      
      const tribes = await Tribe.find(searchQuery)
        .populate('creator', 'username avatar')
        .sort(this.getTribeSortCriteria(filters.sort))
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      // Calculate relevance scores
      const scoredTribes = tribes.map(tribe => ({
        ...tribe,
        relevanceScore: this.calculateTribeRelevance(tribe, query, filters),
        type: 'tribe'
      }));

      return scoredTribes.sort((a, b) => b.relevanceScore - a.relevanceScore);

    } catch (error) {
      throw new AppError(`Error en búsqueda de tribus: ${error.message}`, 500);
    }
  }

  /**
   * Search users with advanced filtering
   */
  async searchUsers(query, filters = {}, page = 1, limit = 20) {
    try {
      const searchQuery = this.buildUserSearchQuery(query, filters);
      
      const users = await User.find(searchQuery)
        .select('username email avatar bio location interests rating eventCount tribeCount')
        .sort(this.getUserSortCriteria(filters.sort))
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      // Calculate relevance scores
      const scoredUsers = users.map(user => ({
        ...user,
        relevanceScore: this.calculateUserRelevance(user, query, filters),
        type: 'user'
      }));

      return scoredUsers.sort((a, b) => b.relevanceScore - a.relevanceScore);

    } catch (error) {
      throw new AppError(`Error en búsqueda de usuarios: ${error.message}`, 500);
    }
  }

  /**
   * Search posts with advanced filtering
   */
  async searchPosts(query, filters = {}, page = 1, limit = 20) {
    try {
      const searchQuery = this.buildPostSearchQuery(query, filters);
      
      const posts = await Post.find(searchQuery)
        .populate('author', 'username avatar')
        .populate('event', 'title')
        .populate('tribe', 'name')
        .sort(this.getPostSortCriteria(filters.sort))
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      // Calculate relevance scores
      const scoredPosts = posts.map(post => ({
        ...post,
        relevanceScore: this.calculatePostRelevance(post, query, filters),
        type: 'post'
      }));

      return scoredPosts.sort((a, b) => b.relevanceScore - a.relevanceScore);

    } catch (error) {
      throw new AppError(`Error en búsqueda de posts: ${error.message}`, 500);
    }
  }

  /**
   * Get search suggestions based on query
   */
  async getSearchSuggestions(query, type = null, limit = 10) {
    try {
      if (!query || query.length < 2) {
        return [];
      }

      const cacheKey = `search:suggestions:${query}:${type}:${limit}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const suggestions = [];

      if (!type || type === 'event') {
        const eventSuggestions = await Event.aggregate([
          { $match: { title: { $regex: query, $options: 'i' } } },
          { $group: { _id: '$title', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: limit }
        ]);
        suggestions.push(...eventSuggestions.map(s => ({ text: s._id, type: 'event', count: s.count })));
      }

      if (!type || type === 'tribe') {
        const tribeSuggestions = await Tribe.aggregate([
          { $match: { name: { $regex: query, $options: 'i' } } },
          { $group: { _id: '$name', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: limit }
        ]);
        suggestions.push(...tribeSuggestions.map(s => ({ text: s._id, type: 'tribe', count: s.count })));
      }

      if (!type || type === 'user') {
        const userSuggestions = await User.aggregate([
          { $match: { username: { $regex: query, $options: 'i' } } },
          { $group: { _id: '$username', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: limit }
        ]);
        suggestions.push(...userSuggestions.map(s => ({ text: s._id, type: 'user', count: s.count })));
      }

      if (!type || type === 'category') {
        const categorySuggestions = await Event.aggregate([
          { $match: { category: { $regex: query, $options: 'i' } } },
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: limit }
        ]);
        suggestions.push(...categorySuggestions.map(s => ({ text: s._id, type: 'category', count: s.count })));
      }

      // Sort by relevance and count
      const rankedSuggestions = suggestions
        .map(suggestion => ({
          ...suggestion,
          relevanceScore: this.calculateSuggestionRelevance(suggestion, query)
        }))
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);

      // Cache suggestions for 10 minutes
      await redis.set(cacheKey, JSON.stringify(rankedSuggestions), 600);

      return rankedSuggestions;

    } catch (error) {
      throw new AppError(`Error al obtener sugerencias: ${error.message}`, 500);
    }
  }

  /**
   * Get trending searches
   */
  async getTrendingSearches(timeRange = '7d', limit = 20) {
    try {
      const cacheKey = `search:trending:${timeRange}:${limit}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const startDate = this.getDateFromRange(timeRange);

      // Get trending searches from search logs (implement search logging first)
      // For now, return popular categories and terms
      const trendingCategories = await Event.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit / 2 }
      ]);

      const trendingTerms = await Event.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit / 2 }
      ]);

      const trending = [
        ...trendingCategories.map(item => ({ term: item._id, type: 'category', count: item.count })),
        ...trendingTerms.map(item => ({ term: item._id, type: 'tag', count: item.count }))
      ].sort((a, b) => b.count - a.count);

      // Cache trending searches for 1 hour
      await redis.set(cacheKey, JSON.stringify(trending), 3600);

      return trending;

    } catch (error) {
      throw new AppError(`Error al obtener búsquedas populares: ${error.message}`, 500);
    }
  }

  /**
   * Get search analytics for a user
   */
  async getSearchAnalytics(userId, timeRange = '30d') {
    try {
      const startDate = this.getDateFromRange(timeRange);
      
      // This would require implementing search logging
      // For now, return basic analytics
      const analytics = {
        totalSearches: 0,
        popularQueries: [],
        searchCategories: {},
        searchTrends: {},
        timeRange
      };

      return analytics;

    } catch (error) {
      throw new AppError(`Error al obtener analytics de búsqueda: ${error.message}`, 500);
    }
  }

  // Helper methods
  buildSearchQuery(query, filters) {
    const searchQuery = {};

    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ];
    }

    return searchQuery;
  }

  buildEventSearchQuery(query, filters) {
    const searchQuery = { status: 'active' };

    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ];
    }

    // Apply filters
    if (filters.category) {
      searchQuery.category = { $in: Array.isArray(filters.category) ? filters.category : [filters.category] };
    }

    if (filters.dateRange) {
      searchQuery.startDate = {
        $gte: filters.dateRange.start,
        $lte: filters.dateRange.end
      };
    }

    if (filters.location && filters.radius) {
      searchQuery.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [filters.location.lng, filters.location.lat]
          },
          $maxDistance: filters.radius * 1000
        }
      };
    }

    if (filters.priceRange) {
      searchQuery['pricing.price'] = {
        $gte: filters.priceRange.min || 0,
        $lte: filters.priceRange.max || Number.MAX_SAFE_INTEGER
      };
    }

    if (filters.isFree !== undefined) {
      if (filters.isFree) {
        searchQuery['pricing.price'] = 0;
      } else {
        searchQuery['pricing.price'] = { $gt: 0 };
      }
    }

    return searchQuery;
  }

  buildTribeSearchQuery(query, filters) {
    const searchQuery = { isPrivate: false };

    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ];
    }

    if (filters.category) {
      searchQuery.category = { $in: Array.isArray(filters.category) ? filters.category : [filters.category] };
    }

    if (filters.location && filters.radius) {
      searchQuery.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [filters.location.lng, filters.location.lat]
          },
          $maxDistance: filters.radius * 1000
        }
      };
    }

    return searchQuery;
  }

  buildUserSearchQuery(query, filters) {
    const searchQuery = { isVerified: true };

    if (query) {
      searchQuery.$or = [
        { username: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } },
        { interests: { $in: [new RegExp(query, 'i')] } }
      ];
    }

    if (filters.interests) {
      searchQuery.interests = { $in: Array.isArray(filters.interests) ? filters.interests : [filters.interests] };
    }

    if (filters.location && filters.radius) {
      searchQuery.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [filters.location.lng, filters.location.lat]
          },
          $maxDistance: filters.radius * 1000
        }
      };
    }

    return searchQuery;
  }

  buildPostSearchQuery(query, filters) {
    const searchQuery = { status: 'active' };

    if (query) {
      searchQuery.$or = [
        { content: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ];
    }

    if (filters.type) {
      searchQuery.type = filters.type;
    }

    if (filters.author) {
      searchQuery.author = filters.author;
    }

    if (filters.event) {
      searchQuery.event = filters.event;
    }

    if (filters.tribe) {
      searchQuery.tribe = filters.tribe;
    }

    return searchQuery;
  }

  getEventSortCriteria(sort) {
    switch (sort) {
      case 'date':
        return { startDate: 1 };
      case 'popularity':
        return { attendeeCount: -1, likeCount: -1 };
      case 'rating':
        return { rating: -1 };
      case 'price':
        return { 'pricing.price': 1 };
      default:
        return { startDate: 1 };
    }
  }

  getTribeSortCriteria(sort) {
    switch (sort) {
      case 'name':
        return { name: 1 };
      case 'popularity':
        return { memberCount: -1, likeCount: -1 };
      case 'recent':
        return { createdAt: -1 };
      default:
        return { memberCount: -1 };
    }
  }

  getUserSortCriteria(sort) {
    switch (sort) {
      case 'username':
        return { username: 1 };
      case 'rating':
        return { rating: -1 };
      case 'activity':
        return { eventCount: -1, tribeCount: -1 };
      default:
        return { rating: -1 };
    }
  }

  getPostSortCriteria(sort) {
    switch (sort) {
      case 'date':
        return { createdAt: -1 };
      case 'popularity':
        return { likeCount: -1, commentCount: -1 };
      case 'relevance':
        return { createdAt: -1 };
      default:
        return { createdAt: -1 };
    }
  }

  calculateEventRelevance(event, query, filters) {
    let score = 0;

    // Text relevance
    if (query) {
      if (event.title.toLowerCase().includes(query.toLowerCase())) score += 10;
      if (event.description.toLowerCase().includes(query.toLowerCase())) score += 5;
      if (event.category.toLowerCase().includes(query.toLowerCase())) score += 8;
      if (event.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))) score += 3;
    }

    // Popularity
    score += Math.min(5, event.attendeeCount / 10);
    score += Math.min(3, event.likeCount / 20);

    // Recency
    const daysUntilEvent = Math.ceil((event.startDate - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntilEvent <= 7) score += 5;
    else if (daysUntilEvent <= 30) score += 2;

    // Host rating
    if (event.host && event.host.rating) {
      score += Math.min(3, event.host.rating / 2);
    }

    return score;
  }

  calculateTribeRelevance(tribe, query, filters) {
    let score = 0;

    // Text relevance
    if (query) {
      if (tribe.name.toLowerCase().includes(query.toLowerCase())) score += 10;
      if (tribe.description.toLowerCase().includes(query.toLowerCase())) score += 5;
      if (tribe.category.toLowerCase().includes(query.toLowerCase())) score += 8;
      if (tribe.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))) score += 3;
    }

    // Popularity
    score += Math.min(5, tribe.memberCount / 10);
    score += Math.min(3, tribe.likeCount / 20);

    // Activity
    score += Math.min(2, tribe.postCount / 50);

    return score;
  }

  calculateUserRelevance(user, query, filters) {
    let score = 0;

    // Text relevance
    if (query) {
      if (user.username.toLowerCase().includes(query.toLowerCase())) score += 10;
      if (user.bio && user.bio.toLowerCase().includes(query.toLowerCase())) score += 5;
      if (user.interests.some(interest => interest.toLowerCase().includes(query.toLowerCase()))) score += 3;
    }

    // Rating
    if (user.rating) {
      score += Math.min(5, user.rating / 2);
    }

    // Activity
    score += Math.min(3, user.eventCount / 10);
    score += Math.min(2, user.tribeCount / 5);

    return score;
  }

  calculatePostRelevance(post, query, filters) {
    let score = 0;

    // Text relevance
    if (query) {
      if (post.content.toLowerCase().includes(query.toLowerCase())) score += 10;
      if (post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))) score += 3;
    }

    // Engagement
    score += Math.min(5, post.likeCount / 10);
    score += Math.min(3, post.commentCount / 5);

    // Recency
    const hoursAgo = (new Date() - post.createdAt) / (1000 * 60 * 60);
    if (hoursAgo <= 24) score += 5;
    else if (hoursAgo <= 168) score += 2; // 1 week

    return score;
  }

  calculateSuggestionRelevance(suggestion, query) {
    let score = 0;

    // Exact match
    if (suggestion.text.toLowerCase() === query.toLowerCase()) score += 10;
    // Starts with
    else if (suggestion.text.toLowerCase().startsWith(query.toLowerCase())) score += 8;
    // Contains
    else if (suggestion.text.toLowerCase().includes(query.toLowerCase())) score += 5;

    // Popularity
    score += Math.min(3, suggestion.count / 10);

    return score;
  }

  combineAndRankResults(results, query, userId) {
    const allResults = [
      ...results.events,
      ...results.tribes,
      ...results.users,
      ...results.posts
    ];

    // Sort by relevance score
    return allResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  async generateSearchFacets(query, filters) {
    // Implementation for generating search facets
    // This would provide filtering options based on search results
    return {};
  }

  async generateSearchSuggestions(query) {
    // Implementation for generating search suggestions
    // This would provide related search terms
    return [];
  }

  getDateFromRange(timeRange) {
    const now = new Date();
    switch (timeRange) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '1y':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }
}

module.exports = new SearchService();