const { redis } = require('../config');
const { AppError } = require('../middleware/errorHandler');
const { Event, Tribe, User, Post } = require('../models');

/**
 * Servicio de búsqueda avanzada para EventConnect
 */
class SearchService {
  /**
   * Global search across all entities
   * @param {string} query - Search query
   * @param {object} filters - Search filters
   * @param {string} userId - User ID
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   * @returns {object} Search results
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
        this.searchPosts(query, filters, page, limit),
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
          hasPrev: page > 1,
        },
        facets: await this.generateSearchFacets(query, filters),
        suggestions: await this.generateSearchSuggestions(query),
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
   * @param {string} query - Search query
   * @param {object} filters - Search filters
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   * @returns {array} Search results
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
        type: 'event',
      }));

      return scoredEvents.sort((a, b) => b.relevanceScore - a.relevanceScore);
    } catch (error) {
      throw new AppError(`Error en búsqueda de eventos: ${error.message}`, 500);
    }
  }

  /**
   * Search tribes with advanced filtering
   * @param {string} query - Search query
   * @param {object} filters - Search filters
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   * @returns {array} Search results
   */
  async searchTribes(query, filters = {}, page = 1, limit = 20) {
    try {
      const searchQuery = this.buildTribeSearchQuery(query, filters);

      const tribes = await Tribe.find(searchQuery)
        .populate('creator', 'username avatar rating')
        .sort(this.getTribeSortCriteria(filters.sort))
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      // Calculate relevance scores
      const scoredTribes = tribes.map(tribe => ({
        ...tribe,
        relevanceScore: this.calculateTribeRelevance(tribe, query, filters),
        type: 'tribe',
      }));

      return scoredTribes.sort((a, b) => b.relevanceScore - a.relevanceScore);
    } catch (error) {
      throw new AppError(`Error en búsqueda de tribus: ${error.message}`, 500);
    }
  }

  /**
   * Search users with advanced filtering
   * @param {string} query - Search query
   * @param {object} filters - Search filters
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   * @returns {array} Search results
   */
  async searchUsers(query, filters = {}, page = 1, limit = 20) {
    try {
      const searchQuery = this.buildUserSearchQuery(query, filters);

      const users = await User.find(searchQuery)
        .select(
          'username email avatar bio location interests rating eventCount tribeCount'
        )
        .sort(this.getUserSortCriteria(filters.sort))
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      // Calculate relevance scores
      const scoredUsers = users.map(user => ({
        ...user,
        relevanceScore: this.calculateUserRelevance(user, query, filters),
        type: 'user',
      }));

      return scoredUsers.sort((a, b) => b.relevanceScore - a.relevanceScore);
    } catch (error) {
      throw new AppError(
        `Error en búsqueda de usuarios: ${error.message}`,
        500
      );
    }
  }

  /**
   * Search posts with advanced filtering
   * @param {string} query - Search query
   * @param {object} filters - Search filters
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   * @returns {array} Search results
   */
  async searchPosts(query, filters = {}, page = 1, limit = 20) {
    try {
      const searchQuery = this.buildPostSearchQuery(query, filters);

      const posts = await Post.find(searchQuery)
        .populate('author', 'username avatar')
        .populate('tribe', 'name avatar')
        .sort(this.getPostSortCriteria(filters.sort))
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      // Calculate relevance scores
      const scoredPosts = posts.map(post => ({
        ...post,
        relevanceScore: this.calculatePostRelevance(post, query, filters),
        type: 'post',
      }));

      return scoredPosts.sort((a, b) => b.relevanceScore - a.relevanceScore);
    } catch (error) {
      throw new AppError(`Error en búsqueda de posts: ${error.message}`, 500);
    }
  }

