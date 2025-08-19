import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';

// Auth Store
interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: any, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (userData: any) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        login: (user, token) =>
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          }),
        logout: () =>
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          }),
        setLoading: (loading) => set({ isLoading: loading }),
        updateUser: (userData) =>
          set((state) => ({
            user: { ...state.user, ...userData },
          })),
      }),
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
);

// Theme Store
interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  isDark: boolean;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  devtools(
    persist(
      (set, get) => ({
        theme: 'system',
        isDark: false,
        setTheme: (theme) => {
          const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
          set({ theme, isDark });
        },
        toggleTheme: () => {
          const currentTheme = get().theme;
          const newTheme = currentTheme === 'light' ? 'dark' : 'light';
          get().setTheme(newTheme);
        },
      }),
      {
        name: 'theme-storage',
        storage: createJSONStorage(() => localStorage),
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
  setSidebarOpen: (open: boolean) => void;
  setModalOpen: (open: boolean, modal?: string) => void;
  addNotification: (notification: any) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      sidebarOpen: false,
      modalOpen: false,
      currentModal: null,
      notifications: [],
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setModalOpen: (open, modal) =>
        set({ modalOpen: open, currentModal: modal }),
      addNotification: (notification) =>
        set((state) => ({
          notifications: [...state.notifications, { ...notification, id: Date.now().toString() }],
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
      clearNotifications: () => set({ notifications: [] }),
    })
  )
);

// Events Store
interface EventsState {
  events: any[];
  currentEvent: any | null;
  filters: any;
  pagination: any;
  isLoading: boolean;
  error: string | null;
  setEvents: (events: any[]) => void;
  addEvent: (event: any) => void;
  updateEvent: (id: string, eventData: any) => void;
  removeEvent: (id: string) => void;
  setCurrentEvent: (event: any | null) => void;
  setFilters: (filters: any) => void;
  setPagination: (pagination: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useEventsStore = create<EventsState>()(
  devtools(
    (set, get) => ({
      events: [],
      currentEvent: null,
      filters: {},
      pagination: { page: 1, limit: 10, total: 0 },
      isLoading: false,
      error: null,
      setEvents: (events) => set({ events }),
      addEvent: (event) =>
        set((state) => ({ events: [event, ...state.events] })),
      updateEvent: (id, eventData) =>
        set((state) => ({
          events: state.events.map((e) =>
            e.id === id ? { ...e, ...eventData } : e
          ),
        })),
      removeEvent: (id) =>
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        })),
      setCurrentEvent: (event) => set({ currentEvent: event }),
      setFilters: (filters) => set({ filters }),
      setPagination: (pagination) => set({ pagination }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
    })
  )
);

// Tribes Store
interface TribesState {
  tribes: any[];
  currentTribe: any | null;
  filters: any;
  pagination: any;
  isLoading: boolean;
  error: string | null;
  setTribes: (tribes: any[]) => void;
  addTribe: (tribe: any) => void;
  updateTribe: (id: string, tribeData: any) => void;
  removeTribe: (id: string) => void;
  setCurrentTribe: (tribe: any | null) => void;
  setFilters: (filters: any) => void;
  setPagination: (pagination: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTribesStore = create<TribesState>()(
  devtools(
    (set, get) => ({
      tribes: [],
      currentTribe: null,
      filters: {},
      pagination: { page: 1, limit: 10, total: 0 },
      isLoading: false,
      error: null,
      setTribes: (tribes) => set({ tribes }),
      addTribe: (tribe) =>
        set((state) => ({ tribes: [tribe, ...state.tribes] })),
      updateTribe: (id, tribeData) =>
        set((state) => ({
          tribes: state.tribes.map((t) =>
            t.id === id ? { ...t, ...tribeData } : t
          ),
        })),
      removeTribe: (id) =>
        set((state) => ({
          tribes: state.tribes.filter((t) => t.id !== id),
        })),
      setCurrentTribe: (tribe) => set({ currentTribe: tribe }),
      setFilters: (filters) => set({ filters }),
      setPagination: (pagination) => set({ pagination }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
    })
  )
);

// Chat Store
interface ChatState {
  chats: any[];
  currentChat: any | null;
  messages: any[];
  unreadCount: number;
  isConnected: boolean;
  setChats: (chats: any[]) => void;
  addChat: (chat: any) => void;
  updateChat: (id: string, chatData: any) => void;
  removeChat: (id: string) => void;
  setCurrentChat: (chat: any | null) => void;
  setMessages: (messages: any[]) => void;
  addMessage: (message: any) => void;
  updateMessage: (id: string, messageData: any) => void;
  removeMessage: (id: string) => void;
  setUnreadCount: (count: number) => void;
  setConnected: (connected: boolean) => void;
}

export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => ({
      chats: [],
      currentChat: null,
      messages: [],
      unreadCount: 0,
      isConnected: false,
      setChats: (chats) => set({ chats }),
      addChat: (chat) =>
        set((state) => ({ chats: [chat, ...state.chats] })),
      updateChat: (id, chatData) =>
        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === id ? { ...c, ...chatData } : c
          ),
        })),
      removeChat: (id) =>
        set((state) => ({
          chats: state.chats.filter((c) => c.id !== id),
        })),
      setCurrentChat: (chat) => set({ currentChat: chat }),
      setMessages: (messages) => set({ messages }),
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      updateMessage: (id, messageData) =>
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === id ? { ...m, ...messageData } : m
          ),
        })),
      removeMessage: (id) =>
        set((state) => ({
          messages: state.messages.filter((m) => m.id !== id),
        })),
      setUnreadCount: (count) => set({ unreadCount: count }),
      setConnected: (connected) => set({ isConnected: connected }),
    })
  )
);

