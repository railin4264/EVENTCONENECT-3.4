import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';

// Environment variables
const API_BASE_URL =
  process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:5000';
const API_TIMEOUT = parseInt(process.env['NEXT_PUBLIC_API_TIMEOUT'] || '10000');

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request metadata
    (config as any).metadata = { startTime: new Date() };

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response time
    const startTime = (response.config as any).metadata?.startTime;
    if (startTime) {
      const responseTime = new Date().getTime() - startTime.getTime();
      console.log(`API Response Time: ${responseTime}ms`);
    }

    return response;
  },
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            `${API_BASE_URL}/api/auth/refresh-token`,
            { refreshToken }
          );

          const data = response.data.data || response.data;
          const accessToken = data.tokens?.accessToken || data.accessToken;
          if (accessToken) {
            localStorage.setItem('accessToken', accessToken);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  }
);

// API Service functions
const apiService = {
  // Generic request methods
  get: <T = any>(url: string, config?: any): Promise<T> =>
    api.get(url, config).then(response => response.data),

  post: <T = any>(url: string, data?: any, config?: any): Promise<T> =>
    api.post(url, data, config).then(response => response.data),

  put: <T = any>(url: string, data?: any, config?: any): Promise<T> =>
    api.put(url, data, config).then(response => response.data),

  delete: <T = any>(url: string, config?: any): Promise<T> =>
    api.delete(url, config).then(response => response.data),

  patch: <T = any>(url: string, data?: any, config?: any): Promise<T> =>
    api.patch(url, data, config).then(response => response.data),
};

// Auth API
const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    apiService.post('/api/auth/login', credentials),

  register: (userData: any) => apiService.post('/api/auth/register', userData),

  logout: () => apiService.post('/api/auth/logout'),

  refreshToken: (refreshToken: string) =>
    apiService.post('/api/auth/refresh-token', { refreshToken }),

  getProfile: () => apiService.get('/api/auth/profile'),

  updateProfile: (data: any) => apiService.put('/api/auth/profile', data),

  changePassword: (data: any) =>
    apiService.put('/api/auth/change-password', data),

  forgotPassword: (email: string) =>
    apiService.post('/api/auth/forgot-password', { email }),

  resetPassword: (data: any) =>
    apiService.post('/api/auth/reset-password', data),
};

// Events API
const eventsAPI = {
  getEvents: (params?: any) => apiService.get('/api/events', { params }),

  getEvent: (id: string) => apiService.get(`/api/events/${id}`),

  createEvent: (data: any) => apiService.post('/api/events', data),

  updateEvent: (id: string, data: any) =>
    apiService.put(`/api/events/${id}`, data),

  deleteEvent: (id: string) => apiService.delete(`/api/events/${id}`),

  joinEvent: (id: string) => apiService.post(`/api/events/${id}/join`),

  leaveEvent: (id: string) => apiService.post(`/api/events/${id}/leave`),

  getEventParticipants: (id: string) =>
    apiService.get(`/api/events/${id}/participants`),

  searchEvents: (query: string, filters?: any) =>
    apiService.get('/api/events/search', { params: { q: query, ...filters } }),
  
  getTrending: (params?: any) =>
    apiService.get('/api/events/trending', { params }),
};

// Tribes API
const tribesAPI = {
  getTribes: (params?: any) => apiService.get('/api/tribes', { params }),

  getTribe: (id: string) => apiService.get(`/api/tribes/${id}`),

  createTribe: (data: any) => apiService.post('/api/tribes', data),

  updateTribe: (id: string, data: any) =>
    apiService.put(`/api/tribes/${id}`, data),

  deleteTribe: (id: string) => apiService.delete(`/api/tribes/${id}`),

  joinTribe: (id: string) => apiService.post(`/api/tribes/${id}/join`),

  leaveTribe: (id: string) => apiService.post(`/api/tribes/${id}/leave`),

  getTribeMembers: (id: string) => apiService.get(`/api/tribes/${id}/members`),

  searchTribes: (query: string, filters?: any) =>
    apiService.get('/api/tribes/search', { params: { q: query, ...filters } }),
};

