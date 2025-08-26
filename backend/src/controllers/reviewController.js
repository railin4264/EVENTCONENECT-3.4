const { Review, Event, User } = require('../models');

class ReviewController {
  
  // ==========================================
  // CREAR RESEÑA
  // ==========================================
  
  async createReview(req, res) {
    try {
      const userId = req.user.id;
      const {
        reviewType,
        targetEvent,
        targetOrganizer,
        targetUser,
        targetVenue,
        ratings,
        content,
        attendedDate,
        isAnonymous = false
      } = req.body;

      // Validar que el usuario puede hacer la reseña
      const targetId = targetEvent || targetOrganizer || targetUser || targetVenue;
      const canReview = await Review.canUserReview(userId, targetId, reviewType);
      
      if (!canReview.canReview) {
        return res.status(400).json({
          success: false,
          message: canReview.reason
        });
      }

      // Validar ratings requeridos según el tipo
      if (!this.validateRatings(ratings, reviewType)) {
        return res.status(400).json({
          success: false,
          message: 'Calificaciones inválidas para este tipo de reseña'
        });
      }

      // Crear la reseña
      const reviewData = {
        reviewer: userId,
        reviewType,
        ratings,
        content,
        isAnonymous,
        attendedDate: reviewType === 'event' ? attendedDate : undefined,
        source: 'api'
      };

      // Asignar el target apropiado
      if (targetEvent) reviewData.targetEvent = targetEvent;
      if (targetOrganizer) reviewData.targetOrganizer = targetOrganizer;
      if (targetUser) reviewData.targetUser = targetUser;
      if (targetVenue) reviewData.targetVenue = targetVenue;

      const review = new Review(reviewData);
      
      // Auto-verificar si se puede confirmar la asistencia
      if (reviewType === 'event') {
        const event = await Event.findById(targetEvent);
        const attendee = event.attendees.find(a => 
          a.userId.toString() === userId.toString()
        );
        
        if (attendee && attendee.status === 'confirmed') {
          review.verified = true;
          review.verificationMethod = 'attendance_confirmed';
          review.moderation.status = 'approved';
        }
      }

      await review.save();

      // Poblar datos para la respuesta
      await review.populate([
        { path: 'reviewer', select: 'firstName lastName avatar' },
        { path: 'targetEvent', select: 'title startDate' },
        { path: 'targetOrganizer', select: 'firstName lastName avatar' },
        { path: 'targetUser', select: 'firstName lastName avatar' }
      ]);

      res.status(201).json({
        success: true,
        message: 'Reseña creada exitosamente',
        data: {
          review,
          status: review.moderation.status === 'approved' ? 'published' : 'pending_moderation'
        }
      });
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ==========================================
  // OBTENER RESEÑAS
  // ==========================================

  async getReviews(req, res) {
    try {
      const {
        targetId,
        reviewType,
        page = 1,
        limit = 10,
        sortBy = 'helpful', // helpful, recent, rating
        rating,
        verified
      } = req.query;

      if (!targetId || !reviewType) {
        return res.status(400).json({
          success: false,
          message: 'targetId y reviewType son requeridos'
        });
      }

      // Construir query
      const query = {
        reviewType,
        'moderation.status': 'approved'
      };

      // Asignar target según el tipo
      const targetField = `target${reviewType.charAt(0).toUpperCase() + reviewType.slice(1)}`;
      query[targetField] = targetId;

      // Filtros adicionales
      if (rating) {
        query['ratings.overall'] = parseInt(rating);
      }

      if (verified === 'true') {
        query.verified = true;
      }

      // Configurar ordenamiento
      let sort = {};
      switch (sortBy) {
        case 'helpful':
          sort = { 'analytics.helpfulCount': -1, createdAt: -1 };
          break;
        case 'recent':
          sort = { createdAt: -1 };
          break;
        case 'rating':
          sort = { 'ratings.overall': -1, createdAt: -1 };
          break;
        default:
          sort = { 'analytics.engagementScore': -1, createdAt: -1 };
      }

      // Ejecutar query con paginación
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const [reviews, total, ratingStats] = await Promise.all([
        Review.find(query)
          .populate('reviewer', 'firstName lastName avatar')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        
        Review.countDocuments(query),
        
        Review.getAverageRating(targetId, reviewType)
      ]);

      // Obtener distribución de calificaciones
      const distribution = await Review.getRatingDistribution(targetId, reviewType);

      // Incrementar vistas para reviews retornados
      if (reviews.length > 0) {
        await Review.updateMany(
          { _id: { $in: reviews.map(r => r._id) } },
          { $inc: { 'analytics.views': 1 } }
        );
      }

      res.json({
        success: true,
        data: {
          reviews,
          pagination: {
            current: parseInt(page),
            total: Math.ceil(total / parseInt(limit)),
            count: reviews.length,
            totalReviews: total
          },
          statistics: {
            averageRating: ratingStats.average,
            totalCount: ratingStats.count,
            ratingBreakdown: ratingStats.breakdown,
            distribution
          }
        }
      });
    } catch (error) {
      console.error('Error getting reviews:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ==========================================
  // MARCAR COMO ÚTIL
  // ==========================================

  async markHelpful(req, res) {
    try {
      const { reviewId } = req.params;
      const userId = req.user.id;

      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Reseña no encontrada'
        });
      }

      // No se puede marcar como útil la propia reseña
      if (review.reviewer.toString() === userId) {
        return res.status(400).json({
          success: false,
          message: 'No puedes marcar tu propia reseña como útil'
        });
      }

      const result = review.markAsHelpful(userId);
      await review.save();

      res.json({
        success: true,
        message: result.action === 'added' ? 'Marcado como útil' : 'Desmarcado como útil',
        data: {
          helpful: result.helpful,
          helpfulCount: review.analytics.helpfulCount
        }
      });
    } catch (error) {
      console.error('Error marking helpful:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ==========================================
  // REPORTAR RESEÑA
  // ==========================================

  async reportReview(req, res) {
    try {
      const { reviewId } = req.params;
      const { reason, description } = req.body;
      const userId = req.user.id;

      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Reseña no encontrada'
        });
      }

      const validReasons = ['spam', 'fake', 'inappropriate', 'offensive', 'other'];
      if (!validReasons.includes(reason)) {
        return res.status(400).json({
          success: false,
          message: 'Razón de reporte inválida'
        });
      }

      const result = review.reportReview(userId, reason);
      
      if (!result.success) {
        return res.status(400).json(result);
      }

      await review.save();

      res.json({
        success: true,
        message: result.message,
        data: {
          reportsCount: review.analytics.reportsCount,
          status: review.moderation.status
        }
      });
    } catch (error) {
      console.error('Error reporting review:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ==========================================
  // OBTENER RESEÑA ESPECÍFICA
  // ==========================================

  async getReviewById(req, res) {
    try {
      const { reviewId } = req.params;

      const review = await Review.findById(reviewId)
        .populate('reviewer', 'firstName lastName avatar')
        .populate('targetEvent', 'title startDate endDate')
        .populate('targetOrganizer', 'firstName lastName avatar')
        .populate('targetUser', 'firstName lastName avatar');

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Reseña no encontrada'
        });
      }

      // Incrementar vistas
      review.analytics.views += 1;
      await review.save();

      res.json({
        success: true,
        data: { review }
      });
    } catch (error) {
      console.error('Error getting review by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ==========================================
  // ACTUALIZAR RESEÑA
  // ==========================================

  async updateReview(req, res) {
    try {
      const { reviewId } = req.params;
      const userId = req.user.id;
      const { ratings, content } = req.body;

      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Reseña no encontrada'
        });
      }

      // Solo el autor puede actualizar la reseña
      if (review.reviewer.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para actualizar esta reseña'
        });
      }

      // Actualizar campos
      if (ratings) {
        if (!this.validateRatings(ratings, review.reviewType)) {
          return res.status(400).json({
            success: false,
            message: 'Calificaciones inválidas'
          });
        }
        review.ratings = { ...review.ratings, ...ratings };
      }

      if (content) {
        review.content = { ...review.content, ...content };
      }

      // Marcar para re-moderación
      review.moderation.status = 'pending';
      review.moderation.moderatedBy = undefined;
      review.moderation.moderatedAt = undefined;

      await review.save();

      res.json({
        success: true,
        message: 'Reseña actualizada exitosamente',
        data: { review }
      });
    } catch (error) {
      console.error('Error updating review:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ==========================================
  // ELIMINAR RESEÑA
  // ==========================================

  async deleteReview(req, res) {
    try {
      const { reviewId } = req.params;
      const userId = req.user.id;

      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Reseña no encontrada'
        });
      }

      // Solo el autor puede eliminar la reseña
      if (review.reviewer.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar esta reseña'
        });
      }

