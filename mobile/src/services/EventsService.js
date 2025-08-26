import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

class EventsService {
  constructor() {
    this.CACHE_PREFIX = 'events_cache_';
    this.DRAFT_PREFIX = 'event_draft_';
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  }

  // ==========================================
  // CREAR EVENTO
  // ==========================================

  async createEvent(eventData) {
    try {
      const response = await apiClient.post('/events', eventData);
      
      if (response.data.success) {
        // Limpiar cache de eventos
        await this.clearEventsCache();
        
        // Limpiar borrador si existe
        await this.clearDraft();
        
        return {
          success: true,
          data: response.data.data,
          message: 'Evento creado exitosamente'
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Error creando evento'
        };
      }
    } catch (error) {
      console.error('Error creating event:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 
                error.message || 
                'Error de conexión. Verifica tu internet.'
      };
    }
  }

  // ==========================================
  // ACTUALIZAR EVENTO
  // ==========================================

  async updateEvent(eventId, eventData) {
    try {
      const response = await apiClient.put(`/events/${eventId}`, eventData);
      
      if (response.data.success) {
        // Limpiar cache de eventos
        await this.clearEventsCache();
        
        // Limpiar cache específico del evento
        await this.clearEventCache(eventId);
        
        return {
          success: true,
          data: response.data.data,
          message: 'Evento actualizado exitosamente'
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Error actualizando evento'
        };
      }
    } catch (error) {
      console.error('Error updating event:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 
                error.message || 
                'Error de conexión. Verifica tu internet.'
      };
    }
  }

  // ==========================================
  // GUARDAR BORRADOR
  // ==========================================

