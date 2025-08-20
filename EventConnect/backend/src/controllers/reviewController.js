const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { validateReviewCreation } = require('../middleware/validation');
const { Review, User, Event } = require('../models');

class ReviewController {
  // Create new review
  createReview = asyncHandler(async (req, res, next) => {
    try {
      const reviewData = req.body;
      const userId = req.user.id;

      // Add reviewer information
      reviewData.reviewer = userId;
      reviewData.status = 'pending'; // Requires moderation

      // Check if user has already reviewed this host for this event
      const existingReview = await Review.findOne({
        reviewer: userId,
        host: reviewData.host,
        event: reviewData.event,
      });

      if (existingReview) {
        throw new AppError(
          'Ya has revisado a este anfitrión para este evento',
          400
        );
      }

      // Verify that the event exists and the user attended it
      const event = await Event.findById(reviewData.event);
      if (!event) {
        throw new AppError('Evento no encontrado', 404);
      }

      // Check if user attended the event
      if (!event.attendees.includes(userId)) {
        throw new AppError(
          'Solo puedes revisar eventos a los que hayas asistido',
          400
        );
      }

      // Check if event has ended
      if (event.endDate > new Date()) {
        throw new AppError(
          'Solo puedes revisar eventos que hayan terminado',
          400
        );
      }

      // Create review
      const review = new Review(reviewData);
      await review.save();

      // Populate review data
      await review.populate('reviewer', 'username firstName lastName avatar');
      await review.populate('host', 'username firstName lastName avatar');
      await review.populate('event', 'title startDate endDate');

      res.status(201).json({
        success: true,
        message: 'Review creada exitosamente. Está pendiente de moderación.',
        data: { review },
      });
    } catch (error) {
      next(error);
    }
  });

