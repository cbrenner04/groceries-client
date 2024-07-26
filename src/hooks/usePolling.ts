import { useEffect, useRef } from 'react';
import { useIdleTimer } from 'react-idle-timer';

const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;
const TEN_MINUTES = 10 * ONE_MINUTE;

export default function usePolling(callback: () => void, delay: number | null): void {
  const callbackRef = useRef<() => void>();
  const { isIdle } = useIdleTimer({ timeout: TEN_MINUTES });

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick(): void {
      /* istanbul ignore next */
      if (process.env.REACT_APP_USE_IDLE_TIMER === 'true' && isIdle()) {
        return;
      }
      callbackRef.current?.();
    }

    /* istanbul ignore else */
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => {
        clearInterval(id);
      };
    }
  }, [callback, delay, isIdle]);
}
