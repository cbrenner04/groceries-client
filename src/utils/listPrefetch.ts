/**
 * List prefetch utilities for opportunistic loading
 * Prefetches list data when user shows intent to navigate (hover, idle time)
 */

import { fetchList, type IFulfilledListData } from '../routes/list/utils';
import { createCache } from './lightweightCache';

interface PrefetchOptions {
  signal?: AbortSignal;
  priority?: 'high' | 'low';
}

// Dedicated cache for prefetched list data with longer TTL
const listPrefetchCache = createCache<IFulfilledListData | null>({
  maxAge: 5 * 60 * 1000, // 5 minutes
  maxSize: 20, // Reasonable limit for list cache
});

class ListPrefetcher {
  private pendingPrefetches = new Map<string, Promise<IFulfilledListData | undefined>>();
  private hoverTimeouts = new Map<string, number>();

  /**
   * Prefetch list data for a given list ID
   */
  async prefetchList(listId: string, options: PrefetchOptions = {}): Promise<void> {
    try {
      // Check if we already have cached data
      const existingData = this.getPrefetchedList(listId);
      if (existingData) {
        return; // Already cached
      }

      // Check if already being prefetched
      if (this.pendingPrefetches.has(listId)) {
        return;
      }

      // Start prefetch
      const prefetchPromise = this.fetchAndCacheList(listId, options.signal);
      this.pendingPrefetches.set(listId, prefetchPromise);

      try {
        const result = await prefetchPromise;
        if (result) {
          // Cache the result for later use
          const cacheKey = `list-${listId}`;
          listPrefetchCache.set(cacheKey, result);
        }
      } finally {
        this.pendingPrefetches.delete(listId);
      }
    } catch (error) {
      // Silently ignore prefetch errors to avoid disrupting user experience
      // Error details available in development via network tab
    }
  }

  /**
   * Get prefetched list data if available
   */
  getPrefetchedList(listId: string): IFulfilledListData | null {
    const cacheKey = `list-${listId}`;
    return listPrefetchCache.retrieve(cacheKey);
  }

  /**
   * Prefetch list on hover with debounce
   */
  prefetchOnHover(listId: string, delay = 300): void {
    // Clear existing timeout for this list
    const existingTimeout = this.hoverTimeouts.get(listId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set new timeout
    const timeoutId = window.setTimeout(() => {
      this.prefetchList(listId, { priority: 'low' });
      this.hoverTimeouts.delete(listId);
    }, delay);

    this.hoverTimeouts.set(listId, timeoutId);
  }

  /**
   * Cancel hover prefetch for a list ID
   */
  cancelHoverPrefetch(listId: string): void {
    const timeoutId = this.hoverTimeouts.get(listId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.hoverTimeouts.delete(listId);
    }
  }

  /**
   * Prefetch during idle time
   */
  async prefetchIdle(listIds: string[]): Promise<void> {
    const scheduleIdle = (callback: () => void): void => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(callback, { timeout: 5000 });
      } else {
        setTimeout(callback, 1000);
      }
    };

    return new Promise<void>((resolve) => {
      scheduleIdle(async () => {
        // Prefetch up to 3 lists during idle time to avoid overwhelming
        const limitedIds = listIds.slice(0, 3);
        await Promise.allSettled(limitedIds.map((id) => this.prefetchList(id, { priority: 'low' })));
        resolve();
      });
    });
  }

  /**
   * Clear all caches and pending requests
   */
  clear(): void {
    listPrefetchCache.clear();
    this.pendingPrefetches.clear();

    // Clear all hover timeouts
    for (const timeoutId of this.hoverTimeouts.values()) {
      clearTimeout(timeoutId);
    }
    this.hoverTimeouts.clear();
  }

  /**
   * Get prefetch statistics
   */
  getStats(): {
    cacheSize: number;
    pendingPrefetches: number;
    hoverTimeouts: number;
  } {
    return {
      cacheSize: listPrefetchCache.getStats().size,
      pendingPrefetches: this.pendingPrefetches.size,
      hoverTimeouts: this.hoverTimeouts.size,
    };
  }

  private async fetchAndCacheList(listId: string, signal?: AbortSignal): Promise<IFulfilledListData | undefined> {
    // Use the existing fetchList utility but with navigation that won't actually navigate
    // since this is just for prefetching
    const dummyNavigate = (): void => {
      // No-op for prefetch
    };

    return fetchList({ id: listId, navigate: dummyNavigate, signal });
  }
}

// Global instance
export const listPrefetcher = new ListPrefetcher();

// Helper functions
export function prefetchList(listId: string, options?: PrefetchOptions): Promise<void> {
  return listPrefetcher.prefetchList(listId, options);
}

export function prefetchListOnHover(listId: string, delay?: number): void {
  return listPrefetcher.prefetchOnHover(listId, delay);
}

export function cancelListHoverPrefetch(listId: string): void {
  return listPrefetcher.cancelHoverPrefetch(listId);
}

export function prefetchListsIdle(listIds: string[]): Promise<void> {
  return listPrefetcher.prefetchIdle(listIds);
}

export function getPrefetchedList(listId: string): IFulfilledListData | null {
  return listPrefetcher.getPrefetchedList(listId);
}