  // Get all reviews with filtering and pagination
  getReviews = asyncHandler(async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 20,
        host,
        event,
        rating,
        status,
        verified,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      // Build query
      const query = {};

      // Host filter
      if (host) {
        query.host = host;
      }

      // Event filter
      if (event) {
        query.event = event;
      }

      // Rating filter
      if (rating) {
        query.rating = parseInt(rating);
      }

      // Status filter
      if (status) {
        query.status = status;
      } else {
        // Default to approved reviews only
        query.status = 'approved';
      }

      // Verified filter
      if (verified !== undefined) {
        query.isVerified = verified === 'true';
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query with pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const reviews = await Review.find(query)
        .populate('reviewer', 'username firstName lastName avatar')
        .populate('host', 'username firstName lastName avatar')
        .populate('event', 'title startDate endDate category')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      // Get total count for pagination
      const total = await Review.countDocuments(query);

      // Calculate pagination info
      const totalPages = Math.ceil(total / parseInt(limit));
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      res.status(200).json({
        success: true,
        data: {
          reviews,
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

  // Get review by ID
  getReviewById = asyncHandler(async (req, res, next) => {
    try {
      const { reviewId } = req.params;

      const review = await Review.findById(reviewId)
        .populate('reviewer', 'username firstName lastName avatar bio')
        .populate('host', 'username firstName lastName avatar bio')
        .populate('event', 'title startDate endDate category location')
        .populate('helpful', 'username firstName lastName avatar')
        .populate('notHelpful', 'username firstName lastName avatar')
        .populate('replies.author', 'username firstName lastName avatar');

      if (!review) {
        throw new AppError('Review no encontrada', 404);
      }

      res.status(200).json({
        success: true,
        data: { review },
      });
    } catch (error) {
      next(error);
    }
  });

  // Update review
  updateReview = asyncHandler(async (req, res, next) => {
    try {
      const { reviewId } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      // Find review and check ownership
      const review = await Review.findById(reviewId);
      if (!review) {
        throw new AppError('Review no encontrada', 404);
      }

      if (review.reviewer.toString() !== userId && req.user.role !== 'admin') {
        throw new AppError('No tienes permisos para editar esta review', 403);
      }

      // Check if review can be edited
      if (review.status === 'approved' && req.user.role !== 'admin') {
        throw new AppError('No puedes editar una review aprobada', 400);
      }

      // Reset status to pending for moderation
      updateData.status = 'pending';
      updateData.isVerified = false;
      updateData.verifiedBy = undefined;
      updateData.verifiedAt = undefined;

      // Update review
      const updatedReview = await Review.findByIdAndUpdate(
        reviewId,
        updateData,
        { new: true, runValidators: true }
      ).populate('reviewer', 'username firstName lastName avatar');

      res.status(200).json({
        success: true,
        message:
          'Review actualizada exitosamente. Está pendiente de moderación.',
        data: { review: updatedReview },
      });
    } catch (error) {
      next(error);
    }
  });

  // Delete review
  deleteReview = asyncHandler(async (req, res, next) => {
    try {
      const { reviewId } = req.params;
      const userId = req.user.id;

      // Find review and check ownership
      const review = await Review.findById(reviewId);
      if (!review) {
        throw new AppError('Review no encontrada', 404);
      }

      if (review.reviewer.toString() !== userId && req.user.role !== 'admin') {
        throw new AppError('No tienes permisos para eliminar esta review', 403);
      }

      // Delete review
      await Review.findByIdAndDelete(reviewId);

      res.status(200).json({
        success: true,
        message: 'Review eliminada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  });

  // Moderate review (admin/moderator only)
  moderateReview = asyncHandler(async (req, res, next) => {
    try {
      const { reviewId } = req.params;
      const { action, reason } = req.body;
      const moderatorId = req.user.id;

      // Check if user is admin or moderator
      if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
        throw new AppError('No tienes permisos para moderar reviews', 403);
      }

      const review = await Review.findById(reviewId);
      if (!review) {
        throw new AppError('Review no encontrada', 404);
      }

      switch (action) {
        case 'approve':
          review.status = 'approved';
          review.moderation.approvedBy = moderatorId;
          review.moderation.approvedAt = new Date();
          review.moderation.notes = reason || 'Review aprobada por moderador';
          break;

        case 'reject':
          review.status = 'rejected';
          review.moderation.rejectedBy = moderatorId;
          review.moderation.rejectedAt = new Date();
          review.moderation.notes = reason || 'Review rechazada por moderador';
          break;

        case 'flag':
          review.status = 'flagged';
          review.moderation.flaggedBy = moderatorId;
          review.moderation.flaggedAt = new Date();
          review.moderation.notes = reason || 'Review marcada por moderador';
          break;

        default:
          throw new AppError('Acción de moderación inválida', 400);
      }

      await review.save();

      // Populate review data
      await review.populate('reviewer', 'username firstName lastName avatar');
      await review.populate('host', 'username firstName lastName avatar');
      await review.populate('event', 'title startDate endDate');

      res.status(200).json({
        success: true,
        message: `Review ${action === 'approve' ? 'aprobada' : action === 'reject' ? 'rechazada' : 'marcada'} exitosamente`,
        data: { review },
      });
    } catch (error) {
      next(error);
    }
  });

  // Verify review (admin only)
  verifyReview = asyncHandler(async (req, res, next) => {
    try {
      const { reviewId } = req.params;
      const { verificationMethod, notes } = req.body;
      const verifierId = req.user.id;

      // Check if user is admin
      if (req.user.role !== 'admin') {
        throw new AppError(
          'Solo los administradores pueden verificar reviews',
          403
        );
      }

      const review = await Review.findById(reviewId);
      if (!review) {
        throw new AppError('Review no encontrada', 404);
      }

      // Check if review is approved
      if (review.status !== 'approved') {
        throw new AppError('Solo se pueden verificar reviews aprobadas', 400);
      }

      // Verify review
      review.isVerified = true;
      review.verificationMethod = verificationMethod;
      review.verifiedBy = verifierId;
      review.verifiedAt = new Date();
      review.moderation.notes = notes || 'Review verificada por administrador';

      await review.save();

      // Populate review data
      await review.populate('reviewer', 'username firstName lastName avatar');
      await review.populate('host', 'username firstName lastName avatar');
      await review.populate('event', 'title startDate endDate');

      res.status(200).json({
        success: true,
        message: 'Review verificada exitosamente',
        data: { review },
      });
    } catch (error) {
      next(error);
    }
  });

  // Mark review as helpful/not helpful
  markReviewHelpful = asyncHandler(async (req, res, next) => {
    try {
      const { reviewId } = req.params;
      const { helpful } = req.body; // true for helpful, false for not helpful
      const userId = req.user.id;

      const review = await Review.findById(reviewId);
      if (!review) {
        throw new AppError('Review no encontrada', 404);
      }

      // Check if user is the reviewer
      if (review.reviewer.toString() === userId) {
        throw new AppError('No puedes marcar tu propia review como útil', 400);
      }

      if (helpful === true) {
        // Mark as helpful
        if (!review.helpful.includes(userId)) {
          review.helpful.push(userId);
          // Remove from not helpful if previously marked
          review.notHelpful = review.notHelpful.filter(
            id => id.toString() !== userId
          );
        }
      } else if (helpful === false) {
        // Mark as not helpful
        if (!review.notHelpful.includes(userId)) {
          review.notHelpful.push(userId);
          // Remove from helpful if previously marked
          review.helpful = review.helpful.filter(
            id => id.toString() !== userId
          );
        }
      } else {
        // Remove both marks
        review.helpful = review.helpful.filter(id => id.toString() !== userId);
        review.notHelpful = review.notHelpful.filter(
          id => id.toString() !== userId
        );
      }

      // Calculate helpful score
      review.analytics.helpfulScore =
        review.helpful.length - review.notHelpful.length;

      await review.save();

      res.status(200).json({
        success: true,
        message:
          helpful === true
            ? 'Review marcada como útil'
            : helpful === false
              ? 'Review marcada como no útil'
              : 'Marcas removidas',
        data: {
          helpfulCount: review.helpful.length,
          notHelpfulCount: review.notHelpful.length,
          helpfulScore: review.analytics.helpfulScore,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // Add reply to review
  addReply = asyncHandler(async (req, res, next) => {
    try {
      const { reviewId } = req.params;
      const { content } = req.body;
      const userId = req.user.id;

      const review = await Review.findById(reviewId);
      if (!review) {
        throw new AppError('Review no encontrada', 404);
      }

      // Check if user is the host or admin/moderator
      if (
        review.host.toString() !== userId &&
        req.user.role !== 'admin' &&
        req.user.role !== 'moderator'
      ) {
        throw new AppError(
          'Solo el anfitrión, administradores y moderadores pueden responder',
          403
        );
      }

      // Initialize replies array if it doesn't exist
      if (!review.replies) {
        review.replies = [];
      }

      const reply = {
        author: userId,
        content,
        createdAt: new Date(),
      };

      review.replies.push(reply);
      await review.save();

      // Populate reply author
      await review.populate(
        'replies.author',
        'username firstName lastName avatar'
      );

      // Get the newly added reply
      const newReply = review.replies[review.replies.length - 1];

      res.status(201).json({
        success: true,
        message: 'Respuesta agregada exitosamente',
        data: { reply: newReply },
      });
    } catch (error) {
      next(error);
    }
  });

  // Update reply
  updateReply = asyncHandler(async (req, res, next) => {
    try {
      const { reviewId, replyId } = req.params;
      const { content } = req.body;
      const userId = req.user.id;

      const review = await Review.findById(reviewId);
      if (!review) {
        throw new AppError('Review no encontrada', 404);
      }

      // Find reply
      const reply = review.replies.id(replyId);
      if (!reply) {
        throw new AppError('Respuesta no encontrada', 404);
      }

      // Check ownership or admin/moderator
      if (
        reply.author.toString() !== userId &&
        req.user.role !== 'admin' &&
        req.user.role !== 'moderator'
      ) {
        throw new AppError(
          'No tienes permisos para editar esta respuesta',
          403
        );
      }

      // Update reply
      reply.content = content;
      reply.updatedAt = new Date();
      reply.isEdited = true;

      await review.save();

      // Populate reply author
      await review.populate(
        'replies.author',
        'username firstName lastName avatar'
      );

      res.status(200).json({
        success: true,
        message: 'Respuesta actualizada exitosamente',
        data: { reply },
      });
    } catch (error) {
      next(error);
    }
  });

  // Delete reply
  deleteReply = asyncHandler(async (req, res, next) => {
    try {
      const { reviewId, replyId } = req.params;
      const userId = req.user.id;

      const review = await Review.findById(reviewId);
      if (!review) {
        throw new AppError('Review no encontrada', 404);
      }

      // Find reply
      const reply = review.replies.id(replyId);
      if (!reply) {
        throw new AppError('Respuesta no encontrada', 404);
      }

      // Check ownership or admin/moderator
      if (
        reply.author.toString() !== userId &&
        req.user.role !== 'admin' &&
        req.user.role !== 'moderator'
      ) {
        throw new AppError(
          'No tienes permisos para eliminar esta respuesta',
          403
        );
      }

      // Remove reply
      review.replies = review.replies.filter(r => r._id.toString() !== replyId);
      await review.save();

      res.status(200).json({
        success: true,
        message: 'Respuesta eliminada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  });

  // Get reviews by host
  getHostReviews = asyncHandler(async (req, res, next) => {
    try {
      const { hostId } = req.params;
      const { page = 1, limit = 20, status = 'approved' } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const query = { host: hostId };
      if (status !== 'all') {
        query.status = status;
      }

      const reviews = await Review.find(query)
        .populate('reviewer', 'username firstName lastName avatar')
        .populate('host', 'username firstName lastName avatar')
        .populate('event', 'title startDate endDate category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Review.countDocuments(query);
      const totalPages = Math.ceil(total / parseInt(limit));

      // Calculate host rating statistics
      const hostStats = await Review.aggregate([
        { $match: { host: hostId, status: 'approved' } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 },
            ratingDistribution: {
              $push: '$rating',
            },
          },
        },
      ]);

      const stats = {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };

      if (hostStats.length > 0) {
        const hostStat = hostStats[0];
        stats.averageRating = Math.round(hostStat.averageRating * 10) / 10;
        stats.totalReviews = hostStat.totalReviews;

        // Calculate rating distribution
        hostStat.ratingDistribution.forEach(rating => {
          if (stats.ratingDistribution[rating]) {
            stats.ratingDistribution[rating]++;
          }
        });
      }

      res.status(200).json({
        success: true,
        data: {
          reviews,
          stats,
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

  // Get reviews by event
  getEventReviews = asyncHandler(async (req, res, next) => {
    try {
      const { eventId } = req.params;
      const { page = 1, limit = 20, status = 'approved' } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const query = { event: eventId };
      if (status !== 'all') {
        query.status = status;
      }

      const reviews = await Review.find(query)
        .populate('reviewer', 'username firstName lastName avatar')
        .populate('host', 'username firstName lastName avatar')
        .populate('event', 'title startDate endDate category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Review.countDocuments(query);
      const totalPages = Math.ceil(total / parseInt(limit));

      res.status(200).json({
        success: true,
        data: {
          reviews,
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

  // Get user's reviews
  getUserReviews = asyncHandler(async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20, status = 'all' } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const query = { reviewer: userId };
      if (status !== 'all') {
        query.status = status;
      }

      const reviews = await Review.find(query)
        .populate('reviewer', 'username firstName lastName avatar')
        .populate('host', 'username firstName lastName avatar')
        .populate('event', 'title startDate endDate category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Review.countDocuments(query);
      const totalPages = Math.ceil(total / parseInt(limit));

      res.status(200).json({
        success: true,
        data: {
          reviews,
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

  // Get pending reviews for moderation
  getPendingReviews = asyncHandler(async (req, res, next) => {
    try {
      const { page = 1, limit = 20 } = req.query;

      // Check if user is admin or moderator
      if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
        throw new AppError(
          'No tienes permisos para ver reviews pendientes',
          403
        );
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const reviews = await Review.find({ status: 'pending' })
        .populate('reviewer', 'username firstName lastName avatar')
        .populate('host', 'username firstName lastName avatar')
        .populate('event', 'title startDate endDate category')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Review.countDocuments({ status: 'pending' });
      const totalPages = Math.ceil(total / parseInt(limit));

      res.status(200).json({
        success: true,
        data: {
          reviews,
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

  // Flag review for moderation
  flagReview = asyncHandler(async (req, res, next) => {
    try {
      const { reviewId } = req.params;
      const { reason } = req.body;
      const userId = req.user.id;

      const review = await Review.findById(reviewId);
      if (!review) {
        throw new AppError('Review no encontrada', 404);
      }

      // Check if user is not the reviewer
      if (review.reviewer.toString() === userId) {
        throw new AppError('No puedes marcar tu propia review', 400);
      }

      // Add flag
      if (!review.flags) {
        review.flags = [];
      }

      // Check if user already flagged this review
      const existingFlag = review.flags.find(
        flag => flag.user.toString() === userId
      );
      if (existingFlag) {
        throw new AppError('Ya has marcado esta review', 400);
      }

      review.flags.push({
        user: userId,
        reason: reason || 'Sin razón especificada',
        flaggedAt: new Date(),
      });

      // If multiple flags, consider for moderation
      if (review.flags.length >= 3) {
        review.status = 'flagged';
        review.moderation.flaggedBy = 'system';
        review.moderation.flaggedAt = new Date();
        review.moderation.notes =
          'Review marcada automáticamente por múltiples reportes';
      }

      await review.save();

      res.status(200).json({
        success: true,
        message: 'Review marcada exitosamente',
        data: {
          flagCount: review.flags.length,
          status: review.status,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // Search reviews
  searchReviews = asyncHandler(async (req, res, next) => {
    try {
      const {
        query,
        host,
        event,
        rating,
        status,
        verified,
        dateFrom,
        dateTo,
        page = 1,
        limit = 20,
        sortBy = 'relevance',
      } = req.body;

      // Build search query
      const searchQuery = {};

      // Text search
      if (query) {
        searchQuery.$text = { $search: query };
      }

      // Apply other filters
      if (host) searchQuery.host = host;
      if (event) searchQuery.event = event;
      if (rating) searchQuery.rating = parseInt(rating);
      if (status) searchQuery.status = status;
      if (verified !== undefined) searchQuery.isVerified = verified;
      if (dateFrom || dateTo) {
        searchQuery.createdAt = {};
        if (dateFrom) searchQuery.createdAt.$gte = new Date(dateFrom);
        if (dateTo) searchQuery.createdAt.$lte = new Date(dateTo);
      }

      // Build sort
      let sort = {};
      switch (sortBy) {
        case 'date':
          sort = { createdAt: -1 };
          break;
        case 'rating':
          sort = { rating: -1 };
          break;
        case 'helpful':
          sort = { 'analytics.helpfulScore': -1 };
          break;
        case 'relevance':
        default:
          if (query) {
            sort = { score: { $meta: 'textScore' } };
          } else {
            sort = { createdAt: -1 };
          }
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const reviews = await Review.find(searchQuery)
        .populate('reviewer', 'username firstName lastName avatar')
        .populate('host', 'username firstName lastName avatar')
        .populate('event', 'title startDate endDate category')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Review.countDocuments(searchQuery);
      const totalPages = Math.ceil(total / parseInt(limit));

      res.status(200).json({
        success: true,
        data: {
          reviews,
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

module.exports = new ReviewController();
