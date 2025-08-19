const { Event, Tribe, User, Post } = require('../models');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { cache } = require('../middleware/cache');

class SearchController {
  // Global search across all entities
  globalSearch = asyncHandler(async (req, res, next) => {
    try {
      const { 
        query, 
        types = ['events', 'tribes', 'users', 'posts'], 
        filters = {}, 
        page = 1, 
        limit = 20,
        sort = 'relevance',
        location,
        radius = 50
      } = req.body;

      if (!query || query.trim().length < 2) {
        throw new AppError('La búsqueda debe tener al menos 2 caracteres', 400);
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const results = {};
      let totalResults = 0;

      // Search events
      if (types.includes('events')) {
        const eventResults = await this.searchEvents(query, filters, location, radius, page, limit, sort);
        results.events = eventResults.data;
        totalResults += eventResults.total;
      }

      // Search tribes
      if (types.includes('tribes')) {
        const tribeResults = await this.searchTribes(query, filters, location, radius, page, limit, sort);
        results.tribes = tribeResults.data;
        totalResults += tribeResults.total;
      }

      // Search users
      if (types.includes('users')) {
        const userResults = await this.searchUsers(query, filters, page, limit, sort);
        results.users = userResults.data;
        totalResults += userResults.total;
      }

      // Search posts
      if (types.includes('posts')) {
        const postResults = await this.searchPosts(query, filters, page, limit, sort);
        results.posts = postResults.data;
        totalResults += postResults.total;
      }

      // Calculate relevance scores and sort combined results
      const combinedResults = this.combineAndSortResults(results, query, sort);

      // Apply pagination to combined results
      const paginatedResults = combinedResults.slice(skip, skip + parseInt(limit));
      const totalPages = Math.ceil(totalResults / parseInt(limit));

      res.status(200).json({
        success: true,
        data: {
          results: paginatedResults,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            total: totalResults,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            limit: parseInt(limit)
          },
          query,
          types,
          filters
        }
      });
    } catch (error) {
      next(error);
    }
  });

