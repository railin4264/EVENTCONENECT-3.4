const { cloudinary } = require('../config');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const {
  validateEventCreation,
  validateEventUpdate,
} = require('../middleware/validation');
const { Event, User, Review } = require('../models');

class EventController {
  // Create new event
  createEvent = asyncHandler(async (req, res, next) => {
    try {
      const eventData = req.body;
      const userId = req.user.id;

      // Add host information
      eventData.host = userId;
      // Set status to published on creation
      eventData.status = 'published';

      // Normalize location coordinates
      if (eventData.location && eventData.location.coordinates) {
        const coords = eventData.location.coordinates;
        if (Array.isArray(coords) && coords.length === 2) {
          eventData.location.type = 'Point';
          eventData.location.coordinates = [coords[0], coords[1]];
        } else if (
          typeof coords === 'object' &&
          coords !== null &&
          'longitude' in coords &&
          'latitude' in coords
        ) {
          eventData.location.type = 'Point';
          eventData.location.coordinates = [coords.longitude, coords.latitude];
        }
      }

      // Create event
      const event = new Event(eventData);
      await event.save();

      // Populate host information
      await event.populate('host', 'username firstName lastName avatar');

      res.status(201).json({
        success: true,
        message: 'Evento creado exitosamente',
        data: { event },
      });
    } catch (error) {
      next(error);
    }
  });

  // Get all events with filtering and pagination
  getEvents = asyncHandler(async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        subcategory,
        location,
        dateFrom,
        dateTo,
        priceMin,
        priceMax,
        isFree,
        tags,
        search,
        sortBy = 'startDate',
        sortOrder = 'asc',
        radius = 50,
        latitude,
        longitude,
      } = req.query;

      // Build query
      const query = { status: 'active' };

      // Category filter
      if (category) {
        query.category = category;
      }

      // Subcategory filter
      if (subcategory) {
        query.subcategory = subcategory;
      }

      // Date range filter
      if (dateFrom || dateTo) {
        query.startDate = {};
        if (dateFrom) query.startDate.$gte = new Date(dateFrom);
        if (dateTo) query.startDate.$lte = new Date(dateTo);
      }

      // Price filter
      if (
        priceMin !== undefined ||
        priceMax !== undefined ||
        isFree !== undefined
      ) {
        query.price = {};
        if (isFree !== undefined) query.price.isFree = isFree === 'true';
        if (priceMin !== undefined)
          query.price.amount = { $gte: parseFloat(priceMin) };
        if (priceMax !== undefined) {
          if (query.price.amount) {
            query.price.amount.$lte = parseFloat(priceMax);
          } else {
            query.price.amount = { $lte: parseFloat(priceMax) };
          }
        }
      }

      // Tags filter
      if (tags) {
        const tagArray = tags.split(',').map(tag => tag.trim());
        query.tags = { $in: tagArray };
      }

