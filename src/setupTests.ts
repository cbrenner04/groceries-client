// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { cleanup, configure } from '@testing-library/react';
import { TextEncoder } from 'util';
import type { AxiosError, AxiosResponse } from 'axios';
import type axios from './utils/api';

// Mock global.IS_REACT_ACT_ENVIRONMENT for React 19
Object.defineProperty(global, 'IS_REACT_ACT_ENVIRONMENT', {
  value: true,
  writable: true,
  configurable: true,
});

// This is necessary now that react-router is using TextEncoder internally but JSDOM doesn't have it
// eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
// @ts-ignore
global.TextEncoder = TextEncoder;
configure({ testIdAttribute: 'data-test-id' });
// Ensure polling considers the document visible in JSDOM; allow tests to override
// Polling checks for visibility state to avoid unnecessary work when tab is hidden
try {
  Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
} catch (_err) {
  // ignore if already defined/configured by the environment
}

jest.mock('axios', () => {
  // AxiosError mock - used by tests to create error instances
  const AxiosErrorMock = jest.fn().mockImplementation(
    (message: string, code: string, requestError = false): Partial<AxiosError> => ({
      message,
      code,
      name: 'AxiosError',
      isAxiosError: true,
      request: requestError
        ? {
            method: 'GET',
            url: '/lists/1',
            headers: {},
            data: undefined,
          }
        : undefined,
      response: {
        status: Number(code),
      } as AxiosResponse,
      toJSON: () => ({}),
    }),
  );

  // Default axios instance mock
  const createMockInstance = (): Partial<jest.Mocked<typeof axios>> => {
    const mockGet = jest.fn().mockImplementation((url: string) => {
      // Default list show endpoint - uses factories for consistency
      if (url.startsWith('/lists/')) {
        // Use require inside mock factory to access test utilities
        const { createApiResponse } = require('test-utils/factories');
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
        request: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() },
      },
      delete: jest.fn().mockResolvedValue({}),
      get: mockGet,
      post: jest.fn().mockResolvedValue({ data: {} }),
      put: jest.fn().mockResolvedValue({ data: {} }),
    };
  };

  return {
    AxiosError: AxiosErrorMock,
    create: createMockInstance,
  };
});

jest.mock('react-toastify', () => {
  const toastMock: any = jest.fn(); // eslint-disable-line @typescript-eslint/no-explicit-any
  toastMock.success = jest.fn();
  toastMock.error = jest.fn();
  toastMock.info = jest.fn();
  toastMock.warning = jest.fn();
  toastMock.dismiss = jest.fn();

  return {
    toast: toastMock,
    ToastContainer: (): null => null,
  };
});

// Global mock for our new toast utility
jest.mock('./utils/toast', () => ({
  showToast: {
    info: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
  },
}));

// Provide a stable mock for react-idle-timer used by usePolling
jest.mock('react-idle-timer', () => ({
  useIdleTimer: (): { isIdle: () => boolean } => ({ isIdle: () => false }),
}));

// make sure when `moment()` is called without a date, the same date is always returned
jest.mock(
  'moment',
  () =>
    (date: Date | string | number | undefined): Date =>
      jest.requireActual('moment')(date ?? '2020-05-24T10:00:00.000Z'),
);

// Global test setup for React 19
beforeEach(() => {
  // Suppress console warnings about act during tests
  jest.spyOn(console, 'error').mockImplementation((message) => {
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
  jest.restoreAllMocks();
});
