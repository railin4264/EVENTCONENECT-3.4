import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000');

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Demo mode (no-backend) using Axios adapter mock
if (process.env.NEXT_PUBLIC_DEMO === 'true') {
  // Minimal inline adapter to intercept requests and return mock data
  const demoEvents = Array.from({ length: 16 }).map((_, i) => ({
    id: `demo-${i + 1}`,
    title: `Evento Demo ${i + 1}`,
    description: 'Experiencia inmersiva con música, networking y diversión.',
    category: ['music','sports','tech','art'][i % 4],
    tags: ['demo','ciudad','social'].slice(0, (i % 3) + 1),
    host: {
      id: `host-${i % 4}`,
      username: `anfitrion${i % 4}`,
      firstName: 'Host',
      lastName: String(i % 4),
      rating: 4 + ((i % 10) / 10),
      reviewCount: 10 + i,
    },
    location: {
      // GeoJSON [lng, lat]
      coordinates: [-58.3816 + (i * 0.01), -34.6037 + (i * 0.01)],
      address: `Calle ${i + 1} #${100 + i}`,
      city: 'Ciudad Demo',
      country: 'AR',
    },
    dateTime: {
      start: new Date(Date.now() + i * 36e5).toISOString(),
      end: new Date(Date.now() + (i * 36e5) + 2 * 36e5).toISOString(),
      timezone: 'UTC',
    },
    capacity: { max: 50 + i, current: Math.min(50, i * 3), waitlist: Math.max(0, i - 10) },
    pricing: { isFree: i % 3 === 0, amount: i % 3 === 0 ? 0 : 20 + i, currency: 'USD' },
    media: { images: [], videos: [] },
    attendees: [],
    reviews: [],
    stats: { viewCount: 100 + i * 5, shareCount: i * 2, saveCount: i * 3, averageRating: 4.2, reviewCount: 10 + i },
    settings: { isPublic: true, allowComments: true, requireApproval: false, maxWaitlist: 50 },
    status: 'published',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (api as any).defaults.adapter = async (config: any) => {
    const ok = (data: any, status = 200) => ({
      data,
      status,
      statusText: 'OK',
      headers: {},
      config,
    });

    // Events listing
    if (config.url?.startsWith('/api/events') && config.method === 'get') {
      if (/^\/api\/events\/search/.test(config.url)) {
        const url = new URL(config.url, 'http://demo.local');
        const q = url.searchParams.get('q')?.toLowerCase() || '';
        const filtered = demoEvents.filter(e => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
        return ok({ events: filtered, pagination: { total: filtered.length } });
      }
      if (/^\/api\/events\/[A-Za-z0-9-]+$/.test(config.url)) {
        const id = config.url.split('/').pop();
        const event = demoEvents.find(e => e.id === id);
        return ok({ event }, event ? 200 : 404);
      }
      return ok({ events: demoEvents, pagination: { total: demoEvents.length } });
    }

    // Join/leave/save/like can be no-ops in demo
    if (config.url?.match(/^\/api\/events\/.+\/(join|leave|like|share)$/)) {
      return ok({ success: true });
    }

    // Auth/profile stub
    if (config.url === '/api/auth/profile') {
      return ok({ user: { id: 'demo-user', email: 'demo@demo.com', name: 'Demo User' } });
    }

    // Default
    return ok({ ok: true });
  };
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('accessToken');
    if (token) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }

    // Add request timestamp
    (config as any).metadata = { startTime: new Date() };

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Calculate response time
    const endTime = new Date();
    const startTime = (response.config as any).metadata?.startTime;
    if (startTime) {
      const responseTime = endTime.getTime() - startTime.getTime();
      console.log(`API Response Time: ${responseTime}ms`);
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, {
            refreshToken,
          });

          const tokens = response.data?.data?.tokens || response.data?.tokens;
          const newAccessToken = tokens?.accessToken || response.data?.accessToken;
          const newRefreshToken = tokens?.refreshToken || response.data?.refreshToken;

          if (newAccessToken) {
            localStorage.setItem('accessToken', newAccessToken);
          }
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          // Retry original request
          (originalRequest.headers as any).Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    
    // Show error toast for non-401 errors
    if (error.response?.status !== 401) {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

// API Methods
export const apiService = {
  // Generic methods
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    api.get(url, config).then((response) => response.data),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    api.post(url, data, config).then((response) => response.data),

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    api.put(url, data, config).then((response) => response.data),

  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    api.patch(url, data, config).then((response) => response.data),

  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    api.delete(url, config).then((response) => response.data),

  // File upload
  upload: <T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> =>
    api.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    }).then((response) => response.data),

  // Download file
  download: (url: string, filename?: string): Promise<void> =>
    api.get(url, { responseType: 'blob' }).then((response) => {
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    }),
};

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    apiService.post('/api/auth/login', credentials),

  register: (userData: any) =>
    apiService.post('/api/auth/register', userData),

  logout: () =>
    apiService.post('/api/auth/logout'),

  refresh: (refreshToken: string) =>
    apiService.post('/api/auth/refresh-token', { refreshToken }),

  me: () =>
    apiService.get('/api/auth/profile'),

  forgotPassword: (email: string) =>
    apiService.post('/api/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    apiService.post('/api/auth/reset-password', { token, password }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiService.post('/api/auth/change-password', { currentPassword, newPassword }),

  updateProfile: (userData: any) =>
    apiService.put('/api/auth/profile', userData),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiService.upload('/api/auth/avatar', formData);
  },
};

// Events API
export const eventsAPI = {
  getAll: (params?: any) =>
    apiService.get('/api/events', { params }),

  getById: (id: string) =>
    apiService.get(`/api/events/${id}`),

  create: (eventData: any) =>
    apiService.post('/api/events', eventData),

  update: (id: string, eventData: any) =>
    apiService.put(`/api/events/${id}`, eventData),

  delete: (id: string) =>
    apiService.delete(`/api/events/${id}`),

  join: (id: string) =>
    apiService.post(`/api/events/${id}/join`),

  leave: (id: string) =>
    apiService.post(`/api/events/${id}/leave`),

  like: (id: string) =>
    apiService.post(`/api/events/${id}/like`),

  unlike: (id: string) =>
    apiService.delete(`/api/events/${id}/like`),

  share: (id: string) =>
    apiService.post(`/api/events/${id}/share`),

  uploadImage: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiService.upload(`/api/events/${id}/images`, formData);
  },

  getNearby: (latitude: number, longitude: number, radius?: number) =>
    apiService.get('/api/events/nearby', { params: { latitude, longitude, radius } }),

  search: (query: string, filters?: any) =>
    apiService.get('/api/events/search', { params: { q: query, ...filters } }),
};

// Tribes API
export const tribesAPI = {
  getAll: (params?: any) =>
    apiService.get('/api/tribes', { params }),

  getById: (id: string) =>
    apiService.get(`/api/tribes/${id}`),

  create: (tribeData: any) =>
    apiService.post('/api/tribes', tribeData),

  update: (id: string, tribeData: any) =>
    apiService.put(`/api/tribes/${id}`, tribeData),

  delete: (id: string) =>
    apiService.delete(`/api/tribes/${id}`),

  join: (id: string) =>
    apiService.post(`/api/tribes/${id}/join`),

  leave: (id: string) =>
    apiService.post(`/api/tribes/${id}/leave`),

  invite: (id: string, userId: string) =>
    apiService.post(`/api/tribes/${id}/invite`, { userId }),

  removeMember: (id: string, userId: string) =>
    apiService.delete(`/api/tribes/${id}/members/${userId}`),

  uploadAvatar: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiService.upload(`/api/tribes/${id}/avatar`, formData);
  },

  uploadBanner: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('banner', file);
    return apiService.upload(`/api/tribes/${id}/banner`, formData);
  },

  search: (query: string, filters?: any) =>
    apiService.get('/api/tribes/search', { params: { q: query, ...filters } }),
};

