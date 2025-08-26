import { InteractionManager, Dimensions, PixelRatio } from 'react-native';
import { debounce, throttle } from 'lodash';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * Optimizador de rendimiento para EventConnect Mobile
 */
export class PerformanceOptimizer {
  static instance = null;

  constructor() {
    if (PerformanceOptimizer.instance) {
      return PerformanceOptimizer.instance;
    }

    this.imageCache = new Map();
    this.componentCache = new Map();
    this.performanceMetrics = {
      renderTimes: [],
      apiCallTimes: [],
      navigationTimes: [],
    };

    PerformanceOptimizer.instance = this;
  }

  /**
   * Optimización de imágenes
   */
  static optimizeImageUri(uri, width = screenWidth, height = 300) {
    if (!uri) return null;

    // Calcular tamaño óptimo basado en la densidad de píxeles
    const pixelRatio = PixelRatio.get();
    const optimalWidth = Math.round(width * pixelRatio);
    const optimalHeight = Math.round(height * pixelRatio);

    // Si es una URL de Unsplash, agregar parámetros de optimización
    if (uri.includes('unsplash.com')) {
      return `${uri}&w=${optimalWidth}&h=${optimalHeight}&fit=crop&auto=format&q=80`;
    }

    // Si es una URL de Cloudinary, agregar transformaciones
    if (uri.includes('cloudinary.com')) {
      const baseUrl = uri.split('/upload/')[0];
      const imagePath = uri.split('/upload/')[1];
      return `${baseUrl}/upload/w_${optimalWidth},h_${optimalHeight},c_fill,f_auto,q_auto/${imagePath}`;
    }

    return uri;
  }

  /**
   * Lazy loading para componentes pesados
   */
  static createLazyComponent(componentLoader, fallbackComponent = null) {
    return React.lazy(() => {
      return new Promise((resolve) => {
        InteractionManager.runAfterInteractions(() => {
          resolve(componentLoader());
        });
      });
    });
  }

  /**
   * Debounced search
   */
  static createDebouncedSearch(searchFunction, delay = 300) {
    return debounce(searchFunction, delay, {
      leading: false,
      trailing: true,
    });
  }

  /**
   * Throttled scroll handler
   */
  static createThrottledScrollHandler(scrollFunction, limit = 100) {
    return throttle(scrollFunction, limit, {
      leading: true,
      trailing: false,
    });
  }

  /**
   * Optimización de FlatList
   */
  static getFlatListProps(itemHeight = 200) {
    return {
      removeClippedSubviews: true,
      maxToRenderPerBatch: 10,
      updateCellsBatchingPeriod: 50,
      initialNumToRender: 8,
      windowSize: 7,
      getItemLayout: (data, index) => ({
        length: itemHeight,
        offset: itemHeight * index,
        index,
      }),
      keyExtractor: (item, index) => `${item.id || index}`,
    };
  }

  /**
   * Optimización de memoria para imágenes
   */
  static getOptimalImageProps() {
    return {
      resizeMode: 'cover',
      progressiveRenderingEnabled: true,
      fadeDuration: 200,
      cache: 'force-cache',
      priority: 'normal',
    };
  }

  /**
   * Memoización de componentes complejos
   */
  static memoizeComponent(Component, areEqual = null) {
    return React.memo(Component, areEqual || ((prevProps, nextProps) => {
      // Comparación superficial por defecto
      const prevKeys = Object.keys(prevProps);
      const nextKeys = Object.keys(nextProps);
      
      if (prevKeys.length !== nextKeys.length) return false;
      
      return prevKeys.every(key => prevProps[key] === nextProps[key]);
    }));
  }

  /**
   * Optimización de navegación
   */
  static optimizeNavigation() {
    return {
      // Cargar pantallas de forma lazy
      lazy: true,
      // No desmontar pantallas para mejor performance
      unmountOnBlur: false,
      // Freezar pantallas inactivas para ahorrar CPU
      freezeOnBlur: true,
      // Animaciones optimizadas
      gestureResponseDistance: {
        horizontal: 50,
        vertical: 135,
      },
      transitionSpec: {
        open: {
          animation: 'timing',
          config: {
            duration: 250,
            useNativeDriver: true,
          },
        },
        close: {
          animation: 'timing',
          config: {
            duration: 200,
            useNativeDriver: true,
          },
        },
      },
    };
  }

