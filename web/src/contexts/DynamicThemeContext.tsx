'use client';

import React, { createContext, useContext, useState } from 'react';

// ===== INTERFACES =====
interface DynamicThemeContextType {
  accentColor: string;
  setAccentColor: (color: string) => void;
  backgroundPattern: string;
  setBackgroundPattern: (pattern: string) => void;
}

// ===== CONTEXTO =====
const DynamicThemeContext = createContext<DynamicThemeContextType | null>(null);

// ===== PROVIDER =====
export const DynamicThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accentColor, setAccentColor] = useState('#4F46E5');
  const [backgroundPattern, setBackgroundPattern] = useState('none');

  const value: DynamicThemeContextType = {
    accentColor,
    setAccentColor,
    backgroundPattern,
    setBackgroundPattern
  };

  return (
    <DynamicThemeContext.Provider value={value}>
      {children}
    </DynamicThemeContext.Provider>
  );
};

// ===== HOOK =====
export const useDynamicTheme = (): DynamicThemeContextType => {
  const context = useContext(DynamicThemeContext);
  if (!context) {
    throw new Error('useDynamicTheme debe usarse dentro de DynamicThemeProvider');
  }
  return context;
};