// Posts API
export const postsAPI = {
  getAll: (params?: any) =>
    apiService.get('/api/posts', { params }),

  getById: (id: string) =>
    apiService.get(`/api/posts/${id}`),

  create: (postData: any) =>
    apiService.post('/api/posts', postData),

  update: (id: string, postData: any) =>
    apiService.put(`/api/posts/${id}`, postData),

  delete: (id: string) =>
    apiService.delete(`/api/posts/${id}`),

  like: (id: string) =>
    apiService.post(`/api/posts/${id}/like`),

  unlike: (id: string) =>
    apiService.delete(`/api/posts/${id}/like`),

  comment: (id: string, commentData: any) =>
    apiService.post(`/api/posts/${id}/comments`, commentData),

  deleteComment: (postId: string, commentId: string) =>
    apiService.delete(`/api/posts/${postId}/comments/${commentId}`),

  share: (id: string) =>
    apiService.post(`/api/posts/${id}/share`),

  uploadImage: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiService.upload(`/api/posts/${id}/images`, formData);
  },

  getFeed: (params?: any) =>
    apiService.get('/api/posts/feed', { params }),
};

// Chat API
export const chatAPI = {
  getChats: () =>
    apiService.get('/api/chat'),

  getChat: (id: string) =>
    apiService.get(`/api/chat/${id}`),

  createChat: (chatData: any) =>
    apiService.post('/api/chat', chatData),

  getMessages: (chatId: string, params?: any) =>
    apiService.get(`/api/chat/${chatId}/messages`, { params }),

  sendMessage: (chatId: string, messageData: any) =>
    apiService.post(`/api/chat/${chatId}/messages`, messageData),

  updateMessage: (chatId: string, messageId: string, messageData: any) =>
    apiService.put(`/api/chat/${chatId}/messages/${messageId}`, messageData),

  deleteMessage: (chatId: string, messageId: string) =>
    apiService.delete(`/api/chat/${chatId}/messages/${messageId}`),

  markAsRead: (chatId: string) =>
    apiService.post(`/api/chat/${chatId}/read`),

  addMember: (chatId: string, userId: string) =>
    apiService.post(`/api/chat/${chatId}/members`, { userId }),

  removeMember: (chatId: string, userId: string) =>
    apiService.delete(`/api/chat/${chatId}/members/${userId}`),
};

