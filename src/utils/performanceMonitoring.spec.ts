import { reportWebVitals, initWebVitalsMonitoring } from './performanceMonitoring';
import type { Metric } from 'web-vitals';

// Mock web-vitals module
const mockOnCLS = jest.fn();
const mockOnFCP = jest.fn();
const mockOnLCP = jest.fn();
const mockOnTTFB = jest.fn();
const mockOnINP = jest.fn();

jest.mock('web-vitals', () => ({
  onCLS: (...args: unknown[]): void => mockOnCLS(...args),
  onFCP: (...args: unknown[]): void => mockOnFCP(...args),
  onLCP: (...args: unknown[]): void => mockOnLCP(...args),
  onTTFB: (...args: unknown[]): void => mockOnTTFB(...args),
  onINP: (...args: unknown[]): void => mockOnINP(...args),
}));

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
    mockOnCLS.mockClear();
    mockOnFCP.mockClear();
    mockOnLCP.mockClear();
    mockOnTTFB.mockClear();
    mockOnINP.mockClear();
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
    it('initializes web vitals monitoring', () => {
      initWebVitalsMonitoring();

      // Verify all web vitals functions were called
      expect(mockOnCLS).toHaveBeenCalledWith(reportWebVitals);
      expect(mockOnFCP).toHaveBeenCalledWith(reportWebVitals);
      expect(mockOnLCP).toHaveBeenCalledWith(reportWebVitals);
      expect(mockOnTTFB).toHaveBeenCalledWith(reportWebVitals);
      expect(mockOnINP).toHaveBeenCalledWith(reportWebVitals);
    });

    it('handles errors gracefully in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // Suppress console.error re-throwing from setupTests.ts
      // eslint-disable-next-line no-console
      const originalConsoleError = console.error;
      const consoleErrorMock = jest.fn();
      // eslint-disable-next-line no-console
      console.error = consoleErrorMock;

      // Mock to throw error when functions are called
      mockOnCLS.mockImplementation(() => {
        throw new Error('Failed to initialize');
      });
      mockOnFCP.mockImplementation(() => {
        throw new Error('Failed to initialize');
      });
      mockOnLCP.mockImplementation(() => {
        throw new Error('Failed to initialize');
      });
      mockOnTTFB.mockImplementation(() => {
        throw new Error('Failed to initialize');
      });
      mockOnINP.mockImplementation(() => {
        throw new Error('Failed to initialize');
      });

      initWebVitalsMonitoring();

      // Should handle error gracefully and log in development
      expect(consoleErrorMock).toHaveBeenCalled();

      // eslint-disable-next-line no-console
      console.error = originalConsoleError;
      process.env.NODE_ENV = originalEnv;
    });

    it('handles errors silently in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      // Mock to throw error when functions are called
      mockOnCLS.mockImplementation(() => {
        throw new Error('Failed to initialize');
      });
      mockOnFCP.mockImplementation(() => {
        throw new Error('Failed to initialize');
      });
      mockOnLCP.mockImplementation(() => {
        throw new Error('Failed to initialize');
      });
      mockOnTTFB.mockImplementation(() => {
        throw new Error('Failed to initialize');
      });
      mockOnINP.mockImplementation(() => {
        throw new Error('Failed to initialize');
      });

      initWebVitalsMonitoring();

      // Should not throw and should not log in production
      expect(mockConsoleError).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });

    it('does nothing when window is undefined', () => {
      const originalWindow = global.window;
      // Delete window to simulate SSR environment
      // @ts-expect-error - intentionally deleting for test
      delete global.window;

      initWebVitalsMonitoring();

      // Should not call any web vitals functions
      expect(mockOnCLS).not.toHaveBeenCalled();
      expect(mockOnFCP).not.toHaveBeenCalled();
      expect(mockOnLCP).not.toHaveBeenCalled();
      expect(mockOnTTFB).not.toHaveBeenCalled();
      expect(mockOnINP).not.toHaveBeenCalled();

      global.window = originalWindow;
    });
  });
});
