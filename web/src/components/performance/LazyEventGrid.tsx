'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FixedSizeGrid as Grid, VariableSizeList as List } from 'react-window';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { OptimizedEventCard } from '@/components/events/OptimizedEventCard';
import { SkeletonGrid, EventCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Event } from '@/types';
import { debounce } from '@/lib/utils';

// ===== INTERFACES =====
interface LazyEventGridProps {
  events: Event[];
  onLoadMore?: () => Promise<Event[]>;
  hasMore?: boolean;
  loading?: boolean;
  columns?: 1 | 2 | 3 | 4;
  itemsPerPage?: number;
  virtualized?: boolean;
  className?: string;
}

interface VirtualizedItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    events: Event[];
    columns: number;
    itemWidth: number;
  };
}

// ===== CONFIGURACIÓN =====
const LOAD_MORE_THRESHOLD = 0.8; // Cargar más cuando quede 20% por hacer scroll
const ITEMS_PER_BATCH = 12;
const SKELETON_COUNT = 6;

// ===== HOOK PARA INTERSECTION OBSERVER =====
const useIntersectionObserver = (
  elementRef: React.RefObject<Element>,
  callback: () => void,
  options: IntersectionObserverInit = {}
) => {
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          callback();
        }
      },
      { threshold: 0.1, ...options }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [callback, options]);
};

// ===== COMPONENTE DE ITEM VIRTUALIZADO =====
const VirtualizedEventItem: React.FC<VirtualizedItemProps> = ({ index, style, data }) => {
  const { events, columns, itemWidth } = data;
  const startIndex = index * columns;
  const endIndex = Math.min(startIndex + columns, events.length);
  const rowEvents = events.slice(startIndex, endIndex);

  return (
    <div style={style} className="flex space-x-4 px-4">
      {rowEvents.map((event, colIndex) => (
        <div key={event.id} style={{ width: itemWidth }}>
          <OptimizedEventCard event={event} />
        </div>
      ))}
      
      {/* Rellenar espacios vacíos en la última fila */}
      {rowEvents.length < columns && (
        Array.from({ length: columns - rowEvents.length }).map((_, emptyIndex) => (
          <div key={`empty-${emptyIndex}`} style={{ width: itemWidth }} />
        ))
      )}
    </div>
  );
};

