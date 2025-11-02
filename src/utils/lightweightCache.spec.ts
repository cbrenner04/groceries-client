import { renderHook } from '@testing-library/react';
import { createCache, useCache } from './lightweightCache';

describe('LightweightCache', () => {
  let originalDateNow: () => number;

  beforeEach(() => {
    jest.useFakeTimers();

    // Mock Date.now() to work with jest timers
    originalDateNow = Date.now;
    Date.now = jest.fn(() => 1000);
  });

  afterEach(() => {
    jest.useRealTimers();
    Date.now = originalDateNow;
  });

  describe('createCache', () => {
    it('creates a cache with default options', () => {
      const cache = createCache<string>();
      expect(cache.getStats()).toEqual({
        size: 0,
        maxSize: 100,
        maxAge: 5 * 60 * 1000,
      });
    });

    it('creates a cache with custom options', () => {
      const cache = createCache<string>({
        maxAge: 1000,
        maxSize: 50,
      });
      expect(cache.getStats()).toEqual({
        size: 0,
        maxSize: 50,
        maxAge: 1000,
      });
    });
  });

  describe('get method', () => {
    it('returns hasChanged: true for new data', () => {
      const cache = createCache<string>();
      const result = cache.get('key1', 'value1');

      expect(result.hasChanged).toBe(true);
      expect(result.cachedData).toBeNull();
    });

    it('returns hasChanged: false for identical data', () => {
      const cache = createCache<string>();

      // First call - cache the data
      cache.get('key1', 'value1');

      // Second call with same data
      const result = cache.get('key1', 'value1');

      expect(result.hasChanged).toBe(false);
      expect(result.cachedData).toBe('value1');
    });

    it('returns hasChanged: true for changed data', () => {
      const cache = createCache<string>();

      // First call - cache the data
      cache.get('key1', 'value1');

      // Second call with different data
      const result = cache.get('key1', 'value2');

      expect(result.hasChanged).toBe(true);
      expect(result.cachedData).toBe('value1');
    });

    it('handles complex objects', () => {
      const cache = createCache<{ id: number; name: string }>();
      const data1 = { id: 1, name: 'test' };
      const data2 = { id: 1, name: 'test' };
      const data3 = { id: 2, name: 'test' };

      // First call
      cache.get('key1', data1);

      // Second call with identical object
      const result1 = cache.get('key1', data2);
      expect(result1.hasChanged).toBe(false);

      // Third call with different object
      const result2 = cache.get('key1', data3);
      expect(result2.hasChanged).toBe(true);
    });

    it('expires old entries', () => {
      const cache = createCache<string>({ maxAge: 1000 });

      // Cache some data
      cache.get('key1', 'value1');
      expect(cache.getStats().size).toBe(1);

      // Advance time past expiration
      (Date.now as jest.Mock).mockReturnValue(2500);

      // Try to get the expired entry
      const result = cache.get('key1', 'value1');
      expect(result.hasChanged).toBe(true);
      expect(result.cachedData).toBeNull();
    });

    it('respects max size limit', () => {
      const cache = createCache<string>({ maxSize: 2 });

      // Fill the cache
      cache.get('key1', 'value1');
      cache.get('key2', 'value2');
      expect(cache.getStats().size).toBe(2);

      // Add one more - should evict the oldest
      cache.get('key3', 'value3');
      expect(cache.getStats().size).toBe(2);

      // Oldest entry should be gone
      const result = cache.get('key1', 'value1');
      expect(result.hasChanged).toBe(true);
    });
  });

  describe('set method', () => {
    it('sets a value in the cache', () => {
      const cache = createCache<string>();

      cache.set('key1', 'value1');
      expect(cache.getStats().size).toBe(1);
    });

    it('overwrites existing values', () => {
      const cache = createCache<string>();

      cache.set('key1', 'value1');
      cache.set('key1', 'value2');
      expect(cache.getStats().size).toBe(1);

      const retrieved = cache.retrieve('key1');
      expect(retrieved).toBe('value2');
    });

    it('respects max size limit', () => {
      const cache = createCache<string>({ maxSize: 2 });

      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      expect(cache.getStats().size).toBe(2);
    });
  });

  describe('retrieve method', () => {
    it('retrieves cached value', () => {
      const cache = createCache<string>();

      cache.set('key1', 'value1');
      const retrieved = cache.retrieve('key1');

      expect(retrieved).toBe('value1');
    });

    it('returns null for non-existent key', () => {
      const cache = createCache<string>();

      const retrieved = cache.retrieve('nonexistent');
      expect(retrieved).toBeNull();
    });

    it('returns null for expired entry', () => {
      const cache = createCache<string>({ maxAge: 1000 });

      cache.set('key1', 'value1');
      expect(cache.retrieve('key1')).toBe('value1');

      // Advance time past expiration
      (Date.now as jest.Mock).mockReturnValue(2500);

      const retrieved = cache.retrieve('key1');
      expect(retrieved).toBeNull();
      expect(cache.getStats().size).toBe(0); // Expired entry should be deleted
    });

    it('works with complex objects', () => {
      const cache = createCache<{ id: number; name: string }>();
      const data = { id: 1, name: 'test' };

      cache.set('key1', data);
      const retrieved = cache.retrieve('key1');

      expect(retrieved).toEqual(data);
    });
  });

  describe('clear method', () => {
    it('clears all cached entries', () => {
      const cache = createCache<string>();

      cache.get('key1', 'value1');
      cache.get('key2', 'value2');
      expect(cache.getStats().size).toBe(2);

      cache.clear();
      expect(cache.getStats().size).toBe(0);
    });
  });

  describe('cleanup method', () => {
    it('removes expired entries', () => {
      const cache = createCache<string>({ maxAge: 1000 });

      // Create first entry at time 1000
      cache.get('key1', 'value1');
      expect(cache.getStats().size).toBe(1);

      // Advance time and create second entry at time 1500
      (Date.now as jest.Mock).mockReturnValue(1500);
      cache.get('key2', 'value2');
      expect(cache.getStats().size).toBe(2);

      // Advance time to 2500 - key1 is 1500ms old (expired), key2 is 1000ms old (still valid)
      (Date.now as jest.Mock).mockReturnValue(2500);

      cache.cleanup();
      expect(cache.getStats().size).toBe(1);
    });
  });

  describe('useCache hook', () => {
    it('returns a function that uses the cache', () => {
      const cache = createCache<string>();
      const { result } = renderHook(() => useCache(cache));

      const cacheFn = result.current;

      // First call
      const result1 = cacheFn('key1', 'value1');
      expect(result1.hasChanged).toBe(true);

      // Second call with same data - should return hasChanged: false
      const result2 = cacheFn('key1', 'value1');
      expect(result2.hasChanged).toBe(false);
    });
  });

  describe('LRU eviction strategy', () => {
    it('evicts least recently used entries', () => {
      const cache = createCache<string>({ maxSize: 3 });

      // Fill the cache
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      // Access key1 to make it most recently used
      cache.retrieve('key1');

      // Add a new entry - should evict key2 (least recently used)
      cache.set('key4', 'value4');

      expect(cache.retrieve('key1')).toBe('value1'); // Still in cache
      expect(cache.retrieve('key2')).toBeNull(); // Evicted
      expect(cache.retrieve('key3')).toBe('value3'); // Still in cache
      expect(cache.retrieve('key4')).toBe('value4'); // New entry
    });

    it('maintains LRU order when accessing entries via get', () => {
      const cache = createCache<string>({ maxSize: 3 });

      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      // Access key2 via get (should move it to end)
      cache.get('key2', 'value2');

      // Add new entry - should evict key1 (least recently used)
      cache.set('key4', 'value4');

      expect(cache.retrieve('key1')).toBeNull(); // Evicted
      expect(cache.retrieve('key2')).toBe('value2'); // Still in cache
      expect(cache.retrieve('key3')).toBe('value3'); // Still in cache
      expect(cache.retrieve('key4')).toBe('value4'); // New entry
    });

    it('handles bulk operations efficiently', () => {
      const cache = createCache<string>({ maxSize: 3 });

      // Fill the cache
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      // Bulk add - should evict multiple entries
      cache.set('key4', 'value4');
      cache.set('key5', 'value5');
      cache.set('key6', 'value6');

      // Only the last 3 entries should remain
      expect(cache.retrieve('key1')).toBeNull();
      expect(cache.retrieve('key2')).toBeNull();
      expect(cache.retrieve('key3')).toBeNull();
      expect(cache.retrieve('key4')).toBe('value4');
      expect(cache.retrieve('key5')).toBe('value5');
      expect(cache.retrieve('key6')).toBe('value6');
      expect(cache.getStats().size).toBe(3);
    });

    it('updates existing entries without affecting LRU order', () => {
      const cache = createCache<string>({ maxSize: 3 });

      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      // Update key1 - should move it to end (most recently used)
      cache.set('key1', 'value1-updated');

      // Add new entry - should evict key2 (least recently used)
      cache.set('key4', 'value4');

      expect(cache.retrieve('key1')).toBe('value1-updated'); // Still in cache
      expect(cache.retrieve('key2')).toBeNull(); // Evicted
      expect(cache.retrieve('key3')).toBe('value3'); // Still in cache
      expect(cache.retrieve('key4')).toBe('value4'); // New entry
    });
  });

  describe('edge cases', () => {
    it('handles non-serializable data gracefully', () => {
      const cache = createCache<unknown>();

      // Create an object with circular reference
      const circularObj: Record<string, unknown> = { name: 'test' };
      circularObj.self = circularObj;

      // Should not throw
      expect(() => {
        cache.get('key1', circularObj);
      }).not.toThrow();
    });

    it('handles null and undefined values', () => {
      const cache = createCache<unknown>();

      cache.get('key1', null);
      const result1 = cache.get('key1', null);
      expect(result1.hasChanged).toBe(false);

      cache.get('key2', undefined);
      const result2 = cache.get('key2', undefined);
      expect(result2.hasChanged).toBe(false);
    });
  });
});
