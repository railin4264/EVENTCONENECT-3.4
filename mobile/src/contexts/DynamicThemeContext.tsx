import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Dimensions,
  Platform,
  useColorScheme
} from 'react-native';
import * as Haptics from 'expo-haptics';

interface ThemeConfig {
  name: string;
  mood: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    surface: string;
  };
  gradients: {
    primary: string[];
    secondary: string[];
    background: string[];
    surface: string[];
  };
  particles: {
    count: number;
    speed: number;
    size: number;
    opacity: number;
  };
  animations: {
    duration: number;
    easing: string;
    hapticFeedback: boolean;
  };
}

const themes: Record<string, ThemeConfig> = {
  morning: {
    name: 'Mañana',
    mood: 'Energizado',
    colors: {
      primary: '#fbbf24',
      secondary: '#f59e0b',
      accent: '#f97316',
      background: '#fef3c7',
      text: '#92400e',
      surface: '#fde68a',
    },
    gradients: {
      primary: ['#fbbf24', '#f59e0b'],
      secondary: ['#f97316', '#ea580c'],
      background: ['#fef3c7', '#fde68a'],
      surface: ['#fde68a', '#fcd34d'],
    },
    particles: {
      count: 30,
      speed: 1.5,
      size: 4,
      opacity: 0.8,
    },
    animations: {
      duration: 800,
      easing: 'ease-out',
      hapticFeedback: true,
    },
  },
  afternoon: {
    name: 'Tarde',
    mood: 'Activo',
    colors: {
      primary: '#f59e0b',
      secondary: '#d97706',
      accent: '#ea580c',
      background: '#fef3c7',
      text: '#92400e',
      surface: '#fde68a',
    },
    gradients: {
      primary: ['#f59e0b', '#d97706'],
      secondary: ['#ea580c', '#dc2626'],
      background: ['#fef3c7', '#fde68a'],
      surface: ['#fde68a', '#fcd34d'],
    },
    particles: {
      count: 40,
      speed: 2.0,
      size: 5,
      opacity: 0.9,
    },
    animations: {
      duration: 600,
      easing: 'ease-in-out',
      hapticFeedback: true,
    },
  },
  evening: {
    name: 'Tarde',
    mood: 'Relajado',
    colors: {
      primary: '#ec4899',
      secondary: '#db2777',
      accent: '#be185d',
      background: '#fdf2f8',
      text: '#831843',
      surface: '#fce7f3',
    },
    gradients: {
      primary: ['#ec4899', '#db2777'],
      secondary: ['#be185d', '#9d174d'],
      background: ['#fdf2f8', '#fce7f3'],
      surface: ['#fce7f3', '#fbcfe8'],
    },
    particles: {
      count: 25,
      speed: 1.0,
      size: 3,
      opacity: 0.7,
    },
    animations: {
      duration: 1000,
      easing: 'ease-in',
      hapticFeedback: false,
    },
  },
  night: {
    name: 'Noche',
    mood: 'Tranquilo',
    colors: {
      primary: '#6366f1',
      secondary: '#4f46e5',
      accent: '#3730a3',
      background: '#1e1b4b',
      text: '#e0e7ff',
      surface: '#312e81',
    },
    gradients: {
      primary: ['#6366f1', '#4f46e5'],
      secondary: ['#3730a3', '#1e1b4b'],
      background: ['#1e1b4b', '#0f0f23'],
      surface: ['#312e81', '#1e1b4b'],
    },
    particles: {
      count: 20,
      speed: 0.8,
      size: 2,
      opacity: 0.6,
    },
    animations: {
      duration: 1200,
      easing: 'ease',
      hapticFeedback: false,
    },
  },
  music: {
    name: 'Música',
    mood: 'Rítmico',
    colors: {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      accent: '#6d28d9',
      background: '#f3f4f6',
      text: '#1f2937',
      surface: '#e5e7eb',
    },
    gradients: {
      primary: ['#8b5cf6', '#7c3aed'],
      secondary: ['#6d28d9', '#5b21b6'],
      background: ['#f3f4f6', '#e5e7eb'],
      surface: ['#e5e7eb', '#d1d5db'],
    },
    particles: {
      count: 50,
      speed: 2.5,
      size: 6,
      opacity: 0.9,
    },
    animations: {
      duration: 500,
      easing: 'ease-out',
      hapticFeedback: true,
    },
  },
  tech: {
    name: 'Tecnología',
    mood: 'Innovador',
    colors: {
      primary: '#06b6d4',
      secondary: '#0891b2',
      accent: '#0e7490',
      background: '#f0fdfa',
      text: '#164e63',
      surface: '#ccfbf1',
    },
    gradients: {
      primary: ['#06b6d4', '#0891b2'],
      secondary: ['#0e7490', '#155e75'],
      background: ['#f0fdfa', '#ccfbf1'],
      surface: ['#ccfbf1', '#99f6e4'],
    },
    particles: {
      count: 60,
      speed: 3.0,
      size: 3,
      opacity: 0.8,
    },
    animations: {
      duration: 400,
      easing: 'ease-in-out',
      hapticFeedback: true,
    },
  },
  art: {
    name: 'Arte',
    mood: 'Creativo',
    colors: {
      primary: '#ec4899',
      secondary: '#db2777',
      accent: '#be185d',
      background: '#fdf2f8',
      text: '#831843',
      surface: '#fce7f3',
    },
    gradients: {
      primary: ['#ec4899', '#db2777'],
      secondary: ['#be185d', '#9d174d'],
      background: ['#fdf2f8', '#fce7f3'],
      surface: ['#fce7f3', '#fbcfe8'],
    },
    particles: {
      count: 35,
      speed: 1.8,
      size: 5,
      opacity: 0.9,
    },
    animations: {
      duration: 700,
      easing: 'ease',
      hapticFeedback: true,
    },
  },
  nature: {
    name: 'Naturaleza',
    mood: 'Orgánico',
    colors: {
      primary: '#22c55e',
      secondary: '#16a34a',
      accent: '#15803d',
      background: '#f0fdf4',
      text: '#14532d',
      surface: '#dcfce7',
    },
    gradients: {
      primary: ['#22c55e', '#16a34a'],
      secondary: ['#15803d', '#166534'],
      background: ['#f0fdf4', '#dcfce7'],
      surface: ['#dcfce7', '#bbf7d0'],
    },
    particles: {
      count: 30,
      speed: 1.2,
      size: 4,
      opacity: 0.7,
    },
    animations: {
      duration: 900,
      easing: 'ease-in-out',
      hapticFeedback: false,
    },
  },
  sports: {
    name: 'Deportes',
    mood: 'Energético',
    colors: {
      primary: '#ef4444',
      secondary: '#dc2626',
      accent: '#b91c1c',
      background: '#fef2f2',
      text: '#7f1d1d',
      surface: '#fee2e2',
    },
    gradients: {
      primary: ['#ef4444', '#dc2626'],
      secondary: ['#b91c1c', '#991b1b'],
      background: ['#fef2f2', '#fee2e2'],
      surface: ['#fee2e2', '#fecaca'],
    },
    particles: {
      count: 45,
      speed: 2.2,
      size: 5,
      opacity: 0.9,
    },
    animations: {
      duration: 600,
      easing: 'ease-out',
      hapticFeedback: true,
    },
  },
  romantic: {
    name: 'Romántico',
    mood: 'Apasionado',
    colors: {
      primary: '#f472b6',
      secondary: '#ec4899',
      accent: '#db2777',
      background: '#fdf2f8',
      text: '#831843',
      surface: '#fce7f3',
    },
    gradients: {
      primary: ['#f472b6', '#ec4899'],
      secondary: ['#db2777', '#be185d'],
      background: ['#fdf2f8', '#fce7f3'],
      surface: ['#fce7f3', '#fbcfe8'],
    },
    particles: {
      count: 25,
      speed: 1.5,
      size: 4,
      opacity: 0.8,
    },
    animations: {
      duration: 800,
      easing: 'ease',
      hapticFeedback: true,
    },
  },
};

