import { useEffect, useRef, startTransition, useMemo } from 'react';
import { useIdleTimer } from 'react-idle-timer';

const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;
const TEN_MINUTES = 10 * ONE_MINUTE;

// Exponential backoff configuration
const MAX_BACKOFF_DELAY = 30 * ONE_SECOND; // Max 30 seconds
const BASE_BACKOFF_DELAY = 2 * ONE_SECOND; // Start with 2 seconds

interface PollingState {
  isRunning: boolean;
  failureCount: number;
  lastFailureTime: number;
  backoffDelay: number;
}

export default function usePolling(callback: () => void | Promise<void>, delay: number | null): void {
  const callbackRef = useRef<() => void | Promise<void>>(callback);
  const stateRef = useRef<PollingState>({
    isRunning: false,
    failureCount: 0,
    lastFailureTime: 0,
    backoffDelay: 0,
  });

  // Be defensive: some environments may mock the hook improperly
  const idleTimer = useIdleTimer({ timeout: TEN_MINUTES }) as unknown as { isIdle?: () => boolean } | undefined;
  const isIdleFn = useMemo<() => boolean>(() => {
    return typeof idleTimer?.isIdle === 'function' ? (idleTimer.isIdle as () => boolean) : (): boolean => false;
  }, [idleTimer]);

  // Keep latest callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick(): void {
      /* istanbul ignore next */
      if (process.env.REACT_APP_USE_IDLE_TIMER === 'true' && isIdleFn()) {
        return;
      }

      // Pause when tab is hidden to reduce work on mobile Safari
      /* istanbul ignore next */
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return;
      }

      // Check if we're already running or in backoff period
      const now = Date.now();
      if (stateRef.current.isRunning) {
        return;
      }

      // Apply exponential backoff if we've had recent failures
      if (stateRef.current.failureCount > 0 && stateRef.current.backoffDelay > 0) {
        const timeSinceLastFailure = now - stateRef.current.lastFailureTime;
        if (timeSinceLastFailure < stateRef.current.backoffDelay) {
          return;
        }
      }

      stateRef.current.isRunning = true;

      // Use startTransition to mark this as a non-urgent update
      startTransition(() => {
        try {
          Promise.resolve(callbackRef.current())
            .then(() => {
              // Success - reset failure state
              stateRef.current.failureCount = 0;
              stateRef.current.backoffDelay = 0;
            })
            .catch((error) => {
              // Handle failure with exponential backoff
              stateRef.current.failureCount += 1;
              stateRef.current.lastFailureTime = now;

              // Calculate exponential backoff: 2^failureCount * base_delay, capped at max
              const backoffMultiplier = Math.pow(2, Math.min(stateRef.current.failureCount - 1, 4));
              stateRef.current.backoffDelay = Math.min(BASE_BACKOFF_DELAY * backoffMultiplier, MAX_BACKOFF_DELAY);

              // Silently handle errors to prevent polling from breaking
              /* istanbul ignore next */
              console.warn('Polling callback error:', error); // eslint-disable-line no-console
            })
            .finally(() => {
              stateRef.current.isRunning = false;
            });
        } catch (error) {
          // Handle synchronous errors
          stateRef.current.failureCount += 1;
          stateRef.current.lastFailureTime = now;
          stateRef.current.isRunning = false;

          /* istanbul ignore next */
          console.warn('Polling callback error:', error); // eslint-disable-line no-console
        }
      });
    }

    /* istanbul ignore else */
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => {
        clearInterval(id);
      };
    }
  }, [delay, isIdleFn]);
}
