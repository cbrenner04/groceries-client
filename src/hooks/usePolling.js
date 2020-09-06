import { useEffect, useRef } from 'react';
import { useIdleTimer } from 'react-idle-timer';

export default function usePolling(callback, delay) {
  const callbackRef = useRef();
  const { isIdle } = useIdleTimer({ timeout: 1000 * 10 });

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      /* istanbul ignore next */
      if (process.env.REACT_APP_USE_IDLE_TIMER === 'true' && isIdle()) {
        return;
      }
      callbackRef.current();
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