// Posts API
const postsAPI = {
  getPosts: (params?: any) => apiService.get('/api/posts', { params }),

  getPost: (id: string) => apiService.get(`/api/posts/${id}`),

  createPost: (data: any) => apiService.post('/api/posts', data),

  updatePost: (id: string, data: any) =>
    apiService.put(`/api/posts/${id}`, data),

  deletePost: (id: string) => apiService.delete(`/api/posts/${id}`),

  likePost: (id: string) => apiService.post(`/api/posts/${id}/like`),

  unlikePost: (id: string) => apiService.delete(`/api/posts/${id}/like`),

  commentPost: (id: string, data: any) =>
    apiService.post(`/api/posts/${id}/comments`, data),

  getPostComments: (id: string) => apiService.get(`/api/posts/${id}/comments`),
};

// Chat API (aligned with backend /api/chat routes)
const chatAPI = {
  getConversations: () => apiService.get('/api/chat'),

  getConversation: (id: string) => apiService.get(`/api/chat/${id}`),

  sendMessage: (conversationId: string, data: any) =>
    apiService.post(`/api/chat/${conversationId}/messages`, data),

  getMessages: (conversationId: string, params?: any) =>
    apiService.get(`/api/chat/${conversationId}/messages`, { params }),

  createConversation: (data: any) => apiService.post('/api/chat', data),

  markAsRead: (conversationId: string) =>
    apiService.post(`/api/chat/${conversationId}/read`),
};

// Notifications API (aligned with backend /api/notifications/* routes)
const notificationsAPI = {
  getNotifications: (params?: any) =>
    apiService.get('/api/notifications/in-app', { params }),

  markAsRead: (id: string) =>
    apiService.patch(`/api/notifications/in-app/${id}/read`),

  markAllAsRead: () =>
    apiService.patch('/api/notifications/in-app/read-all'),

  deleteNotification: (id: string) =>
    apiService.delete(`/api/notifications/in-app/${id}`),

  updatePreferences: (data: any) =>
    apiService.patch('/api/notifications/preferences', data),
};

// Search API (aligned with backend search and entity search routes)
const searchAPI = {
  // Global search (requires auth)
  search: (query: string, filters?: any) =>
    apiService.post('/api/search/global', { q: query, ...filters }),

  // Entity-specific searches
  searchEvents: (query: string, filters?: any) =>
    apiService.get('/api/events/search', { params: { q: query, ...filters } }),

  searchUsers: (query: string, filters?: any) =>
    apiService.get('/api/users', { params: { search: query, ...filters } }),

  searchTribes: (query: string, filters?: any) =>
    apiService.get('/api/tribes/search', { params: { q: query, ...filters } }),

  suggestions: (query: string, type?: string) =>
    apiService.get('/api/search/suggestions', { params: { q: query, type } }),
};

// Location API (aligned with backend location routes)
const locationAPI = {
  validateAddress: (address: any) =>
    apiService.post('/api/location/validate-address', { address }),

  nearbyPlaces: (lat: number, lng: number, radius?: number, types?: string[]) =>
    apiService.get('/api/location/nearby-places', {
      params: { lat, lng, radius, types: types?.join(',') },
    }),

  calculateRoute: (origin: any, destination: any, mode?: string) =>
    apiService.post('/api/location/calculate-route', { origin, destination, mode }),

  autocomplete: (input: string, sessionToken?: string) =>
    apiService.get('/api/location/autocomplete', { params: { input, sessionToken } }),
};

// Analytics-like endpoints mapped to existing backend routes
const analyticsAPI = {
  getEventStats: (eventId: string) => apiService.get(`/api/events/${eventId}/stats`),

  getUserStats: (userId: string) => apiService.get(`/api/users/${userId}`, { params: { include: 'stats' } }),

  getTribeStats: (tribeId: string) => apiService.get(`/api/tribes/${tribeId}/stats`),

  getPlatformStats: () => apiService.get('/health'),
};

// Themes API (aligned with backend theme routes)
const themesAPI = {
  getThemeConfig: () => apiService.get('/api/themes/config'),
  
  updateThemeConfig: (config: any) => apiService.put('/api/themes/config', config),
  
  getPresetThemes: () => apiService.get('/api/themes/presets'),
  
  applyPresetTheme: (themeId: string) => apiService.post(`/api/themes/presets/${themeId}/apply`),
  
  syncTheme: (deviceId: string, platform: string) => 
    apiService.post('/api/themes/sync', { deviceId, platform }),
};

// Export everything
export {
  api,
  apiService,
  authAPI,
  eventsAPI,
  tribesAPI,
  postsAPI,
  chatAPI,
  notificationsAPI,
  searchAPI,
  locationAPI,
  analyticsAPI,
  themesAPI,
};
