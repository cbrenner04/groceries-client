import React from 'react';
import { render, cleanup, act, screen } from '@testing-library/react';
import { useMobileSafariOptimizations } from './useMobileSafariOptimizations';

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

  it('registers cleanup functions', () => {
    const { unmount } = render(<TestComponent />);

    // Initially cleanup should not be called
    expect(screen.getByTestId('cleanup-called')).toHaveTextContent('false');

    // The cleanup function should be called when the component unmounts
    unmount();
  });

  it('cleans up on unmount', () => {
    const { unmount } = render(<TestComponent />);

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
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
