import {
  fieldConfigCache,
  getFieldConfigurations,
  prefetchFieldConfigurations,
  prefetchFieldConfigurationsIdle,
} from './fieldConfigCache';
import axios from './api';
import { type IListItemFieldConfiguration, EListItemFieldType } from '../typings';

// Mock axios
jest.mock('./api');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Note: requestIdleCallback is no longer used, simplified to use setTimeout

describe('FieldConfigurationCache', () => {
  let originalDateNow: () => number;

  beforeEach(() => {
    jest.clearAllMocks();
    fieldConfigCache.clear();

    // Mock Date.now() for predictable timing
    originalDateNow = Date.now;
    Date.now = jest.fn(() => 1000);

    // Note: No longer using requestIdleCallback mock
  });

  afterEach(() => {
    Date.now = originalDateNow;
  });

  describe('get method', () => {
    const mockFieldConfigs: IListItemFieldConfiguration[] = [
      { id: '1', label: 'category', data_type: EListItemFieldType.FREE_TEXT, position: 1 },
      { id: '2', label: 'notes', data_type: EListItemFieldType.FREE_TEXT, position: 2 },
    ];

    it('fetches and caches field configurations on first request', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockFieldConfigs });

      const result = await fieldConfigCache.get('config-123');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/list_item_configurations/config-123/list_item_field_configurations/bundle',
        { signal: undefined },
      );
      expect(result).toEqual(mockFieldConfigs);
      expect(fieldConfigCache.getStats().size).toBe(1);
    });

    it('returns cached data on subsequent requests', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockFieldConfigs });

      // First request
      await fieldConfigCache.get('config-123');

      // Second request - should use cache
      const result = await fieldConfigCache.get('config-123');

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockFieldConfigs);
    });

    it('receives field configurations already sorted by position from bundle endpoint', async () => {
      const sortedConfigs = [
        { id: '1', label: 'category', data_type: 'string', position: 1 },
        { id: '3', label: 'quantity', data_type: 'number', position: 2 },
        { id: '2', label: 'notes', data_type: EListItemFieldType.FREE_TEXT, position: 3 },
      ];

      mockedAxios.get.mockResolvedValueOnce({ data: sortedConfigs });

      const result = await fieldConfigCache.get('config-123');

      expect(result[0].position).toBe(1);
      expect(result[1].position).toBe(2);
      expect(result[2].position).toBe(3);
      expect(result).toEqual(sortedConfigs); // Data should be returned as-is from bundle endpoint
    });

    it('deduplicates concurrent requests for same config ID', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockFieldConfigs });

      // Start multiple concurrent requests for same config
      const [result1, result2, result3] = await Promise.all([
        fieldConfigCache.get('config-123'),
        fieldConfigCache.get('config-123'),
        fieldConfigCache.get('config-123'),
      ]);

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });

    it('skips cache when skipCache option is true', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockFieldConfigs });

      // First request to populate cache
      await fieldConfigCache.get('config-123');

      // Second request with skipCache should make new API call
      mockedAxios.get.mockResolvedValueOnce({ data: mockFieldConfigs });
      await fieldConfigCache.get('config-123', { skipCache: true });

      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });

    it('passes AbortSignal to axios request', async () => {
      const abortController = new AbortController();
      mockedAxios.get.mockResolvedValueOnce({ data: mockFieldConfigs });

      await fieldConfigCache.get('config-123', { signal: abortController.signal });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/list_item_configurations/config-123/list_item_field_configurations/bundle',
        { signal: abortController.signal },
      );
    });

    it('expires cached data after maxAge', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockFieldConfigs });

      // First request
      await fieldConfigCache.get('config-123');

      // Advance time past expiration (10 minutes + 1ms)
      (Date.now as jest.Mock).mockReturnValue(1000 + 10 * 60 * 1000 + 1);

      // Second request should fetch again
      mockedAxios.get.mockResolvedValueOnce({ data: mockFieldConfigs });
      await fieldConfigCache.get('config-123');

      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });

    it('throws error when API request fails', async () => {
      const error = new Error('Network error');
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(fieldConfigCache.get('config-123')).rejects.toThrow('Network error');
    });
  });

  describe('prefetch method', () => {
    const mockFieldConfigs: IListItemFieldConfiguration[] = [
      { id: '1', label: 'category', data_type: EListItemFieldType.FREE_TEXT, position: 1 },
    ];

    it('prefetches and caches field configurations', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockFieldConfigs });

      await fieldConfigCache.prefetch('config-123');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/list_item_configurations/config-123/list_item_field_configurations/bundle',
        { signal: undefined },
      );
      expect(fieldConfigCache.getStats().size).toBe(1);
    });

    it('does not prefetch if already cached', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockFieldConfigs });

      // First prefetch
      await fieldConfigCache.prefetch('config-123');

      // Second prefetch should not make API call
      await fieldConfigCache.prefetch('config-123');

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it('does not prefetch if request is already pending', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockFieldConfigs });

      // Start prefetch without waiting
      const prefetchPromise = fieldConfigCache.prefetch('config-123');

      // Start another prefetch while first is pending
      await fieldConfigCache.prefetch('config-123');
      await prefetchPromise;

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it('silently handles prefetch errors', async () => {
      const error = new Error('Network error');
      mockedAxios.get.mockRejectedValueOnce(error);

      // Should not throw
      await expect(fieldConfigCache.prefetch('config-123')).resolves.toBeUndefined();

      // Cache should remain empty
      expect(fieldConfigCache.getStats().size).toBe(0);
    });

    it('passes AbortSignal to prefetch request', async () => {
      const abortController = new AbortController();
      mockedAxios.get.mockResolvedValueOnce({ data: mockFieldConfigs });

      await fieldConfigCache.prefetch('config-123', abortController.signal);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/list_item_configurations/config-123/list_item_field_configurations/bundle',
        { signal: abortController.signal },
      );
    });
  });

  describe('prefetchIdle method', () => {
    const mockFieldConfigs: IListItemFieldConfiguration[] = [
      { id: '1', label: 'category', data_type: EListItemFieldType.FREE_TEXT, position: 1 },
    ];

    it('schedules prefetch using setTimeout', async () => {
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
      mockedAxios.get.mockResolvedValueOnce({ data: mockFieldConfigs });

      await fieldConfigCache.prefetchIdle('config-123');

      // Check that setTimeout was called with 100ms delay
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 100);

      setTimeoutSpy.mockRestore();
    });
  });

  describe('invalidate method', () => {
    it('removes cached entry for specific config ID', async () => {
      const mockFieldConfigs: IListItemFieldConfiguration[] = [
        { id: '1', label: 'category', data_type: EListItemFieldType.FREE_TEXT, position: 1 },
      ];

      mockedAxios.get.mockResolvedValueOnce({ data: mockFieldConfigs });

      // Cache the data
      await fieldConfigCache.get('config-123');
      expect(fieldConfigCache.getStats().size).toBe(1);

      // Invalidate
      fieldConfigCache.invalidate('config-123');
      expect(fieldConfigCache.getStats().size).toBe(0);
    });

    it('cancels pending request when invalidating', async () => {
      const mockFieldConfigs: IListItemFieldConfiguration[] = [
        { id: '1', label: 'category', data_type: EListItemFieldType.FREE_TEXT, position: 1 },
      ];

      mockedAxios.get.mockResolvedValueOnce({ data: mockFieldConfigs });

      // Start a request but don't wait for it
      const requestPromise = fieldConfigCache.get('config-123');

      // Verify there's a pending request
      expect(fieldConfigCache.getStats().pendingRequests).toBe(1);

      // Invalidate while request is pending
      fieldConfigCache.invalidate('config-123');

      // Pending request should be cancelled
      expect(fieldConfigCache.getStats().pendingRequests).toBe(0);

      // Complete the original request
      await requestPromise;
    });

    it('handles invalidate when no pending request exists', () => {
      // Test the else branch when no pending request exists
      fieldConfigCache.invalidate('non-existent-config');

      // Should not cause any errors
      expect(fieldConfigCache.getStats().pendingRequests).toBe(0);
      expect(fieldConfigCache.getStats().size).toBe(0);
    });
  });

  describe('cleanup method', () => {
    it('removes expired entries', async () => {
      const mockFieldConfigs: IListItemFieldConfiguration[] = [
        { id: '1', label: 'category', data_type: EListItemFieldType.FREE_TEXT, position: 1 },
      ];

      mockedAxios.get
        .mockResolvedValueOnce({ data: mockFieldConfigs })
        .mockResolvedValueOnce({ data: mockFieldConfigs });

      // Cache two different configs
      await fieldConfigCache.get('config-123');
      await fieldConfigCache.get('config-456');

      expect(fieldConfigCache.getStats().size).toBe(2);

      // Advance time past expiration
      (Date.now as jest.Mock).mockReturnValue(1000 + 10 * 60 * 1000 + 1);

      fieldConfigCache.cleanup();

      expect(fieldConfigCache.getStats().size).toBe(0);
    });

    it('does not remove non-expired entries during cleanup', async () => {
      const mockFieldConfigs: IListItemFieldConfiguration[] = [
        { id: '1', label: 'category', data_type: EListItemFieldType.FREE_TEXT, position: 1 },
      ];

      mockedAxios.get.mockResolvedValueOnce({ data: mockFieldConfigs });

      // Cache config
      await fieldConfigCache.get('config-123');
      expect(fieldConfigCache.getStats().size).toBe(1);

      // Advance time but not past expiration (only 5 minutes)
      (Date.now as jest.Mock).mockReturnValue(1000 + 5 * 60 * 1000);

      fieldConfigCache.cleanup();

      // Entry should still be there (not expired)
      expect(fieldConfigCache.getStats().size).toBe(1);
    });
  });

  describe('helper functions', () => {
    const mockFieldConfigs: IListItemFieldConfiguration[] = [
      { id: '1', label: 'category', data_type: EListItemFieldType.FREE_TEXT, position: 1 },
    ];

    it('getFieldConfigurations calls cache.get', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockFieldConfigs });

      const result = await getFieldConfigurations('config-123');

      expect(result).toEqual(mockFieldConfigs);
    });

    it('prefetchFieldConfigurations calls cache.prefetch', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockFieldConfigs });

      await prefetchFieldConfigurations('config-123');

      expect(fieldConfigCache.getStats().size).toBe(1);
    });

    it('prefetchFieldConfigurationsIdle calls cache.prefetchIdle', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockFieldConfigs });

      await prefetchFieldConfigurationsIdle('config-123');

      // Wait for idle callback
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(fieldConfigCache.getStats().size).toBe(1);
    });
  });

  describe('cache size management', () => {
    it('evicts oldest entries when cache reaches max size', async () => {
      const mockFieldConfigs: IListItemFieldConfiguration[] = [
        { id: '1', label: 'category', data_type: EListItemFieldType.FREE_TEXT, position: 1 },
      ];

      // Fill cache to max size (50 entries)
      for (let i = 0; i < 51; i++) {
        mockedAxios.get.mockResolvedValueOnce({ data: mockFieldConfigs });
        await fieldConfigCache.get(`config-${i}`);
      }

      // Should have evicted the oldest entry
      expect(fieldConfigCache.getStats().size).toBe(50);
    });

    it('handles cache cleanup when oldestKey exists', async () => {
      const mockFieldConfigs: IListItemFieldConfiguration[] = [
        { id: '1', label: 'category', data_type: EListItemFieldType.FREE_TEXT, position: 1 },
      ];

      // Add one entry to ensure oldestKey is not undefined
      mockedAxios.get.mockResolvedValueOnce({ data: mockFieldConfigs });
      await fieldConfigCache.get('config-first');

      // Add 50 more entries to trigger eviction
      for (let i = 0; i < 50; i++) {
        mockedAxios.get.mockResolvedValueOnce({ data: mockFieldConfigs });
        await fieldConfigCache.get(`config-${i}`);
      }

      // Should have evicted the first entry and have exactly 50 entries
      expect(fieldConfigCache.getStats().size).toBe(50);
    });

    it('does not evict when cache is under capacity', async () => {
      const mockFieldConfigs: IListItemFieldConfiguration[] = [
        { id: '1', label: 'category', data_type: EListItemFieldType.FREE_TEXT, position: 1 },
      ];

      // Add just a few entries (well under the 50 limit)
      for (let i = 0; i < 5; i++) {
        mockedAxios.get.mockResolvedValueOnce({ data: mockFieldConfigs });
        await fieldConfigCache.get(`config-${i}`);
      }

      // Should have all 5 entries (no eviction)
      expect(fieldConfigCache.getStats().size).toBe(5);
    });
  });
});
