// ===== USER TYPES =====
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  interests?: string[];
  location?: {
    city: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  friends?: string[];
  eventsAttended?: number;
  eventsAttendedThisMonth?: number;
  totalPoints?: number;
  recentAchievements?: Achievement[];
  notificationPreferences?: {
    trending?: boolean;
    friends?: boolean;
    reminders?: boolean;
    newEvents?: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

// ===== EVENT TYPES =====
export interface Event {
  id: string;
  title: string;
  description?: string;
  category: string;
  tags?: string[];
  image?: string;
  date: string;
  location?: string | {
    address?: string;
    city?: string;
    venue?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  distance?: string;
  attendees?: number;
  price?: number;
  host?: {
    id?: string;
    name?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    rating?: number;
  };
  hostTribe?: {
    id: string;
    name: string;
    members?: Array<{ id: string; name: string }>;
  };
  isPopular?: boolean;
  isTrending?: boolean;
  friendsAttending?: number;
  createdAt?: string;
  updatedAt?: string;
  
  // Métricas de engagement
  likes?: number;
  shares?: number;
  comments?: number;
  views?: number;
  
  // Compatibilidad con formato existente
  dateTime?: {
    start: string;
    end: string;
  };
  capacity?: {
    current: number;
    max: number;
  };
  pricing?: {
    isFree: boolean;
    amount?: number;
  };
  media?: {
    images: string[];
  };
}

// ===== TRIBE TYPES =====
export interface Tribe {
  id: string;
  name: string;
  description: string;
  image?: string;
  members: number;
  category: string;
  isRecommended?: boolean;
  createdBy: string;
  moderators?: string[];
  tags?: string[];
  location?: {
    city: string;
    country: string;
  };
  settings?: {
    isPublic: boolean;
    requireApproval: boolean;
    maxMembers?: number;
  };
  stats?: {
    eventsCreated: number;
    totalMembers: number;
    activeMembers: number;
  };
  createdAt: string;
  updatedAt: string;
}

// ===== GAMIFICATION TYPES =====
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  category: 'events' | 'social' | 'creation' | 'engagement';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  progress?: {
    current: number;
    target: number;
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirements: string;
  earnedAt?: Date;
}

export interface UserLevel {
  level: number;
  title: string;
  pointsRequired: number;
  benefits: string[];
  badge?: Badge;
}

// ===== NOTIFICATION TYPES =====
export interface Notification {
  id: string;
  type: 'event_reminder' | 'friend_joined' | 'trending' | 'achievement' | 'tribe_invite' | 'event_update';
  title: string;
  message: string;
  data?: {
    eventId?: string;
    userId?: string;
    tribeId?: string;
    achievementId?: string;
    [key: string]: any;
  };
  read: boolean;
  createdAt: string;
  expiresAt?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actions?: Array<{
    label: string;
    action: string;
    style: 'primary' | 'secondary' | 'danger';
  }>;
}

// ===== SEARCH TYPES =====
export interface SearchFilters {
  query?: string;
  category?: string;
  location?: {
    coordinates: [number, number];
    radius: number;
  };
  dateRange?: {
    start: string;
    end: string;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  tags?: string[];
  sortBy?: 'relevance' | 'date' | 'distance' | 'popularity' | 'price';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  filters: SearchFilters;
  suggestions?: string[];
}

// ===== API TYPES =====
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

export interface ApiError {
  message: string;
  code: string;
  details?: any;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ===== ANALYTICS TYPES =====
export interface AnalyticsEvent {
  name: string;
  properties: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp: number;
  page?: string;
  referrer?: string;
}

export interface UserMetrics {
  totalEvents: number;
  eventsThisMonth: number;
  tribesJoined: number;
  achievementsUnlocked: number;
  totalPoints: number;
  level: number;
  engagementScore: number;
  lastActive: string;
}

export interface EventMetrics {
  views: number;
  likes: number;
  shares: number;
  comments: number;
  rsvps: number;
  attendance: number;
  engagementRate: number;
  conversionRate: number;
}

// ===== REAL-TIME TYPES =====
export interface WebSocketMessage {
  type: 'trending_update' | 'notification' | 'event_update' | 'user_online' | 'metrics_update';
  data: any;
  timestamp: number;
  userId?: string;
}

export interface RealTimeMetrics {
  activeUsers: number;
  eventsToday: number;
  newSignups: number;
  engagementRate: number;
  trendingEvents: string[];
  lastUpdated: string;
}

// ===== RECOMMENDATION TYPES =====
export interface RecommendationReason {
  type: 'interest' | 'location' | 'social' | 'popularity' | 'trending';
  description: string;
  confidence: number;
}

export interface RecommendedEvent extends Event {
  recommendationScore: number;
  reasons: RecommendationReason[];
  matchedInterests: string[];
  socialConnections: {
    friendsAttending: number;
    friendsInTribe: number;
  };
}

// ===== THEME TYPES =====
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  accentColor: string;
  borderRadius: number;
  fontFamily: string;
  animations: boolean;
}

// ===== EXPORT ALL =====
export type {
  // Re-export commonly used types
  SearchFilters as Filters,
  ApiResponse as Response,
  PaginatedResponse as PaginatedResult
};