  /**
   * Generate search suggestions
   * @param {string} query - Search query
   * @param {string} type - Suggestion type
   * @param {number} limit - Number of suggestions
   * @returns {array} Search suggestions
   */
  async generateSearchSuggestions(query, type = 'all', limit = 10) {
    try {
      const suggestions = [];

      if (type === 'all' || type === 'event') {
        const eventSuggestions = await Event.aggregate([
          { $match: { name: { $regex: query, $options: 'i' } } },
          { $group: { _id: '$name', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: limit },
        ]);

        suggestions.push(
          ...eventSuggestions.map(s => ({
            text: s._id,
            type: 'event',
            count: s.count,
          }))
        );
      }

      if (type === 'all' || type === 'tribe') {
        const tribeSuggestions = await Tribe.aggregate([
          { $match: { name: { $regex: query, $options: 'i' } } },
          { $group: { _id: '$name', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: limit },
        ]);

        suggestions.push(
          ...tribeSuggestions.map(s => ({
            text: s._id,
            type: 'tribe',
            count: s.count,
          }))
        );
      }

      if (type === 'all' || type === 'user') {
        const userSuggestions = await User.aggregate([
          { $match: { username: { $regex: query, $options: 'i' } } },
          { $group: { _id: '$username', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: limit },
        ]);

        suggestions.push(
          ...userSuggestions.map(s => ({
            text: s._id,
            type: 'user',
            count: s.count,
          }))
        );
      }

      if (type === 'all' || type === 'category') {
        const categorySuggestions = await Event.aggregate([
          { $match: { category: { $regex: query, $options: 'i' } } },
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: limit },
        ]);

        suggestions.push(
          ...categorySuggestions.map(s => ({
            text: s._id,
            type: 'category',
            count: s.count,
          }))
        );
      }

      return suggestions.sort((a, b) => b.count - a.count);
    } catch (error) {
      throw new AppError(
        `Error al obtener búsquedas populares: ${error.message}`,
        500
      );
    }
  }

  /**
   * Get search analytics for a user
   * @param {string} userId - User ID
   * @param {string} timeRange - Time range for analytics
   * @returns {object} Search analytics
   */
  async getSearchAnalytics(userId, timeRange = '7d') {
    try {
      const analytics = await redis.get(
        `search:analytics:${userId}:${timeRange}`
      );

      if (analytics) {
        return JSON.parse(analytics);
      }

      // Calculate analytics based on time range
      const results = {
        totalSearches: 0,
        popularQueries: [],
        searchTrends: [],
        timeRange,
      };

      // Cache analytics for 1 hour
      await redis.set(
        `search:analytics:${userId}:${timeRange}`,
        JSON.stringify(results),
        3600
      );

      return results;
    } catch (error) {
      throw new AppError(
        `Error al obtener analytics de búsqueda: ${error.message}`,
        500
      );
    }
  }

  /**
   * Build search query for events
   * @param {string} query - Search query
   * @param {object} filters - Search filters
   * @returns {object} MongoDB query
   */
  buildEventSearchQuery(query, filters) {
    const searchQuery = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } },
      ],
    };

    if (filters.category) {
      searchQuery.category = {
        $in: Array.isArray(filters.category)
          ? filters.category
          : [filters.category],
      };
    }

    if (filters.location) {
      searchQuery.location = { $regex: filters.location, $options: 'i' };
    }

    if (filters.date) {
      searchQuery.startDate = { $gte: new Date(filters.date) };
    }

    if (filters.price) {
      searchQuery.price = { $lte: parseFloat(filters.price) };
    }

    return searchQuery;
  }

  /**
   * Build search query for tribes
   * @param {string} query - Search query
   * @param {object} filters - Search filters
   * @returns {object} MongoDB query
   */
  buildTribeSearchQuery(query, filters) {
    const searchQuery = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } },
      ],
    };

    if (filters.category) {
      searchQuery.category = {
        $in: Array.isArray(filters.category)
          ? filters.category
          : [filters.category],
      };
    }

    if (filters.location) {
      searchQuery.location = { $regex: filters.location, $options: 'i' };
    }

    if (filters.memberCount) {
      searchQuery.memberCount = { $gte: parseInt(filters.memberCount) };
    }

    return searchQuery;
  }

  /**
   * Build search query for users
   * @param {string} query - Search query
   * @param {object} filters - Search filters
   * @returns {object} MongoDB query
   */
  buildUserSearchQuery(query, filters) {
    const searchQuery = {
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
        { interests: { $regex: query, $options: 'i' } },
      ],
    };

    if (filters.location) {
      searchQuery.location = { $regex: filters.location, $options: 'i' };
    }

    if (filters.interests) {
      searchQuery.interests = {
        $in: Array.isArray(filters.interests)
          ? filters.interests
          : [filters.interests],
      };
    }

    return searchQuery;
  }

  /**
   * Build search query for posts
   * @param {string} query - Search query
   * @param {object} filters - Search filters
   * @returns {object} MongoDB query
   */
  buildPostSearchQuery(query, filters) {
    const searchQuery = {
      $or: [
        { content: { $regex: query, $options: 'i' } },
        { title: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } },
      ],
    };

    if (filters.tribe) {
      searchQuery.tribe = filters.tribe;
    }

    if (filters.author) {
      searchQuery.author = filters.author;
    }

    if (filters.date) {
      searchQuery.createdAt = { $gte: new Date(filters.date) };
    }

    return searchQuery;
  }

  /**
   * Build general search query
   * @param {string} query - Search query
   * @param {object} filters - Search filters
   * @returns {object} Search query
   */
  buildSearchQuery(query, filters) {
    return {
      query,
      filters,
      timestamp: new Date(),
    };
  }

  /**
   * Combine and rank search results
   * @param {object} results - Search results
   * @param {string} query - Search query
   * @param {string} userId - User ID
   * @returns {array} Combined and ranked results
   */
  combineAndRankResults(results, query, userId) {
    const allResults = [
      ...results.events,
      ...results.tribes,
      ...results.users,
      ...results.posts,
    ];

    // Sort by relevance score
    return allResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Calculate event relevance score
   * @param {object} event - Event object
   * @param {string} query - Search query
   * @param {object} filters - Search filters
   * @returns {number} Relevance score
   */
  calculateEventRelevance(event, query, filters) {
    let score = 0;

    // Text relevance
    if (event.name.toLowerCase().includes(query.toLowerCase())) {
      score += 10;
    }
    if (event.description.toLowerCase().includes(query.toLowerCase())) {
      score += 5;
    }
    if (
      event.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    ) {
      score += 3;
    }

    // Date relevance (closer events get higher scores)
    if (event.startDate) {
      const daysUntilEvent =
        (event.startDate - new Date()) / (1000 * 60 * 60 * 24);
      if (daysUntilEvent > 0) {
        score += Math.max(0, 10 - daysUntilEvent);
      }
    }

    // Popularity
    score += (event.attendeeCount || 0) * 0.1;
    score += (event.rating || 0) * 0.5;

    return score;
  }

  /**
   * Calculate tribe relevance score
   * @param {object} tribe - Tribe object
   * @param {string} query - Search query
   * @param {object} filters - Search filters
   * @returns {number} Relevance score
   */
  calculateTribeRelevance(tribe, query, filters) {
    let score = 0;

    // Text relevance
    if (tribe.name.toLowerCase().includes(query.toLowerCase())) {
      score += 10;
    }
    if (tribe.description.toLowerCase().includes(query.toLowerCase())) {
      score += 5;
    }
    if (
      tribe.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    ) {
      score += 3;
    }

    // Popularity
    score += (tribe.memberCount || 0) * 0.1;
    score += (tribe.rating || 0) * 0.5;

    return score;
  }

  /**
   * Calculate user relevance score
   * @param {object} user - User object
   * @param {string} query - Search query
   * @param {object} filters - Search filters
   * @returns {number} Relevance score
   */
  calculateUserRelevance(user, query, filters) {
    let score = 0;

    // Text relevance
    if (user.username.toLowerCase().includes(query.toLowerCase())) {
      score += 10;
    }
    if (user.bio && user.bio.toLowerCase().includes(query.toLowerCase())) {
      score += 5;
    }
    if (
      user.interests &&
      user.interests.some(interest =>
        interest.toLowerCase().includes(query.toLowerCase())
      )
    ) {
      score += 3;
    }

    // Activity
    score += (user.eventCount || 0) * 0.1;
    score += (user.tribeCount || 0) * 0.1;
    score += (user.rating || 0) * 0.5;

    return score;
  }

  /**
   * Calculate post relevance score
   * @param {object} post - Post object
   * @param {string} query - Search query
   * @param {object} filters - Search filters
   * @returns {number} Relevance score
   */
  calculatePostRelevance(post, query, filters) {
    let score = 0;

    // Text relevance
    if (post.content.toLowerCase().includes(query.toLowerCase())) {
      score += 8;
    }
    if (post.title && post.title.toLowerCase().includes(query.toLowerCase())) {
      score += 5;
    }
    if (
      post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    ) {
      score += 3;
    }

    // Engagement
    score += (post.likes || 0) * 0.1;
    score += (post.comments || 0) * 0.2;
    score += (post.shares || 0) * 0.3;

    return score;
  }

  /**
   * Get sort criteria for events
   * @param {string} sort - Sort type
   * @returns {object} Sort criteria
   */
  getEventSortCriteria(sort) {
    switch (sort) {
      case 'date':
        return { startDate: 1 };
      case 'popularity':
        return { attendeeCount: -1 };
      case 'rating':
        return { rating: -1 };
      default:
        return { createdAt: -1 };
    }
  }

  /**
   * Get sort criteria for tribes
   * @param {string} sort - Sort type
   * @returns {object} Sort criteria
   */
  getTribeSortCriteria(sort) {
    switch (sort) {
      case 'members':
        return { memberCount: -1 };
      case 'rating':
        return { rating: -1 };
      default:
        return { createdAt: -1 };
    }
  }

  /**
   * Get sort criteria for users
   * @param {string} sort - Sort type
   * @returns {object} Sort criteria
   */
  getUserSortCriteria(sort) {
    switch (sort) {
      case 'rating':
        return { rating: -1 };
      case 'activity':
        return { eventCount: -1 };
      default:
        return { createdAt: -1 };
    }
  }

  /**
   * Get sort criteria for posts
   * @param {string} sort - Sort type
   * @returns {object} Sort criteria
   */
  getPostSortCriteria(sort) {
    switch (sort) {
      case 'popularity':
        return { likes: -1 };
      case 'engagement':
        return { comments: -1 };
      default:
        return { createdAt: -1 };
    }
  }

  /**
   * Generate search facets
   * @param {string} query - Search query
   * @param {object} filters - Search filters
   * @returns {object} Search facets
   */
  async generateSearchFacets(query, filters) {
    try {
      const facets = {
        categories: [],
        locations: [],
        tags: [],
      };

      // Get category facets
      const categoryFacets = await Event.aggregate([
        { $match: { name: { $regex: query, $options: 'i' } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]);

      // Get tag facets
      const tagFacets = await Event.aggregate([
        { $match: { name: { $regex: query, $options: 'i' } } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]);

      facets.categories = categoryFacets.map(item => ({
        term: item._id,
        type: 'category',
        count: item.count,
      }));

      facets.tags = tagFacets.map(item => ({
        term: item._id,
        type: 'tag',
        count: item.count,
      }));

      return facets;
    } catch (error) {
      throw new AppError(
        `Error al obtener búsquedas populares: ${error.message}`,
        500
      );
    }
  }
}

module.exports = SearchService;
