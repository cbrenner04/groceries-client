import {
  createRequestDeduplicator,
  listDeduplicator,
  listsDeduplicator,
  shareListDeduplicator,
} from './requestDeduplication';

describe('RequestDeduplicator', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('createRequestDeduplicator', () => {
    it('creates a deduplicator with default timeout', () => {
      const deduplicator = createRequestDeduplicator<string>();
      expect(deduplicator).toBeDefined();
      expect(deduplicator.getPendingCount()).toBe(0);
    });

    it('creates a deduplicator with custom timeout', () => {
      const deduplicator = createRequestDeduplicator<string>(5000);
      expect(deduplicator).toBeDefined();
      expect(deduplicator.getPendingCount()).toBe(0);
    });
  });

  describe('execute', () => {
    it('executes a new request', async () => {
      const deduplicator = createRequestDeduplicator<string>();
      const requestFn = jest.fn().mockResolvedValue('test result');

      const result = await deduplicator.execute('test-key', requestFn);

      expect(result).toBe('test result');
      expect(requestFn).toHaveBeenCalledTimes(1);
    });

    it('deduplicates concurrent requests with the same key', async () => {
      const deduplicator = createRequestDeduplicator<string>();
      const requestFn = jest.fn().mockResolvedValue('test result');

      // Start two concurrent requests with the same key
      const promise1 = deduplicator.execute('test-key', requestFn);
      const promise2 = deduplicator.execute('test-key', requestFn);

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).toBe('test result');
      expect(result2).toBe('test result');
      expect(requestFn).toHaveBeenCalledTimes(1); // Only called once
    });

    it('allows different keys to execute separately', async () => {
      const deduplicator = createRequestDeduplicator<string>();
      const requestFn1 = jest.fn().mockResolvedValue('result 1');
      const requestFn2 = jest.fn().mockResolvedValue('result 2');

      const [result1, result2] = await Promise.all([
        deduplicator.execute('key-1', requestFn1),
        deduplicator.execute('key-2', requestFn2),
      ]);

      expect(result1).toBe('result 1');
      expect(result2).toBe('result 2');
      expect(requestFn1).toHaveBeenCalledTimes(1);
      expect(requestFn2).toHaveBeenCalledTimes(1);
    });

    it('cleans up completed requests', async () => {
      const deduplicator = createRequestDeduplicator<string>();
      const requestFn = jest.fn().mockResolvedValue('test result');

      expect(deduplicator.getPendingCount()).toBe(0);

      const promise = deduplicator.execute('test-key', requestFn);
      expect(deduplicator.getPendingCount()).toBe(1);

      await promise;
      expect(deduplicator.getPendingCount()).toBe(0);
    });

    it('handles request timeout and allows new request', async () => {
      const deduplicator = createRequestDeduplicator<string>(1000); // 1 second timeout
      const requestFn1 = jest
        .fn()
        .mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve('result 1'), 2000)));
      const requestFn2 = jest.fn().mockResolvedValue('result 2');

      // Start first request
      const promise1 = deduplicator.execute('test-key', requestFn1);

      // Advance time beyond timeout
      jest.advanceTimersByTime(1500);

      // Start second request - should execute because first is considered timed out
      const promise2 = deduplicator.execute('test-key', requestFn2);

      // Complete second request
      const result2 = await promise2;
      expect(result2).toBe('result 2');
      expect(requestFn2).toHaveBeenCalledTimes(1);

      // Complete first request
      jest.advanceTimersByTime(1000);
      const result1 = await promise1;
      expect(result1).toBe('result 1');
      expect(requestFn1).toHaveBeenCalledTimes(1);
    });

    it('handles rejected promises', async () => {
      const deduplicator = createRequestDeduplicator<string>();
      const error = new Error('Request failed');
      const requestFn = jest.fn().mockRejectedValue(error);

      await expect(deduplicator.execute('test-key', requestFn)).rejects.toThrow('Request failed');

      // Should clean up after rejection
      expect(deduplicator.getPendingCount()).toBe(0);
    });
  });

  describe('isPending', () => {
    it('returns false for non-existent key', () => {
      const deduplicator = createRequestDeduplicator<string>();
      expect(deduplicator.isPending('non-existent')).toBe(false);
    });

    it('returns true for pending request', async () => {
      const deduplicator = createRequestDeduplicator<string>();
      const requestFn = jest.fn().mockImplementation(() => new Promise(() => undefined)); // Never resolves

      deduplicator.execute('test-key', requestFn);
      expect(deduplicator.isPending('test-key')).toBe(true);
    });

    it('returns false after request completes', async () => {
      const deduplicator = createRequestDeduplicator<string>();
      const requestFn = jest.fn().mockResolvedValue('result');

      await deduplicator.execute('test-key', requestFn);
      expect(deduplicator.isPending('test-key')).toBe(false);
    });
  });

  describe('clear', () => {
    it('clears all pending requests', () => {
      const deduplicator = createRequestDeduplicator<string>();
      const requestFn = jest.fn().mockImplementation(() => new Promise(() => undefined)); // Never resolves

      deduplicator.execute('key-1', requestFn);
      deduplicator.execute('key-2', requestFn);

      expect(deduplicator.getPendingCount()).toBe(2);

      deduplicator.clear();

      expect(deduplicator.getPendingCount()).toBe(0);
      expect(deduplicator.isPending('key-1')).toBe(false);
      expect(deduplicator.isPending('key-2')).toBe(false);
    });
  });

  describe('getPendingCount', () => {
    it('returns correct count of pending requests', async () => {
      const deduplicator = createRequestDeduplicator<string>();
      const requestFn = jest.fn().mockResolvedValue('result');

      expect(deduplicator.getPendingCount()).toBe(0);

      const promise1 = deduplicator.execute('key-1', requestFn);
      expect(deduplicator.getPendingCount()).toBe(1);

      const promise2 = deduplicator.execute('key-2', requestFn);
      expect(deduplicator.getPendingCount()).toBe(2);

      // Same key should not increase count
      const promise3 = deduplicator.execute('key-1', requestFn);
      expect(deduplicator.getPendingCount()).toBe(2);

      await Promise.all([promise1, promise2, promise3]);
      expect(deduplicator.getPendingCount()).toBe(0);
    });
  });

  describe('global deduplicator instances', () => {
    it('exports listDeduplicator instance', () => {
      expect(listDeduplicator).toBeDefined();
      expect(listDeduplicator.getPendingCount()).toBe(0);
    });

    it('exports listsDeduplicator instance', () => {
      expect(listsDeduplicator).toBeDefined();
      expect(listsDeduplicator.getPendingCount()).toBe(0);
    });

    it('exports shareListDeduplicator instance', () => {
      expect(shareListDeduplicator).toBeDefined();
      expect(shareListDeduplicator.getPendingCount()).toBe(0);
    });

    it('global instances are separate from each other', async () => {
      const requestFn = jest.fn().mockResolvedValue('result');

      await Promise.all([
        listDeduplicator.execute('test', requestFn),
        listsDeduplicator.execute('test', requestFn),
        shareListDeduplicator.execute('test', requestFn),
      ]);

      // Each should have executed the request separately
      expect(requestFn).toHaveBeenCalledTimes(3);
    });
  });
});
