import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';

/**
 * Hook to detect navigation focus events and trigger immediate sync operations
 * This helps reduce perceived staleness when users navigate between routes
 */
export function useNavigationFocus(callback: () => void | Promise<void>): void {
  const callbackRef = useRef<() => void | Promise<void>>(callback);
  const locationRef = useRef<string>('');
  const location = useLocation();

  // Keep latest callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    // Check if this is a new navigation (not initial mount)
    if (locationRef.current && locationRef.current !== location.pathname) {
      // Small delay to ensure the new route is fully mounted
      const timeoutId = setTimeout(() => {
        void Promise.resolve(callbackRef.current());
      }, 100);

      return () => clearTimeout(timeoutId);
    }

    // Update location reference
    locationRef.current = location.pathname;
  }, [location.pathname]);
}
