import { User, Event, Notification } from '@/types';

// ===== INTERFACES =====
interface NotificationRule {
  type: Notification['type'];
  maxPerDay: number;
  maxPerHour: number;
  cooldownMinutes: number;
  requiresUserInterest: boolean;
  quietHours: { start: number; end: number };
}

interface NotificationContext {
  user: User;
  event?: Event;
  timeOfDay: number;
  dayOfWeek: number;
  userTimezone: string;
  recentActivity: string[];
}

interface SmartNotificationOptions {
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  bypassRules?: boolean;
  customCooldown?: number;
  targetAudience?: 'all' | 'interested' | 'nearby' | 'friends';
}

// ===== CONFIGURACIÓN DE REGLAS =====
const NOTIFICATION_RULES: Record<Notification['type'], NotificationRule> = {
  event_reminder: {
    maxPerDay: 3,
    maxPerHour: 1,
    cooldownMinutes: 60,
    requiresUserInterest: false,
    quietHours: { start: 22, end: 8 }
  },
  friend_joined: {
    maxPerDay: 5,
    maxPerHour: 2,
    cooldownMinutes: 30,
    requiresUserInterest: false,
    quietHours: { start: 23, end: 7 }
  },
  trending: {
    maxPerDay: 2,
    maxPerHour: 1,
    cooldownMinutes: 180,
    requiresUserInterest: true,
    quietHours: { start: 22, end: 9 }
  },
  achievement: {
    maxPerDay: 10,
    maxPerHour: 3,
    cooldownMinutes: 0,
    requiresUserInterest: false,
    quietHours: { start: 24, end: 0 } // Sin quiet hours para logros
  },
  tribe_invite: {
    maxPerDay: 3,
    maxPerHour: 1,
    cooldownMinutes: 120,
    requiresUserInterest: true,
    quietHours: { start: 22, end: 8 }
  },
  event_update: {
    maxPerDay: 5,
    maxPerHour: 2,
    cooldownMinutes: 15,
    requiresUserInterest: false,
    quietHours: { start: 23, end: 7 }
  }
};

// ===== SERVICIO DE NOTIFICACIONES INTELIGENTES =====
export class SmartNotificationService {
  private static notificationHistory: Map<string, Notification[]> = new Map();
  
  /**
   * Determina si se debe enviar una notificación
   */
  static shouldNotify(
    context: NotificationContext,
    notificationType: Notification['type'],
    options: SmartNotificationOptions = {}
  ): { allowed: boolean; reason: string } {
    const { user } = context;
    const rule = NOTIFICATION_RULES[notificationType];
    
    // Bypass para notificaciones urgentes
    if (options.bypassRules || options.priority === 'urgent') {
      return { allowed: true, reason: 'Urgente - bypass de reglas' };
    }
    
    // Verificar preferencias del usuario
    if (!this.checkUserPreferences(user, notificationType)) {
      return { allowed: false, reason: 'Usuario desactivó este tipo de notificación' };
    }
    
    // Verificar quiet hours
    if (this.isInQuietHours(context.timeOfDay, rule.quietHours)) {
      return { allowed: false, reason: 'Horario de silencio activo' };
    }
    
    // Verificar límites de frecuencia
    const frequencyCheck = this.checkFrequencyLimits(user.id, notificationType, rule);
    if (!frequencyCheck.allowed) {
      return frequencyCheck;
    }
    
    // Verificar relevancia por intereses
    if (rule.requiresUserInterest && context.event) {
      const relevanceCheck = this.checkRelevance(user, context.event);
      if (!relevanceCheck.allowed) {
        return relevanceCheck;
      }
    }
    
    // Verificar fatiga de notificaciones
    const fatigueCheck = this.checkNotificationFatigue(user.id);
    if (!fatigueCheck.allowed) {
      return fatigueCheck;
    }
    
    return { allowed: true, reason: 'Todas las verificaciones pasadas' };
  }
  
  /**
   * Envía notificación inteligente con verificaciones
   */
  static async sendSmartNotification(
    context: NotificationContext,
    notification: Omit<Notification, 'id' | 'createdAt'>,
    options: SmartNotificationOptions = {}
  ): Promise<{ sent: boolean; reason: string }> {
    const shouldSend = this.shouldNotify(context, notification.type, options);
    
    if (!shouldSend.allowed) {
      return { sent: false, reason: shouldSend.reason };
    }
    
    // Personalizar contenido de la notificación
    const personalizedNotification = this.personalizeNotification(context, notification);
    
    // Registrar en historial
    this.recordNotification(context.user.id, {
      ...personalizedNotification,
      id: this.generateNotificationId(),
      createdAt: new Date().toISOString()
    });
    
    // Enviar notificación (aquí se integraría con el sistema real)
    await this.deliverNotification(context.user, personalizedNotification);
    
    // Analizar efectividad
    this.trackNotificationSent(context.user.id, notification.type);
    
    return { sent: true, reason: 'Notificación enviada exitosamente' };
  }
  
