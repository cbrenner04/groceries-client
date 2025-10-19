import { startTransition } from 'react';

/**
 * Batches multiple state updates to prevent concurrent rendering issues
 * This is particularly useful for polling callbacks that update multiple state variables
 */
export function batchStateUpdates(updates: (() => void)[]): void {
  startTransition(() => {
    updates.forEach((update) => {
      try {
        update();
      } catch (error) {
        // Silently handle individual update errors
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.warn('State update error:', error);
        }
      }
    });
  });
}

/**
 * Safely updates state with error handling
 * This prevents individual state updates from breaking the entire component
 */
export function safeStateUpdate<T>(setState: (value: T | ((prev: T) => T)) => void, value: T | ((prev: T) => T)): void {
  startTransition(() => {
    try {
      setState(value);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.warn('State update failed:', error);
      }
    }
  });
}

/**
 * Batches state updates for polling responses
 * Specifically designed for API responses that might update multiple related states
 */
export function batchPollingUpdates(
  updates: {
    setState: (value: unknown) => void;
    newValue: unknown;
    shouldUpdate: boolean;
  }[],
): void {
  const validUpdates = updates
    .filter((update) => update.shouldUpdate)
    .map((update) => () => update.setState(update.newValue));

  if (validUpdates.length > 0) {
    batchStateUpdates(validUpdates);
  }
}

/**
 * Example usage for polling callbacks:
 *
 * // Before (can cause concurrent rendering issues):
 * if (!pendingSame) setPendingLists(updatedPending);
 * if (!completedSame) setCompletedLists(updatedCompleted);
 * if (!incompleteSame) setIncompleteLists(updatedIncomplete);
 *
 * // After (prevents concurrent rendering issues):
 * batchPollingUpdates([
 *   { setState: setPendingLists, newValue: updatedPending, shouldUpdate: !pendingSame },
 *   { setState: setCompletedLists, newValue: updatedCompleted, shouldUpdate: !completedSame },
 *   { setState: setIncompleteLists, newValue: updatedIncomplete, shouldUpdate: !incompleteSame },
 * ]);
 */
