import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Dimensions, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from 'react-native';

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
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  particles: {
    theme: 'default' | 'energy' | 'cosmic' | 'nature' | 'tech';
    intensity: number;
    count: number;
  };
  animations: {
    speed: number;
    intensity: number;
    hapticFeedback: boolean;
  };
  mood: string;
  gradients: {
    primary: string[];
    secondary: string[];
    background: string[];
  };
}

interface DynamicThemeContextType {
  currentTheme: ThemeConfig;
  setEventType: (type: string) => void;
  setUserMood: (mood: string) => void;
  setLocation: (location: string) => void;
  getThemeForEvent: (eventType: string) => ThemeConfig;
  isDarkMode: boolean;
  toggleTheme: () => void;
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
      background: '#f0f9ff',
      surface: '#ffffff',
      text: '#0f172a',
      textSecondary: '#475569',
      border: '#e2e8f0',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    particles: { theme: 'nature', intensity: 0.8, count: 800 },
    animations: { speed: 1.2, intensity: 0.8, hapticFeedback: true },
    mood: 'energético',
    gradients: {
      primary: ['#06b6d4', '#0ea5e9'],
      secondary: ['#10b981', '#059669'],
      background: ['#f0f9ff', '#e0f2fe']
    }
  },
  afternoon: {
    name: 'Tarde Vibrante',
    colors: {
      primary: '#f97316',
      secondary: '#fbbf24',
      accent: '#ef4444',
      background: '#fff7ed',
      surface: '#ffffff',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#fed7aa',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    particles: { theme: 'energy', intensity: 1.2, count: 1000 },
    animations: { speed: 1.5, intensity: 1.0, hapticFeedback: true },
    mood: 'activo',
    gradients: {
      primary: ['#f97316', '#ea580c'],
      secondary: ['#fbbf24', '#f59e0b'],
      background: ['#fff7ed', '#ffedd5']
    }
  },
  evening: {
    name: 'Atardecer Mágico',
    colors: {
      primary: '#8b5cf6',
      secondary: '#ec4899',
      accent: '#f97316',
      background: '#fdf4ff',
      surface: '#ffffff',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#f3e8ff',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    particles: { theme: 'cosmic', intensity: 1.0, count: 900 },
    animations: { speed: 1.3, intensity: 0.9, hapticFeedback: true },
    mood: 'romántico',
    gradients: {
      primary: ['#8b5cf6', '#7c3aed'],
      secondary: ['#ec4899', '#db2777'],
      background: ['#fdf4ff', '#fae8ff']
    }
  },
  night: {
    name: 'Noche Profunda',
    colors: {
      primary: '#1e40af',
      secondary: '#3730a3',
      accent: '#06b6d4',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f8fafc',
      textSecondary: '#cbd5e1',
      border: '#334155',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    particles: { theme: 'cosmic', intensity: 0.6, count: 600 },
    animations: { speed: 0.8, intensity: 0.6, hapticFeedback: false },
    mood: 'tranquilo',
    gradients: {
      primary: ['#1e40af', '#1e3a8a'],
      secondary: ['#3730a3', '#312e81'],
      background: ['#0f172a', '#020617']
    }
  },
  
  // Temas por tipo de evento
  music: {
    name: 'Ritmo Musical',
    colors: {
      primary: '#ec4899',
      secondary: '#8b5cf6',
      accent: '#fbbf24',
      background: '#fdf2f8',
      surface: '#ffffff',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#fce7f3',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    particles: { theme: 'energy', intensity: 1.5, count: 1200 },
    animations: { speed: 2.0, intensity: 1.2, hapticFeedback: true },
    mood: 'festivo',
    gradients: {
      primary: ['#ec4899', '#db2777'],
      secondary: ['#8b5cf6', '#7c3aed'],
      background: ['#fdf2f8', '#f3e8ff']
    }
  },
  tech: {
    name: 'Innovación Tech',
    colors: {
      primary: '#06b6d4',
      secondary: '#3b82f6',
      accent: '#10b981',
      background: '#f0f9ff',
      surface: '#ffffff',
      text: '#0f172a',
      textSecondary: '#475569',
      border: '#e0f2fe',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    particles: { theme: 'tech', intensity: 1.0, count: 1000 },
    animations: { speed: 1.8, intensity: 1.0, hapticFeedback: true },
    mood: 'futurista',
    gradients: {
      primary: ['#06b6d4', '#0ea5e9'],
      secondary: ['#3b82f6', '#2563eb'],
      background: ['#f0f9ff', '#f0fdf4']
    }
  },
  art: {
    name: 'Expresión Artística',
    colors: {
      primary: '#8b5cf6',
      secondary: '#ec4899',
      accent: '#fbbf24',
      background: '#fdf4ff',
      surface: '#ffffff',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#f3e8ff',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    particles: { theme: 'cosmic', intensity: 0.8, count: 800 },
    animations: { speed: 1.1, intensity: 0.8, hapticFeedback: true },
    mood: 'creativo',
    gradients: {
      primary: ['#8b5cf6', '#7c3aed'],
      secondary: ['#ec4899', '#db2777'],
      background: ['#fdf4ff', '#fff7ed']
    }
  },
  nature: {
    name: 'Conecta con la Naturaleza',
    colors: {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#fbbf24',
      background: '#f0fdf4',
      surface: '#ffffff',
      text: '#064e3b',
      textSecondary: '#065f46',
      border: '#dcfce7',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    particles: { theme: 'nature', intensity: 0.6, count: 600 },
    animations: { speed: 0.9, intensity: 0.6, hapticFeedback: false },
    mood: 'sereno',
    gradients: {
      primary: ['#10b981', '#059669'],
      secondary: ['#059669', '#047857'],
      background: ['#f0fdf4', '#ecfdf5']
    }
  },
  sports: {
    name: 'Energía Deportiva',
    colors: {
      primary: '#f97316',
      secondary: '#ef4444',
      accent: '#fbbf24',
      background: '#fff7ed',
      surface: '#ffffff',
      text: '#7c2d12',
      textSecondary: '#9a3412',
      border: '#fed7aa',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    particles: { theme: 'energy', intensity: 1.3, count: 1100 },
    animations: { speed: 1.6, intensity: 1.1, hapticFeedback: true },
    mood: 'competitivo',
    gradients: {
      primary: ['#f97316', '#ea580c'],
      secondary: ['#ef4444', '#dc2626'],
      background: ['#fff7ed', '#fef2f2']
    }
  },
  romantic: {
    name: 'Romance y Amor',
    colors: {
      primary: '#ec4899',
      secondary: '#f97316',
      accent: '#fbbf24',
      background: '#fdf2f8',
      surface: '#ffffff',
      text: '#831843',
      textSecondary: '#9d174d',
      border: '#fce7f3',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    particles: { theme: 'cosmic', intensity: 0.7, count: 700 },
    animations: { speed: 1.0, intensity: 0.7, hapticFeedback: true },
    mood: 'romántico',
    gradients: {
      primary: ['#ec4899', '#db2777'],
      secondary: ['#f97316', '#ea580c'],
      background: ['#fdf2f8', '#fff7ed']
    }
  }
};

export const DynamicThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(themes.morning);
  const [eventType, setEventTypeState] = useState<string>('');
  const [userMood, setUserMoodState] = useState<string>('');
  const [location, setLocationState] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const colorScheme = useColorScheme();
  const { width, height } = Dimensions.get('window');

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
        if (userMood === 'happy' && baseTheme === 'night') {
          baseTheme = 'evening';
        }
      }
      
      // Ajustar según el esquema de color del sistema
      if (colorScheme === 'dark' && !eventType) {
        baseTheme = 'night';
      }
      
      const newTheme = themes[baseTheme] || themes.morning;
      setCurrentTheme(newTheme);
      setIsDarkMode(baseTheme === 'night' || colorScheme === 'dark');
      
      // Feedback háptico al cambiar tema
      if (newTheme.animations.hapticFeedback && Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    };

    updateTheme();
    
    // Actualizar cada hora
    const interval = setInterval(updateTheme, 3600000);
    
    return () => clearInterval(interval);
  }, [eventType, userMood, location, colorScheme]);

  // Ajustar tema según orientación y tamaño de pantalla
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      const { width: newWidth, height: newHeight } = window;
      
      // Ajustar intensidad de partículas según tamaño de pantalla
      if (newWidth < 375) { // iPhone SE
        setCurrentTheme(prev => ({
          ...prev,
          particles: { ...prev.particles, count: Math.floor(prev.particles.count * 0.6) }
        }));
      } else if (newWidth < 768) { // Tablets
        setCurrentTheme(prev => ({
          ...prev,
          particles: { ...prev.particles, count: Math.floor(prev.particles.count * 0.8) }
        }));
      }
    });

    return () => subscription?.remove();
  }, []);

  const setEventType = (type: string) => {
    setEventTypeState(type);
    
    // Feedback háptico
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const setUserMood = (mood: string) => {
    setUserMoodState(mood);
    
    // Feedback háptico
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const setLocation = (loc: string) => {
    setLocationState(loc);
  };

  const getThemeForEvent = (eventType: string): ThemeConfig => {
    return themes[eventType] || themes.morning;
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const contextValue: DynamicThemeContextType = {
    currentTheme,
    setEventType,
    setUserMood,
    setLocation,
    getThemeForEvent,
    isDarkMode,
    toggleTheme
  };

  return (
    <DynamicThemeContext.Provider value={contextValue}>
      {children}
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