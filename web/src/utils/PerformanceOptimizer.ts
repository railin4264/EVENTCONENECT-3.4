// Optimizador de performance para la aplicación web
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Configuración de optimización
const PERFORMANCE_CONFIG = {
  // Cache
  CACHE_TTL: 5 * 60 * 1000, // 5 minutos
  MAX_CACHE_SIZE: 100,
  
  // Lazy loading
  INTERSECTION_THRESHOLD: 0.1,
  INTERSECTION_ROOT_MARGIN: '50px',
  
  // Debounce/Throttle
  DEFAULT_DEBOUNCE_DELAY: 300,
  DEFAULT_THROTTLE_DELAY: 100,
  
  // Virtual scrolling
  VIRTUAL_ITEM_HEIGHT: 60,
  VIRTUAL_BUFFER_SIZE: 5,
  
  // Image optimization
  IMAGE_LAZY_LOADING: true,
  IMAGE_WEBP_SUPPORT: true,
  IMAGE_RESPONSIVE_BREAKPOINTS: [320, 640, 768, 1024, 1280, 1920],
};

// Clase para gestión de cache en memoria
class MemoryCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl?: number }>();
  private maxSize: number;

  constructor(maxSize = PERFORMANCE_CONFIG.MAX_CACHE_SIZE) {
    this.maxSize = maxSize;
  }

  set(key: string, data: any, ttl = PERFORMANCE_CONFIG.CACHE_TTL): void {
    // Si el cache está lleno, eliminar el más antiguo
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any {
    const entry = this.cache.get(key);
    
    if (!entry) return null;

    // Verificar si ha expirado
    if (Date.now() - entry.timestamp > (entry.ttl || PERFORMANCE_CONFIG.CACHE_TTL)) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Instancia global del cache
const globalCache = new MemoryCache();

// Hook para cache con React Query style
export const useCache = <T>(key: string, fetcher: () => Promise<T>, options: {
  enabled?: boolean;
  ttl?: number;
  staleTime?: number;
} = {}) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);

  const { enabled = true, ttl = PERFORMANCE_CONFIG.CACHE_TTL, staleTime = ttl / 2 } = options;

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    // Verificar cache primero
    const cachedData = globalCache.get(key);
    if (cachedData) {
      setData(cachedData);
      
      // Verificar si está obsoleto
      const entry = globalCache['cache'].get(key);
      if (entry && Date.now() - entry.timestamp > staleTime) {
        setIsStale(true);
      }
      
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      globalCache.set(key, result, ttl);
      setData(result);
      setIsStale(false);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, enabled, ttl, staleTime]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    globalCache.delete(key);
    return fetchData();
  }, [key, fetchData]);

  const mutate = useCallback((newData: T) => {
    globalCache.set(key, newData, ttl);
    setData(newData);
    setIsStale(false);
  }, [key, ttl]);

  return {
    data,
    isLoading,
    error,
    isStale,
    refetch,
    mutate
  };
};

// Hook para debounce
export const useDebounce = <T>(value: T, delay = PERFORMANCE_CONFIG.DEFAULT_DEBOUNCE_DELAY): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook para throttle
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay = PERFORMANCE_CONFIG.DEFAULT_THROTTLE_DELAY
): T => {
  const lastRun = useRef(Date.now());

  return useCallback((...args: Parameters<T>) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]) as T;
};

// Hook para Intersection Observer (lazy loading)
export const useIntersectionObserver = (options: IntersectionObserverInit = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const targetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: PERFORMANCE_CONFIG.INTERSECTION_THRESHOLD,
        rootMargin: PERFORMANCE_CONFIG.INTERSECTION_ROOT_MARGIN,
        ...options
      }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [hasIntersected, options]);

  return { targetRef, isIntersecting, hasIntersected };
};

// Hook para virtual scrolling
export const useVirtualScrolling = <T>(
  items: T[],
  itemHeight = PERFORMANCE_CONFIG.VIRTUAL_ITEM_HEIGHT,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + PERFORMANCE_CONFIG.VIRTUAL_BUFFER_SIZE,
      items.length
    );

    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
      top: (startIndex + index) * itemHeight
    }));
  }, [items, itemHeight, containerHeight, scrollTop]);

  const totalHeight = items.length * itemHeight;

  const handleScroll = useThrottle((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  });

  return {
    visibleItems,
    totalHeight,
    handleScroll
  };
};

