/**
 * Request deduplication utility to prevent overlapping API calls
 * This is particularly useful for polling scenarios where multiple requests
 * might be triggered before the previous one completes
 */

interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

class RequestDeduplicator<T> {
  private pendingRequests = new Map<string, PendingRequest<T>>();
  private readonly requestTimeout: number;

  constructor(requestTimeout = 30000) {
    // 30 second default timeout
    this.requestTimeout = requestTimeout;
  }

  /**
   * Execute a request, returning the result of an existing pending request if available
   * @param key Unique key for this request type
   * @param requestFn Function that performs the actual request
   * @returns Promise that resolves to the request result
   */
  async execute(key: string, requestFn: () => Promise<T>): Promise<T> {
    const now = Date.now();

    // Check for existing pending request
    const existing = this.pendingRequests.get(key);
    if (existing) {
      // Check if the existing request is still valid (not timed out)
      if (now - existing.timestamp < this.requestTimeout) {
        return existing.promise;
      } else {
        // Clean up expired request
        this.pendingRequests.delete(key);
      }
    }

    // Create new request
    const promise = requestFn().finally(() => {
      // Clean up when request completes
      this.pendingRequests.delete(key);
    });

    // Store the pending request
    this.pendingRequests.set(key, {
      promise,
      timestamp: now,
    });

    return promise;
  }

  /**
   * Check if a request is currently pending
   */
  isPending(key: string): boolean {
    return this.pendingRequests.has(key);
  }

  /**
   * Clear all pending requests
   */
  clear(): void {
    this.pendingRequests.clear();
  }

  /**
   * Get the number of pending requests
   */
  getPendingCount(): number {
    return this.pendingRequests.size;
  }
}

/**
 * Create a deduplicator instance for a specific request type
 */
export function createRequestDeduplicator<T>(requestTimeout?: number): RequestDeduplicator<T> {
  return new RequestDeduplicator<T>(requestTimeout);
}

/**
 * Global deduplicator instances for common request types
 */
export const listDeduplicator = createRequestDeduplicator<unknown>();
export const listsDeduplicator = createRequestDeduplicator<unknown>();
export const shareListDeduplicator = createRequestDeduplicator<unknown>();