interface DynamicThemeContextType {
  currentTheme: ThemeConfig;
  setEventType: (eventType: string) => void;
  setUserMood: (mood: string) => void;
  setLocation: (location: string) => void;
  getThemeForEvent: (eventType: string) => ThemeConfig;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const DynamicThemeContext = createContext<DynamicThemeContextType | undefined>(undefined);

export const useDynamicTheme = () => {
  const context = useContext(DynamicThemeContext);
  if (!context) {
    throw new Error('useDynamicTheme must be used within DynamicThemeProvider');
  }
  return context;
};

export const DynamicThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme();
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(() => {
    const morningTheme = themes['morning'];
    if (!morningTheme) {
      throw new Error('Morning theme not found');
    }
    return morningTheme;
  });

  // Función para obtener el tema basado en la hora del día
  const getTimeBasedTheme = useCallback((): string => {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }, []);

  // Función para obtener el tema basado en la estación del año
  const getSeasonBasedTheme = useCallback((): string => {
    const month = new Date().getMonth();
    
    if (month >= 2 && month <= 4) return 'nature'; // Primavera
    if (month >= 5 && month <= 7) return 'nature'; // Verano
    if (month >= 8 && month <= 10) return 'nature'; // Otoño
    return 'night'; // Invierno
  }, []);