  /**
   * Optimización de estado global
   */
  static optimizeStateUpdates(setState) {
    return debounce(setState, 50, {
      leading: false,
      trailing: true,
      maxWait: 100,
    });
  }

  /**
   * Métricas de rendimiento
   */
  static startPerformanceTimer(label) {
    return {
      label,
      startTime: Date.now(),
      end: function() {
        const endTime = Date.now();
        const duration = endTime - this.startTime;
        console.log(`⚡ Performance [${this.label}]: ${duration}ms`);
        return duration;
      }
    };
  }

  /**
   * Optimización de API calls
   */
  static optimizeApiCall(apiFunction, cacheKey, cacheTime = 300000) { // 5 minutos
    return async (...args) => {
      const timer = this.startPerformanceTimer(`API Call: ${cacheKey}`);
      
      // Verificar cache
      const cached = this.getCachedData(cacheKey);
      if (cached && !this.isCacheExpired(cached, cacheTime)) {
        timer.end();
        return cached.data;
      }

      try {
        const data = await apiFunction(...args);
        this.setCachedData(cacheKey, data);
        timer.end();
        return data;
      } catch (error) {
        timer.end();
        throw error;
      }
    };
  }

  /**
   * Cache management
   */
  setCachedData(key, data) {
    this.componentCache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  getCachedData(key) {
    return this.componentCache.get(key);
  }

  isCacheExpired(cached, maxAge) {
    return Date.now() - cached.timestamp > maxAge;
  }

  clearCache() {
    this.componentCache.clear();
    this.imageCache.clear();
  }

  /**
   * Optimización de búsqueda
   */
  static createOptimizedSearch(searchFunction) {
    let searchTimeout;
    let lastQuery = '';
    
    return (query) => {
      // Evitar búsquedas duplicadas
      if (query === lastQuery) return;
      lastQuery = query;

      // Limpiar timeout anterior
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // Búsqueda inmediata para queries cortas
      if (query.length <= 2) {
        return searchFunction(query);
      }

      // Debounce para queries largas
      searchTimeout = setTimeout(() => {
        searchFunction(query);
      }, 300);
    };
  }

  /**
   * Optimización de scroll infinito
   */
  static createInfiniteScrollHandler(loadMore, threshold = 0.7) {
    let isLoading = false;

    return throttle(({ layoutMeasurement, contentOffset, contentSize }) => {
      if (isLoading) return;

      const isCloseToBottom = layoutMeasurement.height + contentOffset.y 
        >= contentSize.height * threshold;

      if (isCloseToBottom) {
        isLoading = true;
        loadMore().finally(() => {
          isLoading = false;
        });
      }
    }, 1000);
  }

  /**
   * Optimización de animaciones
   */
  static getOptimizedAnimationProps() {
    return {
      useNativeDriver: true,
      isInteraction: false,
      // Reducir animaciones en dispositivos lentos
      duration: PixelRatio.get() > 2 ? 250 : 150,
    };
  }

  /**
   * Bundle splitting para código
   */
  static loadModuleWhenNeeded(moduleLoader) {
    return new Promise((resolve) => {
      InteractionManager.runAfterInteractions(() => {
        resolve(moduleLoader());
      });
    });
  }
}

// Instancia global
export const performanceOptimizer = new PerformanceOptimizer();

// Hooks personalizados para optimización
export const useOptimizedImage = (uri, width, height) => {
  return React.useMemo(() => 
    PerformanceOptimizer.optimizeImageUri(uri, width, height),
    [uri, width, height]
  );
};

export const useDebounced = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

export const useThrottled = (callback, delay) => {
  return React.useCallback(
    throttle(callback, delay, { leading: true, trailing: false }),
    [callback, delay]
  );
};

export default PerformanceOptimizer;


