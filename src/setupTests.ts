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
// Ensure polling considers the document visible in JSDOM; allow tests to override
try {
  Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
} catch (_err) {
  // ignore if already defined/configured by the environment
}

// Stabilize axios.get counts in tests by disabling prefetch on mount by default
process.env.REACT_APP_PREFETCH_ON_MOUNT = 'false';
// Disable idle prefetch by default to keep axios.get counts deterministic in tests
process.env.REACT_APP_PREFETCH_IDLE = 'false';

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
    get: jest.Mock;
    post: jest.Mock;
    put: jest.Mock;
  } => ({
    interceptors: {
      request: {
        use: jest.fn(),
      },
      response: {
        use: jest.fn(),
      },
    },
    delete: jest.fn().mockResolvedValue({}),
    get: jest.fn().mockImplementation((url: string) => {
      // Default list show endpoint used by list page and polling
      if (url.startsWith('/v2/lists/')) {
        const now = new Date().toISOString();
        const nonCompletedItem = {
          id: 'id2',
          refreshed: false,
          completed: false,
          archived_at: null,
          user_id: 'id1',
          list_id: 'id1',
          created_at: now,
          updated_at: now,
          fields: [
            {
              id: 'id2',
              list_item_field_configuration_id: 'id2',
              data: 'not completed quantity',
              archived_at: null,
              list_item_id: 'id2',
              label: 'quantity',
              user_id: 'id1',
              created_at: now,
              updated_at: now,
              position: 0,
              data_type: 'free_text',
            },
            {
              id: 'id3',
              list_item_field_configuration_id: 'id3',
              data: 'no category not completed product',
              archived_at: null,
              list_item_id: 'id2',
              label: 'product',
              user_id: 'id1',
              created_at: now,
              updated_at: now,
              position: 1,
              data_type: 'free_text',
            },
          ],
        };

        const nonCompletedItemFoo1 = {
          id: 'id3',
          refreshed: false,
          completed: false,
          archived_at: null,
          user_id: 'id1',
          list_id: 'id1',
          created_at: now,
          updated_at: now,
          fields: [
            {
              id: 'id4',
              list_item_field_configuration_id: 'id4',
              data: 'not completed quantity',
              archived_at: null,
              list_item_id: 'id3',
              label: 'quantity',
              user_id: 'id1',
              created_at: now,
              updated_at: now,
              position: 0,
              data_type: 'free_text',
            },
            {
              id: 'id5',
              list_item_field_configuration_id: 'id5',
              data: 'foo not completed product',
              archived_at: null,
              list_item_id: 'id3',
              label: 'product',
              user_id: 'id1',
              created_at: now,
              updated_at: now,
              position: 1,
              data_type: 'free_text',
            },
            {
              id: 'id6',
              list_item_field_configuration_id: 'id6',
              data: 'foo',
              archived_at: null,
              list_item_id: 'id3',
              label: 'category',
              user_id: 'id1',
              created_at: now,
              updated_at: now,
              position: 2,
              data_type: 'free_text',
            },
          ],
        };

        const nonCompletedItemFoo2 = {
          id: 'id4',
          refreshed: false,
          completed: false,
          archived_at: null,
          user_id: 'id1',
          list_id: 'id1',
          created_at: now,
          updated_at: now,
          fields: [
            {
              id: 'id7',
              list_item_field_configuration_id: 'id7',
              data: 'not completed quantity',
              archived_at: null,
              list_item_id: 'id4',
              label: 'quantity',
              user_id: 'id1',
              created_at: now,
              updated_at: now,
              position: 0,
              data_type: 'free_text',
            },
            {
              id: 'id8',
              list_item_field_configuration_id: 'id8',
              data: 'foo not completed product 2',
              archived_at: null,
              list_item_id: 'id4',
              label: 'product',
              user_id: 'id1',
              created_at: now,
              updated_at: now,
              position: 1,
              data_type: 'free_text',
            },
            {
              id: 'id9',
              list_item_field_configuration_id: 'id9',
              data: 'foo',
              archived_at: null,
              list_item_id: 'id4',
              label: 'category',
              user_id: 'id1',
              created_at: now,
              updated_at: now,
              position: 2,
              data_type: 'free_text',
            },
          ],
        };

        const nonCompletedItemBar = {
          id: 'id5',
          refreshed: false,
          completed: false,
          archived_at: null,
          user_id: 'id1',
          list_id: 'id1',
          created_at: now,
          updated_at: now,
          fields: [
            {
              id: 'id10',
              list_item_field_configuration_id: 'id10',
              data: 'not completed quantity',
              archived_at: null,
              list_item_id: 'id5',
              label: 'quantity',
              user_id: 'id1',
              created_at: now,
              updated_at: now,
              position: 0,
              data_type: 'free_text',
            },
            {
              id: 'id11',
              list_item_field_configuration_id: 'id11',
              data: 'bar not completed product',
              archived_at: null,
              list_item_id: 'id5',
              label: 'product',
              user_id: 'id1',
              created_at: now,
              updated_at: now,
              position: 1,
              data_type: 'free_text',
            },
            {
              id: 'id12',
              list_item_field_configuration_id: 'id12',
              data: 'bar',
              archived_at: null,
              list_item_id: 'id5',
              label: 'category',
              user_id: 'id1',
              created_at: now,
              updated_at: now,
              position: 2,
              data_type: 'free_text',
            },
          ],
        };

        const completedItem = {
          id: 'id1',
          refreshed: false,
          completed: true,
          archived_at: null,
          user_id: 'id1',
          list_id: 'id1',
          created_at: now,
          updated_at: now,
          fields: [
            {
              id: 'id1',
              list_item_field_configuration_id: 'id1',
              data: 'completed quantity',
              archived_at: null,
              list_item_id: 'id1',
              label: 'quantity',
              user_id: 'id1',
              created_at: now,
              updated_at: now,
              position: 0,
              data_type: 'free_text',
            },
            {
              id: 'id2',
              list_item_field_configuration_id: 'id2',
              data: 'foo completed product',
              archived_at: null,
              list_item_id: 'id1',
              label: 'product',
              user_id: 'id1',
              created_at: now,
              updated_at: now,
              position: 1,
              data_type: 'free_text',
            },
          ],
        };

        const list = {
          id: 'id1',
          name: 'foo',
          type: 'GroceryList',
          created_at: now,
          completed: false,
          owner_id: 'id1',
          refreshed: false,
        };

        const data = {
          current_user_id: 'id1',
          not_completed_items: [nonCompletedItem, nonCompletedItemFoo1, nonCompletedItemFoo2, nonCompletedItemBar],
          completed_items: [completedItem],
          list,
          categories: ['foo', 'bar'],
          list_users: [{ id: 'id1', email: 'foo@example.com' }],
          permissions: 'write',
          lists_to_update: [
            {
              id: 'id2',
              name: 'bar',
              type: 'GroceryList',
              created_at: now,
              completed: false,
              owner_id: 'id1',
              refreshed: false,
            },
          ],
          list_item_configurations: [],
          list_item_configuration: {
            id: 'id1',
            name: 'foo',
            created_at: now,
            updated_at: now,
            user_id: 'id1',
            archived_at: null,
          },
        };
        return Promise.resolve({ data });
      }
      // Field configuration prefetch
      if (url.includes('list_item_field_configurations')) {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: {} });
    }),
    post: jest.fn().mockResolvedValue({ data: {} }),
    put: jest.fn().mockResolvedValue({ data: {} }),
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

afterEach(() => {
  cleanup();
});
