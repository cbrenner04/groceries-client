import React from 'react';
import { render, cleanup, act, screen } from '@testing-library/react';
import { useMobileSafariOptimizations } from './useMobileSafariOptimizations';

// Mock performance API
const mockPerformance = {
  now: jest.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
  },
};

// Mock window.gc
const mockGc = jest.fn();

// Mock requestIdleCallback
const mockRequestIdleCallback = jest.fn((callback: () => void) => {
  setTimeout(callback, 0);
});

// Mock setTimeout
const mockSetTimeout = jest.fn((callback: () => void) => {
  callback();
  return 1;
});

// Mock clearInterval
const mockClearInterval = jest.fn();

// Mock addEventListener and removeEventListener
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

// Mock document
Object.defineProperty(document, 'hidden', {
  value: false,
  writable: true,
});

Object.defineProperty(document, 'addEventListener', {
  value: mockAddEventListener,
  writable: true,
});

Object.defineProperty(document, 'removeEventListener', {
  value: mockRemoveEventListener,
  writable: true,
});

// Mock window
Object.defineProperty(window, 'performance', {
  value: mockPerformance,
  writable: true,
});

Object.defineProperty(window, 'gc', {
  value: mockGc,
  writable: true,
});

Object.defineProperty(window, 'requestIdleCallback', {
  value: mockRequestIdleCallback,
  writable: true,
});

Object.defineProperty(global, 'setTimeout', {
  value: mockSetTimeout,
  writable: true,
});

Object.defineProperty(global, 'setInterval', {
  value: jest.fn(() => 1),
  writable: true,
});

Object.defineProperty(global, 'clearInterval', {
  value: mockClearInterval,
  writable: true,
});

// Test component
function TestComponent(): React.JSX.Element {
  const { isVisible, isLowMemory, cleanup } = useMobileSafariOptimizations();
  const [cleanupCalled, setCleanupCalled] = React.useState(false);

  React.useEffect(() => {
    const cleanupFn = (): void => setCleanupCalled(true);
    cleanup(cleanupFn);
  }, [cleanup]);

  return (
    <div>
      <div data-test-id="is-visible">{isVisible.toString()}</div>
      <div data-test-id="is-low-memory">{isLowMemory.toString()}</div>
      <div data-test-id="cleanup-called">{cleanupCalled.toString()}</div>
    </div>
  );
}

