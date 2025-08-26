// API Service for EventConnect - Enhanced Integration with Backend v2.0.0

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Types - Aligned with Backend Models
export interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  interests: string[];
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat] - MongoDB GeoJSON format
    address?: string;
    city?: string;
    country?: string;
  };
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    publicProfile: boolean;
    language: string;
    theme: string;
  };
  socialProfiles?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  followers: string[];
  following: string[];
  tribes: string[];
  reputation: number;
  isVerified: boolean;
  lastActiveAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  category: string;
  subcategories: string[];
  tags: string[];
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
    address: string;
    city: string;
    state?: string;
    country: string;
    venue?: string;
    venueDetails?: {
      name: string;
      capacity: number;
      facilities: string[];
    };
  };
  dateTime: {
    start: string;
    end: string;
    timezone: string;
    isAllDay: boolean;
  };
  organizer: string; // User ID
  organizerDetails?: {
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    reputation: number;
    isVerified: boolean;
  };
  attendees: string[]; // User IDs
  maxAttendees?: number;
  waitingList: string[];
  images: string[];
  videos: string[];
  price: {
    amount: number;
    currency: string;
    type: 'free' | 'paid' | 'donation';
    earlyBird?: {
      amount: number;
      validUntil: string;
    };
  };
  requirements: {
    ageRestriction?: {
      min: number;
      max?: number;
    };
    skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    equipment?: string[];
    prerequisites?: string[];
  };
  isOnline: boolean;
  onlineDetails?: {
    platform: string;
    meetingId?: string;
    accessInstructions?: string;
  };
  status: 'draft' | 'published' | 'cancelled' | 'completed' | 'postponed';
  visibility: 'public' | 'private' | 'tribe-only';
  tribe?: string; // Tribe ID if tribe-only
  isRecurring: boolean;
  recurrencePattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: string;
    occurrences?: number;
  };
  metrics: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
    saves: number;
  };
  reviews: string[]; // Review IDs
  averageRating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
  distance?: number; // Calculated field for nearby events
}

