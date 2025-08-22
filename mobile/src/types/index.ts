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
    push?: boolean;
    email?: boolean;
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

// ===== MOBILE SPECIFIC TYPES =====
export interface MobileAppState {
  isActive: boolean;
  isBackground: boolean;
  networkType: 'wifi' | 'cellular' | 'none';
  batteryLevel?: number;
  deviceInfo: {
    platform: 'ios' | 'android';
    version: string;
    model: string;
  };
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
  sound?: string;
  categoryId?: string;
}

export interface LocationPermission {
  granted: boolean;
  accuracy: 'high' | 'medium' | 'low';
  backgroundAllowed: boolean;
}

// ===== NAVIGATION TYPES =====
export type RootStackParamList = {
  Home: undefined;
  EventDetails: { eventId: string };
  Search: { initialQuery?: string };
  Profile: { userId?: string };
  TribeDetails: { tribeId: string };
  CreateEvent: undefined;
  Settings: undefined;
  Notifications: undefined;
  Map: { events?: Event[] };
  Onboarding: undefined;
};

export type TabParamList = {
  ForYou: undefined;
  Explore: undefined;
  Map: undefined;
  Tribes: undefined;
  Profile: undefined;
};

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

// ===== ANALYTICS TYPES =====
export interface AnalyticsEvent {
  name: string;
  properties: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp: number;
  screen?: string;
  platform: 'mobile';
}

export interface RealTimeMetrics {
  activeUsers: number;
  eventsToday: number;
  newSignups: number;
  engagementRate: number;
  trendingEvents: string[];
  lastUpdated: string;
}

// ===== STORAGE TYPES =====
export interface StorageKeys {
  USER_DATA: 'user_data';
  AUTH_TOKEN: 'auth_token';
  RECOMMENDATIONS: 'recommendations';
  SEARCH_HISTORY: 'search_history';
  NOTIFICATION_SETTINGS: 'notification_settings';
  THEME_SETTINGS: 'theme_settings';
  ONBOARDING_COMPLETED: 'onboarding_completed';
  GAMIFICATION_DATA: 'gamification_data';
}

// ===== COMPONENT PROPS TYPES =====
export interface EventCardProps {
  event: Event;
  variant?: 'default' | 'compact' | 'featured';
  onPress?: (event: Event) => void;
  showActions?: boolean;
}

export interface TribeCardProps {
  tribe: Tribe;
  onPress?: (tribe: Tribe) => void;
  onJoin?: (tribeId: string) => void;
}

export interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilterPress?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

// ===== THEME TYPES =====
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

export interface MobileTheme {
  colors: ThemeColors;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: number;
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

// ===== EXPORT UTILITIES =====
export type EventWithScore = Event & { score: number; reasons: string[] };
export type UserWithStats = User & { stats: any };
export type TribeWithMetrics = Tribe & { metrics: any };