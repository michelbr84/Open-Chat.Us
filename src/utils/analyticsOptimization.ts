import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_MAX_SIZE = 50; // Maximum number of cached queries

interface CacheEntry {
  data: any;
  timestamp: number;
  key: string;
}

class AnalyticsCache {
  private cache = new Map<string, CacheEntry>();
  private accessOrder: string[] = [];

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if cache entry is still valid
    if (Date.now() - entry.timestamp > CACHE_DURATION) {
      this.cache.delete(key);
      this.accessOrder = this.accessOrder.filter(k => k !== key);
      return null;
    }

    // Update access order (LRU)
    this.accessOrder = this.accessOrder.filter(k => k !== key);
    this.accessOrder.push(key);

    return entry.data;
  }

  set(key: string, data: any): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= CACHE_MAX_SIZE && !this.cache.has(key)) {
      const oldestKey = this.accessOrder.shift();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    // Add or update entry
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      key
    });

    // Update access order
    this.accessOrder = this.accessOrder.filter(k => k !== key);
    this.accessOrder.push(key);
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  invalidatePattern(pattern: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.includes(pattern)
    );
    
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.accessOrder = this.accessOrder.filter(k => k !== key);
    });
  }
}

// Global cache instance
const analyticsCache = new AnalyticsCache();

// Cache key generators
export const generateCacheKey = (
  type: string, 
  params: Record<string, any>
): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result, key) => {
      result[key] = params[key];
      return result;
    }, {} as Record<string, any>);
  
  return `${type}_${JSON.stringify(sortedParams)}`;
};

// Optimized query builder for analytics - simplified version
export const buildOptimizedQuery = (
  table: string,
  options: {
    select?: string;
    filters?: Array<{ column: string; operator: string; value: any }>;
    dateRange?: { from: string; to: string; column?: string };
    limit?: number;
    orderBy?: { column: string; ascending?: boolean };
  }
) => {
  // This is a helper function that returns query configuration
  // The actual query should be built in the specific analytics hooks
  return {
    table,
    ...options
  };
};

// Optimized analytics hook with caching and performance optimizations
export const useOptimizedAnalytics = <T>(
  queryKey: string,
  queryFn: () => Promise<T>,
  dependencies: any[] = [],
  options: {
    cacheable?: boolean;
    realtime?: boolean;
    realtimeTable?: string;
    realtimeEvent?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  } = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    cacheable = true,
    realtime = false,
    realtimeTable,
    realtimeEvent = '*'
  } = options;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first if cacheable
      if (cacheable) {
        const cacheKey = generateCacheKey(queryKey, { dependencies });
        const cachedData = analyticsCache.get(cacheKey);
        
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          return;
        }
      }

      // Execute query
      const result = await queryFn();
      
      // Cache result if cacheable
      if (cacheable) {
        const cacheKey = generateCacheKey(queryKey, { dependencies });
        analyticsCache.set(cacheKey, result);
      }

      setData(result);
    } catch (err) {
      console.error(`Error in ${queryKey}:`, err);
      setError(`Failed to fetch ${queryKey}`);
    } finally {
      setLoading(false);
    }
  }, [queryKey, queryFn, cacheable, ...dependencies]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time updates if enabled
  useEffect(() => {
    if (!realtime || !realtimeTable) return;

    const channel = supabase
      .channel(`${queryKey}-realtime`)
      .on(
        'postgres_changes' as any,
        {
          event: realtimeEvent,
          schema: 'public',
          table: realtimeTable
        } as any,
        () => {
          // Invalidate cache for this query type
          if (cacheable) {
            analyticsCache.invalidatePattern(queryKey);
          }
          // Refetch data
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryKey, realtime, realtimeTable, realtimeEvent, cacheable, fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// Batch processing utility for multiple analytics queries
export const batchAnalyticsQueries = async <T extends Record<string, any>>(
  queries: Record<keyof T, () => Promise<any>>
): Promise<T> => {
  const results = {} as T;
  const queryEntries = Object.entries(queries) as [keyof T, () => Promise<any>][];
  
  // Execute all queries in parallel
  const promises = queryEntries.map(async ([key, queryFn]) => {
    try {
      const result = await queryFn();
      return { key, result, error: null };
    } catch (error) {
      console.error(`Error in batch query ${String(key)}:`, error);
      return { key, result: null, error };
    }
  });

  const queryResults = await Promise.all(promises);
  
  // Combine results
  queryResults.forEach(({ key, result }) => {
    results[key] = result;
  });

  return results;
};

// Utility to preload analytics data
export const preloadAnalyticsData = (
  queries: Array<{
    key: string;
    queryFn: () => Promise<any>;
    priority?: 'high' | 'medium' | 'low';
  }>
) => {
  // Sort by priority
  const sortedQueries = queries.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium'];
  });

  // Execute queries with staggered timing based on priority
  sortedQueries.forEach((query, index) => {
    const delay = query.priority === 'high' ? 0 : 
                  query.priority === 'medium' ? 100 : 200;
    
    setTimeout(async () => {
      try {
        const result = await query.queryFn();
        const cacheKey = generateCacheKey(query.key, {});
        analyticsCache.set(cacheKey, result);
      } catch (error) {
        console.error(`Error preloading ${query.key}:`, error);
      }
    }, delay * index);
  });
};

// Memory cleanup utility
export const cleanupAnalyticsCache = () => {
  analyticsCache.clear();
};

// Performance monitoring
export const trackQueryPerformance = async <T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> => {
  const startTime = performance.now();
  
  try {
    const result = await queryFn();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Log slow queries (> 2 seconds)
    if (duration > 2000) {
      console.warn(`Slow analytics query detected: ${queryName} took ${duration.toFixed(2)}ms`);
    }
    
    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.error(`Analytics query failed: ${queryName} after ${duration.toFixed(2)}ms`, error);
    throw error;
  }
};