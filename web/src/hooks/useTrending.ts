import { useState, useEffect, useCallback } from 'react';
import { Event } from '@/types';

// ===== INTERFACES =====
interface TrendingEvent extends Event {
  trendingScore: number;
  trendingReason: string;
  velocityMetrics: {
    attendeeVelocity: number;
    engagementRate: number;
    shareVelocity: number;
    searchFrequency: number;
  };
}

interface TrendingMetrics {
  timeWindow: '1h' | '6h' | '24h' | '7d';
  location: 'local' | 'city' | 'global';
  category?: string;
}

// ===== SISTEMA DE TRENDING =====
export class TrendingSystem {
  /**
   * Calcula eventos trending basado en múltiples métricas
   */
  static calculateTrending(
    events: Event[], 
    metrics: TrendingMetrics = { timeWindow: '24h', location: 'city' }
  ): TrendingEvent[] {
    const now = Date.now();
    const timeWindowMs = this.getTimeWindowMs(metrics.timeWindow);
    
    return events
      .filter(event => {
        // Solo eventos futuros
        const eventDate = new Date(event.date);
        return eventDate > new Date();
      })
      .map(event => {
        const velocityMetrics = this.calculateVelocityMetrics(event, now, timeWindowMs);
        const trendingScore = this.calculateTrendingScore(event, velocityMetrics);
        const trendingReason = this.getTrendingReason(event, velocityMetrics);
        
        return {
          ...event,
          trendingScore,
          trendingReason,
          velocityMetrics
        } as TrendingEvent;
      })
      .filter(event => event.trendingScore > 10) // Umbral mínimo
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, 20);
  }

  /**
   * Calcula métricas de velocidad para un evento
   */
  private static calculateVelocityMetrics(
    event: Event, 
    now: number, 
    timeWindowMs: number
  ) {
    const eventCreated = new Date(event.createdAt || now).getTime();
    const timeSinceCreated = Math.max(1, now - eventCreated);
    const hoursActive = timeSinceCreated / (1000 * 60 * 60);
    
    // Velocidad de asistentes (asistentes por hora)
    const attendeeVelocity = (event.attendees || 0) / hoursActive;
    
    // Tasa de engagement (interacciones por asistente)
    const totalInteractions = (event.likes || 0) + (event.shares || 0) + (event.comments || 0);
    const engagementRate = event.attendees ? totalInteractions / event.attendees : 0;
    
    // Velocidad de compartidos
    const shareVelocity = (event.shares || 0) / hoursActive;
    
    // Frecuencia de búsqueda (simulada basada en popularidad)
    const searchFrequency = this.estimateSearchFrequency(event);
    
    return {
      attendeeVelocity,
      engagementRate,
      shareVelocity,
      searchFrequency
    };
  }

  /**
   * Calcula score de trending basado en múltiples factores
   */
  private static calculateTrendingScore(
    event: Event, 
    metrics: TrendingEvent['velocityMetrics']
  ): number {
    let score = 0;
    
    // 1. Velocidad de asistentes (40%)
    score += Math.min(metrics.attendeeVelocity * 10, 40);
    
    // 2. Engagement rate (25%)
    score += Math.min(metrics.engagementRate * 25, 25);
    
    // 3. Velocidad de compartidos (20%)
    score += Math.min(metrics.shareVelocity * 20, 20);
    
    // 4. Frecuencia de búsqueda (15%)
    score += Math.min(metrics.searchFrequency, 15);
    
    // Bonificaciones especiales
    if (event.isPopular) score *= 1.2;
    if (event.friendsAttending && event.friendsAttending > 0) score *= 1.1;
    
    // Penalización por eventos muy lejanos en el tiempo
    const daysUntilEvent = (new Date(event.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (daysUntilEvent > 30) score *= 0.8;
    else if (daysUntilEvent > 14) score *= 0.9;
    
    return Math.round(score);
  }

  /**
   * Determina la razón por la que un evento es trending
   */
  private static getTrendingReason(
    event: Event, 
    metrics: TrendingEvent['velocityMetrics']
  ): string {
    const reasons = [];
    
    if (metrics.attendeeVelocity > 5) {
      reasons.push('Se está llenando rápidamente');
    }
    
    if (metrics.engagementRate > 2) {
      reasons.push('Alta interacción de usuarios');
    }
    
    if (metrics.shareVelocity > 2) {
      reasons.push('Se está compartiendo mucho');
    }
    
    if (event.friendsAttending && event.friendsAttending > 2) {
      reasons.push('Tus amigos están interesados');
    }
    
    if (event.isPopular) {
      reasons.push('Muy popular en tu área');
    }
    
    return reasons.length > 0 ? reasons[0] : 'Ganando popularidad';
  }

  /**
   * Estima frecuencia de búsqueda basada en características del evento
   */
  private static estimateSearchFrequency(event: Event): number {
    let frequency = 0;
    
    // Basado en categoría popular
    const popularCategories = ['música', 'tecnología', 'gastronomía', 'arte'];
    if (popularCategories.includes(event.category.toLowerCase())) {
      frequency += 5;
    }
    
    // Basado en palabras clave trending
    const trendingKeywords = ['ai', 'crypto', 'sustainability', 'wellness', 'gaming'];
    const hasKeywords = trendingKeywords.some(keyword =>
      event.title.toLowerCase().includes(keyword) ||
      event.description?.toLowerCase().includes(keyword)
    );
    if (hasKeywords) frequency += 3;
    
    // Basado en número de asistentes
    const attendees = event.attendees || 0;
    frequency += Math.min(attendees / 20, 7);
    
    return frequency;
  }

  /**
   * Convierte ventana de tiempo a milisegundos
   */
  private static getTimeWindowMs(timeWindow: TrendingMetrics['timeWindow']): number {
    switch (timeWindow) {
      case '1h': return 60 * 60 * 1000;
      case '6h': return 6 * 60 * 60 * 1000;
      case '24h': return 24 * 60 * 60 * 1000;
      case '7d': return 7 * 24 * 60 * 60 * 1000;
      default: return 24 * 60 * 60 * 1000;
    }
  }
}

// ===== HOOK PRINCIPAL =====
export const useTrending = (metrics?: TrendingMetrics) => {
  const [trendingEvents, setTrendingEvents] = useState<TrendingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Configuración por defecto
  const defaultMetrics: TrendingMetrics = {
    timeWindow: '24h',
    location: 'city',
    ...metrics
  };

  /**
   * Actualiza eventos trending
   */
  const updateTrendingEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // En una implementación real, esto vendría del API
      // Por ahora, simularemos con datos mock
      const mockEvents: Event[] = [
        {
          id: '1',
          title: 'AI & Machine Learning Summit Madrid',
          description: 'El evento más grande de IA en España',
          category: 'Tecnología',
          date: '2024-12-25',
          location: 'WiZink Center, Madrid',
          distance: '2.1 km',
          attendees: 450,
          price: 75,
          host: { name: 'Tech Madrid', avatar: '/host1.jpg' },
          isPopular: true,
          createdAt: '2024-12-15',
          likes: 230,
          shares: 45,
          comments: 67,
          tags: ['ai', 'technology', 'networking']
        },
        {
          id: '2',
          title: 'Festival Gastronómico de Invierno',
          description: 'Los mejores chefs de Madrid se reúnen',
          category: 'Gastronomía',
          date: '2024-12-28',
          location: 'Retiro Park, Madrid',
          distance: '1.8 km',
          attendees: 320,
          price: 25,
          host: { name: 'Madrid Food', avatar: '/host2.jpg' },
          friendsAttending: 4,
          createdAt: '2024-12-16',
          likes: 180,
          shares: 32,
          comments: 41
        }
      ];

      const trending = TrendingSystem.calculateTrending(mockEvents, defaultMetrics);
      setTrendingEvents(trending);
      setLastUpdated(new Date());
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar trending');
    } finally {
      setLoading(false);
    }
  }, [defaultMetrics]);

  // Actualización automática cada 5 minutos
  useEffect(() => {
    updateTrendingEvents();
    
    const interval = setInterval(updateTrendingEvents, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [updateTrendingEvents]);

  /**
   * Obtiene trending por categoría específica
   */
  const getTrendingByCategory = useCallback((category: string) => {
    return trendingEvents.filter(event => 
      event.category.toLowerCase() === category.toLowerCase()
    );
  }, [trendingEvents]);

  /**
   * Obtiene trending local (basado en distancia)
   */
  const getLocalTrending = useCallback((maxDistance: number = 10) => {
    return trendingEvents.filter(event => {
      if (!event.distance) return true;
      const distance = parseFloat(event.distance.replace('km', ''));
      return distance <= maxDistance;
    });
  }, [trendingEvents]);

  /**
   * Fuerza actualización manual
   */
  const refresh = useCallback(() => {
    updateTrendingEvents();
  }, [updateTrendingEvents]);

  return {
    trendingEvents,
    loading,
    error,
    lastUpdated,
    getTrendingByCategory,
    getLocalTrending,
    refresh,
    
    // Métricas adicionales
    totalTrending: trendingEvents.length,
    averageScore: trendingEvents.length > 0 
      ? Math.round(trendingEvents.reduce((sum, e) => sum + e.trendingScore, 0) / trendingEvents.length)
      : 0
  };
};

// ===== HOOK PARA TRENDING EN TIEMPO REAL =====
export const useTrendingRealTime = () => {
  const [realTimeEvents, setRealTimeEvents] = useState<TrendingEvent[]>([]);
  
  useEffect(() => {
    // WebSocket para actualizaciones en tiempo real
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/trending`);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'trending_update') {
          setRealTimeEvents(data.events);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    return () => {
      ws.close();
    };
  }, []);
  
  return {
    realTimeEvents,
    isConnected: realTimeEvents.length > 0
  };
};