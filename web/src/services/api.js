import axios from 'axios';

// Configuración base de axios
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Si el refresh token también falla, redirigir al login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  // Registro
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { accessToken, refreshToken, user } = response.data;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  // Verificar token
  verifyToken: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  // Obtener usuario actual
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Actualizar perfil
  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },

  // Cambiar contraseña
  changePassword: async (passwordData) => {
    const response = await api.put('/auth/password', passwordData);
    return response.data;
  },

  // Recuperar contraseña
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Resetear contraseña
  resetPassword: async (token, password) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },
};

// Servicios de eventos
export const eventService = {
  // Obtener todos los eventos
  getEvents: async (params = {}) => {
    const response = await api.get('/events', { params });
    return response.data;
  },

  // Obtener evento por ID
  getEvent: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  // Crear evento
  createEvent: async (eventData) => {
    const response = await api.post('/events', eventData);
    return response.data;
  },

  // Actualizar evento
  updateEvent: async (id, eventData) => {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
  },

  // Eliminar evento
  deleteEvent: async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },

  // Unirse a evento
  joinEvent: async (id) => {
    const response = await api.post(`/events/${id}/join`);
    return response.data;
  },

  // Salir de evento
  leaveEvent: async (id) => {
    const response = await api.post(`/events/${id}/leave`);
    return response.data;
  },

  // Obtener eventos del usuario
  getUserEvents: async (userId) => {
    const response = await api.get(`/users/${userId}/events`);
    return response.data;
  },

  // Buscar eventos
  searchEvents: async (query, filters = {}) => {
    const response = await api.get('/events/search', { 
      params: { q: query, ...filters } 
    });
    return response.data;
  },

  // Obtener eventos recomendados
  getRecommendedEvents: async () => {
    const response = await api.get('/events/recommended');
    return response.data;
  },

  // Subir imagen de evento
  uploadEventImage: async (eventId, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post(`/events/${eventId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Servicios de tribus
export const tribeService = {
  // Obtener todas las tribus
  getTribes: async (params = {}) => {
    const response = await api.get('/tribes', { params });
    return response.data;
  },

  // Obtener tribu por ID
  getTribe: async (id) => {
    const response = await api.get(`/tribes/${id}`);
    return response.data;
  },

  // Crear tribu
  createTribe: async (tribeData) => {
    const response = await api.post('/tribes', tribeData);
    return response.data;
  },

  // Actualizar tribu
  updateTribe: async (id, tribeData) => {
    const response = await api.put(`/tribes/${id}`, tribeData);
    return response.data;
  },

  // Eliminar tribu
  deleteTribe: async (id) => {
    const response = await api.delete(`/tribes/${id}`);
    return response.data;
  },

  // Unirse a tribu
  joinTribe: async (id) => {
    const response = await api.post(`/tribes/${id}/join`);
    return response.data;
  },

  // Salir de tribu
  leaveTribe: async (id) => {
    const response = await api.post(`/tribes/${id}/leave`);
    return response.data;
  },

  // Obtener tribus del usuario
  getUserTribes: async (userId) => {
    const response = await api.get(`/users/${userId}/tribes`);
    return response.data;
  },

  // Buscar tribus
  searchTribes: async (query, filters = {}) => {
    const response = await api.get('/tribes/search', { 
      params: { q: query, ...filters } 
    });
    return response.data;
  },
};

// Servicios de usuarios
export const userService = {
  // Obtener perfil de usuario
  getUserProfile: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Actualizar perfil de usuario
  updateUserProfile: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  // Seguir usuario
  followUser: async (userId) => {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data;
  },

  // Dejar de seguir usuario
  unfollowUser: async (userId) => {
    const response = await api.post(`/users/${userId}/unfollow`);
    return response.data;
  },

  // Obtener seguidores
  getFollowers: async (userId) => {
    const response = await api.get(`/users/${userId}/followers`);
    return response.data;
  },

  // Obtener seguidos
  getFollowing: async (userId) => {
    const response = await api.get(`/users/${userId}/following`);
    return response.data;
  },

  // Buscar usuarios
  searchUsers: async (query) => {
    const response = await api.get('/users/search', { params: { q: query } });
    return response.data;
  },

  // Subir avatar
  uploadAvatar: async (imageFile) => {
    const formData = new FormData();
    formData.append('avatar', imageFile);
    
    const response = await api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Servicios de notificaciones
export const notificationService = {
  // Obtener notificaciones
  getNotifications: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  // Marcar como leída
  markAsRead: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Marcar todas como leídas
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  // Eliminar notificación
  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  // Obtener configuración de notificaciones
  getNotificationSettings: async () => {
    const response = await api.get('/notifications/settings');
    return response.data;
  },

  // Actualizar configuración de notificaciones
  updateNotificationSettings: async (settings) => {
    const response = await api.put('/notifications/settings', settings);
    return response.data;
  },
};

// Servicios de gamificación
export const gamificationService = {
  // Obtener estadísticas del usuario
  getUserStats: async () => {
    const response = await api.get('/gamification/stats');
    return response.data;
  },

  // Obtener leaderboard
  getLeaderboard: async (category = 'points') => {
    const response = await api.get('/gamification/leaderboard', { 
      params: { category } 
    });
    return response.data;
  },

  // Obtener logros del usuario
  getUserAchievements: async () => {
    const response = await api.get('/gamification/achievements');
    return response.data;
  },

  // Obtener badges del usuario
  getUserBadges: async () => {
    const response = await api.get('/gamification/badges');
    return response.data;
  },
};

// Servicios de búsqueda
export const searchService = {
  // Búsqueda global
  globalSearch: async (query, filters = {}) => {
    const response = await api.get('/search', { 
      params: { q: query, ...filters } 
    });
    return response.data;
  },

  // Búsqueda de eventos
  searchEvents: async (query, filters = {}) => {
    const response = await api.get('/search/events', { 
      params: { q: query, ...filters } 
    });
    return response.data;
  },

  // Búsqueda de tribus
  searchTribes: async (query, filters = {}) => {
    const response = await api.get('/search/tribes', { 
      params: { q: query, ...filters } 
    });
    return response.data;
  },

  // Búsqueda de usuarios
  searchUsers: async (query, filters = {}) => {
    const response = await api.get('/search/users', { 
      params: { q: query, ...filters } 
    });
    return response.data;
  },
};

// Servicios de recomendaciones AI
export const aiRecommendationService = {
  // Obtener recomendaciones de eventos
  getEventRecommendations: async () => {
    const response = await api.get('/ai/recommendations/events');
    return response.data;
  },

  // Obtener recomendaciones de tribus
  getTribeRecommendations: async () => {
    const response = await api.get('/ai/recommendations/tribes');
    return response.data;
  },

  // Obtener recomendaciones de usuarios
  getUserRecommendations: async () => {
    const response = await api.get('/ai/recommendations/users');
    return response.data;
  },

  // Obtener análisis de demanda
  getDemandAnalysis: async (location, category) => {
    const response = await api.get('/ai/demand-analysis', { 
      params: { location, category } 
    });
    return response.data;
  },
};

// Configuración de WebSocket
export const socketConfig = {
  url: WS_URL,
  options: {
    transports: ['websocket', 'polling'],
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  },
};

// Utilidades
export const apiUtils = {
  // Obtener token de acceso
  getAccessToken: () => localStorage.getItem('accessToken'),
  
  // Obtener usuario actual
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  // Verificar si está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },
  
  // Limpiar datos de autenticación
  clearAuth: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
  
  // Manejar errores de API
  handleError: (error) => {
    if (error.response) {
      // Error de respuesta del servidor
      const { status, data } = error.response;
      switch (status) {
        case 400:
          return { type: 'validation', message: data.message || 'Datos inválidos' };
        case 401:
          return { type: 'auth', message: 'No autorizado' };
        case 403:
          return { type: 'forbidden', message: 'Acceso denegado' };
        case 404:
          return { type: 'not_found', message: 'Recurso no encontrado' };
        case 500:
          return { type: 'server', message: 'Error del servidor' };
        default:
          return { type: 'unknown', message: 'Error desconocido' };
      }
    } else if (error.request) {
      // Error de red
      return { type: 'network', message: 'Error de conexión' };
    } else {
      // Error de configuración
      return { type: 'config', message: 'Error de configuración' };
    }
  },
};

export default api;