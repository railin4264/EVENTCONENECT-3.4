import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState('system');
  const [isDark, setIsDark] = useState(true);

  // Cargar tema guardado al iniciar
  useEffect(() => {
    loadStoredTheme();
  }, []);

  // Aplicar tema cuando cambie
  useEffect(() => {
    applyTheme();
  }, [theme, systemColorScheme]);

  const loadStoredTheme = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem('theme');
      if (storedTheme) {
        setTheme(storedTheme);
      }
    } catch (error) {
      console.error('Error cargando tema:', error);
    }
  };

  const applyTheme = () => {
    let shouldBeDark = true;

    switch (theme) {
      case 'light':
        shouldBeDark = false;
        break;
      case 'dark':
        shouldBeDark = true;
        break;
      case 'system':
        shouldBeDark = systemColorScheme === 'dark';
        break;
      default:
        shouldBeDark = true;
    }

    setIsDark(shouldBeDark);
  };

  const changeTheme = async (newTheme) => {
    try {
      setTheme(newTheme);
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Error guardando tema:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = isDark ? 'light' : 'dark';
    await changeTheme(newTheme);
  };

  // Colores del tema
  const colors = {
    // Colores base
    primary: isDark ? '#3b82f6' : '#2563eb',
    primaryLight: isDark ? '#60a5fa' : '#3b82f6',
    primaryDark: isDark ? '#1d4ed8' : '#1e40af',
    
    secondary: isDark ? '#10b981' : '#059669',
    secondaryLight: isDark ? '#34d399' : '#10b981',
    secondaryDark: isDark ? '#047857' : '#047857',
    
    // Colores de fondo
    background: isDark ? '#1a1a1a' : '#ffffff',
    backgroundSecondary: isDark ? '#2a2a2a' : '#f8fafc',
    backgroundTertiary: isDark ? '#3a3a3a' : '#e2e8f0',
    
    // Colores de superficie
    surface: isDark ? '#2a2a2a' : '#ffffff',
    surfaceSecondary: isDark ? '#3a3a3a' : '#f1f5f9',
    surfaceTertiary: isDark ? '#4a4a4a' : '#e2e8f0',
    
    // Colores de texto
    text: isDark ? '#ffffff' : '#1e293b',
    textSecondary: isDark ? '#cccccc' : '#64748b',
    textTertiary: isDark ? '#888888' : '#94a3b8',
    textInverse: isDark ? '#1a1a1a' : '#ffffff',
    
    // Colores de estado
    success: isDark ? '#10b981' : '#059669',
    warning: isDark ? '#f59e0b' : '#d97706',
    error: isDark ? '#ef4444' : '#dc2626',
    info: isDark ? '#3b82f6' : '#2563eb',
    
    // Colores de borde
    border: isDark ? '#3a3a3a' : '#e2e8f0',
    borderLight: isDark ? '#4a4a4a' : '#f1f5f9',
    borderDark: isDark ? '#2a2a2a' : '#cbd5e1',
    
    // Colores de sombra
    shadow: isDark ? '#000000' : '#000000',
    shadowLight: isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.05)',
    
    // Colores de overlay
    overlay: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)',
    overlayLight: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)',
    
    // Colores de gradiente
    gradientStart: isDark ? '#1a1a1a' : '#ffffff',
    gradientEnd: isDark ? '#2a2a2a' : '#f8fafc',
    
    // Colores específicos de componentes
    card: isDark ? '#2a2a2a' : '#ffffff',
    cardSecondary: isDark ? '#3a3a3a' : '#f1f5f9',
    
    button: isDark ? '#3b82f6' : '#2563eb',
    buttonSecondary: isDark ? '#4a4a4a' : '#e2e8f0',
    buttonText: isDark ? '#ffffff' : '#ffffff',
    
    input: isDark ? '#2a2a2a' : '#ffffff',
    inputBorder: isDark ? '#3a3a3a' : '#e2e8f0',
    inputFocus: isDark ? '#3b82f6' : '#2563eb',
    
    tabBar: isDark ? '#2a2a2a' : '#ffffff',
    tabBarBorder: isDark ? '#3a3a3a' : '#e2e8f0',
    
    // Colores de eventos
    eventTech: isDark ? '#3b82f6' : '#2563eb',
    eventMusic: isDark ? '#ef4444' : '#dc2626',
    eventFood: isDark ? '#f59e0b' : '#d97706',
    eventBusiness: isDark ? '#10b981' : '#059669',
    eventWellness: isDark ? '#8b5cf6' : '#7c3aed',
    
    // Colores de estado de usuario
    online: isDark ? '#10b981' : '#059669',
    offline: isDark ? '#6b7280' : '#6b7280',
    away: isDark ? '#f59e0b' : '#d97706',
    
    // Colores de notificaciones
    notification: isDark ? '#ef4444' : '#dc2626',
    notificationSuccess: isDark ? '#10b981' : '#059669',
    notificationWarning: isDark ? '#f59e0b' : '#d97706',
    notificationInfo: isDark ? '#3b82f6' : '#2563eb',
  };

  // Espaciado y dimensiones
  const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  };

  // Bordes redondeados
  const borderRadius = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  };

  // Sombras
  const shadows = {
    sm: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
    xl: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 12,
    },
  };

  // Tipografía
  const typography = {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: 40,
      color: colors.text,
    },
    h2: {
      fontSize: 28,
      fontWeight: 'bold',
      lineHeight: 36,
      color: colors.text,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32,
      color: colors.text,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
      color: colors.text,
    },
    h5: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 24,
      color: colors.text,
    },
    h6: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 20,
      color: colors.text,
    },
    body: {
      fontSize: 16,
      fontWeight: 'normal',
      lineHeight: 24,
      color: colors.text,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: 'normal',
      lineHeight: 20,
      color: colors.textSecondary,
    },
    caption: {
      fontSize: 12,
      fontWeight: 'normal',
      lineHeight: 16,
      color: colors.textTertiary,
    },
    button: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 24,
      color: colors.textInverse,
    },
    buttonSmall: {
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 20,
      color: colors.textInverse,
    },
  };

  // Animaciones
  const animations = {
    fast: 200,
    normal: 300,
    slow: 500,
    verySlow: 800,
  };

  // Transiciones
  const transitions = {
    fast: `${animations.fast}ms ease-in-out`,
    normal: `${animations.normal}ms ease-in-out`,
    slow: `${animations.slow}ms ease-in-out`,
  };

  const value = {
    // Estado
    theme,
    isDark,
    systemColorScheme,
    
    // Acciones
    changeTheme,
    toggleTheme,
    
    // Estilos
    colors,
    spacing,
    borderRadius,
    shadows,
    typography,
    animations,
    transitions,
    
    // Utilidades
    isLight: !isDark,
    isSystem: theme === 'system',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};