/**
 * Field configuration caching service
 * Uses the unified cache with key prefix 'field-config-'
 */

import axios from './api';
import { unifiedCache } from './lightweightCache';
import type { IListItemFieldConfiguration } from '../typings';

interface FetchOptions {
  signal?: AbortSignal;
  skipCache?: boolean;
}

// Track pending requests to avoid duplicate fetches
const pendingRequests = new Map<string, Promise<IListItemFieldConfiguration[]>>();

/**
 * Get field configurations for a configuration ID with caching
 */
export async function getFieldConfigurations(
  configId: string,
  options: FetchOptions = {},
): Promise<IListItemFieldConfiguration[]> {
  const cacheKey = `field-config-${configId}`;

  // Skip cache when explicitly requested
  if (options.skipCache) {
    return fetchFromAPI(configId, options.signal);
  }

  // Check for valid cached entry
  const cachedData = unifiedCache.retrieve(cacheKey) as IListItemFieldConfiguration[] | null;
  if (cachedData) {
    return cachedData;
  }

  // Check for pending request to avoid duplicate fetches
  const pendingRequest = pendingRequests.get(configId);
  if (pendingRequest) {
    return pendingRequest;
  }

  // Create new request
  const request = fetchAndCache(configId, options.signal);
  pendingRequests.set(configId, request);

  try {
    const result = await request;
    return result;
  } finally {
    pendingRequests.delete(configId);
  }
}

/**
 * Prefetch field configurations for a configuration ID
 * Does not throw errors, logs them instead
 */
export async function prefetchFieldConfigurations(configId: string, signal?: AbortSignal): Promise<void> {
  try {
    const cacheKey = `field-config-${configId}`;
    // Only prefetch if not already cached or pending
    if (unifiedCache.retrieve(cacheKey) || pendingRequests.has(configId)) {
      return;
    }

    await getFieldConfigurations(configId, { signal });
  } catch (error) {
    // Silently ignore prefetch errors to avoid disrupting user experience
    // Error details available in development via network tab
  }
}

/**
 * Prefetch configurations during idle time
 */
export async function prefetchFieldConfigurationsIdle(configId: string): Promise<void> {
  const PREFETCH_IDLE_DELAY_MS = 100;
  return new Promise<void>((resolve) => {
    // Use setTimeout for consistent behavior across environments
    setTimeout(async () => {
      await prefetchFieldConfigurations(configId);
      resolve();
    }, PREFETCH_IDLE_DELAY_MS);
  });
}

/**
 * Clear cache entry for a specific configuration ID
 * Note: Unified cache doesn't support per-key deletion, so this clears pending requests only
 */
export function invalidateFieldConfigCache(configId: string): void {
  pendingRequests.delete(configId);
}

/**
 * Clear all cached field configurations
 * Note: This clears all pending requests; actual cache clearing should be done via unifiedCache.clear()
 */
export function clearFieldConfigCache(): void {
  pendingRequests.clear();
}

async function fetchAndCache(configId: string, signal?: AbortSignal): Promise<IListItemFieldConfiguration[]> {
  const data = await fetchFromAPI(configId, signal);

  // Cache the result
  const cacheKey = `field-config-${configId}`;
  unifiedCache.set(cacheKey, data);

  return data;
}

async function fetchFromAPI(configId: string, signal?: AbortSignal): Promise<IListItemFieldConfiguration[]> {
  const { data } = await axios.get(`/list_item_configurations/${configId}/list_item_field_configurations/bundle`, {
    signal,
  });

  // Data is already sorted by position from the bundle endpoint
  return data;
}
