import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { createLazyComponent, preloadComponent } from './lazyComponents';

// Mock Loading component
jest.mock('components/Loading', () => {
  return function MockLoading(): React.ReactNode {
    return <div data-test-id="loading">Loading...</div>;
  };
});

// Mock component for testing
const MockComponent = (props: { testProp: string }): React.ReactNode => (
  <div data-test-id="mock-component">{props.testProp}</div>
);

// Type for the mock component props
interface MockComponentProps {
  testProp: string;
}

describe('lazyComponents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createLazyComponent', () => {
    it('should create a lazy component with default fallback', async () => {
      const importFn = jest.fn().mockResolvedValue({ default: MockComponent });
      const LazyComponent = createLazyComponent<MockComponentProps>(importFn);

      const { getByTestId } = render(<LazyComponent testProp="test value" />);

      // Should show loading initially
      expect(getByTestId('loading')).toBeInTheDocument();

      // Wait for lazy component to load
      await waitFor(() => {
        expect(getByTestId('mock-component')).toBeInTheDocument();
      });

      expect(getByTestId('mock-component')).toHaveTextContent('test value');
      expect(importFn).toHaveBeenCalledTimes(1);
    });

    it('should create a lazy component with custom fallback', async () => {
      const CustomFallback = (): React.ReactElement => <div data-test-id="custom-fallback">Custom Loading</div>;
      const importFn = jest.fn().mockResolvedValue({ default: MockComponent });
      const LazyComponent = createLazyComponent<MockComponentProps>(importFn, CustomFallback);

      const { getByTestId } = render(<LazyComponent testProp="test value" />);

      // Should show custom fallback initially
      expect(getByTestId('custom-fallback')).toBeInTheDocument();

      // Wait for lazy component to load
      await waitFor(() => {
        expect(getByTestId('mock-component')).toBeInTheDocument();
      });

      expect(getByTestId('mock-component')).toHaveTextContent('test value');
    });

    it('should set correct display name', () => {
      const importFn = jest.fn().mockResolvedValue({ default: MockComponent });
      Object.defineProperty(importFn, 'name', { value: 'TestImport', writable: true });

      const LazyComponent = createLazyComponent<MockComponentProps>(importFn);
      expect(LazyComponent.displayName).toBe('LazyComponent(TestImport)');
    });

    it('should set display name with Unknown when importFn has no name', () => {
      // Create a function without a name property by using an anonymous function
      const importFnWithoutName = jest.fn().mockResolvedValue({ default: MockComponent });
      // Override the name property to be undefined
      Object.defineProperty(importFnWithoutName, 'name', { value: undefined, configurable: true });

      const LazyComponent = createLazyComponent<MockComponentProps>(importFnWithoutName);
      expect(LazyComponent.displayName).toBe('LazyComponent(Unknown)');
    });

    it('should handle import errors gracefully', async () => {
      const importFn = jest.fn().mockRejectedValue(new Error('Import failed'));
      const LazyComponent = createLazyComponent<MockComponentProps>(importFn);

      const { getByTestId } = render(<LazyComponent testProp="test value" />);

      // Should show loading initially
      expect(getByTestId('loading')).toBeInTheDocument();

      // Should still show loading after error (Suspense handles this)
      await waitFor(
        () => {
          expect(getByTestId('loading')).toBeInTheDocument();
        },
        { timeout: 1000 },
      );
    });
  });

  describe('preloadComponent', () => {
    let originalRequestIdleCallback: typeof window.requestIdleCallback;
    let originalSetTimeout: typeof window.setTimeout;

    beforeEach(() => {
      originalRequestIdleCallback = window.requestIdleCallback;
      originalSetTimeout = window.setTimeout;
    });

    afterEach(() => {
      window.requestIdleCallback = originalRequestIdleCallback;
      window.setTimeout = originalSetTimeout;
    });

    it('should use requestIdleCallback when available', () => {
      const mockRequestIdleCallback = jest.fn((callback) => {
        callback({ didTimeout: false, timeRemaining: () => 5 });
      });
      window.requestIdleCallback = mockRequestIdleCallback as unknown as typeof window.requestIdleCallback;

      const importFn = jest.fn().mockResolvedValue({ default: MockComponent });

      preloadComponent(importFn);

      expect(mockRequestIdleCallback).toHaveBeenCalledTimes(1);
      expect(importFn).toHaveBeenCalledTimes(1);
    });

    it('should fallback to setTimeout when requestIdleCallback is not available', () => {
      delete (window as unknown as { requestIdleCallback?: () => void }).requestIdleCallback;
      const mockSetTimeout = jest.fn((callback) => {
        callback();
        return 1;
      });
      window.setTimeout = mockSetTimeout as unknown as typeof window.setTimeout;

      const importFn = jest.fn().mockResolvedValue({ default: MockComponent });

      preloadComponent(importFn);

      expect(mockSetTimeout).toHaveBeenCalledTimes(1);
      expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), 0);
      expect(importFn).toHaveBeenCalledTimes(1);
    });

    it('should handle import errors in requestIdleCallback', () => {
      const mockRequestIdleCallback = jest.fn((callback) => {
        callback({ didTimeout: false, timeRemaining: () => 5 });
      });
      window.requestIdleCallback = mockRequestIdleCallback as unknown as typeof window.requestIdleCallback;

      const importFn = jest.fn().mockRejectedValue(new Error('Import failed'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      preloadComponent(importFn);

      expect(mockRequestIdleCallback).toHaveBeenCalledTimes(1);
      expect(importFn).toHaveBeenCalledTimes(1);

      consoleSpy.mockRestore();
    });

    it('should handle import errors in setTimeout fallback', () => {
      delete (window as unknown as { requestIdleCallback?: () => void }).requestIdleCallback;
      const mockSetTimeout = jest.fn((callback) => {
        callback();
        return 1;
      });
      window.setTimeout = mockSetTimeout as unknown as typeof window.setTimeout;

      const importFn = jest.fn().mockRejectedValue(new Error('Import failed'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      preloadComponent(importFn);

      expect(mockSetTimeout).toHaveBeenCalledTimes(1);
      expect(importFn).toHaveBeenCalledTimes(1);

      consoleSpy.mockRestore();
    });
  });
});
