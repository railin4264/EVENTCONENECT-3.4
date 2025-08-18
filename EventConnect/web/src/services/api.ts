import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (userData: { email: string; password: string; name: string }) =>
    api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  logout: () => api.post('/auth/logout'),
};

export const eventsAPI = {
  getEvents: (params?: any) => api.get('/events', { params }),
  getEvent: (id: string) => api.get(`/events/${id}`),
  createEvent: (data: any) => api.post('/events', data),
  updateEvent: (id: string, data: any) => api.put(`/events/${id}`, data),
  deleteEvent: (id: string) => api.delete(`/events/${id}`),
  joinEvent: (id: string) => api.post(`/events/${id}/join`),
  leaveEvent: (id: string) => api.post(`/events/${id}/leave`),
};

export const tribesAPI = {
  getTribes: (params?: any) => api.get('/tribes', { params }),
  getTribe: (id: string) => api.get(`/tribes/${id}`),
  createTribe: (data: any) => api.post('/tribes', data),
  updateTribe: (id: string, data: any) => api.put(`/tribes/${id}`, data),
  deleteTribe: (id: string) => api.delete(`/tribes/${id}`),
  joinTribe: (id: string) => api.post(`/tribes/${id}/join`),
  leaveTribe: (id: string) => api.post(`/tribes/${id}/leave`),
};

export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  updatePreferences: (data: any) => api.put('/users/preferences', data),
  getStats: () => api.get('/users/stats'),
};

export const aiAPI = {
  getRecommendations: () => api.get('/ai/recommendations'),
  analyzeDNA: () => api.get('/dna/profile'),
  getUniversalTribes: () => api.get('/tribes/universal'),
  getPulseEvents: (params: any) => api.get('/pulse/events', { params }),
};

export const blockchainAPI = {
  getWallet: () => api.get('/blockchain/wallet'),
  getNFTs: () => api.get('/blockchain/nfts'),
  createNFT: (data: any) => api.post('/blockchain/nfts', data),
  getTokens: () => api.get('/blockchain/tokens'),
};

export default api; 