  /**
   * Personaliza el contenido de la notificación
   */
  private static personalizeNotification(
    context: NotificationContext,
    notification: Omit<Notification, 'id' | 'createdAt'>
  ): typeof notification {
    const { user, event } = context;
    
    let personalizedTitle = notification.title;
    let personalizedMessage = notification.message;
    
    // Personalización por tipo
    switch (notification.type) {
      case 'event_reminder':
        if (event) {
          personalizedTitle = `¡${event.title} es mañana!`;
          personalizedMessage = `Hola ${user.firstName}, no olvides que ${event.title} es mañana a las ${this.formatEventTime(event.date)}. ¡Te esperamos! 🎉`;
        }
        break;
        
      case 'friend_joined':
        if (event && notification.data?.friendName) {
          personalizedTitle = `${notification.data.friendName} va al mismo evento`;
          personalizedMessage = `¡Genial! ${notification.data.friendName} también va a ${event.title}. ¡Será una gran oportunidad para conectar!`;
        }
        break;
        
      case 'trending':
        if (event) {
          const reasons = this.getTrendingReasons(user, event);
          personalizedTitle = `${event.title} está trending`;
          personalizedMessage = `${event.title} está ganando popularidad ${reasons}. ¡No te lo pierdas!`;
        }
        break;
        
      case 'achievement':
        if (notification.data?.achievementTitle) {
          personalizedTitle = `¡Nuevo logro desbloqueado!`;
          personalizedMessage = `¡Felicidades ${user.firstName}! Desbloqueaste "${notification.data.achievementTitle}" y ganaste ${notification.data.points} puntos. 🏆`;
        }
        break;
    }
    
    return {
      ...notification,
      title: personalizedTitle,
      message: personalizedMessage
    };
  }
  
  /**
   * Verifica preferencias del usuario
   */
  private static checkUserPreferences(user: User, type: Notification['type']): boolean {
    const prefs = user.notificationPreferences || {};
    
    switch (type) {
      case 'trending':
        return prefs.trending !== false;
      case 'friend_joined':
        return prefs.friends !== false;
      case 'event_reminder':
        return prefs.reminders !== false;
      case 'achievement':
        return true; // Logros siempre se notifican
      default:
        return prefs.newEvents !== false;
    }
  }
  
  /**
   * Verifica si está en horario de silencio
   */
  private static isInQuietHours(currentHour: number, quietHours: { start: number; end: number }): boolean {
    const { start, end } = quietHours;
    
    if (start === 24 && end === 0) return false; // Sin quiet hours
    
    if (start < end) {
      return currentHour >= start && currentHour < end;
    } else {
      return currentHour >= start || currentHour < end;
    }
  }
  
  /**
   * Verifica límites de frecuencia
   */
  private static checkFrequencyLimits(
    userId: string, 
    type: Notification['type'], 
    rule: NotificationRule
  ): { allowed: boolean; reason: string } {
    const userHistory = this.notificationHistory.get(userId) || [];
    const now = Date.now();
    
    // Verificar límite por hora
    const lastHour = userHistory.filter(n => 
      n.type === type && 
      now - new Date(n.createdAt).getTime() < 60 * 60 * 1000
    );
    
    if (lastHour.length >= rule.maxPerHour) {
      return { 
        allowed: false, 
        reason: `Límite por hora alcanzado (${rule.maxPerHour}/hora)` 
      };
    }
    
    // Verificar límite por día
    const today = userHistory.filter(n => 
      n.type === type && 
      now - new Date(n.createdAt).getTime() < 24 * 60 * 60 * 1000
    );
    
    if (today.length >= rule.maxPerDay) {
      return { 
        allowed: false, 
        reason: `Límite diario alcanzado (${rule.maxPerDay}/día)` 
      };
    }
    
    // Verificar cooldown
    if (rule.cooldownMinutes > 0) {
      const lastNotification = userHistory
        .filter(n => n.type === type)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      
      if (lastNotification) {
        const timeSinceLast = now - new Date(lastNotification.createdAt).getTime();
        const cooldownMs = rule.cooldownMinutes * 60 * 1000;
        
        if (timeSinceLast < cooldownMs) {
          const remainingMinutes = Math.ceil((cooldownMs - timeSinceLast) / (60 * 1000));
          return { 
            allowed: false, 
            reason: `Cooldown activo (${remainingMinutes} min restantes)` 
          };
        }
      }
    }
    
    return { allowed: true, reason: 'Límites de frecuencia OK' };
  }
  
