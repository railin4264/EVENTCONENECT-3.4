import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/netinfo';
import { AppState } from 'react-native';

// Configuración del cache offline
const CACHE_CONFIG = {
  EXPIRY_TIME: 24 * 60 * 60 * 1000, // 24 horas
  MAX_CACHE_SIZE: 50 * 1024 * 1024, // 50MB
  SYNC_BATCH_SIZE: 20,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 2000, // 2 segundos
};

// Tipos de datos que se pueden cachear
const CACHE_TYPES = {
  EVENTS: 'events',
  TRIBES: 'tribes',
  MESSAGES: 'messages',
  USER_PROFILE: 'user_profile',
  FRIENDS: 'friends',
  PHOTOS: 'photos',
  SETTINGS: 'settings'
};

// Estados de sincronización
const SYNC_STATES = {
  IDLE: 'idle',
  SYNCING: 'syncing',
  ERROR: 'error',
  SUCCESS: 'success'
};

class OfflineManager {
  constructor() {
    this.isOnline = true;
    this.syncQueue = [];
    this.syncState = SYNC_STATES.IDLE;
    this.listeners = [];
    this.lastSyncTime = null;
    this.pendingOperations = new Map();
  }

  // Inicializar el manager offline
  async initialize() {
    try {
      // Verificar conectividad inicial
      const netState = await NetInfo.fetch();
      this.isOnline = netState.isConnected;

      // Configurar listener de conectividad
      this.setupNetworkListener();

      // Configurar listener de estado de la app
      this.setupAppStateListener();

      // Cargar cola de sincronización pendiente
      await this.loadSyncQueue();

      // Limpiar cache expirado
      await this.cleanExpiredCache();

      console.log('OfflineManager initialized successfully');
    } catch (error) {
      console.error('Error initializing OfflineManager:', error);
    }
  }

  // Configurar listener de conectividad
  setupNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected;

      if (wasOffline && this.isOnline) {
        console.log('Back online, starting sync...');
        this.onBackOnline();
      } else if (!this.isOnline) {
        console.log('Gone offline');
        this.onGoOffline();
      }