// Notifications API
export const notificationsAPI = {
  getAll: (params?: any) =>
    apiService.get('/api/notifications', { params }),

  getById: (id: string) =>
    apiService.get(`/api/notifications/${id}`),

  markAsRead: (id: string) =>
    apiService.patch(`/api/notifications/${id}/read`),

  markAllAsRead: () =>
    apiService.patch('/api/notifications/read-all'),

  delete: (id: string) =>
    apiService.delete(`/api/notifications/${id}`),

  deleteAll: () =>
    apiService.delete('/api/notifications'),

  getPreferences: () =>
    apiService.get('/api/notifications/preferences'),

  updatePreferences: (preferences: any) =>
    apiService.patch('/api/notifications/preferences', preferences),

  registerPushToken: (tokenData: any) =>
    apiService.post('/api/notifications/push-token', tokenData),

  unregisterPushToken: (token: string) =>
    apiService.delete(`/api/notifications/push-token/${token}`),
};

// Search API
export const searchAPI = {
  global: (query: string, filters?: any) =>
    apiService.get('/api/search', { params: { q: query, ...filters } }),

  events: (query: string, filters?: any) =>
    apiService.get('/api/search/events', { params: { q: query, ...filters } }),

  tribes: (query: string, filters?: any) =>
    apiService.get('/api/search/tribes', { params: { q: query, ...filters } }),

  users: (query: string, filters?: any) =>
    apiService.get('/api/search/users', { params: { q: query, ...filters } }),

  posts: (query: string, filters?: any) =>
    apiService.get('/api/search/posts', { params: { q: query, ...filters } }),
};

// Location API
export const locationAPI = {
  validateAddress: (address: string) =>
    apiService.post('/api/location/validate-address', { address }),

  getNearbyPlaces: (latitude: number, longitude: number, radius?: number, type?: string) =>
    apiService.get('/api/location/nearby-places', { params: { latitude, longitude, radius, type } }),

  calculateRoute: (origin: any, destination: any, mode?: string) =>
    apiService.post('/api/location/calculate-route', { origin, destination, mode }),

  autocomplete: (query: string, types?: string[]) =>
    apiService.get('/api/location/autocomplete', { params: { q: query, types } }),
};

// Analytics API
export const analyticsAPI = {
  trackEvent: (eventData: any) =>
    apiService.post('/api/analytics/events', eventData),

  trackPageView: (pageData: any) =>
    apiService.post('/api/analytics/pages', pageData),

  getMetrics: (params?: any) =>
    apiService.get('/api/analytics/metrics', { params }),

  getDashboard: () =>
    apiService.get('/api/analytics/dashboard'),
};

// Export everything
export default api;