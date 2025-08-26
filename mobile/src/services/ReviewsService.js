import axios from 'axios';
import { Platform } from 'react-native';

// Configuración de la API
const API_URL = (process.env.EXPO_PUBLIC_API_URL
  ? `${process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '')}/api`
  : Platform.OS === 'android'
    ? 'http://10.0.2.2:5000/api'
    : 'http://localhost:5000/api');

class ReviewsService {
  // ==========================================
  // GESTIÓN DE REVIEWS
  // ==========================================

  async createReview(reviewData) {
    try {
      const response = await axios.post(`${API_URL}/reviews`, reviewData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error creando review');
    }
  }

  async updateReview(reviewId, updateData) {
    try {
      const response = await axios.put(`${API_URL}/reviews/${reviewId}`, updateData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error actualizando review');
    }
  }

  async deleteReview(reviewId) {
    try {
      const response = await axios.delete(`${API_URL}/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error eliminando review');
    }
  }

  // ==========================================
  // REVIEWS DE EVENTOS
  // ==========================================

  async getEventReviews(eventId, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc') {
    try {
      const response = await axios.get(`${API_URL}/reviews/events/${eventId}`, {
        params: { page, limit, sortBy, sortOrder }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo reviews del evento');
    }
  }

  async createEventReview(eventId, reviewData) {
    try {
      const response = await axios.post(`${API_URL}/reviews/events/${eventId}`, reviewData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error creando review del evento');
    }
  }

  async getEventReviewStats(eventId) {
    try {
      const response = await axios.get(`${API_URL}/reviews/events/${eventId}/stats`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo estadísticas de reviews');
    }
  }

  async getEventRatingDistribution(eventId) {
    try {
      const response = await axios.get(`${API_URL}/reviews/events/${eventId}/rating-distribution`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo distribución de calificaciones');
    }
  }

  // ==========================================
  // REVIEWS DE TRIBUS
  // ==========================================

  async getTribeReviews(tribeId, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc') {
    try {
      const response = await axios.get(`${API_URL}/reviews/tribes/${tribeId}`, {
        params: { page, limit, sortBy, sortOrder }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo reviews de la tribu');
    }
  }

  async createTribeReview(tribeId, reviewData) {
    try {
      const response = await axios.post(`${API_URL}/reviews/tribes/${tribeId}`, reviewData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error creando review de la tribu');
    }
  }

  async getTribeReviewStats(tribeId) {
    try {
      const response = await axios.get(`${API_URL}/reviews/tribes/${tribeId}/stats`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo estadísticas de reviews de la tribu');
    }
  }

  // ==========================================
  // REVIEWS DE USUARIOS
  // ==========================================

  async getUserReviews(userId, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc') {
    try {
      const response = await axios.get(`${API_URL}/reviews/users/${userId}`, {
        params: { page, limit, sortBy, sortOrder }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo reviews del usuario');
    }
  }

  async getMyReviews(page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc') {
    try {
      const response = await axios.get(`${API_URL}/reviews/my-reviews`, {
        params: { page, limit, sortBy, sortOrder }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo mis reviews');
    }
  }

  async getUserReviewStats(userId) {
    try {
      const response = await axios.get(`${API_URL}/reviews/users/${userId}/stats`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo estadísticas del usuario');
    }
  }

  // ==========================================
  // OBTENER REVIEW ESPECÍFICA
  // ==========================================

  async getReviewById(reviewId) {
    try {
      const response = await axios.get(`${API_URL}/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo detalles del review');
    }
  }

  async getUserReviewForEvent(eventId) {
    try {
      const response = await axios.get(`${API_URL}/reviews/events/${eventId}/my-review`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return { data: null }; // No tiene review aún
      }
      throw new Error(error.response?.data?.message || 'Error obteniendo mi review');
    }
  }

  async getUserReviewForTribe(tribeId) {
    try {
      const response = await axios.get(`${API_URL}/reviews/tribes/${tribeId}/my-review`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return { data: null }; // No tiene review aún
      }
      throw new Error(error.response?.data?.message || 'Error obteniendo mi review');
    }
  }

  // ==========================================
  // INTERACCIONES CON REVIEWS
  // ==========================================

  async likeReview(reviewId) {
    try {
      const response = await axios.post(`${API_URL}/reviews/${reviewId}/like`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error dando like al review');
    }
  }

  async unlikeReview(reviewId) {
    try {
      const response = await axios.delete(`${API_URL}/reviews/${reviewId}/like`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error quitando like del review');
    }
  }

  async reportReview(reviewId, reason, description = '') {
    try {
      const response = await axios.post(`${API_URL}/reviews/${reviewId}/report`, {
        reason,
        description
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error reportando review');
    }
  }

  async markReviewAsHelpful(reviewId) {
    try {
      const response = await axios.post(`${API_URL}/reviews/${reviewId}/helpful`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error marcando review como útil');
    }
  }

  async unmarkReviewAsHelpful(reviewId) {
    try {
      const response = await axios.delete(`${API_URL}/reviews/${reviewId}/helpful`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error quitando marca de útil');
    }
  }

  // ==========================================
  // RESPUESTAS A REVIEWS
  // ==========================================

  async addReviewResponse(reviewId, responseText) {
    try {
      const response = await axios.post(`${API_URL}/reviews/${reviewId}/responses`, {
        content: responseText
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error agregando respuesta');
    }
  }

  async getReviewResponses(reviewId, page = 1, limit = 10) {
    try {
      const response = await axios.get(`${API_URL}/reviews/${reviewId}/responses`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo respuestas');
    }
  }

  async updateReviewResponse(responseId, newContent) {
    try {
      const response = await axios.put(`${API_URL}/reviews/responses/${responseId}`, {
        content: newContent
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error actualizando respuesta');
    }
  }

  async deleteReviewResponse(responseId) {
    try {
      const response = await axios.delete(`${API_URL}/reviews/responses/${responseId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error eliminando respuesta');
    }
  }

  // ==========================================
  // BÚSQUEDA Y FILTROS
  // ==========================================

  async searchReviews(query, filters = {}) {
    try {
      const params = {
        q: query,
        ...filters
      };

      const response = await axios.get(`${API_URL}/reviews/search`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error buscando reviews');
    }
  }

  async getReviewsWithFilters(filters) {
    try {
      const response = await axios.get(`${API_URL}/reviews/filter`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error aplicando filtros');
    }
  }

  async getTopReviewedEvents(limit = 10, timeframe = '30d') {
    try {
      const response = await axios.get(`${API_URL}/reviews/top-reviewed-events`, {
        params: { limit, timeframe }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo eventos más reseñados');
    }
  }

  async getTopReviewedTribes(limit = 10, timeframe = '30d') {
    try {
      const response = await axios.get(`${API_URL}/reviews/top-reviewed-tribes`, {
        params: { limit, timeframe }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo tribus más reseñadas');
    }
  }

  // ==========================================
  // CALIFICACIONES Y RATINGS
  // ==========================================

  async addRating(targetType, targetId, rating) {
    try {
      const response = await axios.post(`${API_URL}/reviews/${targetType}/${targetId}/rating`, {
        rating
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error agregando calificación');
    }
  }

  async updateRating(targetType, targetId, rating) {
    try {
      const response = await axios.put(`${API_URL}/reviews/${targetType}/${targetId}/rating`, {
        rating
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error actualizando calificación');
    }
  }

  async deleteRating(targetType, targetId) {
    try {
      const response = await axios.delete(`${API_URL}/reviews/${targetType}/${targetId}/rating`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error eliminando calificación');
    }
  }

  async getRating(targetType, targetId) {
    try {
      const response = await axios.get(`${API_URL}/reviews/${targetType}/${targetId}/rating`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return { data: null }; // No tiene calificación aún
      }
      throw new Error(error.response?.data?.message || 'Error obteniendo calificación');
    }
  }

  // ==========================================
  // ANALYTICS Y ESTADÍSTICAS
  // ==========================================

  async getReviewAnalytics(targetType, targetId, timeframe = '30d') {
    try {
      const response = await axios.get(`${API_URL}/reviews/${targetType}/${targetId}/analytics`, {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo analytics');
    }
  }

  async getUserReviewAnalytics(userId, timeframe = '30d') {
    try {
      const response = await axios.get(`${API_URL}/reviews/users/${userId}/analytics`, {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo analytics del usuario');
    }
  }

  async getReviewTrends(timeframe = '30d') {
    try {
      const response = await axios.get(`${API_URL}/reviews/trends`, {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo tendencias de reviews');
    }
  }

  // ==========================================
  // MODERACIÓN
  // ==========================================

  async getFlaggedReviews(page = 1, limit = 20) {
    try {
      const response = await axios.get(`${API_URL}/reviews/moderation/flagged`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo reviews reportados');
    }
  }

  async moderateReview(reviewId, action, reason = '') {
    try {
      const response = await axios.post(`${API_URL}/reviews/${reviewId}/moderate`, {
        action, // 'approve', 'reject', 'hide', 'delete'
        reason
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error moderando review');
    }
  }

  // ==========================================
  // UTILIDADES
  // ==========================================

  formatRating(rating) {
    if (rating === null || rating === undefined) return 'Sin calificar';
    return parseFloat(rating).toFixed(1);
  }

  getStarRating(rating) {
    if (rating === null || rating === undefined) return 0;
    return Math.round(parseFloat(rating));
  }

  getRatingColor(rating) {
    if (rating >= 4) return '#22c55e'; // Verde
    if (rating >= 3) return '#eab308'; // Amarillo
    if (rating >= 2) return '#f59e0b'; // Naranja
    return '#ef4444'; // Rojo
  }

  getRatingText(rating) {
    if (rating >= 4.5) return 'Excelente';
    if (rating >= 4) return 'Muy bueno';
    if (rating >= 3) return 'Bueno';
    if (rating >= 2) return 'Regular';
    return 'Malo';
  }

  formatReviewDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Hoy';
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`;
    if (diffInDays < 365) return `Hace ${Math.floor(diffInDays / 30)} meses`;
    return `Hace ${Math.floor(diffInDays / 365)} años`;
  }

  validateRating(rating) {
    const numRating = parseFloat(rating);
    return numRating >= 1 && numRating <= 5;
  }

  validateReviewText(text) {
    return text && text.trim().length >= 10 && text.trim().length <= 1000;
  }

  // ==========================================
  // EXPORT METHODS
  // ==========================================

  async exportReviews(targetType, targetId, format = 'json') {
    try {
      const response = await axios.get(`${API_URL}/reviews/${targetType}/${targetId}/export`, {
        params: { format },
        responseType: format === 'csv' ? 'blob' : 'json'
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error exportando reviews');
    }
  }

  async exportUserReviews(userId, format = 'json') {
    try {
      const response = await axios.get(`${API_URL}/reviews/users/${userId}/export`, {
        params: { format },
        responseType: format === 'csv' ? 'blob' : 'json'
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error exportando reviews del usuario');
    }
  }
}

// Exportar instancia única
const reviewsService = new ReviewsService();
export default reviewsService;






