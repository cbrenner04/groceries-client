/**
 * Lightweight client cache utility to avoid re-render churn between identical API payloads
 * This is particularly useful for polling scenarios where the same data might be returned multiple times
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hash: string;
}

interface CacheOptions {
  maxAge?: number; // milliseconds, default 5 minutes
  maxSize?: number; // maximum number of entries, default 100
}

class LightweightCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private readonly maxAge: number;
  private readonly maxSize: number;

  constructor(options: CacheOptions = {}) {
    this.maxAge = options.maxAge ?? 5 * 60 * 1000; // 5 minutes default
    this.maxSize = options.maxSize ?? 100;
  }

  /**
   * Generate a simple hash for data comparison
   * Uses JSON.stringify for simplicity - in production you might want a more robust hashing solution
   */
  private generateHash(data: T): string {
    try {
      return JSON.stringify(data);
    } catch {
      // Fallback for non-serializable data
      return String(data);
    }
  }

  /**
   * Check if data has changed and update cache if needed
   * @param key Cache key
   * @param data New data to compare
   * @returns Object with hasChanged flag and cached data
   */
  get(key: string, data: T): { hasChanged: boolean; cachedData: T | null } {
    const now = Date.now();
    const entry = this.cache.get(key);

    // Clean up expired entries
    if (entry && now - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      // Entry was expired, treat as new data
      this.set(key, data);
      return { hasChanged: true, cachedData: null };
    }

    // If no entry exists, cache the new data
    if (!entry) {
      this.set(key, data);
      return { hasChanged: true, cachedData: null };
    }

    // Check if data has changed
    const newHash = this.generateHash(data);
    if (entry.hash === newHash) {
      // Data is identical, update timestamp to keep entry fresh
      entry.timestamp = now;
      return { hasChanged: false, cachedData: entry.data };
    }

    // Data has changed, update cache
    this.set(key, data);
    return { hasChanged: true, cachedData: entry.data };
  }

  /**
   * Set a cache entry
   */
  set(key: string, data: T): void {
    const now = Date.now();
    const hash = this.generateHash(data);

    // Clean up old entries if we're at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value!;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      hash,
    });
  }

  /**
   * Retrieve cached data without comparison logic
   * @param key Cache key
   * @returns Cached data if exists and not expired, null otherwise
   */
  retrieve(key: string): T | null {
    const now = Date.now();
    const entry = this.cache.get(key);

    // Return null if no entry or expired
    if (!entry || now - entry.timestamp > this.maxAge) {
      if (entry) {
        this.cache.delete(key);
      }
      return null;
    }

    return entry.data;
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number; maxAge: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      maxAge: this.maxAge,
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.maxAge) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Create a cache instance for a specific data type
 */
export function createCache<T>(options?: CacheOptions): LightweightCache<T> {
  return new LightweightCache<T>(options);
}

/**
 * Unified cache instance for all application data
 * Uses key prefixes for namespacing:
 * - `list-{id}-{type}` for list items
 * - `lists-{type}` for lists index
 * - `field-config-{id}` for field configurations
 * - `prefetch-list-{id}` for prefetched lists
 */
export const unifiedCache = createCache<unknown>({
  maxAge: 5 * 60 * 1000, // 5 minutes - balanced TTL for freshness and performance
  maxSize: 100, // Reasonable limit for all cached data
});

// Legacy exports for backward compatibility during migration
export const listCache = unifiedCache;
export const listsCache = unifiedCache;
export const fieldConfigCache = unifiedCache;
export const configurationCache = unifiedCache;

/**
 * Hook to use cache in components
 * Returns a function that checks if data has changed and updates cache
 */
export function useCache<T>(cache: LightweightCache<T>) {
  return (key: string, data: T): { hasChanged: boolean; cachedData: T | null } => cache.get(key, data);
}
