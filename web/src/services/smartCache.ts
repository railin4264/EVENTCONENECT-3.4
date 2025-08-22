// ===== INTERFACES =====
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  tags: string[];
}

interface CacheStrategy {
  defaultTTL: number;
  maxSize: number;
  evictionPolicy: 'lru' | 'lfu' | 'ttl';
  compressionEnabled: boolean;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  maxSize: number;
  hitRate: number;
  memoryUsage: number;
}

// ===== ESTRATEGIAS POR TIPO DE DATOS =====
const CACHE_STRATEGIES: Record<string, CacheStrategy> = {
  events: {
    defaultTTL: 2 * 60 * 1000,      // 2 minutos para eventos
    maxSize: 1000,
    evictionPolicy: 'lru',
    compressionEnabled: true
  },
  users: {
    defaultTTL: 5 * 60 * 1000,      // 5 minutos para usuarios
    maxSize: 500,
    evictionPolicy: 'lfu',
    compressionEnabled: false
  },
  search: {
    defaultTTL: 30 * 1000,          // 30 segundos para búsquedas
    maxSize: 200,
    evictionPolicy: 'ttl',
    compressionEnabled: true
  },
  trending: {
    defaultTTL: 5 * 60 * 1000,      // 5 minutos para trending
    maxSize: 100,
    evictionPolicy: 'ttl',
    compressionEnabled: false
  },
  recommendations: {
    defaultTTL: 10 * 60 * 1000,     // 10 minutos para recomendaciones
    maxSize: 300,
    evictionPolicy: 'lru',
    compressionEnabled: true
  },
  static: {
    defaultTTL: 60 * 60 * 1000,     // 1 hora para datos estáticos
    maxSize: 100,
    evictionPolicy: 'lfu',
    compressionEnabled: true
  }
};

// ===== SERVICIO DE CACHÉ INTELIGENTE =====
export class SmartCacheService {
  private static caches: Map<string, Map<string, CacheItem<any>>> = new Map();
  private static stats: Map<string, CacheStats> = new Map();
  
  /**
   * Obtiene o crea una instancia de caché para un tipo específico
   */
  private static getCache(cacheType: string): Map<string, CacheItem<any>> {
    if (!this.caches.has(cacheType)) {
      this.caches.set(cacheType, new Map());
      this.stats.set(cacheType, {
        hits: 0,
        misses: 0,
        size: 0,
        maxSize: CACHE_STRATEGIES[cacheType]?.maxSize || 100,
        hitRate: 0,
        memoryUsage: 0
      });
    }
    return this.caches.get(cacheType)!;
  }

  /**
   * Guarda datos en caché con estrategia específica
   */
  static set<T>(
    cacheType: string, 
    key: string, 
    data: T, 
    customTTL?: number, 
    tags: string[] = []
  ): void {
    const cache = this.getCache(cacheType);
    const strategy = CACHE_STRATEGIES[cacheType] || CACHE_STRATEGIES.static;
    const ttl = customTTL || strategy.defaultTTL;
    
    // Comprimir datos si está habilitado
    const processedData = strategy.compressionEnabled ? this.compress(data) : data;
    
    const item: CacheItem<T> = {
      data: processedData,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccessed: Date.now(),
      tags
    };
    
    // Verificar límite de tamaño antes de añadir
    if (cache.size >= strategy.maxSize) {
      this.evict(cacheType, strategy.evictionPolicy);
    }
    
    cache.set(key, item);
    this.updateStats(cacheType, 'set');
    
    // Programar expiración automática
    setTimeout(() => {
      this.delete(cacheType, key);
    }, ttl);
  }

  /**
   * Obtiene datos del caché
   */
  static get<T>(cacheType: string, key: string): T | null {
    const cache = this.getCache(cacheType);
    const item = cache.get(key) as CacheItem<T> | undefined;
    
    if (!item) {
      this.updateStats(cacheType, 'miss');
      return null;
    }
    
    const now = Date.now();
    
    // Verificar si ha expirado
    if (now - item.timestamp > item.ttl) {
      cache.delete(key);
      this.updateStats(cacheType, 'miss');
      return null;
    }
    
    // Actualizar estadísticas de acceso
    item.accessCount++;
    item.lastAccessed = now;
    
    this.updateStats(cacheType, 'hit');
    
    // Descomprimir si es necesario
    const strategy = CACHE_STRATEGIES[cacheType] || CACHE_STRATEGIES.static;
    return strategy.compressionEnabled ? this.decompress(item.data) : item.data;
  }