// Hook para optimización de imágenes
export const useImageOptimization = (src: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  lazy?: boolean;
} = {}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { targetRef, hasIntersected } = useIntersectionObserver();

  const {
    width,
    height,
    quality = 80,
    format = 'webp',
    lazy = PERFORMANCE_CONFIG.IMAGE_LAZY_LOADING
  } = options;

  // Generar srcSet para imágenes responsivas
  const srcSet = useMemo(() => {
    if (!width) return '';

    return PERFORMANCE_CONFIG.IMAGE_RESPONSIVE_BREAKPOINTS
      .filter(breakpoint => breakpoint <= width * 2) // Solo incluir breakpoints relevantes
      .map(breakpoint => {
        const optimizedSrc = generateOptimizedImageUrl(src, {
          width: breakpoint,
          height: height ? Math.round((height * breakpoint) / width) : undefined,
          quality,
          format
        });
        return `${optimizedSrc} ${breakpoint}w`;
      })
      .join(', ');
  }, [src, width, height, quality, format]);

  const optimizedSrc = useMemo(() => {
    return generateOptimizedImageUrl(src, { width, height, quality, format });
  }, [src, width, height, quality, format]);

  const shouldLoad = lazy ? hasIntersected : true;

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setError(null);
  }, []);

  const handleError = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setError(new Error('Failed to load image'));
    setIsLoaded(false);
  }, []);

  return {
    targetRef,
    src: shouldLoad ? optimizedSrc : '',
    srcSet: shouldLoad ? srcSet : '',
    isLoaded,
    error,
    onLoad: handleLoad,
    onError: handleError,
    shouldLoad
  };
};

// Función para generar URLs de imágenes optimizadas
const generateOptimizedImageUrl = (src: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: string;
}): string => {
  // En un entorno real, esto se conectaría a un servicio de optimización como Cloudinary, ImageKit, etc.
  const { width, height, quality, format } = options;
  
  // Ejemplo con parámetros de URL (ajustar según el servicio usado)
  const params = new URLSearchParams();
  if (width) params.append('w', width.toString());
  if (height) params.append('h', height.toString());
  if (quality) params.append('q', quality.toString());
  if (format) params.append('f', format);

  const paramString = params.toString();
  return paramString ? `${src}?${paramString}` : src;
};

// Hook para monitoreo de performance
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<{
    renderTime: number;
    memoryUsage: number;
    cacheStats: any;
  } | null>(null);

  useEffect(() => {
    const measurePerformance = () => {
      // Tiempo de renderizado (usando Performance API)
      const renderTime = performance.now();

      // Uso de memoria (si está disponible)
      const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;

      // Estadísticas del cache
      const cacheStats = globalCache.getStats();

      setMetrics({
        renderTime,
        memoryUsage,
        cacheStats
      });
    };

    measurePerformance();

    // Monitorear cada 5 segundos
    const interval = setInterval(measurePerformance, 5000);

    return () => clearInterval(interval);
  }, []);

  return metrics;
};

// Hook para prefetch de datos
export const usePrefetch = () => {
  const prefetchedData = useRef(new Set<string>());

  const prefetch = useCallback(async (key: string, fetcher: () => Promise<any>) => {
    if (prefetchedData.current.has(key) || globalCache.has(key)) {
      return;
    }

    try {
      const data = await fetcher();
      globalCache.set(key, data);
      prefetchedData.current.add(key);
    } catch (error) {
      console.warn('Prefetch failed for key:', key, error);
    }
  }, []);

  const prefetchOnHover = useCallback((key: string, fetcher: () => Promise<any>) => {
    return {
      onMouseEnter: () => prefetch(key, fetcher),
      onFocus: () => prefetch(key, fetcher)
    };
  }, [prefetch]);

  return { prefetch, prefetchOnHover };
};

// Componente para lazy loading de componentes
export const LazyComponent: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
}> = ({ children, fallback = <div>Loading...</div>, threshold = 0.1 }) => {
  const { targetRef, hasIntersected } = useIntersectionObserver({ threshold });

  return (
    <div ref={targetRef}>
      {hasIntersected ? children : fallback}
    </div>
  );
};

// Utilidades de optimización
export const PerformanceUtils = {
  // Limpiar cache
  clearCache: () => globalCache.clear(),
  
  // Obtener estadísticas del cache
  getCacheStats: () => globalCache.getStats(),
  
  // Medir tiempo de ejecución
  measureTime: <T extends (...args: any[]) => any>(fn: T, label?: string): T => {
    return ((...args: Parameters<T>) => {
      const start = performance.now();
      const result = fn(...args);
      const end = performance.now();
      
      if (label) {
        console.log(`${label} took ${end - start}ms`);
      }
      
      return result;
    }) as T;
  },

  // Optimizar bundle con dynamic imports
  dynamicImport: <T>(importFn: () => Promise<T>) => {
    return lazy(() => importFn() as Promise<{ default: React.ComponentType<any> }>);
  },

  // Detectar soporte para características del navegador
  browserSupport: {
    webp: () => {
      const canvas = document.createElement('canvas');
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    },
    intersectionObserver: () => 'IntersectionObserver' in window,
    serviceWorker: () => 'serviceWorker' in navigator,
  }
};

export default {
  useCache,
  useDebounce,
  useThrottle,
  useIntersectionObserver,
  useVirtualScrolling,
  useImageOptimization,
  usePerformanceMonitor,
  usePrefetch,
  LazyComponent,
  PerformanceUtils
};

