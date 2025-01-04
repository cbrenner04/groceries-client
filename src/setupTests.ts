// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { cleanup, configure } from '@testing-library/react';
import { TextEncoder } from 'util';

global.TextEncoder = TextEncoder;
configure({ testIdAttribute: 'data-test-id' });

jest.mock('axios', () => ({
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
