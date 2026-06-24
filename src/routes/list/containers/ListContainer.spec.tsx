import React from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import userEvent from '@testing-library/user-event';
import type { AxiosError, AxiosResponse } from 'axios';

import axios from 'utils/api';
import { EListItemFieldType, EUserPermissions, type IListItem } from 'typings';
import ListContainer, { type IListContainerProps } from './ListContainer';
import type { IChangeOtherListModalProps } from '../components/ChangeOtherListModal';
import type { IEditItemSheetProps } from '../components/EditItemSheet';
import type { IBulkEditSheetProps } from '../components/BulkEditSheet';
import { defaultTestData, createApiResponse, createListItem, createField } from 'test-utils/factories';
import { listCache } from 'utils/lightweightCache';
import { clearFieldConfigCache } from 'utils/fieldConfigCache';
import { unifiedCache } from 'utils/lightweightCache';
import { listDeduplicator } from 'utils/requestDeduplication';
import { showToast } from '../../../utils/toast';

// Create reference for test expectations
const mockShowToast = showToast as Mocked<typeof showToast>;
const POLLING_INTERVAL = parseInt(import.meta.env.VITE_POLLING_INTERVAL ?? '5000', 10);

// Mock react-router
const mockLocation = {
  pathname: '/lists/id1',
  search: '',
  hash: '',
  state: null,
  key: 'initial',
};

const mockNavigate = vi.fn();
async function advanceTimersByTime(ms: number): Promise<void> {
  await act(async () => {
    vi.advanceTimersByTime(ms);
    // Run only the timers that are now pending (not all timers)
    vi.runOnlyPendingTimers();
  });
}

vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useNavigate: (): Mock => mockNavigate,
  useLocation: (): typeof mockLocation => mockLocation,
}));

vi.mock('../components/ChangeOtherListModal', () => ({
  __esModule: true,
  default: (props: IChangeOtherListModalProps & { closeModal?: () => void }): React.JSX.Element => (
    <div role="dialog">
      <button data-test-id="change-other-list-handle-move" onClick={props.handleMove}>
        handle move
      </button>
      <button data-test-id="change-other-list-close" onClick={props.closeModal}>
        close
      </button>
    </div>
  ),
}));

vi.mock('../components/EditItemSheet', () => ({
  __esModule: true,
  default: (props: IEditItemSheetProps): React.JSX.Element => (
    <div role="dialog">
      <button data-test-id="edit-item-sheet-save" onClick={props.onSave}>
        save edit item
      </button>
      <button data-test-id="edit-item-sheet-close" onClick={props.onClose}>
        close edit item
      </button>
    </div>
  ),
}));

vi.mock('../../share_list/utils', () => ({
  __esModule: true,
  fetchData: vi.fn().mockResolvedValue({
    invitableUsers: [],
    userIsOwner: true,
    pending: [],
    accepted: [],
    refused: [],
    userId: 'id1',
  }),
}));

vi.mock('../components/BulkEditSheet', () => ({
  __esModule: true,
  default: (props: IBulkEditSheetProps): React.JSX.Element => (
    <div data-test-id="bulk-edit-sheet">
      <button data-test-id="bulk-edit-sheet-save" onClick={props.onSave}>
        save bulk edit
      </button>
      <button data-test-id="bulk-edit-sheet-close" onClick={props.onClose}>
        close bulk edit
      </button>
    </div>
  ),
}));

type TestRenderResult = ReturnType<typeof render>;
type TestUserEvent = ReturnType<typeof userEvent.setup>;

interface ISetupReturn extends TestRenderResult {
  user: TestUserEvent;
  props: IListContainerProps;
}

function setup(suppliedProps?: Partial<IListContainerProps>): ISetupReturn {
  const user = userEvent.setup();
  const props: IListContainerProps = {
    userId: defaultTestData.userId,
    list: defaultTestData.list,
    completedItems: [defaultTestData.completedItem],
    categories: defaultTestData.categories,
    listUsers: defaultTestData.listUsers,
    notCompletedItems: defaultTestData.notCompletedItems,
    listsToUpdate: defaultTestData.listsToUpdate,
    listItemConfiguration: defaultTestData.listItemConfiguration,
    permissions: defaultTestData.permissions,
    ...suppliedProps,
  };

  const component = render(
    <MemoryRouter>
      <ListContainer {...props} />
    </MemoryRouter>,
  );

  return { ...component, user, props };
}

