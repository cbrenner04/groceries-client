/**
 * Enhanced field configuration caching service
 * Provides efficient caching of field configurations by configuration ID
 * with proper cache invalidation and prefetching strategies
 */

import axios from './api';
import type { IListItemFieldConfiguration } from '../typings';

interface FieldConfigCacheEntry {
  data: IListItemFieldConfiguration[];
  timestamp: number;
  configId: string;
}

interface FetchOptions {
  signal?: AbortSignal;
  skipCache?: boolean;
}

class FieldConfigurationCache {
  private cache = new Map<string, FieldConfigCacheEntry>();
  private readonly maxAge: number = 10 * 60 * 1000; // 10 minutes
  private readonly maxSize: number = 50; // Reasonable limit for config cache
  private pendingRequests = new Map<string, Promise<IListItemFieldConfiguration[]>>();

  /**
   * Get field configurations for a configuration ID with caching
   */
  async get(configId: string, options: FetchOptions = {}): Promise<IListItemFieldConfiguration[]> {
    // Skip cache when explicitly requested
    if (options.skipCache) {
      return this.fetchFromAPI(configId, options.signal);
    }

    // Check for valid cached entry
    const cachedEntry = this.cache.get(configId);
    if (cachedEntry && this.isValidEntry(cachedEntry)) {
      // Update timestamp to keep fresh
      cachedEntry.timestamp = Date.now();
      return cachedEntry.data;
    }

    // Check for pending request to avoid duplicate fetches
    const pendingRequest = this.pendingRequests.get(configId);
    if (pendingRequest) {
      return pendingRequest;
    }

    // Create new request
    const request = this.fetchAndCache(configId, options.signal);
    this.pendingRequests.set(configId, request);

    try {
      const result = await request;
      return result;
    } finally {
      this.pendingRequests.delete(configId);
    }
  }

  /**
   * Prefetch field configurations for a configuration ID
   * Does not throw errors, logs them instead
   */
  async prefetch(configId: string, signal?: AbortSignal): Promise<void> {
    try {
      // Only prefetch if not already cached or pending
      if (this.cache.has(configId) || this.pendingRequests.has(configId)) {
        return;
      }

      await this.get(configId, { signal });
    } catch (error) {
      // Silently ignore prefetch errors to avoid disrupting user experience
      // Error details available in development via network tab
    }
  }

  /**
   * Prefetch configurations during idle time
   */
  async prefetchIdle(configId: string): Promise<void> {
    return new Promise<void>((resolve) => {
      // Use setTimeout for consistent behavior across environments
      setTimeout(async () => {
        await this.prefetch(configId);
        resolve();
      }, 100);
    });
  }

  /**
   * Clear cache entry for a specific configuration ID
   */
  invalidate(configId: string): void {
    this.cache.delete(configId);
    // Also cancel any pending request
    const pendingRequest = this.pendingRequests.get(configId);
    if (pendingRequest) {
      this.pendingRequests.delete(configId);
    }
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Get cache statistics for debugging
   */
  getStats(): { size: number; maxSize: number; maxAge: number; pendingRequests: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      maxAge: this.maxAge,
      pendingRequests: this.pendingRequests.size,
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [configId, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.maxAge) {
        this.cache.delete(configId);
      }
    }
  }

  private async fetchAndCache(configId: string, signal?: AbortSignal): Promise<IListItemFieldConfiguration[]> {
    const data = await this.fetchFromAPI(configId, signal);

    // Cache the result
    this.setCacheEntry(configId, data);

    return data;
  }

  private async fetchFromAPI(configId: string, signal?: AbortSignal): Promise<IListItemFieldConfiguration[]> {
    const { data } = await axios.get(`/list_item_configurations/${configId}/list_item_field_configurations/bundle`, {
      signal,
    });

    // Data is already sorted by position from the bundle endpoint
    return data;
  }

  private setCacheEntry(configId: string, data: IListItemFieldConfiguration[]): void {
    // Clean up if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      /* istanbul ignore else */
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(configId, {
      data,
      timestamp: Date.now(),
      configId,
    });
  }

  private isValidEntry(entry: FieldConfigCacheEntry): boolean {
    return Date.now() - entry.timestamp < this.maxAge;
  }
}

// Global instance
export const fieldConfigCache = new FieldConfigurationCache();

// Helper function for compatibility with existing code
export async function getFieldConfigurations(
  configId: string,
  options: FetchOptions = {},
): Promise<IListItemFieldConfiguration[]> {
  return fieldConfigCache.get(configId, options);
}

// Helper function for prefetching
export async function prefetchFieldConfigurations(configId: string, signal?: AbortSignal): Promise<void> {
  return fieldConfigCache.prefetch(configId, signal);
}

// Helper function for idle prefetching
export async function prefetchFieldConfigurationsIdle(configId: string): Promise<void> {
  return fieldConfigCache.prefetchIdle(configId);
}
