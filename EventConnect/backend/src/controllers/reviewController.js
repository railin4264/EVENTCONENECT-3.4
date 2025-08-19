const Review = require('../models/Review');
const User = require('../models/User');
const Event = require('../models/Event');
const { validationResult } = require('express-validator');

// @desc    Get reviews for a user (host)
// @route   GET /api/reviews/user/:userId
// @access  Public
const getUserReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      rating,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const options = {
      limit: parseInt(limit),
      skip: (page - 1) * limit,
      sort: { [sort]: order === 'desc' ? -1 : 1 }
    };

    const reviews = await Review.findByHost(userId, options);
    const total = await Review.countDocuments({ host: userId });

    // Calculate average rating
    const ratingStats = await Review.aggregate([
      { $match: { host: user._id } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    const stats = ratingStats[0] || {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: []
    };

    // Calculate rating distribution
    const distribution = {
      5: stats.ratingDistribution.filter(r => r === 5).length,
      4: stats.ratingDistribution.filter(r => r === 4).length,
      3: stats.ratingDistribution.filter(r => r === 3).length,
      2: stats.ratingDistribution.filter(r => r === 2).length,
      1: stats.ratingDistribution.filter(r => r === 1).length
    };

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        stats: {
          averageRating: Math.round(stats.averageRating * 10) / 10,
          totalReviews: stats.totalReviews,
          distribution
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo reviews del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get review by ID
// @route   GET /api/reviews/:id
// @access  Public
const getReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('host', 'username firstName lastName avatar')
      .populate('reviewer', 'username firstName lastName avatar')
      .populate('event', 'title dateTime location');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review no encontrado'
      });
    }

    res.json({
      success: true,
      data: { review }
    });

  } catch (error) {
    console.error('Error obteniendo review:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const {
      host,
      event,
      rating,
      title,
      content,
      categories,
      isAnonymous = false
    } = req.body;

    // Check if user is trying to review themselves
    if (host === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'No puedes hacer review de ti mismo'
      });
    }

    // Check if user has already reviewed this host
    const existingReview = await Review.findOne({
      host,
      reviewer: req.user.id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Ya has hecho review de este usuario'
      });
    }

    // Check if host exists
    const hostUser = await User.findById(host);
    if (!hostUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario anfitrión no encontrado'
      });
    }

    // Check if event exists (if provided)
    if (event) {
      const eventDoc = await Event.findById(event);
      if (!eventDoc) {
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado'
        });
      }
    }

    // Create new review
    const review = new Review({
      host,
      reviewer: req.user.id,
      event,
      rating,
      title,
      content,
      categories,
      isAnonymous
    });

    await review.save();

    // Populate review for response
    await review.populate('host', 'username firstName lastName avatar');
    await review.populate('reviewer', 'username firstName lastName avatar');
    if (event) {
      await review.populate('event', 'title dateTime location');
    }

    // Update host's average rating
    await updateHostRating(host);

    res.status(201).json({
      success: true,
      message: 'Review creado exitosamente',
      data: { review }
    });

  } catch (error) {
    console.error('Error creando review:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review no encontrado'
      });
    }

    // Check if user is the reviewer
    if (review.reviewer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para editar este review'
      });
    }

    // Check if review is older than 24 hours
    const hoursSinceCreation = (Date.now() - review.createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreation > 24) {
      return res.status(400).json({
        success: false,
        message: 'Solo puedes editar reviews durante las primeras 24 horas'
      });
    }

    const updateFields = req.body;
    
    // Remove fields that shouldn't be updated
    delete updateFields.host;
    delete updateFields.reviewer;
    delete updateFields.event;

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    )
    .populate('host', 'username firstName lastName avatar')
    .populate('reviewer', 'username firstName lastName avatar')
    .populate('event', 'title dateTime location');

    // Update host's average rating
    await updateHostRating(review.host);

    res.json({
      success: true,
      message: 'Review actualizado exitosamente',
      data: { review: updatedReview }
    });

  } catch (error) {
    console.error('Error actualizando review:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review no encontrado'
      });
    }

    // Check if user is the reviewer or admin
    if (review.reviewer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar este review'
      });
    }

    // Check if review is older than 24 hours (for regular users)
    if (req.user.role !== 'admin') {
      const hoursSinceCreation = (Date.now() - review.createdAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceCreation > 24) {
        return res.status(400).json({
          success: false,
          message: 'Solo puedes eliminar reviews durante las primeras 24 horas'
        });
      }
    }

    await Review.findByIdAndDelete(req.params.id);

    // Update host's average rating
    await updateHostRating(review.host);

    res.json({
      success: true,
      message: 'Review eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando review:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get reviews by event
// @route   GET /api/reviews/event/:eventId
// @access  Public
const getEventReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      rating,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const { eventId } = req.params;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    const options = {
      limit: parseInt(limit),
      skip: (page - 1) * limit,
      sort: { [sort]: order === 'desc' ? -1 : 1 }
    };

    const reviews = await Review.findByEvent(eventId, options);
    const total = await Review.countDocuments({ event: eventId });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo reviews del evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get user's own reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
const getMyReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const options = {
      limit: parseInt(limit),
      skip: (page - 1) * limit,
      sort: { [sort]: order === 'desc' ? -1 : 1 }
    };

    const reviews = await Review.findByReviewer(req.user.id, options);
    const total = await Review.countDocuments({ reviewer: req.user.id });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo mis reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Report review
// @route   POST /api/reviews/:id/report
// @access  Private
const reportReview = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { reason, description } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review no encontrado'
      });
    }

    // Check if user is trying to report their own review
    if (review.reviewer.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'No puedes reportar tu propio review'
      });
    }

    // Check if user has already reported this review
    const existingReport = review.reports.find(
      report => report.reporter.toString() === req.user.id
    );

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'Ya has reportado este review'
      });
    }

    // Add report
    review.reports.push({
      reporter: req.user.id,
      reason,
      description,
      reportedAt: new Date()
    });

    await review.save();

    res.json({
      success: true,
      message: 'Review reportado exitosamente'
    });

  } catch (error) {
    console.error('Error reportando review:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Like/Unlike review
// @route   POST /api/reviews/:id/like
// @access  Private
const toggleReviewLike = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review no encontrado'
      });
    }

    // Check if user is trying to like their own review
    if (review.reviewer.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'No puedes dar like a tu propio review'
      });
    }

    // Toggle like
    await review.toggleLike(req.user.id);

    res.json({
      success: true,
      message: 'Like actualizado exitosamente',
      data: { 
        isLiked: review.isLiked(req.user.id),
        likesCount: review.likesCount
      }
    });

  } catch (error) {
    console.error('Error actualizando like del review:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get review statistics
// @route   GET /api/reviews/stats/overview
// @access  Public
const getReviewStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    
    if (startDate) {
      query.createdAt = { $gte: new Date(startDate) };
    }
    if (endDate) {
      query.createdAt = { ...query.createdAt, $lte: new Date(endDate) };
    }

    // Get overall stats
    const totalReviews = await Review.countDocuments(query);
    const averageRating = await Review.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          average: { $avg: '$rating' }
        }
      }
    ]);

    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    // Get category distribution
    const categoryDistribution = await Review.aggregate([
      { $match: query },
      { $unwind: '$categories' },
      {
        $group: {
          _id: '$categories',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get recent reviews
    const recentReviews = await Review.find(query)
      .populate('host', 'username firstName lastName avatar')
      .populate('reviewer', 'username firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    const stats = {
      totalReviews,
      averageRating: averageRating[0]?.average || 0,
      ratingDistribution,
      categoryDistribution,
      recentReviews
    };

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper function to update host's average rating
const updateHostRating = async (hostId) => {
  try {
    const ratingStats = await Review.aggregate([
      { $match: { host: hostId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    if (ratingStats.length > 0) {
      const { averageRating, totalReviews } = ratingStats[0];
      
      await User.findByIdAndUpdate(hostId, {
        'stats.averageRating': Math.round(averageRating * 10) / 10,
        'stats.totalReviews': totalReviews
      });
    }
  } catch (error) {
    console.error('Error actualizando rating del host:', error);
  }
};

module.exports = {
  getUserReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  getEventReviews,
  getMyReviews,
  reportReview,
  toggleReviewLike,
  getReviewStats
};