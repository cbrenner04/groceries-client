import { useEffect, useCallback, useRef, useState } from 'react';

interface MobileSafariOptimizations {
  isVisible: boolean;
  isLowMemory: boolean;
  cleanup: (cleanupFn: () => void) => void;
}

/**
 * Hook for iOS Safari specific optimizations including:
 * - Enhanced visibility detection for aggressive tab freezing
 * - Memory pressure handling and component cleanup
 * - Touch performance optimization with passive event listeners
 * - Network retry logic for poor mobile connections
 */
export const useMobileSafariOptimizations = (): MobileSafariOptimizations => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLowMemory, setIsLowMemory] = useState(false);
  const cleanupFunctionsRef = useRef<(() => void)[]>([]);

  // Enhanced visibility detection for aggressive tab freezing
  const handleVisibilityChange = useCallback(() => {
    const newIsVisible = !document.hidden;
    setIsVisible(newIsVisible);

    if (!newIsVisible) {
      // Aggressive cleanup when tab becomes hidden
      cleanupFunctionsRef.current.forEach((cleanup) => cleanup());
    }
  }, []);

  // Memory pressure detection (iOS Safari specific)
  const handleMemoryPressure = useCallback(() => {
    setIsLowMemory(true);

    // Force garbage collection hints
    if ('gc' in window && typeof (window as unknown as { gc: () => void }).gc === 'function') {
      (window as unknown as { gc: () => void }).gc();
    }

    // Clear any cached data
    cleanupFunctionsRef.current.forEach((cleanup) => cleanup());
  }, []);

  // Touch performance optimization
  const optimizeTouchEvents = useCallback(() => {
    // Add passive event listeners for better scroll performance
    const touchEvents = ['touchstart', 'touchmove', 'touchend', 'touchcancel'];

    const passiveListener = (e: Event): void => {
      e.preventDefault();
    };

    touchEvents.forEach((eventType) => {
      document.addEventListener(eventType, passiveListener, { passive: true });
      cleanupFunctionsRef.current.push(() => {
        document.removeEventListener(eventType, passiveListener);
      });
    });
  }, []);

  // Network retry logic for poor mobile connections
  const setupNetworkRetry = useCallback(() => {
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 1000; // Start with 1 second

    const retryWithBackoff = (fn: () => Promise<unknown>, delay: number = retryDelay): Promise<unknown> => {
      return fn().catch((error) => {
        if (retryCount < maxRetries && error.code === 'NETWORK_ERROR') {
          retryCount++;
          const nextDelay = delay * Math.pow(2, retryCount - 1); // Exponential backoff

          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(retryWithBackoff(fn, nextDelay));
            }, nextDelay);
          });
        }
        throw error;
      });
    };

    // Store retry function globally for use in API calls
    (window as unknown as { retryWithBackoff: typeof retryWithBackoff }).retryWithBackoff = retryWithBackoff;
  }, []);

  // Component cleanup registration
  const registerCleanup = useCallback((cleanupFn: () => void) => {
    cleanupFunctionsRef.current.push(cleanupFn);
  }, []);

  // Main cleanup function
  const cleanup = useCallback(() => {
    cleanupFunctionsRef.current.forEach((cleanupFn) => cleanupFn());
    cleanupFunctionsRef.current = [];
  }, []);

  useEffect(() => {
    // Set up visibility change detection
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Set up memory pressure detection (iOS Safari)
    const performanceWithMemory = performance as unknown as {
      memory?: { usedJSHeapSize: number; totalJSHeapSize: number };
    };
    if ('memory' in performance && performanceWithMemory.memory) {
      const checkMemoryPressure = (): void => {
        const memory = performanceWithMemory.memory!;
        const usedMemory = memory.usedJSHeapSize;
        const totalMemory = memory.totalJSHeapSize;
        const memoryUsage = usedMemory / totalMemory;

        if (memoryUsage > 0.8) {
          // 80% memory usage threshold
          handleMemoryPressure();
        }
      };

      const memoryCheckInterval = setInterval(checkMemoryPressure, 5000);
      cleanupFunctionsRef.current.push(() => clearInterval(memoryCheckInterval));
    }

    // Set up touch optimizations
    optimizeTouchEvents();

    // Set up network retry logic
    setupNetworkRetry();

    // Cleanup on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cleanup();
    };
  }, [handleVisibilityChange, handleMemoryPressure, optimizeTouchEvents, setupNetworkRetry, cleanup]);

  return {
    isVisible,
    isLowMemory,
    cleanup: registerCleanup,
  };
};
