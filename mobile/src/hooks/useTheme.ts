import { useColorScheme } from 'react-native';
import { MobileTheme } from '../types';

// ===== TEMAS =====
const lightTheme: MobileTheme = {
  isDark: false,
  colors: {
    primary: '#3B82F6',
    primaryLight: '#60A5FA',
    primaryDark: '#1D4ED8',
    secondary: '#10B981',
    accent: '#F59E0B',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    card: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    error: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981',
    info: '#3B82F6',
  }
};

const darkTheme: MobileTheme = {
  isDark: true,
  colors: {
    primary: '#60A5FA',
    primaryLight: '#93C5FD',
    primaryDark: '#3B82F6',
    secondary: '#34D399',
    accent: '#FBBF24',
    background: '#111827',
    surface: '#1F2937',
    card: '#374151',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#4B5563',
    error: '#F87171',
    warning: '#FBBF24',
    success: '#34D399',
    info: '#60A5FA',
  }
};

// ===== HOOK =====
export const useTheme = () => {
  const colorScheme = useColorScheme();
  
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  
  return {
    theme,
    isDark: theme.isDark,
    colors: theme.colors,
    toggleTheme: () => {
      // En una implementación real, aquí cambiarías el tema manualmente
      // Por ahora solo sigue el sistema
      console.log('Toggle theme - siguiendo sistema:', colorScheme);
    }
  };
};