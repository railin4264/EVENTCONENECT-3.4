// User types
export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  role: 'user' | 'admin' | 'moderator';
  isVerified: boolean;
  isActive: boolean;
  preferences: UserPreferences;
  stats: UserStats;
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string;
}

export interface UserPreferences {
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
    inApp: boolean;
    types: string[];
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    locationSharing: boolean;
    activityStatus: boolean;
  };
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
}

export interface UserStats {
  eventsCreated: number;
  eventsAttended: number;
  tribesJoined: number;
  postsCreated: number;
  followers: number;
  following: number;
  badges: Badge[];
  level: number;
  experience: number;
}

// Event types
export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  startDate: string;
  endDate: string;
  location: Location;
  capacity: number;
  currentAttendees: number;
  price: number;
  currency: string;
  isFree: boolean;
  organizer: User;
  attendees: User[];
  images: string[];
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  visibility: 'public' | 'private' | 'invite-only';
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  venue?: string;
  room?: string;
}

// Tribe types
export interface Tribe {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  avatar?: string;
  banner?: string;
  members: User[];
  moderators: User[];
  owner: User;
  memberCount: number;
  isPrivate: boolean;
  isVerified: boolean;
  rules: string[];
  topics: string[];
  createdAt: string;
  updatedAt: string;
}

// Post types
export interface Post {
  id: string;
  content: string;
  author: User;
  images?: string[];
  video?: string;
  location?: Location;
  event?: Event;
  tribe?: Tribe;
  likes: User[];
  comments: Comment[];
  shares: number;
  views: number;
  isEdited: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  post: string;
  parentComment?: string;
  replies: Comment[];
  likes: User[];
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

// Chat types
export interface Chat {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  avatar?: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'location' | 'event';
  sender: User;
  chat: string;
  replyTo?: Message;
  attachments?: Attachment[];
  isEdited: boolean;
  isDeleted: boolean;
  readBy: User[];
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  type: 'image' | 'file' | 'audio' | 'video';
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

// Notification types
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, any>;
  recipient: User;
  sender?: User;
  isRead: boolean;
  isClicked: boolean;
  priority: 'low' | 'normal' | 'high';
  channels: ('push' | 'email' | 'sms' | 'in-app')[];
  expiresAt?: string;
  createdAt: string;
}

export type NotificationType = 
  | 'event_invite'
  | 'event_reminder'
  | 'event_update'
  | 'event_cancelled'
  | 'tribe_invite'
  | 'tribe_update'
  | 'new_message'
  | 'mention'
  | 'like'
  | 'comment'
  | 'follow'
  | 'system'
  | 'security'
  | 'promotional';

// Badge types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: string;
}

// Search types
export interface SearchFilters {
  query: string;
  type: 'all' | 'events' | 'tribes' | 'users' | 'posts';
  category?: string;
  location?: Location;
  radius?: number;
  dateRange?: {
    start: string;
    end: string;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  tags?: string[];
}

export interface SearchResult {
  events: Event[];
  tribes: Tribe[];
  users: User[];
  posts: Post[];
  total: number;
  hasMore: boolean;
}

// API types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: any;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'time' | 'file';
  placeholder?: string;
  required?: boolean;
  validation?: ValidationRule[];
  options?: SelectOption[];
  multiple?: boolean;
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'url' | 'custom';
  value?: any;
  message: string;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

// UI types
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface Modal {
  id: string;
  title: string;
  content: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  onClose?: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  isClosable?: boolean;
}

// Map types
export interface MapMarker {
  id: string;
  type: 'event' | 'tribe' | 'user';
  position: {
    latitude: number;
    longitude: number;
  };
  title: string;
  description?: string;
  icon?: string;
  data: Event | Tribe | User;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Analytics types
export interface AnalyticsEvent {
  name: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
  timestamp: string;
}

export interface PageView {
  path: string;
  title: string;
  referrer?: string;
  timestamp: string;
  duration?: number;
}

// PWA types
export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface ServiceWorkerMessage {
  type: string;
  payload?: any;
}

// Theme types
export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// Settings types
export interface AppSettings {
  theme: Theme;
  language: string;
  timezone: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  accessibility: AccessibilitySettings;
}

export interface NotificationSettings {
  push: boolean;
  email: boolean;
  sms: boolean;
  inApp: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  types: string[];
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  locationSharing: boolean;
  activityStatus: boolean;
  searchable: boolean;
  contactInfo: boolean;
}

export interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  reduceMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
}
