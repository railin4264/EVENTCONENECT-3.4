import axios from 'axios';
import { Platform } from 'react-native';

// Configuración de la API
const API_URL = (process.env.EXPO_PUBLIC_API_URL
  ? `${process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '')}/api`
  : Platform.OS === 'android'
    ? 'http://10.0.2.2:5000/api'
    : 'http://localhost:5000/api');

class PostsService {
  // ==========================================
  // OBTENER POSTS
  // ==========================================

  async getAllPosts(params = {}) {
    try {
      const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = params;
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder
      }).toString();

      const response = await axios.get(`${API_URL}/posts?${queryParams}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo posts');
    }
  }

  async getTrendingPosts(timeframe = '24h') {
    try {
      const response = await axios.get(`${API_URL}/posts/trending`, {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo posts trending');
    }
  }

  async getPersonalizedFeed(page = 1, limit = 20) {
    try {
      const response = await axios.get(`${API_URL}/posts/feed`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo feed personalizado');
    }
  }

  async getUserPosts(userId, page = 1, limit = 20) {
    try {
      const response = await axios.get(`${API_URL}/posts/user/${userId}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo posts del usuario');
    }
  }

  async getMyPosts(page = 1, limit = 20) {
    try {
      const response = await axios.get(`${API_URL}/posts/my-posts`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo mis posts');
    }
  }

  async getSavedPosts(page = 1, limit = 20) {
    try {
      const response = await axios.get(`${API_URL}/posts/user/saved`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo posts guardados');
    }
  }

  // ==========================================
  // POSTS POR CONTEXTO
  // ==========================================

  async getEventPosts(eventId, page = 1, limit = 20) {
    try {
      const response = await axios.get(`${API_URL}/posts/event/${eventId}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo posts del evento');
    }
  }

  async getTribePosts(tribeId, page = 1, limit = 20) {
    try {
      const response = await axios.get(`${API_URL}/posts/tribe/${tribeId}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo posts de la tribu');
    }
  }

  // ==========================================
  // DETALLES DE POST
  // ==========================================

  async getPostById(postId) {
    try {
      const response = await axios.get(`${API_URL}/posts/${postId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo detalles del post');
    }
  }

  async getPostStats(postId) {
    try {
      const response = await axios.get(`${API_URL}/posts/${postId}/stats`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo estadísticas del post');
    }
  }

  // ==========================================
  // GESTIÓN DE POSTS
  // ==========================================

  async createPost(postData) {
    try {
      const response = await axios.post(`${API_URL}/posts`, postData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error creando post');
    }
  }

  async updatePost(postId, updateData) {
    try {
      const response = await axios.put(`${API_URL}/posts/${postId}`, updateData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error actualizando post');
    }
  }

  async deletePost(postId) {
    try {
      const response = await axios.delete(`${API_URL}/posts/${postId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error eliminando post');
    }
  }

  // ==========================================
  // INTERACCIONES CON POSTS
  // ==========================================

  async likePost(postId) {
    try {
      const response = await axios.post(`${API_URL}/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error dando like al post');
    }
  }

  async unlikePost(postId) {
    try {
      const response = await axios.delete(`${API_URL}/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error quitando like del post');
    }
  }

  async savePost(postId) {
    try {
      const response = await axios.post(`${API_URL}/posts/${postId}/save`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error guardando post');
    }
  }

  async unsavePost(postId) {
    try {
      const response = await axios.delete(`${API_URL}/posts/${postId}/save`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error eliminando post guardado');
    }
  }

  async sharePost(postId) {
    try {
      const response = await axios.post(`${API_URL}/posts/${postId}/share`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error compartiendo post');
    }
  }

  // ==========================================
  // COMENTARIOS
  // ==========================================

  async getPostComments(postId, page = 1, limit = 20) {
    try {
      const response = await axios.get(`${API_URL}/posts/${postId}/comments`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo comentarios');
    }
  }

  async addComment(postId, comment, parentId = null) {
    try {
      const response = await axios.post(`${API_URL}/posts/${postId}/comments`, {
        content: comment,
        parentId
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error agregando comentario');
    }
  }

  async updateComment(commentId, content) {
    try {
      const response = await axios.put(`${API_URL}/posts/comments/${commentId}`, {
        content
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error actualizando comentario');
    }
  }

  async deleteComment(commentId) {
    try {
      const response = await axios.delete(`${API_URL}/posts/comments/${commentId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error eliminando comentario');
    }
  }

  async likeComment(commentId) {
    try {
      const response = await axios.post(`${API_URL}/posts/comments/${commentId}/like`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error dando like al comentario');
    }
  }

  async unlikeComment(commentId) {
    try {
      const response = await axios.delete(`${API_URL}/posts/comments/${commentId}/like`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error quitando like del comentario');
    }
  }

  // ==========================================
  // BÚSQUEDA DE POSTS
  // ==========================================

  async searchPosts(query, filters = {}) {
    try {
      const params = {
        q: query,
        ...filters
      };

      const response = await axios.get(`${API_URL}/search/posts`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error buscando posts');
    }
  }

  async getPostsByHashtag(hashtag, page = 1, limit = 20) {
    try {
      const response = await axios.get(`${API_URL}/posts/hashtag/${hashtag}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo posts por hashtag');
    }
  }

  async getTrendingHashtags(limit = 10) {
    try {
      const response = await axios.get(`${API_URL}/posts/hashtags/trending`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo hashtags trending');
    }
  }

  // ==========================================
  // REPORTES Y MODERACIÓN
  // ==========================================

  async reportPost(postId, reason, description = '') {
    try {
      const response = await axios.post(`${API_URL}/posts/${postId}/report`, {
        reason,
        description
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error reportando post');
    }
  }

  async reportComment(commentId, reason, description = '') {
    try {
      const response = await axios.post(`${API_URL}/posts/comments/${commentId}/report`, {
        reason,
        description
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error reportando comentario');
    }
  }

  // ==========================================
  // MEDIOS Y ARCHIVOS
  // ==========================================

  async uploadPostImage(imageUri) {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'post-image.jpg',
      });

      const response = await axios.post(`${API_URL}/posts/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error subiendo imagen');
    }
  }

  async uploadPostVideo(videoUri) {
    try {
      const formData = new FormData();
      formData.append('video', {
        uri: videoUri,
        type: 'video/mp4',
        name: 'post-video.mp4',
      });

      const response = await axios.post(`${API_URL}/posts/upload-video`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error subiendo video');
    }
  }

  // ==========================================
  // NOTIFICACIONES DE POSTS
  // ==========================================

  async getPostNotifications(page = 1, limit = 20) {
    try {
      const response = await axios.get(`${API_URL}/posts/notifications`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo notificaciones de posts');
    }
  }

  async markPostNotificationAsRead(notificationId) {
    try {
      const response = await axios.put(`${API_URL}/posts/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error marcando notificación como leída');
    }
  }

  // ==========================================
  // ANALYTICS Y ESTADÍSTICAS
  // ==========================================

  async getPostAnalytics(postId, timeframe = '7d') {
    try {
      const response = await axios.get(`${API_URL}/posts/${postId}/analytics`, {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo analytics del post');
    }
  }

  async getUserPostsStats(timeframe = '7d') {
    try {
      const response = await axios.get(`${API_URL}/posts/user/stats`, {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo estadísticas de posts del usuario');
    }
  }

  // ==========================================
  // POSTS PROGRAMADOS
  // ==========================================

  async createScheduledPost(postData, scheduledDate) {
    try {
      const response = await axios.post(`${API_URL}/posts/scheduled`, {
        ...postData,
        scheduledDate
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error creando post programado');
    }
  }

  async getScheduledPosts() {
    try {
      const response = await axios.get(`${API_URL}/posts/scheduled`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo posts programados');
    }
  }

  async updateScheduledPost(postId, updateData) {
    try {
      const response = await axios.put(`${API_URL}/posts/scheduled/${postId}`, updateData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error actualizando post programado');
    }
  }

  async deleteScheduledPost(postId) {
    try {
      const response = await axios.delete(`${API_URL}/posts/scheduled/${postId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error eliminando post programado');
    }
  }

  // ==========================================
  // UTILIDADES
  // ==========================================

  async getRecommendedPosts(limit = 10) {
    try {
      const response = await axios.get(`${API_URL}/posts/recommended`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo posts recomendados');
    }
  }

  async getSimilarPosts(postId, limit = 5) {
    try {
      const response = await axios.get(`${API_URL}/posts/${postId}/similar`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo posts similares');
    }
  }

  async getPostEngagement(postId) {
    try {
      const response = await axios.get(`${API_URL}/posts/${postId}/engagement`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo engagement del post');
    }
  }
}

// Exportar instancia única
const postsService = new PostsService();
export default postsService;

