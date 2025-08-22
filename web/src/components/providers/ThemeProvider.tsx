'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

// ===== INTERFACES =====
type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

// ===== CONTEXTO =====
const ThemeContext = createContext<ThemeContextType | null>(null);

// ===== PROVIDER =====
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Cargar tema del localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('eventconnect_theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Resolver tema actual
  useEffect(() => {
    const resolveTheme = () => {
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setResolvedTheme(systemTheme);
        return systemTheme;
      } else {
        setResolvedTheme(theme);
        return theme;
      }
    };

    const currentTheme = resolveTheme();

    // Aplicar clase al documento
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(currentTheme);

    // Guardar en localStorage
    localStorage.setItem('eventconnect_theme', theme);

    // Listener para cambios en el tema del sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        resolveTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    resolvedTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// ===== HOOK =====
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  return context;
};