      // Notificar a los listeners
      this.notifyListeners({ isOnline: this.isOnline, connectionType: state.type });
    });
  }

  // Configurar listener de estado de la app
  setupAppStateListener() {
    AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && this.isOnline) {
        // App volvió a primer plano, intentar sincronizar
        this.syncPendingOperations();
      }
    });
  }

  // Guardar datos en cache
  async cacheData(type, key, data, metadata = {}) {
    try {
      const cacheEntry = {
        data,
        timestamp: Date.now(),
        type,
        metadata: {
          version: '1.0',
          source: 'api',
          ...metadata
        }
      };

      const cacheKey = `offline_cache_${type}_${key}`;
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheEntry));

      // Actualizar índice de cache
      await this.updateCacheIndex(type, key);

      return true;
    } catch (error) {
      console.error('Error caching data:', error);
      return false;
    }
  }

  // Obtener datos del cache
  async getCachedData(type, key, maxAge = CACHE_CONFIG.EXPIRY_TIME) {
    try {
      const cacheKey = `offline_cache_${type}_${key}`;
      const cachedData = await AsyncStorage.getItem(cacheKey);

      if (!cachedData) return null;

      const cacheEntry = JSON.parse(cachedData);
      const age = Date.now() - cacheEntry.timestamp;

      // Verificar si el cache no ha expirado
      if (age > maxAge) {
        await this.removeCachedData(type, key);
        return null;
      }

      return {
        ...cacheEntry.data,
        _cached: true,
        _cacheAge: age,
        _cacheMetadata: cacheEntry.metadata
      };
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }

  // Eliminar datos del cache
  async removeCachedData(type, key) {
    try {
      const cacheKey = `offline_cache_${type}_${key}`;
      await AsyncStorage.removeItem(cacheKey);
      await this.removeFromCacheIndex(type, key);
    } catch (error) {
      console.error('Error removing cached data:', error);
    }
  }

  // Agregar operación a la cola de sincronización
  async addToSyncQueue(operation) {
    try {
      const syncItem = {
        id: Date.now() + Math.random(),
        timestamp: Date.now(),
        attempts: 0,
        ...operation
      };

      this.syncQueue.push(syncItem);
      await this.saveSyncQueue();

      // Si estamos online, intentar sincronizar inmediatamente
      if (this.isOnline) {
        this.syncPendingOperations();
      }

      return syncItem.id;
    } catch (error) {
      console.error('Error adding to sync queue:', error);
      return null;
    }
  }

  // Sincronizar operaciones pendientes
  async syncPendingOperations() {
    if (!this.isOnline || this.syncState === SYNC_STATES.SYNCING) {
      return;
    }

    this.syncState = SYNC_STATES.SYNCING;
    this.notifyListeners({ syncState: this.syncState });

    try {
      const batch = this.syncQueue.slice(0, CACHE_CONFIG.SYNC_BATCH_SIZE);
      const failedOperations = [];

      for (const operation of batch) {
        try {
          await this.executeOperation(operation);
          
          // Remover operación exitosa de la cola
          this.syncQueue = this.syncQueue.filter(op => op.id !== operation.id);
        } catch (error) {
          console.error('Sync operation failed:', error);
          
          operation.attempts++;
          operation.lastError = error.message;

          if (operation.attempts >= CACHE_CONFIG.RETRY_ATTEMPTS) {
            // Operación fallida definitivamente
            this.syncQueue = this.syncQueue.filter(op => op.id !== operation.id);
            failedOperations.push(operation);
          } else {
            // Reintentar más tarde
            failedOperations.push(operation);
          }
        }
      }

      await this.saveSyncQueue();

      this.syncState = failedOperations.length > 0 ? SYNC_STATES.ERROR : SYNC_STATES.SUCCESS;
      this.lastSyncTime = Date.now();

    } catch (error) {
      console.error('Error during sync:', error);
      this.syncState = SYNC_STATES.ERROR;
    }

    this.notifyListeners({ 
      syncState: this.syncState, 
      lastSyncTime: this.lastSyncTime,
      pendingCount: this.syncQueue.length 
    });
  }

  // Ejecutar operación específica
  async executeOperation(operation) {
    const { type, method, url, data, headers } = operation;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: data ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  // Manejar cuando volvemos online
  async onBackOnline() {
    // Sincronizar datos pendientes
    await this.syncPendingOperations();

    // Actualizar datos críticos
    await this.refreshCriticalData();
  }

  // Manejar cuando nos vamos offline
  onGoOffline() {
    // Guardar estado actual
    this.saveSyncQueue();
    
    // Notificar a componentes que estamos offline
    this.notifyListeners({ isOnline: false, message: 'Modo offline activado' });
  }

  // Actualizar datos críticos cuando volvemos online
  async refreshCriticalData() {
    try {
      // Lista de datos críticos que se deben actualizar
      const criticalData = [
        { type: CACHE_TYPES.USER_PROFILE, key: 'current_user' },
        { type: CACHE_TYPES.EVENTS, key: 'upcoming_events' },
        { type: CACHE_TYPES.MESSAGES, key: 'recent_messages' }
      ];

      for (const item of criticalData) {
        try {
          // Aquí iría la lógica específica para actualizar cada tipo de dato
          await this.refreshDataType(item.type, item.key);
        } catch (error) {
          console.error(`Error refreshing ${item.type}:`, error);
        }
      }
    } catch (error) {
      console.error('Error refreshing critical data:', error);
    }
  }

  // Refrescar tipo específico de datos
  async refreshDataType(type, key) {
    // Esta función sería implementada según las necesidades específicas
    // Por ejemplo, para eventos:
    if (type === CACHE_TYPES.EVENTS) {
      // Llamar a la API de eventos y actualizar cache
    }
  }

  // Gestión del índice de cache
  async updateCacheIndex(type, key) {
    try {
      const indexKey = `cache_index_${type}`;
      const existingIndex = await AsyncStorage.getItem(indexKey);
      const index = existingIndex ? JSON.parse(existingIndex) : [];

      if (!index.includes(key)) {
        index.push(key);
        await AsyncStorage.setItem(indexKey, JSON.stringify(index));
      }
    } catch (error) {
      console.error('Error updating cache index:', error);
    }
  }

  async removeFromCacheIndex(type, key) {
    try {
      const indexKey = `cache_index_${type}`;
      const existingIndex = await AsyncStorage.getItem(indexKey);
      
      if (existingIndex) {
        const index = JSON.parse(existingIndex);
        const updatedIndex = index.filter(item => item !== key);
        await AsyncStorage.setItem(indexKey, JSON.stringify(updatedIndex));
      }
    } catch (error) {
      console.error('Error removing from cache index:', error);
    }
  }

  // Limpiar cache expirado
  async cleanExpiredCache() {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith('offline_cache_'));
      const now = Date.now();
      let totalCleaned = 0;

      for (const key of cacheKeys) {
        try {
          const cachedData = await AsyncStorage.getItem(key);
          if (cachedData) {
            const cacheEntry = JSON.parse(cachedData);
            const age = now - cacheEntry.timestamp;

            if (age > CACHE_CONFIG.EXPIRY_TIME) {
              await AsyncStorage.removeItem(key);
              totalCleaned++;
            }
          }
        } catch (error) {
          // Si hay error parseando, eliminar la entrada corrupta
          await AsyncStorage.removeItem(key);
          totalCleaned++;
        }
      }

      console.log(`Cleaned ${totalCleaned} expired cache entries`);
    } catch (error) {
      console.error('Error cleaning expired cache:', error);
    }
  }

  // Obtener estadísticas del cache
  async getCacheStats() {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith('offline_cache_'));
      
      let totalSize = 0;
      let totalEntries = 0;
      const typeStats = {};

      for (const key of cacheKeys) {
        try {
          const data = await AsyncStorage.getItem(key);
          if (data) {
            totalSize += new Blob([data]).size;
            totalEntries++;

            // Extraer tipo del cache key
            const match = key.match(/offline_cache_(\w+)_/);
            if (match) {
              const type = match[1];
              typeStats[type] = (typeStats[type] || 0) + 1;
            }
          }
        } catch (error) {
          console.error(`Error reading cache key ${key}:`, error);
        }
      }

      return {
        totalSize,
        totalEntries,
        typeStats,
        syncQueueSize: this.syncQueue.length,
        lastSyncTime: this.lastSyncTime,
        isOnline: this.isOnline
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return null;
    }
  }

  // Limpiar todo el cache
  async clearAllCache() {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith('offline_cache_'));
      
      await AsyncStorage.multiRemove(cacheKeys);
      
      console.log(`Cleared ${cacheKeys.length} cache entries`);
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  }

  // Guardar cola de sincronización
  async saveSyncQueue() {
    try {
      await AsyncStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Error saving sync queue:', error);
    }
  }

  // Cargar cola de sincronización
  async loadSyncQueue() {
    try {
      const queueData = await AsyncStorage.getItem('sync_queue');
      this.syncQueue = queueData ? JSON.parse(queueData) : [];
    } catch (error) {
      console.error('Error loading sync queue:', error);
      this.syncQueue = [];
    }
  }

  // Sistema de listeners
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  notifyListeners(data) {
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in offline manager listener:', error);
      }
    });
  }

  // Métodos de utilidad pública
  getConnectionStatus() {
    return {
      isOnline: this.isOnline,
      syncState: this.syncState,
      pendingOperations: this.syncQueue.length,
      lastSyncTime: this.lastSyncTime
    };
  }

  // Forzar sincronización
  async forcSync() {
    if (this.isOnline) {
      await this.syncPendingOperations();
    } else {
      throw new Error('Cannot sync while offline');
    }
  }
}

