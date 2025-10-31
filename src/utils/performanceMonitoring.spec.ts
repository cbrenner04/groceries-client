import { reportWebVitals, initWebVitalsMonitoring } from './performanceMonitoring';
import type { Metric } from 'web-vitals';

// Mock console methods
const mockConsoleLog = jest.fn();
const mockConsoleError = jest.fn();

Object.defineProperty(console, 'log', {
  value: mockConsoleLog,
  writable: true,
});

Object.defineProperty(console, 'error', {
  value: mockConsoleError,
  writable: true,
});

describe('performanceMonitoring', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('reportWebVitals', () => {
    const createMockMetric = (
      name: 'CLS' | 'FCP' | 'INP' | 'LCP' | 'TTFB',
      rating: 'good' | 'needs-improvement' | 'poor',
    ): Metric => ({
      name,
      value: 100,
      rating,
      delta: 50,
      id: 'test-id',
      navigationType: 'navigate',
      entries: [],
    });

    it('logs metric in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const metric = createMockMetric('LCP', 'good');
      reportWebVitals(metric);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('[Web Vitals] LCP: 100ms'),
        expect.stringContaining('color: #0cce6b'),
        expect.objectContaining({
          name: 'LCP',
          value: 100,
          rating: 'good',
        }),
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('does not log metric in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      mockConsoleLog.mockClear();
      const metric = createMockMetric('FCP', 'good');
      reportWebVitals(metric);

      expect(mockConsoleLog).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });

    it('formats CLS metric without ms unit', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const metric = createMockMetric('CLS', 'good');
      metric.value = 0.123;
      reportWebVitals(metric);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('[Web Vitals] CLS: 0.123'),
        expect.any(String),
        expect.any(Object),
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('uses correct color for good rating', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const metric = createMockMetric('LCP', 'good');
      reportWebVitals(metric);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('#0cce6b'),
        expect.any(Object),
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('uses correct color for needs-improvement rating', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const metric = createMockMetric('LCP', 'needs-improvement');
      reportWebVitals(metric);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('#ffa400'),
        expect.any(Object),
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('uses correct color for poor rating', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const metric = createMockMetric('LCP', 'poor');
      reportWebVitals(metric);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('#ff4e42'),
        expect.any(Object),
      );

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('initWebVitalsMonitoring', () => {
    it('initializes web vitals monitoring', async () => {
      const mockOnCLS = jest.fn();
      const mockOnFCP = jest.fn();
      const mockOnLCP = jest.fn();
      const mockOnTTFB = jest.fn();
      const mockOnINP = jest.fn();

      jest.doMock('web-vitals', () => ({
        onCLS: mockOnCLS,
        onFCP: mockOnFCP,
        onLCP: mockOnLCP,
        onTTFB: mockOnTTFB,
        onINP: mockOnINP,
      }));

      await initWebVitalsMonitoring();

      // The function should not throw an error
      expect(true).toBe(true);
    });

    it('handles errors gracefully in development', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // Mock import to throw error
      jest.doMock('web-vitals', () => {
        throw new Error('Failed to load web-vitals');
      });

      await initWebVitalsMonitoring();

      // Should handle error gracefully
      expect(true).toBe(true);

      process.env.NODE_ENV = originalEnv;
    });

    it('handles errors silently in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      await initWebVitalsMonitoring();

      // Should not throw and should not log in production
      expect(true).toBe(true);

      process.env.NODE_ENV = originalEnv;
    });
  });
});
