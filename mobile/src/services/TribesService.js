import axios from 'axios';
import { Platform } from 'react-native';

// Configuración de la API
const API_URL = (process.env.EXPO_PUBLIC_API_URL
  ? `${process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '')}/api`
  : Platform.OS === 'android'
    ? 'http://10.0.2.2:5000/api'
    : 'http://localhost:5000/api');

class TribesService {
  // ==========================================
  // OBTENER TRIBUS
  // ==========================================

  async getAllTribes(params = {}) {
    try {
      const { page = 1, limit = 20, category, location, search } = params;
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(category && { category }),
        ...(location && { location }),
        ...(search && { search })
      }).toString();

      const response = await axios.get(`${API_URL}/tribes?${queryParams}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo tribus');
    }
  }

  async getNearbyTribes(latitude, longitude, radius = 10000) {
    try {
      const response = await axios.get(`${API_URL}/tribes/nearby`, {
        params: { latitude, longitude, radius }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo tribus cercanas');
    }
  }

  async getTrendingTribes() {
    try {
      const response = await axios.get(`${API_URL}/tribes/trending`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo tribus trending');
    }
  }

  async getMyTribes() {
    try {
      const response = await axios.get(`${API_URL}/tribes/my-tribes`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo mis tribus');
    }
  }

  // ==========================================
  // DETALLES DE TRIBU
  // ==========================================

  async getTribeById(tribeId) {
    try {
      const response = await axios.get(`${API_URL}/tribes/${tribeId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo detalles de tribu');
    }
  }

  async getTribeMembers(tribeId, page = 1, limit = 20) {
    try {
      const response = await axios.get(`${API_URL}/tribes/${tribeId}/members`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo miembros');
    }
  }

  async getTribeModerators(tribeId) {
    try {
      const response = await axios.get(`${API_URL}/tribes/${tribeId}/moderators`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo moderadores');
    }
  }

  async getTribePosts(tribeId, page = 1, limit = 20) {
    try {
      const response = await axios.get(`${API_URL}/posts/tribe/${tribeId}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo posts de tribu');
    }
  }

  // ==========================================
  // GESTIÓN DE TRIBUS
  // ==========================================

  async createTribe(tribeData) {
    try {
      const response = await axios.post(`${API_URL}/tribes`, tribeData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error creando tribu');
    }
  }

  async updateTribe(tribeId, updateData) {
    try {
      const response = await axios.put(`${API_URL}/tribes/${tribeId}`, updateData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error actualizando tribu');
    }
  }

  async deleteTribe(tribeId) {
    try {
      const response = await axios.delete(`${API_URL}/tribes/${tribeId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error eliminando tribu');
    }
  }

  // ==========================================
  // MEMBRESÍA
  // ==========================================

  async joinTribe(tribeId) {
    try {
      const response = await axios.post(`${API_URL}/tribes/${tribeId}/join`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error uniéndose a tribu');
    }
  }

  async leaveTribe(tribeId) {
    try {
      const response = await axios.post(`${API_URL}/tribes/${tribeId}/leave`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error saliendo de tribu');
    }
  }

  async inviteToTribe(tribeId, userIds) {
    try {
      const response = await axios.post(`${API_URL}/tribes/${tribeId}/invite`, {
        userIds: Array.isArray(userIds) ? userIds : [userIds]
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error enviando invitación');
    }
  }

  async removeMember(tribeId, userId) {
    try {
      const response = await axios.delete(`${API_URL}/tribes/${tribeId}/members/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error removiendo miembro');
    }
  }

  // ==========================================
  // MODERACIÓN
  // ==========================================

  async addModerator(tribeId, userId) {
    try {
      const response = await axios.post(`${API_URL}/tribes/${tribeId}/moderators`, {
        userId
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error agregando moderador');
    }
  }

  async removeModerator(tribeId, userId) {
    try {
      const response = await axios.delete(`${API_URL}/tribes/${tribeId}/moderators/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error removiendo moderador');
    }
  }

  async reportTribe(tribeId, reason, description = '') {
    try {
      const response = await axios.post(`${API_URL}/tribes/${tribeId}/report`, {
        reason,
        description
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error reportando tribu');
    }
  }

  // ==========================================
  // CONFIGURACIONES DE TRIBU
  // ==========================================

  async updateTribeSettings(tribeId, settings) {
    try {
      const response = await axios.put(`${API_URL}/tribes/${tribeId}/settings`, settings);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error actualizando configuración');
    }
  }

  async getTribeSettings(tribeId) {
    try {
      const response = await axios.get(`${API_URL}/tribes/${tribeId}/settings`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo configuración');
    }
  }

  // ==========================================
  // ESTADÍSTICAS
  // ==========================================

  async getTribeStats(tribeId) {
    try {
      const response = await axios.get(`${API_URL}/tribes/${tribeId}/stats`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo estadísticas');
    }
  }

  async getTribeAnalytics(tribeId, timeframe = '7d') {
    try {
      const response = await axios.get(`${API_URL}/tribes/${tribeId}/analytics`, {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo analytics');
    }
  }

  // ==========================================
  // BÚSQUEDA Y FILTROS
  // ==========================================

  async searchTribes(query, filters = {}) {
    try {
      const params = {
        q: query,
        ...filters
      };

      const response = await axios.get(`${API_URL}/search/tribes`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error buscando tribus');
    }
  }

  async getTribesCategories() {
    try {
      const response = await axios.get(`${API_URL}/tribes/categories`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo categorías');
    }
  }

  // ==========================================
  // EVENTOS DE TRIBU
  // ==========================================

  async getTribeEvents(tribeId, page = 1, limit = 20) {
    try {
      const response = await axios.get(`${API_URL}/tribes/${tribeId}/events`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo eventos de tribu');
    }
  }

  async createTribeEvent(tribeId, eventData) {
    try {
      const response = await axios.post(`${API_URL}/tribes/${tribeId}/events`, eventData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error creando evento de tribu');
    }
  }

  // ==========================================
  // UTILIDADES
  // ==========================================

  async checkMembership(tribeId) {
    try {
      const response = await axios.get(`${API_URL}/tribes/${tribeId}/membership-status`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error verificando membresía');
    }
  }

  async getJoinRequests(tribeId) {
    try {
      const response = await axios.get(`${API_URL}/tribes/${tribeId}/join-requests`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo solicitudes');
    }
  }

  async approveJoinRequest(tribeId, userId) {
    try {
      const response = await axios.post(`${API_URL}/tribes/${tribeId}/join-requests/${userId}/approve`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error aprobando solicitud');
    }
  }

  async rejectJoinRequest(tribeId, userId) {
    try {
      const response = await axios.post(`${API_URL}/tribes/${tribeId}/join-requests/${userId}/reject`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error rechazando solicitud');
    }
  }
}

// Exportar instancia única
const tribesService = new TribesService();
export default tribesService;

