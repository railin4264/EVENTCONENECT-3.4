const { User, Event, Follow } = require('../models');

class DemandAnalyticsService {
  
  // ==========================================
  // ANÁLISIS DE DEMANDA LOCAL
  // ==========================================
  
  async analyzeLocalDemand(location, radius = 25) {
    try {
      const demandData = await this.calculateDemandMetrics(location, radius);
      const opportunities = await this.identifyOpportunities(demandData);
      const trends = await this.analyzeTrends(location, radius);
      
      return {
        success: true,
        data: {
          location,
          radius,
          analysis: demandData,
          opportunities,
          trends,
          generatedAt: new Date()
        }
      };
    } catch (error) {
      console.error('Error analyzing local demand:', error);
      return {
        success: false,
        message: 'Error analizando demanda local'
      };
    }
  }

  async calculateDemandMetrics(location, radius) {
    const [lng, lat] = location.coordinates;
    
    // Obtener usuarios en el área
    const usersInArea = await User.find({
      'location.coordinates': {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: radius * 1000
        }
      },
      isActive: true
    }).select('interests preferences dateOfBirth');

    // Obtener eventos recientes en el área
    const recentEvents = await Event.find({
      'location.coordinates': {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: radius * 1000
        }
      },
      startDate: {
        $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Últimos 90 días
      }
    }).select('category attendees price tags startDate');

    // Calcular métricas por categoría
    const categoryDemand = await this.calculateCategoryDemand(usersInArea, recentEvents);
    
    // Análisis demográfico
    const demographics = this.analyzeDemographics(usersInArea);
    
    // Análisis de competencia
    const competition = await this.analyzeCompetition(recentEvents);
    
    // Análisis de precios
    const pricing = this.analyzePricing(recentEvents);
    
    return {
      totalUsers: usersInArea.length,
      totalEvents: recentEvents.length,
      categoryDemand,
      demographics,
      competition,
      pricing,
      marketSaturation: this.calculateMarketSaturation(usersInArea.length, recentEvents.length)
    };
  }

  calculateCategoryDemand(users, events) {
    const categories = [
      'music', 'sports', 'technology', 'art', 'food', 'business', 
      'education', 'health', 'outdoors', 'social', 'gaming', 'fitness'
    ];
    
    const demand = {};
    
    categories.forEach(category => {
      // Contar usuarios interesados en esta categoría
      const interestedUsers = users.filter(user => 
        user.interests.includes(category)
      ).length;
      
      // Contar eventos recientes de esta categoría
      const recentEvents = events.filter(event => 
        event.category === category
      );
      
      // Calcular demanda total (asistentes a eventos de esta categoría)
      const totalAttendees = recentEvents.reduce((sum, event) => 
        sum + (event.attendees?.length || 0), 0
      );
      
      // Calcular ratio demanda/oferta
      const demandSupplyRatio = recentEvents.length > 0 ? 
        interestedUsers / recentEvents.length : interestedUsers;
      
      // Calcular puntuación de oportunidad
      const opportunityScore = this.calculateOpportunityScore(
        interestedUsers, 
        recentEvents.length, 
        totalAttendees
      );
      
      demand[category] = {
        interestedUsers,
        recentEvents: recentEvents.length,
        totalAttendees,
        demandSupplyRatio,
        opportunityScore,
        averageAttendance: recentEvents.length > 0 ? 
          totalAttendees / recentEvents.length : 0,
        competitionLevel: this.getCompetitionLevel(recentEvents.length, interestedUsers)
      };
    });
    
    return demand;
  }

  calculateOpportunityScore(interestedUsers, eventCount, totalAttendees) {
    // Factores que influyen en la puntuación de oportunidad
    const userDemandWeight = 0.4;
    const competitionWeight = 0.3;
    const attendanceWeight = 0.3;
    
    // Normalizar métricas (0-100)
    const userDemandScore = Math.min(interestedUsers / 10, 10) * 10; // Max 100 usuarios = 100 puntos
    const competitionScore = Math.max(0, 100 - (eventCount * 20)); // Menos eventos = mejor
    const attendanceScore = totalAttendees > 0 ? 
      Math.min(totalAttendees / 100, 10) * 10 : 50; // Historial de asistencia
    
    return Math.round(
      userDemandScore * userDemandWeight +
      competitionScore * competitionWeight +
      attendanceScore * attendanceWeight
    );
  }

  getCompetitionLevel(eventCount, interestedUsers) {
    const ratio = eventCount / Math.max(interestedUsers / 50, 1);
    
    if (ratio < 0.5) return 'low';
    if (ratio < 2) return 'medium';
    return 'high';
  }

  analyzeDemographics(users) {
    const demographics = {
      ageGroups: { '18-24': 0, '25-34': 0, '35-44': 0, '45+': 0 },
      totalUsers: users.length
    };
    
    users.forEach(user => {
      if (user.dateOfBirth) {
        const age = this.calculateAge(user.dateOfBirth);
        if (age >= 18 && age <= 24) demographics.ageGroups['18-24']++;
        else if (age >= 25 && age <= 34) demographics.ageGroups['25-34']++;
        else if (age >= 35 && age <= 44) demographics.ageGroups['35-44']++;
        else if (age >= 45) demographics.ageGroups['45+']++;
      }
    });
    
    // Calcular porcentajes
    Object.keys(demographics.ageGroups).forEach(group => {
      demographics.ageGroups[group] = {
        count: demographics.ageGroups[group],
        percentage: demographics.totalUsers > 0 ? 
          (demographics.ageGroups[group] / demographics.totalUsers) * 100 : 0
      };
    });
    
    return demographics;
  }

  analyzeCompetition(events) {
    const eventsByCategory = {};
    const competitionMetrics = {};
    
    events.forEach(event => {
      if (!eventsByCategory[event.category]) {
        eventsByCategory[event.category] = [];
      }
      eventsByCategory[event.category].push(event);
    });
    
    Object.keys(eventsByCategory).forEach(category => {
      const categoryEvents = eventsByCategory[category];
      const totalAttendees = categoryEvents.reduce((sum, event) => 
        sum + (event.attendees?.length || 0), 0
      );
      
      competitionMetrics[category] = {
        eventCount: categoryEvents.length,
        averageAttendees: categoryEvents.length > 0 ? 
          totalAttendees / categoryEvents.length : 0,
        marketShare: events.length > 0 ? 
          (categoryEvents.length / events.length) * 100 : 0,
        competitionIntensity: this.calculateCompetitionIntensity(categoryEvents)
      };
    });
    
    return competitionMetrics;
  }

  calculateCompetitionIntensity(events) {
    if (events.length === 0) return 'none';
    
    // Analizar frecuencia de eventos
    const now = new Date();
    const recentEvents = events.filter(event => 
      (now - new Date(event.startDate)) < (30 * 24 * 60 * 60 * 1000)
    ).length;
    
    if (recentEvents === 0) return 'low';
    if (recentEvents <= 2) return 'medium';
    return 'high';
  }

  analyzePricing(events) {
    const paidEvents = events.filter(event => event.price > 0);
    
    if (paidEvents.length === 0) {
      return {
        averagePrice: 0,
        medianPrice: 0,
        priceRange: { min: 0, max: 0 },
        paidEventPercentage: 0
      };
    }
    
    const prices = paidEvents.map(event => event.price).sort((a, b) => a - b);
    const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const medianPrice = prices[Math.floor(prices.length / 2)];
    
    return {
      averagePrice: Math.round(averagePrice * 100) / 100,
      medianPrice,
      priceRange: { min: prices[0], max: prices[prices.length - 1] },
      paidEventPercentage: (paidEvents.length / events.length) * 100
    };
  }

  calculateMarketSaturation(userCount, eventCount) {
    if (userCount === 0) return 0;
    
    const eventsPerUser = eventCount / userCount;
    
    // Escala de saturación: 0-100
    // 0 = sin eventos, 100 = muy saturado
    return Math.min(eventsPerUser * 1000, 100);
  }

  async identifyOpportunities(demandData) {
    const opportunities = [];
    
    Object.entries(demandData.categoryDemand).forEach(([category, data]) => {
      if (data.opportunityScore >= 70) {
        opportunities.push({
          category,
          type: 'high_demand',
          score: data.opportunityScore,
          description: `Alta demanda en ${category} con baja competencia`,
          metrics: {
            interestedUsers: data.interestedUsers,
            competition: data.competitionLevel,
            potentialAttendees: Math.floor(data.interestedUsers * 0.3) // 30% conversion
          },
          recommendations: this.generateCategoryRecommendations(category, data)
        });
      }
    });
    
    // Oportunidades basadas en demografía
    const demographicOpportunities = this.identifyDemographicOpportunities(
      demandData.demographics
    );
    opportunities.push(...demographicOpportunities);
    
    // Oportunidades de precio
    const pricingOpportunities = this.identifyPricingOpportunities(
      demandData.pricing,
      demandData.categoryDemand
    );
    opportunities.push(...pricingOpportunities);
    
    return opportunities.sort((a, b) => b.score - a.score);
  }

  generateCategoryRecommendations(category, data) {
    const recommendations = [];
    
    // Recomendaciones de precio
    if (data.competitionLevel === 'low') {
      recommendations.push('Considera precios premium por la baja competencia');
    }
    
    // Recomendaciones de timing
    recommendations.push(this.getOptimalTiming(category));
    
    // Recomendaciones de formato
    recommendations.push(this.getOptimalFormat(category, data.interestedUsers));
    
    return recommendations;
  }

  getOptimalTiming(category) {
    const timingMap = {
      'technology': 'Martes y miércoles por la tarde funcionan mejor',
      'business': 'Jueves por la mañana o viernes después del trabajo',
      'music': 'Viernes y sábados por la noche',
      'sports': 'Fines de semana por la mañana',
      'education': 'Sábados por la mañana',
      'food': 'Viernes y sábados por la noche'
    };
    
    return timingMap[category] || 'Evalúa horarios según tu audiencia específica';
  }

  getOptimalFormat(category, userCount) {
    if (userCount < 20) return 'Formato íntimo o workshop pequeño';
    if (userCount < 100) return 'Evento mediano o conferencia';
    return 'Considera un evento grande o festival';
  }

  identifyDemographicOpportunities(demographics) {
    const opportunities = [];
    
    // Oportunidad si hay un grupo demográfico dominante
    Object.entries(demographics.ageGroups).forEach(([ageGroup, data]) => {
      if (data.percentage > 40) {
        opportunities.push({
          category: 'demographic',
          type: 'age_focused',
          score: Math.floor(data.percentage),
          description: `Audiencia concentrada en ${ageGroup} años (${data.percentage.toFixed(1)}%)`,
          recommendations: [
            `Crear eventos específicos para el grupo ${ageGroup}`,
            'Adaptar el marketing para esta demografía',
            'Considerar precios según el poder adquisitivo del grupo'
          ]
        });
      }
    });
    
    return opportunities;
  }

  identifyPricingOpportunities(pricing, categoryDemand) {
    const opportunities = [];
    
    // Oportunidad si el mercado es principalmente gratuito
    if (pricing.paidEventPercentage < 30) {
      opportunities.push({
        category: 'pricing',
        type: 'monetization',
        score: 75,
        description: `Solo ${pricing.paidEventPercentage.toFixed(1)}% de eventos son pagos`,
        recommendations: [
          'Oportunidad de crear eventos premium pagos',
          `Precio sugerido: $${pricing.averagePrice > 0 ? pricing.averagePrice : 25}-50`,
          'Enfócate en valor agregado y experiencias exclusivas'
        ]
      });
    }
    
    return opportunities;
  }

  async analyzeTrends(location, radius) {
    const [lng, lat] = location.coordinates;
    
    // Analizar tendencias de los últimos 6 meses
    const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
    
    const trendEvents = await Event.find({
      'location.coordinates': {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: radius * 1000
        }
      },
      startDate: { $gte: sixMonthsAgo }
    }).select('category startDate attendees tags');

    return this.calculateTrends(trendEvents);
  }

  calculateTrends(events) {
    const monthlyData = {};
    const categoryTrends = {};
    
    events.forEach(event => {
      const month = new Date(event.startDate).toISOString().slice(0, 7); // YYYY-MM
      
      if (!monthlyData[month]) {
        monthlyData[month] = { count: 0, attendees: 0, categories: {} };
      }
      
      monthlyData[month].count++;
      monthlyData[month].attendees += event.attendees?.length || 0;
      
      if (!monthlyData[month].categories[event.category]) {
        monthlyData[month].categories[event.category] = 0;
      }
      monthlyData[month].categories[event.category]++;
      
      // Trend por categoría
      if (!categoryTrends[event.category]) {
        categoryTrends[event.category] = [];
      }
      categoryTrends[event.category].push({
        month,
        attendees: event.attendees?.length || 0
      });
    });

    return {
      monthlyGrowth: this.calculateGrowthRate(monthlyData),
      categoryTrends: this.calculateCategoryTrends(categoryTrends),
      emergingCategories: this.identifyEmergingCategories(categoryTrends),
      seasonalPatterns: this.identifySeasonalPatterns(monthlyData)
    };
  }

  calculateGrowthRate(monthlyData) {
    const months = Object.keys(monthlyData).sort();
    if (months.length < 2) return 0;
    
    const firstMonth = monthlyData[months[0]];
    const lastMonth = monthlyData[months[months.length - 1]];
    
    return ((lastMonth.count - firstMonth.count) / firstMonth.count) * 100;
  }

  calculateCategoryTrends(categoryTrends) {
    const trends = {};
    
    Object.entries(categoryTrends).forEach(([category, data]) => {
      if (data.length < 2) {
        trends[category] = { trend: 'stable', growth: 0 };
        return;
      }
      
      const totalAttendees = data.reduce((sum, item) => sum + item.attendees, 0);
      const avgAttendees = totalAttendees / data.length;
      
      // Calcular tendencia simple
      const firstHalf = data.slice(0, Math.floor(data.length / 2));
      const secondHalf = data.slice(Math.floor(data.length / 2));
      
      const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.attendees, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.attendees, 0) / secondHalf.length;
      
      const growth = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
      
      trends[category] = {
        trend: growth > 10 ? 'growing' : growth < -10 ? 'declining' : 'stable',
        growth: Math.round(growth),
        avgAttendees: Math.round(avgAttendees)
      };
    });
    
    return trends;
  }

  identifyEmergingCategories(categoryTrends) {
    return Object.entries(categoryTrends)
      .filter(([_, data]) => data.length >= 2)
      .map(([category, data]) => {
        const growth = this.calculateSimpleGrowth(data);
        return { category, growth };
      })
      .filter(item => item.growth > 50)
      .sort((a, b) => b.growth - a.growth);
  }

  calculateSimpleGrowth(data) {
    if (data.length < 2) return 0;
    
    const recent = data.slice(-2);
    return ((recent[1].attendees - recent[0].attendees) / recent[0].attendees) * 100;
  }

  identifySeasonalPatterns(monthlyData) {
    const months = Object.keys(monthlyData).sort();
    const patterns = {};
    
    months.forEach(month => {
      const monthNum = parseInt(month.split('-')[1]);
      const season = this.getSeason(monthNum);
      
      if (!patterns[season]) {
        patterns[season] = { events: 0, attendees: 0 };
      }
      
      patterns[season].events += monthlyData[month].count;
      patterns[season].attendees += monthlyData[month].attendees;
    });
    
    return patterns;
  }

  getSeason(month) {
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }

  // ==========================================
  // SUGERENCIAS INTELIGENTES PARA CREADORES
  // ==========================================
  
  async generateEventSuggestions(userId, location) {
    try {
      const user = await User.findById(userId)
        .select('interests preferences stats location');
        
      if (!user) {
        return { success: false, message: 'Usuario no encontrado' };
      }

      // Análisis de demanda local
      const demandAnalysis = await this.analyzeLocalDemand(location || user.location);
      
      if (!demandAnalysis.success) {
        return demandAnalysis;
      }

      // Generar sugerencias personalizadas
      const suggestions = await this.generatePersonalizedSuggestions(
        user, 
        demandAnalysis.data
      );

      return {
        success: true,
        data: {
          suggestions,
          demandAnalysis: demandAnalysis.data,
          recommendationReason: 'Basado en tus intereses, experiencia como organizador y demanda local'
        }
      };
    } catch (error) {
      console.error('Error generating event suggestions:', error);
      return {
        success: false,
        message: 'Error generando sugerencias'
      };
    }
  }

  async generatePersonalizedSuggestions(user, demandData) {
    const suggestions = [];
    
    // Sugerencias basadas en intereses del usuario
    user.interests.forEach(interest => {
      const categoryData = demandData.analysis.categoryDemand[interest];
      
      if (categoryData && categoryData.opportunityScore > 60) {
        suggestions.push({
          type: 'interest_based',
          category: interest,
          confidence: categoryData.opportunityScore,
          title: `Evento de ${this.getCategoryLabel(interest)}`,
          description: `Hay ${categoryData.interestedUsers} personas interesadas en ${interest} en tu área`,
          marketData: {
            demand: categoryData.interestedUsers,
            competition: categoryData.competitionLevel,
            potentialAttendees: Math.floor(categoryData.interestedUsers * 0.25),
            suggestedPrice: this.suggestPrice(interest, categoryData, demandData.analysis.pricing)
          },
          recommendations: categoryData.recommendations || []
        });
      }
    });

    // Sugerencias basadas en oportunidades de mercado
    demandData.opportunities
      .filter(opp => opp.score > 70)
      .slice(0, 3)
      .forEach(opportunity => {
        suggestions.push({
          type: 'market_opportunity',
          category: opportunity.category,
          confidence: opportunity.score,
          title: `Oportunidad en ${this.getCategoryLabel(opportunity.category)}`,
          description: opportunity.description,
          marketData: opportunity.metrics,
          recommendations: opportunity.recommendations
        });
      });

    // Sugerencias basadas en experiencia del usuario
    if (user.stats.eventsHosted > 0) {
      const experienceSuggestions = this.generateExperienceBasedSuggestions(
        user, 
        demandData
      );
      suggestions.push(...experienceSuggestions);
    }

    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5); // Top 5 sugerencias
  }

  generateExperienceBasedSuggestions(user, demandData) {
    const suggestions = [];
    
    // Si el usuario tiene experiencia, sugerir categorías relacionadas
    if (user.stats.averageRating > 4.0) {
      const highOpportunityCategories = Object.entries(demandData.analysis.categoryDemand)
        .filter(([_, data]) => data.opportunityScore > 65)
        .map(([category, _]) => category);

      highOpportunityCategories.forEach(category => {
        if (!user.interests.includes(category)) {
          suggestions.push({
            type: 'expansion_opportunity',
            category: category,
            confidence: 75,
            title: `Expandir a ${this.getCategoryLabel(category)}`,
            description: `Con tu experiencia (${user.stats.averageRating}★), podrías tener éxito en esta categoría`,
            marketData: demandData.analysis.categoryDemand[category],
            recommendations: [
              'Comienza con un evento pequeño para probar el mercado',
              'Usa tu reputación existente para promocionar',
              'Considera colaborar con expertos en la categoría'
            ]
          });
        }
      });
    }

    return suggestions;
  }

  suggestPrice(category, categoryData, pricingData) {
    // Precio base por categoría
    const basePrices = {
      'technology': 35,
      'business': 45,
      'education': 25,
      'music': 30,
      'art': 20,
      'food': 40,
      'sports': 15,
      'health': 30
    };

    let basePrice = basePrices[category] || 25;

    // Ajustar por competencia
    if (categoryData.competitionLevel === 'low') {
      basePrice *= 1.3; // 30% más si hay poca competencia
    } else if (categoryData.competitionLevel === 'high') {
      basePrice *= 0.8; // 20% menos si hay mucha competencia
    }

    // Ajustar por demanda
    if (categoryData.interestedUsers > 100) {
      basePrice *= 1.2; // 20% más si hay alta demanda
    }

    // Considerar precios del mercado local
    if (pricingData.averagePrice > 0) {
      basePrice = (basePrice + pricingData.averagePrice) / 2;
    }

    return Math.round(basePrice);
  }

  getCategoryLabel(category) {
    const labels = {
      'music': 'Música',
      'sports': 'Deportes',
      'technology': 'Tecnología',
      'art': 'Arte',
      'food': 'Gastronomía',
      'business': 'Negocios',
      'education': 'Educación',
      'health': 'Salud',
      'outdoors': 'Aire Libre',
      'social': 'Social',
      'gaming': 'Gaming',
      'fitness': 'Fitness'
    };
    
    return labels[category] || category;
  }

  calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}

module.exports = new DemandAnalyticsService();
