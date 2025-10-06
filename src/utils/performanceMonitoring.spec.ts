import { performanceMonitor, usePerformanceMonitoring } from './performanceMonitoring';

// Mock performance.now
const mockPerformanceNow = jest.fn();
Object.defineProperty(performance, 'now', {
  value: mockPerformanceNow,
  writable: true,
});

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Mock console methods
const mockConsoleGroup = jest.fn();
const mockConsoleLog = jest.fn();
const mockConsoleGroupEnd = jest.fn();

Object.defineProperty(console, 'group', {
  value: mockConsoleGroup,
  writable: true,
});

Object.defineProperty(console, 'log', {
  value: mockConsoleLog,
  writable: true,
});

Object.defineProperty(console, 'groupEnd', {
  value: mockConsoleGroupEnd,
  writable: true,
});

describe('performanceMonitoring', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformanceNow.mockReturnValue(0);
    mockLocalStorage.getItem.mockReturnValue(null);
    // Reset the singleton instance
    (performanceMonitor as unknown as { isEnabled: boolean; metrics: unknown }).isEnabled = false;
    (performanceMonitor as unknown as { isEnabled: boolean; metrics: unknown }).metrics = null;
  });

  describe('PerformanceMonitor', () => {
    it('is enabled in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // Create a new instance to test constructor
      const monitor = new (performanceMonitor.constructor as new () => { isEnabled: boolean })();
      expect(monitor.isEnabled).toBe(true);

      process.env.NODE_ENV = originalEnv;
    });

    it('is disabled by default in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const monitor = new (performanceMonitor.constructor as new () => { isEnabled: boolean })();
      expect(monitor.isEnabled).toBe(false);

      process.env.NODE_ENV = originalEnv;
    });

    it('can be enabled via localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('true');

      const monitor = new (performanceMonitor.constructor as new () => { isEnabled: boolean })();
      expect(monitor.isEnabled).toBe(true);
    });

    it('starts a phase when enabled', () => {
      mockLocalStorage.getItem.mockReturnValue('true');
      mockPerformanceNow.mockReturnValue(100);
      (performanceMonitor as unknown as { isEnabled: boolean }).isEnabled = true;

      performanceMonitor.startPhase('pollStart');

      expect(mockPerformanceNow).toHaveBeenCalled();
    });

    it('does not start a phase when disabled', () => {
      mockLocalStorage.getItem.mockReturnValue('false');
      process.env.NODE_ENV = 'production';

      performanceMonitor.startPhase('pollStart');

      expect(mockPerformanceNow).not.toHaveBeenCalled();
    });

    it('ends a phase when enabled', () => {
      mockLocalStorage.getItem.mockReturnValue('true');
      mockPerformanceNow
        .mockReturnValueOnce(100) // pollStart
        .mockReturnValueOnce(200); // pollEnd
      (performanceMonitor as unknown as { isEnabled: boolean }).isEnabled = true;

      performanceMonitor.startPhase('pollStart');
      performanceMonitor.endPhase('pollEnd');

      expect(mockPerformanceNow).toHaveBeenCalledTimes(2);
    });

    it('does not end a phase when disabled', () => {
      mockLocalStorage.getItem.mockReturnValue('false');
      process.env.NODE_ENV = 'production';

      performanceMonitor.endPhase('pollEnd');

      expect(mockPerformanceNow).not.toHaveBeenCalled();
    });

    it('completes monitoring cycle and logs results', () => {
      mockLocalStorage.getItem.mockReturnValue('true');
      mockPerformanceNow
        .mockReturnValueOnce(100) // pollStart
        .mockReturnValueOnce(200) // pollEnd
        .mockReturnValueOnce(300) // mergeStart
        .mockReturnValueOnce(400) // mergeEnd
        .mockReturnValueOnce(500) // applyStart
        .mockReturnValueOnce(600) // applyEnd
        .mockReturnValueOnce(700); // complete
      (performanceMonitor as unknown as { isEnabled: boolean }).isEnabled = true;

      performanceMonitor.startPhase('pollStart');
      performanceMonitor.endPhase('pollEnd');
      performanceMonitor.startPhase('mergeStart');
      performanceMonitor.endPhase('mergeEnd');
      performanceMonitor.startPhase('applyStart');
      performanceMonitor.endPhase('applyEnd');
      performanceMonitor.complete();

      expect(mockConsoleGroup).toHaveBeenCalledWith('🚀 Performance Metrics');
      expect(mockConsoleLog).toHaveBeenCalledWith('📊 Poll Phase: 100.00ms');
      expect(mockConsoleLog).toHaveBeenCalledWith('🔄 Merge Phase: 100.00ms');
      expect(mockConsoleLog).toHaveBeenCalledWith('⚡ Apply Phase: 100.00ms');
      expect(mockConsoleLog).toHaveBeenCalledWith('⏱️ Total Time: 600.00ms');
      expect(mockConsoleGroupEnd).toHaveBeenCalled();
    });

    it('does not complete when disabled', () => {
      mockLocalStorage.getItem.mockReturnValue('false');
      process.env.NODE_ENV = 'production';

      performanceMonitor.complete();

      expect(mockConsoleGroup).not.toHaveBeenCalled();
    });

    it('does not complete when no metrics are available', () => {
      mockLocalStorage.getItem.mockReturnValue('true');

      performanceMonitor.complete();

      expect(mockConsoleGroup).not.toHaveBeenCalled();
    });

    it('returns current metrics', () => {
      mockLocalStorage.getItem.mockReturnValue('true');
      mockPerformanceNow.mockReturnValue(100);
      (performanceMonitor as unknown as { isEnabled: boolean }).isEnabled = true;

      performanceMonitor.startPhase('pollStart');

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toEqual({
        pollStart: 100,
        pollEnd: 0,
        mergeStart: 0,
        mergeEnd: 0,
        applyStart: 0,
        applyEnd: 0,
        totalTime: 0,
      });
    });

    it('returns null when disabled', () => {
      mockLocalStorage.getItem.mockReturnValue('false');
      process.env.NODE_ENV = 'production';

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toBeNull();
    });

    it('can be enabled/disabled', () => {
      performanceMonitor.setEnabled(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('PERFORMANCE_MONITORING', 'true');

      performanceMonitor.setEnabled(false);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('PERFORMANCE_MONITORING', 'false');
    });
  });

  describe('usePerformanceMonitoring', () => {
    it('provides performance monitoring functions', () => {
      const monitoring = usePerformanceMonitoring();

      expect(typeof monitoring.startPoll).toBe('function');
      expect(typeof monitoring.endPoll).toBe('function');
      expect(typeof monitoring.startMerge).toBe('function');
      expect(typeof monitoring.endMerge).toBe('function');
      expect(typeof monitoring.startApply).toBe('function');
      expect(typeof monitoring.endApply).toBe('function');
      expect(typeof monitoring.complete).toBe('function');
      expect(typeof monitoring.getMetrics).toBe('function');
    });

    it('calls performance monitor methods', () => {
      const startPhaseSpy = jest.spyOn(performanceMonitor, 'startPhase');
      const endPhaseSpy = jest.spyOn(performanceMonitor, 'endPhase');
      const completeSpy = jest.spyOn(performanceMonitor, 'complete');
      const getMetricsSpy = jest.spyOn(performanceMonitor, 'getMetrics');

      const monitoring = usePerformanceMonitoring();

      monitoring.startPoll();
      monitoring.endPoll();
      monitoring.startMerge();
      monitoring.endMerge();
      monitoring.startApply();
      monitoring.endApply();
      monitoring.complete();
      monitoring.getMetrics();

      expect(startPhaseSpy).toHaveBeenCalledWith('pollStart');
      expect(startPhaseSpy).toHaveBeenCalledWith('mergeStart');
      expect(startPhaseSpy).toHaveBeenCalledWith('applyStart');
      expect(endPhaseSpy).toHaveBeenCalledWith('pollEnd');
      expect(endPhaseSpy).toHaveBeenCalledWith('mergeEnd');
      expect(endPhaseSpy).toHaveBeenCalledWith('applyEnd');
      expect(completeSpy).toHaveBeenCalled();
      expect(getMetricsSpy).toHaveBeenCalled();
    });
  });
});
