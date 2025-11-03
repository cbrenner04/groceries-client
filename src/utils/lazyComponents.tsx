import React, { type ComponentType, Suspense } from 'react';
import Loading from 'components/Loading';

/**
 * Creates a lazy-loaded component with a loading fallback optimized for Mobile Safari
 * @param importFn - Function that returns a dynamic import
 * @param fallback - Optional custom fallback component (defaults to Loading)
 * @returns Lazy component wrapped with Suspense
 */
export const createLazyComponent = <P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback: ComponentType = Loading,
): ComponentType<P> => {
  const LazyComponent = React.lazy(importFn);

  const LazyComponentWithSuspense = (props: P): React.JSX.Element => {
    const FallbackComponent = fallback;
    return (
      <Suspense fallback={<FallbackComponent />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };

  LazyComponentWithSuspense.displayName = `LazyComponent(${importFn.name || 'Unknown'})`;

  return LazyComponentWithSuspense;
};

/**
 * Preloads a component for better perceived performance
 * Uses requestIdleCallback to defer loading until the browser is idle
 * @param importFn - Function that returns a dynamic import
 */
export const preloadComponent = (importFn: () => Promise<{ default: ComponentType }>): void => {
  const DEFAULT_PRELOAD_TIMEOUT = 100;
  const DEFAULT_PRELOAD_IDLE_TIMEOUT = 2000;

  if ('requestIdleCallback' in window) {
    requestIdleCallback(
      () => {
        importFn().catch((error) => {
          // Only log errors in development to avoid noise in production
          if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.warn('Failed to preload component:', error);
          }
        });
      },
      { timeout: DEFAULT_PRELOAD_IDLE_TIMEOUT }, // Fallback timeout to ensure it eventually runs
    );
  } else {
    // Fallback: Use a small delay to allow other critical work to complete
    setTimeout(() => {
      importFn().catch((error) => {
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.warn('Failed to preload component:', error);
        }
      });
    }, DEFAULT_PRELOAD_TIMEOUT);
  }
};
