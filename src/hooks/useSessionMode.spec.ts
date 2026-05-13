import { renderHook, act } from '@testing-library/react';
import { useSessionMode } from './useSessionMode';

describe('useSessionMode', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts in neutral mode', () => {
    const { result } = renderHook(() => useSessionMode());
    expect(result.current.mode).toBe('neutral');
  });

  it('enters building mode when item is added', () => {
    const { result } = renderHook(() => useSessionMode());

    act(() => {
      result.current.onItemAdded();
    });

    expect(result.current.mode).toBe('building');
  });

  it('enters shopping mode when item is completed', () => {
    const { result } = renderHook(() => useSessionMode());

    act(() => {
      result.current.onItemCompleted();
    });

    expect(result.current.mode).toBe('shopping');
  });

  it('stays in building mode with multiple additions', () => {
    const { result } = renderHook(() => useSessionMode());

    act(() => {
      result.current.onItemAdded();
    });
    expect(result.current.mode).toBe('building');

    act(() => {
      result.current.onItemAdded();
    });
    expect(result.current.mode).toBe('building');
  });

  it('stays in shopping mode with multiple completions', () => {
    const { result } = renderHook(() => useSessionMode());

    act(() => {
      result.current.onItemCompleted();
    });
    expect(result.current.mode).toBe('shopping');

    act(() => {
      result.current.onItemCompleted();
    });
    expect(result.current.mode).toBe('shopping');
  });

  it('returns to neutral mode when both add and complete actions occur', () => {
    const { result } = renderHook(() => useSessionMode());

    act(() => {
      result.current.onItemAdded();
    });
    expect(result.current.mode).toBe('building');

    act(() => {
      result.current.onItemCompleted();
    });
    expect(result.current.mode).toBe('neutral');
  });

  it('returns to neutral mode when complete then add occurs', () => {
    const { result } = renderHook(() => useSessionMode());

    act(() => {
      result.current.onItemCompleted();
    });
    expect(result.current.mode).toBe('shopping');

    act(() => {
      result.current.onItemAdded();
    });
    expect(result.current.mode).toBe('neutral');
  });

  it('reverts to neutral after 30 seconds of inactivity', () => {
    const { result } = renderHook(() => useSessionMode());

    act(() => {
      result.current.onItemAdded();
    });
    expect(result.current.mode).toBe('building');

    act(() => {
      vi.advanceTimersByTime(30_000);
    });

    expect(result.current.mode).toBe('neutral');
  });

  it('resets inactivity timer on new actions', () => {
    const { result } = renderHook(() => useSessionMode());

    act(() => {
      result.current.onItemAdded();
    });

    act(() => {
      vi.advanceTimersByTime(20_000);
    });
    expect(result.current.mode).toBe('building');

    act(() => {
      result.current.onItemAdded();
    });

    act(() => {
      vi.advanceTimersByTime(20_000);
    });
    expect(result.current.mode).toBe('building');

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    expect(result.current.mode).toBe('neutral');
  });

  it('forgets actions outside the 5 second window', () => {
    const { result } = renderHook(() => useSessionMode());

    act(() => {
      result.current.onItemAdded();
    });
    expect(result.current.mode).toBe('building');

    act(() => {
      vi.advanceTimersByTime(5_100);
    });

    act(() => {
      result.current.onItemCompleted();
    });

    expect(result.current.mode).toBe('shopping');
  });

  it('clears timers on unmount', () => {
    const { result, unmount } = renderHook(() => useSessionMode());

    act(() => {
      result.current.onItemAdded();
    });

    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
    unmount();
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
