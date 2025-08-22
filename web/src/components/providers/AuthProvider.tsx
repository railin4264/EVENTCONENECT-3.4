'use client';

import React, { createContext, useContext } from 'react';
import { useAuth as useAuthHook } from '@/hooks/useAuth';

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

// ===== CONTEXTO =====
const AuthContext = createContext<AuthContextType | null>(null);

// ===== PROVIDER =====
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authData = useAuthHook();

  return (
    <AuthContext.Provider value={authData}>
      {children}
    </AuthContext.Provider>
  );
};

// ===== HOOK =====
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};