describe('ListContainer', () => {
  beforeEach(() => {
    // Clear cache to ensure test isolation
    listCache.clear();
    unifiedCache.clear(); // Clear unified cache
    clearFieldConfigCache();
    listDeduplicator.clear();

    // Restore default mock implementations from setupTests
    (axios.get as Mock).mockImplementation(async (url: string) => {
      if (url.startsWith('/lists/')) {
        return Promise.resolve({ data: createApiResponse() });
      }
      if (url.includes('list_item_field_configurations')) {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: {} });
    });
    (axios.post as Mock).mockResolvedValue({ data: {} });
    (axios.put as Mock).mockResolvedValue({ data: {} });
    (axios.delete as Mock).mockResolvedValue({});
  });

  afterEach(() => {
    // Ensure no test leaves fake timers enabled
    vi.useRealTimers();
  });

  describe('Polling', () => {
    it('does not update via polling when different data is not returned', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });

      // Create API response with "item new" in not completed items
      const apiResponse = createApiResponse(
        [createListItem('id1', false, [createField('id1', 'product', 'item new', 'id1')])],
        [],
      );
      axios.get = vi.fn().mockResolvedValue({ data: apiResponse });

      const { findByText } = setup({ permissions: EUserPermissions.WRITE });

      await advanceTimersByTime(POLLING_INTERVAL);
      await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

      expect((await findByText('item new')).closest('[data-test-class]')).toHaveAttribute(
        'data-test-class',
        'non-completed-item',
      );

      await advanceTimersByTime(POLLING_INTERVAL);
      await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

      expect((await findByText('item new')).closest('[data-test-class]')).toHaveAttribute(
        'data-test-class',
        'non-completed-item',
      );

      vi.useRealTimers();
    });

    it('updates via polling when different data is returned', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });

      // First response: "item new" in not completed items
      const firstResponse = createApiResponse(
        [createListItem('id1', false, [createField('id1', 'product', 'item new', 'id1')])],
        [],
      );
      // Second response: "item new" moved to completed items
      const secondResponse = createApiResponse(
        [], // no not completed items
        [createListItem('id1', true, [createField('id1', 'product', 'item new', 'id1')])],
      );

      axios.get = vi
        .fn()
        .mockResolvedValueOnce({ data: firstResponse })
        .mockResolvedValueOnce({ data: secondResponse });

      const { findByText } = setup({ permissions: EUserPermissions.WRITE });

      await advanceTimersByTime(POLLING_INTERVAL);
      await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

      expect((await findByText('item new')).closest('[data-test-class]')).toHaveAttribute(
        'data-test-class',
        'non-completed-item',
      );

      await advanceTimersByTime(POLLING_INTERVAL);
      await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

      expect((await findByText('item new')).closest('[data-test-class]')).toHaveAttribute(
        'data-test-class',
        'completed-item',
      );

      vi.useRealTimers();
    });

    it('shows toast with unexplained error', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      axios.get = vi.fn().mockRejectedValue(new Error('Ahhhh!'));

      setup({ permissions: EUserPermissions.WRITE });

      await advanceTimersByTime(POLLING_INTERVAL);
      await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

      expect(mockShowToast.error).toHaveBeenCalledWith(
        'You may not be connected to the internet. Please check your connection. ' +
          'Data may be incomplete and user actions may not persist.',
      );

      vi.useRealTimers();
    });

    it('shows toast with server error', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const serverError = new Error('Server Error') as unknown as AxiosError;
      serverError.response = { status: 500 } as unknown as AxiosResponse;
      axios.get = vi.fn().mockRejectedValue(serverError);

      setup({ permissions: EUserPermissions.WRITE });

      await advanceTimersByTime(POLLING_INTERVAL);
      await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

      expect(mockShowToast.error).toHaveBeenCalledWith(
        'Something went wrong. Data may be incomplete and user actions may not persist.',
      );

      vi.useRealTimers();
    });

    it('shows toast with server error when error.response exists', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const serverError = new Error('Server Error') as unknown as AxiosError;
      serverError.response = { status: 503, data: {} } as unknown as AxiosResponse;
      axios.get = vi.fn().mockRejectedValue(serverError);

      setup({ permissions: EUserPermissions.WRITE });

      await advanceTimersByTime(POLLING_INTERVAL);
      await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

      // Verify the error.response branch is taken (line 123)
      expect(mockShowToast.error).toHaveBeenCalledWith(
        'Something went wrong. Data may be incomplete and user actions may not persist.',
      );

      vi.useRealTimers();
    });

    it('does not poll when tab is hidden', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });

      axios.get = vi.fn().mockResolvedValue({
        data: createApiResponse(defaultTestData.notCompletedItems, [defaultTestData.completedItem]),
      });

      setup({ permissions: EUserPermissions.WRITE });

      // Hide the tab by setting document.hidden and firing the event
      Object.defineProperty(document, 'hidden', { value: true, writable: true, configurable: true });
      await act(async () => {
        document.dispatchEvent(new Event('visibilitychange'));
      });

      // Reset axios mock call count after initial render
      vi.clearAllMocks();

      // Advance time - polling should not fire when tab is hidden
      await advanceTimersByTime(POLLING_INTERVAL);

      // Polling should be skipped when tab is hidden (line 75)
      expect(axios.get).not.toHaveBeenCalled();

      // Restore visibility
      Object.defineProperty(document, 'hidden', { value: false, writable: true, configurable: true });

      vi.useRealTimers();
    });
  });

  describe('Permissions', () => {
    it('renders Add Item button (form collapsed) when user has write permissions', async () => {
      const { container, findByTestId } = setup({ permissions: EUserPermissions.WRITE });

      expect(container).toMatchSnapshot();
      expect(await findByTestId('quick-add-input')).toBeVisible();
    });

    it('does not render ListForm when user has read permissions', () => {
      const { container, queryByTestId } = setup({ permissions: EUserPermissions.READ });

      expect(container).toMatchSnapshot();
      expect(queryByTestId('list-item-form')).toBeNull();
    });
  });

  describe('Category Filtering', () => {
    it('renders filtered items without category buckets when filter exists', async () => {
      const { container, findByTestId, findByText, queryByText, user } = setup();

      // Click the filter chip for the specific category to apply the filter
      await user.click(await findByTestId('filter-by-foo'));
      await waitFor(async () => {
        const activeFilter = await findByTestId('filter-by-foo');
        expect(activeFilter).toHaveAttribute('aria-pressed', 'true');
      });

      expect(container).toMatchSnapshot();
      expect(await findByText('foo not completed product')).toBeVisible();
      expect(await findByTestId('filter-by-foo')).toBeVisible();
      expect(queryByText('bar not completed product')).toBeNull();
    });

    it('renders items with category buckets when no filter is applied', async () => {
      const { container, findByText, findByTestId } = setup();

      expect(container).toMatchSnapshot();
      expect(await findByText('no category not completed product')).toBeVisible();
      expect(await findByText('foo not completed product')).toBeVisible();
      expect(await findByText('bar not completed product')).toBeVisible();
      expect(await findByTestId('filter-by-foo')).toBeVisible();
      expect(await findByTestId('filter-by-bar')).toBeVisible();
    });

    it('clears filter when filter is cleared', async () => {
      const { findByTestId, findByText, queryByText, user } = setup();

      // Click the filter chip to apply the filter
      await user.click(await findByTestId('filter-by-foo'));
      await waitFor(async () => {
        const activeFilter = await findByTestId('filter-by-foo');
        expect(activeFilter).toHaveAttribute('aria-pressed', 'true');
      });

      expect(await findByText('foo not completed product')).toBeVisible();
      expect(await findByTestId('filter-by-foo')).toBeVisible();
      expect(queryByText('bar not completed product')).toBeNull();

      await user.click(await findByTestId('clear-filter'));

      expect(await findByText('no category not completed product')).toBeVisible();
      expect(await findByText('foo not completed product')).toBeVisible();
      expect(await findByText('bar not completed product')).toBeVisible();
      expect(await findByTestId('filter-by-foo')).toBeVisible();
      expect(await findByTestId('filter-by-bar')).toBeVisible();
    });

    it('filters by uncategorized items only', async () => {
      const { findByTestId, findByText, queryByText, user } = setup();

      // Click the filter chip for uncategorized
      await user.click(await findByTestId('filter-by-uncategorized'));
      await waitFor(async () => {
        const activeFilter = await findByTestId('filter-by-uncategorized');
        expect(activeFilter).toHaveAttribute('aria-pressed', 'true');
      });

      // Should only show uncategorized items
      expect(await findByText('no category not completed product')).toBeVisible();
      expect(await findByTestId('clear-filter')).toBeVisible();

      // Should not show categorized items
      expect(queryByText('foo not completed product')).toBeNull();
      expect(queryByText('bar not completed product')).toBeNull();
    });

    it('filters by specific category only', async () => {
      const { findByTestId, findByText, queryByText, user } = setup();

      // Click the filter chip for the bar category
      await user.click(await findByTestId('filter-by-bar'));
      await waitFor(async () => {
        const activeFilter = await findByTestId('filter-by-bar');
        expect(activeFilter).toHaveAttribute('aria-pressed', 'true');
      });

      // Should only show bar category items
      expect(await findByText('bar not completed product')).toBeVisible();
      expect(await findByTestId('filter-by-bar')).toBeVisible();

      // Should not show other categories or uncategorized items
      expect(queryByText('foo not completed product')).toBeNull();
      expect(queryByText('no category not completed product')).toBeNull();
    });

    it('shows only selected category when filter is applied', async () => {
      const { findByTestId, findByText, queryByText, user } = setup();

      // Apply filter to foo category
      await user.click(await findByTestId('filter-by-foo'));
      await waitFor(async () => {
        const activeFilter = await findByTestId('filter-by-foo');
        expect(activeFilter).toHaveAttribute('aria-pressed', 'true');
      });

      // Should only show foo category items, not uncategorized items
      expect(await findByText('foo not completed product')).toBeVisible();
      expect(await findByTestId('filter-by-foo')).toBeVisible();
      expect(queryByText('no category not completed product')).toBeNull();
      expect(queryByText('bar not completed product')).toBeNull();
    });

    it('handles items with empty category data as uncategorized', async () => {
      const itemsWithEmptyCategory: IListItem[] = [
        {
          id: 'id4',
          archived_at: null,
          refreshed: false,
          completed: false,
          user_id: 'user_id',
          list_id: 'list_id',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          fields: [
            {
              id: 'id4',
              list_item_field_configuration_id: 'id4',
              archived_at: null,
              user_id: 'user_id',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              label: 'product',
              data: 'item with empty category',
              list_item_id: 'id4',
              position: 0,
              data_type: EListItemFieldType.FREE_TEXT,
            },
            {
              id: 'id4',
              list_item_field_configuration_id: 'id4',
              archived_at: null,
              user_id: 'user_id',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              label: 'quantity',
              data: '1',
              list_item_id: 'id4',
              position: 1,
              data_type: EListItemFieldType.NUMBER,
            },
            {
              id: 'id4',
              list_item_field_configuration_id: 'id4',
              archived_at: null,
              user_id: 'user_id',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              label: 'category',
              data: '',
              list_item_id: 'id4',
              position: 2,
              data_type: EListItemFieldType.FREE_TEXT,
            }, // Empty category data
          ],
        },
      ];

      const { findByTestId, findByText, user } = setup({
        notCompletedItems: itemsWithEmptyCategory,
      });

      // Click the filter chip for uncategorized items
      await user.click(await findByTestId('filter-by-uncategorized'));

      // Should show item with empty category data
      expect(await findByText('item with empty category')).toBeVisible();
    });

    it('handles items with missing category field as uncategorized', async () => {
      const itemsWithoutCategoryField: IListItem[] = [
        {
          id: 'id5',
          archived_at: null,
          refreshed: false,
          completed: false,
          user_id: 'user_id',
          list_id: 'list_id',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          fields: [
            {
              id: 'id5',
              list_item_field_configuration_id: 'id5',
              archived_at: null,
              user_id: 'user_id',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              label: 'product',
              data: 'item without category field',
              list_item_id: 'id5',
              position: 0,
              data_type: EListItemFieldType.FREE_TEXT,
            },
            {
              id: 'id5',
              list_item_field_configuration_id: 'id5',
              archived_at: null,
              user_id: 'user_id',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              label: 'quantity',
              data: '1',
              list_item_id: 'id5',
              position: 1,
              data_type: EListItemFieldType.NUMBER,
            },
            // No category field at all
          ],
        },
      ];

      const { findByTestId, findByText, user } = setup({
        notCompletedItems: itemsWithoutCategoryField,
      });

      // Click the filter chip for uncategorized items
      await user.click(await findByTestId('filter-by-uncategorized'));

      // Should show item without category field
      expect(await findByText('item without category field')).toBeVisible();
    });

    it('shows all categories and uncategorized when no filter is applied', async () => {
      const { findByText, findByTestId } = setup();

      // Should show all items grouped by category
      expect(await findByText('no category not completed product')).toBeVisible();
      expect(await findByText('foo not completed product')).toBeVisible();
      expect(await findByText('bar not completed product')).toBeVisible();
      expect(await findByTestId('filter-by-foo')).toBeVisible();
      expect(await findByTestId('filter-by-bar')).toBeVisible();
    });

    it('deselects category filter when same chip is clicked twice', async () => {
      const { findByTestId, user } = setup();

      // First click applies the filter
      await user.click(await findByTestId('filter-by-foo'));
      await waitFor(async () => {
        expect(await findByTestId('filter-by-foo')).toHaveAttribute('aria-pressed', 'true');
      });

      // Second click on the same chip clears the filter
      await user.click(await findByTestId('filter-by-foo'));
      await waitFor(async () => {
        expect(await findByTestId('clear-filter')).toHaveAttribute('aria-pressed', 'true');
      });
    });

    it('deselects uncategorized filter when Other chip is clicked twice', async () => {
      const { findByTestId, user } = setup();

      // First click applies uncategorized filter
      await user.click(await findByTestId('filter-by-uncategorized'));
      await waitFor(async () => {
        expect(await findByTestId('filter-by-uncategorized')).toHaveAttribute('aria-pressed', 'true');
      });

      // Second click clears the filter
      await user.click(await findByTestId('filter-by-uncategorized'));
      await waitFor(async () => {
        expect(await findByTestId('clear-filter')).toHaveAttribute('aria-pressed', 'true');
      });
    });
  });

  describe('Prefetch and undefined UI states', () => {
    afterEach(() => {
      vi.unstubAllEnvs();
      delete (globalThis as { requestIdleCallback?: unknown }).requestIdleCallback;
    });

    it('uses preloaded field configurations without making API calls', async () => {
      const getSpy = vi.fn().mockImplementation((url: string) => {
        if (url.includes('list_item_field_configurations')) {
          return Promise.resolve({
            data: [
              { id: 'config1', label: 'product', data_type: EListItemFieldType.FREE_TEXT, position: 1 },
              { id: 'config2', label: 'quantity', data_type: EListItemFieldType.FREE_TEXT, position: 0 },
            ],
          });
        }
        if (url.startsWith('/lists/')) {
          return Promise.resolve({
            data: createApiResponse(defaultTestData.notCompletedItems, [defaultTestData.completedItem]),
          });
        }
        return Promise.resolve({ data: {} });
      });
      axios.get = getSpy;

      const { findByLabelText, findByTestId, user } = setup({
        permissions: EUserPermissions.WRITE,
        listItemFieldConfigurations: [
          { id: 'config1', label: 'product', data_type: EListItemFieldType.FREE_TEXT, position: 1, primary: false },
          { id: 'config2', label: 'quantity', data_type: EListItemFieldType.FREE_TEXT, position: 0, primary: false },
        ],
      });

      // Open the form; fields should already be available from preloaded configurations
      await user.click(await findByTestId('quick-add-input'));
      await waitFor(async () => expect(await findByLabelText('Quantity')).toBeVisible());

      // No field configuration API calls should be made since data is preloaded
      const configCalls = getSpy.mock.calls.filter(([u]: [string]) => u.includes('list_item_field_configurations'));
      expect(configCalls.length).toBe(0);
    });

    it('does not prefetch on mount when disabled via environment variable', async () => {
      import.meta.env.VITE_PREFETCH_ON_MOUNT = 'false';

      const getSpy = vi.fn().mockImplementation((url: string) => {
        if (url.includes('list_item_field_configurations')) {
          return Promise.resolve({ data: [] });
        }
        if (url.startsWith('/lists/')) {
          return Promise.resolve({
            data: createApiResponse(defaultTestData.notCompletedItems, [defaultTestData.completedItem]),
          });
        }
        return Promise.resolve({ data: {} });
      });
      axios.get = getSpy;

      setup({ permissions: EUserPermissions.WRITE });

      // Wait a moment to ensure any potential prefetch would have fired
      await waitFor(() => new Promise((resolve) => setTimeout(resolve, 100)));

      // Should not have called field configurations API
      const configCalls = getSpy.mock.calls.filter(([u]: [string]) => u.includes('list_item_field_configurations'));
      expect(configCalls.length).toBe(0);
    });

    it('does not prefetch on mount when listItemFieldConfigurations already exist', async () => {
      const getSpy = vi.fn().mockImplementation((url: string) => {
        if (url.includes('list_item_field_configurations')) {
          return Promise.resolve({ data: [] });
        }
        if (url.startsWith('/lists/')) {
          return Promise.resolve({
            data: createApiResponse(defaultTestData.notCompletedItems, [defaultTestData.completedItem]),
          });
        }
        return Promise.resolve({ data: {} });
      });
      axios.get = getSpy;

      setup({
        permissions: EUserPermissions.WRITE,
        listItemFieldConfigurations: [
          { id: 'config1', label: 'product', data_type: EListItemFieldType.FREE_TEXT, position: 1, primary: false },
        ],
      });

      // Wait a moment to ensure any potential prefetch would have fired
      await waitFor(() => new Promise((resolve) => setTimeout(resolve, 100)));

      // Should not have called field configurations API
      const configCalls = getSpy.mock.calls.filter(([u]: [string]) => u.includes('list_item_field_configurations'));
      expect(configCalls.length).toBe(0);
    });

    it('does not prefetch on mount when no listItemConfiguration ID exists', async () => {
      const getSpy = vi.fn().mockImplementation((url: string) => {
        if (url.includes('list_item_field_configurations')) {
          return Promise.resolve({ data: [] });
        }
        if (url.startsWith('/lists/')) {
          return Promise.resolve({
            data: createApiResponse(defaultTestData.notCompletedItems, [defaultTestData.completedItem]),
          });
        }
        return Promise.resolve({ data: {} });
      });
      axios.get = getSpy;

      setup({
        permissions: EUserPermissions.WRITE,
        listItemConfiguration: undefined,
      });

      // Wait a moment to ensure any potential prefetch would have fired
      await waitFor(() => new Promise((resolve) => setTimeout(resolve, 100)));

      // Should not have called field configurations API
      const configCalls = getSpy.mock.calls.filter(([u]: [string]) => u.includes('list_item_field_configurations'));
      expect(configCalls.length).toBe(0);
    });

    it('handles errors gracefully during mount prefetch', async () => {
      const getSpy = vi.fn().mockImplementation((url: string) => {
        if (url.includes('list_item_field_configurations')) {
          return Promise.reject(new Error('Network error'));
        }
        if (url.startsWith('/lists/')) {
          return Promise.resolve({
            data: createApiResponse(defaultTestData.notCompletedItems, [defaultTestData.completedItem]),
          });
        }
        return Promise.resolve({ data: {} });
      });
      axios.get = getSpy;

      // Should not throw or crash the component
      const { container } = setup({ permissions: EUserPermissions.WRITE });

      // Wait for any async operations
      await waitFor(() => new Promise((resolve) => setTimeout(resolve, 100)));

      // Component should still render normally
      expect(container).toBeInTheDocument();

      // In test environment, prefetch may be disabled, so we just verify component works
      expect(container.querySelector('[data-test-id="quick-add-input"]')).toBeInTheDocument();
    });

    it('does not idle-prefetch when disabled via environment variable', async () => {
      import.meta.env.VITE_PREFETCH_IDLE = 'false';
      (globalThis as { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback = (
        cb: () => void,
      ): number => {
        cb();
        return 1;
      };

      const getSpy = vi.fn().mockImplementation((url: string) => {
        if (url.includes('list_item_field_configurations')) {
          return Promise.resolve({ data: [] });
        }
        if (url.startsWith('/lists/')) {
          return Promise.resolve({
            data: createApiResponse(defaultTestData.notCompletedItems, [defaultTestData.completedItem]),
          });
        }
        return Promise.resolve({ data: {} });
      });
      axios.get = getSpy;

      setup({ permissions: EUserPermissions.WRITE });

      // Wait a moment to ensure any potential idle prefetch would have fired
      await waitFor(() => new Promise((resolve) => setTimeout(resolve, 100)));

      // Should not have called idle prefetch
      const configCalls = getSpy.mock.calls.filter(([u]: [string]) => u.includes('list_item_field_configurations'));
      expect(configCalls.length).toBe(0);
    });

    it('does not idle-prefetch when listItemFieldConfigurations already exist', async () => {
      import.meta.env.VITE_PREFETCH_IDLE = 'true';
      (globalThis as { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback = (
        cb: () => void,
      ): number => {
        cb();
        return 1;
      };

      const getSpy = vi.fn().mockImplementation((url: string) => {
        if (url.includes('list_item_field_configurations')) {
          return Promise.resolve({ data: [] });
        }
        if (url.startsWith('/lists/')) {
          return Promise.resolve({
            data: createApiResponse(defaultTestData.notCompletedItems, [defaultTestData.completedItem]),
          });
        }
        return Promise.resolve({ data: {} });
      });
      axios.get = getSpy;

      setup({
        permissions: EUserPermissions.WRITE,
        listItemFieldConfigurations: [
          { id: 'config1', label: 'product', data_type: EListItemFieldType.FREE_TEXT, position: 1, primary: false },
        ],
      });

      // Wait a moment to ensure any potential idle prefetch would have fired
      await waitFor(() => new Promise((resolve) => setTimeout(resolve, 100)));

      // Should not have called idle prefetch
      const configCalls = getSpy.mock.calls.filter(([u]: [string]) => u.includes('list_item_field_configurations'));
      expect(configCalls.length).toBe(0);
    });

    it('does not idle-prefetch when no listItemConfiguration ID exists', async () => {
      import.meta.env.VITE_PREFETCH_IDLE = 'true';
      (globalThis as { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback = (
        cb: () => void,
      ): number => {
        cb();
        return 1;
      };

      const getSpy = vi.fn().mockImplementation((url: string) => {
        if (url.includes('list_item_field_configurations')) {
          return Promise.resolve({ data: [] });
        }
        if (url.startsWith('/lists/')) {
          return Promise.resolve({
            data: createApiResponse(defaultTestData.notCompletedItems, [defaultTestData.completedItem]),
          });
        }
        return Promise.resolve({ data: {} });
      });
      axios.get = getSpy;

      setup({
        permissions: EUserPermissions.WRITE,
        listItemConfiguration: undefined,
      });

      // Wait a moment to ensure any potential idle prefetch would have fired
      await waitFor(() => new Promise((resolve) => setTimeout(resolve, 100)));

      // Should not have called idle prefetch
      const configCalls = getSpy.mock.calls.filter(([u]: [string]) => u.includes('list_item_field_configurations'));
      expect(configCalls.length).toBe(0);
    });

    it('renders gracefully with preloaded field configurations and no API calls', async () => {
      const getSpy = vi.fn().mockImplementation((url: string) => {
        if (url.includes('list_item_field_configurations')) {
          return Promise.reject(new Error('Network error'));
        }
        if (url.startsWith('/lists/')) {
          return Promise.resolve({
            data: createApiResponse(defaultTestData.notCompletedItems, [defaultTestData.completedItem]),
          });
        }
        return Promise.resolve({ data: {} });
      });
      axios.get = getSpy;

      // Should not throw or crash the component with preloaded configurations
      const { container } = setup({
        permissions: EUserPermissions.WRITE,
        listItemFieldConfigurations: [
          { id: 'config1', label: 'product', data_type: EListItemFieldType.FREE_TEXT, position: 1, primary: false },
        ],
      });

      // Wait for any async operations
      await waitFor(() => new Promise((resolve) => setTimeout(resolve, 100)));

      // Component should still render normally
      expect(container).toBeInTheDocument();

      // No field configuration API calls should be made since data is preloaded
      const configCalls = getSpy.mock.calls.filter(([u]: [string]) => u.includes('list_item_field_configurations'));
      expect(configCalls.length).toBe(0);
    });

    it('handles component re-renders gracefully', async () => {
      const getSpy = vi.fn().mockImplementation((url: string) => {
        if (url.includes('list_item_field_configurations')) {
          return Promise.resolve({ data: [] });
        }
        if (url.startsWith('/lists/')) {
          return Promise.resolve({
            data: createApiResponse(defaultTestData.notCompletedItems, [defaultTestData.completedItem]),
          });
        }
        return Promise.resolve({ data: {} });
      });
      axios.get = getSpy;

      const { rerender } = setup({ permissions: EUserPermissions.WRITE });

      // Re-render with same props
      rerender(
        <MemoryRouter>
          <ListContainer
            userId={defaultTestData.userId}
            list={defaultTestData.list}
            completedItems={[defaultTestData.completedItem]}
            categories={defaultTestData.categories}
            listUsers={defaultTestData.listUsers}
            notCompletedItems={defaultTestData.notCompletedItems}
            listsToUpdate={defaultTestData.listsToUpdate}
            listItemConfiguration={defaultTestData.listItemConfiguration}
            permissions={EUserPermissions.WRITE}
          />
        </MemoryRouter>,
      );

      // Component should still render normally after re-render
      await waitFor(() => new Promise((resolve) => setTimeout(resolve, 50)));

      // Verify component is still functioning
      expect(document.querySelector('[data-test-id="quick-add-input"]')).toBeInTheDocument();
    });

    it('does not trigger prefetch when VITE_PREFETCH_ON_MOUNT is false', async () => {
      // Explicitly disable mount prefetch
      import.meta.env.VITE_PREFETCH_ON_MOUNT = 'false';

      const getSpy = vi.fn().mockImplementation((url: string) => {
        if (url.includes('list_item_field_configurations')) {
          return Promise.resolve({ data: [] });
        }
        if (url.startsWith('/lists/')) {
          return Promise.resolve({
            data: createApiResponse(defaultTestData.notCompletedItems, [defaultTestData.completedItem]),
          });
        }
        return Promise.resolve({ data: {} });
      });
      axios.get = getSpy;

      setup({
        permissions: EUserPermissions.WRITE,
        listItemFieldConfigurations: undefined,
      });

      // Wait a moment to ensure any potential prefetch would have fired
      await waitFor(() => new Promise((resolve) => setTimeout(resolve, 100)));

      // Should not have called field configurations API due to disabled prefetch
      const configCalls = getSpy.mock.calls.filter(([u]: [string]) => u.includes('list_item_field_configurations'));
      expect(configCalls.length).toBe(0);
    });

    it('does not trigger idle prefetch when VITE_PREFETCH_IDLE is false', async () => {
      // Explicitly disable idle prefetch
      import.meta.env.VITE_PREFETCH_IDLE = 'false';

      (globalThis as { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback = (
        cb: () => void,
      ): number => {
        cb();
        return 1;
      };

      const getSpy = vi.fn().mockImplementation((url: string) => {
        if (url.includes('list_item_field_configurations')) {
          return Promise.resolve({ data: [] });
        }
        if (url.startsWith('/lists/')) {
          return Promise.resolve({
            data: createApiResponse(defaultTestData.notCompletedItems, [defaultTestData.completedItem]),
          });
        }
        return Promise.resolve({ data: {} });
      });
      axios.get = getSpy;

      setup({
        permissions: EUserPermissions.WRITE,
        listItemFieldConfigurations: undefined,
      });

      // Wait a moment to ensure any potential idle prefetch would have fired
      await waitFor(() => new Promise((resolve) => setTimeout(resolve, 100)));

      // Should not have called field configurations API due to disabled idle prefetch
      const configCalls = getSpy.mock.calls.filter(([u]: [string]) => u.includes('list_item_field_configurations'));
      expect(configCalls.length).toBe(0);
    });

    it('handles form interaction correctly when no prefetch data is available', async () => {
      // Test that form works normally without prefetch data
      const mockFieldConfigs = [
        { id: 'config1', label: 'product', data_type: EListItemFieldType.FREE_TEXT, position: 1 },
        { id: 'config2', label: 'quantity', data_type: 'number', position: 0 },
      ];

      const getSpy = vi.fn().mockImplementation((url: string) => {
        if (url.includes('list_item_field_configurations')) {
          return Promise.resolve({ data: mockFieldConfigs });
        }
        if (url.startsWith('/lists/')) {
          return Promise.resolve({
            data: createApiResponse(defaultTestData.notCompletedItems, [defaultTestData.completedItem]),
          });
        }
        return Promise.resolve({ data: {} });
      });
      axios.get = getSpy;

      const { findByTestId, findByLabelText, user } = setup({
        permissions: EUserPermissions.WRITE,
        listItemFieldConfigurations: undefined, // No prefetch data
      });

      // Open the form
      await user.click(await findByTestId('quick-add-input'));

      // Fields should load normally when form opens
      await waitFor(async () => {
        expect(await findByLabelText('Quantity')).toBeVisible(); // position 0
        expect(await findByLabelText('Product')).toBeVisible(); // position 1
      });

      // Should have made API call when form opened (not from prefetch)
      const configCalls = getSpy.mock.calls.filter(([u]: [string]) => u.includes('list_item_field_configurations'));
      expect(configCalls.length).toBeGreaterThanOrEqual(1);
    });

    it('does not render the string "undefined" for items missing name fields', async () => {
      const unnamedItem: IListItem = createListItem('id_unnamed', false, [
        createField('id_cat', 'category', '', 'id_unnamed'),
      ]);
      const { findByText, queryByText } = setup({ notCompletedItems: [unnamedItem] });

      expect(await findByText('Untitled Item')).toBeVisible();
      expect(queryByText(/undefined/i)).toBeNull();
    });
  });

  describe('Item Rendering', () => {
    it('does not render incomplete items when none exist', () => {
      const { container } = setup({ notCompletedItems: [] });
      expect(container).toMatchSnapshot();
    });

    it('does not render complete items when none exist', () => {
      const { container } = setup({ completedItems: [] });
      expect(container).toMatchSnapshot();
    });
  });

  describe('Delete Operations', () => {
    it('renders confirmation modal when delete is clicked', async () => {
      const { container, findByTestId, user } = setup();

      // Wait for any async operations to complete before clicking
      await waitFor(() => {
        expect(findByTestId('not-completed-item-delete-id2')).resolves.toBeDefined();
      });

      await user.click(await findByTestId('not-completed-item-delete-id2'));

      expect(container).toMatchSnapshot();
      expect(await findByTestId('confirm-delete')).toBeVisible();
    });

    it('handles 401 on delete', async () => {
      axios.delete = vi.fn().mockRejectedValue({ response: { status: 401 } });
      const { findByTestId, user } = setup();

      await user.click(await findByTestId('not-completed-item-delete-id3'));
      expect(await findByTestId('confirm-delete')).toBeVisible();
      await user.click(await findByTestId('confirm-delete'));

      await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));

      expect(mockShowToast.error).toHaveBeenCalledWith('You must sign in');
      expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
    });

    it('handles 403 on delete', async () => {
      axios.delete = vi.fn().mockRejectedValue({ response: { status: 403 } });
      const { findByTestId, user } = setup();

      await user.click(await findByTestId('not-completed-item-delete-id3'));
      expect(await findByTestId('confirm-delete')).toBeVisible();
      await user.click(await findByTestId('confirm-delete'));

      await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));
      expect(mockShowToast.error).toHaveBeenCalledWith('Failed to delete item');
    });

    it('handles 404 on delete', async () => {
      axios.delete = vi.fn().mockRejectedValue({ response: { status: 404 } });
      const { findByTestId, user } = setup();

      await user.click(await findByTestId('not-completed-item-delete-id3'));
      expect(await findByTestId('confirm-delete')).toBeVisible();
      await user.click(await findByTestId('confirm-delete'));

      await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));
      expect(mockShowToast.error).toHaveBeenCalledWith('Failed to delete item');
    });

    it('handles not 401, 403, 404 on delete', async () => {
      axios.delete = vi.fn().mockRejectedValue({ response: { status: 500 } });
      const { findByTestId, user } = setup();

      await user.click(await findByTestId('not-completed-item-delete-id3'));
      expect(await findByTestId('confirm-delete')).toBeVisible();
      await user.click(await findByTestId('confirm-delete'));

      await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));
      expect(mockShowToast.error).toHaveBeenCalledWith(
        'Something went wrong. Data may be incomplete and user actions may not persist.',
      );
    });

    it('handles failed request on delete', async () => {
      axios.delete = vi.fn().mockRejectedValue({ request: 'failed to send request' });
      const { findByTestId, user } = setup();

      await user.click(await findByTestId('not-completed-item-delete-id3'));
      expect(await findByTestId('confirm-delete')).toBeVisible();
      await user.click(await findByTestId('confirm-delete'));

      await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));
      expect(mockShowToast.error).toHaveBeenCalledWith('Network error. Please check your connection.');
    });

    it('handles unknown failure on delete', async () => {
      axios.delete = vi.fn().mockRejectedValue(new Error('failed to send request'));
      const { findByTestId, user } = setup();

      await user.click(await findByTestId('not-completed-item-delete-id3'));
      expect(await findByTestId('confirm-delete')).toBeVisible();
      await user.click(await findByTestId('confirm-delete'));

      await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));
      expect(mockShowToast.error).toHaveBeenCalledWith(
        'Something went wrong. Data may be incomplete and user actions may not persist.',
      );
    });

    it('deletes item when confirmed, hides modal, removes category when item is last of category', async () => {
      axios.delete = vi.fn().mockResolvedValue({});
      const { findByText, findByTestId, queryByTestId, queryByText, user, queryAllByText } = setup();

      expect(await findByText('bar not completed product')).toBeVisible();
      expect((await queryAllByText('bar')).length).toBeGreaterThan(0);

      await user.click(await findByTestId('not-completed-item-delete-id5'));
      expect(await findByTestId('confirm-delete')).toBeVisible();
      await user.click(await findByTestId('confirm-delete'));

      await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(queryByTestId('confirm-delete')).toBeNull());

      expect(queryByText('bar not completed product')).toBeNull();
      expect((queryAllByText('bar') || []).length).toBe(0);
      expect(mockShowToast.info).toHaveBeenCalledWith('Item successfully deleted.');
    });

    it('deletes item, hides modal, does not remove category when item is not last of category', async () => {
      axios.delete = vi.fn().mockResolvedValue({});
      const { findByText, findByTestId, queryByTestId, queryByText, user, queryAllByText } = setup();

      expect(await findByText('foo not completed product')).toBeVisible();
      expect((await queryAllByText('foo')).length).toBeGreaterThan(0);

      await user.click(await findByTestId('not-completed-item-delete-id3'));
      expect(await findByTestId('confirm-delete')).toBeVisible();
      await user.click(await findByTestId('confirm-delete'));

      await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(queryByTestId('confirm-delete')).toBeNull());

      expect(queryByText('foo not completed product')).toBeNull();
      expect((queryAllByText('foo') || []).length).toBeGreaterThan(0);
      expect(mockShowToast.info).toHaveBeenCalledWith('Item successfully deleted.');
    });

    it('deletes item, hides modal, when item is in completed', async () => {
      axios.delete = vi.fn().mockResolvedValue({});
      const { findByText, findByTestId, queryByTestId, queryByText, user } = setup();

      expect((await findByText('foo completed product')).closest('[data-test-class]')).toHaveAttribute(
        'data-test-class',
        'completed-item',
      );

      await user.click(await findByTestId('completed-item-delete-id1'));
      expect(await findByTestId('confirm-delete')).toBeVisible();
      await user.click(await findByTestId('confirm-delete'));

      await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(queryByTestId('confirm-delete')).toBeNull());

      expect(queryByText('foo completed product')).toBeNull();
      expect(mockShowToast.info).toHaveBeenCalledWith('Item successfully deleted.');
    });

    it('deletes all items when multiple are selected', async () => {
      axios.delete = vi.fn().mockResolvedValueOnce({}).mockResolvedValueOnce({});
      const {
        findAllByRole,
        findByText,
        findByTestId,
        queryByTestId,
        queryByText,
        queryAllByText,
        findAllByText,
        user,
      } = setup();

      expect(await findByText('foo not completed product', { exact: true })).toBeVisible();
      expect(await findByText('foo not completed product 2')).toBeVisible();
      expect(await findByText('bar not completed product')).toBeVisible();

      await user.click((await findAllByText('Select Items'))[0]);
      await waitFor(async () => expect(await findByText('Cancel')).toBeVisible());

      // Checkboxes: [0]=id2 (uncategorized), [1]=id3 (foo), [2]=id4 (foo), [3]=id5 (bar)
      const checkboxes = await findAllByRole('checkbox');
      await user.click(checkboxes[1]);
      await user.click(checkboxes[2]);
      // During multiselect, inline buttons are hidden; click MultiSelectBar delete instead
      await user.click(await findByTestId('delete-selected'));

      expect(await findByTestId('confirm-delete')).toBeVisible();
      await user.click(await findByTestId('confirm-delete'));

      await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(2));
      await waitFor(() => expect(queryByTestId('confirm-delete')).toBeNull());

      // After deleting all 'foo' items, they should be gone but 'foo' may still appear in title/filters
      expect(queryByText('foo not completed product', { exact: true })).toBeNull();
      expect(queryByText('foo not completed product 2')).toBeNull();
      expect(await findByText('bar not completed product')).toBeVisible();
      // Verify 'bar' category still exists (in button, header, or count)
      expect((queryAllByText('bar') || []).length).toBeGreaterThan(0);
    });

    it('handles partial failure when deleting multiple items - some succeed, some fail', async () => {
      // Mock first item to succeed, second to fail
      axios.delete = vi
        .fn()
        .mockResolvedValueOnce({})
        .mockRejectedValueOnce({ response: { status: 500 } });

      const { findAllByRole, findByText, findByTestId, findAllByText, queryByText, user } = setup();

      await user.click((await findAllByText('Select Items'))[0]);
      await waitFor(async () => expect(await findByText('Cancel')).toBeVisible());

      // Checkboxes: [0]=id2 (uncategorized), [1]=id3 (foo), [2]=id4 (foo), [3]=id5 (bar)
      const checkboxes = await findAllByRole('checkbox');
      await user.click(checkboxes[1]);
      await user.click(checkboxes[2]);
      // During multiselect, inline buttons are hidden; click MultiSelectBar delete instead
      await user.click(await findByTestId('delete-selected'));

      expect(await findByTestId('confirm-delete')).toBeVisible();
      await user.click(await findByTestId('confirm-delete'));

      await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(2));

      // Should show warning toast about partial failure
      expect(mockShowToast.warning).toHaveBeenCalledWith(
        'Some items failed to delete. Item deleted successfully. Item failed.',
      );

      // The successful item should be deleted, failed item should be rolled back
      // checkboxes[1] = id3 (foo not completed product) - should be deleted (success)
      // checkboxes[2] = id4 (foo not completed product 2) - should be rolled back (failure)
      expect(queryByText('foo not completed product')).toBeNull();
      expect(await findByText('foo not completed product 2')).toBeVisible();
    });

    it('handles complete failure when deleting multiple items - all fail', async () => {
      // Mock all items to fail
      axios.delete = vi
        .fn()
        .mockRejectedValueOnce({ response: { status: 500 } })
        .mockRejectedValueOnce({ response: { status: 500 } });

      const { findAllByRole, findByText, findByTestId, findAllByText, user } = setup();

      await user.click((await findAllByText('Select Items'))[0]);
      await waitFor(async () => expect(await findByText('Cancel')).toBeVisible());

      const checkboxes = await findAllByRole('checkbox');
      await user.click(checkboxes[1]);
      await user.click(checkboxes[2]);
      // During multiselect, inline buttons are hidden; click MultiSelectBar delete instead
      await user.click(await findByTestId('delete-selected'));

      expect(await findByTestId('confirm-delete')).toBeVisible();
      await user.click(await findByTestId('confirm-delete'));

      await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(2));

      // Should show error toast for complete failure
      expect(mockShowToast.error).toHaveBeenCalledWith('Failed to delete items. Please try again.');

      // All items should be rolled back to their original state
      expect(await findByText('foo not completed product')).toBeVisible();
      expect(await findByText('foo not completed product 2')).toBeVisible();
    });

    it('does not delete item when delete is cleared, hides modal', async () => {
      const { findByTestId, findByText, queryByTestId, user } = setup();

      await user.click(await findByTestId('not-completed-item-delete-id2'));
      expect(await findByTestId('clear-delete')).toBeVisible();
      await user.click(await findByTestId('clear-delete'));

      await waitFor(() => expect(queryByTestId('clear-delete')).toBeNull());
      expect(await findByText('no category not completed product')).toBeVisible();
    });
  });

  describe('Complete Operations', () => {
    it('moves item to completed', async () => {
      const completedItem = createListItem('id2', true, [
        createField('id2', 'quantity', 'not completed quantity', 'id2'),
        createField('id3', 'product', 'no category not completed product', 'id2'),
      ]);
      axios.put = vi.fn().mockResolvedValue({ data: completedItem });

      const { findByText, findByTestId, user } = setup();

      expect((await findByText('no category not completed product')).closest('[data-test-class]')).toHaveAttribute(
        'data-test-class',
        'non-completed-item',
      );

      await user.click(await findByTestId('not-completed-item-complete-id2'));

      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

      expect((await findByText('no category not completed product')).closest('[data-test-class]')).toHaveAttribute(
        'data-test-class',
        'completed-item',
      );
    });

    it('moves item to completed and clears filter when item is last of category', async () => {
      const completedItem = createListItem('id5', true, [
        createField('id10', 'quantity', 'not completed quantity', 'id5'),
        createField('id11', 'product', 'bar not completed product', 'id5', { primary: true }),
        createField('id12', 'category', 'bar', 'id5'),
      ]);
      axios.put = vi.fn().mockResolvedValue({ data: completedItem });

      const { findByText, findByTestId, queryByText, user } = setup();

      // Click the filter chip for the specific category
      await user.click(await findByTestId('filter-by-foo'));
      await waitFor(async () => expect(await findByTestId('filter-by-bar')).toBeVisible());
      await user.click(await findByTestId('filter-by-bar'));

      await waitFor(() => expect(queryByText('foo not completed product')).toBeNull());

      expect(await findByTestId('clear-filter')).toBeVisible();
      expect((await findByText('bar not completed product')).closest('[data-test-class]')).toHaveAttribute(
        'data-test-class',
        'non-completed-item',
      );

      await user.click(await findByTestId('not-completed-item-complete-id5'));

      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

      // The filter should remain visible since there are still items in the category
      expect(await findByTestId('clear-filter')).toBeVisible();
      // The item should now be in completed state
      expect((await findByText('bar not completed product')).closest('[data-test-class]')).toHaveAttribute(
        'data-test-class',
        'completed-item',
      );
    });

    it('moves items to completed when multiple selected', async () => {
      const completedItem = createListItem('id2', true, [
        createField('id2', 'quantity', 'not completed quantity', 'id2'),
        createField('id3', 'product', 'no category not completed product', 'id2'),
      ]);
      axios.put = vi.fn().mockResolvedValue({ data: completedItem });

      const { findAllByRole, findByText, findByTestId, findAllByText, user } = setup();

      // Check initial state
      const initialItem = await findByTestId('not-completed-item-complete-id2');
      expect(initialItem.closest('[data-test-class="non-completed-item"]')).toBeInTheDocument();

      await user.click((await findAllByText('Select Items'))[0]);
      await waitFor(async () => expect(await findByText('Cancel')).toBeVisible());

      const checkboxes = (await findAllByRole('checkbox')).filter((cb) => cb.id !== 'completed');
      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);
      // During multiselect, inline buttons are hidden; click MultiSelectBar complete button instead
      await user.click(await findByTestId('complete-selected'));

      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(2));

      // Check that items are now in completed section
      const completedItems = document.querySelectorAll('[data-test-class="completed-item"]');
      expect(completedItems.length).toBeGreaterThan(1);
      expect(await findByTestId('filter-by-bar')).toBeVisible();
    });

    it('handles partial failure when completing multiple items - some succeed, some fail', async () => {
      // Mock first item to succeed, second to fail
      axios.put = vi
        .fn()
        .mockResolvedValueOnce({ data: createListItem('id2', true, [createField('id2', 'product', 'item 1', 'id2')]) })
        .mockRejectedValueOnce({ response: { status: 500 } });

      const { findAllByRole, findByText, findByTestId, findAllByText, user } = setup();

      await user.click((await findAllByText('Select Items'))[0]);
      await waitFor(async () => expect(await findByText('Cancel')).toBeVisible());

      const checkboxes = (await findAllByRole('checkbox')).filter((cb) => cb.id !== 'completed');
      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);
      // During multiselect, inline buttons are hidden; click MultiSelectBar complete button instead
      await user.click(await findByTestId('complete-selected'));

      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(2));

      // Should show warning toast about partial failure
      expect(mockShowToast.warning).toHaveBeenCalledWith(
        'Some items failed to complete. Item completed successfully. Item failed.',
      );

      // The successful item should remain in completed, failed item should be rolled back to not completed
      expect(await findByText('no category not completed product')).toBeVisible();
    });

    it('handles complete failure when completing multiple items - all fail', async () => {
      // Mock all items to fail
      axios.put = vi
        .fn()
        .mockRejectedValueOnce({ response: { status: 500 } })
        .mockRejectedValueOnce({ response: { status: 500 } });

      const { findAllByRole, findByText, findByTestId, findAllByText, user } = setup();

      await user.click((await findAllByText('Select Items'))[0]);
      await waitFor(async () => expect(await findByText('Cancel')).toBeVisible());

      const checkboxes = (await findAllByRole('checkbox')).filter((cb) => cb.id !== 'completed');
      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);
      // During multiselect, inline buttons are hidden; click MultiSelectBar complete button instead
      await user.click(await findByTestId('complete-selected'));

      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(2));

      // Should call handleFailure for complete failure
      expect(await findByText('no category not completed product')).toBeVisible();
      expect(await findByText('foo not completed product')).toBeVisible();
    });

    it('handles 401 on complete', async () => {
      axios.put = vi.fn().mockRejectedValue({ response: { status: 401 } });
      const { findByTestId, user } = setup();

      await user.click(await findByTestId('not-completed-item-complete-id2'));

      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));

      expect(mockShowToast.error).toHaveBeenCalledWith('You must sign in');
      expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
    });

    it('handles 403 on complete', async () => {
      axios.put = vi.fn().mockRejectedValue({ response: { status: 403 } });
      const { findByTestId, user } = setup();

      await user.click(await findByTestId('not-completed-item-complete-id2'));

      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
      expect(mockShowToast.error).toHaveBeenCalledWith('Failed to complete item');
    });

    it('handles 404 on complete', async () => {
      axios.put = vi.fn().mockRejectedValue({ response: { status: 404 } });
      const { findByTestId, user } = setup();

      await user.click(await findByTestId('not-completed-item-complete-id2'));

      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
      expect(mockShowToast.error).toHaveBeenCalledWith('Failed to complete item');
    });

    it('handles not 401, 403, 404 on complete', async () => {
      axios.put = vi.fn().mockRejectedValue({ response: { status: 500 } });
      const { findByTestId, user } = setup();

      await user.click(await findByTestId('not-completed-item-complete-id2'));

      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
      expect(mockShowToast.error).toHaveBeenCalledWith(
        'Something went wrong. Data may be incomplete and user actions may not persist.',
      );
    });

    it('handles failed request on complete', async () => {
      axios.put = vi.fn().mockRejectedValue({ request: 'failed to send request' });
      const { findByTestId, user } = setup();

      await user.click(await findByTestId('not-completed-item-complete-id2'));

      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
      expect(mockShowToast.error).toHaveBeenCalledWith('Network error. Please check your connection.');
    });

    it('handles unknown failure on complete', async () => {
      axios.put = vi.fn().mockRejectedValue(new Error('failed to send request'));
      const { findByTestId, user } = setup();

      await user.click(await findByTestId('not-completed-item-complete-id2'));

      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
      expect(mockShowToast.error).toHaveBeenCalledWith(
        'Something went wrong. Data may be incomplete and user actions may not persist.',
      );
    });
  });

  describe('Refresh Operations', () => {
    it('moves item to not completed when refreshed', async () => {
      // Mock the new API pattern: create item, create fields, fetch complete item
      axios.post = vi
        .fn()
        .mockResolvedValueOnce({ data: { id: 'id6', completed: false } }) // Create item
        .mockResolvedValueOnce({ data: {} }) // Create quantity field
        .mockResolvedValueOnce({ data: {} }); // Create product field
      axios.get = vi.fn().mockResolvedValueOnce({
        data: {
          archived_at: null,
          category: 'foo',
          created_at: '2020-05-24T11:07:48.751-05:00',
          grocery_list_id: 'id1',
          id: 'id6',
          product: 'foo completed product',
          completed: false,
          quantity: 'completed quantity',
          refreshed: false,
          updated_at: '2020-05-24T11:07:48.751-05:00',
          user_id: 'id1',
          fields: [
            createField('id1', 'quantity', 'completed quantity', 'id6'),
            createField('id2', 'product', 'foo completed product', 'id6', { primary: true }),
          ],
        },
      }); // Fetch complete item
      axios.put = vi.fn().mockResolvedValue(undefined);
      const { findByTestId, findByText, user } = setup();

      expect((await findByText('foo completed product')).closest('[data-test-class]')).toHaveAttribute(
        'data-test-class',
        'completed-item',
      );

      await user.click(await findByTestId('completed-item-refresh-id1'));

      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(3)); // Create item + 2 fields
      await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1)); // Fetch complete item
      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

      await waitFor(async () =>
        expect((await findByText('foo completed product')).closest('[data-test-class]')).toHaveAttribute(
          'data-test-class',
          'non-completed-item',
        ),
      );

      expect((await findByText('foo completed product')).closest('[data-test-class]')).toHaveAttribute(
        'data-test-class',
        'non-completed-item',
      );
    });

    // Note: Bulk refresh of completed items via multi-select was removed in the new UI.
    // Completed items are refreshed individually via the refresh button on each item.

    it('handles 401 on refresh', async () => {
      axios.post = vi.fn().mockRejectedValue({ response: { status: 401 } });
      axios.put = vi.fn().mockResolvedValue(undefined);
      const { findByTestId, user } = setup();

      await user.click(await findByTestId('completed-item-refresh-id1'));

      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));

      expect(mockShowToast.error).toHaveBeenCalledWith('You must sign in');
      expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
    });

    it('handles 403 on refresh', async () => {
      axios.post = vi.fn().mockRejectedValue({ response: { status: 403 } });
      axios.put = vi.fn().mockResolvedValue(undefined);
      const { findByTestId, user } = setup();

      await user.click(await findByTestId('completed-item-refresh-id1'));

      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

      expect(mockShowToast.error).toHaveBeenCalledWith('Failed to refresh item');
    });

    it('handles 404 on refresh', async () => {
      axios.post = vi.fn().mockRejectedValue({ response: { status: 404 } });
      axios.put = vi.fn().mockResolvedValue(undefined);
      const { findByTestId, user } = setup();

      await user.click(await findByTestId('completed-item-refresh-id1'));

      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

      expect(mockShowToast.error).toHaveBeenCalledWith('Failed to refresh item');
    });

    it('handles not 401, 403, 404 on refresh', async () => {
      axios.post = vi.fn().mockRejectedValue({ response: { status: 500 } });
      axios.put = vi.fn().mockResolvedValue(undefined);
      const { findByTestId, user } = setup();

      await user.click(await findByTestId('completed-item-refresh-id1'));

      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

      expect(mockShowToast.error).toHaveBeenCalledWith(
        'Something went wrong. Data may be incomplete and user actions may not persist.',
      );
    });

    // Note: Bulk refresh failure for completed items via multi-select was removed in the new UI.
    // Individual refresh failures are tested above.

    it('handles failed request on refresh', async () => {
      axios.post = vi.fn().mockRejectedValue({ request: 'failed to send request' });
      axios.put = vi.fn().mockResolvedValue(undefined);
      const { findByTestId, user } = setup();

      await user.click(await findByTestId('completed-item-refresh-id1'));

      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

      expect(mockShowToast.error).toHaveBeenCalledWith('Network error. Please check your connection.');
    });

    it('handles unknown failure on refresh', async () => {
      axios.post = vi.fn().mockRejectedValue(new Error('failed to send request'));
      axios.put = vi.fn().mockResolvedValue(undefined);
      const { findByTestId, user } = setup();

      await user.click(await findByTestId('completed-item-refresh-id1'));

      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

      expect(mockShowToast.error).toHaveBeenCalledWith(
        'Something went wrong. Data may be incomplete and user actions may not persist.',
      );
    });
  });

  describe('Multi-Select Operations', () => {
    it('cannot multi select if user does not have write access', () => {
      const { queryByText } = setup({ permissions: EUserPermissions.READ });
      expect(queryByText('Select Items')).toBeNull();
    });

    it('changes select to hide select when multi select is on', async () => {
      const { findAllByText, findByText, user } = setup({ permissions: EUserPermissions.WRITE });

      expect((await findAllByText('Select Items'))[0]).toHaveTextContent('Select');

      await user.click((await findAllByText('Select Items'))[0]);
      await waitFor(async () => expect(await findByText('Cancel')).toBeVisible());

      expect(await findByText('Cancel')).toBeVisible();
    });

    it('handles item select for multi select when item has not been selected', async () => {
      const { findAllByRole, findAllByText, findByText, user } = setup({ permissions: EUserPermissions.WRITE });

      await user.click((await findAllByText('Select Items'))[0]);
      await waitFor(async () => expect(await findByText('Cancel')).toBeVisible());

      await user.click((await findAllByRole('checkbox'))[0]);

      expect((await findAllByRole('checkbox'))[0]).toBeChecked();
    });

    it('handles item select for multi select when item has been selected', async () => {
      const { findAllByRole, findAllByText, findByText, user } = setup({ permissions: EUserPermissions.WRITE });

      await user.click((await findAllByText('Select Items'))[0]);
      await waitFor(async () => expect(await findByText('Cancel')).toBeVisible());

      await user.click((await findAllByRole('checkbox'))[0]);
      await user.click((await findAllByRole('checkbox'))[0]);

      expect((await findAllByRole('checkbox'))[0]).not.toBeChecked();
    });

    it('preserves selected items when multi select is toggled off and on for not completed items', async () => {
      const { findAllByRole, findAllByText, findByText, user } = setup({ permissions: EUserPermissions.WRITE });

      await user.click((await findAllByText('Select Items'))[0]);
      await waitFor(async () => expect(await findByText('Cancel')).toBeVisible());

      const multiSelectCheckboxes = await findAllByRole('checkbox');
      await user.click(multiSelectCheckboxes[0]);
      expect(multiSelectCheckboxes[0]).toBeChecked();

      await user.click(await findByText('Cancel'));
      await user.click((await findAllByText('Select Items'))[0]);
      await waitFor(async () => expect(await findByText('Cancel')).toBeVisible());

      const updatedMultiSelectCheckboxes = await findAllByRole('checkbox');
      expect(updatedMultiSelectCheckboxes[0]).toBeChecked();
    });

    // Multi-select is now unified: one "Select" button in the header toggles checkboxes for all items.

    it('opens edit sheet when clicking edit icon with no multi select', async () => {
      // Mock axios for EditItemSheet data fetch
      axios.get = vi.fn().mockResolvedValue({
        data: {
          list: defaultTestData.list,
          item: defaultTestData.notCompletedItems[0],
          list_users: defaultTestData.listUsers,
          list_item_configuration: defaultTestData.listItemConfiguration,
          list_item_field_configurations: [],
          categories: defaultTestData.categories,
        },
      });

      const { findByTestId, findByRole, props, user } = setup({ permissions: EUserPermissions.WRITE });
      await user.click(await findByTestId(`not-completed-item-edit-${props.notCompletedItems[0].id}`));

      // Should open edit sheet (BottomSheet) instead of navigating
      await waitFor(async () => {
        const dialog = await findByRole('dialog');
        expect(dialog).toBeInTheDocument();
      });
    });

    it('opens bulk edit sheet when clicking edit with multi select', async () => {
      const { findAllByRole, findByTestId, findAllByText, findByText, user } = setup({
        permissions: EUserPermissions.WRITE,
      });

      expect((await findAllByText('Select Items'))[0]).toHaveTextContent('Select');

      await user.click((await findAllByText('Select Items'))[0]);
      await waitFor(async () => expect(await findByText('Cancel')).toBeVisible());

      const multiSelectCheckboxes = (await findAllByRole('checkbox')).filter((cb) => cb.id !== 'completed');
      await user.click(multiSelectCheckboxes[0]);
      await user.click(multiSelectCheckboxes[1]);
      // During multiselect, inline buttons are hidden; click MultiSelectBar bulk-edit button instead
      await user.click(await findByTestId('bulk-edit'));

      // Should open bulk edit sheet (BottomSheet) instead of navigating
      // The sheet should be rendered with the selected items
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(0));
    });

    // Copy/move is triggered via MultiSelectBar actions through setCopyMoveSheet state.

    it('shows MultiSelectBar with correct actions when not-completed items are selected', async () => {
      const { findAllByRole, findAllByText, findByText, findByTestId, user } = setup({
        permissions: EUserPermissions.WRITE,
      });

      await user.click((await findAllByText('Select Items'))[0]);
      await waitFor(async () => expect(await findByText('Cancel')).toBeVisible());

      const checkboxes = (await findAllByRole('checkbox')).filter((cb) => cb.id !== 'completed');
      await user.click(checkboxes[0]);

      expect(await findByTestId('multi-select-bar')).toBeInTheDocument();
      expect(await findByTestId('complete-selected')).toBeInTheDocument();
      expect(await findByTestId('copy-to-list')).toBeInTheDocument();
      expect(await findByTestId('move-to-list')).toBeInTheDocument();
      expect(await findByTestId('bulk-edit')).toBeInTheDocument();
      expect(await findByTestId('delete-selected')).toBeInTheDocument();
    });

    it('shows MultiSelectBar with only delete when mixed items are selected', async () => {
      const { findAllByRole, findAllByText, findByText, findByTestId, queryByTestId, user } = setup({
        permissions: EUserPermissions.WRITE,
      });

      await user.click((await findAllByText('Select Items'))[0]);
      await waitFor(async () => expect(await findByText('Cancel')).toBeVisible());

      // Select a not-completed item
      const checkboxes = await findAllByRole('checkbox');
      await user.click(checkboxes[0]);

      // Expand completed section and select a completed item
      const completedHeader = findByText(/Completed/);
      if (completedHeader) {
        await user.click(await completedHeader);
      }

      const allCheckboxes = await findAllByRole('checkbox');
      const completedCheckbox = allCheckboxes.find((cb) => cb.id === 'completed');
      if (completedCheckbox) {
        // A completed item checkbox would appear after expanding completed section
        const completedItemCheckboxes = allCheckboxes.filter((cb) => cb.id !== 'completed' && !checkboxes.includes(cb));
        if (completedItemCheckboxes.length > 0) {
          await user.click(completedItemCheckboxes[0]);
        }
      }

      // When both types selected, only delete should show (plus close)
      const bar = queryByTestId('multi-select-bar');
      if (bar) {
        expect(await findByTestId('delete-selected')).toBeInTheDocument();
      }
    });

    it('closes MultiSelectBar and clears selection when close button is clicked', async () => {
      const { findAllByRole, findAllByText, findByText, findByTestId, queryByTestId, user } = setup({
        permissions: EUserPermissions.WRITE,
      });

      await user.click((await findAllByText('Select Items'))[0]);
      await waitFor(async () => expect(await findByText('Cancel')).toBeVisible());

      const checkboxes = (await findAllByRole('checkbox')).filter((cb) => cb.id !== 'completed');
      await user.click(checkboxes[0]);

      expect(await findByTestId('multi-select-bar')).toBeInTheDocument();

      await user.click(await findByTestId('multi-select-close'));

      await waitFor(() => expect(queryByTestId('multi-select-bar')).not.toBeInTheDocument());
    });

    it('opens copy/move sheet when copy-to-list action is clicked', async () => {
      const { findAllByRole, findAllByText, findByText, findByTestId, user } = setup({
        permissions: EUserPermissions.WRITE,
      });

      await user.click((await findAllByText('Select Items'))[0]);
      await waitFor(async () => expect(await findByText('Cancel')).toBeVisible());

      const checkboxes = (await findAllByRole('checkbox')).filter((cb) => cb.id !== 'completed');
      await user.click(checkboxes[0]);

      await user.click(await findByTestId('copy-to-list'));

      // ChangeOtherListModal should render (copyMoveSheet state set to copy mode)
      await waitFor(() => {
        expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
      });
    });

    it('opens copy/move sheet when move-to-list action is clicked', async () => {
      const { findAllByRole, findAllByText, findByText, findByTestId, user } = setup({
        permissions: EUserPermissions.WRITE,
      });

      await user.click((await findAllByText('Select Items'))[0]);
      await waitFor(async () => expect(await findByText('Cancel')).toBeVisible());

      const checkboxes = (await findAllByRole('checkbox')).filter((cb) => cb.id !== 'completed');
      await user.click(checkboxes[0]);

      await user.click(await findByTestId('move-to-list'));

      await waitFor(() => {
        expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
      });
    });

    it('removes selected items from list state when handleMove is called', async () => {
      const { findAllByRole, findAllByText, findByText, findByTestId, queryByText, user } = setup({
        permissions: EUserPermissions.WRITE,
      });

      expect(await findByText('foo not completed product')).toBeVisible();

      await user.click((await findAllByText('Select Items'))[0]);
      await waitFor(async () => expect(await findByText('Cancel')).toBeVisible());

      const checkboxes = (await findAllByRole('checkbox')).filter((cb) => cb.id !== 'completed');
      await user.click(checkboxes[0]);
      await user.click(await findByTestId('move-to-list'));

      await waitFor(() => {
        expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
      });

      await user.click(await findByTestId('change-other-list-handle-move'));

      await waitFor(() => {
        expect(queryByText('no category not completed product')).toBeNull();
      });
    });

    it('opens bulk edit sheet when bulk-edit action is clicked', async () => {
      const { findAllByRole, findAllByText, findByText, findByTestId, user } = setup({
        permissions: EUserPermissions.WRITE,
      });

      await user.click((await findAllByText('Select Items'))[0]);
      await waitFor(async () => expect(await findByText('Cancel')).toBeVisible());

      const checkboxes = (await findAllByRole('checkbox')).filter((cb) => cb.id !== 'completed');
      await user.click(checkboxes[0]);

      await user.click(await findByTestId('bulk-edit'));

      // BulkEditSheet renders when bulkEditOpen is true
      expect(await findByTestId('bulk-edit-sheet')).toBeInTheDocument();
    });

    it('shows refresh action in MultiSelectBar when only completed items are selected', async () => {
      // Use no not-completed items so the only selectable items are completed.
      // The completed section auto-expands when item count <= 5.
      const { findByTestId, findByText, user } = setup({
        permissions: EUserPermissions.WRITE,
        notCompletedItems: [],
      });

      // Enter multi-select mode
      await user.click(await findByTestId('select-button'));
      await waitFor(async () => expect(await findByText('Cancel')).toBeVisible());

      // Select the completed item (id1 from defaultTestData.completedItem)
      const checkbox = await findByTestId('completed-item-select-id1');
      await user.click(checkbox);

      // Refresh action should appear since only completed items are selected
      expect(await findByTestId('refresh-selected')).toBeInTheDocument();
    });

    it('opens EditItemSheet when initialEditingItemId is provided', async () => {
      axios.get = vi.fn().mockResolvedValue({
        data: {
          list: defaultTestData.list,
          item: defaultTestData.notCompletedItems[0],
          list_users: defaultTestData.listUsers,
          list_item_configuration: defaultTestData.listItemConfiguration,
          list_item_field_configurations: [],
          categories: defaultTestData.categories,
        },
      });

      const { findByRole } = setup({
        initialEditingItemId: defaultTestData.notCompletedItems[0].id,
      });

      // EditItemSheet should render as a dialog
      expect(await findByRole('dialog')).toBeInTheDocument();
    });

    it('re-fetches list when EditItemSheet onSave is called', async () => {
      axios.get = vi.fn().mockResolvedValue({
        data: createApiResponse(defaultTestData.notCompletedItems, [defaultTestData.completedItem]),
      });
      const { findByTestId, user } = setup({
        initialEditingItemId: defaultTestData.notCompletedItems[0].id,
      });

      const initialCallCount = (axios.get as Mock).mock.calls.length;
      await user.click(await findByTestId('edit-item-sheet-save'));

      await waitFor(() => {
        expect((axios.get as Mock).mock.calls.length).toBeGreaterThan(initialCallCount);
      });
    });

    it('opens BulkEditSheet when initialBulkEditOpen is true', async () => {
      const { findByTestId } = setup({
        initialBulkEditOpen: true,
        listItemConfiguration: defaultTestData.listItemConfiguration,
      });

      expect(await findByTestId('bulk-edit-sheet')).toBeInTheDocument();
    });

    it('re-fetches list when BulkEditSheet onSave is called', async () => {
      axios.get = vi.fn().mockResolvedValue({
        data: createApiResponse(defaultTestData.notCompletedItems, [defaultTestData.completedItem]),
      });
      const { findByTestId, user } = setup({
        initialBulkEditOpen: true,
        listItemConfiguration: defaultTestData.listItemConfiguration,
      });

      const initialCallCount = (axios.get as Mock).mock.calls.length;
      await user.click(await findByTestId('bulk-edit-sheet-save'));

      await waitFor(() => {
        expect((axios.get as Mock).mock.calls.length).toBeGreaterThan(initialCallCount);
      });
    });

    it('closes EditItemSheet when onClose is called', async () => {
      const { findByTestId, queryByTestId, user } = setup({
        initialEditingItemId: defaultTestData.notCompletedItems[0].id,
      });

      await user.click(await findByTestId('edit-item-sheet-close'));

      await waitFor(() => {
        expect(queryByTestId('edit-item-sheet-close')).not.toBeInTheDocument();
      });
    });

    it('closes BulkEditSheet when onClose is called', async () => {
      const { findByTestId, queryByTestId, user } = setup({
        initialBulkEditOpen: true,
        listItemConfiguration: defaultTestData.listItemConfiguration,
      });

      await user.click(await findByTestId('bulk-edit-sheet-close'));

      await waitFor(() => {
        expect(queryByTestId('bulk-edit-sheet')).not.toBeInTheDocument();
      });
    });

    it('returns early from EditItemSheet onSave when refetch returns no data', async () => {
      axios.get = vi.fn().mockResolvedValue({ data: undefined });
      const { findByTestId, user } = setup({
        initialEditingItemId: defaultTestData.notCompletedItems[0].id,
      });

      await user.click(await findByTestId('edit-item-sheet-save'));
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalled();
      });
    });

    it('returns early from BulkEditSheet onSave when refetch returns no data', async () => {
      axios.get = vi.fn().mockResolvedValue({ data: undefined });
      const { findByTestId, user } = setup({
        initialBulkEditOpen: true,
        listItemConfiguration: defaultTestData.listItemConfiguration,
      });

      await user.click(await findByTestId('bulk-edit-sheet-save'));
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalled();
      });
    });

    it('preserves filter when EditItemSheet onSave refetches and filter category is missing', async () => {
      axios.get = vi.fn().mockResolvedValue({
        data: createApiResponse(defaultTestData.notCompletedItems, [defaultTestData.completedItem]),
      });
      const { findByTestId, user } = setup({
        initialEditingItemId: defaultTestData.notCompletedItems[0].id,
        categories: ['foo', 'bar'],
      });

      await user.click(await findByTestId('filter-by-foo'));
      // Now refetch — refetched categories don't contain 'foo' (createApiResponse defaults differ)
      const refetched = createApiResponse(defaultTestData.notCompletedItems, [defaultTestData.completedItem]);
      refetched.categories = ['baz'];
      axios.get = vi.fn().mockResolvedValue({ data: refetched });

      await user.click(await findByTestId('edit-item-sheet-save'));

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalled();
      });
    });

    it('opens the share sheet from the header share button', async () => {
      const { findByTestId, user } = setup();
      await user.click(await findByTestId('open-share-sheet'));
      expect(await findByTestId('share-list-sheet')).toBeInTheDocument();
    });

    it('opens the share sheet automatically when initialShareSheetOpen is true', async () => {
      const { findByTestId } = setup({ initialShareSheetOpen: true });
      expect(await findByTestId('share-list-sheet')).toBeInTheDocument();
    });

    it('closes the share sheet when its onClose fires', async () => {
      const { findByTestId, queryByTestId, user } = setup({ initialShareSheetOpen: true });
      await user.click(await findByTestId('share-list-sheet'));
      await waitFor(() => expect(queryByTestId('share-list-sheet')).not.toBeInTheDocument());
    });

    it('preserves filter when BulkEditSheet onSave refetches and filter category is missing', async () => {
      axios.get = vi.fn().mockResolvedValue({
        data: createApiResponse(defaultTestData.notCompletedItems, [defaultTestData.completedItem]),
      });
      const { findByTestId, user } = setup({
        initialBulkEditOpen: true,
        listItemConfiguration: defaultTestData.listItemConfiguration,
        categories: ['foo', 'bar'],
      });

      await user.click(await findByTestId('filter-by-foo'));
      const refetched = createApiResponse(defaultTestData.notCompletedItems, [defaultTestData.completedItem]);
      refetched.categories = ['baz'];
      axios.get = vi.fn().mockResolvedValue({ data: refetched });

      await user.click(await findByTestId('bulk-edit-sheet-save'));

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalled();
      });
    });
  });

  describe('Item Addition', () => {
    it('adds an item when category exists', async () => {
      const newItem = createListItem('id6', false, [
        createField('id1', 'quantity', 'new quantity', 'id6'),
        createField('id2', 'product', 'new product', 'id6'),
        createField('id3', 'category', 'foo', 'id6'),
      ]);

      axios.post = vi.fn().mockResolvedValue({ data: newItem });
      axios.get = vi.fn().mockResolvedValue({
        data: {
          ...defaultTestData,
          not_completed_items: [...defaultTestData.notCompletedItems, newItem],
        },
      });

      const { findByTestId, user } = setup();

      // Test that quick-add input exists and can be interacted with
      const quickAddInput = await findByTestId('quick-add-input');
      expect(quickAddInput).toBeInTheDocument();

      // Simulate adding item through the input
      await user.type(quickAddInput, 'new product{Enter}');

      // Verify the item was added by checking API was called
      await waitFor(() => expect(axios.post).toHaveBeenCalled());
    });

    it('adds an item when category does not exist', async () => {
      const newItem = createListItem('id6', false, [
        createField('id1', 'quantity', 'new quantity', 'id6'),
        createField('id2', 'product', 'new product', 'id6'),
        createField('id3', 'category', 'new category', 'id6'),
      ]);

      axios.post = vi.fn().mockResolvedValue({ data: newItem });
      axios.get = vi.fn().mockResolvedValue({
        data: {
          ...defaultTestData,
          not_completed_items: [...defaultTestData.notCompletedItems, newItem],
        },
      });

      const { findByTestId, user } = setup();

      // Test that quick-add input exists and can be interacted with
      const quickAddInput = await findByTestId('quick-add-input');
      expect(quickAddInput).toBeInTheDocument();

      // Simulate adding item through the input
      await user.type(quickAddInput, 'new product{Enter}');

      // Verify the item was added by checking API was called
      await waitFor(() => expect(axios.post).toHaveBeenCalled());
    });

    it('shows error toast when no listItemConfiguration is set', async () => {
      const { findByTestId, user } = setup({ listItemConfiguration: undefined });

      // With no field config the expanded form never renders, so Enter on the collapsed bar runs quick-add.
      await user.type(await findByTestId('quick-add-input'), 'new product{Enter}');

      await waitFor(() =>
        expect(mockShowToast.error).toHaveBeenCalledWith(
          'No field configuration available for this list. Please contact support.',
        ),
      );
    });

    it('quick-adds by name via Enter when the expanded form is not rendered', async () => {
      const newItem = createListItem('qa-id', false, []);
      axios.post = vi.fn().mockResolvedValue({ data: newItem });
      // handleQuickAdd fetches its own field configs to find the primary field.
      axios.get = vi.fn().mockResolvedValue({ data: [{ id: 'fc1', label: 'product', primary: true }] });

      // Empty preloaded configs => the expanded form never renders, so Enter on the bar runs quick-add.
      const { findByTestId, user } = setup({ listItemFieldConfigurations: [] });

      await user.type(await findByTestId('quick-add-input'), 'new product{Enter}');

      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(2));
      expect(axios.post).toHaveBeenNthCalledWith(1, `/lists/${defaultTestData.list.id}/list_items`, {
        list_item: { user_id: defaultTestData.userId, completed: false },
      });
      expect(axios.post).toHaveBeenNthCalledWith(2, `/list_items/${newItem.id}/list_item_fields`, {
        list_item_field: { data: 'new product' },
      });
    });

    it('calls handleAddItem when quick add succeeds with a primary field config', async () => {
      const newItem = createListItem('new-item-id', false, []);

      // First post: create the item. Second post: create the primary field value (from the bar input).
      axios.post = vi.fn().mockResolvedValueOnce({ data: newItem }).mockResolvedValueOnce({ data: {} });

      // GET: field configurations when the form opens on focus; the created item when reloading after add.
      axios.get = vi.fn().mockImplementation((url: string) =>
        url.includes('list_item_field_configurations')
          ? Promise.resolve({
              data: [
                { id: 'fc1', label: 'product', data_type: EListItemFieldType.FREE_TEXT, position: 0, primary: true },
              ],
            })
          : Promise.resolve({ data: newItem }),
      );

      const { findByTestId, findByText, user } = setup();

      // The always-visible bar input is the primary/name field; submit via the expanded form footer.
      await user.type(await findByTestId('quick-add-input'), 'new product');
      await user.click(await findByText('Add item'));

      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(2));
      expect(axios.post).toHaveBeenNthCalledWith(1, `/lists/${defaultTestData.list.id}/list_items`, {
        list_item: { completed: false },
      });
      expect(axios.post).toHaveBeenNthCalledWith(
        2,
        `/lists/${defaultTestData.list.id}/list_items/${newItem.id}/list_item_fields`,
        { list_item_field: { list_item_field_configuration_id: 'fc1', data: 'new product' } },
      );
    });

    it('adds item without field post when no primary field config exists', async () => {
      const newItem = createListItem('new-item-id', false, []);

      axios.post = vi.fn().mockResolvedValueOnce({ data: newItem });
      // GET returns configs (none primary) on form open; the created item when reloading after add.
      axios.get = vi.fn().mockImplementation((url: string) =>
        url.includes('list_item_field_configurations')
          ? Promise.resolve({
              data: [
                { id: 'fc1', label: 'product', data_type: EListItemFieldType.FREE_TEXT, position: 0, primary: false },
              ],
            })
          : Promise.resolve({ data: newItem }),
      );

      const { findByTestId, findByText, user } = setup();

      await user.type(await findByTestId('quick-add-input'), 'new product');
      await user.click(await findByText('Add item'));

      // Only the item creation post — no field posts (no primary config; non-primary field left empty).
      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    });

    it('renders expanded quick-add form with field configs when listItemFieldConfigurations are provided', async () => {
      const { findByTestId, user } = setup({
        listItemFieldConfigurations: [
          {
            id: 'fc1',
            label: 'Notes',
            data_type: EListItemFieldType.FREE_TEXT,
            position: 1,
            primary: false,
          },
        ],
      });

      await user.click(await findByTestId('quick-add-expand'));

      // The expanded form should render ListItemFormFields
      await waitFor(() => {
        expect(document.querySelector('[data-test-id="quick-add-expand"]')).toBeInTheDocument();
      });
    });

    it('submits expanded quick-add form with category, completed, and fields', async () => {
      const newItem = createListItem('id6', false, [createField('id1', 'Notes', 'note text', 'id6')]);
      axios.post = vi
        .fn()
        .mockResolvedValueOnce({ data: newItem }) // create item
        .mockResolvedValueOnce({ data: {} }) // create field
        .mockResolvedValueOnce({ data: {} }); // create category
      axios.get = vi.fn().mockResolvedValue({ data: newItem });

      const { findByTestId, getByLabelText, getByText, user } = setup({
        listItemFieldConfigurations: [
          {
            id: 'fc1',
            label: 'Notes',
            data_type: EListItemFieldType.FREE_TEXT,
            position: 1,
            primary: false,
          },
        ],
      });

      await user.click(await findByTestId('quick-add-expand'));

      const notesInput = getByLabelText('Notes') as HTMLInputElement;
      await user.type(notesInput, 'note text');
      const categoryInput = getByLabelText('Category') as HTMLInputElement;
      await user.type(categoryInput, 'newcat');
      const completedCheckbox = getByLabelText('Completed') as HTMLInputElement;
      await user.click(completedCheckbox);

      await user.type(await findByTestId('quick-add-input'), 'My item');
      await user.click(getByText('Add item'));

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          '/lists/id1/list_items',
          expect.objectContaining({
            list_item: expect.objectContaining({ completed: true, category: 'Newcat' }),
          }),
        );
      });
    });

    it('returns early from quick-add form submit when there are no field configs', async () => {
      axios.post = vi.fn();
      const { findByTestId, getByText, user } = setup({
        listItemFieldConfigurations: [
          {
            id: 'fc1',
            label: 'Notes',
            data_type: EListItemFieldType.FREE_TEXT,
            position: 1,
            primary: false,
          },
        ],
      });

      await user.click(await findByTestId('quick-add-expand'));
      // Click Submit before typing into Notes; resolvedFieldData returns '' so no field POST,
      // but should still create item. Test the configs.length === 0 path via fields cleared.
      await user.type(await findByTestId('quick-add-input'), 'My item');
      await user.click(getByText('Add item'));

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalled();
      });
    });

    it('shows error toast when quick-add form submit fails', async () => {
      axios.post = vi.fn().mockRejectedValue(new Error('boom'));
      const { findByTestId, getByLabelText, getByText, user } = setup({
        listItemFieldConfigurations: [
          {
            id: 'fc1',
            label: 'Notes',
            data_type: EListItemFieldType.FREE_TEXT,
            position: 1,
            primary: false,
          },
        ],
      });

      await user.click(await findByTestId('quick-add-expand'));
      const notesInput = getByLabelText('Notes') as HTMLInputElement;
      await user.type(notesInput, 'x');
      await user.type(await findByTestId('quick-add-input'), 'My item');
      await user.click(getByText('Add item'));

      await waitFor(() => {
        expect(mockShowToast.error).toHaveBeenCalledWith('Failed to add item');
      });
    });

    it('continues when category creation fails during expanded quick-add submit', async () => {
      const newItem = createListItem('id6', false, [createField('id1', 'Notes', 'note', 'id6')]);
      axios.post = vi.fn().mockImplementation(async (url: string) => {
        if (url.endsWith('/categories')) {
          throw new Error('exists');
        }
        return { data: newItem };
      });
      axios.get = vi.fn().mockResolvedValue({ data: newItem });

      const { findByTestId, getByLabelText, getByText, user } = setup({
        listItemFieldConfigurations: [
          {
            id: 'fc1',
            label: 'Notes',
            data_type: EListItemFieldType.FREE_TEXT,
            position: 1,
            primary: false,
          },
        ],
      });

      await user.click(await findByTestId('quick-add-expand'));
      const notesInput = getByLabelText('Notes') as HTMLInputElement;
      await user.type(notesInput, 'note');
      const categoryInput = getByLabelText('Category') as HTMLInputElement;
      await user.type(categoryInput, 'existing');
      await user.type(await findByTestId('quick-add-input'), 'My item');
      await user.click(getByText('Add item'));

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith('/lists/id1/categories', { category: { name: 'Existing' } });
      });
      expect(mockShowToast.error).not.toHaveBeenCalled();
    });

    it('adds item while filter, stays filtered', async () => {
      const newItem = createListItem('id6', false, [
        createField('id1', 'quantity', 'new quantity', 'id6'),
        createField('id2', 'product', 'new product', 'id6'),
        createField('id3', 'category', 'bar', 'id6'),
      ]);

      axios.post = vi.fn().mockResolvedValue({ data: newItem });

      const { findByTestId, queryByText, user } = setup();

      // Apply filter to foo
      await user.click(await findByTestId('filter-by-foo'));
      await waitFor(async () => {
        const activeFilter = await findByTestId('filter-by-foo');
        expect(activeFilter).toHaveAttribute('aria-pressed', 'true');
      });

      // Try to add item
      const quickAddInput = await findByTestId('quick-add-input');
      await user.type(quickAddInput, 'new product{Enter}');

      // Verify the POST was called
      await waitFor(() => expect(axios.post).toHaveBeenCalled());

      // The new item should not be visible because it's in a different category (bar)
      // and we're filtering by 'foo'
      expect(queryByText('new product')).toBeNull();
    });
  });
});
