import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Zap, Palette, Monitor } from 'lucide-react';

// ===== THEME TYPES =====
export type Theme = 'neon-urban' | 'neon-urban-light' | 'cyberpunk' | 'minimalist';

export interface ThemeConfig {
  id: Theme;
  name: string;
  description: string;
  icon: React.ReactNode;
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
  cssVariables: Record<string, string>;
}

// ===== THEME CONFIGURATIONS =====
export const themes: Record<Theme, ThemeConfig> = {
  'neon-urban': {
    id: 'neon-urban',
    name: 'Neon Urban',
    description: 'Cyberpunk meets Urban Culture',
    icon: <Zap className="w-5 h-5" />,
    colors: {
      primary: '#00d4ff',
      secondary: '#a855f7',
      accent: '#06b6d4',
      background: '#0a0a0a',
      surface: '#111111',
      text: '#ffffff',
      textSecondary: '#e5e7eb',
      border: 'rgba(255, 255, 255, 0.1)',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    cssVariables: {
      '--neon-blue': '#00d4ff',
      '--neon-purple': '#a855f7',
      '--neon-cyan': '#06b6d4',
      '--neon-green': '#10b981',
      '--neon-orange': '#f97316',
      '--neon-pink': '#ec4899',
      '--neon-yellow': '#eab308',
      '--bg-primary': '#0a0a0a',
      '--bg-secondary': '#111111',
      '--bg-tertiary': '#1a1a1a',
      '--bg-glass': 'rgba(255, 255, 255, 0.05)',
      '--text-primary': '#ffffff',
      '--text-secondary': '#e5e7eb',
      '--text-muted': '#9ca3af',
      '--border-primary': 'rgba(255, 255, 255, 0.1)',
      '--border-secondary': 'rgba(255, 255, 255, 0.05)',
      '--gradient-primary': 'linear-gradient(135deg, #00d4ff 0%, #a855f7 100%)',
      '--gradient-secondary': 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
      '--gradient-accent': 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
      '--shadow-neon': '0 0 20px rgba(0, 212, 255, 0.3)',
      '--shadow-purple': '0 0 20px rgba(168, 85, 247, 0.3)',
      '--shadow-cyan': '0 0 20px rgba(6, 182, 212, 0.3)',
    },
  },
  'neon-urban-light': {
    id: 'neon-urban-light',
    name: 'Neon Urban Light',
    description: 'Bright and vibrant neon theme',
    icon: <Sun className="w-5 h-5" />,
    colors: {
      primary: '#00d4ff',
      secondary: '#a855f7',
      accent: '#06b6d4',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#0f172a',
      textSecondary: '#334155',
      border: 'rgba(0, 0, 0, 0.1)',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    cssVariables: {
      '--neon-blue': '#00d4ff',
      '--neon-purple': '#a855f7',
      '--neon-cyan': '#06b6d4',
      '--neon-green': '#10b981',
      '--neon-orange': '#f97316',
      '--neon-pink': '#ec4899',
      '--neon-yellow': '#eab308',
      '--bg-primary': '#ffffff',
      '--bg-secondary': '#f8fafc',
      '--bg-tertiary': '#f1f5f9',
      '--bg-glass': 'rgba(0, 0, 0, 0.05)',
      '--text-primary': '#0f172a',
      '--text-secondary': '#334155',
      '--text-muted': '#64748b',
      '--border-primary': 'rgba(0, 0, 0, 0.1)',
      '--border-secondary': 'rgba(0, 0, 0, 0.05)',
      '--gradient-primary': 'linear-gradient(135deg, #00d4ff 0%, #a855f7 100%)',
      '--gradient-secondary': 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
      '--gradient-accent': 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
      '--shadow-neon': '0 0 20px rgba(0, 212, 255, 0.2)',
      '--shadow-purple': '0 0 20px rgba(168, 85, 247, 0.2)',
      '--shadow-cyan': '0 0 20px rgba(6, 182, 212, 0.2)',
    },
  },
  'cyberpunk': {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Intense neon and dark aesthetics',
    icon: <Zap className="w-5 h-5" />,
    colors: {
      primary: '#ff0080',
      secondary: '#00ffff',
      accent: '#ffff00',
      background: '#000000',
      surface: '#0a0a0a',
      text: '#ffffff',
      textSecondary: '#00ffff',
      border: 'rgba(255, 0, 128, 0.3)',
      success: '#00ff00',
      warning: '#ff8000',
      error: '#ff0000',
      info: '#0080ff',
    },
    cssVariables: {
      '--neon-blue': '#00ffff',
      '--neon-purple': '#ff0080',
      '--neon-cyan': '#00ffff',
      '--neon-green': '#00ff00',
      '--neon-orange': '#ff8000',
      '--neon-pink': '#ff0080',
      '--neon-yellow': '#ffff00',
      '--bg-primary': '#000000',
      '--bg-secondary': '#0a0a0a',
      '--bg-tertiary': '#1a1a1a',
      '--bg-glass': 'rgba(255, 0, 128, 0.1)',
      '--text-primary': '#ffffff',
      '--text-secondary': '#00ffff',
      '--text-muted': '#808080',
      '--border-primary': 'rgba(255, 0, 128, 0.3)',
      '--border-secondary': 'rgba(0, 255, 255, 0.2)',
      '--gradient-primary': 'linear-gradient(135deg, #ff0080 0%, #00ffff 100%)',
      '--gradient-secondary': 'linear-gradient(135deg, #ffff00 0%, #00ff00 100%)',
      '--gradient-accent': 'linear-gradient(135deg, #ff8000 0%, #ff0080 100%)',
      '--shadow-neon': '0 0 30px rgba(255, 0, 128, 0.5)',
      '--shadow-purple': '0 0 30px rgba(0, 255, 255, 0.5)',
      '--shadow-cyan': '0 0 30px rgba(255, 255, 0, 0.5)',
    },
  },
  'minimalist': {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Clean and simple design',
    icon: <Monitor className="w-5 h-5" />,
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#06b6d4',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#0f172a',
      textSecondary: '#475569',
      border: 'rgba(0, 0, 0, 0.1)',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    cssVariables: {
      '--neon-blue': '#3b82f6',
      '--neon-purple': '#8b5cf6',
      '--neon-cyan': '#06b6d4',
      '--neon-green': '#10b981',
      '--neon-orange': '#f97316',
      '--neon-pink': '#ec4899',
      '--neon-yellow': '#eab308',
      '--bg-primary': '#ffffff',
      '--bg-secondary': '#f8fafc',
      '--bg-tertiary': '#f1f5f9',
      '--bg-glass': 'rgba(0, 0, 0, 0.05)',
      '--text-primary': '#0f172a',
      '--text-secondary': '#475569',
      '--text-muted': '#64748b',
      '--border-primary': 'rgba(0, 0, 0, 0.1)',
      '--border-secondary': 'rgba(0, 0, 0, 0.05)',
      '--gradient-primary': 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      '--gradient-secondary': 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
      '--gradient-accent': 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
      '--shadow-neon': '0 0 10px rgba(59, 130, 246, 0.2)',
      '--shadow-purple': '0 0 10px rgba(139, 92, 246, 0.2)',
      '--shadow-cyan': '0 0 10px rgba(6, 182, 212, 0.2)',
    },
  },
};

// ===== THEME CONTEXT INTERFACE =====
interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (theme: Theme) => void;
  themes: Record<Theme, ThemeConfig>;
  isDark: boolean;
  toggleTheme: () => void;
}

// ===== THEME CONTEXT =====
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ===== THEME PROVIDER =====
export const ThemeProvider: React.FC<{
  children: React.ReactNode;
  defaultTheme?: Theme;
}> = ({ children, defaultTheme = 'neon-urban' }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultTheme);

  // ===== APPLY THEME TO CSS VARIABLES =====
  useEffect(() => {
    const root = document.documentElement;
    const themeConfig = themes[currentTheme];
    
    // Remove previous theme class
    root.classList.remove('theme-neon-urban', 'theme-neon-urban-light', 'theme-cyberpunk', 'theme-minimalist');
    
    // Add current theme class
    root.classList.add(`theme-${currentTheme}`);
    
    // Apply CSS variables
    Object.entries(themeConfig.cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    
    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeConfig.colors.background);
    }
    
    // Save to localStorage
    localStorage.setItem('eventconnect-theme', currentTheme);
  }, [currentTheme]);

  // ===== LOAD THEME FROM LOCALSTORAGE =====
  useEffect(() => {
    const savedTheme = localStorage.getItem('eventconnect-theme') as Theme;
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // ===== SET THEME FUNCTION =====
  const setTheme = (theme: Theme) => {
    if (themes[theme]) {
      setCurrentTheme(theme);
    }
  };

  // ===== TOGGLE BETWEEN DARK/LIGHT =====
  const toggleTheme = () => {
    if (currentTheme === 'neon-urban') {
      setTheme('neon-urban-light');
    } else if (currentTheme === 'neon-urban-light') {
      setTheme('neon-urban');
    } else {
      setTheme('neon-urban');
    }
  };

  // ===== CHECK IF CURRENT THEME IS DARK =====
  const isDark = currentTheme === 'neon-urban' || currentTheme === 'cyberpunk';

  const value: ThemeContextType = {
    currentTheme,
    setTheme,
    themes,
    isDark,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// ===== USE THEME HOOK =====
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// ===== THEME SWITCHER COMPONENT =====
export const ThemeSwitcher: React.FC<{
  className?: string;
  showLabels?: boolean;
}> = ({ className, showLabels = true }) => {
  const { currentTheme, setTheme, themes: availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {/* Current Theme Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200"
      >
        {availableThemes[currentTheme].icon}
        {showLabels && (
          <span className="text-white font-medium">
            {availableThemes[currentTheme].name}
          </span>
        )}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </button>

      {/* Theme Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 right-0 w-64 bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden z-50"
          >
            <div className="p-2">
              {Object.values(availableThemes).map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setTheme(theme.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 text-left ${
                    currentTheme === theme.id
                      ? 'bg-cyan-500/20 border border-cyan-400/50'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {theme.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white">
                      {theme.name}
                    </div>
                    <div className="text-sm text-gray-300">
                      {theme.description}
                    </div>
                  </div>
                  {currentTheme === theme.id && (
                    <div className="flex-shrink-0 w-2 h-2 bg-cyan-400 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ThemeProvider;