      await review.deleteOne();

      res.json({
        success: true,
        message: 'Reseña eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ==========================================
  // OBTENER RESEÑAS DEL USUARIO
  // ==========================================

  async getUserReviews(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [reviews, total] = await Promise.all([
        Review.find({ reviewer: userId })
          .populate('targetEvent', 'title startDate')
          .populate('targetOrganizer', 'firstName lastName')
          .populate('targetUser', 'firstName lastName')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        
        Review.countDocuments({ reviewer: userId })
      ]);

      res.json({
        success: true,
        data: {
          reviews,
          pagination: {
            current: parseInt(page),
            total: Math.ceil(total / parseInt(limit)),
            count: reviews.length,
            totalReviews: total
          }
        }
      });
    } catch (error) {
      console.error('Error getting user reviews:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ==========================================
  // ESTADÍSTICAS DE RESEÑAS
  // ==========================================

  async getReviewStatistics(req, res) {
    try {
      const { targetId, reviewType } = req.query;

      if (!targetId || !reviewType) {
        return res.status(400).json({
          success: false,
          message: 'targetId y reviewType son requeridos'
        });
      }

      const [averageRating, distribution, recentReviews] = await Promise.all([
        Review.getAverageRating(targetId, reviewType),
        Review.getRatingDistribution(targetId, reviewType),
        Review.find({
          [`target${reviewType.charAt(0).toUpperCase() + reviewType.slice(1)}`]: targetId,
          'moderation.status': 'approved'
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('reviewer', 'firstName lastName avatar')
        .lean()
      ]);

      // Calcular estadísticas adicionales
      const totalReviews = Object.values(distribution).reduce((sum, count) => sum + count, 0);
      const verifiedPercentage = totalReviews > 0 ? 
        await Review.countDocuments({
          [`target${reviewType.charAt(0).toUpperCase() + reviewType.slice(1)}`]: targetId,
          verified: true,
          'moderation.status': 'approved'
        }) / totalReviews * 100 : 0;

      res.json({
        success: true,
        data: {
          averageRating: averageRating.average,
          totalReviews,
          ratingBreakdown: averageRating.breakdown,
          distribution,
          verifiedPercentage: Math.round(verifiedPercentage),
          recentReviews
        }
      });
    } catch (error) {
      console.error('Error getting review statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ==========================================
  // UTILIDADES PRIVADAS
  // ==========================================

  validateRatings(ratings, reviewType) {
    if (!ratings || !ratings.overall) return false;
    
    if (ratings.overall < 1 || ratings.overall > 5) return false;

    switch (reviewType) {
      case 'event':
        const eventRequired = ['organization', 'contentQuality', 'venue', 'valueForMoney'];
        return eventRequired.every(field => 
          ratings[field] && ratings[field] >= 1 && ratings[field] <= 5
        );
        
      case 'organizer':
        const organizerRequired = ['communication', 'reliability', 'eventQuality'];
        return organizerRequired.every(field => 
          ratings[field] && ratings[field] >= 1 && ratings[field] <= 5
        );
        
      default:
        return true;
    }
  }
}

module.exports = new ReviewController();