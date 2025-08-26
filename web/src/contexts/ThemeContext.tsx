'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiService } from '@/services/api';

// ===== THEME TYPES =====
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
}

export interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto';
  primaryColor: 'cyan' | 'purple' | 'blue' | 'green' | 'orange' | 'pink' | 'red';
  accentColor: 'cyan' | 'purple' | 'blue' | 'green' | 'orange' | 'pink' | 'red';
  customColors: ThemeColors;
  animations: boolean;
  reducedMotion: boolean;
  glassEffect: boolean;
  neonEffects: boolean;
  autoSync: boolean;
  appliedPreset?: string;
  updatedAt?: string;
}

export interface PresetTheme {
  id: string;
  name: string;
  description: string;
  preview: string;
  config: ThemeConfig;
}

// ===== THEME CONTEXT INTERFACE =====
interface ThemeContextType {
  theme: ThemeConfig;
  presetThemes: PresetTheme[];
  isLoading: boolean;
  error: string | null;
  
  // Theme management
  updateTheme: (config: Partial<ThemeConfig>) => Promise<void>;
  applyPresetTheme: (themeId: string) => Promise<void>;
  resetToDefault: () => Promise<void>;
  syncTheme: (deviceId: string, platform: string) => Promise<void>;
  
  // Theme utilities
  getThemeVariables: () => Record<string, string>;
  getCurrentMode: () => 'light' | 'dark';
  toggleThemeMode: () => Promise<void>;
}

// ===== DEFAULT THEME =====
const defaultTheme: ThemeConfig = {
  mode: 'dark',
  primaryColor: 'cyan',
  accentColor: 'purple',
  customColors: {
    primary: '#06b6d4',
    secondary: '#8b5cf6',
    accent: '#f59e0b',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f8fafc'
  },
  animations: true,
  reducedMotion: false,
  glassEffect: true,
  neonEffects: false,
  autoSync: true
};

// ===== CONTEXT CREATION =====
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ===== THEME PROVIDER =====
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);
  const [presetThemes, setPresetThemes] = useState<PresetTheme[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===== LOAD THEME FROM API =====
  const loadThemeConfig = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.get('/api/themes/config');
      
      if (response.success) {
        setTheme(response.data.theme);
        applyThemeToDOM(response.data.theme);
      }
    } catch (err: any) {
      setError(err.message || 'Error cargando configuración de tema');
      console.error('Error loading theme config:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ===== LOAD PRESET THEMES =====
  const loadPresetThemes = async () => {
    try {
      const response = await apiService.get('/api/themes/presets');
      
      if (response.success) {
        setPresetThemes(response.data.themes);
      }
    } catch (err: any) {
      console.error('Error loading preset themes:', err);
    }
  };

  // ===== APPLY THEME TO DOM =====
  const applyThemeToDOM = (themeConfig: ThemeConfig) => {
    const root = document.documentElement;
    const variables = getThemeVariables(themeConfig);
    
    // Apply CSS variables
    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Apply theme class
    root.className = root.className.replace(/theme-\w+/g, '');
    root.classList.add(`theme-${themeConfig.mode}`);
    
    // Apply effects classes
    if (themeConfig.glassEffect) {
      root.classList.add('glass-effects');
    } else {
      root.classList.remove('glass-effects');
    }
    
    if (themeConfig.neonEffects) {
      root.classList.add('neon-effects');
    } else {
      root.classList.remove('neon-effects');
    }
    
    if (themeConfig.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
  };

  // ===== GET THEME VARIABLES =====
  const getThemeVariables = (themeConfig: ThemeConfig = theme): Record<string, string> => {
    return {
      '--color-primary': themeConfig.customColors.primary,
      '--color-secondary': themeConfig.customColors.secondary,
      '--color-accent': themeConfig.customColors.accent,
      '--color-background': themeConfig.customColors.background,
      '--color-surface': themeConfig.customColors.surface,
      '--color-text': themeConfig.customColors.text,
      '--animation-duration': themeConfig.animations ? '0.3s' : '0s',
      '--border-radius': themeConfig.glassEffect ? '12px' : '8px',
      '--backdrop-blur': themeConfig.glassEffect ? 'blur(12px)' : 'none',
    };
  };

  // ===== GET CURRENT MODE =====
  const getCurrentMode = (): 'light' | 'dark' => {
    if (theme.mode === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme.mode;
  };

  // ===== UPDATE THEME =====
  const updateTheme = async (config: Partial<ThemeConfig>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedTheme = { ...theme, ...config };
      
      const response = await apiService.put('/api/themes/config', updatedTheme);
      
      if (response.success) {
        setTheme(response.data.theme);
        applyThemeToDOM(response.data.theme);
        
        // Auto-sync if enabled
        if (updatedTheme.autoSync) {
          await syncTheme(navigator.userAgent, 'web');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error actualizando tema');
      console.error('Error updating theme:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ===== APPLY PRESET THEME =====
  const applyPresetTheme = async (themeId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.post(`/api/themes/presets/${themeId}/apply`);
      
      if (response.success) {
        setTheme(response.data.theme);
        applyThemeToDOM(response.data.theme);
      }
    } catch (err: any) {
      setError(err.message || 'Error aplicando tema predefinido');
      console.error('Error applying preset theme:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ===== RESET TO DEFAULT =====
  const resetToDefault = async () => {
    await updateTheme(defaultTheme);
  };

  // ===== SYNC THEME =====
  const syncTheme = async (deviceId: string, platform: string) => {
    try {
      await apiService.post('/api/themes/sync', { deviceId, platform });
    } catch (err: any) {
      console.error('Error syncing theme:', err);
    }
  };

  // ===== TOGGLE THEME MODE =====
  const toggleThemeMode = async () => {
    const currentMode = getCurrentMode();
    const newMode = currentMode === 'dark' ? 'light' : 'dark';
    await updateTheme({ mode: newMode });
  };

  // ===== HANDLE SYSTEM THEME CHANGE =====
  useEffect(() => {
    if (theme.mode === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = () => {
        applyThemeToDOM(theme);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme.mode]);

  // ===== INITIAL LOAD =====
  useEffect(() => {
    loadThemeConfig();
    loadPresetThemes();
  }, []);

  // ===== APPLY THEME ON MOUNT =====
  useEffect(() => {
    applyThemeToDOM(theme);
  }, []);

  // ===== CONTEXT VALUE =====
  const contextValue: ThemeContextType = {
    theme,
    presetThemes,
    isLoading,
    error,
    updateTheme,
    applyPresetTheme,
    resetToDefault,
    syncTheme,
    getThemeVariables,
    getCurrentMode,
    toggleThemeMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// ===== HOOK =====
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

export default ThemeContext;