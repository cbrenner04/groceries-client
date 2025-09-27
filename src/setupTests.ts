// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { cleanup, configure } from '@testing-library/react';
import { TextEncoder } from 'util';
import type { AxiosError, AxiosResponse } from 'axios';
import type { EListItemFieldType, IListItem, IListItemField } from 'typings';

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

        // Helper to create mock field
        const mockField = (
          itemId: string,
          label: string,
          data: string,
          position: number,
          fieldId: string,
        ): IListItemField => ({
          id: fieldId,
          list_item_field_configuration_id: fieldId,
          data,
          archived_at: null,
          list_item_id: itemId,
          label,
          user_id: 'id1',
          created_at: now,
          updated_at: now,
          position,
          data_type: 'free_text' as EListItemFieldType,
        });

        // Helper to create mock list item
        const mockListItem = (
          id: string,
          completed: boolean,
          quantity: string,
          product: string,
          category?: string,
        ): IListItem => {
          const fields = [
            mockField(id, 'quantity', quantity, 0, `field_${id}_1`),
            mockField(id, 'product', product, 1, `field_${id}_2`),
          ];
          if (category) {
            fields.push(mockField(id, 'category', category, 2, `field_${id}_3`));
          }
          return {
            id,
            refreshed: false,
            completed,
            archived_at: null,
            user_id: 'id1',
            list_id: 'id1',
            created_at: now,
            updated_at: now,
            fields,
          };
        };

        const data = {
          current_user_id: 'id1',
          not_completed_items: [
            mockListItem('id2', false, 'not completed quantity', 'no category not completed product'),
            mockListItem('id3', false, 'not completed quantity', 'foo not completed product', 'foo'),
            mockListItem('id4', false, 'not completed quantity', 'foo not completed product 2', 'foo'),
            mockListItem('id5', false, 'not completed quantity', 'bar not completed product', 'bar'),
          ],
          completed_items: [mockListItem('id1', true, 'completed quantity', 'foo completed product')],
          list: {
            id: 'id1',
            name: 'foo',
            type: 'GroceryList',
            created_at: now,
            completed: false,
            owner_id: 'id1',
            refreshed: false,
          },
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