  /**
   * Elimina elemento del caché
   */
  static delete(cacheType: string, key: string): boolean {
    const cache = this.getCache(cacheType);
    const deleted = cache.delete(key);
    
    if (deleted) {
      this.updateStats(cacheType, 'delete');
    }
    
    return deleted;
  }

  /**
   * Limpia caché por tags
   */
  static invalidateByTags(cacheType: string, tags: string[]): number {
    const cache = this.getCache(cacheType);
    let deletedCount = 0;
    
    for (const [key, item] of cache.entries()) {
      const hasMatchingTag = tags.some(tag => item.tags.includes(tag));
      if (hasMatchingTag) {
        cache.delete(key);
        deletedCount++;
      }
    }
    
    this.updateStats(cacheType, 'invalidate', deletedCount);
    return deletedCount;
  }

  /**
   * Estrategias de expulsión
   */
  private static evict(cacheType: string, policy: CacheStrategy['evictionPolicy']): void {
    const cache = this.getCache(cacheType);
    
    if (cache.size === 0) return;
    
    let keyToEvict: string;
    
    switch (policy) {
      case 'lru': // Least Recently Used
        keyToEvict = this.findLRUKey(cache);
        break;
      case 'lfu': // Least Frequently Used
        keyToEvict = this.findLFUKey(cache);
        break;
      case 'ttl': // Time To Live (más antiguo)
        keyToEvict = this.findOldestKey(cache);
        break;
      default:
        keyToEvict = cache.keys().next().value;
    }
    
    cache.delete(keyToEvict);
    this.updateStats(cacheType, 'evict');
  }

  /**
   * Encuentra clave menos recientemente usada
   */
  private static findLRUKey(cache: Map<string, CacheItem<any>>): string {
    let oldestKey = '';
    let oldestTime = Date.now();
    
    for (const [key, item] of cache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldestKey = key;
      }
    }
    
