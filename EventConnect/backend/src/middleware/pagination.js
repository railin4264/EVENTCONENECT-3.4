const mongoose = require('mongoose');

// Pagination middleware
const paginate = (req, res, next) => {
  // Parse pagination parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Validate pagination parameters
  if (page < 1) {
    return res.status(400).json({
      success: false,
      message: 'El número de página debe ser mayor a 0',
    });
  }

  if (limit < 1 || limit > 100) {
    return res.status(400).json({
      success: false,
      message: 'El límite debe estar entre 1 y 100',
    });
  }

  // Add pagination to request object
  req.pagination = {
    page,
    limit,
    skip,
  };

  next();
};

// Sorting middleware
const sort = (req, res, next) => {
  // Parse sorting parameters
  const sortField = req.query.sort || 'createdAt';
  const sortOrder = req.query.order === 'asc' ? 1 : -1;

  // Validate sort field (prevent injection)
  const allowedSortFields = [
    'createdAt',
    'updatedAt',
    'name',
    'title',
    'date',
    'popularity',
    'rating',
    'price',
    'capacity',
    'attendeesCount',
    'likesCount',
    'views',
    'lastActivity',
    'totalMembers',
    'totalEvents',
  ];

  if (!allowedSortFields.includes(sortField)) {
    return res.status(400).json({
      success: false,
      message: `Campo de ordenamiento no permitido: ${sortField}`,
    });
  }

  // Add sorting to request object
  req.sorting = {
    [sortField]: sortOrder,
  };

  next();
};

// Filtering middleware
const filter = (req, res, next) => {
  const filters = {};

  // Parse filter parameters
  Object.keys(req.query).forEach(key => {
    if (key.startsWith('filter_')) {
      const field = key.replace('filter_', '');
      let value = req.query[key];

      // Parse array values
      if (value.includes(',')) {
        value = value.split(',');
      }

      // Parse boolean values
      if (value === 'true') value = true;
      if (value === 'false') value = false;

      // Parse numeric values
      if (!isNaN(value) && value !== '') {
        value = parseFloat(value);
      }

      filters[field] = value;
    }
  });

  // Add filters to request object
  req.filters = filters;

  next();
};

// Search middleware
const search = (req, res, next) => {
  const searchQuery = req.query.q || req.query.search;

  if (searchQuery) {
    // Create text search object
    req.search = {
      $text: { $search: searchQuery },
    };

    // Add text index hint for better performance
    req.searchOptions = {
      score: { $meta: 'textScore' },
    };
  }

  next();
};

// Field selection middleware
const select = (req, res, next) => {
  const selectFields = req.query.select;

  if (selectFields) {
    // Parse selected fields
    const fields = selectFields.split(',').reduce((acc, field) => {
      acc[field.trim()] = 1;
      return acc;
    }, {});

    req.select = fields;
  }

  next();
};

// Population middleware
const populate = (req, res, next) => {
  const populateFields = req.query.populate;

  if (populateFields) {
    // Parse population fields
    const populateOptions = populateFields.split(',').map(field => {
      const [path, select] = field.split(':');
      return {
        path: path.trim(),
        select: select ? select.split('|').join(' ') : undefined,
      };
    });

    req.populate = populateOptions;
  }

  next();
};

// Date range filtering middleware
const dateRange = (req, res, next) => {
  const { startDate, endDate, dateField = 'createdAt' } = req.query;

  if (startDate || endDate) {
    const dateFilter = {};

    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }

    if (endDate) {
      dateFilter.$lte = new Date(endDate);
    }

    req.filters = req.filters || {};
    req.filters[dateField] = dateFilter;
  }

  next();
};

// Location filtering middleware
const locationFilter = (req, res, next) => {
  const {
    lat,
    lng,
    radius = 10,
    locationField = 'location.coordinates',
  } = req.query;

  if (lat && lng) {
    const coordinates = [parseFloat(lng), parseFloat(lat)];
    const maxDistance = parseFloat(radius) * 1000; // Convert km to meters

    req.filters = req.filters || {};
    req.filters[locationField] = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates,
        },
        $maxDistance: maxDistance,
      },
    };
  }

  next();
};

// Price range filtering middleware
const priceRange = (req, res, next) => {
  const { minPrice, maxPrice, priceField = 'price.amount' } = req.query;

  if (minPrice || maxPrice) {
    const priceFilter = {};

    if (minPrice) {
      priceFilter.$gte = parseFloat(minPrice);
    }

    if (maxPrice) {
      priceFilter.$lte = parseFloat(maxPrice);
    }

    req.filters = req.filters || {};
    req.filters[priceField] = priceFilter;
  }

  next();
};

