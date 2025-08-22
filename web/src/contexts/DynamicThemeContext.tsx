'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ThemeConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  particles: {
    theme: 'default' | 'energy' | 'cosmic' | 'nature' | 'tech';
    intensity: number;
    count: number;
  };
  animations: {
    speed: number;
    intensity: number;
  };
  mood: string;
}

interface DynamicThemeContextType {
  currentTheme: ThemeConfig;
  setEventType: (type: string) => void;
  setUserMood: (mood: string) => void;
  setLocation: (location: string) => void;
  getThemeForEvent: (eventType: string) => ThemeConfig;
}

const DynamicThemeContext = createContext<DynamicThemeContextType | undefined>(undefined);

const themes: Record<string, ThemeConfig> = {
  // Temas por hora del día
  morning: {
    name: 'Mañana Fresca',
    colors: {
      primary: '#06b6d4',
      secondary: '#10b981',
      accent: '#fbbf24',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      surface: 'rgba(255, 255, 255, 0.9)',
      text: '#0f172a',
      textSecondary: '#475569'
    },
    particles: { theme: 'nature', intensity: 0.8, count: 800 },
    animations: { speed: 1.2, intensity: 0.8 },
    mood: 'energético'
  },
  afternoon: {
    name: 'Tarde Vibrante',
    colors: {
      primary: '#f97316',
      secondary: '#fbbf24',
      accent: '#ef4444',
      background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
      surface: 'rgba(255, 255, 255, 0.95)',
      text: '#1e293b',
      textSecondary: '#64748b'
    },
    particles: { theme: 'energy', intensity: 1.2, count: 1000 },
    animations: { speed: 1.5, intensity: 1.0 },
    mood: 'activo'
  },
  evening: {
    name: 'Atardecer Mágico',
    colors: {
      primary: '#8b5cf6',
      secondary: '#ec4899',
      accent: '#f97316',
      background: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)',
      surface: 'rgba(255, 255, 255, 0.9)',
      text: '#1e293b',
      textSecondary: '#64748b'
    },
    particles: { theme: 'cosmic', intensity: 1.0, count: 900 },
    animations: { speed: 1.3, intensity: 0.9 },
    mood: 'romántico'
  },
  night: {
    name: 'Noche Profunda',
    colors: {
      primary: '#1e40af',
      secondary: '#3730a3',
      accent: '#06b6d4',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      surface: 'rgba(30, 41, 59, 0.95)',
      text: '#f8fafc',
      textSecondary: '#cbd5e1'
    },
    particles: { theme: 'cosmic', intensity: 0.6, count: 600 },
    animations: { speed: 0.8, intensity: 0.6 },
    mood: 'tranquilo'
  },
  
  // Temas por tipo de evento
  music: {
    name: 'Ritmo Musical',
    colors: {
      primary: '#ec4899',
      secondary: '#8b5cf6',
      accent: '#fbbf24',
      background: 'linear-gradient(135deg, #fdf2f8 0%, #f3e8ff 100%)',
      surface: 'rgba(255, 255, 255, 0.9)',
      text: '#1e293b',
      textSecondary: '#64748b'
    },
    particles: { theme: 'energy', intensity: 1.5, count: 1200 },
    animations: { speed: 2.0, intensity: 1.2 },
    mood: 'festivo'
  },
  tech: {
    name: 'Innovación Tech',
    colors: {
      primary: '#06b6d4',
      secondary: '#3b82f6',
      accent: '#10b981',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #f0fdf4 100%)',
      surface: 'rgba(255, 255, 255, 0.95)',
      text: '#0f172a',
      textSecondary: '#475569'
    },
    particles: { theme: 'tech', intensity: 1.0, count: 1000 },
    animations: { speed: 1.8, intensity: 1.0 },
    mood: 'futurista'
  },
  art: {
    name: 'Expresión Artística',
    colors: {
      primary: '#8b5cf6',
      secondary: '#ec4899',
      accent: '#fbbf24',
      background: 'linear-gradient(135deg, #fdf4ff 0%, #fff7ed 100%)',
      surface: 'rgba(255, 255, 255, 0.9)',
      text: '#1e293b',
      textSecondary: '#64748b'
    },
    particles: { theme: 'cosmic', intensity: 0.8, count: 800 },
    animations: { speed: 1.1, intensity: 0.8 },
    mood: 'creativo'
  },
  nature: {
    name: 'Conecta con la Naturaleza',
    colors: {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#fbbf24',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
      surface: 'rgba(255, 255, 255, 0.9)',
      text: '#064e3b',
      textSecondary: '#065f46'
    },
    particles: { theme: 'nature', intensity: 0.6, count: 600 },
    animations: { speed: 0.9, intensity: 0.6 },
    mood: 'sereno'
  },
  sports: {
    name: 'Energía Deportiva',
    colors: {
      primary: '#f97316',
      secondary: '#ef4444',
      accent: '#fbbf24',
      background: 'linear-gradient(135deg, #fff7ed 0%, #fef2f2 100%)',
      surface: 'rgba(255, 255, 255, 0.95)',
      text: '#7c2d12',
      textSecondary: '#9a3412'
    },
    particles: { theme: 'energy', intensity: 1.3, count: 1100 },
    animations: { speed: 1.6, intensity: 1.1 },
    mood: 'competitivo'
  },
  romantic: {
    name: 'Romance y Amor',
    colors: {
      primary: '#ec4899',
      secondary: '#f97316',
      accent: '#fbbf24',
      background: 'linear-gradient(135deg, #fdf2f8 0%, #fff7ed 100%)',
      surface: 'rgba(255, 255, 255, 0.9)',
      text: '#831843',
      textSecondary: '#9d174d'
    },
    particles: { theme: 'cosmic', intensity: 0.7, count: 700 },
    animations: { speed: 1.0, intensity: 0.7 },
    mood: 'romántico'
  }
};

