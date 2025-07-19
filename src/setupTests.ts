// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { cleanup, configure } from '@testing-library/react';
import { TextEncoder } from 'util';
import type { AxiosError, AxiosResponse } from 'axios';

global.TextEncoder = TextEncoder;
configure({ testIdAttribute: 'data-test-id' });

jest.mock('axios', () => ({
  AxiosError: jest.fn().mockImplementation(
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
  ),
  create: (): {
    interceptors: {
      request: {
        use: jest.Mock;
      };
      response: {
        use: jest.Mock;
      };
    };
    delete: jest.Mock;
  } => ({
    interceptors: {
      request: {
        use: jest.fn(),
      },
      response: {
        use: jest.fn(),
      },
    },
    delete: jest.fn(),
  }),
}));

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

// make sure when `moment()` is called without a date, the same date is always returned
jest.mock(
  'moment',
  () =>
    (date: Date | string | number | undefined): Date =>
      jest.requireActual('moment')(date ?? '2020-05-24T10:00:00.000Z'),
);

afterEach(() => {
  cleanup();
});
