import React, { useState } from 'react';
import { render, cleanup, act } from '@testing-library/react';

import usePolling from './usePolling';

// Mock react-idle-timer so we can control isIdle()
jest.mock('react-idle-timer', () => ({
  __esModule: true,
  useIdleTimer: jest.fn(() => ({ isIdle: (): boolean => false })),
}));

const { useIdleTimer } = jest.requireMock('react-idle-timer');

function TestComponent(props: { cb: () => void | Promise<void>; delay: number | null }): React.JSX.Element {
  usePolling(props.cb, props.delay);
  return <div data-test-id="mount" />;
}

describe('usePolling', () => {
  jest.setTimeout(30_000);

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    // Make startTransition synchronous for determinism with fake timers
    jest.spyOn(React, 'startTransition').mockImplementation(((fn: () => void) => fn()) as typeof React.startTransition);
    // silence warnings from polling error path in tests
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
    (React.startTransition as jest.Mock | (((fn: () => void) => void) & { mockRestore?: () => void })).mockRestore?.();
    // Reset visibilityState
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    // Reset env
    delete (process.env as Record<string, string>).REACT_APP_USE_IDLE_TIMER;
  });

  it('invokes the callback on the given interval', async () => {
    const cb = jest.fn();
    render(<TestComponent cb={cb} delay={50} />);

    jest.advanceTimersByTime(49);
    expect(cb).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('does not create an interval when delay is null', () => {
    const cb = jest.fn();
    render(<TestComponent cb={cb} delay={null} />);
    jest.advanceTimersByTime(1000);
    expect(cb).not.toHaveBeenCalled();
  });

  it('skips polling when tab is hidden', () => {
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    const cb = jest.fn();
    render(<TestComponent cb={cb} delay={50} />);
    jest.advanceTimersByTime(200);
    expect(cb).not.toHaveBeenCalled();
  });

  it('skips polling when idle timer is enabled and user is idle', () => {
    (useIdleTimer as jest.Mock).mockReturnValueOnce({ isIdle: () => true });
    (process.env as Record<string, string>).REACT_APP_USE_IDLE_TIMER = 'true';
    const cb = jest.fn();
    render(<TestComponent cb={cb} delay={50} />);
    jest.advanceTimersByTime(200);
    expect(cb).not.toHaveBeenCalled();
  });

  it('prevents overlapping callbacks while a previous tick is still running', async () => {
    let resolvePromise: (() => void) | undefined;
    const cb = jest.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolvePromise = resolve;
        }),
    );

    render(<TestComponent cb={cb} delay={50} />);

    // First tick starts and remains pending
    jest.advanceTimersByTime(50);
    expect(cb).toHaveBeenCalledTimes(1);

    // Next ticks should be ignored until the promise resolves
    jest.advanceTimersByTime(200);
    expect(cb).toHaveBeenCalledTimes(1);

    // Resolve and allow next tick to run; wrap in act so React flushes transition
    await act(async () => {
      resolvePromise?.();
      await Promise.resolve();
    });
    // Advance to the very next scheduled timer rather than a fixed duration
    act(() => {
      // with setInterval, this jumps to the next tick deterministically
      jest.advanceTimersToNextTimer();
    });
    expect(cb).toHaveBeenCalledTimes(2);
  });

  it('uses the latest callback (no stale closure)', async () => {
    const first = jest.fn();
    const second = jest.fn();

    function Wrapper(): React.JSX.Element {
      const [cb, setCb] = useState<() => void>(() => first);
      return (
        <div>
          <TestComponent cb={cb} delay={50} />
          <button data-test-id="swap" onClick={(): void => setCb(() => second)} />
        </div>
      );
    }

    const { getByTestId } = render(<Wrapper />);
    act(() => {
      jest.advanceTimersByTime(50);
    });
    // Allow the hook's Promise.finally to run and clear the in-flight guard
    await Promise.resolve();
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).not.toHaveBeenCalled();

    // Swap callback and ensure subsequent ticks use the new one
    await act(async () => {
      getByTestId('swap').click();
      // Allow the useEffect that updates callbackRef.current to run
      await Promise.resolve();
    });

    // Advance timers and wait for all async operations to complete
    await act(async () => {
      jest.advanceTimersByTime(50);
      // Wait for Promise chain to complete
      await Promise.resolve();
    });

    expect(second).toHaveBeenCalledTimes(1);
  });

  it('cleans up interval on unmount', () => {
    const cb = jest.fn();
    const { unmount } = render(<TestComponent cb={cb} delay={50} />);
    jest.advanceTimersByTime(50);
    expect(cb).toHaveBeenCalledTimes(1);
    unmount();
    jest.advanceTimersByTime(500);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('recovers after a synchronous callback error', () => {
    const throwing = jest.fn().mockImplementation(() => {
      throw new Error('boom');
    });
    render(<TestComponent cb={throwing} delay={50} />);
    jest.advanceTimersByTime(50);
    expect(throwing).toHaveBeenCalledTimes(1);
    // Next tick should still run after error path
    jest.advanceTimersByTime(50);
    expect(throwing).toHaveBeenCalledTimes(2);
  });

  it('handles asynchronous callback errors with exponential backoff', async () => {
    const cb = jest
      .fn()
      .mockRejectedValueOnce(new Error('Async error 1'))
      .mockRejectedValueOnce(new Error('Async error 2'))
      .mockResolvedValueOnce(undefined);

    render(<TestComponent cb={cb} delay={50} />);

    // First tick: async error
    await act(async () => {
      jest.advanceTimersByTime(50);
      await Promise.resolve();
    });

    // Second tick: should be delayed due to backoff
    await act(async () => {
      jest.advanceTimersByTime(50);
      await Promise.resolve();
    });

    // Advance past backoff delay
    await act(async () => {
      jest.advanceTimersByTime(2000); // BASE_BACKOFF_DELAY is 2 seconds
      await Promise.resolve();
    });

    // Third tick: another error, longer backoff
    await act(async () => {
      jest.advanceTimersByTime(50);
      await Promise.resolve();
    });

    // Advance past longer backoff delay
    await act(async () => {
      jest.advanceTimersByTime(4000); // Should be 4 seconds for second failure
      await Promise.resolve();
    });

    // Fourth tick: success, should reset backoff
    await act(async () => {
      jest.advanceTimersByTime(50);
      await Promise.resolve();
    });

    expect(cb).toHaveBeenCalledTimes(4);
  });

  it('applies exponential backoff after failures', async () => {
    const cb = jest.fn().mockRejectedValue(new Error('Always fails'));

    render(<TestComponent cb={cb} delay={50} />);

    // First failure
    await act(async () => {
      jest.advanceTimersByTime(50);
      await Promise.resolve();
    });

    // Should be blocked by backoff
    await act(async () => {
      jest.advanceTimersByTime(50);
      await Promise.resolve();
    });

    expect(cb).toHaveBeenCalledTimes(1);

    // Advance past first backoff period (2 seconds)
    await act(async () => {
      jest.advanceTimersByTime(2000);
      await Promise.resolve();
    });

    // Second failure
    await act(async () => {
      jest.advanceTimersByTime(50);
      await Promise.resolve();
    });

    expect(cb).toHaveBeenCalledTimes(2);

    // Should be blocked by longer backoff
    await act(async () => {
      jest.advanceTimersByTime(50);
      await Promise.resolve();
    });

    expect(cb).toHaveBeenCalledTimes(2);
  });

  it('resets backoff state on successful callback', async () => {
    const cb = jest.fn().mockRejectedValueOnce(new Error('Failure')).mockResolvedValue(undefined);

    render(<TestComponent cb={cb} delay={50} />);

    // First failure
    await act(async () => {
      jest.advanceTimersByTime(50);
      await Promise.resolve();
    });

    expect(cb).toHaveBeenCalledTimes(1);

    // Advance past backoff
    await act(async () => {
      jest.advanceTimersByTime(2000);
      await Promise.resolve();
    });

    // Success - should reset backoff
    await act(async () => {
      jest.advanceTimersByTime(50);
      await Promise.resolve();
    });

    expect(cb).toHaveBeenCalledTimes(3);

    // Next call should happen immediately (no backoff because state was reset)
    await act(async () => {
      jest.advanceTimersByTime(50);
      await Promise.resolve();
    });

    expect(cb).toHaveBeenCalledTimes(4);
  });
});