export const DynamicThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(themes.morning);
  const [eventType, setEventTypeState] = useState<string>('');
  const [userMood, setUserMoodState] = useState<string>('');
  const [location, setLocationState] = useState<string>('');

  // Determinar tema por hora del día
  const getTimeBasedTheme = (): string => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  };

  // Determinar tema por estación
  const getSeasonBasedTheme = (): string => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  };

  // Actualizar tema automáticamente
  useEffect(() => {
    const updateTheme = () => {
      let baseTheme = getTimeBasedTheme();
      
      // Priorizar tipo de evento si está establecido
      if (eventType && themes[eventType]) {
        baseTheme = eventType;
      }
      
      // Ajustar según el estado de ánimo del usuario
      if (userMood) {
        // Lógica para ajustar tema según el mood
        if (userMood === 'happy' && baseTheme === 'night') {
          baseTheme = 'evening'; // Hacer la noche más vibrante
        }
      }
      
      setCurrentTheme(themes[baseTheme] || themes.morning);
    };

    updateTheme();
    
    // Actualizar cada hora
    const interval = setInterval(updateTheme, 3600000);
    
    return () => clearInterval(interval);
  }, [eventType, userMood, location]);

  const setEventType = (type: string) => {
    setEventTypeState(type);
  };

  const setUserMood = (mood: string) => {
    setUserMoodState(mood);
  };

  const setLocation = (loc: string) => {
    setLocationState(loc);
  };

  const getThemeForEvent = (eventType: string): ThemeConfig => {
    return themes[eventType] || themes.morning;
  };

  return (
    <DynamicThemeContext.Provider
      value={{
        currentTheme,
        setEventType,
        setUserMood,
        setLocation,
        getThemeForEvent
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTheme.name}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            '--primary-color': currentTheme.colors.primary,
            '--secondary-color': currentTheme.colors.secondary,
            '--accent-color': currentTheme.colors.accent,
            '--background': currentTheme.colors.background,
            '--surface-color': currentTheme.colors.surface,
            '--text-color': currentTheme.colors.text,
            '--text-secondary': currentTheme.colors.textSecondary,
          } as React.CSSProperties}
          className="min-h-screen transition-all duration-500"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </DynamicThemeContext.Provider>
  );
};

export const useDynamicTheme = (): DynamicThemeContextType => {
  const context = useContext(DynamicThemeContext);
  if (context === undefined) {
    throw new Error('useDynamicTheme must be used within a DynamicThemeProvider');
  }
  return context;
};