// Notifications Store
interface NotificationsState {
  notifications: any[];
  unreadCount: number;
  isLoading: boolean;
  setNotifications: (notifications: any[]) => void;
  addNotification: (notification: any) => void;
  updateNotification: (id: string, notificationData: any) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  setUnreadCount: (count: number) => void;
  setLoading: (loading: boolean) => void;
}

export const useNotificationsStore = create<NotificationsState>()(
  devtools(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      setNotifications: (notifications) => set({ notifications }),
      addNotification: (notification) =>
        set((state) => ({ notifications: [notification, ...state.notifications] })),
      updateNotification: (id, notificationData) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, ...notificationData } : n
          ),
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        })),
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        })),
      setUnreadCount: (count) => set({ unreadCount: count }),
      setLoading: (loading) => set({ isLoading: loading }),
    })
  )
);

// Search Store
interface SearchState {
  query: string;
  filters: any;
  results: any;
  isLoading: boolean;
  error: string | null;
  setQuery: (query: string) => void;
  setFilters: (filters: any) => void;
  setResults: (results: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchState>()(
  devtools(
    (set, get) => ({
      query: '',
      filters: {},
      results: null,
      isLoading: false,
      error: null,
      setQuery: (query) => set({ query }),
      setFilters: (filters) => set({ filters }),
      setResults: (results) => set({ results }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearSearch: () =>
        set({ query: '', filters: {}, results: null, error: null }),
    })
  )
);

// Map Store
interface MapState {
  center: { lat: number; lng: number };
  zoom: number;
  markers: any[];
  selectedMarker: any | null;
  setCenter: (center: { lat: number; lng: number }) => void;
  setZoom: (zoom: number) => void;
  setMarkers: (markers: any[]) => void;
  addMarker: (marker: any) => void;
  removeMarker: (id: string) => void;
  setSelectedMarker: (marker: any | null) => void;
  clearMarkers: () => void;
}

export const useMapStore = create<MapState>()(
  devtools(
    (set, get) => ({
      center: { lat: 0, lng: 0 },
      zoom: 10,
      markers: [],
      selectedMarker: null,
      setCenter: (center) => set({ center }),
      setZoom: (zoom) => set({ zoom }),
      setMarkers: (markers) => set({ markers }),
      addMarker: (marker) =>
        set((state) => ({ markers: [...state.markers, marker] })),
      removeMarker: (id) =>
        set((state) => ({
          markers: state.markers.filter((m) => m.id !== id),
        })),
      setSelectedMarker: (marker) => set({ selectedMarker: marker }),
      clearMarkers: () => set({ markers: [], selectedMarker: null }),
    })
  )
);

// Root Store
export const useRootStore = () => ({
  auth: useAuthStore(),
  theme: useThemeStore(),
  ui: useUIStore(),
  events: useEventsStore(),
  tribes: useTribesStore(),
  chat: useChatStore(),
  notifications: useNotificationsStore(),
  search: useSearchStore(),
  map: useMapStore(),
}); 