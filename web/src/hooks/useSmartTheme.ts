import { useState, useEffect, useCallback } from 'react';
import { useGeolocation } from './useGeolocation';

// ===== INTERFACES =====
interface SunTimes {
  sunrise: Date;
  sunset: Date;
  dawn: Date;
  dusk: Date;
}

interface SmartThemeConfig {
  mode: 'light' | 'dark' | 'auto' | 'smart';
  autoSwitchEnabled: boolean;
  followSystemPreference: boolean;
  locationBasedSwitching: boolean;
  customSchedule?: {
    lightStart: string; // HH:mm
    darkStart: string;  // HH:mm
  };
}

interface ThemeContext {
  currentTheme: 'light' | 'dark';
  reason: string;
  nextSwitch?: Date;
  sunTimes?: SunTimes;
}

// ===== HOOK PRINCIPAL =====
export const useSmartTheme = () => {
  const [config, setConfig] = useState<SmartThemeConfig>({
    mode: 'smart',
    autoSwitchEnabled: true,
    followSystemPreference: true,
    locationBasedSwitching: true
  });
  
  const [themeContext, setThemeContext] = useState<ThemeContext>({
    currentTheme: 'light',
    reason: 'Inicializando...'
  });
  
  const { location } = useGeolocation();

  /**
   * Calcula horarios de amanecer y atardecer
   */
  const calculateSunTimes = useCallback((lat: number, lng: number, date: Date = new Date()): SunTimes => {
    // Implementación simplificada del cálculo solar
    // En producción, usarías una librería como suncalc
    
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const p = Math.asin(0.39795 * Math.cos(0.98563 * (dayOfYear - 173) * Math.PI / 180));
    
    const a = (Math.sin(0 * Math.PI / 180) - Math.sin(lat * Math.PI / 180) * Math.sin(p)) / 
              (Math.cos(lat * Math.PI / 180) * Math.cos(p));
    
    let hourAngle = 0;
    if (Math.abs(a) <= 1) {
      hourAngle = 12 * Math.acos(a) / Math.PI;
    }
    
    const sunrise = new Date(date);
    sunrise.setHours(12 - hourAngle, 0, 0, 0);
    
    const sunset = new Date(date);
    sunset.setHours(12 + hourAngle, 0, 0, 0);
    
    const dawn = new Date(sunrise.getTime() - 30 * 60 * 1000); // 30 min antes
    const dusk = new Date(sunset.getTime() + 30 * 60 * 1000);  // 30 min después
    
    return { sunrise, sunset, dawn, dusk };
  }, []);

  /**
   * Determina el tema basado en múltiples factores
   */
  const determineTheme = useCallback((): ThemeContext => {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Modo manual
    if (config.mode === 'light') {
      return { currentTheme: 'light', reason: 'Modo claro manual' };
    }
    if (config.mode === 'dark') {
      return { currentTheme: 'dark', reason: 'Modo oscuro manual' };
    }
    
    // Seguir preferencia del sistema
    if (config.mode === 'auto' && config.followSystemPreference) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return { 
        currentTheme: prefersDark ? 'dark' : 'light', 
        reason: prefersDark ? 'Sistema prefiere oscuro' : 'Sistema prefiere claro'
      };
    }
    
    // Modo inteligente
    if (config.mode === 'smart' || config.mode === 'auto') {
      // Horario personalizado
      if (config.customSchedule) {
        const lightStart = this.parseTime(config.customSchedule.lightStart);
        const darkStart = this.parseTime(config.customSchedule.darkStart);
        
        if (this.isTimeBetween(currentHour, lightStart, darkStart)) {
          return { currentTheme: 'light', reason: 'Horario personalizado - día' };
        } else {
          return { currentTheme: 'dark', reason: 'Horario personalizado - noche' };
        }
      }
      
      // Basado en ubicación (amanecer/atardecer)
      if (config.locationBasedSwitching && location?.coordinates) {
        const sunTimes = this.calculateSunTimes(
          location.coordinates.latitude, 
          location.coordinates.longitude, 
          now
        );
        
        const isDayTime = now >= sunTimes.dawn && now <= sunTimes.dusk;
        const nextSwitch = isDayTime ? sunTimes.dusk : sunTimes.dawn;
        
        return {
          currentTheme: isDayTime ? 'light' : 'dark',
          reason: isDayTime 
            ? `Día natural (atardecer a las ${sunTimes.sunset.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })})` 
            : `Noche natural (amanecer a las ${sunTimes.sunrise.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })})`,
          nextSwitch,
          sunTimes
        };
      }
      
      // Fallback: horario estático inteligente
      const isDayTime = currentHour >= 7 && currentHour < 20;
      return {
        currentTheme: isDayTime ? 'light' : 'dark',
        reason: isDayTime ? 'Horario de día (7:00-20:00)' : 'Horario de noche (20:00-7:00)',
        nextSwitch: new Date(now.getTime() + (isDayTime ? 
          ((20 - currentHour) * 60 * 60 * 1000) : 
          ((7 + (24 - currentHour)) * 60 * 60 * 1000)
        ))
      };
    }
    
    return { currentTheme: 'light', reason: 'Fallback por defecto' };
  }, [config, location, calculateSunTimes]);

  /**
   * Aplica el tema al documento
   */
  const applyTheme = useCallback((theme: 'light' | 'dark') => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    
    // Actualizar meta theme-color para PWA
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#0B0B0C' : '#FFFFFF');
    }
    
    // Guardar preferencia
    localStorage.setItem('eventconnect_smart_theme', JSON.stringify(config));
  }, [config]);

  /**
   * Actualiza el tema automáticamente
   */
  const updateTheme = useCallback(() => {
    if (!config.autoSwitchEnabled) return;
    
    const newContext = this.determineTheme();
    
    if (newContext.currentTheme !== themeContext.currentTheme) {
      setThemeContext(newContext);
      this.applyTheme(newContext.currentTheme);
      
      console.log(`🎨 Tema cambiado a ${newContext.currentTheme}: ${newContext.reason}`);
    }
  }, [config, themeContext, determineTheme, applyTheme]);

  /**
   * Configura listeners para cambios automáticos
   */
  useEffect(() => {
    // Actualización inicial
    updateTheme();
    
    // Listener para cambios en preferencias del sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (config.followSystemPreference) {
        updateTheme();
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemChange);
    
    // Timer para verificaciones periódicas (cada minuto)
    const interval = setInterval(updateTheme, 60 * 1000);
    
    // Listener para cambios de visibilidad (cuando vuelve a la app)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateTheme();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemChange);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [updateTheme, config]);

  /**
   * Carga configuración guardada
   */
  useEffect(() => {
    try {
      const saved = localStorage.getItem('eventconnect_smart_theme');
      if (saved) {
        const savedConfig = JSON.parse(saved);
        setConfig(prev => ({ ...prev, ...savedConfig }));
      }
    } catch (error) {
      console.error('Error loading theme config:', error);
    }
  }, []);

  /**
   * Helpers
   */
  const parseTime = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours + (minutes / 60);
  };

  const isTimeBetween = (current: number, start: number, end: number): boolean => {
    if (start <= end) {
      return current >= start && current < end;
    } else {
      return current >= start || current < end;
    }
  };

  /**
   * API pública del hook
   */
  const setThemeMode = useCallback((mode: SmartThemeConfig['mode']) => {
    setConfig(prev => ({ ...prev, mode }));
  }, []);

  const toggleAutoSwitch = useCallback(() => {
    setConfig(prev => ({ ...prev, autoSwitchEnabled: !prev.autoSwitchEnabled }));
  }, []);

  const setCustomSchedule = useCallback((lightStart: string, darkStart: string) => {
    setConfig(prev => ({
      ...prev,
      customSchedule: { lightStart, darkStart }
    }));
  }, []);

  const forceTheme = useCallback((theme: 'light' | 'dark') => {
    setThemeContext(prev => ({ ...prev, currentTheme: theme, reason: 'Forzado manualmente' }));
    applyTheme(theme);
  }, [applyTheme]);

  const getTimeToNextSwitch = useCallback((): string | null => {
    if (!themeContext.nextSwitch) return null;
    
    const now = Date.now();
    const timeUntil = themeContext.nextSwitch.getTime() - now;
    
    if (timeUntil <= 0) return null;
    
    const hours = Math.floor(timeUntil / (1000 * 60 * 60));
    const minutes = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }, [themeContext.nextSwitch]);

  return {
    // Estado actual
    currentTheme: themeContext.currentTheme,
    reason: themeContext.reason,
    sunTimes: themeContext.sunTimes,
    timeToNextSwitch: getTimeToNextSwitch(),
    
    // Configuración
    config,
    setThemeMode,
    toggleAutoSwitch,
    setCustomSchedule,
    
    // Acciones
    forceTheme,
    updateTheme,
    
    // Utilidades
    isDark: themeContext.currentTheme === 'dark',
    isAuto: config.mode === 'auto' || config.mode === 'smart',
    hasLocation: !!location?.coordinates
  };
};