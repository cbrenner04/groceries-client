// vitest-dom adds custom vitest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { TextEncoder } from 'util';
import type { AxiosResponse } from 'axios';
import { DateTime } from 'luxon';

// Mock global.IS_REACT_ACT_ENVIRONMENT for React 19
Object.defineProperty(global, 'IS_REACT_ACT_ENVIRONMENT', {
  value: true,
  writable: true,
  configurable: true,
});

// This is necessary now that react-router is using TextEncoder internally but JSDOM doesn't have it
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.TextEncoder = TextEncoder;
configure({ testIdAttribute: 'data-test-id' });
// Ensure polling considers the document visible in JSDOM; allow tests to override
// Polling checks for visibility state to avoid unnecessary work when tab is hidden
try {
  Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
} catch {
  // ignore if already defined/configured by the environment
}

vi.mock('axios', async () => {
  // AxiosError mock - constructable class used by tests with `new AxiosError(...)`
  class AxiosErrorMock extends Error {
    code: string;
    isAxiosError: boolean;
    request: unknown;
    response: AxiosResponse | undefined;
    toJSON: () => Record<string, never>;

    constructor(message: string, code: string, requestError = false) {
      super(message);
      this.name = 'AxiosError';
      this.code = code;
      this.isAxiosError = true;
      this.request = requestError
        ? {
            method: 'GET',
            url: '/lists/1',
            headers: {},
            data: undefined,
          }
        : undefined;
      this.response = {
        status: Number(code),
      } as AxiosResponse;
      this.toJSON = (): Record<string, never> => ({});
    }
  }

  // Default axios instance mock
  const createMockInstance = (): Record<string, unknown> => {
    const mockGet = vi.fn().mockImplementation(async (url: string) => {
      // Default list show endpoint - uses factories for consistency
      if (url.startsWith('/lists/')) {
        // Use require inside mock factory to access test utilities
        const { createApiResponse } = await import('test-utils/factories');
        return Promise.resolve({ data: createApiResponse() });
      }
      // Field configuration prefetch
      if (url.includes('list_item_field_configurations')) {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: {} });
    });

    return {
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn(), clear: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn(), clear: vi.fn() },
      },
      delete: vi.fn().mockResolvedValue({}),
      get: mockGet,
      post: vi.fn().mockResolvedValue({ data: {} }),
      put: vi.fn().mockResolvedValue({ data: {} }),
    };
  };

  const defaultExport = createMockInstance();

  return {
    default: { ...defaultExport, create: createMockInstance },
    AxiosError: AxiosErrorMock,
    create: createMockInstance,
  };
});

vi.mock('react-toastify', () => {
  const toastMock: any = vi.fn(); // eslint-disable-line @typescript-eslint/no-explicit-any
  toastMock.success = vi.fn();
  toastMock.error = vi.fn();
  toastMock.info = vi.fn();
  toastMock.warning = vi.fn();
  toastMock.dismiss = vi.fn();

  return {
    toast: toastMock,
    ToastContainer: (): null => null,
  };
});

// Global mock for our new toast utility
vi.mock('./utils/toast', () => ({
  showToast: {
    info: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
}));

// Provide a stable mock for react-idle-timer used by usePolling
vi.mock('react-idle-timer', () => ({
  useIdleTimer: (): { isIdle: () => boolean } => ({ isIdle: () => false }),
}));

const mockNow = DateTime.fromISO('2020-05-24T10:00:00.000Z');
type DateTimeNowFn = typeof DateTime.now;

DateTime.now = vi.fn(() => mockNow) as DateTimeNowFn;

// Global test setup for React 19
beforeEach(() => {
  // Suppress console warnings about act during tests
  vi.spyOn(console, 'error').mockImplementation((message: string) => {
    if (
      typeof message === 'string' &&
      (message.includes('act(...)') ||
        message.includes('suspended resource finished loading') ||
        message.includes('The current testing environment is not configured to support act') ||
        message.includes('A component suspended inside an `act` scope'))
    ) {
      return;
    }
    // Re-throw other console errors
    throw new Error(message);
  });
});

afterEach(() => {
  cleanup();
  // Restore console.error
  vi.restoreAllMocks();
});
