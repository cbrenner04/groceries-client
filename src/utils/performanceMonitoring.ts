import type { Metric } from 'web-vitals';

// ============================================================================
// Existing Performance Monitoring (Poll/Merge/Apply phases)
// ============================================================================

interface PerformanceMetrics {
  pollStart: number;
  pollEnd: number;
  mergeStart: number;
  mergeEnd: number;
  applyStart: number;
  applyEnd: number;
  totalTime: number;
}

type PhaseKey = keyof Omit<PerformanceMetrics, 'totalTime'>;

class PerformanceMonitor {
  private isEnabled: boolean;
  private metrics: PerformanceMetrics | null = null;

  constructor() {
    const isLocalStorageEnabled =
      typeof window !== 'undefined' && window.localStorage.getItem('PERFORMANCE_MONITORING') === 'true';
    this.isEnabled = process.env.NODE_ENV === 'development' || isLocalStorageEnabled;
  }

  public startPhase(phase: PhaseKey): void {
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

  public endPhase(phase: PhaseKey): void {
    if (!this.isEnabled) {
      return;
    }

    if (!this.metrics) {
      return;
    }

    this.metrics[phase] = performance.now();
  }

  public complete(): void {
    if (!this.isEnabled || !this.metrics) {
      return;
    }

    const pollTime = this.metrics.pollEnd - this.metrics.pollStart;
    const mergeTime = this.metrics.mergeEnd - this.metrics.mergeStart;
    const applyTime = this.metrics.applyEnd - this.metrics.applyStart;
    const totalTime = this.metrics.applyEnd - this.metrics.pollStart;

    this.metrics.totalTime = totalTime;

    // eslint-disable-next-line no-console
    console.group('🚀 Performance Metrics');
    // eslint-disable-next-line no-console
    console.log(`📊 Poll Phase: ${pollTime.toFixed(2)}ms`);
    // eslint-disable-next-line no-console
    console.log(`🔄 Merge Phase: ${mergeTime.toFixed(2)}ms`);
    // eslint-disable-next-line no-console
    console.log(`⚡ Apply Phase: ${applyTime.toFixed(2)}ms`);
    // eslint-disable-next-line no-console
    console.log(`⏱️ Total Time: ${totalTime.toFixed(2)}ms`);
    // eslint-disable-next-line no-console
    console.groupEnd();

    this.metrics = null;
  }

  public getMetrics(): PerformanceMetrics | null {
    if (!this.isEnabled) {
      return null;
    }
    return this.metrics;
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('PERFORMANCE_MONITORING', enabled.toString());
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

export function usePerformanceMonitoring(): {
  startPoll: () => void;
  endPoll: () => void;
  startMerge: () => void;
  endMerge: () => void;
  startApply: () => void;
  endApply: () => void;
  complete: () => void;
  getMetrics: () => PerformanceMetrics | null;
} {
  return {
    startPoll: () => performanceMonitor.startPhase('pollStart'),
    endPoll: () => performanceMonitor.endPhase('pollEnd'),
    startMerge: () => performanceMonitor.startPhase('mergeStart'),
    endMerge: () => performanceMonitor.endPhase('mergeEnd'),
    startApply: () => performanceMonitor.startPhase('applyStart'),
    endApply: () => performanceMonitor.endPhase('applyEnd'),
    complete: () => performanceMonitor.complete(),
    getMetrics: () => performanceMonitor.getMetrics(),
  };
}

// ============================================================================
// Web Vitals Tracking (New)
// ============================================================================

export interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

/**
 * Abstracted reporting layer for Web Vitals metrics.
 * Currently logs to console in development, structured for future service integration.
 *
 * To integrate with a monitoring service (Sentry, DataDog, etc.):
 * 1. Add the service SDK to dependencies
 * 2. Replace the console.log calls with service-specific reporting
 * 3. Keep the metric transformation logic intact
 */
export function reportWebVitals(metric: Metric): void {
  const webVitalsMetric: WebVitalsMetric = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
  };

  // Development: Log to console with formatting
  if (process.env.NODE_ENV === 'development') {
    const color = getRatingColor(metric.rating);
    // eslint-disable-next-line no-console
    console.log(
      `%c[Web Vitals] ${metric.name}: ${formatMetricValue(metric)}`,
      `color: ${color}; font-weight: bold`,
      webVitalsMetric,
    );
  }

  // Production: Structure for future service integration
  // Example integrations:
  //
  // Sentry:
  // Sentry.captureMessage(`Web Vital: ${metric.name}`, {
  //   level: 'info',
  //   tags: { metric: metric.name, rating: metric.rating },
  //   extra: webVitalsMetric,
  // });
  //
  // DataDog:
  // datadogRum.addTiming(metric.name, metric.value);
  //
  // Custom endpoint:
  // fetch('/api/metrics', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(webVitalsMetric),
  // });
}

/**
 * Format metric value based on metric type
 */
function formatMetricValue(metric: Metric): string {
  // CLS is unitless, others are in milliseconds
  if (metric.name === 'CLS') {
    return metric.value.toFixed(3);
  }
  return `${Math.round(metric.value)}ms`;
}

/**
 * Get color for console logging based on rating
 */
function getRatingColor(rating: 'good' | 'needs-improvement' | 'poor'): string {
  switch (rating) {
    case 'good':
      return '#0cce6b';
    case 'needs-improvement':
      return '#ffa400';
    case 'poor':
      return '#ff4e42';
  }
}

/**
 * Initialize Web Vitals monitoring
 * Call this once on app initialization
 */
export async function initWebVitalsMonitoring(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const { onCLS, onFCP, onLCP, onTTFB, onINP } = await import('web-vitals');

    // Track all Core Web Vitals
    onCLS(reportWebVitals);
    onFCP(reportWebVitals);
    onLCP(reportWebVitals);
    onTTFB(reportWebVitals);
    onINP(reportWebVitals);
  } catch (error) {
    // Only log in development - Lighthouse audits fail on console errors
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Failed to initialize Web Vitals monitoring:', error);
    }
    // In production, silently fail (or report to monitoring service when integrated)
  }
}
