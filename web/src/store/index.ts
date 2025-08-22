import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin' | 'moderator';
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image?: string;
  attendees: number;
  maxAttendees: number;
  category: string;
  tags: string[];
}

export interface Tribe {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  banner?: string;
  members: number;
  maxMembers: number;
  category: string;
  tags: string[];
}

export interface Post {
  id: string;
  content: string;
  author: User;
  likes: number;
  comments: number;
  createdAt: string;
  image?: string;
}

// Auth Store
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      set => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        login: (user: User) =>
          set({ user, isAuthenticated: true, error: null }),
        logout: () => set({ user: null, isAuthenticated: false, error: null }),
        setLoading: (isLoading: boolean) => set({ isLoading }),
        setError: (error: string | null) => set({ error }),
      }),
      {
        name: 'auth-storage',
      }
    )
  )
);

// Events Store
interface EventsState {
  events: Event[];
  currentEvent: Event | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    category: string;
    date: string;
    location: string;
  };
  setEvents: (events: Event[]) => void;
  addEvent: (event: Event) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  setCurrentEvent: (event: Event | null) => void;
  setFilters: (filters: Partial<EventsState['filters']>) => void;
  clearFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useEventsStore = create<EventsState>()(
  devtools(
    persist(
      set => ({
        events: [],
        currentEvent: null,
        isLoading: false,
        error: null,
        filters: {
          category: '',
          date: '',
          location: '',
        },
        setEvents: (events: Event[]) => set({ events }),
        addEvent: (event: Event) =>
          set(state => ({ events: [event, ...state.events] })),
        updateEvent: (id: string, event: Partial<Event>) =>
          set(state => ({
            events: state.events.map(e =>
              e.id === id ? { ...e, ...event } : e
            ),
          })),
        deleteEvent: (id: string) =>
          set(state => ({
            events: state.events.filter(e => e.id !== id),
          })),
        setCurrentEvent: (currentEvent: Event | null) => set({ currentEvent }),
        setFilters: (filters: Partial<EventsState['filters']>) =>
          set(state => ({
            filters: { ...state.filters, ...filters },
          })),
        clearFilters: () =>
          set({
            filters: {
              category: '',
              date: '',
              location: '',
            },
          }),
        setLoading: (isLoading: boolean) => set({ isLoading }),
        setError: (error: string | null) => set({ error }),
      }),
      {
        name: 'events-storage',
      }
    )
  )
);

// Tribes Store
interface TribesState {
  tribes: Tribe[];
  currentTribe: Tribe | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    category: string;
    members: string;
    location: string;
  };
  setTribes: (tribes: Tribe[]) => void;
  addTribe: (tribe: Tribe) => void;
  updateTribe: (id: string, tribe: Partial<Tribe>) => void;
  deleteTribe: (id: string) => void;
  setCurrentTribe: (tribe: Tribe | null) => void;
  setFilters: (filters: Partial<TribesState['filters']>) => void;
  clearFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTribesStore = create<TribesState>()(
  devtools(
    persist(
      set => ({
        tribes: [],
        currentTribe: null,
        isLoading: false,
        error: null,
        filters: {
          category: '',
          members: '',
          location: '',
        },
        setTribes: (tribes: Tribe[]) => set({ tribes }),
        addTribe: (tribe: Tribe) =>
          set(state => ({ tribes: [tribe, ...state.tribes] })),
        updateTribe: (id: string, tribe: Partial<Tribe>) =>
          set(state => ({
            tribes: state.tribes.map(t =>
              t.id === id ? { ...t, ...tribe } : t
            ),
          })),
        deleteTribe: (id: string) =>
          set(state => ({
            tribes: state.tribes.filter(t => t.id !== id),
          })),
        setCurrentTribe: (currentTribe: Tribe | null) => set({ currentTribe }),
        setFilters: (filters: Partial<TribesState['filters']>) =>
          set(state => ({
            filters: { ...state.filters, ...filters },
          })),
        clearFilters: () =>
          set({
            filters: {
              category: '',
              members: '',
              location: '',
            },
          }),
        setLoading: (isLoading: boolean) => set({ isLoading }),
        setError: (error: string | null) => set({ error }),
      }),
      {
        name: 'tribes-storage',
      }
    )
  )
);

