import { useEffect, useRef, startTransition, useMemo } from 'react';
import { useIdleTimer } from 'react-idle-timer';

const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;
const TEN_MINUTES = 10 * ONE_MINUTE;

export default function usePolling(callback: () => void | Promise<void>, delay: number | null): void {
  const callbackRef = useRef<() => void | Promise<void>>(callback);
  const isRunningRef = useRef(false);
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

      if (isRunningRef.current) {
        return;
      }
      isRunningRef.current = true;

      // Use startTransition to mark this as a non-urgent update
      startTransition(() => {
        try {
          Promise.resolve(callbackRef.current())
            .catch((error) => {
              // Silently handle errors to prevent polling from breaking
              /* istanbul ignore next */
              console.warn('Polling callback error:', error); // eslint-disable-line no-console
            })
            .finally(() => {
              isRunningRef.current = false;
            });
        } catch (error) {
          /* istanbul ignore next */
          console.warn('Polling callback error:', error); // eslint-disable-line no-console
          isRunningRef.current = false;
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