// ===== COMPONENTE PRINCIPAL =====
export const LazyEventGrid: React.FC<LazyEventGridProps> = ({
  events: initialEvents,
  onLoadMore,
  hasMore = false,
  loading = false,
  columns = 3,
  itemsPerPage = ITEMS_PER_BATCH,
  virtualized = false,
  className = ''
}) => {
  // Estados
  const [visibleEvents, setVisibleEvents] = useState<Event[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<any>(null);

  // Inicializar eventos visibles
  useEffect(() => {
    const initialBatch = initialEvents.slice(0, itemsPerPage);
    setVisibleEvents(initialBatch);
    setCurrentPage(1);
  }, [initialEvents, itemsPerPage]);

  // Función de carga más eventos con debounce
  const debouncedLoadMore = useMemo(
    () => debounce(async () => {
      if (isLoadingMore || !hasMore || !onLoadMore) return;
      
      setIsLoadingMore(true);
      setError(null);
      
      try {
        // Cargar siguiente batch de eventos locales
        const nextBatch = initialEvents.slice(
          visibleEvents.length,
          visibleEvents.length + itemsPerPage
        );
        
        // Si no hay más eventos locales, cargar desde API
        if (nextBatch.length === 0 && onLoadMore) {
          const newEvents = await onLoadMore();
          setVisibleEvents(prev => [...prev, ...newEvents]);
        } else {
          setVisibleEvents(prev => [...prev, ...nextBatch]);
        }
        
        setCurrentPage(prev => prev + 1);
        
        // Simular delay de red para mejor UX
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando más eventos');
      } finally {
        setIsLoadingMore(false);
      }
    }, 300),
    [isLoadingMore, hasMore, onLoadMore, visibleEvents, initialEvents, itemsPerPage]
  );

  // Intersection Observer para infinite scroll
  useIntersectionObserver(
    loadMoreRef,
    debouncedLoadMore,
    { threshold: 0.1 }
  );

  // Calcular dimensiones para virtualización
  const containerDimensions = useMemo(() => {
    if (!containerRef.current || !virtualized) return null;
    
    const containerWidth = containerRef.current.offsetWidth;
    const gap = 24; // 6 * 4px
    const itemWidth = (containerWidth - (gap * (columns - 1))) / columns;
    const itemHeight = 400; // Altura estimada de EventCard
    const totalRows = Math.ceil(visibleEvents.length / columns);
    
    return {
      containerWidth,
      itemWidth,
      itemHeight,
      totalRows,
      totalHeight: totalRows * (itemHeight + gap)
    };
  }, [virtualized, columns, visibleEvents.length]);

  // Renderizado virtualizado
  if (virtualized && containerDimensions && visibleEvents.length > 20) {
    return (
      <div ref={containerRef} className={`relative ${className}`}>
        <List
          ref={gridRef}
          height={Math.min(containerDimensions.totalHeight, 800)} // Máximo 800px de altura
          itemCount={containerDimensions.totalRows}
          itemSize={() => containerDimensions.itemHeight + 24}
          itemData={{
            events: visibleEvents,
            columns,
            itemWidth: containerDimensions.itemWidth
          }}
          overscanCount={2}
        >
          {VirtualizedEventItem}
        </List>
        
        {/* Load more trigger para virtualización */}
        {hasMore && (
          <div ref={loadMoreRef} className="mt-6 flex justify-center">
            {isLoadingMore && <EventCardSkeleton />}
          </div>
        )}
      </div>
    );
  }

  // Renderizado estándar con infinite scroll
  return (
    <div ref={containerRef} className={`space-y-6 ${className}`}>
      {/* Grid de eventos */}
      <AnimatePresence mode="popLayout">
        {visibleEvents.length > 0 ? (
          <motion.div
            layout
            className={`grid gap-6 ${
              columns === 1 ? 'grid-cols-1' :
              columns === 2 ? 'grid-cols-1 md:grid-cols-2' :
              columns === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
              'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            }`}
          >
            {visibleEvents.map((event, index) => (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ 
                  duration: 0.3, 
                  delay: Math.min(index * 0.05, 0.5) // Máximo delay de 0.5s
                }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: '100px' }}
              >
                <OptimizedEventCard event={event} />
              </motion.div>
            ))}
          </motion.div>
        ) : !loading && !isLoadingMore ? (
          <EmptyState
            type="events"
            title="No hay eventos disponibles"
            description="No se encontraron eventos que coincidan con tus criterios."
            primaryAction={{
              label: 'Explorar categorías',
              onClick: () => console.log('Explorar categorías')
            }}
          />
        ) : null}
      </AnimatePresence>

      {/* Loading states */}
      {loading && visibleEvents.length === 0 && (
        <SkeletonGrid 
          type="event" 
          columns={columns} 
          count={SKELETON_COUNT}
        />
      )}

      {/* Load more trigger */}
      {hasMore && visibleEvents.length > 0 && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {isLoadingMore ? (
            <div className="space-y-4">
              <SkeletonGrid 
                type="event" 
                columns={columns} 
                count={3}
              />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
              </div>
              <p className="text-gray-500 text-sm">
                Cargando más eventos...
              </p>
            </motion.div>
          )}
        </div>
      )}

      {/* Error state */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center"
        >
          <p className="text-red-800 dark:text-red-200 font-medium mb-2">
            Error cargando eventos
          </p>
          <p className="text-red-600 dark:text-red-400 text-sm mb-3">
            {error}
          </p>
          <button
            onClick={() => {
              setError(null);
              debouncedLoadMore();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Reintentar
          </button>
        </motion.div>
      )}

      {/* Información de progreso */}
      {visibleEvents.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-500 text-sm py-4"
        >
          <p>
            Mostrando {visibleEvents.length} de {initialEvents.length} eventos
            {hasMore && ' (cargando más automáticamente)'}
          </p>
          
          {/* Barra de progreso */}
          <div className="w-full max-w-xs mx-auto mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
            <motion.div
              className="bg-primary-500 h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: `${Math.min((visibleEvents.length / initialEvents.length) * 100, 100)}%` 
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};

// ===== HOOK PARA LAZY LOADING OPTIMIZADO =====
export const useLazyLoading = <T>(
  initialItems: T[],
  fetchMore: () => Promise<T[]>,
  options: {
    itemsPerBatch?: number;
    preloadThreshold?: number;
    maxItems?: number;
  } = {}
) => {
  const {
    itemsPerBatch = 12,
    preloadThreshold = 0.8,
    maxItems = 1000
  } = options;

  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inicializar con items iniciales
  useEffect(() => {
    setItems(initialItems.slice(0, itemsPerBatch));
    setHasMore(initialItems.length > itemsPerBatch);
  }, [initialItems, itemsPerBatch]);

  // Función de carga más items
  const loadMore = useCallback(async () => {
    if (loading || !hasMore || items.length >= maxItems) return;

    setLoading(true);
    setError(null);

    try {
      // Si tenemos más items locales, cargarlos primero
      const currentIndex = items.length;
      const nextBatch = initialItems.slice(currentIndex, currentIndex + itemsPerBatch);

      if (nextBatch.length > 0) {
        setItems(prev => [...prev, ...nextBatch]);
        setHasMore(currentIndex + itemsPerBatch < initialItems.length);
      } else if (fetchMore) {
        // Cargar desde API
        const newItems = await fetchMore();
        setItems(prev => [...prev, ...newItems]);
        setHasMore(newItems.length === itemsPerBatch);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando más elementos');
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, items.length, maxItems, initialItems, itemsPerBatch, fetchMore]);

  // Preload inteligente
  const checkPreload = useCallback(() => {
    if (!hasMore || loading) return;

    const scrolledPercentage = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
    
    if (scrolledPercentage >= preloadThreshold) {
      loadMore();
    }
  }, [hasMore, loading, preloadThreshold, loadMore]);

  // Listener de scroll con throttle
  useEffect(() => {
    const throttledCheck = debounce(checkPreload, 100);
    
    window.addEventListener('scroll', throttledCheck);
    window.addEventListener('resize', throttledCheck);
    
    return () => {
      window.removeEventListener('scroll', throttledCheck);
      window.removeEventListener('resize', throttledCheck);
    };
  }, [checkPreload]);

  return {
    items,
    loading,
    hasMore,
    error,
    loadMore,
    reset: () => {
      setItems(initialItems.slice(0, itemsPerBatch));
      setHasMore(initialItems.length > itemsPerBatch);
      setError(null);
    }
  };
};

// ===== COMPONENTE DE INFINITE SCROLL SIMPLE =====
export const InfiniteScrollEventList: React.FC<{
  events: Event[];
  onLoadMore?: () => Promise<Event[]>;
  hasMore?: boolean;
  loading?: boolean;
}> = ({ events, onLoadMore, hasMore, loading }) => {
  const lazyLoading = useLazyLoading(events, onLoadMore || (() => Promise.resolve([])), {
    itemsPerBatch: 8,
    preloadThreshold: 0.7
  });

  return (
    <div className="space-y-6">
      {/* Lista de eventos */}
      <div className="space-y-4">
        {lazyLoading.items.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.03, 0.3) }}
          >
            <OptimizedEventCard event={event} variant="compact" />
          </motion.div>
        ))}
      </div>

      {/* Loading indicator */}
      {lazyLoading.loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <EventCardSkeleton key={index} variant="compact" />
          ))}
        </div>
      )}

      {/* Error state */}
      {lazyLoading.error && (
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{lazyLoading.error}</p>
          <button
            onClick={lazyLoading.loadMore}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* End of list */}
      {!lazyLoading.hasMore && lazyLoading.items.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-gray-500"
        >
          <p>Has visto todos los eventos disponibles</p>
          <button
            onClick={lazyLoading.reset}
            className="mt-2 text-primary-600 hover:text-primary-700 text-sm underline"
          >
            Volver al inicio
          </button>
        </motion.div>
      )}
    </div>
  );
};

