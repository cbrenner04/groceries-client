/**
 * List prefetch utilities for opportunistic loading
 * Prefetches list data when user shows intent to navigate (hover, idle time)
 */

import { fetchList, type IFulfilledListData } from '../routes/list/utils';
import { unifiedCache } from './lightweightCache';

interface PrefetchOptions {
  signal?: AbortSignal;
  priority?: 'high' | 'low';
}

/**
 * No-op navigation function for prefetch operations
 */
const dummyNavigate = (): void => {
  // No-op for prefetch
};

class ListPrefetcher {
  private pendingPrefetches = new Map<string, Promise<IFulfilledListData | undefined>>();

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
          const cacheKey = `prefetch-list-${listId}`;
          unifiedCache.set(cacheKey, result);
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
    const cacheKey = `prefetch-list-${listId}`;
    return unifiedCache.retrieve(cacheKey) as IFulfilledListData | null;
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
    unifiedCache.clear();
    this.pendingPrefetches.clear();
  }

  /**
   * Get prefetch statistics
   */
  getStats(): {
    cacheSize: number;
    pendingPrefetches: number;
  } {
    return {
      cacheSize: unifiedCache.getStats().size,
      pendingPrefetches: this.pendingPrefetches.size,
    };
  }

  private async fetchAndCacheList(listId: string, signal?: AbortSignal): Promise<IFulfilledListData | undefined> {
    // Use the existing fetchList utility but with navigation that won't actually navigate
    // since this is just for prefetching
    return fetchList({ id: listId, navigate: dummyNavigate, signal });
  }
}

// Global instance
export const listPrefetcher = new ListPrefetcher();

// Helper functions
export function prefetchList(listId: string, options?: PrefetchOptions): Promise<void> {
  return listPrefetcher.prefetchList(listId, options);
}

export function prefetchListsIdle(listIds: string[]): Promise<void> {
  return listPrefetcher.prefetchIdle(listIds);
}

export function getPrefetchedList(listId: string): IFulfilledListData | null {
  return listPrefetcher.getPrefetchedList(listId);
}