  // Función para actualizar el tema
  const updateTheme = useCallback((baseTheme: string) => {
    const newTheme = themes[baseTheme];
    if (newTheme) {
      setCurrentTheme(newTheme);
      
      // Feedback háptico si está habilitado
      if (newTheme.animations.hapticFeedback && Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  }, []);

  // Actualizar tema automáticamente basado en la hora
  useEffect(() => {
    const updateTimeBasedTheme = () => {
      const timeTheme = getTimeBasedTheme();
      const seasonTheme = getSeasonBasedTheme();
      
      // Combinar tema de tiempo con estación
      let baseTheme = timeTheme;
      if (timeTheme === 'night' && seasonTheme === 'nature') {
        baseTheme = 'night';
      }
      
      updateTheme(baseTheme);
    };

    // Actualizar inmediatamente
    updateTimeBasedTheme();

    // Actualizar cada hora
    const interval = setInterval(updateTimeBasedTheme, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [getTimeBasedTheme, getSeasonBasedTheme, updateTheme]);

  // Manejar cambios de orientación de pantalla
  useEffect(() => {
    const handleOrientationChange = () => {
      // Ajustar tema basado en la orientación
      updateTheme(currentTheme.name.toLowerCase());
    };

    Dimensions.addEventListener('change', handleOrientationChange);
    return () => {
      // Cleanup
    };
  }, [currentTheme.name, updateTheme]);

  // Función para establecer el tipo de evento
  const setEventType = useCallback((newEventType: string) => {
    // Cambiar tema basado en el tipo de evento
    if (themes[newEventType]) {
      updateTheme(newEventType);
    }
  }, [updateTheme]);

  // Función para establecer el estado de ánimo del usuario
  const setUserMood = useCallback((newMood: string) => {
    // Ajustar tema basado en el estado de ánimo
    let moodTheme = currentTheme.name.toLowerCase();
    
    if (newMood === 'happy' || newMood === 'excited') {
      moodTheme = 'music';
    } else if (newMood === 'calm' || newMood === 'relaxed') {
      moodTheme = 'nature';
    } else if (newMood === 'creative') {
      moodTheme = 'art';
    }
    
    if (themes[moodTheme]) {
      updateTheme(moodTheme);
    }
  }, [currentTheme.name, updateTheme]);

  // Función para establecer la ubicación
  const setLocation = useCallback((newLocation: string) => {
    // Ajustar tema basado en la ubicación
    let locationTheme = currentTheme.name.toLowerCase();
    
    if (newLocation.includes('beach') || newLocation.includes('ocean')) {
      locationTheme = 'nature';
    } else if (newLocation.includes('city') || newLocation.includes('urban')) {
      locationTheme = 'tech';
    } else if (newLocation.includes('mountain') || newLocation.includes('forest')) {
      locationTheme = 'nature';
    }
    
    if (themes[locationTheme]) {
      updateTheme(locationTheme);
    }
  }, [currentTheme.name, updateTheme]);

  // Función para obtener tema para un evento específico
  const getThemeForEvent = useCallback((eventType: string): ThemeConfig => {
    const theme = themes[eventType];
    if (!theme) {
      const morningTheme = themes['morning'];
      if (!morningTheme) {
        throw new Error('Morning theme not found');
      }
      return morningTheme;
    }
    return theme;
  }, []);

  // Función para alternar entre modo claro y oscuro
  const toggleTheme = useCallback(() => {
    const isCurrentlyDark = currentTheme.name.toLowerCase() === 'night';
    const newTheme = isCurrentlyDark ? 'morning' : 'night';
    updateTheme(newTheme);
  }, [currentTheme.name, updateTheme]);

  // Verificar si está en modo oscuro
  const isDarkMode = colorScheme === 'dark' || currentTheme.name.toLowerCase() === 'night';

  const value: DynamicThemeContextType = {
    currentTheme,
    setEventType,
    setUserMood,
    setLocation,
    getThemeForEvent,
    isDarkMode,
    toggleTheme,
  };

  return (
    <DynamicThemeContext.Provider value={value}>
      {children}
    </DynamicThemeContext.Provider>
  );
};

export default DynamicThemeProvider;