// Posts Store
interface PostsState {
  posts: Post[];
  currentPost: Post | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    author: string;
    date: string;
    category: string;
  };
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  updatePost: (id: string, post: Partial<Post>) => void;
  deletePost: (id: string) => void;
  setCurrentPost: (post: Post | null) => void;
  setFilters: (filters: Partial<PostsState['filters']>) => void;
  clearFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const usePostsStore = create<PostsState>()(
  devtools(
    persist(
      set => ({
        posts: [],
        currentPost: null,
        isLoading: false,
        error: null,
        filters: {
          author: '',
          date: '',
          category: '',
        },
        setPosts: (posts: Post[]) => set({ posts }),
        addPost: (post: Post) =>
          set(state => ({ posts: [post, ...state.posts] })),
        updatePost: (id: string, post: Partial<Post>) =>
          set(state => ({
            posts: state.posts.map(p => (p.id === id ? { ...p, ...post } : p)),
          })),
        deletePost: (id: string) =>
          set(state => ({
            posts: state.posts.filter(p => p.id !== id),
          })),
        setCurrentPost: (currentPost: Post | null) => set({ currentPost }),
        setFilters: (filters: Partial<PostsState['filters']>) =>
          set(state => ({
            filters: { ...state.filters, ...filters },
          })),
        clearFilters: () =>
          set({
            filters: {
              author: '',
              date: '',
              category: '',
            },
          }),
        setLoading: (isLoading: boolean) => set({ isLoading }),
        setError: (error: string | null) => set({ error }),
      }),
      {
        name: 'posts-storage',
      }
    )
  )
);

// UI Store
interface UIState {
  sidebarOpen: boolean;
  modalOpen: boolean;
  currentModal: string | null;
  notifications: any[];
  theme: 'light' | 'dark' | 'system';
  toggleSidebar: () => void;
  openModal: (modal: string) => void;
  closeModal: () => void;
  addNotification: (notification: any) => void;
  removeNotification: (id: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      set => ({
        sidebarOpen: false,
        modalOpen: false,
        currentModal: null,
        notifications: [],
        theme: 'system',
        toggleSidebar: () =>
          set(state => ({ sidebarOpen: !state.sidebarOpen })),
        openModal: (modal: string) =>
          set({ modalOpen: true, currentModal: modal }),
        closeModal: () => set({ modalOpen: false, currentModal: null }),
        addNotification: (notification: any) =>
          set(state => ({
            notifications: [...state.notifications, notification],
          })),
        removeNotification: (id: string) =>
          set(state => ({
            notifications: state.notifications.filter(n => n.id !== id),
          })),
        setTheme: (theme: 'light' | 'dark' | 'system') => set({ theme }),
      }),
      {
        name: 'ui-storage',
      }
    )
  )
);

// Search Store
interface SearchState {
  query: string;
  results: any[];
  filters: any;
  isLoading: boolean;
  setQuery: (query: string) => void;
  setResults: (results: any[]) => void;
  setFilters: (filters: any) => void;
  setLoading: (loading: boolean) => void;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchState>()(
  devtools(
    persist(
      set => ({
        query: '',
        results: [],
        filters: {},
        isLoading: false,
        setQuery: (query: string) => set({ query }),
        setResults: (results: any[]) => set({ results }),
        setFilters: (filters: any) => set({ filters }),
        setLoading: (isLoading: boolean) => set({ isLoading }),
        clearSearch: () => set({ query: '', results: [], filters: {} }),
      }),
      {
        name: 'search-storage',
      }
    )
  )
);

// All stores are already exported above