export interface Tribe {
  _id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  avatar?: string;
  coverImage?: string;
  creator: string; // User ID
  admins: string[];
  moderators: string[];
  members: string[];
  pendingRequests: string[];
  blockedUsers: string[];
  isPrivate: boolean;
  requiresApproval: boolean;
  location?: {
    type: 'Point';
    coordinates: [number, number];
    address?: string;
    city?: string;
    country?: string;
  };
  rules: string[];
  events: string[]; // Event IDs
  posts: string[]; // Post IDs
  metrics: {
    totalMembers: number;
    activeMembers: number;
    totalEvents: number;
    totalPosts: number;
  };
  settings: {
    allowMemberInvites: boolean;
    allowMemberPosts: boolean;
    autoAcceptEvents: boolean;
    notificationsEnabled: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresIn: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// API Client Class
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Cargar token del localStorage si existe
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken');
    }
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Agregar token de autenticación si existe
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || 'Error en la petición',
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de conexión',
      };
    }
  }

  // Métodos de autenticación - Endpoints reales del backend
  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    interests?: string[];
    location?: {
      coordinates: [number, number];
      address?: string;
      city?: string;
      country?: string;
    };
  }): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async loginWithGoogle(token: string): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });

    if (response.success && response.data) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async loginWithFacebook(accessToken: string): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/api/auth/facebook', {
      method: 'POST',
      body: JSON.stringify({ accessToken }),
    });

    if (response.success && response.data) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async resetPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async confirmResetPassword(token: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  async logout(): Promise<void> {
    await this.request('/api/auth/logout', { method: 'POST' });
    this.clearToken();
  }

  // Métodos de eventos - Endpoints reales del backend
  async getEvents(params?: {
    lat?: number;
    lng?: number;
    radius?: number; // En km
    category?: string;
    subcategories?: string[];
    tags?: string[];
    startDate?: string;
    endDate?: string;
    priceMin?: number;
    priceMax?: number;
    status?: string;
    visibility?: string;
    limit?: number;
    page?: number;
    sort?: string;
    search?: string;
  }): Promise<ApiResponse<{ events: Event[]; total: number; page: number; totalPages: number }>> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            queryParams.append(key, value.join(','));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }

    return this.request<{ events: Event[]; total: number; page: number; totalPages: number }>(`/api/events?${queryParams.toString()}`);
  }

  async getNearbyEvents(lat: number, lng: number, radius: number = 10): Promise<ApiResponse<Event[]>> {
    return this.request<Event[]>(`/api/events/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
  }

  async getTrendingEvents(): Promise<ApiResponse<Event[]>> {
    return this.request<Event[]>('/api/events/trending');
  }

  async getRecommendedEvents(): Promise<ApiResponse<Event[]>> {
    return this.request<Event[]>('/api/events/recommendations');
  }

  async getFeaturedEvents(): Promise<ApiResponse<Event[]>> {
    return this.request<Event[]>('/api/events/featured');
  }

  async getEvent(id: string): Promise<ApiResponse<Event>> {
    return this.request<Event>(`/api/events/${id}`);
  }

  async attendEvent(eventId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<{ success: boolean }>(`/api/events/${eventId}/attend`, {
      method: 'POST',
    });
  }

  async unattendEvent(eventId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<{ success: boolean }>(`/api/events/${eventId}/unattend`, {
      method: 'DELETE',
    });
  }

  // Métodos de usuario
  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async updateLocation(location: {
    lat: number;
    lng: number;
  }): Promise<ApiResponse<User>> {
    return this.request<User>('/api/user/location', {
      method: 'PUT',
      body: JSON.stringify({ location }),
    });
  }

  async updateInterests(interests: string[]): Promise<ApiResponse<User>> {
    return this.request<User>('/api/user/interests', {
      method: 'PUT',
      body: JSON.stringify({ interests }),
    });
  }

  async getRecommendations(): Promise<ApiResponse<Event[]>> {
    return this.request<Event[]>('/api/user/recommendations');
  }

  // Métodos de Tribes
  async getTribes(params?: {
    category?: string;
    search?: string;
    limit?: number;
    page?: number;
  }): Promise<ApiResponse<{ tribes: Tribe[]; total: number; page: number; totalPages: number }>> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    return this.request<{ tribes: Tribe[]; total: number; page: number; totalPages: number }>(`/api/tribes?${queryParams.toString()}`);
  }

  async getTribe(id: string): Promise<ApiResponse<Tribe>> {
    return this.request<Tribe>(`/api/tribes/${id}`);
  }

  async joinTribe(tribeId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<{ success: boolean }>(`/api/tribes/${tribeId}/join`, {
      method: 'POST',
    });
  }

  async leaveTribe(tribeId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<{ success: boolean }>(`/api/tribes/${tribeId}/leave`, {
      method: 'DELETE',
    });
  }

  async getUserTribes(): Promise<ApiResponse<Tribe[]>> {
    return this.request<Tribe[]>('/api/user/tribes');
  }

  // Métodos de Búsqueda
  async search(query: string, filters?: {
    type?: 'events' | 'tribes' | 'users' | 'all';
    lat?: number;
    lng?: number;
    radius?: number;
    category?: string;
    limit?: number;
  }): Promise<ApiResponse<{
    events: Event[];
    tribes: Tribe[];
    users: User[];
  }>> {
    const queryParams = new URLSearchParams({ q: query });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    return this.request<{
      events: Event[];
      tribes: Tribe[];
      users: User[];
    }>(`/api/search?${queryParams.toString()}`);
  }

  // Métodos de Notificaciones
  async getNotifications(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/api/notifications');
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<{ success: boolean }>(`/api/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<{ success: boolean }>('/api/notifications/read-all', {
      method: 'PUT',
    });
  }

  // Métodos de utilidad
  setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  clearToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Health check para verificar conectividad
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/api/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Instancia singleton del cliente API
export const apiClient = new ApiClient(API_BASE_URL);

// Hooks utilitarios para React
export const useApi = () => {
  return {
    login: apiClient.login.bind(apiClient),
    register: apiClient.register.bind(apiClient),
    logout: apiClient.logout.bind(apiClient),
    getEvents: apiClient.getEvents.bind(apiClient),
    getEvent: apiClient.getEvent.bind(apiClient),
    attendEvent: apiClient.attendEvent.bind(apiClient),
    unattendEvent: apiClient.unattendEvent.bind(apiClient),
    updateProfile: apiClient.updateProfile.bind(apiClient),
    updateLocation: apiClient.updateLocation.bind(apiClient),
    updateInterests: apiClient.updateInterests.bind(apiClient),
    getRecommendations: apiClient.getRecommendations.bind(apiClient),
    isAuthenticated: apiClient.isAuthenticated.bind(apiClient),
    healthCheck: apiClient.healthCheck.bind(apiClient),
  };
};

// Función para obtener datos mockados cuando no hay backend
export const getMockEvents = (userInterests: string[] = [], userLocation?: { lat: number; lng: number }): Event[] => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: 'Festival de Música Electrónica',
      description: 'Una noche épica con los mejores DJs internacionales',
      location: {
        lat: 40.4168,
        lng: -3.7038,
        address: 'Plaza Mayor 1',
        city: 'Madrid',
      },
      date: '2024-12-20',
      time: '22:00',
      organizer: {
        id: 'org1',
        name: 'EventsPro Madrid',
      },
      attendees: 2500,
      maxAttendees: 3000,
      interests: ['music', 'tech'],
      images: ['data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="%23667eea" width="400" height="300"/><text x="200" y="150" text-anchor="middle" fill="white" font-size="20">🎵 Música</text></svg>'],
      price: 45,
      isOnline: false,
      distance: userLocation ? Math.random() * 10 : undefined,
    },
    {
      id: '2',
      title: 'Workshop de Fotografía',
      description: 'Aprende técnicas avanzadas de fotografía urbana',
      location: {
        lat: 41.3851,
        lng: 2.1734,
        address: 'Passeig de Gràcia 123',
        city: 'Barcelona',
      },
      date: '2024-12-22',
      time: '10:00',
      organizer: {
        id: 'org2',
        name: 'FotoArte BCN',
      },
      attendees: 25,
      maxAttendees: 30,
      interests: ['photography', 'art'],
      images: ['data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="%23f093fb" width="400" height="300"/><text x="200" y="150" text-anchor="middle" fill="white" font-size="20">📸 Foto</text></svg>'],
      price: 30,
      isOnline: false,
      distance: userLocation ? Math.random() * 50 : undefined,
    },
    {
      id: '3',
      title: 'Gaming Tournament Online',
      description: 'Competencia de esports con premios increíbles',
      location: {
        lat: 0,
        lng: 0,
        address: 'Online',
        city: 'Virtual',
      },
      date: '2024-12-25',
      time: '16:00',
      organizer: {
        id: 'org3',
        name: 'GameHub',
      },
      attendees: 500,
      interests: ['gaming', 'tech'],
      images: ['data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="%2343e97b" width="400" height="300"/><text x="200" y="150" text-anchor="middle" fill="white" font-size="20">🎮 Gaming</text></svg>'],
      isOnline: true,
    },
  ];

  // Filtrar por intereses si se proporcionan
  if (userInterests.length > 0) {
    return mockEvents.filter(event => 
      event.interests.some(interest => userInterests.includes(interest))
    );
  }

  return mockEvents;
};
