import {
  getFieldConfigurations,
  prefetchFieldConfigurations,
  prefetchFieldConfigurationsIdle,
  clearFieldConfigCache,
  invalidateFieldConfigCache,
} from './fieldConfigCache';
import axios from './api';
import { unifiedCache } from './lightweightCache';
import { type IListItemFieldConfiguration, EListItemFieldType } from '../typings';

// Mock axios
jest.mock('./api');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('FieldConfigurationCache', () => {
  let originalDateNow: () => number;

  beforeEach(() => {
    jest.clearAllMocks();
    unifiedCache.clear();
    clearFieldConfigCache();

    // Mock Date.now() for predictable timing
    originalDateNow = Date.now;
    Date.now = jest.fn(() => 1000);
  });

  afterEach(() => {
    Date.now = originalDateNow;
  });

  describe('getFieldConfigurations', () => {
    const mockFieldConfigs: IListItemFieldConfiguration[] = [
      { id: '1', label: 'category', data_type: EListItemFieldType.FREE_TEXT, position: 1, primary: true },
      { id: '2', label: 'notes', data_type: EListItemFieldType.FREE_TEXT, position: 2, primary: false },
    ];

    it('fetches and caches field configurations on first request', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockFieldConfigs });

      const result = await getFieldConfigurations('config-123');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/list_item_configurations/config-123/list_item_field_configurations/bundle',
        { signal: undefined },
      );
      expect(result).toEqual(mockFieldConfigs);
    });

    it('returns cached data on subsequent requests', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockFieldConfigs });

      // First request
      await getFieldConfigurations('config-123');

      // Second request - should use cache
      const result = await getFieldConfigurations('config-123');

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

      const result = await getFieldConfigurations('config-123');

      expect(result[0].position).toBe(1);
      expect(result[1].position).toBe(2);
      expect(result[2].position).toBe(3);
      expect(result).toEqual(sortedConfigs);
    });

    it('deduplicates concurrent requests for same config ID', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockFieldConfigs });

      // Start multiple concurrent requests for same config
      const [result1, result2, result3] = await Promise.all([
        getFieldConfigurations('config-123'),
        getFieldConfigurations('config-123'),
        getFieldConfigurations('config-123'),
      ]);

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });

    it('skips cache when skipCache option is true', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockFieldConfigs });

      // First request to populate cache
      await getFieldConfigurations('config-123');

      // Second request with skipCache should make new API call
      await getFieldConfigurations('config-123', { skipCache: true });

      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });

    it('passes AbortSignal to axios request', async () => {
      const abortController = new AbortController();
      mockedAxios.get.mockResolvedValueOnce({ data: mockFieldConfigs });

      await getFieldConfigurations('config-123', { signal: abortController.signal });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/list_item_configurations/config-123/list_item_field_configurations/bundle',
        { signal: abortController.signal },
      );
    });

    it('expires cached data after maxAge', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockFieldConfigs });

      // First request
      await getFieldConfigurations('config-123');

      // Advance time past expiration (5 minutes + 1ms)
      (Date.now as jest.Mock).mockReturnValue(1000 + 5 * 60 * 1000 + 1);

      // Second request should fetch again
      mockedAxios.get.mockResolvedValueOnce({ data: mockFieldConfigs });
      await getFieldConfigurations('config-123');

      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });

    it('throws error when API request fails', async () => {
      const error = new Error('Network error');
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(getFieldConfigurations('config-123')).rejects.toThrow('Network error');
    });
  });

  describe('prefetchFieldConfigurations', () => {
    const mockFieldConfigs: IListItemFieldConfiguration[] = [
      { id: '1', label: 'category', data_type: EListItemFieldType.FREE_TEXT, position: 1, primary: true },
    ];

    it('prefetches and caches field configurations', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockFieldConfigs });

      await prefetchFieldConfigurations('config-123');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/list_item_configurations/config-123/list_item_field_configurations/bundle',
        { signal: undefined },
      );
    });

    it('does not prefetch if already cached', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockFieldConfigs });

      // First prefetch
      await prefetchFieldConfigurations('config-123');

      // Second prefetch should not make API call
      await prefetchFieldConfigurations('config-123');

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it('does not prefetch if request is already pending', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockFieldConfigs });

      // Start prefetch without waiting
      const prefetchPromise = prefetchFieldConfigurations('config-123');

      // Start another prefetch while first is pending
      await prefetchFieldConfigurations('config-123');
      await prefetchPromise;

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it('silently handles prefetch errors', async () => {
      const error = new Error('Network error');
      mockedAxios.get.mockRejectedValueOnce(error);

      // Should not throw
      await expect(prefetchFieldConfigurations('config-123')).resolves.toBeUndefined();
    });

    it('passes AbortSignal to prefetch request', async () => {
      const abortController = new AbortController();
      mockedAxios.get.mockResolvedValueOnce({ data: mockFieldConfigs });

      await prefetchFieldConfigurations('config-123', abortController.signal);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/list_item_configurations/config-123/list_item_field_configurations/bundle',
        { signal: abortController.signal },
      );
    });
  });

  describe('prefetchFieldConfigurationsIdle', () => {
    const mockFieldConfigs: IListItemFieldConfiguration[] = [
      { id: '1', label: 'category', data_type: EListItemFieldType.FREE_TEXT, position: 1, primary: true },
    ];

    it('schedules prefetch using setTimeout', async () => {
      jest.useFakeTimers();
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
      mockedAxios.get.mockResolvedValueOnce({ data: mockFieldConfigs });

      const prefetchPromise = prefetchFieldConfigurationsIdle('config-123');

      // Check that setTimeout was called with 100ms delay
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 100);

      // Advance timers to complete the prefetch
      jest.advanceTimersByTime(100);
      await prefetchPromise;

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      setTimeoutSpy.mockRestore();
      jest.useRealTimers();
    });
  });

  describe('invalidateFieldConfigCache', () => {
    it('clears pending requests for specific config ID', async () => {
      const mockFieldConfigs: IListItemFieldConfiguration[] = [
        { id: '1', label: 'category', data_type: EListItemFieldType.FREE_TEXT, position: 1, primary: true },
      ];

      mockedAxios.get.mockResolvedValueOnce({ data: mockFieldConfigs });

      // Start a request but don't wait for it
      const requestPromise = getFieldConfigurations('config-123');

      // Invalidate while request is pending
      invalidateFieldConfigCache('config-123');

      // Complete the original request
      await requestPromise;
    });

    it('handles invalidate when no pending request exists', () => {
      // Should not cause any errors
      invalidateFieldConfigCache('non-existent-config');
    });
  });

  describe('clearFieldConfigCache', () => {
    it('clears all pending requests', () => {
      // Should not cause any errors
      clearFieldConfigCache();
    });
  });
});
