/**
 * API Helper utilities for EventConnect Web Frontend
 * Enhanced error handling, retry logic, and request optimizations
 */

import { ApiResponse } from '@/lib/api';

// Type definitions
export interface RetryOptions {
  maxRetries?: number;
  backoffMs?: number;
  retryOn?: number[];
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  key?: string;
}

// In-memory cache for API responses
const cache = new Map<string, { data: any; expires: number }>();

/**
 * Enhanced fetch with retry logic and error handling
 */
export async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<ApiResponse<T>> {
  const {
    maxRetries = 3,
    backoffMs = 1000,
    retryOn = [500, 502, 503, 504, 408, 429]
  } = retryOptions;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      // Check if we should retry on this status
      if (attempt < maxRetries && retryOn.includes(response.status)) {
        await delay(backoffMs * Math.pow(2, attempt)); // Exponential backoff
        continue;
      }

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries) {
        await delay(backoffMs * Math.pow(2, attempt));
        continue;
      }
    }
  }

  return {
    success: false,
    error: lastError?.message || 'Network error after retries',
  };
}

/**
 * Cached fetch with TTL support
 */
export async function fetchWithCache<T>(
  url: string,
  options: RequestInit = {},
  cacheOptions: CacheOptions = {}
): Promise<ApiResponse<T>> {
  const { ttl = 5 * 60 * 1000, key } = cacheOptions; // 5 minutes default
  const cacheKey = key || `${options.method || 'GET'}_${url}_${JSON.stringify(options.body || {})}`;

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return {
      success: true,
      data: cached.data,
    };
  }

  // Fetch fresh data
  const result = await fetchWithRetry<T>(url, options);
  
  // Cache successful responses
  if (result.success && result.data) {
    cache.set(cacheKey, {
      data: result.data,
      expires: Date.now() + ttl,
    });
  }

  return result;
}

/**
 * Batch API requests with concurrency control
 */
export async function batchRequests<T>(
  requests: Array<() => Promise<ApiResponse<T>>>,
  concurrency: number = 5
): Promise<Array<ApiResponse<T>>> {
  const results: Array<ApiResponse<T>> = [];
  
  for (let i = 0; i < requests.length; i += concurrency) {
    const batch = requests.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(request => request()));
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * Upload files with progress tracking
 */
export async function uploadWithProgress(
  url: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<ApiResponse<any>> {
  return new Promise((resolve) => {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = (event.loaded / event.total) * 100;
        onProgress(Math.round(progress));
      }
    });

    xhr.addEventListener('load', () => {
      try {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({
            success: true,
            data: response.data || response,
          });
        } else {
          resolve({
            success: false,
            error: response.error || `HTTP ${xhr.status}`,
          });
        }
      } catch (error) {
        resolve({
          success: false,
          error: 'Invalid response format',
        });
      }
    });

    xhr.addEventListener('error', () => {
      resolve({
        success: false,
        error: 'Upload failed',
      });
    });

    xhr.open('POST', url);
    
    // Add authorization header if available
    const token = localStorage.getItem('authToken');
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    xhr.send(formData);
  });
}

/**
 * Optimistic updates helper
 */
export function createOptimisticUpdate<T>(
  queryKey: string,
  updateFn: (oldData: T) => T,
  revertFn: (oldData: T) => T
) {
  return {
    onMutate: async (variables: any) => {
      // Cancel outgoing refetches
      // await queryClient.cancelQueries({ queryKey: [queryKey] });

      // Snapshot previous value
      // const previousData = queryClient.getQueryData([queryKey]);

      // Optimistically update
      // queryClient.setQueryData([queryKey], updateFn);

      // Return context with previous and new data
      return { previousData: null, newData: variables };
    },
    
    onError: (err: any, variables: any, context: any) => {
      // Revert on error
      if (context?.previousData) {
        // queryClient.setQueryData([queryKey], context.previousData);
      }
    },
    
    onSettled: () => {
      // Always refetch after error or success
      // queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
  };
}

/**
 * API error handler with user-friendly messages
 */
export function handleApiError(error: any): string {
  if (typeof error === 'string') return error;
  
  // Network errors
  if (error?.message?.includes('fetch')) {
    return 'No se pudo conectar al servidor. Verifica tu conexión.';
  }
  
  // HTTP status errors
  switch (error?.status) {
    case 400:
      return 'Datos inválidos. Verifica la información enviada.';
    case 401:
      return 'Sesión expirada. Por favor, inicia sesión nuevamente.';
    case 403:
      return 'No tienes permisos para realizar esta acción.';
    case 404:
      return 'El recurso solicitado no fue encontrado.';
    case 409:
      return 'Conflicto con datos existentes.';
    case 422:
      return 'Los datos proporcionados no son válidos.';
    case 429:
      return 'Demasiadas solicitudes. Intenta de nuevo en un momento.';
    case 500:
      return 'Error interno del servidor. Intenta de nuevo más tarde.';
    case 502:
    case 503:
    case 504:
      return 'Servidor temporalmente no disponible. Intenta de nuevo.';
    default:
      return error?.message || 'Error inesperado. Intenta de nuevo.';
  }
}

/**
 * Generate cache key for consistent caching
 */
export function generateCacheKey(endpoint: string, params?: Record<string, any>): string {
  const sortedParams = params ? Object.keys(params).sort().reduce((result, key) => {
    result[key] = params[key];
    return result;
  }, {} as Record<string, any>) : {};
  
  return `${endpoint}_${JSON.stringify(sortedParams)}`;
}

/**
 * Clear cache by pattern
 */
export function clearCache(pattern?: string) {
  if (!pattern) {
    cache.clear();
    return;
  }
  
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}

/**
 * Get cache stats
 */
export function getCacheStats() {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
}

// Utility functions
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Export cache instance for external use
export { cache as apiCache };
