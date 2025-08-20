import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Handle 401 errors and token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = getRefreshToken()
        if (refreshToken) {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
            refreshToken
          })
          
          const { accessToken } = response.data
          setAuthToken(accessToken)
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        clearAuthTokens()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // Handle other errors
    if (error.response?.status === 403) {
      console.error('Access forbidden')
    } else if (error.response?.status === 404) {
      console.error('Resource not found')
    } else if (error.response?.status >= 500) {
      console.error('Server error')
    }

    return Promise.reject(error)
  }
)

// Auth token management
const AUTH_TOKEN_KEY = 'eventconnect_auth_token'
const REFRESH_TOKEN_KEY = 'eventconnect_refresh_token'

export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(AUTH_TOKEN_KEY)
  }
  return null
}

export function setRefreshToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
  }
}

export function getRefreshToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  }
  return null
}

export function clearAuthTokens(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }
}

// API methods
export const api = {
  // Auth endpoints
  auth: {
    login: (credentials: any) => apiClient.post('/auth/login', credentials),
    register: (userData: any) => apiClient.post('/auth/register', userData),
    logout: () => apiClient.post('/auth/logout'),
    refresh: (refreshToken: string) => apiClient.post('/auth/refresh', { refreshToken }),
    forgotPassword: (email: string) => apiClient.post('/auth/forgot-password', { email }),
    resetPassword: (token: string, password: string) => 
      apiClient.post('/auth/reset-password', { token, password }),
    verifyEmail: (token: string) => apiClient.post('/auth/verify-email', { token }),
    resendVerification: (email: string) => apiClient.post('/auth/resend-verification', { email }),
  },

  // User endpoints
  users: {
    getProfile: () => apiClient.get('/users/profile'),
    updateProfile: (userData: any) => apiClient.put('/users/profile', userData),
    uploadAvatar: (file: File) => {
      const formData = new FormData()
      formData.append('avatar', file)
      return apiClient.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    },
    getPreferences: () => apiClient.get('/users/preferences'),
    updatePreferences: (preferences: any) => apiClient.put('/users/preferences', preferences),
    getInterests: () => apiClient.get('/users/interests'),
    updateInterests: (interests: string[]) => apiClient.put('/users/interests', { interests }),
    getEvents: (userId: string) => apiClient.get(`/users/${userId}/events`),
    getTribes: (userId: string) => apiClient.get(`/users/${userId}/tribes`),
    getReviews: (userId: string) => apiClient.get(`/users/${userId}/reviews`),
  },

  // Event endpoints
  events: {
    getAll: (params?: any) => apiClient.get('/events', { params }),
    getById: (id: string) => apiClient.get(`/events/${id}`),
    create: (eventData: any) => apiClient.post('/events', eventData),
    update: (id: string, eventData: any) => apiClient.put(`/events/${id}`, eventData),
    delete: (id: string) => apiClient.delete(`/events/${id}`),
    nearby: (params: any) => apiClient.get('/events/nearby', { params }),
    search: (params: any) => apiClient.get('/events/search', { params }),
    recommendations: (params: any) => apiClient.get('/events/recommendations', { params }),
    trending: (params: any) => apiClient.get('/events/trending', { params }),
    categories: () => apiClient.get('/events/categories'),
    join: (id: string) => apiClient.post(`/events/${id}/join`),
    leave: (id: string) => apiClient.post(`/events/${id}/leave`),
    attendees: (id: string) => apiClient.get(`/events/${id}/attendees`),
    reviews: (id: string) => apiClient.get(`/events/${id}/reviews`),
    addReview: (id: string, reviewData: any) => apiClient.post(`/events/${id}/reviews`, reviewData),
  },

  // Tribe endpoints
  tribes: {
    getAll: (params?: any) => apiClient.get('/tribes', { params }),
    getById: (id: string) => apiClient.get(`/tribes/${id}`),
    create: (tribeData: any) => apiClient.post('/tribes', tribeData),
    update: (id: string, tribeData: any) => apiClient.put(`/tribes/${id}`, tribeData),
    delete: (id: string) => apiClient.delete(`/tribes/${id}`),
    nearby: (params: any) => apiClient.get('/tribes/nearby', { params }),
    search: (params: any) => apiClient.get('/tribes/search', { params }),
    recommendations: (params: any) => apiClient.get('/tribes/recommendations', { params }),
    trending: (params: any) => apiClient.get('/tribes/trending', { params }),
    categories: () => apiClient.get('/tribes/categories'),
    join: (id: string) => apiClient.post(`/tribes/${id}/join`),
    leave: (id: string) => apiClient.post(`/tribes/${id}/leave`),
    members: (id: string) => apiClient.get(`/tribes/${id}/members`),
    posts: (id: string) => apiClient.get(`/tribes/${id}/posts`),
    createPost: (id: string, postData: any) => apiClient.post(`/tribes/${id}/posts`, postData),
  },

  // Post endpoints
  posts: {
    getById: (id: string) => apiClient.get(`/posts/${id}`),
    create: (postData: any) => apiClient.post('/posts', postData),
    update: (id: string, postData: any) => apiClient.put(`/posts/${id}`, postData),
    delete: (id: string) => apiClient.delete(`/posts/${id}`),
    like: (id: string) => apiClient.post(`/posts/${id}/like`),
    unlike: (id: string) => apiClient.delete(`/posts/${id}/like`),
    comments: (id: string) => apiClient.get(`/posts/${id}/comments`),
    addComment: (id: string, commentData: any) => apiClient.post(`/posts/${id}/comments`, commentData),
  },

  // Chat endpoints
  chat: {
    getRooms: () => apiClient.get('/chat/rooms'),
    getRoom: (id: string) => apiClient.get(`/chat/rooms/${id}`),
    createRoom: (roomData: any) => apiClient.post('/chat/rooms', roomData),
    getMessages: (roomId: string, params?: any) => 
      apiClient.get(`/chat/rooms/${roomId}/messages`, { params }),
    sendMessage: (roomId: string, messageData: any) => 
      apiClient.post(`/chat/rooms/${roomId}/messages`, messageData),
    markAsRead: (roomId: string) => apiClient.put(`/chat/rooms/${roomId}/read`),
  },

  // Notification endpoints
  notifications: {
    getAll: (params?: any) => apiClient.get('/notifications', { params }),
    getById: (id: string) => apiClient.get(`/notifications/${id}`),
    markAsRead: (id: string) => apiClient.put(`/notifications/${id}/read`),
    markAllAsRead: () => apiClient.put('/notifications/read-all'),
    updatePreferences: (preferences: any) => apiClient.put('/notifications/preferences', preferences),
  },

  // AI endpoints
  ai: {
    getRecommendations: (params: any) => apiClient.get('/ai/recommendations', { params }),
    getEventSuggestions: (params: any) => apiClient.get('/ai/event-suggestions', { params }),
    getTribeSuggestions: (params: any) => apiClient.get('/ai/tribe-suggestions', { params }),
    analyzeInterests: (interests: string[]) => apiClient.post('/ai/analyze-interests', { interests }),
    getPersonalizedFeed: (params: any) => apiClient.get('/ai/personalized-feed', { params }),
  },

  // Upload endpoints
  upload: {
    image: (file: File, type: 'event' | 'tribe' | 'post' | 'avatar') => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      return apiClient.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    },
    multiple: (files: File[], type: 'event' | 'tribe' | 'post') => {
      const formData = new FormData()
      files.forEach(file => formData.append('files', file))
      formData.append('type', type)
      return apiClient.post('/upload/multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    },
  },

  // Analytics endpoints
  analytics: {
    getEventStats: (eventId: string) => apiClient.get(`/analytics/events/${eventId}`),
    getTribeStats: (tribeId: string) => apiClient.get(`/analytics/tribes/${tribeId}`),
    getUserStats: (userId: string) => apiClient.get(`/analytics/users/${userId}`),
    getPlatformStats: () => apiClient.get('/analytics/platform'),
  },
}

// Utility functions
export function isAuthenticated(): boolean {
  return !!getAuthToken()
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Export the main client and utilities
export { apiClient }
export default apiClient
