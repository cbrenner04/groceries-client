import { useState, useEffect, useRef, useCallback } from 'react';

export type SessionMode = 'building' | 'shopping' | 'neutral';

interface RecentAction {
  type: 'add' | 'complete';
  timestamp: number;
}

interface UseSessionModeReturn {
  mode: SessionMode;
  onItemAdded: () => void;
  onItemCompleted: () => void;
}

const INACTIVITY_TIMEOUT = 30_000;
const ACTION_WINDOW = 5_000;

export function useSessionMode(): UseSessionModeReturn {
  const [mode, setMode] = useState<SessionMode>('neutral');
  const recentActionsRef = useRef<RecentAction[]>([]);
  const inactivityTimerRef = useRef<number | null>(null);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current !== null) {
      window.clearTimeout(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = window.setTimeout(() => {
      setMode('neutral');
      recentActionsRef.current = [];
      inactivityTimerRef.current = null;
    }, INACTIVITY_TIMEOUT);
  }, []);

  const updateMode = useCallback(() => {
    const now = Date.now();
    const recentWindow = recentActionsRef.current.filter((action) => now - action.timestamp < ACTION_WINDOW);
    recentActionsRef.current = recentWindow;

    if (recentWindow.length === 0) {
      setMode('neutral');
      return;
    }

    const hasAdds = recentWindow.some((action) => action.type === 'add');
    const hasCompletes = recentWindow.some((action) => action.type === 'complete');

    if (hasAdds && hasCompletes) {
      setMode('neutral');
    } else if (hasAdds) {
      setMode('building');
    } else if (hasCompletes) {
      setMode('shopping');
    } else {
      setMode('neutral');
    }
  }, []);

  const onItemAdded = useCallback(() => {
    recentActionsRef.current.push({ type: 'add', timestamp: Date.now() });
    resetInactivityTimer();
    updateMode();
  }, [resetInactivityTimer, updateMode]);

  const onItemCompleted = useCallback(() => {
    recentActionsRef.current.push({ type: 'complete', timestamp: Date.now() });
    resetInactivityTimer();
    updateMode();
  }, [resetInactivityTimer, updateMode]);

  useEffect(() => {
    return (): void => {
      if (inactivityTimerRef.current !== null) {
        window.clearTimeout(inactivityTimerRef.current);
      }
    };
  }, []);

  return {
    mode,
    onItemAdded,
    onItemCompleted,
  };
}