      // Search filter
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } },
        ];
      }

      // Location filter with geospatial query
      if (latitude && longitude && radius) {
        query.location = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
            $maxDistance: parseFloat(radius) * 1000, // Convert km to meters
          },
        };
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query with pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const events = await Event.find(query)
        .populate('host', 'username firstName lastName avatar')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      // Get total count for pagination
      const total = await Event.countDocuments(query);

      // Calculate pagination info
      const totalPages = Math.ceil(total / parseInt(limit));
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      res.status(200).json({
        success: true,
        data: {
          events,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            total,
            hasNextPage,
            hasPrevPage,
            limit: parseInt(limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // Get event by ID
  getEventById = asyncHandler(async (req, res, next) => {
    try {
      const { eventId } = req.params;
      const userId = req.user?.id;

      const event = await Event.findById(eventId)
        .populate('host', 'username firstName lastName avatar bio')
        .populate('attendees', 'username firstName lastName avatar')
        .populate('likes', 'username firstName lastName avatar')
        .populate('tags');

      if (!event) {
        throw new AppError('Evento no encontrado', 404);
      }

      // Check if user is attending
      let isAttending = false;
      let isLiked = false;
      let userRole = null;

      if (userId) {
        isAttending = event.attendees.some(
          attendee => attendee._id.toString() === userId
        );
        isLiked = event.likes.some(like => like._id.toString() === userId);

        if (event.host._id.toString() === userId) {
          userRole = 'host';
        } else if (isAttending) {
          userRole = 'attendee';
        } else {
          userRole = 'guest';
        }
      }

      // Increment view count
      event.views = (event.views || 0) + 1;
      await event.save();

      res.status(200).json({
        success: true,
        data: {
          event,
          userInteraction: {
            isAttending,
            isLiked,
            userRole,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // Update event
  updateEvent = asyncHandler(async (req, res, next) => {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      // Find event and check ownership
      const event = await Event.findById(eventId);
      if (!event) {
        throw new AppError('Evento no encontrado', 404);
      }

      if (event.host.toString() !== userId && req.user.role !== 'admin') {
        throw new AppError('No tienes permisos para editar este evento', 403);
      }

      // Handle location coordinates
      if (updateData.location && updateData.location.coordinates) {
        updateData.location.type = 'Point';
        updateData.location.coordinates = [
          updateData.location.coordinates.longitude,
          updateData.location.coordinates.latitude,
        ];
      }

      // Update event
      const updatedEvent = await Event.findByIdAndUpdate(eventId, updateData, {
        new: true,
        runValidators: true,
      }).populate('host', 'username firstName lastName avatar');

      res.status(200).json({
        success: true,
        message: 'Evento actualizado exitosamente',
        data: { event: updatedEvent },
      });
    } catch (error) {
      next(error);
    }
  });

  // Delete event
  deleteEvent = asyncHandler(async (req, res, next) => {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;

      // Find event and check ownership
      const event = await Event.findById(eventId);
      if (!event) {
        throw new AppError('Evento no encontrado', 404);
      }

      if (event.host.toString() !== userId && req.user.role !== 'admin') {
        throw new AppError('No tienes permisos para eliminar este evento', 403);
      }

      // Check if event has started
      if (event.startDate < new Date()) {
        throw new AppError(
          'No puedes eliminar un evento que ya ha comenzado',
          400
        );
      }

      // Delete event
      await Event.findByIdAndDelete(eventId);

      res.status(200).json({
        success: true,
        message: 'Evento eliminado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  });

  // Join event
  joinEvent = asyncHandler(async (req, res, next) => {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;

      const event = await Event.findById(eventId);
      if (!event) {
        throw new AppError('Evento no encontrado', 404);
      }

      // Check if event is active
      if (event.status !== 'active') {
        throw new AppError('No puedes unirte a un evento inactivo', 400);
      }

      // Check if event has started
      if (event.startDate < new Date()) {
        throw new AppError(
          'No puedes unirte a un evento que ya ha comenzado',
          400
        );
      }

      // Check if user is already attending
      if (event.attendees.includes(userId)) {
        throw new AppError('Ya estás registrado en este evento', 400);
      }

      // Check capacity
      if (event.capacity && event.attendees.length >= event.capacity) {
        throw new AppError('El evento ha alcanzado su capacidad máxima', 400);
      }

      // Add user to attendees
      event.attendees.push(userId);
      event.attendeeCount = event.attendees.length;
      await event.save();

      // Populate event data
      await event.populate('host', 'username firstName lastName avatar');
      await event.populate('attendees', 'username firstName lastName avatar');

      res.status(200).json({
        success: true,
        message: 'Te has unido al evento exitosamente',
        data: { event },
      });
    } catch (error) {
      next(error);
    }
  });

  // Leave event
  leaveEvent = asyncHandler(async (req, res, next) => {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;

      const event = await Event.findById(eventId);
      if (!event) {
        throw new AppError('Evento no encontrado', 404);
      }

      // Check if user is attending
      if (!event.attendees.includes(userId)) {
        throw new AppError('No estás registrado en este evento', 400);
      }

      // Check if event has started
      if (event.startDate < new Date()) {
        throw new AppError(
          'No puedes dejar un evento que ya ha comenzado',
          400
        );
      }

      // Remove user from attendees
      event.attendees = event.attendees.filter(
        attendee => attendee.toString() !== userId
      );
      event.attendeeCount = event.attendees.length;
      await event.save();

      // Populate event data
      await event.populate('host', 'username firstName lastName avatar');
      await event.populate('attendees', 'username firstName lastName avatar');

      res.status(200).json({
        success: true,
        message: 'Has dejado el evento exitosamente',
        data: { event },
      });
    } catch (error) {
      next(error);
    }
  });

  // Like/unlike event
  toggleLike = asyncHandler(async (req, res, next) => {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;

      const event = await Event.findById(eventId);
      if (!event) {
        throw new AppError('Evento no encontrado', 404);
      }

      const isLiked = event.likes.includes(userId);

      if (isLiked) {
        // Unlike
        event.likes = event.likes.filter(like => like.toString() !== userId);
        event.likeCount = Math.max(0, (event.likeCount || 0) - 1);
      } else {
        // Like
        event.likes.push(userId);
        event.likeCount = (event.likeCount || 0) + 1;
      }

      await event.save();

      res.status(200).json({
        success: true,
        message: isLiked ? 'Evento deslikeado' : 'Evento likeado',
        data: {
          isLiked: !isLiked,
          likeCount: event.likeCount,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // Get user's events
  getUserEvents = asyncHandler(async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { type = 'all', page = 1, limit = 20 } = req.query;

      const query = {};

      switch (type) {
        case 'hosting':
          query.host = userId;
          break;
        case 'attending':
          query.attendees = userId;
          break;
        case 'liked':
          query.likes = userId;
          break;
        case 'all':
          query.$or = [
            { host: userId },
            { attendees: userId },
            { likes: userId },
          ];
          break;
        default:
          throw new AppError('Tipo de evento inválido', 400);
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const events = await Event.find(query)
        .populate('host', 'username firstName lastName avatar')
        .sort({ startDate: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Event.countDocuments(query);
      const totalPages = Math.ceil(total / parseInt(limit));

      res.status(200).json({
        success: true,
        data: {
          events,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            total,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            limit: parseInt(limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // Get trending events
  getTrendingEvents = asyncHandler(async (req, res, next) => {
    try {
      const { limit = 10, days = 7 } = req.query;

      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - parseInt(days));

      const events = await Event.aggregate([
        {
          $match: {
            status: 'active',
            startDate: { $gte: dateFrom },
          },
        },
        {
          $addFields: {
            score: {
              $add: [
                { $multiply: ['$views', 0.3] },
                { $multiply: ['$likeCount', 0.5] },
                { $multiply: ['$attendeeCount', 0.2] },
              ],
            },
          },
        },
        {
          $sort: { score: -1 },
        },
        {
          $limit: parseInt(limit),
        },
        {
          $lookup: {
            from: 'users',
            localField: 'host',
            foreignField: '_id',
            as: 'host',
          },
        },
        {
          $unwind: '$host',
        },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            startDate: 1,
            endDate: 1,
            location: 1,
            category: 1,
            subcategory: 1,
            images: 1,
            tags: 1,
            attendeeCount: 1,
            likeCount: 1,
            views: 1,
            score: 1,
            'host.username': 1,
            'host.firstName': 1,
            'host.lastName': 1,
            'host.avatar': 1,
          },
        },
      ]);

      res.status(200).json({
        success: true,
        data: { events },
      });
    } catch (error) {
      next(error);
    }
  });

  // Get nearby events
  getNearbyEvents = asyncHandler(async (req, res, next) => {
    try {
      const { latitude, longitude, radius = 50, limit = 20 } = req.query;

      if (!latitude || !longitude) {
        throw new AppError('Latitud y longitud son requeridas', 400);
      }

      const events = await Event.find({
        status: 'active',
        startDate: { $gte: new Date() },
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
            $maxDistance: parseFloat(radius) * 1000, // Convert km to meters
          },
        },
      })
        .populate('host', 'username firstName lastName avatar')
        .sort({ startDate: 1 })
        .limit(parseInt(limit))
        .lean();

      res.status(200).json({
        success: true,
        data: { events },
      });
    } catch (error) {
      next(error);
    }
  });

  // Upload event images
  uploadEventImages = asyncHandler(async (req, res, next) => {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;
      const { files } = req;

      if (!files || files.length === 0) {
        throw new AppError('No se proporcionaron archivos', 400);
      }

      // Check event ownership
      const event = await Event.findById(eventId);
      if (!event) {
        throw new AppError('Evento no encontrado', 404);
      }

      if (event.host.toString() !== userId && req.user.role !== 'admin') {
        throw new AppError(
          'No tienes permisos para subir imágenes a este evento',
          403
        );
      }

      // Upload images to Cloudinary
      const uploadResults = await cloudinary.uploadEventImages(files, eventId);

      if (uploadResults.failureCount > 0) {
        console.warn(
          'Algunas imágenes no se pudieron subir:',
          uploadResults.failed
        );
      }

      // Update event with new images
      const newImages = uploadResults.successful.map(result => ({
        url: result.url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
      }));

      event.images = [...(event.images || []), ...newImages];
      await event.save();

      res.status(200).json({
        success: true,
        message: 'Imágenes subidas exitosamente',
        data: {
          uploadedImages: newImages,
          totalImages: event.images.length,
          uploadResults,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // Delete event image
  deleteEventImage = asyncHandler(async (req, res, next) => {
    try {
      const { eventId, imageId } = req.params;
      const userId = req.user.id;

      // Check event ownership
      const event = await Event.findById(eventId);
      if (!event) {
        throw new AppError('Evento no encontrado', 404);
      }

      if (event.host.toString() !== userId && req.user.role !== 'admin') {
        throw new AppError(
          'No tienes permisos para eliminar imágenes de este evento',
          403
        );
      }

      // Find image
      const image = event.images.id(imageId);
      if (!image) {
        throw new AppError('Imagen no encontrada', 404);
      }

      // Delete from Cloudinary
      if (image.publicId) {
        await cloudinary.deleteFile(image.publicId, 'image');
      }

      // Remove from event
      event.images = event.images.filter(img => img._id.toString() !== imageId);
      await event.save();

      res.status(200).json({
        success: true,
        message: 'Imagen eliminada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  });

  // Get event statistics
  getEventStats = asyncHandler(async (req, res, next) => {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;

      const event = await Event.findById(eventId);
      if (!event) {
        throw new AppError('Evento no encontrado', 404);
      }

      // Check if user is host or admin
      if (event.host.toString() !== userId && req.user.role !== 'admin') {
        throw new AppError(
          'No tienes permisos para ver las estadísticas de este evento',
          403
        );
      }

      // Get reviews for this event
      const reviews = await Review.find({ event: eventId });

      const stats = {
        totalAttendees: event.attendeeCount || 0,
        totalLikes: event.likeCount || 0,
        totalViews: event.views || 0,
        totalReviews: reviews.length,
        averageRating:
          reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) /
              reviews.length
            : 0,
        capacityUtilization: event.capacity
          ? Math.round((event.attendeeCount / event.capacity) * 100)
          : 0,
        daysUntilEvent: Math.ceil(
          (event.startDate - new Date()) / (1000 * 60 * 60 * 24)
        ),
      };

      res.status(200).json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  });

  // Search events
  searchEvents = asyncHandler(async (req, res, next) => {
    try {
      const {
        query,
        category,
        location,
        dateFrom,
        dateTo,
        priceRange,
        tags,
        page = 1,
        limit = 20,
        sortBy = 'relevance',
      } = req.body;

      // Build search query
      const searchQuery = { status: 'active' };

      // Text search
      if (query) {
        searchQuery.$text = { $search: query };
      }

      // Apply other filters
      if (category) searchQuery.category = category;
      if (dateFrom || dateTo) {
        searchQuery.startDate = {};
        if (dateFrom) searchQuery.startDate.$gte = new Date(dateFrom);
        if (dateTo) searchQuery.startDate.$lte = new Date(dateTo);
      }
      if (tags && tags.length > 0) {
        searchQuery.tags = { $in: tags };
      }

      // Build sort
      let sort = {};
      switch (sortBy) {
        case 'date':
          sort = { startDate: 1 };
          break;
        case 'price':
          sort = { 'price.amount': 1 };
          break;
        case 'popularity':
          sort = { attendeeCount: -1, likeCount: -1 };
          break;
        case 'relevance':
        default:
          if (query) {
            sort = { score: { $meta: 'textScore' } };
          } else {
            sort = { startDate: 1 };
          }
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const events = await Event.find(searchQuery)
        .populate('host', 'username firstName lastName avatar')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Event.countDocuments(searchQuery);
      const totalPages = Math.ceil(total / parseInt(limit));

      res.status(200).json({
        success: true,
        data: {
          events,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            total,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            limit: parseInt(limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  });
}

module.exports = new EventController();
