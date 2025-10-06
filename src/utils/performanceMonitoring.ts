/**
 * Performance monitoring utilities for tracking poll/merge/apply phases
 * and providing insights for Mobile Safari optimization
 */

interface PerformanceMetrics {
  pollStart: number;
  pollEnd: number;
  mergeStart: number;
  mergeEnd: number;
  applyStart: number;
  applyEnd: number;
  totalTime: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics | null = null;
  private isEnabled = false;

  constructor() {
    // Enable performance monitoring in development or when explicitly enabled
    this.isEnabled =
      process.env.NODE_ENV === 'development' || localStorage.getItem('PERFORMANCE_MONITORING') === 'true';
  }

  /**
   * Start monitoring a performance phase
   */
  startPhase(phase: keyof Omit<PerformanceMetrics, 'totalTime'>): void {
    if (!this.isEnabled) {
      return;
    }

    if (!this.metrics) {
      this.metrics = {
        pollStart: 0,
        pollEnd: 0,
        mergeStart: 0,
        mergeEnd: 0,
        applyStart: 0,
        applyEnd: 0,
        totalTime: 0,
      };
    }

    this.metrics[phase] = performance.now();
  }

  /**
   * End monitoring a performance phase
   */
  endPhase(phase: keyof Omit<PerformanceMetrics, 'totalTime'>): void {
    if (!this.isEnabled || !this.metrics) {
      return;
    }

    this.metrics[phase] = performance.now();
  }

  /**
   * Complete the performance monitoring cycle and log results
   */
  complete(): void {
    if (!this.isEnabled || !this.metrics) {
      return;
    }

    this.metrics.totalTime = performance.now() - this.metrics.pollStart;

    const pollTime = this.metrics.pollEnd - this.metrics.pollStart;
    const mergeTime = this.metrics.mergeEnd - this.metrics.mergeStart;
    const applyTime = this.metrics.applyEnd - this.metrics.applyStart;

    // eslint-disable-next-line no-console
    console.group('🚀 Performance Metrics');
    // eslint-disable-next-line no-console
    console.log(`📊 Poll Phase: ${pollTime.toFixed(2)}ms`);
    // eslint-disable-next-line no-console
    console.log(`🔄 Merge Phase: ${mergeTime.toFixed(2)}ms`);
    // eslint-disable-next-line no-console
    console.log(`⚡ Apply Phase: ${applyTime.toFixed(2)}ms`);
    // eslint-disable-next-line no-console
    console.log(`⏱️ Total Time: ${this.metrics.totalTime.toFixed(2)}ms`);
    // eslint-disable-next-line no-console
    console.groupEnd();

    // Reset for next cycle
    this.metrics = null;
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics | null {
    return this.metrics;
  }

  /**
   * Enable or disable performance monitoring
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    localStorage.setItem('PERFORMANCE_MONITORING', enabled.toString());
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Hook for easy performance monitoring in React components
 */
export const usePerformanceMonitoring = (): {
  startPoll: () => void;
  endPoll: () => void;
  startMerge: () => void;
  endMerge: () => void;
  startApply: () => void;
  endApply: () => void;
  complete: () => void;
  getMetrics: () => PerformanceMetrics | null;
} => {
  const startPoll = (): void => performanceMonitor.startPhase('pollStart');
  const endPoll = (): void => performanceMonitor.endPhase('pollEnd');
  const startMerge = (): void => performanceMonitor.startPhase('mergeStart');
  const endMerge = (): void => performanceMonitor.endPhase('mergeEnd');
  const startApply = (): void => performanceMonitor.startPhase('applyStart');
  const endApply = (): void => performanceMonitor.endPhase('applyEnd');
  const complete = (): void => performanceMonitor.complete();

  return {
    startPoll,
    endPoll,
    startMerge,
    endMerge,
    startApply,
    endApply,
    complete,
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
  };
};