    return oldestKey;
  }

  /**
   * Encuentra clave menos frecuentemente usada
   */
  private static findLFUKey(cache: Map<string, CacheItem<any>>): string {
    let leastUsedKey = '';
    let leastCount = Infinity;
    
    for (const [key, item] of cache.entries()) {
      if (item.accessCount < leastCount) {
        leastCount = item.accessCount;
        leastUsedKey = key;
      }
    }
    
    return leastUsedKey;
  }

  /**
   * Encuentra clave más antigua
   */
  private static findOldestKey(cache: Map<string, CacheItem<any>>): string {
    let oldestKey = '';
    let oldestTime = Date.now();
    
    for (const [key, item] of cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    }
    
    return oldestKey;
  }

  /**
   * Compresión simple de datos (simulada)
   */
  private static compress<T>(data: T): T {
    // En una implementación real, usarías LZ4, gzip, etc.
    return data;
  }

  /**
   * Descompresión de datos
   */
  private static decompress<T>(data: T): T {
    return data;
  }

  /**
   * Actualiza estadísticas del caché
   */
  private static updateStats(
    cacheType: string, 
    operation: 'hit' | 'miss' | 'set' | 'delete' | 'evict' | 'invalidate',
    count: number = 1
  ): void {
    const stats = this.stats.get(cacheType);
    if (!stats) return;
    
    switch (operation) {
      case 'hit':
        stats.hits += count;
        break;
      case 'miss':
        stats.misses += count;
        break;
      case 'delete':
      case 'evict':
        stats.size = Math.max(0, stats.size - count);
        break;
      case 'set':
        stats.size += count;
        break;
      case 'invalidate':
        stats.size = Math.max(0, stats.size - count);
        break;
    }
    
    // Calcular hit rate
    const totalRequests = stats.hits + stats.misses;
    stats.hitRate = totalRequests > 0 ? (stats.hits / totalRequests) * 100 : 0;
    
    // Actualizar tamaño actual
    const cache = this.getCache(cacheType);
    stats.size = cache.size;
  }

  /**
   * Obtiene estadísticas del caché
   */
  static getStats(cacheType: string): CacheStats | null {
    return this.stats.get(cacheType) || null;
  }

  /**
   * Obtiene estadísticas de todos los cachés
   */
  static getAllStats(): Record<string, CacheStats> {
    const allStats: Record<string, CacheStats> = {};
    
    for (const [cacheType, stats] of this.stats.entries()) {
      allStats[cacheType] = { ...stats };
    }
    
    return allStats;
  }

  /**
   * Limpia cachés expirados
   */
  static cleanup(): number {
    let totalCleaned = 0;
    const now = Date.now();
    
    for (const [cacheType, cache] of this.caches.entries()) {
      let cleaned = 0;
      
      for (const [key, item] of cache.entries()) {
        if (now - item.timestamp > item.ttl) {
          cache.delete(key);
          cleaned++;
        }
      }
      
      if (cleaned > 0) {
        this.updateStats(cacheType, 'delete', cleaned);
        totalCleaned += cleaned;
      }
    }
    
    return totalCleaned;
  }

  /**
   * Limpia todo el caché
   */
  static clear(cacheType?: string): void {
    if (cacheType) {
      const cache = this.getCache(cacheType);
      cache.clear();
      
      const stats = this.stats.get(cacheType);
      if (stats) {
        stats.size = 0;
      }
    } else {
      this.caches.clear();
      this.stats.clear();
    }
  }

  // ===== MÉTODOS ESPECIALIZADOS =====

  /**
   * Caché específico para eventos
   */
  static cacheEvents(events: any[], location?: { city: string }): void {
    // Cache general
    this.set('events', 'all', events, undefined, ['events', 'all']);
    
    // Cache por categoría
    const byCategory = events.reduce((acc, event) => {
      if (!acc[event.category]) acc[event.category] = [];
      acc[event.category].push(event);
      return acc;
    }, {} as Record<string, any[]>);
    
    Object.entries(byCategory).forEach(([category, categoryEvents]) => {
      this.set('events', `category:${category}`, categoryEvents, 5 * 60 * 1000, ['events', 'category', category]);
    });
    
    // Cache por ubicación si está disponible
    if (location) {
      const localEvents = events.filter(event => {
        if (typeof event.location === 'string') {
          return event.location.toLowerCase().includes(location.city.toLowerCase());
        }
        return event.location?.city?.toLowerCase() === location.city.toLowerCase();
      });
      
      this.set('events', `location:${location.city}`, localEvents, 3 * 60 * 1000, ['events', 'location', location.city]);
    }
  }

  /**
   * Obtiene eventos por categoría desde caché
   */
  static getEventsByCategory(category: string): any[] | null {
    return this.get('events', `category:${category}`);
  }

  /**
   * Obtiene eventos locales desde caché
   */
  static getLocalEvents(city: string): any[] | null {
    return this.get('events', `location:${city}`);
  }

  /**
   * Caché para búsquedas
   */
  static cacheSearchResults(query: string, filters: any, results: any[]): void {
    const searchKey = this.generateSearchKey(query, filters);
    this.set('search', searchKey, results, undefined, ['search', query]);
  }

  /**
   * Obtiene resultados de búsqueda desde caché
   */
  static getSearchResults(query: string, filters: any): any[] | null {
    const searchKey = this.generateSearchKey(query, filters);
    return this.get('search', searchKey);
  }

  /**
   * Caché para recomendaciones personalizadas
   */
  static cacheRecommendations(userId: string, recommendations: any[], context?: any): void {
    const contextKey = context ? this.hashObject(context) : 'default';
    this.set('recommendations', `${userId}:${contextKey}`, recommendations, undefined, ['recommendations', userId]);
  }

  /**
   * Obtiene recomendaciones desde caché
   */
  static getRecommendations(userId: string, context?: any): any[] | null {
    const contextKey = context ? this.hashObject(context) : 'default';
    return this.get('recommendations', `${userId}:${contextKey}`);
  }

  /**
   * Invalida caché relacionado con un evento específico
   */
  static invalidateEvent(eventId: string): void {
    // Invalidar por tags relacionadas
    this.invalidateByTags('events', ['events', eventId]);
    this.invalidateByTags('search', ['search']);
    this.invalidateByTags('recommendations', ['recommendations']);
    this.invalidateByTags('trending', ['trending']);
  }

  /**
   * Invalida caché relacionado con un usuario específico
   */
  static invalidateUser(userId: string): void {
    this.invalidateByTags('users', ['users', userId]);
    this.invalidateByTags('recommendations', ['recommendations', userId]);
  }

  /**
   * Precargar datos frecuentemente accedidos
   */
  static async preloadFrequentData(): Promise<void> {
    try {
      // Precargar categorías populares
      const popularCategories = ['Música', 'Tecnología', 'Gastronomía', 'Arte'];
      
      for (const category of popularCategories) {
        // Simular carga de datos
        const categoryEvents = await this.fetchCategoryEvents(category);
        this.set('events', `category:${category}`, categoryEvents, 10 * 60 * 1000, ['events', 'category', category]);
      }
      
      console.log('✅ Datos frecuentes precargados');
    } catch (error) {
      console.error('❌ Error precargando datos:', error);
    }
  }

  /**
   * Optimización automática del caché
   */
  static optimize(): void {
    const allStats = this.getAllStats();
    
    Object.entries(allStats).forEach(([cacheType, stats]) => {
      // Si el hit rate es bajo, incrementar TTL
      if (stats.hitRate < 50 && stats.hits + stats.misses > 10) {
        const strategy = CACHE_STRATEGIES[cacheType];
        if (strategy) {
          strategy.defaultTTL = Math.min(strategy.defaultTTL * 1.5, 30 * 60 * 1000);
          console.log(`🔧 TTL incrementado para ${cacheType}: ${strategy.defaultTTL}ms`);
        }
      }
      
      // Si está muy lleno, limpiar elementos antiguos
      if (stats.size > stats.maxSize * 0.9) {
        this.cleanup();
        console.log(`🧹 Limpieza automática ejecutada para ${cacheType}`);
      }
    });
  }

  // ===== HELPERS PRIVADOS =====

  /**
   * Genera clave única para búsqueda
   */
  private static generateSearchKey(query: string, filters: any): string {
    const filterString = JSON.stringify(filters, Object.keys(filters).sort());
    return `${query.toLowerCase().trim()}:${this.hashString(filterString)}`;
  }

  /**
   * Genera hash simple de objeto
   */
  private static hashObject(obj: any): string {
    return this.hashString(JSON.stringify(obj, Object.keys(obj).sort()));
  }

  /**
   * Genera hash simple de string
   */
  private static hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Simula fetch de eventos por categoría
   */
  private static async fetchCategoryEvents(category: string): Promise<any[]> {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Retornar datos mock
    return [
      {
        id: `${category}-1`,
        title: `Evento de ${category} 1`,
        category,
        date: new Date().toISOString(),
        attendees: Math.floor(Math.random() * 100) + 10
      }
    ];
  }

  // ===== INICIALIZACIÓN Y LIMPIEZA =====

  /**
   * Inicializa el sistema de caché
   */
  static initialize(): void {
    // Limpiar caché expirado cada 5 minutos
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
    
    // Optimizar caché cada 15 minutos
    setInterval(() => {
      this.optimize();
    }, 15 * 60 * 1000);
    
    // Precargar datos frecuentes
    this.preloadFrequentData();
    
    console.log('🚀 SmartCache inicializado');
  }

  /**
   * Obtiene información de debug
   */
  static getDebugInfo(): any {
    const debug: any = {
      caches: {},
      totalMemory: 0,
      totalItems: 0
    };
    
    for (const [cacheType, cache] of this.caches.entries()) {
      const stats = this.stats.get(cacheType);
      debug.caches[cacheType] = {
        size: cache.size,
        stats,
        items: Array.from(cache.keys()).slice(0, 5) // Primeras 5 claves
      };
      debug.totalItems += cache.size;
    }
    
    return debug;
  }
}