// Category filtering middleware
const categoryFilter = (req, res, next) => {
  const { category, categories } = req.query;

  if (category || categories) {
    const categoryValue = categories ? categories.split(',') : [category];

    req.filters = req.filters || {};
    req.filters.category = { $in: categoryValue };
  }

  next();
};

// Status filtering middleware
const statusFilter = (req, res, next) => {
  const { status, statuses } = req.query;

  if (status || statuses) {
    const statusValue = statuses ? statuses.split(',') : [status];

    req.filters = req.filters || {};
    req.filters.status = { $in: statusValue };
  }

  next();
};

// User filtering middleware
const userFilter = (req, res, next) => {
  const { userId, hostId, creatorId, authorId } = req.query;

  if (userId || hostId || creatorId || authorId) {
    req.filters = req.filters || {};

    if (userId) req.filters.user = userId;
    if (hostId) req.filters.host = hostId;
    if (creatorId) req.filters.creator = creatorId;
    if (authorId) req.filters.author = authorId;
  }

  next();
};

// Advanced query builder
const buildQuery = (req, res, next) => {
  const query = {};

  // Add filters
  if (req.filters) {
    Object.assign(query, req.filters);
  }

  // Add search
  if (req.search) {
    Object.assign(query, req.search);
  }

  // Add user-specific filters
  if (req.user) {
    // Filter by user's location if available
    if (req.user.location && req.user.location.coordinates) {
      if (!query['location.coordinates']) {
        query['location.coordinates'] = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: req.user.location.coordinates,
            },
            $maxDistance: 50000, // 50km default
          },
        };
      }
    }

    // Filter by user's interests if available
    if (req.user.interests && req.user.interests.length > 0) {
      if (!query.category) {
        query.category = { $in: req.user.interests };
      }
    }
  }

  req.queryBuilder = query;

  next();
};

// Response formatter middleware
const formatResponse = (req, res, next) => {
  // Store original send method
  const originalSend = res.send;

  // Override send method to format response
  res.send = function (data) {
    if (req.pagination && Array.isArray(data)) {
      // Format paginated response
      const response = {
        success: true,
        data,
        pagination: {
          page: req.pagination.page,
          limit: req.pagination.limit,
          total: req.totalCount || data.length,
          pages: Math.ceil(
            (req.totalCount || data.length) / req.pagination.limit
          ),
        },
      };

      // Add sorting info
      if (req.sorting) {
        response.sorting = req.sorting;
      }

      // Add filtering info
      if (req.filters && Object.keys(req.filters).length > 0) {
        response.filters = req.filters;
      }

      // Add search info
      if (req.search) {
        response.search = { query: req.query.q || req.query.search };
      }

      return originalSend.call(this, response);
    }

    // Return original data for non-paginated responses
    return originalSend.call(this, data);
  };

  next();
};

// Count total documents middleware
const countTotal = Model => {
  return async (req, res, next) => {
    try {
      // Count total documents matching the query
      const totalCount = await Model.countDocuments(req.queryBuilder || {});
      req.totalCount = totalCount;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Execute query middleware
const executeQuery = Model => {
  return async (req, res, next) => {
    try {
      let query = Model.find(req.queryBuilder || {});

      // Apply population
      if (req.populate) {
        req.populate.forEach(populateOption => {
          query = query.populate(populateOption);
        });
      }

      // Apply field selection
      if (req.select) {
        query = query.select(req.select);
      }

      // Apply sorting
      if (req.sorting) {
        query = query.sort(req.sorting);
      }

      // Apply pagination
      if (req.pagination) {
        query = query.skip(req.pagination.skip).limit(req.pagination.limit);
      }

      // Execute query
      const results = await query.exec();

      // Send response
      res.json(results);
    } catch (error) {
      next(error);
    }
  };
};

// Export all pagination middleware
module.exports = {
  // Basic pagination
  paginate,
  sort,
  filter,
  search,
  select,
  populate,

  // Advanced filtering
  dateRange,
  locationFilter,
  priceRange,
  categoryFilter,
  statusFilter,
  userFilter,

  // Query building
  buildQuery,
  formatResponse,
  countTotal,
  executeQuery,

  // Utility functions
  createPaginationQuery: (page, limit) => ({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    skip: ((parseInt(page) || 1) - 1) * (parseInt(limit) || 20),
  }),

  createSortQuery: (field, order) => ({
    [field]: order === 'asc' ? 1 : -1,
  }),

  createFilterQuery: filters => {
    const query = {};
    Object.keys(filters).forEach(key => {
      if (
        filters[key] !== undefined &&
        filters[key] !== null &&
        filters[key] !== ''
      ) {
        query[key] = filters[key];
      }
    });
    return query;
  },
};