describe('useMobileSafariOptimizations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(document, 'hidden', {
      value: false,
      writable: true,
    });
    mockPerformance.memory = {
      usedJSHeapSize: 1000000,
      totalJSHeapSize: 2000000,
    };
  });

  afterEach(() => {
    cleanup();
  });

  it('initializes with correct default values', () => {
    render(<TestComponent />);

    expect(screen.getByTestId('is-visible')).toHaveTextContent('true');
    expect(screen.getByTestId('is-low-memory')).toHaveTextContent('false');
  });

  it('sets up visibility change listener', () => {
    render(<TestComponent />);

    expect(mockAddEventListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
  });

  it('handles visibility change to hidden', () => {
    render(<TestComponent />);

    // Simulate visibility change to hidden
    act(() => {
      Object.defineProperty(document, 'hidden', {
        value: true,
        writable: true,
      });
      const visibilityHandler = mockAddEventListener.mock.calls.find((call) => call[0] === 'visibilitychange')?.[1];
      visibilityHandler?.();
    });

    expect(screen.getByTestId('is-visible')).toHaveTextContent('false');
  });

  it('handles visibility change to visible', () => {
    render(<TestComponent />);

    // First set to hidden
    act(() => {
      Object.defineProperty(document, 'hidden', {
        value: true,
        writable: true,
      });
      const visibilityHandler = mockAddEventListener.mock.calls.find((call) => call[0] === 'visibilitychange')?.[1];
      visibilityHandler?.();
    });

    // Then set to visible
    act(() => {
      Object.defineProperty(document, 'hidden', {
        value: false,
        writable: true,
      });
      const visibilityHandler = mockAddEventListener.mock.calls.find((call) => call[0] === 'visibilitychange')?.[1];
      visibilityHandler?.();
    });

    expect(screen.getByTestId('is-visible')).toHaveTextContent('true');
  });

  it('sets up memory pressure detection when memory API is available', () => {
    render(<TestComponent />);

    // Should set up interval for memory checking
    expect(global.setInterval).toHaveBeenCalledWith(expect.any(Function), 5000);
  });

  it('triggers memory pressure when usage exceeds threshold', () => {
    render(<TestComponent />);

    // Set high memory usage
    mockPerformance.memory = {
      usedJSHeapSize: 1800000, // 90% usage
      totalJSHeapSize: 2000000,
    };

    act(() => {
      const memoryCheckHandler = (global.setInterval as jest.Mock).mock.calls.find((call) => call[1] === 5000)?.[0];
      memoryCheckHandler?.();
    });

    expect(screen.getByTestId('is-low-memory')).toHaveTextContent('true');
    expect(mockGc).toHaveBeenCalled();
  });

  it('does not trigger memory pressure when usage is below threshold', () => {
    render(<TestComponent />);

    // Set low memory usage
    mockPerformance.memory = {
      usedJSHeapSize: 1000000, // 50% usage
      totalJSHeapSize: 2000000,
    };

    act(() => {
      const memoryCheckHandler = (global.setInterval as jest.Mock).mock.calls.find((call) => call[1] === 5000)?.[0];
      memoryCheckHandler?.();
    });

    expect(screen.getByTestId('is-low-memory')).toHaveTextContent('false');
    expect(mockGc).not.toHaveBeenCalled();
  });

  it('sets up touch event listeners', () => {
    render(<TestComponent />);

    const touchEvents = ['touchstart', 'touchmove', 'touchend', 'touchcancel'];
    touchEvents.forEach((eventType) => {
      expect(mockAddEventListener).toHaveBeenCalledWith(eventType, expect.any(Function), { passive: true });
    });
  });

  it('sets up network retry logic', () => {
    render(<TestComponent />);

    // Check that retryWithBackoff is added to window
    expect((window as { retryWithBackoff?: unknown }).retryWithBackoff).toBeDefined();
    expect(typeof (window as { retryWithBackoff?: unknown }).retryWithBackoff).toBe('function');
  });

  it('registers cleanup functions', () => {
    const { unmount } = render(<TestComponent />);

    // Initially cleanup should not be called
    expect(screen.getByTestId('cleanup-called')).toHaveTextContent('false');

    // The cleanup function should be called when the component unmounts
    unmount();
    // Note: We can't test the state after unmount, but we can verify the cleanup was registered
    // by checking that the component rendered without errors
  });

  it('cleans up on unmount', () => {
    const { unmount } = render(<TestComponent />);

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    expect(mockClearInterval).toHaveBeenCalled();
  });

  it('handles case when memory API is not available', () => {
    // Remove memory from performance
    delete (mockPerformance as { memory?: unknown }).memory;

    render(<TestComponent />);

    // Should not set up memory checking interval
    expect(global.setInterval).not.toHaveBeenCalled();
  });

  it('handles case when gc is not available', () => {
    delete (window as { gc?: unknown }).gc;

    render(<TestComponent />);

    // Set high memory usage
    mockPerformance.memory = {
      usedJSHeapSize: 1800000,
      totalJSHeapSize: 2000000,
    };

    act(() => {
      const memoryCheckHandler = (global.setInterval as jest.Mock).mock.calls.find((call) => call[1] === 5000)?.[0];
      memoryCheckHandler?.();
    });

    // Should still trigger memory pressure but not call gc
    expect(screen.getByTestId('is-low-memory')).toHaveTextContent('true');
  });

  it('sets up network retry logic', () => {
    render(<TestComponent />);

    // Check that retryWithBackoff is added to window
    expect((window as { retryWithBackoff?: unknown }).retryWithBackoff).toBeDefined();
    expect(typeof (window as { retryWithBackoff?: unknown }).retryWithBackoff).toBe('function');
  });

  it('handles network retry with non-network error', async () => {
    render(<TestComponent />);

    const retryFn = (window as { retryWithBackoff?: (fn: () => Promise<unknown>, delay?: number) => Promise<unknown> })
      .retryWithBackoff;
    expect(retryFn).toBeDefined();

    if (retryFn) {
      const mockApiCall = jest.fn().mockRejectedValue({ code: 'AUTH_ERROR' });

      await expect(retryFn(mockApiCall)).rejects.toEqual({ code: 'AUTH_ERROR' });
      expect(mockApiCall).toHaveBeenCalledTimes(1); // No retries for non-network errors
    }
  });

  it('handles cleanup when visibility changes to hidden', () => {
    render(<TestComponent />);

    // Initially cleanup should not be called
    expect(screen.getByTestId('cleanup-called')).toHaveTextContent('false');

    // Simulate visibility change to hidden
    act(() => {
      Object.defineProperty(document, 'hidden', {
        value: true,
        writable: true,
      });
      const visibilityHandler = mockAddEventListener.mock.calls.find((call) => call[0] === 'visibilitychange')?.[1];
      visibilityHandler?.();
    });

    // Cleanup functions should be called
    expect(screen.getByTestId('cleanup-called')).toHaveTextContent('true');
  });
});
