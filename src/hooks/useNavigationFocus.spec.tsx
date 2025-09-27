import { renderHook } from '@testing-library/react';
import { useNavigationFocus } from './useNavigationFocus';
import { act } from '@testing-library/react';

// Mock React Router's useLocation
const mockLocation = {
  pathname: '/initial-path',
  search: '',
  hash: '',
  state: null,
  key: 'initial',
};

jest.mock('react-router', () => ({
  useLocation: (): typeof mockLocation => mockLocation,
}));

describe('useNavigationFocus', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    // Reset to initial state for each test
    mockLocation.pathname = '/initial-path';
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not call callback on initial mount', () => {
    const callback = jest.fn();

    renderHook(() => useNavigationFocus(callback));

    // Fast-forward timers to ensure any timeouts would have fired
    act(() => {
      jest.runAllTimers();
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('calls callback when navigation occurs', () => {
    const callback = jest.fn();

    const { rerender } = renderHook(() => useNavigationFocus(callback));

    // Simulate initial mount - callback should not be called
    act(() => {
      jest.runAllTimers();
    });
    expect(callback).not.toHaveBeenCalled();

    // Simulate navigation to a new route
    mockLocation.pathname = '/new-path';
    rerender();

    // Fast-forward the 100ms delay
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('calls updated callback after navigation', () => {
    const originalCallback = jest.fn();
    const updatedCallback = jest.fn();

    const { rerender } = renderHook((cb) => useNavigationFocus(cb.cb), { initialProps: { cb: originalCallback } });

    // Update callback before navigation
    rerender({ cb: updatedCallback });

    // Simulate navigation
    mockLocation.pathname = '/another-path';
    rerender({ cb: updatedCallback });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(originalCallback).not.toHaveBeenCalled();
    expect(updatedCallback).toHaveBeenCalledTimes(1);
  });

  it('handles async callbacks', async () => {
    const asyncCallback = jest.fn().mockResolvedValue(undefined);

    const { rerender } = renderHook(() => useNavigationFocus(asyncCallback));

    // Simulate navigation
    mockLocation.pathname = '/async-path';
    rerender();

    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Wait for the Promise to resolve
    await act(async () => {
      await Promise.resolve();
    });

    expect(asyncCallback).toHaveBeenCalledTimes(1);
  });

  it('handles multiple rapid navigations', () => {
    const callback = jest.fn();

    const { rerender } = renderHook(() => useNavigationFocus(callback));

    // First navigation
    mockLocation.pathname = '/path-1';
    rerender();

    // Second navigation before first timeout fires
    mockLocation.pathname = '/path-2';
    rerender();

    // Third navigation before any timeouts fire
    mockLocation.pathname = '/path-3';
    rerender();

    // Fast-forward past all timeouts
    act(() => {
      jest.runAllTimers();
    });

    // Only the last navigation callback should have fired
    // (previous ones get cleaned up by clearTimeout)
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('cleans up timeout on unmount during navigation', () => {
    const callback = jest.fn();
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

    const { rerender, unmount } = renderHook(() => useNavigationFocus(callback));

    // Simulate navigation
    mockLocation.pathname = '/unmount-path';
    rerender();

    // Unmount before timeout fires
    unmount();

    // Fast-forward timers
    act(() => {
      jest.runAllTimers();
    });

    expect(clearTimeoutSpy).toHaveBeenCalled();
    expect(callback).not.toHaveBeenCalled();

    clearTimeoutSpy.mockRestore();
  });

  it('does not call callback when pathname stays the same', () => {
    const callback = jest.fn();

    const { rerender } = renderHook(() => useNavigationFocus(callback));

    // Initial navigation to establish the location
    mockLocation.pathname = '/same-path';
    rerender();

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    callback.mockClear();

    // "Navigate" to same path - should not trigger callback
    rerender();

    act(() => {
      jest.runAllTimers();
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('handles synchronous callbacks that throw errors', () => {
    const throwingCallback = jest.fn().mockImplementation(() => {
      throw new Error('Callback error');
    });

    const { rerender } = renderHook(() => useNavigationFocus(throwingCallback));

    // Simulate navigation
    mockLocation.pathname = '/error-path';
    rerender();

    // The error should be thrown when the timeout fires
    expect(() => {
      act(() => {
        jest.advanceTimersByTime(100);
      });
    }).toThrow('Callback error');

    expect(throwingCallback).toHaveBeenCalledTimes(1);
  });

  it('calls async callbacks that return promises', async () => {
    const asyncCallback = jest.fn().mockResolvedValue('success');

    const { rerender } = renderHook(() => useNavigationFocus(asyncCallback));

    // Simulate navigation
    mockLocation.pathname = '/promise-path';
    rerender();

    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Wait for the Promise to resolve
    await act(async () => {
      await Promise.resolve();
    });

    expect(asyncCallback).toHaveBeenCalledTimes(1);
  });
});
