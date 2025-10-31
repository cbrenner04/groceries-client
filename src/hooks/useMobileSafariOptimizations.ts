import { useEffect, useCallback, useRef, useState } from 'react';

interface MobileSafariOptimizations {
  isVisible: boolean;
  isLowMemory: boolean;
  cleanup: (cleanupFn: () => void) => void;
}

/**
 * Hook for visibility detection and cleanup registration
 * Note: Visibility is also checked by usePolling, but this provides
 * a way to register cleanup functions that run when tab becomes hidden
 */
export const useMobileSafariOptimizations = (): MobileSafariOptimizations => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLowMemory] = useState(false); // Always false - removed unreliable detection
  const cleanupFunctionsRef = useRef<(() => void)[]>([]);

  // Visibility detection
  const handleVisibilityChange = useCallback(() => {
    const newIsVisible = !document.hidden;
    setIsVisible(newIsVisible);

    if (!newIsVisible) {
      // Cleanup when tab becomes hidden
      cleanupFunctionsRef.current.forEach((cleanup) => cleanup());
    }
  }, []);

  // Component cleanup registration
  const registerCleanup = useCallback((cleanupFn: () => void) => {
    cleanupFunctionsRef.current.push(cleanupFn);
  }, []);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Run all cleanup functions on unmount
      cleanupFunctionsRef.current.forEach((cleanupFn) => cleanupFn());
      cleanupFunctionsRef.current = [];
    };
  }, [handleVisibilityChange]);

  return {
    isVisible,
    isLowMemory,
    cleanup: registerCleanup,
  };
};