  /**
   * Verifica relevancia del evento para el usuario
   */
  private static checkRelevance(user: User, event: Event): { allowed: boolean; reason: string } {
    // Verificar intereses del usuario
    const userInterests = user.interests?.map(i => i.toLowerCase()) || [];
    const eventCategory = event.category.toLowerCase();
    const eventTags = event.tags?.map(t => t.toLowerCase()) || [];
    
    const hasInterestMatch = userInterests.some(interest =>
      eventCategory.includes(interest) ||
      eventTags.some(tag => tag.includes(interest) || interest.includes(tag))
    );
    
    if (!hasInterestMatch) {
      return { 
        allowed: false, 
        reason: 'Evento no coincide con intereses del usuario' 
      };
    }
    
    // Verificar distancia (solo notificar eventos cercanos para trending)
    if (event.distance) {
      const distance = parseFloat(event.distance.replace('km', ''));
      if (distance > 25) {
        return { 
          allowed: false, 
          reason: 'Evento demasiado lejos para notificación trending' 
        };
      }
    }
    
    return { allowed: true, reason: 'Evento relevante para el usuario' };
  }
  
  /**
   * Verifica fatiga de notificaciones
   */
  private static checkNotificationFatigue(userId: string): { allowed: boolean; reason: string } {
    const userHistory = this.notificationHistory.get(userId) || [];
    const now = Date.now();
    
    // Verificar total de notificaciones en las últimas 24 horas
    const last24Hours = userHistory.filter(n => 
      now - new Date(n.createdAt).getTime() < 24 * 60 * 60 * 1000
    );
    
    if (last24Hours.length >= 15) {
      return { 
        allowed: false, 
        reason: 'Usuario ha recibido demasiadas notificaciones hoy' 
      };
    }
    
    // Verificar ráfagas de notificaciones (más de 3 en 10 minutos)
    const last10Minutes = userHistory.filter(n => 
      now - new Date(n.createdAt).getTime() < 10 * 60 * 1000
    );
    
    if (last10Minutes.length >= 3) {
      return { 
        allowed: false, 
        reason: 'Demasiadas notificaciones en poco tiempo' 
      };
    }
    
    return { allowed: true, reason: 'Sin fatiga de notificaciones' };
  }
  
  /**
   * Registra notificación en el historial
   */
  private static recordNotification(userId: string, notification: Notification): void {
    const userHistory = this.notificationHistory.get(userId) || [];
    userHistory.push(notification);
    
    // Mantener solo últimas 100 notificaciones por usuario
    if (userHistory.length > 100) {
      userHistory.splice(0, userHistory.length - 100);
    }
    
    this.notificationHistory.set(userId, userHistory);
    
    // Persistir en localStorage para demo
    localStorage.setItem(
      `notification_history_${userId}`, 
      JSON.stringify(userHistory.slice(-50))
    );
  }
  
