'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useEventConnect } from '@/lib/hooks/useEventConnect';
import { Event, User, Tribe } from '@/lib/api';

// Context type definition
interface EventConnectContextType {
  // State
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

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => Promise<void>;
  requestLocation: () => Promise<boolean>;
  updateLocation: (lat: number, lng: number) => Promise<void>;
  updateInterests: (interests: string[]) => Promise<void>;
  loadEvents: (params?: any) => Promise<void>;
  loadNearbyEvents: () => Promise<void>;
  loadRecommendedEvents: () => Promise<void>;
  attendEvent: (eventId: string) => Promise<boolean>;
  unattendEvent: (eventId: string) => Promise<boolean>;
  loadUserTribes: () => Promise<void>;
  joinTribe: (tribeId: string) => Promise<boolean>;
  leaveTribe: (tribeId: string) => Promise<boolean>;
  search: (query: string, filters?: any) => Promise<any>;
  loadNotifications: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  checkBackendStatus: () => Promise<boolean>;
  refreshAll: () => Promise<void>;
}

// Create context
const EventConnectContext = createContext<EventConnectContextType | undefined>(undefined);

// Provider component
interface EventConnectProviderProps {
  children: ReactNode;
}

export const EventConnectProvider: React.FC<EventConnectProviderProps> = ({ children }) => {
  const eventConnect = useEventConnect();

  return (
    <EventConnectContext.Provider value={eventConnect}>
      {children}
    </EventConnectContext.Provider>
  );
};

// Custom hook to use the context
export const useEventConnectContext = (): EventConnectContextType => {
  const context = useContext(EventConnectContext);
  
  if (context === undefined) {
    throw new Error('useEventConnectContext must be used within an EventConnectProvider');
  }
  
  return context;
};

// Higher-order component for components that require authentication
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  const AuthenticatedComponent: React.FC<P> = (props) => {
    const { isAuthenticated, loading } = useEventConnectContext();

    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-white text-lg">Verificando autenticación...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // Redirect to login or show login form
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center space-y-6 max-w-md mx-auto p-6">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Acceso requerido</h2>
            <p className="text-gray-300">
              Necesitas iniciar sesión para acceder a esta página
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/auth/login'}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300"
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => window.location.href = '/auth/register'}
                className="w-full border border-cyan-400 text-cyan-400 font-semibold py-3 px-6 rounded-xl hover:bg-cyan-400 hover:text-white transition-all duration-300"
              >
                Crear cuenta
              </button>
            </div>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };

  AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
  return AuthenticatedComponent;
};

// Component for network status indication
export const NetworkStatus: React.FC = () => {
  const { isOnline } = useEventConnectContext();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 z-50">
      <div className="flex items-center justify-center space-x-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <span className="text-sm font-medium">
          Sin conexión - Trabajando en modo offline
        </span>
      </div>
    </div>
  );
};

// Component for loading state
export const GlobalLoader: React.FC = () => {
  const { loading } = useEventConnectContext();

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 border border-white border-opacity-20">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white font-medium">Cargando...</p>
        </div>
      </div>
    </div>
  );
};
