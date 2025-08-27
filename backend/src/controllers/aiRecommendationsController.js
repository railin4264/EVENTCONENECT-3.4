const { User, Event, Tribe, UserInteraction } = require('../models');
const AIRecommendationService = require('../services/AIRecommendationService');

class AIRecommendationsController {
  // ==========================================
  // OBTENER RECOMENDACIONES PERSONALIZADAS
  // ==========================================

  async getPersonalizedRecommendations(req, res) {
    try {
      const userId = req.user.id;
      const {
        type = 'events',
        limit = 10,
        location,
        radius = 25,
        includeAnalytics = false,
      } = req.query;

      // Obtener perfil del usuario con historial
      const user = await User.findById(userId).populate({
        path: 'stats.eventsAttended',
        model: 'Event',
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
        });
      }

      let recommendations = [];
      let analyticsData = {};

      switch (type) {
        case 'events':
          recommendations =
            await AIRecommendationService.getEventRecommendations(user, {
              location,
              radius,
              limit,
            });
          break;

        case 'tribes':
          recommendations =
            await AIRecommendationService.getTribeRecommendations(user, {
              limit,
            });
          break;

        case 'people':
          recommendations =
            await AIRecommendationService.getPeopleRecommendations(user, {
              location,
              radius,
              limit,
            });
          break;

        case 'mixed':
          recommendations =
            await AIRecommendationService.getMixedRecommendations(user, {
              location,
              radius,
              limit,
            });
          break;

        default:
          return res.status(400).json({
            success: false,
            message: 'Tipo de recomendación no válido',
          });
      }

      // Generar analytics si se solicita
      if (includeAnalytics) {
        analyticsData =
          await AIRecommendationService.getRecommendationAnalytics(
            userId,
            type
          );
      }

      // Registrar interacción para aprendizaje
      await this.logRecommendationInteraction(userId, {
        type,
        recommendationIds: recommendations.map(r => r.id),
        context: { location, radius, timestamp: new Date() },
      });

      res.json({
        success: true,
        data: {
          recommendations,
          analytics: includeAnalytics ? analyticsData : undefined,
          metadata: {
            type,
            count: recommendations.length,
            generatedAt: new Date(),
            userProfile: {
              interests: user.interests,
              location: user.location,
              preferences: user.preferences,
            },
          },
        },
      });
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // ==========================================
  // FEEDBACK DE RECOMENDACIONES
  // ==========================================

  async submitRecommendationFeedback(req, res) {
    try {
      const userId = req.user.id;
      const {
        recommendationId,
        recommendationType,
        action, // 'like', 'dislike', 'ignore', 'interact', 'share'
        feedback,
        context,
      } = req.body;

      // Validar acción
      const validActions = [
        'like',
        'dislike',
        'ignore',
        'interact',
        'share',
        'hide',
        'report',
      ];
      if (!validActions.includes(action)) {
        return res.status(400).json({
          success: false,
          message: 'Acción de feedback no válida',
        });
      }

      // Registrar feedback
      const feedbackData = await AIRecommendationService.recordFeedback({
        userId,
        recommendationId,
        recommendationType,
        action,
        feedback,
        context,
        timestamp: new Date(),
      });

      // Actualizar modelo de ML con nuevo feedback
      await AIRecommendationService.updateMLModel(userId, feedbackData);

      res.json({
        success: true,
        message: 'Feedback registrado exitosamente',
        data: {
          feedbackId: feedbackData.id,
          impact: feedbackData.impact,
          nextRecommendations: feedbackData.nextRecommendations,
        },
      });
    } catch (error) {
      console.error('Error submitting recommendation feedback:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // ==========================================
  // TRENDING Y POPULARES
  // ==========================================

  async getTrendingRecommendations(req, res) {
    try {
      const userId = req.user.id;
      const { timeframe = '24h', location, limit = 10, category } = req.query;

      const trendingData = await AIRecommendationService.getTrendingContent({
        userId,
        timeframe,
        location,
        limit,
        category,
      });

      res.json({
        success: true,
        data: {
          trending: trendingData.items,
          metadata: {
            timeframe,
            location,
            category,
            algorithm: trendingData.algorithm,
            generatedAt: new Date(),
          },
          insights: {
            totalInteractions: trendingData.totalInteractions,
            growthRate: trendingData.growthRate,
            userMatch: trendingData.userMatch,
          },
        },
      });
    } catch (error) {
      console.error('Error getting trending recommendations:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // ==========================================
  // RECOMENDACIONES SIMILARES
  // ==========================================

  async getSimilarItems(req, res) {
    try {
      const { itemId, itemType, limit = 5 } = req.query;
      const userId = req.user.id;

      if (!itemId || !itemType) {
        return res.status(400).json({
          success: false,
          message: 'itemId y itemType son requeridos',
        });
      }

      const similarItems = await AIRecommendationService.findSimilarItems({
        itemId,
        itemType,
        userId,
        limit,
      });

      res.json({
        success: true,
        data: {
          similarItems,
          metadata: {
            sourceItem: { id: itemId, type: itemType },
            algorithm: 'collaborative_filtering',
            similarity: similarItems.map(item => ({
              id: item.id,
              score: item.similarityScore,
              reasons: item.similarityReasons,
            })),
          },
        },
      });
    } catch (error) {
      console.error('Error getting similar items:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // ==========================================
  // INSIGHTS Y ANALYTICS
  // ==========================================

  async getRecommendationInsights(req, res) {
    try {
      const userId = req.user.id;
      const { period = '30d' } = req.query;

      const insights = await AIRecommendationService.getUserInsights(
        userId,
        period
      );

      res.json({
        success: true,
        data: {
          insights: {
            totalRecommendations: insights.totalRecommendations,
            interactionRate: insights.interactionRate,
            satisfactionScore: insights.satisfactionScore,
            diversityIndex: insights.diversityIndex,
            discoveryRate: insights.discoveryRate,
          },
          preferences: insights.learntPreferences,
          patterns: insights.behaviorPatterns,
          recommendations: {
            improve: insights.improvementSuggestions,
            nextActions: insights.recommendedActions,
          },
          period: {
            start: insights.periodStart,
            end: insights.periodEnd,
            days: insights.totalDays,
          },
        },
      });
    } catch (error) {
      console.error('Error getting recommendation insights:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // ==========================================
  // CONFIGURAR PREFERENCIAS DE IA
  // ==========================================

  async updateAIPreferences(req, res) {
    try {
      const userId = req.user.id;
      const {
        personalizedRecommendations,
        trendingContent,
        diversityLevel, // 'low', 'medium', 'high'
        exploreVsFamiliar, // 0-100 (0 = familiar, 100 = explore)
        notificationFrequency,
        categories,
        blockedTags,
        preferredTimes,
      } = req.body;

      const updatedPreferences = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            'preferences.ai': {
              personalizedRecommendations:
                personalizedRecommendations !== undefined
                  ? personalizedRecommendations
                  : true,
              trendingContent:
                trendingContent !== undefined ? trendingContent : true,
              diversityLevel: diversityLevel || 'medium',
              exploreVsFamiliar:
                exploreVsFamiliar !== undefined ? exploreVsFamiliar : 50,
              notificationFrequency: notificationFrequency || 'daily',
              categories: categories || [],
              blockedTags: blockedTags || [],
              preferredTimes: preferredTimes || [],
              updatedAt: new Date(),
            },
          },
        },
        { new: true, runValidators: true }
      );

      // Actualizar modelo de ML con nuevas preferencias
      await AIRecommendationService.updateUserPreferences(
        userId,
        updatedPreferences.preferences.ai
      );

      res.json({
        success: true,
        message: 'Preferencias de IA actualizadas',
        data: {
          preferences: updatedPreferences.preferences.ai,
          impact: {
            message: 'Tus próximas recomendaciones reflejarán estos cambios',
            estimatedImprovement: '15-25%',
          },
        },
      });
    } catch (error) {
      console.error('Error updating AI preferences:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // ==========================================
  // SMART NOTIFICATIONS
  // ==========================================

  async getSmartNotifications(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 5 } = req.query;

      const smartNotifications =
        await AIRecommendationService.generateSmartNotifications({
          userId,
          limit,
          context: 'api_request',
        });

      res.json({
        success: true,
        data: {
          notifications: smartNotifications,
          metadata: {
            algorithm: 'smart_timing_ml',
            personalizedFor: userId,
            generatedAt: new Date(),
          },
        },
      });
    } catch (error) {
      console.error('Error getting smart notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // ==========================================
  // UTILIDADES PRIVADAS
  // ==========================================

  async logRecommendationInteraction(userId, interactionData) {
    try {
      await UserInteraction.create({
        userId,
        type: 'recommendation_view',
        data: interactionData,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error logging recommendation interaction:', error);
    }
  }

  // ==========================================
  // WEBHOOK PARA ML MODEL UPDATES
  // ==========================================

  async handleMLModelUpdate(req, res) {
    try {
      const { modelVersion, improvements, affectedUsers } = req.body;

      // Validar webhook signature (implementar según tu sistema)
      // const isValidSignature = this.validateWebhookSignature(req);
      // if (!isValidSignature) {
      //   return res.status(401).json({ success: false, message: 'Invalid signature' });
      // }

      console.log(`ML Model updated to version ${modelVersion}`);
      console.log(`Improvements: ${JSON.stringify(improvements)}`);
      console.log(`Affected users: ${affectedUsers}`);

      // Notificar a usuarios afectados sobre mejoras (opcional)
      if (improvements.accuracyImprovement > 10) {
        await AIRecommendationService.notifyUsersAboutImprovements(
          affectedUsers,
          improvements
        );
      }

      res.json({
        success: true,
        message: 'ML model update processed',
        data: {
          modelVersion,
          processedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error handling ML model update:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing ML model update',
      });
    }
  }
}

module.exports = new AIRecommendationsController();