// Hook para usar el manager offline
export const useOfflineManager = () => {
  const [manager] = useState(() => new OfflineManager());
  const [connectionStatus, setConnectionStatus] = useState({
    isOnline: true,
    syncState: SYNC_STATES.IDLE,
    pendingOperations: 0,
    lastSyncTime: null
  });

  useEffect(() => {
    const initializeManager = async () => {
      await manager.initialize();
      setConnectionStatus(manager.getConnectionStatus());
    };

    initializeManager();

    // Suscribirse a cambios
    const unsubscribe = manager.addListener((data) => {
      setConnectionStatus(prev => ({ ...prev, ...data }));
    });

    return unsubscribe;
  }, [manager]);

  const cacheData = (type, key, data, metadata) => {
    return manager.cacheData(type, key, data, metadata);
  };

  const getCachedData = (type, key, maxAge) => {
    return manager.getCachedData(type, key, maxAge);
  };

  const addToSyncQueue = (operation) => {
    return manager.addToSyncQueue(operation);
  };

  const getCacheStats = () => {
    return manager.getCacheStats();
  };

  const clearCache = () => {
    return manager.clearAllCache();
  };

  const forceSync = () => {
    return manager.forcSync();
  };

  return {
    ...connectionStatus,
    cacheData,
    getCachedData,
    addToSyncQueue,
    getCacheStats,
    clearCache,
    forceSync,
  };
};

export default OfflineManager;
export { CACHE_TYPES, SYNC_STATES, CACHE_CONFIG };

