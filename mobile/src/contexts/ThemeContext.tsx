import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import * as Haptics from 'expo-haptics';
import ThemeService from '../services/ThemeService';

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
  config: ThemeConfig;
}

export interface ThemeStyles {
  colors: ThemeColors & { mode: 'light' | 'dark' };
  animations: {
    enabled: boolean;
    duration: number;
  };
  effects: {
    glass: boolean;
    neon: boolean;
    reducedMotion: boolean;
  };
}

// ===== THEME CONTEXT INTERFACE =====
interface ThemeContextType {
  theme: ThemeConfig;
  themeStyles: ThemeStyles;
  presetThemes: PresetTheme[];
  isLoading: boolean;
  error: string | null;
  
  // Theme management
  updateTheme: (config: Partial<ThemeConfig>) => Promise<void>;
  applyPresetTheme: (themeId: string) => Promise<void>;
  resetToDefault: () => Promise<void>;
  syncTheme: () => Promise<void>;
  
  // Theme utilities
  getCurrentMode: () => 'light' | 'dark';
  toggleThemeMode: () => Promise<void>;
  refreshTheme: () => Promise<void>;
}

// ===== CONTEXT CREATION =====
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ===== THEME PROVIDER =====
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeConfig>(ThemeService.defaultTheme);
  const [presetThemes, setPresetThemes] = useState<PresetTheme[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===== COMPUTED THEME STYLES =====
  const themeStyles = React.useMemo(() => {
    return ThemeService.getThemeStyles(theme, systemColorScheme);
  }, [theme, systemColorScheme]);

  // ===== LOAD THEME CONFIG =====
  const loadThemeConfig = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const themeConfig = await ThemeService.getThemeConfig();
      setTheme(themeConfig);
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
      const themes = await ThemeService.getPresetThemes();
      setPresetThemes(themes);
    } catch (err: any) {
      console.error('Error loading preset themes:', err);
    }
  };

  // ===== UPDATE THEME =====
  const updateTheme = useCallback(async (config: Partial<ThemeConfig>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedTheme = { ...theme, ...config };
      const result = await ThemeService.updateThemeConfig(updatedTheme);
      
      setTheme(result);
      
      // Haptic feedback for theme changes
      await Haptics.selectionAsync();
    } catch (err: any) {
      setError(err.message || 'Error actualizando tema');
      console.error('Error updating theme:', err);
    } finally {
      setIsLoading(false);
    }
  }, [theme]);

  // ===== APPLY PRESET THEME =====
  const applyPresetTheme = useCallback(async (themeId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await ThemeService.applyPresetTheme(themeId);
      setTheme(result);
      
      // Haptic feedback for preset application
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      setError(err.message || 'Error aplicando tema predefinido');
      console.error('Error applying preset theme:', err);
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ===== RESET TO DEFAULT =====
  const resetToDefault = useCallback(async () => {
    await updateTheme(ThemeService.defaultTheme);
  }, [updateTheme]);

  // ===== SYNC THEME =====
  const syncTheme = useCallback(async () => {
    try {
      await ThemeService.syncTheme();
      await Haptics.selectionAsync();
    } catch (err: any) {
      console.error('Error syncing theme:', err);
    }
  }, []);

  // ===== GET CURRENT MODE =====
  const getCurrentMode = useCallback((): 'light' | 'dark' => {
    return ThemeService.getCurrentMode(theme, systemColorScheme);
  }, [theme, systemColorScheme]);

  // ===== TOGGLE THEME MODE =====
  const toggleThemeMode = useCallback(async () => {
    const currentMode = getCurrentMode();
    const newMode = currentMode === 'dark' ? 'light' : 'dark';
    await updateTheme({ mode: newMode });
  }, [getCurrentMode, updateTheme]);

  // ===== REFRESH THEME =====
  const refreshTheme = useCallback(async () => {
    await loadThemeConfig();
  }, []);

  // ===== LISTEN TO SYSTEM COLOR SCHEME CHANGES =====
  useEffect(() => {
    if (theme.mode === 'auto') {
      const subscription = Appearance.addChangeListener(() => {
        // Theme styles will automatically update due to useMemo dependency
      });

      return () => subscription?.remove();
    }
  }, [theme.mode]);

  // ===== INITIAL LOAD =====
  useEffect(() => {
    const initializeTheme = async () => {
      // Migrate old theme data if needed
      await ThemeService.migrateThemeData();
      
      // Load current theme and presets
      await Promise.all([
        loadThemeConfig(),
        loadPresetThemes()
      ]);
    };

    initializeTheme();
  }, []);

  // ===== CONTEXT VALUE =====
  const contextValue: ThemeContextType = {
    theme,
    themeStyles,
    presetThemes,
    isLoading,
    error,
    updateTheme,
    applyPresetTheme,
    resetToDefault,
    syncTheme,
    getCurrentMode,
    toggleThemeMode,
    refreshTheme,
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

// ===== STYLED THEME HOOK =====
export const useThemedStyles = () => {
  const { themeStyles } = useTheme();
  
  return {
    colors: themeStyles.colors,
    animations: themeStyles.animations,
    effects: themeStyles.effects,
    
    // Common style generators
    container: {
      backgroundColor: themeStyles.colors.background,
      flex: 1,
    },
    
    surface: {
      backgroundColor: themeStyles.colors.surface,
      borderRadius: themeStyles.effects.glass ? 12 : 8,
    },
    
    text: {
      color: themeStyles.colors.text,
    },
    
    primaryButton: {
      backgroundColor: themeStyles.colors.primary,
      borderRadius: themeStyles.effects.glass ? 12 : 8,
    },
    
    secondaryButton: {
      backgroundColor: themeStyles.colors.secondary,
      borderRadius: themeStyles.effects.glass ? 12 : 8,
    },
    
    card: {
      backgroundColor: themeStyles.colors.surface,
      borderRadius: themeStyles.effects.glass ? 16 : 12,
      shadowColor: themeStyles.colors.primary,
      shadowOffset: {
        width: 0,
        height: themeStyles.effects.neon ? 4 : 2,
      },
      shadowOpacity: themeStyles.effects.neon ? 0.3 : 0.1,
      shadowRadius: themeStyles.effects.neon ? 8 : 4,
      elevation: themeStyles.effects.neon ? 8 : 4,
    },
  };
};

export default ThemeContext;
