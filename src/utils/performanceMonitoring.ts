import type { Metric } from 'web-vitals';

// ============================================================================
// Web Vitals Tracking
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
