'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient, Event, User, Tribe } from '@/lib/api';

// Global state management for EventConnect
interface EventConnectState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  events: Event[];
  nearbyEvents: Event[];
  recommendedEvents: Event[];
  userTribes: Tribe[];
  userLocation: { lat: number; lng: number } | null;
  userInterests: string[];
  isOnline: boolean;
  notifications: any[];
  unreadNotifications: number;
}

interface EventConnectActions {
  // Auth actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => Promise<void>;
  
  // Location actions
  requestLocation: () => Promise<boolean>;
  updateLocation: (lat: number, lng: number) => Promise<void>;
  
  // Interest actions
  updateInterests: (interests: string[]) => Promise<void>;
  
  // Event actions
  loadEvents: (params?: any) => Promise<void>;
  loadNearbyEvents: () => Promise<void>;
  loadRecommendedEvents: () => Promise<void>;
  attendEvent: (eventId: string) => Promise<boolean>;
  unattendEvent: (eventId: string) => Promise<boolean>;
  
  // Tribe actions
  loadUserTribes: () => Promise<void>;
  joinTribe: (tribeId: string) => Promise<boolean>;
  leaveTribe: (tribeId: string) => Promise<boolean>;
  
  // Search actions
  search: (query: string, filters?: any) => Promise<any>;
  
  // Notification actions
  loadNotifications: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  
  // Utility actions
  checkBackendStatus: () => Promise<boolean>;
  refreshAll: () => Promise<void>;
}