  // Search events
  searchEvents = asyncHandler(async (query, filters = {}, location = null, radius = 50, page = 1, limit = 20, sort = 'relevance') => {
    try {
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Build search query
      const searchQuery = {
        $and: [
          {
            $or: [
              { title: { $regex: query, $options: 'i' } },
              { description: { $regex: query, $options: 'i' } },
              { tags: { $in: [new RegExp(query, 'i')] } },
              { category: { $regex: query, $options: 'i' } }
            ]
          },
          { status: 'active' }
        ]
      };

      // Apply filters
      if (filters.category) {
        searchQuery.$and.push({ category: filters.category });
      }
      if (filters.dateRange) {
        const { start, end } = filters.dateRange;
        if (start) searchQuery.$and.push({ startDate: { $gte: new Date(start) } });
        if (end) searchQuery.$and.push({ endDate: { $lte: new Date(end) } });
      }
      if (filters.priceRange) {
        const { min, max } = filters.priceRange;
        if (min !== undefined) searchQuery.$and.push({ 'pricing.price': { $gte: min } });
        if (max !== undefined) searchQuery.$and.push({ 'pricing.price': { $lte: max } });
      }
      if (filters.isFree !== undefined) {
        searchQuery.$and.push({ 'pricing.isFree': filters.isFree });
      }

      // Apply location filter if provided
      if (location && location.coordinates) {
        searchQuery.$and.push({
          'location.coordinates': {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: location.coordinates
              },
              $maxDistance: radius * 1000 // Convert km to meters
            }
          }
        });
      }

      // Build sort object
      let sortObject = {};
      switch (sort) {
        case 'date':
          sortObject = { startDate: 1 };
          break;
        case 'price':
          sortObject = { 'pricing.price': 1 };
          break;
        case 'popularity':
          sortObject = { attendeeCount: -1 };
          break;
        case 'relevance':
        default:
          // Relevance score will be calculated in the application layer
          sortObject = { createdAt: -1 };
          break;
      }

      const events = await Event.find(searchQuery)
        .populate('host', 'username firstName lastName avatar')
        .sort(sortObject)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Event.countDocuments(searchQuery);

      return {
        data: events,
        total
      };
    } catch (error) {
      throw new AppError('Error buscando eventos', 500);
    }
  });

  // Search tribes
  searchTribes = asyncHandler(async (query, filters = {}, location = null, radius = 50, page = 1, limit = 20, sort = 'relevance') => {
    try {
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Build search query
      const searchQuery = {
        $and: [
          {
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { description: { $regex: query, $options: 'i' } },
              { tags: { $in: [new RegExp(query, 'i')] } },
              { category: { $regex: query, $options: 'i' } }
            ]
          },
          { status: 'active' }
        ]
      };

      // Apply filters
      if (filters.category) {
        searchQuery.$and.push({ category: filters.category });
      }
      if (filters.isPublic !== undefined) {
        searchQuery.$and.push({ isPublic: filters.isPublic });
      }
      if (filters.memberCount) {
        const { min, max } = filters.memberCount;
        if (min !== undefined) searchQuery.$and.push({ memberCount: { $gte: min } });
        if (max !== undefined) searchQuery.$and.push({ memberCount: { $lte: max } });
      }

      // Apply location filter if provided
      if (location && location.coordinates) {
        searchQuery.$and.push({
          'location.coordinates': {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: location.coordinates
              },
              $maxDistance: radius * 1000
            }
          }
        });
      }

      // Build sort object
      let sortObject = {};
      switch (sort) {
        case 'memberCount':
          sortObject = { memberCount: -1 };
          break;
        case 'createdAt':
          sortObject = { createdAt: -1 };
          break;
        case 'popularity':
          sortObject = { likeCount: -1 };
          break;
        case 'relevance':
        default:
          sortObject = { createdAt: -1 };
          break;
      }

      const tribes = await Tribe.find(searchQuery)
        .populate('creator', 'username firstName lastName avatar')
        .sort(sortObject)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Tribe.countDocuments(searchQuery);

      return {
        data: tribes,
        total
      };
    } catch (error) {
      throw new AppError('Error buscando tribus', 500);
    }
  });

  // Search users
  searchUsers = asyncHandler(async (query, filters = {}, page = 1, limit = 20, sort = 'relevance') => {
    try {
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Build search query
      const searchQuery = {
        $and: [
          {
            $or: [
              { username: { $regex: query, $options: 'i' } },
              { firstName: { $regex: query, $options: 'i' } },
              { lastName: { $regex: query, $options: 'i' } },
              { bio: { $regex: query, $options: 'i' } },
              { interests: { $in: [new RegExp(query, 'i')] } }
            ]
          },
          { status: 'active' }
        ]
      };

      // Apply filters
      if (filters.role) {
        searchQuery.$and.push({ role: filters.role });
      }
      if (filters.isVerified !== undefined) {
        searchQuery.$and.push({ isVerified: filters.isVerified });
      }
      if (filters.location) {
        searchQuery.$and.push({ 'location.city': { $regex: filters.location, $options: 'i' } });
      }

      // Build sort object
      let sortObject = {};
      switch (sort) {
        case 'username':
          sortObject = { username: 1 };
          break;
        case 'createdAt':
          sortObject = { createdAt: -1 };
          break;
        case 'popularity':
          sortObject = { followerCount: -1 };
          break;
        case 'relevance':
        default:
          sortObject = { createdAt: -1 };
          break;
      }

      const users = await User.find(searchQuery)
        .select('username firstName lastName avatar bio location isVerified role followerCount')
        .sort(sortObject)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await User.countDocuments(searchQuery);

      return {
        data: users,
        total
      };
    } catch (error) {
      throw new AppError('Error buscando usuarios', 500);
    }
  });

  // Search posts
  searchPosts = asyncHandler(async (query, filters = {}, page = 1, limit = 20, sort = 'relevance') => {
    try {
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Build search query
      const searchQuery = {
        $and: [
          {
            $or: [
              { content: { $regex: query, $options: 'i' } },
              { tags: { $in: [new RegExp(query, 'i')] } }
            ]
          },
          { status: 'active' }
        ]
      };

      // Apply filters
      if (filters.type) {
        searchQuery.$and.push({ type: filters.type });
      }
      if (filters.author) {
        searchQuery.$and.push({ author: filters.author });
      }
      if (filters.hasMedia !== undefined) {
        if (filters.hasMedia) {
          searchQuery.$and.push({ 'media.0': { $exists: true } });
        } else {
          searchQuery.$and.push({ 'media.0': { $exists: false } });
        }
      }

      // Build sort object
      let sortObject = {};
      switch (sort) {
        case 'date':
          sortObject = { createdAt: -1 };
          break;
        case 'likes':
          sortObject = { likeCount: -1 };
          break;
        case 'comments':
          sortObject = { commentCount: -1 };
          break;
        case 'relevance':
        default:
          sortObject = { createdAt: -1 };
          break;
      }

      const posts = await Post.find(searchQuery)
        .populate('author', 'username firstName lastName avatar')
        .populate('event', 'title startDate')
        .populate('tribe', 'name category')
        .sort(sortObject)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Post.countDocuments(searchQuery);

      return {
        data: posts,
        total
      };
    } catch (error) {
      throw new AppError('Error buscando posts', 500);
    }
  });

  // Get search suggestions
  getSearchSuggestions = asyncHandler(async (req, res, next) => {
    try {
      const { query, type = 'all' } = req.query;

      if (!query || query.trim().length < 2) {
        return res.status(200).json({
          success: true,
          data: { suggestions: [] }
        });
      }

      const suggestions = [];

      // Get event suggestions
      if (type === 'all' || type === 'events') {
        const eventSuggestions = await Event.find({
          title: { $regex: query, $options: 'i' },
          status: 'active'
        })
        .select('title category')
        .limit(5)
        .lean();

        suggestions.push(...eventSuggestions.map(e => ({
          type: 'event',
          text: e.title,
          category: e.category
        })));
      }

      // Get tribe suggestions
      if (type === 'all' || type === 'tribes') {
        const tribeSuggestions = await Tribe.find({
          name: { $regex: query, $options: 'i' },
          status: 'active'
        })
        .select('name category')
        .limit(5)
        .lean();

        suggestions.push(...tribeSuggestions.map(t => ({
          type: 'tribe',
          text: t.name,
          category: t.category
        })));
      }

      // Get user suggestions
      if (type === 'all' || type === 'users') {
        const userSuggestions = await User.find({
          $or: [
            { username: { $regex: query, $options: 'i' } },
            { firstName: { $regex: query, $options: 'i' } },
            { lastName: { $regex: query, $options: 'i' } }
          ],
          status: 'active'
        })
        .select('username firstName lastName')
        .limit(5)
        .lean();

        suggestions.push(...userSuggestions.map(u => ({
          type: 'user',
          text: `${u.firstName} ${u.lastName}`,
          username: u.username
        })));
      }

      // Get tag suggestions
      if (type === 'all' || type === 'tags') {
        const tagSuggestions = await Event.aggregate([
          { $match: { status: 'active' } },
          { $unwind: '$tags' },
          { $match: { tags: { $regex: query, $options: 'i' } } },
          { $group: { _id: '$tags', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 }
        ]);

        suggestions.push(...tagSuggestions.map(t => ({
          type: 'tag',
          text: t._id,
          count: t.count
        })));
      }

      // Sort suggestions by relevance
      suggestions.sort((a, b) => {
        const aScore = this.calculateSuggestionScore(a, query);
        const bScore = this.calculateSuggestionScore(b, query);
        return bScore - aScore;
      });

      res.status(200).json({
        success: true,
        data: { suggestions: suggestions.slice(0, 10) }
      });
    } catch (error) {
      next(error);
    }
  });

  // Get trending searches
  getTrendingSearches = asyncHandler(async (req, res, next) => {
    try {
      const { period = 'week', limit = 10 } = req.query;

      let dateFilter = {};
      const now = new Date();

      switch (period) {
        case 'day':
          dateFilter = { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
          break;
        case 'week':
          dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
          break;
        case 'month':
          dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
          break;
        default:
          dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
      }

      // Get trending event searches
      const trendingEvents = await Event.aggregate([
        { $match: { status: 'active', createdAt: dateFilter } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: parseInt(limit) }
      ]);

      // Get trending tribe searches
      const trendingTribes = await Tribe.aggregate([
        { $match: { status: 'active', createdAt: dateFilter } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: parseInt(limit) }
      ]);

      // Get trending tags
      const trendingTags = await Event.aggregate([
        { $match: { status: 'active', createdAt: dateFilter } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: parseInt(limit) }
      ]);

      const trendingSearches = {
        events: trendingEvents,
        tribes: trendingTribes,
        tags: trendingTags
      };

      res.status(200).json({
        success: true,
        data: { trendingSearches }
      });
    } catch (error) {
      next(error);
    }
  });

  // Get search analytics
  getSearchAnalytics = asyncHandler(async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;
      const userId = req.user.id;

      // Build date filter
      const dateFilter = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);

      // Get search history for user
      const searchHistory = await this.getUserSearchHistory(userId, dateFilter);

      // Get popular searches
      const popularSearches = await this.getPopularSearches(dateFilter);

      // Get search performance metrics
      const searchMetrics = await this.getSearchMetrics(dateFilter);

      const analytics = {
        searchHistory,
        popularSearches,
        searchMetrics
      };

      res.status(200).json({
        success: true,
        data: { analytics }
      });
    } catch (error) {
      next(error);
    }
  });

  // Helper method to combine and sort search results
  combineAndSortResults(results, query, sort) {
    const combined = [];

    // Add events with type identifier
    if (results.events) {
      results.events.forEach(event => {
        combined.push({
          ...event,
          _searchType: 'event',
          _relevanceScore: this.calculateRelevanceScore(event, query, 'event')
        });
      });
    }

    // Add tribes with type identifier
    if (results.tribes) {
      results.tribes.forEach(tribe => {
        combined.push({
          ...tribe,
          _searchType: 'tribe',
          _relevanceScore: this.calculateRelevanceScore(tribe, query, 'tribe')
        });
      });
    }

    // Add users with type identifier
    if (results.users) {
      results.users.forEach(user => {
        combined.push({
          ...user,
          _searchType: 'user',
          _relevanceScore: this.calculateRelevanceScore(user, query, 'user')
        });
      });
    }

    // Add posts with type identifier
    if (results.posts) {
      results.posts.forEach(post => {
        combined.push({
          ...post,
          _searchType: 'post',
          _relevanceScore: this.calculateRelevanceScore(post, query, 'post')
        });
      });
    }

    // Sort by relevance score if relevance sort is selected
    if (sort === 'relevance') {
      combined.sort((a, b) => b._relevanceScore - a._relevanceScore);
    }

    return combined;
  }

  // Helper method to calculate relevance score
  calculateRelevanceScore(item, query, type) {
    let score = 0;
    const queryLower = query.toLowerCase();

    switch (type) {
      case 'event':
        if (item.title.toLowerCase().includes(queryLower)) score += 10;
        if (item.description.toLowerCase().includes(queryLower)) score += 5;
        if (item.tags.some(tag => tag.toLowerCase().includes(queryLower))) score += 3;
        if (item.category.toLowerCase().includes(queryLower)) score += 2;
        // Boost recent events
        const daysSinceCreation = (Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceCreation < 7) score += 2;
        if (daysSinceCreation < 30) score += 1;
        break;

      case 'tribe':
        if (item.name.toLowerCase().includes(queryLower)) score += 10;
        if (item.description.toLowerCase().includes(queryLower)) score += 5;
        if (item.tags.some(tag => tag.toLowerCase().includes(queryLower))) score += 3;
        if (item.category.toLowerCase().includes(queryLower)) score += 2;
        // Boost popular tribes
        score += Math.min(item.memberCount / 100, 5);
        break;

      case 'user':
        if (item.username.toLowerCase().includes(queryLower)) score += 10;
        if (item.firstName.toLowerCase().includes(queryLower)) score += 8;
        if (item.lastName.toLowerCase().includes(queryLower)) score += 8;
        if (item.bio && item.bio.toLowerCase().includes(queryLower)) score += 3;
        // Boost verified users
        if (item.isVerified) score += 2;
        break;

      case 'post':
        if (item.content.toLowerCase().includes(queryLower)) score += 8;
        if (item.tags && item.tags.some(tag => tag.toLowerCase().includes(queryLower))) score += 3;
        // Boost popular posts
        score += Math.min(item.likeCount / 50, 3);
        score += Math.min(item.commentCount / 20, 2);
        break;
    }

    return score;
  }

  // Helper method to calculate suggestion score
  calculateSuggestionScore(suggestion, query) {
    const queryLower = query.toLowerCase();
    let score = 0;

    if (suggestion.text.toLowerCase().startsWith(queryLower)) {
      score += 10; // Exact start match
    } else if (suggestion.text.toLowerCase().includes(queryLower)) {
      score += 5; // Contains match
    }

    // Boost by type
    switch (suggestion.type) {
      case 'event':
        score += 3;
        break;
      case 'tribe':
        score += 2;
        break;
      case 'user':
        score += 4;
        break;
      case 'tag':
        score += 1;
        break;
    }

    // Boost by count if available
    if (suggestion.count) {
      score += Math.min(suggestion.count / 100, 5);
    }

    return score;
  }

  // Helper method to get user search history
  async getUserSearchHistory(userId, dateFilter) {
    // This would typically come from a search history collection
    // For now, return empty array
    return [];
  }

  // Helper method to get popular searches
  async getPopularSearches(dateFilter) {
    // This would typically come from a search analytics collection
    // For now, return empty array
    return [];
  }

  // Helper method to get search metrics
  async getSearchMetrics(dateFilter) {
    // This would typically come from a search analytics collection
    // For now, return empty object
    return {};
  }
}

module.exports = new SearchController();