  /**
   * Entrega la notificación al usuario
   */
  private static async deliverNotification(
    user: User, 
    notification: Omit<Notification, 'id' | 'createdAt'>
  ): Promise<void> {
    // En una implementación real, aquí se enviaría via:
    // - Push notification (FCM, APNS)
    // - Email (SendGrid, Mailgun)
    // - SMS (Twilio)
    // - In-app notification
    
    console.log(`📱 Notificación para ${user.firstName}:`, {
      title: notification.title,
      message: notification.message,
      type: notification.type
    });
    
    // Simular envío con delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  /**
   * Genera razones de trending personalizadas
   */
  private static getTrendingReasons(user: User, event: Event): string {
    const reasons = [];
    
    if (event.friendsAttending && event.friendsAttending > 0) {
      reasons.push(`porque ${event.friendsAttending} de tus amigos van`);
    }
    
    if (user.interests?.some(interest => 
      event.category.toLowerCase().includes(interest.toLowerCase())
    )) {
      reasons.push('en tu categoría favorita');
    }
    
    if (event.distance && parseFloat(event.distance.replace('km', '')) <= 5) {
      reasons.push('cerca de ti');
    }
    
    return reasons.length > 0 ? reasons.join(' y ') : 'en tu área';
  }
  
  /**
   * Formatea hora del evento
   */
  private static formatEventTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
  
  /**
   * Genera ID único para notificación
   */
  private static generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Rastrea notificación enviada para analytics
   */
  private static trackNotificationSent(userId: string, type: Notification['type']): void {
    // Aquí se enviarían métricas a analytics
    console.log(`📊 Notificación ${type} enviada a usuario ${userId}`);
  }
  
  /**
   * Carga historial de notificaciones desde localStorage
   */
  static loadNotificationHistory(userId: string): void {
    try {
      const stored = localStorage.getItem(`notification_history_${userId}`);
      if (stored) {
        const history = JSON.parse(stored);
        this.notificationHistory.set(userId, history);
      }
    } catch (error) {
      console.error('Error loading notification history:', error);
    }
  }
  
  /**
   * Obtiene estadísticas de notificaciones del usuario
   */
  static getNotificationStats(userId: string) {
    const history = this.notificationHistory.get(userId) || [];
    const now = Date.now();
    
    const last24Hours = history.filter(n => 
      now - new Date(n.createdAt).getTime() < 24 * 60 * 60 * 1000
    );
    
    const byType = history.reduce((acc, notification) => {
      acc[notification.type] = (acc[notification.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total: history.length,
      last24Hours: last24Hours.length,
      byType,
      lastNotification: history[history.length - 1]?.createdAt
    };
  }
  
  /**
   * Programa notificaciones automáticas
   */
  static scheduleEventReminders(events: Event[], users: User[]): void {
    events.forEach(event => {
      const eventDate = new Date(event.date);
      const now = new Date();
      
      // Recordatorio 24 horas antes
      const reminder24h = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000);
      if (reminder24h > now) {
        setTimeout(() => {
          users.forEach(user => {
            // Solo a usuarios que van al evento
            if (this.userIsAttending(user, event)) {
              const context: NotificationContext = {
                user,
                event,
                timeOfDay: reminder24h.getHours(),
                dayOfWeek: reminder24h.getDay(),
                userTimezone: 'Europe/Madrid',
                recentActivity: []
              };
              
              this.sendSmartNotification(context, {
                type: 'event_reminder',
                title: `Recordatorio: ${event.title}`,
                message: `Tu evento es mañana`,
                data: { eventId: event.id, reminderType: '24h' },
                read: false,
                priority: 'medium'
              });
            }
          });
        }, reminder24h.getTime() - now.getTime());
      }
      
      // Recordatorio 2 horas antes
      const reminder2h = new Date(eventDate.getTime() - 2 * 60 * 60 * 1000);
      if (reminder2h > now) {
        setTimeout(() => {
          users.forEach(user => {
            if (this.userIsAttending(user, event)) {
              const context: NotificationContext = {
                user,
                event,
                timeOfDay: reminder2h.getHours(),
                dayOfWeek: reminder2h.getDay(),
                userTimezone: 'Europe/Madrid',
                recentActivity: []
              };
              
              this.sendSmartNotification(context, {
                type: 'event_reminder',
                title: `¡${event.title} empieza pronto!`,
                message: `Tu evento empieza en 2 horas`,
                data: { eventId: event.id, reminderType: '2h' },
                read: false,
                priority: 'high'
              });
            }
          });
        }, reminder2h.getTime() - now.getTime());
      }
    });
  }
  
  /**
   * Verifica si el usuario va a un evento
   */
  private static userIsAttending(user: User, event: Event): boolean {
    // En una implementación real, esto consultaría la base de datos
    // Por ahora, simulamos basado en intereses
    return user.interests?.some(interest => 
      event.category.toLowerCase().includes(interest.toLowerCase())
    ) || false;
  }
  
  /**
   * Notifica eventos trending relevantes
   */
  static notifyTrendingEvents(trendingEvents: Event[], users: User[]): void {
    trendingEvents.forEach(event => {
      users.forEach(user => {
        const context: NotificationContext = {
          user,
          event,
          timeOfDay: new Date().getHours(),
          dayOfWeek: new Date().getDay(),
          userTimezone: 'Europe/Madrid',
          recentActivity: []
        };
        
        this.sendSmartNotification(context, {
          type: 'trending',
          title: `${event.title} está trending`,
          message: `Este evento está ganando popularidad en tu área`,
          data: { eventId: event.id, trendingScore: event.trendingScore },
          read: false,
          priority: 'medium'
        }, {
          targetAudience: 'interested'
        });
      });
    });
  }
  
  /**
   * Limpia historial antiguo
   */
  static cleanupOldNotifications(): void {
    const cutoffTime = Date.now() - 30 * 24 * 60 * 60 * 1000; // 30 días
    
    this.notificationHistory.forEach((history, userId) => {
      const filtered = history.filter(n => 
        new Date(n.createdAt).getTime() > cutoffTime
      );
      
      if (filtered.length !== history.length) {
        this.notificationHistory.set(userId, filtered);
        localStorage.setItem(
          `notification_history_${userId}`, 
          JSON.stringify(filtered)
        );
      }
    });
  }
}