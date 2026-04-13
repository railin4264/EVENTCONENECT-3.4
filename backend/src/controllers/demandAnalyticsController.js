const DemandAnalyticsService = require('../services/DemandAnalyticsService');

class DemandAnalyticsController {
  // ==========================================
  // ANÁLISIS DE DEMANDA LOCAL
  // ==========================================

  async getLocalDemand(req, res) {
    try {
      const { lat, lng, radius = 25 } = req.query;

      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          message: 'Latitud y longitud son requeridas',
        });
      }

      const location = {
        coordinates: [parseFloat(lng), parseFloat(lat)],
      };

      const analysis = await DemandAnalyticsService.analyzeLocalDemand(
        location,
        parseInt(radius)
      );

      res.json(analysis);
    } catch (error) {
      console.error('Error getting local demand:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // ==========================================
  // SUGERENCIAS PARA CREAR EVENTOS
  // ==========================================

  async getEventSuggestions(req, res) {
    try {
      const userId = req.user.id;
      const { lat, lng } = req.query;

      let location = null;
      if (lat && lng) {
        location = {
          coordinates: [parseFloat(lng), parseFloat(lat)],
        };
      }

      const suggestions = await DemandAnalyticsService.generateEventSuggestions(
        userId,
        location
      );

      res.json(suggestions);
    } catch (error) {
      console.error('Error getting event suggestions:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // ==========================================
  // OPORTUNIDADES DE MERCADO
  // ==========================================

  async getMarketOpportunities(req, res) {
    try {
      const { lat, lng, radius = 25, category, minScore = 60 } = req.query;

      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          message: 'Latitud y longitud son requeridas',
        });
      }

      const location = {
        coordinates: [parseFloat(lng), parseFloat(lat)],
      };

      const analysis = await DemandAnalyticsService.analyzeLocalDemand(
        location,
        parseInt(radius)
      );

      if (!analysis.success) {
        return res.status(400).json(analysis);
      }

      // Filtrar oportunidades
      let { opportunities } = analysis.data;

      if (category) {
        opportunities = opportunities.filter(opp => opp.category === category);
      }

      if (minScore) {
        opportunities = opportunities.filter(
          opp => opp.score >= parseInt(minScore)
        );
      }

      res.json({
        success: true,
        data: {
          location,
          radius: parseInt(radius),
          opportunities,
          summary: {
            totalOpportunities: opportunities.length,
            highImpactOpportunities: opportunities.filter(o => o.score >= 80)
              .length,
            categories: [...new Set(opportunities.map(o => o.category))],
          },
        },
      });
    } catch (error) {
      console.error('Error getting market opportunities:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // ==========================================
  // ANÁLISIS DE TENDENCIAS
  // ==========================================

  async getTrends(req, res) {
    try {
      const {
        lat,
        lng,
        radius = 25,
        timeframe = '6m', // 6 months, 1y, etc.
      } = req.query;

      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          message: 'Latitud y longitud son requeridas',
        });
      }

      const location = {
        coordinates: [parseFloat(lng), parseFloat(lat)],
      };

      const analysis = await DemandAnalyticsService.analyzeLocalDemand(
        location,
        parseInt(radius)
      );

      if (!analysis.success) {
        return res.status(400).json(analysis);
      }

      res.json({
        success: true,
        data: {
          location,
          timeframe,
          trends: analysis.data.trends,
          insights: this.generateTrendInsights(analysis.data.trends),
        },
      });
    } catch (error) {
      console.error('Error getting trends:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // ==========================================
  // RECOMENDACIONES DE PRECIOS
  // ==========================================

  async getPricingRecommendations(req, res) {
    try {
      const {
        lat,
        lng,
        category,
        eventType = 'standard',
        capacity,
      } = req.query;

      if (!lat || !lng || !category) {
        return res.status(400).json({
          success: false,
          message: 'Latitud, longitud y categoría son requeridas',
        });
      }

      const location = {
        coordinates: [parseFloat(lng), parseFloat(lat)],
      };

      const analysis =
        await DemandAnalyticsService.analyzeLocalDemand(location);

      if (!analysis.success) {
        return res.status(400).json(analysis);
      }

      const categoryData = analysis.data.analysis.categoryDemand[category];
      const pricingData = analysis.data.analysis.pricing;

      if (!categoryData) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no encontrada en el análisis',
        });
      }

      const recommendations = this.generatePricingRecommendations(
        category,
        categoryData,
        pricingData,
        { eventType, capacity: capacity ? parseInt(capacity) : null }
      );

      res.json({
        success: true,
        data: recommendations,
      });
    } catch (error) {
      console.error('Error getting pricing recommendations:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // ==========================================
  // ANÁLISIS COMPETITIVO
  // ==========================================

  async getCompetitiveAnalysis(req, res) {
    try {
      const { lat, lng, category, radius = 25 } = req.query;

      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          message: 'Latitud y longitud son requeridas',
        });
      }

      const location = {
        coordinates: [parseFloat(lng), parseFloat(lat)],
      };

      const analysis = await DemandAnalyticsService.analyzeLocalDemand(
        location,
        parseInt(radius)
      );

      if (!analysis.success) {
        return res.status(400).json(analysis);
      }

      let competitiveData = analysis.data.analysis.competition;

      if (category) {
        competitiveData = {
          [category]: competitiveData[category] || {
            eventCount: 0,
            averageAttendees: 0,
            marketShare: 0,
            competitionIntensity: 'none',
          },
        };
      }

      res.json({
        success: true,
        data: {
          location,
          category: category || 'all',
          competition: competitiveData,
          recommendations:
            this.generateCompetitiveRecommendations(competitiveData),
          marketPosition: this.assessMarketPosition(competitiveData),
        },
      });
    } catch (error) {
      console.error('Error getting competitive analysis:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // ==========================================
  // MÉTODOS AUXILIARES
  // ==========================================

  generateTrendInsights(trends) {
    const insights = [];

    // Insights de crecimiento general
    if (trends.monthlyGrowth > 20) {
      insights.push({
        type: 'growth',
        message: `El mercado de eventos está creciendo ${trends.monthlyGrowth.toFixed(1)}% mensualmente`,
        impact: 'positive',
      });
    } else if (trends.monthlyGrowth < -10) {
      insights.push({
        type: 'decline',
        message: `El mercado está decreciendo ${Math.abs(trends.monthlyGrowth).toFixed(1)}%`,
        impact: 'negative',
      });
    }

    // Insights de categorías emergentes
    if (trends.emergingCategories && trends.emergingCategories.length > 0) {
      const topEmerging = trends.emergingCategories[0];
      insights.push({
        type: 'emerging',
        message: `${topEmerging.category} está emergiendo con ${topEmerging.growth.toFixed(1)}% de crecimiento`,
        impact: 'opportunity',
      });
    }

    // Insights estacionales
    const seasonalData = trends.seasonalPatterns;
    if (seasonalData) {
      const seasons = Object.entries(seasonalData);
      const bestSeason = seasons.reduce((best, current) =>
        current[1].events > best[1].events ? current : best
      );

      insights.push({
        type: 'seasonal',
        message: `${bestSeason[0]} es la mejor temporada con ${bestSeason[1].events} eventos`,
        impact: 'timing',
      });
    }

    return insights;
  }

  generatePricingRecommendations(category, categoryData, pricingData, options) {
    const { eventType, capacity } = options;

    // Precio base sugerido
    const basePrices = {
      technology: 35,
      business: 45,
      education: 25,
      music: 30,
      art: 20,
      food: 40,
      sports: 15,
      health: 30,
    };

    let suggestedPrice = basePrices[category] || 25;

    // Ajustes por competencia
    const competitionMultiplier = {
      low: 1.3,
      medium: 1.0,
      high: 0.8,
    };

    suggestedPrice *= competitionMultiplier[categoryData.competitionLevel];

    // Ajustes por demanda
    if (categoryData.interestedUsers > 100) {
      suggestedPrice *= 1.2;
    } else if (categoryData.interestedUsers < 30) {
      suggestedPrice *= 0.9;
    }

    // Ajustes por tipo de evento
    const typeMultiplier = {
      workshop: 1.5,
      conference: 2.0,
      meetup: 0.5,
      standard: 1.0,
    };

    suggestedPrice *= typeMultiplier[eventType] || 1.0;

    // Ajustes por capacidad
    if (capacity) {
      if (capacity < 25)
        suggestedPrice *= 1.2; // Evento íntimo
      else if (capacity > 200) suggestedPrice *= 0.8; // Evento masivo
    }

    const minPrice = Math.round(suggestedPrice * 0.7);
    const maxPrice = Math.round(suggestedPrice * 1.4);

    return {
      suggestedPrice: Math.round(suggestedPrice),
      priceRange: { min: minPrice, max: maxPrice },
      marketData: {
        averagePrice: pricingData.averagePrice,
        medianPrice: pricingData.medianPrice,
        competitionLevel: categoryData.competitionLevel,
      },
      recommendations: [
        `Precio óptimo: $${Math.round(suggestedPrice)}`,
        `Rango competitivo: $${minPrice} - $${maxPrice}`,
        categoryData.competitionLevel === 'low'
          ? 'Puedes cobrar premium por la baja competencia'
          : 'Mantén precios competitivos',
        categoryData.interestedUsers > 50
          ? 'Alta demanda te permite precios más altos'
          : 'Considera precios atractivos para impulsar demanda',
      ],
    };
  }

  generateCompetitiveRecommendations(competitiveData) {
    const recommendations = [];

    Object.entries(competitiveData).forEach(([category, data]) => {
      if (data.competitionIntensity === 'low') {
        recommendations.push({
          category,
          type: 'opportunity',
          message: `Baja competencia en ${category} - gran oportunidad`,
          action: 'Considera entrar en este mercado',
        });
      } else if (data.competitionIntensity === 'high') {
        recommendations.push({
          category,
          type: 'challenge',
          message: `Alta competencia en ${category}`,
          action: 'Diferénciate con valor único o considera otro nicho',
        });
      }

      if (data.averageAttendees > 0) {
        recommendations.push({
          category,
          type: 'benchmark',
          message: `Asistencia promedio: ${Math.round(data.averageAttendees)} personas`,
          action: `Apunta a superar este número para destacar`,
        });
      }
    });

    return recommendations;
  }

  assessMarketPosition(competitiveData) {
    const categories = Object.keys(competitiveData);
    const lowCompetition = categories.filter(
      cat => competitiveData[cat].competitionIntensity === 'low'
    ).length;

    const totalCategories = categories.length;
    const opportunityRatio = lowCompetition / totalCategories;

    if (opportunityRatio > 0.6) {
      return {
        assessment: 'favorable',
        message: 'Mercado con muchas oportunidades de bajo riesgo',
      };
    } else if (opportunityRatio > 0.3) {
      return {
        assessment: 'mixed',
        message: 'Mercado balanceado con oportunidades selectivas',
      };
    } else {
      return {
        assessment: 'challenging',
        message: 'Mercado competitivo - requiere diferenciación fuerte',
      };
    }
  }
}

module.exports = new DemandAnalyticsController();