  async saveDraft(draftData) {
    try {
      // Guardar localmente primero
      await AsyncStorage.setItem(
        `${this.DRAFT_PREFIX}local`,
        JSON.stringify({
          ...draftData,
          savedAt: new Date().toISOString(),
          source: 'local'
        })
      );

      // Intentar guardar en el backend
      try {
        const response = await apiClient.post('/events/draft', draftData);
        
        if (response.data.success) {
          // Actualizar borrador local con ID del servidor
          await AsyncStorage.setItem(
            `${this.DRAFT_PREFIX}server`,
            JSON.stringify({
              ...draftData,
              draftId: response.data.data.draftId,
              savedAt: response.data.data.savedAt,
              source: 'server'
            })
          );
        }
        
        return {
          success: true,
          message: 'Borrador guardado exitosamente'
        };
      } catch (serverError) {
        // Si falla el servidor, mantener solo el borrador local
        console.warn('Server draft save failed, keeping local only:', serverError);
        
        return {
          success: true,
          message: 'Borrador guardado localmente (sin conexión)'
        };
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      
      return {
        success: false,
        message: 'Error guardando borrador'
      };
    }
  }

  // ==========================================
  // OBTENER BORRADOR
  // ==========================================

  async getDraft() {
    try {
      // Intentar obtener borrador del servidor primero
      let serverDraft = null;
      try {
        const serverDraftData = await AsyncStorage.getItem(`${this.DRAFT_PREFIX}server`);
        if (serverDraftData) {
          serverDraft = JSON.parse(serverDraftData);
        }
      } catch (error) {
        console.warn('Error getting server draft:', error);
      }

      // Obtener borrador local
      let localDraft = null;
      try {
        const localDraftData = await AsyncStorage.getItem(`${this.DRAFT_PREFIX}local`);
        if (localDraftData) {
          localDraft = JSON.parse(localDraftData);
        }
    } catch (error) {
        console.warn('Error getting local draft:', error);
      }

      // Retornar el más reciente
      if (serverDraft && localDraft) {
        const serverTime = new Date(serverDraft.savedAt).getTime();
        const localTime = new Date(localDraft.savedAt).getTime();
        return serverTime > localTime ? serverDraft : localDraft;
      }

      return serverDraft || localDraft;
    } catch (error) {
      console.error('Error getting draft:', error);
      return null;
    }
  }

  // ==========================================
  // LIMPIAR BORRADOR
  // ==========================================

  async clearDraft() {
    try {
      await AsyncStorage.removeItem(`${this.DRAFT_PREFIX}local`);
      await AsyncStorage.removeItem(`${this.DRAFT_PREFIX}server`);
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  }

  // ==========================================
  // OBTENER EVENTOS
  // ==========================================

  async getEvents(filters = {}, useCache = true) {
    try {
      const cacheKey = `${this.CACHE_PREFIX}list_${JSON.stringify(filters)}`;
      
      // Verificar cache si está habilitado
      if (useCache) {
        const cachedData = await this.getCachedData(cacheKey);
        if (cachedData) {
          return {
            success: true,
            data: cachedData,
            fromCache: true
          };
        }
      }

      // Obtener desde el servidor
      const response = await apiClient.get('/events', { params: filters });
      
      if (response.data.success) {
        // Guardar en cache
        if (useCache) {
          await this.setCachedData(cacheKey, response.data.data);
        }
        
        return {
          success: true,
          data: response.data.data,
          fromCache: false
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Error obteniendo eventos'
        };
      }
    } catch (error) {
      console.error('Error getting events:', error);
      
      // Intentar obtener desde cache como fallback
      const cacheKey = `${this.CACHE_PREFIX}list_${JSON.stringify(filters)}`;
      const cachedData = await this.getCachedData(cacheKey, true); // Ignorar expiración
      
      if (cachedData) {
        return {
          success: true,
          data: cachedData,
          fromCache: true,
          offline: true,
          message: 'Mostrando eventos guardados (sin conexión)'
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 
                error.message || 
                'Error de conexión. Verifica tu internet.'
      };
    }
  }

  // ==========================================
  // OBTENER EVENTO POR ID
  // ==========================================

  async getEventById(eventId, useCache = true) {
    try {
      const cacheKey = `${this.CACHE_PREFIX}detail_${eventId}`;
      
      // Verificar cache
      if (useCache) {
        const cachedData = await this.getCachedData(cacheKey);
        if (cachedData) {
          return {
            success: true,
            data: cachedData,
            fromCache: true
          };
        }
      }

      // Obtener desde el servidor
      const response = await apiClient.get(`/events/${eventId}`);
      
      if (response.data.success) {
        // Guardar en cache
        if (useCache) {
          await this.setCachedData(cacheKey, response.data.data);
        }
        
        return {
          success: true,
          data: response.data.data,
          fromCache: false
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Evento no encontrado'
        };
      }
    } catch (error) {
      console.error('Error getting event by ID:', error);
      
      // Intentar cache como fallback
      const cacheKey = `${this.CACHE_PREFIX}detail_${eventId}`;
      const cachedData = await this.getCachedData(cacheKey, true);
      
      if (cachedData) {
        return {
          success: true,
          data: cachedData,
          fromCache: true,
          offline: true,
          message: 'Mostrando evento guardado (sin conexión)'
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 
                error.message || 
                'Error de conexión. Verifica tu internet.'
      };
    }
  }

  // ==========================================
  // UNIRSE A EVENTO
  // ==========================================

  async joinEvent(eventId) {
    try {
      const response = await apiClient.post(`/events/${eventId}/join`);
      
      if (response.data.success) {
        // Limpiar cache del evento
        await this.clearEventCache(eventId);
        
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Te has unido al evento'
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Error uniéndose al evento'
        };
      }
    } catch (error) {
      console.error('Error joining event:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 
                error.message || 
                'Error de conexión. Verifica tu internet.'
      };
    }
  }

  // ==========================================
  // SALIR DE EVENTO
  // ==========================================

  async leaveEvent(eventId) {
    try {
      const response = await apiClient.delete(`/events/${eventId}/leave`);
      
      if (response.data.success) {
        // Limpiar cache del evento
        await this.clearEventCache(eventId);
        
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Has salido del evento'
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Error saliendo del evento'
        };
      }
    } catch (error) {
      console.error('Error leaving event:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 
                error.message || 
                'Error de conexión. Verifica tu internet.'
      };
    }
  }

  // ==========================================
  // MARCAR INTERÉS
  // ==========================================

  async markInterested(eventId) {
    try {
      const response = await apiClient.post(`/events/${eventId}/interested`);
      
      if (response.data.success) {
        // Limpiar cache del evento
        await this.clearEventCache(eventId);
        
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Error marcando interés'
        };
      }
    } catch (error) {
      console.error('Error marking interested:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 
                error.message || 
                'Error de conexión. Verifica tu internet.'
      };
    }
  }

  // ==========================================
  // BUSCAR EVENTOS
  // ==========================================

  async searchEvents(query, filters = {}) {
    try {
      const searchParams = {
        q: query,
        ...filters
      };

      const response = await apiClient.get('/events/search', { params: searchParams });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          query: query
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Error en la búsqueda'
        };
      }
    } catch (error) {
      console.error('Error searching events:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 
                error.message || 
                'Error de conexión. Verifica tu internet.'
      };
    }
  }

  // ==========================================
  // OBTENER EVENTOS RECOMENDADOS
  // ==========================================

  async getRecommendedEvents(limit = 10) {
    try {
      const cacheKey = `${this.CACHE_PREFIX}recommended_${limit}`;
      
      // Verificar cache
      const cachedData = await this.getCachedData(cacheKey);
      if (cachedData) {
        return {
          success: true,
          data: cachedData,
          fromCache: true
        };
      }

      const response = await apiClient.get('/events/recommended', {
        params: { limit }
      });
      
      if (response.data.success) {
        // Guardar en cache
        await this.setCachedData(cacheKey, response.data.data);
        
        return {
          success: true,
          data: response.data.data,
          fromCache: false
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Error obteniendo recomendaciones'
        };
      }
    } catch (error) {
      console.error('Error getting recommended events:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 
                error.message || 
                'Error de conexión. Verifica tu internet.'
      };
    }
  }

  // ==========================================
  // REPORTAR EVENTO
  // ==========================================

  async reportEvent(eventId, reason, description) {
    try {
      const response = await apiClient.post(`/events/${eventId}/report`, {
        reason,
        description
      });
      
      if (response.data.success) {
        return {
          success: true,
          message: 'Evento reportado exitosamente'
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Error reportando evento'
        };
      }
    } catch (error) {
      console.error('Error reporting event:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 
                error.message || 
                'Error de conexión. Verifica tu internet.'
      };
    }
  }

  // ==========================================
  // ELIMINAR EVENTO
  // ==========================================

  async deleteEvent(eventId) {
    try {
      const response = await apiClient.delete(`/events/${eventId}`);
      
      if (response.data.success) {
        // Limpiar todos los caches relacionados
        await this.clearEventCache(eventId);
        await this.clearEventsCache();
        
        return {
          success: true,
          message: 'Evento eliminado exitosamente'
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Error eliminando evento'
        };
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 
                error.message || 
                'Error de conexión. Verifica tu internet.'
      };
    }
  }

  // ==========================================
  // OBTENER MIS EVENTOS
  // ==========================================

  async getMyEvents(status) {
    try {
      const cacheKey = `${this.CACHE_PREFIX}my_events_${status || 'all'}`;
      
      // Verificar cache
      const cachedData = await this.getCachedData(cacheKey);
      if (cachedData) {
        return {
          success: true,
          data: cachedData,
          fromCache: true
        };
      }

      const params = status ? { status } : {};
      const response = await apiClient.get('/users/my-events', { params });
      
      if (response.data.success) {
        // Guardar en cache
        await this.setCachedData(cacheKey, response.data.data);
        
        return {
          success: true,
          data: response.data.data,
          fromCache: false
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Error obteniendo mis eventos'
        };
      }
    } catch (error) {
      console.error('Error getting my events:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 
                error.message || 
                'Error de conexión. Verifica tu internet.'
      };
    }
  }

  // ==========================================
  // UTILIDADES DE CACHE
  // ==========================================

  async getCachedData(key, ignoreExpiration = false) {
    try {
      const cachedItem = await AsyncStorage.getItem(key);
      if (!cachedItem) return null;

      const { data, timestamp } = JSON.parse(cachedItem);
      
      if (!ignoreExpiration) {
        const now = Date.now();
        if (now - timestamp > this.CACHE_DURATION) {
          await AsyncStorage.removeItem(key);
          return null;
        }
      }

      return data;
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }

  async setCachedData(key, data) {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now()
      };
      
      await AsyncStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Error setting cached data:', error);
    }
  }

  async clearEventCache(eventId) {
    try {
      await AsyncStorage.removeItem(`${this.CACHE_PREFIX}detail_${eventId}`);
    } catch (error) {
      console.error('Error clearing event cache:', error);
    }
  }

  async clearEventsCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const eventsCacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      if (eventsCacheKeys.length > 0) {
        await AsyncStorage.multiRemove(eventsCacheKeys);
      }
    } catch (error) {
      console.error('Error clearing events cache:', error);
    }
  }

  // ==========================================
  // UTILIDADES DE VALIDACIÓN
  // ==========================================

  validateEventData(eventData) {
    const errors = {};

    // Validaciones básicas
    if (!eventData.title?.trim()) {
      errors.title = 'El título es requerido';
    }

    if (!eventData.description?.trim()) {
      errors.description = 'La descripción es requerida';
    }

    if (!eventData.category) {
      errors.category = 'La categoría es requerida';
    }

    if (!eventData.startDateTime) {
      errors.startDateTime = 'La fecha de inicio es requerida';
    }

    if (!eventData.endDateTime) {
      errors.endDateTime = 'La fecha de fin es requerida';
    }

    // Validar fechas
    if (eventData.startDateTime && eventData.endDateTime) {
      const startDate = new Date(eventData.startDateTime);
      const endDate = new Date(eventData.endDateTime);
      const now = new Date();

      if (startDate <= now) {
        errors.startDateTime = 'El evento debe ser en el futuro';
      }

      if (endDate <= startDate) {
        errors.endDateTime = 'La fecha de fin debe ser después del inicio';
      }
    }

    // Validar ubicación
    if (eventData.location?.type === 'physical' && !eventData.location.address?.trim()) {
      errors.address = 'La dirección es requerida para eventos presenciales';
    }

    if (eventData.location?.type === 'virtual' && !eventData.location.virtualLink?.trim()) {
      errors.virtualLink = 'El enlace virtual es requerido para eventos virtuales';
    }

    // Validar capacidad
    if (eventData.capacity && eventData.capacity < 1) {
      errors.capacity = 'La capacidad debe ser mayor a 0';
    }

    // Validar precio
    if (eventData.price < 0) {
      errors.price = 'El precio no puede ser negativo';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // ==========================================
  // UTILIDADES DE ESTADO
  // ==========================================

  formatEventForDisplay(event) {
    return {
      ...event,
      formattedStartDate: new Date(event.startDate).toLocaleDateString(),
      formattedStartTime: new Date(event.startDate).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      formattedEndDate: new Date(event.endDate).toLocaleDateString(),
      formattedEndTime: new Date(event.endDate).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      isUpcoming: new Date(event.startDate) > new Date(),
      isPast: new Date(event.endDate) < new Date(),
      isToday: new Date(event.startDate).toDateString() === new Date().toDateString(),
      daysUntilEvent: Math.ceil((new Date(event.startDate) - new Date()) / (1000 * 60 * 60 * 24))
    };
  }

  getEventStatus(event) {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (now < startDate) {
      return 'upcoming';
    } else if (now >= startDate && now <= endDate) {
      return 'ongoing';
    } else {
      return 'past';
    }
  }
}

export default new EventsService();