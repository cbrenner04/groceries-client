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
 * @param importFn - Function that returns a dynamic import
 */
export const preloadComponent = (importFn: () => Promise<{ default: ComponentType }>): void => {
  // Use requestIdleCallback for non-blocking preloading
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      importFn().catch(() => {
        // Silently handle preload failures
      });
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      importFn().catch(() => {
        // Silently handle preload failures
      });
    }, 0);
  }
};
