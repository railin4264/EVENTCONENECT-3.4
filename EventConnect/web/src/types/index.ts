// Core types for EventConnect AI

export interface Location {
  latitude: number
  longitude: number
  address: string
  city: string
  country: string
  postalCode?: string
}

export interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  bio?: string
  interests: string[]
  location: Location
  reputation: number
  memberSince: Date
  isVerified: boolean
  preferences: UserPreferences
}

export interface UserPreferences {
  notifications: {
    events: boolean
    messages: boolean
    tribes: boolean
    recommendations: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private'
    locationSharing: boolean
    activityVisibility: 'public' | 'friends' | 'private'
  }
  interests: string[]
  maxDistance: number
  preferredCategories: string[]
}

export interface Event {
  id: string
  title: string
  description: string
  category: EventCategory
  subcategory?: string
  date: Date
  startTime: string
  endTime: string
  location: Location
  host: User
  maxAttendees?: number
  currentAttendees: number
  price?: number
  currency?: string
  images: string[]
  tags: string[]
  isRecurring: boolean
  recurrencePattern?: string
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
  aiScore: number // AI recommendation score
  popularity: number
  reviews: Review[]
  averageRating: number
}

export type EventCategory = 
  | 'music'
  | 'sports'
  | 'food'
  | 'art'
  | 'technology'
  | 'business'
  | 'education'
  | 'social'
  | 'outdoor'
  | 'wellness'
  | 'entertainment'
  | 'culture'
  | 'other'

export interface Tribe {
  id: string
  name: string
  description: string
  category: TribeCategory
  location: Location
  creator: User
  members: User[]
  memberCount: number
  maxMembers?: number
  isPrivate: boolean
  isVerified: boolean
  avatar?: string
  banner?: string
  tags: string[]
  rules: string[]
  createdAt: Date
  updatedAt: Date
  posts: Post[]
  events: Event[]
  aiScore: number
  activityLevel: 'low' | 'medium' | 'high'
}

export type TribeCategory = 
  | 'hobby'
  | 'professional'
  | 'cultural'
  | 'sports'
  | 'academic'
  | 'creative'
  | 'social'
  | 'business'
  | 'health'
  | 'spiritual'
  | 'other'

export interface Post {
  id: string
  author: User
  tribe?: Tribe
  event?: Event
  content: string
  images?: string[]
  likes: string[] // User IDs
  comments: Comment[]
  createdAt: Date
  updatedAt: Date
  isPinned: boolean
  isEdited: boolean
}

export interface Comment {
  id: string
  author: User
  content: string
  likes: string[]
  createdAt: Date
  updatedAt: Date
  isEdited: boolean
  replies?: Comment[]
}

export interface Review {
  id: string
  reviewer: User
  event?: Event
  tribe?: Tribe
  rating: number // 1-5
  comment: string
  createdAt: Date
  updatedAt: Date
  isVerified: boolean
}

export interface Message {
  id: string
  sender: User
  recipient: User
  content: string
  type: 'text' | 'image' | 'file'
  attachments?: string[]
  isRead: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ChatRoom {
  id: string
  participants: User[]
  lastMessage?: Message
  unreadCount: number
  createdAt: Date
  updatedAt: Date
  isGroup: boolean
  name?: string // For group chats
  avatar?: string // For group chats
}

export interface Notification {
  id: string
  recipient: User
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  isRead: boolean
  createdAt: Date
  actionUrl?: string
}

export type NotificationType = 
  | 'event_reminder'
  | 'event_update'
  | 'new_message'
  | 'tribe_invite'
  | 'event_invite'
  | 'new_review'
  | 'recommendation'
  | 'system'

export interface AIRecommendation {
  id: string
  user: User
  type: 'event' | 'tribe' | 'user'
  item: Event | Tribe | User
  score: number
  reason: string
  category: string
  createdAt: Date
  isViewed: boolean
}

export interface SearchFilters {
  query?: string
  category?: string
  subcategory?: string
  distance?: number
  dateRange?: {
    start: Date
    end: Date
  }
  priceRange?: {
    min: number
    max: number
  }
  tags?: string[]
  popularity?: 'low' | 'medium' | 'high'
  rating?: number
  isFree?: boolean
  isRecurring?: boolean
}

export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  location: Location
  interests: string[]
}

export interface EventFormData {
  title: string
  description: string
  category: EventCategory
  subcategory?: string
  date: Date
  startTime: string
  endTime: string
  location: Location
  maxAttendees?: number
  price?: number
  currency?: string
  tags: string[]
  isRecurring: boolean
  recurrencePattern?: string
}

export interface TribeFormData {
  name: string
  description: string
  category: TribeCategory
  location: Location
  isPrivate: boolean
  maxMembers?: number
  tags: string[]
  rules: string[]
}

// Utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface AsyncState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
}

export type Theme = 'light' | 'dark' | 'system'

export interface AppConfig {
  apiUrl: string
  mapboxToken: string
  maxFileSize: number
  supportedImageTypes: string[]
  maxImagesPerPost: number
  maxTagsPerItem: number
}
