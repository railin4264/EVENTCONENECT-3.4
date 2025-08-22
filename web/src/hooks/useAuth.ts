'use client';

import { useState, useEffect, createContext, useContext } from 'react';

// ===== INTERFACES =====
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  interests?: string[];
  location?: {
    city: string;
    country: string;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

// ===== MOCK DATA PARA DEMO =====
const mockUser: User = {
  id: '1',
  firstName: 'Carlos',
  lastName: 'Rodríguez',
  email: 'carlos@example.com',
  avatar: '/avatars/user.jpg',
  interests: ['Tecnología', 'Música', 'Gastronomía'],
  location: {
    city: 'Madrid',
    country: 'España'
  }
};

// ===== HOOK PRINCIPAL =====
export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga inicial
    const timer = setTimeout(() => {
      // Para demo, consideramos usuario autenticado si hay data en localStorage
      const savedAuth = localStorage.getItem('eventconnect_auth');
      if (savedAuth) {
        setUser(mockUser);
      }
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    // Simular login API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    localStorage.setItem('eventconnect_auth', JSON.stringify(mockUser));
    setUser(mockUser);
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('eventconnect_auth');
    setUser(null);
  };

  return {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading
  };
};