// ===== COMPONENTE DE PERFORMANCE MONITOR =====
export const PerformanceMonitor: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    memoryUsage: 0,
    fps: 0
  });

  useEffect(() => {
    // Monitor de performance
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
          setMetrics(prev => ({
            ...prev,
            renderTime: entry.duration
          }));
        }
      }
    });

    observer.observe({ entryTypes: ['measure'] });

    // Monitor de memoria (si está disponible)
    const updateMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / 1024 / 1024 // MB
        }));
      }
    };

    const memoryInterval = setInterval(updateMemory, 5000);

    // Monitor de FPS
    let lastTime = performance.now();
    let frameCount = 0;

    const updateFPS = (currentTime: number) => {
      frameCount++;
      
      if (currentTime - lastTime >= 1000) {
        setMetrics(prev => ({
          ...prev,
          fps: Math.round((frameCount * 1000) / (currentTime - lastTime))
        }));
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(updateFPS);
    };

    requestAnimationFrame(updateFPS);

    return () => {
      observer.disconnect();
      clearInterval(memoryInterval);
    };
  }, []);

  return (
    <div>
      {children}
      
      {/* Debug info en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black/80 text-white p-2 rounded text-xs font-mono">
          <div>Render: {metrics.renderTime.toFixed(1)}ms</div>
          <div>Memory: {metrics.memoryUsage.toFixed(1)}MB</div>
          <div>FPS: {metrics.fps}</div>
        </div>
      )}
    </div>
  );
};