export const useEventConnect = (): EventConnectState & EventConnectActions => {
  const [state, setState] = useState<EventConnectState>({
    user: null,
    isAuthenticated: false,
    loading: true,
    events: [],
    nearbyEvents: [],
    recommendedEvents: [],
    userTribes: [],
    userLocation: null,
    userInterests: [],
    isOnline: true,
    notifications: [],
    unreadNotifications: 0,
  });

  const initialized = useRef(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize app state
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initializeApp();
    }
  }, []);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const initializeApp = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      // Check if user is authenticated
      const isAuth = apiClient.isAuthenticated();
      
      if (isAuth) {
        // Load user profile
        const userResponse = await apiClient.updateProfile({});
        if (userResponse.success && userResponse.data) {
          setState(prev => ({ 
            ...prev, 
            user: userResponse.data,
            isAuthenticated: true 
          }));
        }
      }

      // Load local storage data
      const savedInterests = localStorage.getItem('userInterests');
      const savedLocation = localStorage.getItem('userLocation');
      
      if (savedInterests) {
        const interests = JSON.parse(savedInterests);
        setState(prev => ({ ...prev, userInterests: interests }));
      }
      
      if (savedLocation) {
        const location = JSON.parse(savedLocation);
        setState(prev => ({ ...prev, userLocation: location }));
      }

      // Load initial data based on authentication state
      if (isAuth) {
        await Promise.all([
          loadEvents(),
          loadUserTribes(),
          loadNotifications(),
        ]);

        if (state.userLocation) {
          await loadNearbyEvents();
        }

        if (state.userInterests.length > 0) {
          await loadRecommendedEvents();
        }
      } else {
        // Load public events for non-authenticated users
        await loadEvents({ status: 'published', visibility: 'public' });
      }

    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiClient.login(email, password);
      
      if (response.success && response.data) {
        setState(prev => ({ 
          ...prev, 
          user: response.data.user, 
          isAuthenticated: true 
        }));
        
        // Refresh data after login
        await refreshAll();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  const register = useCallback(async (userData: any): Promise<boolean> => {
    try {
      const response = await apiClient.register(userData);
      
      if (response.success && response.data) {
        setState(prev => ({ 
          ...prev, 
          user: response.data.user, 
          isAuthenticated: true 
        }));
        
        // Save interests if provided
        if (userData.interests) {
          localStorage.setItem('userInterests', JSON.stringify(userData.interests));
          setState(prev => ({ ...prev, userInterests: userData.interests }));
        }
        
        await refreshAll();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setState({
        user: null,
        isAuthenticated: false,
        loading: false,
        events: [],
        nearbyEvents: [],
        recommendedEvents: [],
        userTribes: [],
        userLocation: null,
        userInterests: [],
        isOnline: navigator.onLine,
        notifications: [],
        unreadNotifications: 0,
      });
      
      // Clear local storage
      localStorage.removeItem('userInterests');
      localStorage.removeItem('userLocation');
    }
  }, []);

  const requestLocation = useCallback(async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported');
      return false;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          
          setState(prev => ({ ...prev, userLocation: location }));
          localStorage.setItem('userLocation', JSON.stringify(location));
          
          // Update user location if authenticated
          if (state.isAuthenticated) {
            await apiClient.updateLocation(location);
          }
          
          // Load nearby events
          await loadNearbyEvents();
          
          resolve(true);
        },
        (error) => {
          console.error('Geolocation error:', error);
          resolve(false);
        }
      );
    });
  }, [state.isAuthenticated]);

  const updateLocation = useCallback(async (lat: number, lng: number): Promise<void> => {
    const location = { lat, lng };
    setState(prev => ({ ...prev, userLocation: location }));
    localStorage.setItem('userLocation', JSON.stringify(location));
    
    if (state.isAuthenticated) {
      await apiClient.updateLocation(location);
    }
    
    await loadNearbyEvents();
  }, [state.isAuthenticated]);

  const updateInterests = useCallback(async (interests: string[]): Promise<void> => {
    setState(prev => ({ ...prev, userInterests: interests }));
    localStorage.setItem('userInterests', JSON.stringify(interests));
    
    if (state.isAuthenticated) {
      await apiClient.updateInterests(interests);
    }
    
    await loadRecommendedEvents();
  }, [state.isAuthenticated]);

  const loadEvents = useCallback(async (params?: any): Promise<void> => {
    try {
      const response = await apiClient.getEvents(params);
      
      if (response.success && response.data) {
        setState(prev => ({ ...prev, events: response.data.events }));
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  }, []);

  const loadNearbyEvents = useCallback(async (): Promise<void> => {
    if (!state.userLocation) return;

    try {
      const response = await apiClient.getNearbyEvents(
        state.userLocation.lat, 
        state.userLocation.lng, 
        20 // 20km radius
      );
      
      if (response.success && response.data) {
        setState(prev => ({ ...prev, nearbyEvents: response.data }));
      }
    } catch (error) {
      console.error('Error loading nearby events:', error);
    }
  }, [state.userLocation]);

  const loadRecommendedEvents = useCallback(async (): Promise<void> => {
    if (!state.isAuthenticated) return;

    try {
      const response = await apiClient.getRecommendedEvents();
      
      if (response.success && response.data) {
        setState(prev => ({ ...prev, recommendedEvents: response.data }));
      }
    } catch (error) {
      console.error('Error loading recommended events:', error);
    }
  }, [state.isAuthenticated]);

  const attendEvent = useCallback(async (eventId: string): Promise<boolean> => {
    try {
      const response = await apiClient.attendEvent(eventId);
      
      if (response.success) {
        // Refresh events to update attendance
        await Promise.all([
          loadEvents(),
          loadNearbyEvents(),
          loadRecommendedEvents(),
        ]);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error attending event:', error);
      return false;
    }
  }, []);

  const unattendEvent = useCallback(async (eventId: string): Promise<boolean> => {
    try {
      const response = await apiClient.unattendEvent(eventId);
      
      if (response.success) {
        // Refresh events to update attendance
        await Promise.all([
          loadEvents(),
          loadNearbyEvents(),
          loadRecommendedEvents(),
        ]);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error unattending event:', error);
      return false;
    }
  }, []);

  const loadUserTribes = useCallback(async (): Promise<void> => {
    if (!state.isAuthenticated) return;

    try {
      const response = await apiClient.getUserTribes();
      
      if (response.success && response.data) {
        setState(prev => ({ ...prev, userTribes: response.data }));
      }
    } catch (error) {
      console.error('Error loading user tribes:', error);
    }
  }, [state.isAuthenticated]);

  const joinTribe = useCallback(async (tribeId: string): Promise<boolean> => {
    try {
      const response = await apiClient.joinTribe(tribeId);
      
      if (response.success) {
        await loadUserTribes();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error joining tribe:', error);
      return false;
    }
  }, []);

  const leaveTribe = useCallback(async (tribeId: string): Promise<boolean> => {
    try {
      const response = await apiClient.leaveTribe(tribeId);
      
      if (response.success) {
        await loadUserTribes();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error leaving tribe:', error);
      return false;
    }
  }, []);

  const search = useCallback(async (query: string, filters?: any): Promise<any> => {
    try {
      const response = await apiClient.search(query, filters);
      return response.data;
    } catch (error) {
      console.error('Error searching:', error);
      return null;
    }
  }, []);

  const loadNotifications = useCallback(async (): Promise<void> => {
    if (!state.isAuthenticated) return;

    try {
      const response = await apiClient.getNotifications();
      
      if (response.success && response.data) {
        const notifications = response.data;
        const unread = notifications.filter((n: any) => !n.isRead).length;
        
        setState(prev => ({ 
          ...prev, 
          notifications, 
          unreadNotifications: unread 
        }));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, [state.isAuthenticated]);

  const markNotificationAsRead = useCallback(async (notificationId: string): Promise<void> => {
    try {
      await apiClient.markNotificationAsRead(notificationId);
      await loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllNotificationsAsRead = useCallback(async (): Promise<void> => {
    try {
      await apiClient.markAllNotificationsAsRead();
      await loadNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);

  const checkBackendStatus = useCallback(async (): Promise<boolean> => {
    try {
      return await apiClient.healthCheck();
    } catch (error) {
      return false;
    }
  }, []);

  const refreshAll = useCallback(async (): Promise<void> => {
    if (state.isAuthenticated) {
      await Promise.all([
        loadEvents(),
        loadUserTribes(),
        loadNotifications(),
      ]);

      if (state.userLocation) {
        await loadNearbyEvents();
      }

      if (state.userInterests.length > 0) {
        await loadRecommendedEvents();
      }
    } else {
      await loadEvents({ status: 'published', visibility: 'public' });
    }
  }, [state.isAuthenticated, state.userLocation, state.userInterests]);

  return {
    ...state,
    login,
    register,
    logout,
    requestLocation,
    updateLocation,
    updateInterests,
    loadEvents,
    loadNearbyEvents,
    loadRecommendedEvents,
    attendEvent,
    unattendEvent,
    loadUserTribes,
    joinTribe,
    leaveTribe,
    search,
    loadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    checkBackendStatus,
    refreshAll,
  };
};
