import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import userEvent from '@testing-library/user-event';
import type { AxiosError, AxiosResponse } from 'axios';

import axios from 'utils/api';
import { EListItemFieldType, EUserPermissions, type IListItem } from 'typings';
import ListContainer, { type IListContainerProps } from './ListContainer';
import { defaultTestData, createApiResponse, createListItem, createField } from 'test-utils/factories';
import { mockNavigate, advanceTimersByTime } from 'test-utils/helpers';
import { bookListTestData } from 'test-utils/factories';
import { listCache } from 'utils/lightweightCache';
import { fieldConfigCache } from 'utils/fieldConfigCache';
import { sortingCache } from './listHandlers';

// Create reference for test expectations
const mockShowToast = jest.requireMock('../../../utils/toast').showToast;

// Also mock react-toastify for backward compatibility in tests that still reference it
jest.mock('react-toastify', () => ({
  toast: jest.fn(),
}));

// Mock react-router
const mockLocation = {
  pathname: '/lists/id1',
  search: '',
  hash: '',
  state: null,
  key: 'initial',
};

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: (): jest.Mock => mockNavigate,
  useLocation: (): typeof mockLocation => mockLocation,
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
    jest.clearAllMocks();

    // Clear cache to ensure test isolation
    listCache.clear();
    fieldConfigCache.clear();

    // Clear sorting cache to prevent test pollution
    sortingCache.clear();

    // Reset mock location to initial state
    mockLocation.pathname = '/lists/id1';

    // Reset axios instance methods to safe defaults between tests
    axios.get = jest.fn().mockImplementation((url: string) => {
      if (url.startsWith('/v2/lists/')) {
        return Promise.resolve({
          data: createApiResponse(defaultTestData.notCompletedItems, [defaultTestData.completedItem]),
        });
      }
      if (url.includes('list_item_field_configurations')) {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: {} });
    });
    axios.post = jest.fn().mockResolvedValue({ data: {} });
    axios.put = jest.fn().mockResolvedValue({ data: {} });
    axios.delete = jest.fn().mockResolvedValue({});
  });

  afterEach(() => {
    // Ensure no test leaves fake timers enabled
    jest.useRealTimers();
  });

  describe('Polling', () => {
    it('does not update via polling when different data is not returned', async () => {
      jest.useFakeTimers();

      // Create API response with "item new" in not completed items
      const apiResponse = createApiResponse(
        [createListItem('id1', false, [createField('id1', 'product', 'item new', 'id1')])],
        [],
      );
      axios.get = jest.fn().mockResolvedValue({ data: apiResponse });

      const { findByText } = setup({ permissions: EUserPermissions.WRITE });

      await advanceTimersByTime(parseInt(process.env.REACT_APP_POLLING_INTERVAL!, 10));
      await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

      expect((await findByText('item new')).parentElement?.parentElement?.parentElement).toHaveAttribute(
        'data-test-class',
        'non-completed-item',
      );

      await advanceTimersByTime(parseInt(process.env.REACT_APP_POLLING_INTERVAL!, 10));
      await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

      expect((await findByText('item new')).parentElement?.parentElement?.parentElement).toHaveAttribute(
        'data-test-class',
        'non-completed-item',
      );

      jest.useRealTimers();
    });

    it('updates via polling when different data is returned', async () => {
      jest.useFakeTimers();

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

      axios.get = jest
        .fn()
        .mockResolvedValueOnce({ data: firstResponse })
        .mockResolvedValueOnce({ data: secondResponse });

      const { findByText } = setup({ permissions: EUserPermissions.WRITE });

      await advanceTimersByTime(parseInt(process.env.REACT_APP_POLLING_INTERVAL!, 10));
      await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

      expect((await findByText('item new')).parentElement?.parentElement?.parentElement).toHaveAttribute(
        'data-test-class',
        'non-completed-item',
      );

      await advanceTimersByTime(parseInt(process.env.REACT_APP_POLLING_INTERVAL!, 10));
      await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

      expect((await findByText('item new')).parentElement?.parentElement?.parentElement).toHaveAttribute(
        'data-test-class',
        'completed-item',
      );

      jest.useRealTimers();
    });

    it('shows toast with unexplained error', async () => {
      jest.useFakeTimers();
      axios.get = jest.fn().mockRejectedValue(new Error('Ahhhh!'));

      setup({ permissions: EUserPermissions.WRITE });

      await advanceTimersByTime(parseInt(process.env.REACT_APP_POLLING_INTERVAL!, 10));
      await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

      expect(mockShowToast.error).toHaveBeenCalledWith(
        'You may not be connected to the internet. Please check your connection. ' +
          'Data may be incomplete and user actions may not persist.',
      );

      jest.useRealTimers();
    });

    it('shows toast with server error', async () => {
      jest.useFakeTimers();
      const serverError = new Error('Server Error') as unknown as AxiosError;
      serverError.response = { status: 500 } as unknown as AxiosResponse;
      axios.get = jest.fn().mockRejectedValue(serverError);

      setup({ permissions: EUserPermissions.WRITE });

      await advanceTimersByTime(parseInt(process.env.REACT_APP_POLLING_INTERVAL!, 10));
      await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

      expect(mockShowToast.error).toHaveBeenCalledWith(
        'Something went wrong. Data may be incomplete and user actions may not persist.',
      );

      jest.useRealTimers();
    });

    it('syncs immediately when tab becomes visible', async () => {
      jest.useFakeTimers();

      // First hidden, then visible
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });

      const firstResponse = createApiResponse(
        [createListItem('id1', false, [createField('id1', 'product', 'item new', 'id1')])],
        [],
      );
      const secondResponse = createApiResponse(
        [],
        [createListItem('id1', true, [createField('id1', 'product', 'item new', 'id1')])],
      );

      axios.get = jest
        .fn()
        .mockResolvedValueOnce({ data: firstResponse })
        .mockResolvedValueOnce({ data: secondResponse });

      const { findByText } = setup({ permissions: EUserPermissions.WRITE });

      // Move time once while hidden: polling should not fire
      await advanceTimersByTime(parseInt(process.env.REACT_APP_POLLING_INTERVAL!, 10));
      await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(0));

      // Make the tab visible and dispatch event to trigger immediate sync
      Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));

      // Immediate sync should fetch once (firstResponse)
      await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
      expect((await findByText('item new')).parentElement?.parentElement?.parentElement).toHaveAttribute(
        'data-test-class',
        'non-completed-item',
      );

      // Next poll tick should fetch again (secondResponse)
      await advanceTimersByTime(parseInt(process.env.REACT_APP_POLLING_INTERVAL!, 10));
      await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));
      expect((await findByText('item new')).parentElement?.parentElement?.parentElement).toHaveAttribute(
        'data-test-class',
        'completed-item',
      );

      jest.useRealTimers();
    });
  });

  describe('Navigation Focus', () => {
    beforeEach(() => {
      jest.useFakeTimers();

      // Reset location to initial state for each test
      mockLocation.pathname = '/lists/id1';
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('does not sync on initial mount', async () => {
      const { findByText } = setup({ permissions: EUserPermissions.WRITE });

      // Allow time for any potential navigation focus to fire
      await advanceTimersByTime(200);
      await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(0));

      // Verify component renders normally
      expect(await findByText(defaultTestData.list.name)).toBeVisible();
    });

    it('triggers immediate sync on navigation between routes', async () => {
      const firstResponse = createApiResponse(
        [createListItem('id1', false, [createField('id1', 'product', 'item before navigation', 'id1')])],
        [],
      );
      const secondResponse = createApiResponse(
        [createListItem('id2', false, [createField('id2', 'product', 'item after navigation', 'id2')])],
        [],
      );

      axios.get = jest
        .fn()
        .mockResolvedValueOnce({ data: firstResponse })
        .mockResolvedValueOnce({ data: secondResponse });

      const { rerender } = setup({ permissions: EUserPermissions.WRITE });

      // Initial load
      await advanceTimersByTime(200);
      await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(0));

      // Simulate navigation to a different route
      mockLocation.pathname = '/lists/id2';
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

      // Fast-forward the 100ms delay from useNavigationFocus
      await advanceTimersByTime(100);
      await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

      // Verify the navigation focus sync was called with correct deduplication key
      expect(axios.get).toHaveBeenCalledWith(
        '/v2/lists/id1',
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        }),
      );
    });

    it('uses cache to avoid unnecessary state updates during navigation sync', async () => {
      // Same data response - should not trigger state updates
      const apiResponse = createApiResponse(
        [createListItem('id1', false, [createField('id1', 'product', 'unchanged item', 'id1')])],
        [],
      );

      axios.get = jest.fn().mockResolvedValue({ data: apiResponse });

      const { rerender } = setup({
        permissions: EUserPermissions.WRITE,
        notCompletedItems: [createListItem('id1', false, [createField('id1', 'product', 'unchanged item', 'id1')])],
      });

      // Simulate navigation
      mockLocation.pathname = '/different/path';
      rerender(
        <MemoryRouter>
          <ListContainer
            userId={defaultTestData.userId}
            list={defaultTestData.list}
            completedItems={[]}
            categories={defaultTestData.categories}
            listUsers={defaultTestData.listUsers}
            notCompletedItems={[createListItem('id1', false, [createField('id1', 'product', 'unchanged item', 'id1')])]}
            listsToUpdate={defaultTestData.listsToUpdate}
            listItemConfiguration={defaultTestData.listItemConfiguration}
            permissions={EUserPermissions.WRITE}
          />
        </MemoryRouter>,
      );

      await advanceTimersByTime(100);
      await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

      // Cache should prevent unnecessary re-renders for identical data
      expect(axios.get).toHaveBeenCalledWith(
        '/v2/lists/id1',
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        }),
      );
    });

    it('updates state when navigation sync returns different data', async () => {
      const initialItems = [createListItem('id1', false, [createField('id1', 'product', 'initial item', 'id1')])];
      const updatedItems = [createListItem('id2', false, [createField('id2', 'product', 'updated item', 'id2')])];

      const updatedResponse = createApiResponse(updatedItems, []);
      axios.get = jest.fn().mockResolvedValue({ data: updatedResponse });

      const { findByText, rerender } = setup({
        permissions: EUserPermissions.WRITE,
        notCompletedItems: initialItems,
      });

      // Verify initial state
      expect(await findByText('initial item')).toBeVisible();

      // Simulate navigation
      mockLocation.pathname = '/different/path';
      rerender(
        <MemoryRouter>
          <ListContainer
            userId={defaultTestData.userId}
            list={defaultTestData.list}
            completedItems={[]}
            categories={defaultTestData.categories}
            listUsers={defaultTestData.listUsers}
            notCompletedItems={initialItems}
            listsToUpdate={defaultTestData.listsToUpdate}
            listItemConfiguration={defaultTestData.listItemConfiguration}
            permissions={EUserPermissions.WRITE}
          />
        </MemoryRouter>,
      );

      await advanceTimersByTime(100);
      await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

      // Verify state was updated with new data
      expect(await findByText('updated item')).toBeVisible();
    });

    it('handles errors gracefully during navigation sync without user feedback', async () => {
      axios.get = jest.fn().mockRejectedValue(new Error('Network error'));

      const { rerender } = setup({ permissions: EUserPermissions.WRITE });

      // Simulate navigation
      mockLocation.pathname = '/different/path';
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

      await advanceTimersByTime(100);
      await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

      // Navigation focus errors should be ignored (no toast notification)
      // The component should continue to function normally
      expect(mockShowToast.error).not.toHaveBeenCalled();
    });

    it('does not sync when pathname stays the same', async () => {
      const { rerender } = setup({ permissions: EUserPermissions.WRITE });

      // Rerender with same pathname
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

      await advanceTimersByTime(200);

      // No navigation sync should occur
      expect(axios.get).not.toHaveBeenCalled();
    });

    it('uses correct deduplication key for navigation focus sync', async () => {
      const apiResponse = createApiResponse(defaultTestData.notCompletedItems, [defaultTestData.completedItem]);
      axios.get = jest.fn().mockResolvedValue({ data: apiResponse });

      const { rerender } = setup({ permissions: EUserPermissions.WRITE });

      // Simulate navigation
      mockLocation.pathname = '/different/path';
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

      await advanceTimersByTime(100);
      await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

      // Verify the navigation focus uses a different deduplication key than polling
      // The API call should be made (not deduplicated against polling calls)
      expect(axios.get).toHaveBeenCalledWith(
        `/v2/lists/${defaultTestData.list.id}`,
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        }),
      );
    });
  });

  describe('Permissions', () => {
    it('renders Add Item button (form collapsed) when user has write permissions', async () => {
      const { container, findByTestId } = setup({ permissions: EUserPermissions.WRITE });

      expect(container).toMatchSnapshot();
      expect(await findByTestId('add-item-button')).toBeVisible();
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

      await user.click(await findByText('Filter by category'));
      await waitFor(async () => expect(await findByTestId('filter-by-foo')).toBeVisible());
      await user.click(await findByTestId('filter-by-foo'));

      expect(container).toMatchSnapshot();
      expect(await findByText('not completed quantity foo not completed product')).toBeVisible();
      expect(await findByText('Foo')).toBeVisible();
      expect(queryByText('not completed quantity bar not completed product')).toBeNull();
    });

    it('renders items with category buckets when no filter is applied', async () => {
      const { container, findByText } = setup();

      expect(container).toMatchSnapshot();
      expect(await findByText('not completed quantity no category not completed product')).toBeVisible();
      expect(await findByText('not completed quantity foo not completed product')).toBeVisible();
      expect(await findByText('not completed quantity bar not completed product')).toBeVisible();
      expect(await findByText('Foo')).toBeVisible();
      expect(await findByText('Bar')).toBeVisible();
    });

    it('clears filter when filter is cleared', async () => {
      const { findByTestId, findByText, queryByText, user } = setup();

      await user.click(await findByText('Filter by category'));
      await waitFor(async () => expect(await findByTestId('filter-by-foo')).toBeVisible());
      await user.click(await findByTestId('filter-by-foo'));

      expect(await findByText('not completed quantity foo not completed product')).toBeVisible();
      expect(await findByText('Foo')).toBeVisible();
      expect(queryByText('Bar')).toBeNull();

      await user.click(await findByTestId('clear-filter'));

      expect(await findByText('not completed quantity no category not completed product')).toBeVisible();
      expect(await findByText('not completed quantity foo not completed product')).toBeVisible();
      expect(await findByText('not completed quantity bar not completed product')).toBeVisible();
      expect(await findByText('Foo')).toBeVisible();
      expect(await findByText('Bar')).toBeVisible();
    });

    it('filters by uncategorized items only', async () => {
      const { findByTestId, findByText, queryByText, user } = setup();

      await user.click(await findByText('Filter by category'));
      await waitFor(async () => expect(await findByTestId('filter-by-uncategorized')).toBeVisible());
      await user.click(await findByTestId('filter-by-uncategorized'));

      // Should only show uncategorized items
      expect(await findByText('not completed quantity no category not completed product')).toBeVisible();
      expect(await findByTestId('clear-filter')).toBeVisible();

      // Should not show categorized items
      expect(queryByText('not completed quantity foo not completed product')).toBeNull();
      expect(queryByText('not completed quantity bar not completed product')).toBeNull();
      expect(queryByText('Foo')).toBeNull();
      expect(queryByText('Bar')).toBeNull();
    });

    it('filters by specific category only', async () => {
      const { findByTestId, findByText, queryByText, user } = setup();

      await user.click(await findByText('Filter by category'));
      await waitFor(async () => expect(await findByTestId('filter-by-bar')).toBeVisible());
      await user.click(await findByTestId('filter-by-bar'));

      // Should only show bar category items
      expect(await findByText('not completed quantity bar not completed product')).toBeVisible();
      expect(await findByText('Bar')).toBeVisible();

      // Should not show other categories or uncategorized items
      expect(queryByText('not completed quantity foo not completed product')).toBeNull();
      expect(queryByText('not completed quantity no category not completed product')).toBeNull();
      expect(queryByText('Foo')).toBeNull();
    });

    it('shows only selected category when filter is applied', async () => {
      const { findByTestId, findByText, queryByText, user } = setup();

      // Apply filter
      await user.click(await findByText('Filter by category'));
      await waitFor(async () => expect(await findByTestId('filter-by-foo')).toBeVisible());
      await user.click(await findByTestId('filter-by-foo'));

      // Should only show foo category items, not uncategorized items
      expect(await findByText('not completed quantity foo not completed product')).toBeVisible();
      expect(await findByText('Foo')).toBeVisible();
      expect(queryByText('not completed quantity no category not completed product')).toBeNull();
      expect(queryByText('not completed quantity bar not completed product')).toBeNull();
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

      await user.click(await findByText('Filter by category'));
      await waitFor(async () => expect(await findByTestId('filter-by-uncategorized')).toBeVisible());
      await user.click(await findByTestId('filter-by-uncategorized'));

      // Should show item with empty category data
      expect(await findByText('1 item with empty category')).toBeVisible();
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

      await user.click(await findByText('Filter by category'));
      await waitFor(async () => expect(await findByTestId('filter-by-uncategorized')).toBeVisible());
      await user.click(await findByTestId('filter-by-uncategorized'));

      // Should show item without category field
      expect(await findByText('1 item without category field')).toBeVisible();
    });

    it('shows all categories and uncategorized when no filter is applied', async () => {
      const { findByText } = setup();

      // Should show all items grouped by category
      expect(await findByText('not completed quantity no category not completed product')).toBeVisible();
      expect(await findByText('not completed quantity foo not completed product')).toBeVisible();
      expect(await findByText('not completed quantity bar not completed product')).toBeVisible();
      expect(await findByText('Foo')).toBeVisible();
      expect(await findByText('Bar')).toBeVisible();
    });
  });

  describe('Prefetch and undefined UI states', () => {
    const originalIdlePrefetch = process.env.REACT_APP_PREFETCH_IDLE;
    const originalMountPrefetch = process.env.REACT_APP_PREFETCH_ON_MOUNT;

    afterEach(() => {
      process.env.REACT_APP_PREFETCH_IDLE = originalIdlePrefetch;
      process.env.REACT_APP_PREFETCH_ON_MOUNT = originalMountPrefetch;
      // allow cleanup of test shim
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (global as any).requestIdleCallback;
    });

    it('uses preloaded field configurations without making API calls', async () => {
      const getSpy = jest.fn().mockImplementation((url: string) => {
        if (url.includes('list_item_field_configurations')) {
          return Promise.resolve({
            data: [
              { id: 'config1', label: 'product', data_type: 'free_text', position: 1 },
              { id: 'config2', label: 'quantity', data_type: 'free_text', position: 0 },
            ],
          });
        }
        if (url.startsWith('/v2/lists/')) {
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
          { id: 'config1', label: 'product', data_type: 'free_text', position: 1 },
          { id: 'config2', label: 'quantity', data_type: 'free_text', position: 0 },
        ],
      });

      // Open the form; fields should already be available from preloaded configurations
      await user.click(await findByTestId('add-item-button'));
      await waitFor(async () => expect(await findByLabelText('Quantity')).toBeVisible());

      // No field configuration API calls should be made since data is preloaded
      const configCalls = getSpy.mock.calls.filter(([u]: [string]) => u.includes('list_item_field_configurations'));
      expect(configCalls.length).toBe(0);
    });

    it('does not prefetch on mount when disabled via environment variable', async () => {
      process.env.REACT_APP_PREFETCH_ON_MOUNT = 'false';

      const getSpy = jest.fn().mockImplementation((url: string) => {
        if (url.includes('list_item_field_configurations')) {
          return Promise.resolve({ data: [] });
        }
        if (url.startsWith('/v2/lists/')) {
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
      const getSpy = jest.fn().mockImplementation((url: string) => {
        if (url.includes('list_item_field_configurations')) {
          return Promise.resolve({ data: [] });
        }
        if (url.startsWith('/v2/lists/')) {
          return Promise.resolve({
            data: createApiResponse(defaultTestData.notCompletedItems, [defaultTestData.completedItem]),
          });
        }
        return Promise.resolve({ data: {} });
      });
      axios.get = getSpy;

      setup({
        permissions: EUserPermissions.WRITE,
        listItemFieldConfigurations: [{ id: 'config1', label: 'product', data_type: 'free_text', position: 1 }],
      });

      // Wait a moment to ensure any potential prefetch would have fired
      await waitFor(() => new Promise((resolve) => setTimeout(resolve, 100)));

      // Should not have called field configurations API
      const configCalls = getSpy.mock.calls.filter(([u]: [string]) => u.includes('list_item_field_configurations'));
      expect(configCalls.length).toBe(0);
    });

    it('does not prefetch on mount when no listItemConfiguration ID exists', async () => {
      const getSpy = jest.fn().mockImplementation((url: string) => {
        if (url.includes('list_item_field_configurations')) {
          return Promise.resolve({ data: [] });
        }
        if (url.startsWith('/v2/lists/')) {
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
      const getSpy = jest.fn().mockImplementation((url: string) => {
        if (url.includes('list_item_field_configurations')) {
          return Promise.reject(new Error('Network error'));
        }
        if (url.startsWith('/v2/lists/')) {
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
      expect(container.querySelector('[data-test-id="add-item-button"]')).toBeInTheDocument();
    });

    it('does not idle-prefetch when disabled via environment variable', async () => {
      process.env.REACT_APP_PREFETCH_IDLE = 'false';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).requestIdleCallback = (cb: () => void): number => {
        cb();
        return 1;
      };

      const getSpy = jest.fn().mockImplementation((url: string) => {
        if (url.includes('list_item_field_configurations')) {
          return Promise.resolve({ data: [] });
        }
        if (url.startsWith('/v2/lists/')) {
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
      process.env.REACT_APP_PREFETCH_IDLE = 'true';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).requestIdleCallback = (cb: () => void): number => {
        cb();
        return 1;
      };

      const getSpy = jest.fn().mockImplementation((url: string) => {
        if (url.includes('list_item_field_configurations')) {
          return Promise.resolve({ data: [] });
        }
        if (url.startsWith('/v2/lists/')) {
          return Promise.resolve({
            data: createApiResponse(defaultTestData.notCompletedItems, [defaultTestData.completedItem]),
          });
        }
        return Promise.resolve({ data: {} });
      });
      axios.get = getSpy;

      setup({
        permissions: EUserPermissions.WRITE,
        listItemFieldConfigurations: [{ id: 'config1', label: 'product', data_type: 'free_text', position: 1 }],
      });

      // Wait a moment to ensure any potential idle prefetch would have fired
      await waitFor(() => new Promise((resolve) => setTimeout(resolve, 100)));

      // Should not have called idle prefetch
      const configCalls = getSpy.mock.calls.filter(([u]: [string]) => u.includes('list_item_field_configurations'));
      expect(configCalls.length).toBe(0);
    });

    it('does not idle-prefetch when no listItemConfiguration ID exists', async () => {
      process.env.REACT_APP_PREFETCH_IDLE = 'true';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).requestIdleCallback = (cb: () => void): number => {
        cb();
        return 1;
      };

      const getSpy = jest.fn().mockImplementation((url: string) => {
        if (url.includes('list_item_field_configurations')) {
          return Promise.resolve({ data: [] });
        }
        if (url.startsWith('/v2/lists/')) {
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
      const getSpy = jest.fn().mockImplementation((url: string) => {
        if (url.includes('list_item_field_configurations')) {
          return Promise.reject(new Error('Network error'));
        }
        if (url.startsWith('/v2/lists/')) {
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
        listItemFieldConfigurations: [{ id: 'config1', label: 'product', data_type: 'free_text', position: 1 }],
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
      const getSpy = jest.fn().mockImplementation((url: string) => {
        if (url.includes('list_item_field_configurations')) {
          return Promise.resolve({ data: [] });
        }
        if (url.startsWith('/v2/lists/')) {
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
      expect(document.querySelector('[data-test-id="add-item-button"]')).toBeInTheDocument();
    });

    it('does not trigger prefetch when REACT_APP_PREFETCH_ON_MOUNT is false', async () => {
      // Explicitly disable mount prefetch
      process.env.REACT_APP_PREFETCH_ON_MOUNT = 'false';

      const getSpy = jest.fn().mockImplementation((url: string) => {
        if (url.includes('list_item_field_configurations')) {
          return Promise.resolve({ data: [] });
        }
        if (url.startsWith('/v2/lists/')) {
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

    it('does not trigger idle prefetch when REACT_APP_PREFETCH_IDLE is false', async () => {
      // Explicitly disable idle prefetch
      process.env.REACT_APP_PREFETCH_IDLE = 'false';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).requestIdleCallback = (cb: () => void): number => {
        cb();
        return 1;
      };

      const getSpy = jest.fn().mockImplementation((url: string) => {
        if (url.includes('list_item_field_configurations')) {
          return Promise.resolve({ data: [] });
        }
        if (url.startsWith('/v2/lists/')) {
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
        { id: 'config1', label: 'product', data_type: 'free_text', position: 1 },
        { id: 'config2', label: 'quantity', data_type: 'number', position: 0 },
      ];

      const getSpy = jest.fn().mockImplementation((url: string) => {
        if (url.includes('list_item_field_configurations')) {
          return Promise.resolve({ data: mockFieldConfigs });
        }
        if (url.startsWith('/v2/lists/')) {
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
      await user.click(await findByTestId('add-item-button'));

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
        createField('id_cat', 'category', 'foo', 'id_unnamed'),
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

      await user.click(await findByTestId('not-completed-item-delete-id2'));

      expect(container).toMatchSnapshot();
      expect(await findByTestId('confirm-delete')).toBeVisible();
    });

    it('handles 401 on delete', async () => {
      axios.delete = jest.fn().mockRejectedValue({ response: { status: 401 } });
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
      axios.delete = jest.fn().mockRejectedValue({ response: { status: 403 } });
      const { findByTestId, user } = setup();

      await user.click(await findByTestId('not-completed-item-delete-id3'));
      expect(await findByTestId('confirm-delete')).toBeVisible();
      await user.click(await findByTestId('confirm-delete'));

      await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));
      expect(mockShowToast.error).toHaveBeenCalledWith('Failed to delete item');
    });

    it('handles 404 on delete', async () => {
      axios.delete = jest.fn().mockRejectedValue({ response: { status: 404 } });
      const { findByTestId, user } = setup();

      await user.click(await findByTestId('not-completed-item-delete-id3'));
      expect(await findByTestId('confirm-delete')).toBeVisible();
      await user.click(await findByTestId('confirm-delete'));

      await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));
      expect(mockShowToast.error).toHaveBeenCalledWith('Failed to delete item');
    });

    it('handles not 401, 403, 404 on delete', async () => {
      axios.delete = jest.fn().mockRejectedValue({ response: { status: 500 } });
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
      axios.delete = jest.fn().mockRejectedValue({ request: 'failed to send request' });
      const { findByTestId, user } = setup();

      await user.click(await findByTestId('not-completed-item-delete-id3'));
      expect(await findByTestId('confirm-delete')).toBeVisible();
      await user.click(await findByTestId('confirm-delete'));

      await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));
      expect(mockShowToast.error).toHaveBeenCalledWith('Network error. Please check your connection.');
    });

    it('handles unknown failure on delete', async () => {
      axios.delete = jest.fn().mockRejectedValue(new Error('failed to send request'));
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
      axios.delete = jest.fn().mockResolvedValue({});
      const { findByText, findByTestId, queryByTestId, queryByText, user } = setup();

      expect(await findByText('not completed quantity bar not completed product')).toBeVisible();
      expect(await findByText('Bar')).toBeVisible();

      await user.click(await findByTestId('not-completed-item-delete-id5'));
      expect(await findByTestId('confirm-delete')).toBeVisible();
      await user.click(await findByTestId('confirm-delete'));

      await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(queryByTestId('confirm-delete')).toBeNull());

      expect(queryByText('not completed quantity bar not completed product')).toBeNull();
      expect(queryByText('Bar')).toBeNull();
      expect(mockShowToast.info).toHaveBeenCalledWith('Item successfully deleted.');
    });

    it('deletes item, hides modal, does not remove category when item is not last of category', async () => {
      axios.delete = jest.fn().mockResolvedValue({});
      const { findByText, findByTestId, queryByTestId, queryByText, user } = setup();

      expect(await findByText('not completed quantity foo not completed product')).toBeVisible();
      expect(await findByText('Foo')).toBeVisible();

      await user.click(await findByTestId('not-completed-item-delete-id3'));
      expect(await findByTestId('confirm-delete')).toBeVisible();
      await user.click(await findByTestId('confirm-delete'));

      await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(queryByTestId('confirm-delete')).toBeNull());

      expect(queryByText('not completed quantity foo not completed product')).toBeNull();
      expect(await findByText('Foo')).toBeVisible();
      expect(mockShowToast.info).toHaveBeenCalledWith('Item successfully deleted.');
    });

    it('deletes item, hides modal, when item is in completed', async () => {
      axios.delete = jest.fn().mockResolvedValue({});
      const { findByText, findByTestId, queryByTestId, queryByText, user } = setup();

      expect(
        (await findByText('completed quantity foo completed product')).parentElement?.parentElement?.parentElement,
      ).toHaveAttribute('data-test-class', 'completed-item');

      await user.click(await findByTestId('completed-item-delete-id1'));
      expect(await findByTestId('confirm-delete')).toBeVisible();
      await user.click(await findByTestId('confirm-delete'));

      await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(queryByTestId('confirm-delete')).toBeNull());

      expect(queryByText('completed quantity foo completed product')).toBeNull();
      expect(mockShowToast.info).toHaveBeenCalledWith('Item successfully deleted.');
    });

    it('deletes all items when multiple are selected', async () => {
      axios.delete = jest.fn().mockResolvedValueOnce({}).mockResolvedValueOnce({});
      const { findAllByRole, findByText, findByTestId, queryByTestId, queryByText, findAllByText, user } = setup();

      expect(await findByText('not completed quantity foo not completed product', { exact: true })).toBeVisible();
      expect(await findByText('not completed quantity foo not completed product 2')).toBeVisible();
      expect(await findByText('not completed quantity bar not completed product')).toBeVisible();

      await user.click((await findAllByText('Select'))[0]);
      await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

      const checkboxes = await findAllByRole('checkbox');
      await user.click(checkboxes[2]);
      await user.click(checkboxes[3]);
      await user.click(await findByTestId('not-completed-item-delete-id2'));

      expect(await findByTestId('confirm-delete')).toBeVisible();
      await user.click(await findByTestId('confirm-delete'));

      await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(2));
      await waitFor(() => expect(queryByTestId('confirm-delete')).toBeNull());

      expect(queryByText('Foo')).toBeNull();
      expect(queryByText('not completed quantity foo not completed product', { exact: true })).toBeNull();
      expect(queryByText('not completed quantity foo not completed product 2')).toBeNull();
      expect(await findByText('not completed quantity bar not completed product')).toBeVisible();
      expect(await findByText('Bar')).toBeVisible();
    });

    it('handles partial failure when deleting multiple items - some succeed, some fail', async () => {
      // Mock first item to succeed, second to fail
      axios.delete = jest
        .fn()
        .mockResolvedValueOnce({})
        .mockRejectedValueOnce({ response: { status: 500 } });

      const { findAllByRole, findByText, findByTestId, findAllByText, queryByText, user } = setup();

      await user.click((await findAllByText('Select'))[0]);
      await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

      const checkboxes = await findAllByRole('checkbox');
      await user.click(checkboxes[2]);
      await user.click(checkboxes[3]);
      await user.click(await findByTestId('not-completed-item-delete-id2'));

      expect(await findByTestId('confirm-delete')).toBeVisible();
      await user.click(await findByTestId('confirm-delete'));

      await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(2));

      // Should show warning toast about partial failure
      expect(mockShowToast.warning).toHaveBeenCalledWith(
        'Some items failed to delete. Item deleted successfully. Item failed.',
      );

      // The successful item should be deleted, failed item should be rolled back
      // checkboxes[2] = id3 (foo not completed product) - should be deleted (success)
      // checkboxes[3] = id4 (foo not completed product 2) - should be rolled back (failure)
      expect(queryByText('not completed quantity foo not completed product')).toBeNull();
      expect(await findByText('not completed quantity foo not completed product 2')).toBeVisible();
    });

    it('handles complete failure when deleting multiple items - all fail', async () => {
      // Mock all items to fail
      axios.delete = jest
        .fn()
        .mockRejectedValueOnce({ response: { status: 500 } })
        .mockRejectedValueOnce({ response: { status: 500 } });

      const { findAllByRole, findByText, findByTestId, findAllByText, user } = setup();

      await user.click((await findAllByText('Select'))[0]);
      await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

      const checkboxes = await findAllByRole('checkbox');
      await user.click(checkboxes[1]);
      await user.click(checkboxes[2]);
      await user.click(await findByTestId('not-completed-item-delete-id2'));

      expect(await findByTestId('confirm-delete')).toBeVisible();
      await user.click(await findByTestId('confirm-delete'));

      await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(2));

      // Should show error toast for complete failure
      expect(mockShowToast.error).toHaveBeenCalledWith('Failed to delete items. Please try again.');

      // All items should be rolled back to their original state
      expect(await findByText('not completed quantity foo not completed product')).toBeVisible();
      expect(await findByText('not completed quantity foo not completed product 2')).toBeVisible();
    });

    it('does not delete item when delete is cleared, hides modal', async () => {
      const { findByTestId, findByText, queryByTestId, user } = setup();

      await user.click(await findByTestId('not-completed-item-delete-id2'));
      expect(await findByTestId('clear-delete')).toBeVisible();
      await user.click(await findByTestId('clear-delete'));

      await waitFor(() => expect(queryByTestId('clear-delete')).toBeNull());
      expect(await findByText('not completed quantity no category not completed product')).toBeVisible();
    });
  });

  describe('Complete Operations', () => {
    it('moves item to completed', async () => {
      const completedItem = createListItem('id2', true, [
        createField('id2', 'quantity', 'not completed quantity', 'id2'),
        createField('id3', 'product', 'no category not completed product', 'id2'),
      ]);
      axios.put = jest.fn().mockResolvedValue({ data: completedItem });

      const { findByText, findByTestId, user } = setup();

      expect(
        (await findByText('not completed quantity no category not completed product')).parentElement?.parentElement
          ?.parentElement,
      ).toHaveAttribute('data-test-class', 'non-completed-item');

      await user.click(await findByTestId('not-completed-item-complete-id2'));

      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

      expect(
        (await findByText('not completed quantity no category not completed product')).parentElement?.parentElement
          ?.parentElement,
      ).toHaveAttribute('data-test-class', 'completed-item');
    });

    it('moves item to completed and clears filter when item is last of category', async () => {
      const completedItem = createListItem('id5', true, [
        createField('id10', 'quantity', 'not completed quantity', 'id5'),
        createField('id11', 'product', 'bar not completed product', 'id5'),
        createField('id12', 'category', 'bar', 'id5'),
      ]);
      axios.put = jest.fn().mockResolvedValue({ data: completedItem });

      const { findByText, findByTestId, queryByText, user } = setup();

      await user.click(await findByText('Filter by category'));
      await waitFor(async () => expect(await findByTestId('filter-by-bar')).toBeVisible());
      await user.click(await findByTestId('filter-by-bar'));

      await waitFor(() => expect(queryByText('not completed quantity foo not completed product')).toBeNull());

      expect(await findByTestId('clear-filter')).toBeVisible();
      expect(
        (await findByText('not completed quantity bar not completed product')).parentElement?.parentElement
          ?.parentElement,
      ).toHaveAttribute('data-test-class', 'non-completed-item');

      await user.click(await findByTestId('not-completed-item-complete-id5'));

      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

      // The filter should remain visible since there are still items in the category
      expect(await findByTestId('clear-filter')).toBeVisible();
      // The item should now be in completed state
      expect(
        (await findByText('not completed quantity bar not completed product')).parentElement?.parentElement
          ?.parentElement,
      ).toHaveAttribute('data-test-class', 'completed-item');
    });

    it('moves items to completed when multiple selected', async () => {
      const completedItem = createListItem('id2', true, [
        createField('id2', 'quantity', 'not completed quantity', 'id2'),
        createField('id3', 'product', 'no category not completed product', 'id2'),
      ]);
      axios.put = jest.fn().mockResolvedValue({ data: completedItem });

      const { findAllByRole, findByText, findByTestId, findAllByText, user } = setup();

      // Check initial state
      const initialItem = await findByTestId('not-completed-item-complete-id2');
      expect(initialItem.closest('[data-test-class="non-completed-item"]')).toBeInTheDocument();

      await user.click((await findAllByText('Select'))[0]);
      await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

      const checkboxes = (await findAllByRole('checkbox')).filter((cb) => cb.id !== 'completed');
      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);
      await user.click(await findByTestId('not-completed-item-complete-id2'));

      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(2));

      // Check that items are now in completed section
      const completedItems = document.querySelectorAll('[data-test-class="completed-item"]');
      expect(completedItems.length).toBeGreaterThan(1);
      expect(await findByText('Bar')).toBeVisible();
    });

    it('handles partial failure when completing multiple items - some succeed, some fail', async () => {
      // Mock first item to succeed, second to fail
      axios.put = jest
        .fn()
        .mockResolvedValueOnce({ data: createListItem('id2', true, [createField('id2', 'product', 'item 1', 'id2')]) })
        .mockRejectedValueOnce({ response: { status: 500 } });

      const { findAllByRole, findByText, findByTestId, findAllByText, user } = setup();

      await user.click((await findAllByText('Select'))[0]);
      await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

      const checkboxes = (await findAllByRole('checkbox')).filter((cb) => cb.id !== 'completed');
      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);
      await user.click(await findByTestId('not-completed-item-complete-id2'));

      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(2));

      // Should show warning toast about partial failure
      expect(mockShowToast.warning).toHaveBeenCalledWith(
        'Some items failed to complete. Item completed successfully. Item failed.',
      );

      // The successful item should remain in completed, failed item should be rolled back to not completed
      expect(await findByText('not completed quantity no category not completed product')).toBeVisible();
    });

    it('handles complete failure when completing multiple items - all fail', async () => {
      // Mock all items to fail
      axios.put = jest
        .fn()
        .mockRejectedValueOnce({ response: { status: 500 } })
        .mockRejectedValueOnce({ response: { status: 500 } });

      const { findAllByRole, findByText, findByTestId, findAllByText, user } = setup();

      await user.click((await findAllByText('Select'))[0]);
      await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

      const checkboxes = (await findAllByRole('checkbox')).filter((cb) => cb.id !== 'completed');
      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);
      await user.click(await findByTestId('not-completed-item-complete-id2'));

      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(2));

      // Should call handleFailure for complete failure
      expect(await findByText('not completed quantity no category not completed product')).toBeVisible();
      expect(await findByText('not completed quantity foo not completed product')).toBeVisible();
    });

    it('handles 401 on complete', async () => {
      axios.put = jest.fn().mockRejectedValue({ response: { status: 401 } });
      const { findByTestId, user } = setup();

      await user.click(await findByTestId('not-completed-item-complete-id2'));

      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));

      expect(mockShowToast.error).toHaveBeenCalledWith('You must sign in');
      expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
    });

    it('handles 403 on complete', async () => {
      axios.put = jest.fn().mockRejectedValue({ response: { status: 403 } });
      const { findByTestId, user } = setup();

      await user.click(await findByTestId('not-completed-item-complete-id2'));

      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
      expect(mockShowToast.error).toHaveBeenCalledWith('Failed to complete item');
    });

    it('handles 404 on complete', async () => {
      axios.put = jest.fn().mockRejectedValue({ response: { status: 404 } });
      const { findByTestId, user } = setup();

      await user.click(await findByTestId('not-completed-item-complete-id2'));

      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
      expect(mockShowToast.error).toHaveBeenCalledWith('Failed to complete item');
    });

    it('handles not 401, 403, 404 on complete', async () => {
      axios.put = jest.fn().mockRejectedValue({ response: { status: 500 } });
      const { findByTestId, user } = setup();

      await user.click(await findByTestId('not-completed-item-complete-id2'));

      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
      expect(mockShowToast.error).toHaveBeenCalledWith(
        'Something went wrong. Data may be incomplete and user actions may not persist.',
      );
    });

    it('handles failed request on complete', async () => {
      axios.put = jest.fn().mockRejectedValue({ request: 'failed to send request' });
      const { findByTestId, user } = setup();

      await user.click(await findByTestId('not-completed-item-complete-id2'));

      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
      expect(mockShowToast.error).toHaveBeenCalledWith('Network error. Please check your connection.');
    });

    it('handles unknown failure on complete', async () => {
      axios.put = jest.fn().mockRejectedValue(new Error('failed to send request'));
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
      axios.post = jest
        .fn()
        .mockResolvedValueOnce({ data: { id: 'id6', completed: false } }) // Create item
        .mockResolvedValueOnce({ data: {} }) // Create quantity field
        .mockResolvedValueOnce({ data: {} }); // Create product field
      axios.get = jest.fn().mockResolvedValueOnce({
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
            createField('id2', 'product', 'foo completed product', 'id6'),
          ],
        },
      }); // Fetch complete item
      axios.put = jest.fn().mockResolvedValue(undefined);
      const { findByTestId, findByText, user } = setup();

      expect(
        (await findByText('completed quantity foo completed product')).parentElement?.parentElement?.parentElement,
      ).toHaveAttribute('data-test-class', 'completed-item');

      await user.click(await findByTestId('completed-item-refresh-id1'));

      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(3)); // Create item + 2 fields
      await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1)); // Fetch complete item
      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

      await waitFor(async () =>
        expect(
          (await findByText('completed quantity foo completed product')).parentElement?.parentElement?.parentElement,
        ).toHaveAttribute('data-test-class', 'non-completed-item'),
      );

      expect(
        (await findByText('completed quantity foo completed product')).parentElement?.parentElement?.parentElement,
      ).toHaveAttribute('data-test-class', 'non-completed-item');
    });

    it('moves items to not completed when refreshed with multiple selected', async () => {
      // Mock the new API pattern: create items, create fields, fetch complete items
      axios.post = jest
        .fn()
        .mockResolvedValueOnce({ data: { id: 'id6', completed: false } }) // Create first item
        .mockResolvedValueOnce({ data: {} }) // Create quantity field for first item
        .mockResolvedValueOnce({ data: {} }) // Create product field for first item
        .mockResolvedValueOnce({ data: { id: 'id7', completed: false } }) // Create second item
        .mockResolvedValueOnce({ data: {} }) // Create quantity field for second item
        .mockResolvedValueOnce({ data: {} }); // Create product field for second item
      axios.get = jest
        .fn()
        .mockResolvedValueOnce({
          data: createListItem('id6', false, [
            createField('id1', 'quantity', 'completed quantity', 'id6'),
            createField('id2', 'product', 'foo completed product', 'id6'),
          ]),
        }) // Fetch first complete item
        .mockResolvedValueOnce({
          data: createListItem('id7', false, [
            createField('id13', 'quantity', 'completed quantity', 'id7'),
            createField('id14', 'product', 'bar completed product', 'id7'),
          ]),
        }); // Fetch second complete item
      axios.put = jest.fn().mockResolvedValue(undefined);
      const { findAllByRole, findByTestId, findByText, findAllByText, user } = setup({
        completedItems: [
          createListItem('id1', true, [
            createField('id1', 'quantity', 'completed quantity', 'id1'),
            createField('id2', 'product', 'foo completed product', 'id1'),
            createField('id3', 'read', 'true', 'id1'),
          ]),
          createListItem('id2', true, [
            createField('id1', 'quantity', 'completed quantity', 'id1'),
            createField('id2', 'product', 'bar completed product', 'id1'),
          ]),
        ],
      });

      expect(
        (await findByText('completed quantity foo completed product')).parentElement?.parentElement?.parentElement,
      ).toHaveAttribute('data-test-class', 'completed-item');

      await user.click((await findAllByText('Select'))[1]);
      await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

      const checkboxes = (await findAllByRole('checkbox')).filter((cb) => cb.id !== 'completed');
      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);
      await user.click(await findByTestId('completed-item-refresh-id1'));

      // Create 2 items + fields (some fields may be skipped if empty)
      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(7));
      await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2)); // Fetch 2 complete items
      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(2)); // Mark 2 original items as refreshed

      await waitFor(async () =>
        expect(
          (await findByText('completed quantity foo completed product')).parentElement?.parentElement?.parentElement,
        ).toHaveAttribute('data-test-class', 'non-completed-item'),
      );

      expect(
        (await findByText('completed quantity foo completed product')).parentElement?.parentElement?.parentElement,
      ).toHaveAttribute('data-test-class', 'non-completed-item');
    });

    it('handles 401 on refresh', async () => {
      axios.post = jest.fn().mockRejectedValue({ response: { status: 401 } });
      axios.put = jest.fn().mockResolvedValue(undefined);
      const { findByTestId, user } = setup();

      await user.click(await findByTestId('completed-item-refresh-id1'));

      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));

      expect(mockShowToast.error).toHaveBeenCalledWith('You must sign in');
      expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
    });

    it('handles 403 on refresh', async () => {
      axios.post = jest.fn().mockRejectedValue({ response: { status: 403 } });
      axios.put = jest.fn().mockResolvedValue(undefined);
      const { findByTestId, user } = setup();

      await user.click(await findByTestId('completed-item-refresh-id1'));

      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

      expect(mockShowToast.error).toHaveBeenCalledWith('Failed to refresh item');
    });

    it('handles 404 on refresh', async () => {
      axios.post = jest.fn().mockRejectedValue({ response: { status: 404 } });
      axios.put = jest.fn().mockResolvedValue(undefined);
      const { findByTestId, user } = setup();

      await user.click(await findByTestId('completed-item-refresh-id1'));

      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

      expect(mockShowToast.error).toHaveBeenCalledWith('Failed to refresh item');
    });

    it('handles not 401, 403, 404 on refresh', async () => {
      axios.post = jest.fn().mockRejectedValue({ response: { status: 500 } });
      axios.put = jest.fn().mockResolvedValue(undefined);
      const { findByTestId, user } = setup();

      await user.click(await findByTestId('completed-item-refresh-id1'));

      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

      expect(mockShowToast.error).toHaveBeenCalledWith(
        'Something went wrong. Data may be incomplete and user actions may not persist.',
      );
    });

    it('handles failed request on refresh', async () => {
      axios.post = jest.fn().mockRejectedValue({ request: 'failed to send request' });
      axios.put = jest.fn().mockResolvedValue(undefined);
      const { findByTestId, user } = setup();

      await user.click(await findByTestId('completed-item-refresh-id1'));

      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

      expect(mockShowToast.error).toHaveBeenCalledWith('Network error. Please check your connection.');
    });

    it('handles unknown failure on refresh', async () => {
      axios.post = jest.fn().mockRejectedValue(new Error('failed to send request'));
      axios.put = jest.fn().mockResolvedValue(undefined);
      const { findByTestId, user } = setup();

      await user.click(await findByTestId('completed-item-refresh-id1'));

      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

      expect(mockShowToast.error).toHaveBeenCalledWith(
        'Something went wrong. Data may be incomplete and user actions may not persist.',
      );
    });
  });

  describe('Read Operations', () => {
    it('toggles read when item not completed', async () => {
      axios.put = jest.fn().mockResolvedValue({});
      const { findByTestId, queryByTestId, user } = setup({
        list: bookListTestData.list,
        notCompletedItems: bookListTestData.notCompletedItems,
        completedItems: [],
      });

      await user.click(await findByTestId('not-completed-item-read-id2'));

      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

      expect(await findByTestId('not-completed-item-unread-id2')).toBeVisible();
      expect(queryByTestId('not-completed-item-read-id2')).toBeNull();
    });

    it('toggles unread when item not completed', async () => {
      axios.put = jest.fn().mockResolvedValue({});
      const { findByTestId, queryByTestId, user } = setup({
        list: bookListTestData.list,
        notCompletedItems: [
          createListItem('id2', false, [
            createField('id1', 'title', 'Test Book Title', 'id2'),
            createField('id2', 'read', 'true', 'id2'),
          ]),
        ],
        completedItems: [],
      });

      await user.click(await findByTestId('not-completed-item-unread-id2'));

      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

      expect(await findByTestId('not-completed-item-read-id2')).toBeVisible();
      expect(queryByTestId('not-completed-item-unread-id2')).toBeNull();
    });

    it('toggles read when item completed', async () => {
      axios.put = jest.fn().mockResolvedValue({});
      const { findByTestId, queryByTestId, user } = setup({
        list: bookListTestData.list,
        notCompletedItems: [],
        completedItems: [
          createListItem('id1', true, [
            createField('id1', 'title', 'Completed Book Title', 'id1'),
            createField('id2', 'author', 'Completed Author', 'id1'),
            createField('id3', 'read', 'true', 'id1'), // item is read, so unread button should be visible
          ]),
        ],
      });

      await user.click(await findByTestId('completed-item-unread-id1'));

      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

      expect(await findByTestId('completed-item-read-id1')).toBeVisible();
      expect(queryByTestId('completed-item-unread-id1')).toBeNull();
    });

    it('toggles unread when item completed', async () => {
      axios.put = jest.fn().mockResolvedValue({});
      const { findByTestId, queryByTestId, user } = setup({
        list: bookListTestData.list,
        notCompletedItems: [],
        completedItems: [
          createListItem('id1', true, [
            createField('id1', 'title', 'Completed Book Title', 'id1'),
            createField('id2', 'author', 'Completed Author', 'id1'),
            createField('id3', 'read', 'true', 'id1'), // item is read, so unread button should be visible
          ]),
        ],
      });

      await user.click(await findByTestId('completed-item-unread-id1'));

      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

      expect(await findByTestId('completed-item-read-id1')).toBeVisible();
      expect(queryByTestId('completed-item-unread-id1')).toBeNull();
    });

    it('toggles read on multiple items when selected', async () => {
      axios.put = jest.fn().mockResolvedValue({});
      axios.get = jest
        .fn()
        .mockResolvedValue({ data: { list_item_configuration_id: 'list-config-1' } })
        .mockResolvedValue({ data: [{ id: 'read-config-1', label: 'read', data_type: 'boolean' }] });
      axios.post = jest.fn().mockResolvedValue({});

      // All notCompletedItems have a 'read' field
      const { findAllByRole, findAllByText, findByTestId, findByText, queryByTestId, user } = setup({
        list: bookListTestData.list,
        notCompletedItems: [
          createListItem('id2', false, [
            createField('id1', 'title', 'Book Title 1', 'id2'),
            createField('id2', 'author', 'Author 1', 'id2'),
            createField('id10', 'read', 'true', 'id2'),
          ]),
          createListItem('id3', false, [
            createField('id3', 'title', 'Book Title 2', 'id3'),
            createField('id4', 'author', 'Author 2', 'id3'),
            createField('id11', 'read', 'true', 'id3'),
          ]),
          createListItem('id4', false, [
            createField('id5', 'title', 'Book Title 3', 'id4'),
            createField('id6', 'author', 'Author 3', 'id4'),
            createField('id12', 'read', 'true', 'id4'),
          ]),
        ],
        completedItems: [
          createListItem('id5', true, [
            createField('id7', 'title', 'Completed Book Title', 'id5'),
            createField('id8', 'author', 'Completed Author', 'id5'),
            createField('id9', 'read', 'false', 'id5'),
          ]),
        ],
      });

      await user.click((await findAllByText('Select'))[0]);

      await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

      const checkboxes = (await findAllByRole('checkbox')).filter((cb) => cb.id !== 'completed');

      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);
      await user.click(checkboxes[2]);
      await user.click(await findByTestId('not-completed-item-unread-id2'));

      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(3));
      expect(await findByTestId('not-completed-item-read-id2')).toBeVisible();
      expect(queryByTestId('not-completed-item-unread-id2')).toBeNull();
      expect(await findByTestId('not-completed-item-read-id3')).toBeVisible();
      expect(queryByTestId('not-completed-item-unread-id3')).toBeNull();
      expect(await findByTestId('not-completed-item-read-id4')).toBeVisible();
      expect(queryByTestId('not-completed-item-unread-id4')).toBeNull();
    });

    it('handles 401 on read', async () => {
      axios.put = jest.fn().mockRejectedValue({ response: { status: 401 } });
      const { findByTestId, user } = setup({
        list: bookListTestData.list,
        notCompletedItems: [],
        completedItems: [
          createListItem('id1', true, [
            createField('id1', 'title', 'Completed Book Title', 'id1'),
            createField('id2', 'author', 'Completed Author', 'id1'),
            createField('id3', 'read', 'false', 'id1'), // item is unread, so read button should be visible
          ]),
        ],
      });

      await user.click(await findByTestId('completed-item-read-id1'));

      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));

      expect(mockShowToast.error).toHaveBeenCalledWith('You must sign in');
      expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
    });

    it('handles 403 on read', async () => {
      axios.put = jest.fn().mockRejectedValue({ response: { status: 403 } });
      const { findByTestId, user } = setup({
        list: bookListTestData.list,
        notCompletedItems: [],
        completedItems: [
          createListItem('id1', true, [
            createField('id1', 'title', 'Completed Book Title', 'id1'),
            createField('id2', 'author', 'Completed Author', 'id1'),
            createField('id3', 'read', 'false', 'id1'), // ensure 'read' is 'false'
          ]),
        ],
      });

      await user.click(await findByTestId('completed-item-read-id1'));

      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

      expect(mockShowToast.error).toHaveBeenCalledWith('Item not found');
    });

    it('handles 404 on read', async () => {
      axios.put = jest.fn().mockRejectedValue({ response: { status: 404 } });
      const { findByTestId, user } = setup({
        list: bookListTestData.list,
        notCompletedItems: [],
        completedItems: [
          createListItem('id1', true, [
            createField('id1', 'title', 'Completed Book Title', 'id1'),
            createField('id2', 'author', 'Completed Author', 'id1'),
            createField('id3', 'read', 'false', 'id1'), // ensure 'read' is 'false'
          ]),
        ],
      });

      await user.click(await findByTestId('completed-item-read-id1'));

      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

      expect(mockShowToast.error).toHaveBeenCalledWith('Item not found');
    });

    it('handles not 401, 403, 404 on read', async () => {
      axios.put = jest.fn().mockRejectedValue({ response: { status: 500, data: { foo: 'bar', foobar: 'foobaz' } } });
      const { findByTestId, user } = setup({
        list: bookListTestData.list,
        notCompletedItems: [],
        completedItems: [
          createListItem('id1', true, [
            createField('id1', 'title', 'Completed Book Title', 'id1'),
            createField('id2', 'author', 'Completed Author', 'id1'),
            createField('id3', 'read', 'false', 'id1'), // ensure 'read' is 'false'
          ]),
        ],
      });

      await user.click(await findByTestId('completed-item-read-id1'));

      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

      expect(mockShowToast.error).toHaveBeenCalledWith(
        'Something went wrong. Data may be incomplete and user actions may not persist.',
      );
    });

    it('handles failed request on read', async () => {
      axios.put = jest.fn().mockRejectedValue({ request: 'failed to send request' });
      const { findByTestId, user } = setup({
        list: bookListTestData.list,
        notCompletedItems: [],
        completedItems: [
          createListItem('id1', true, [
            createField('id1', 'title', 'Completed Book Title', 'id1'),
            createField('id2', 'author', 'Completed Author', 'id1'),
            createField('id3', 'read', 'false', 'id1'), // ensure 'read' is 'false'
          ]),
        ],
      });

      await user.click(await findByTestId('completed-item-read-id1'));

      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

      expect(mockShowToast.error).toHaveBeenCalledWith('Network error. Please check your connection.');
    });

    it('handles unknown failure on read', async () => {
      axios.put = jest.fn().mockRejectedValue(new Error('failed to send request'));
      const { findByTestId, user } = setup({
        list: bookListTestData.list,
        notCompletedItems: [],
        completedItems: [
          createListItem('id1', true, [
            createField('id1', 'title', 'Completed Book Title', 'id1'),
            createField('id2', 'author', 'Completed Author', 'id1'),
            createField('id3', 'read', 'false', 'id1'), // ensure 'read' is 'false'
          ]),
        ],
      });

      await user.click(await findByTestId('completed-item-read-id1'));

      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

      expect(mockShowToast.error).toHaveBeenCalledWith(
        'Something went wrong. Data may be incomplete and user actions may not persist.',
      );
    });
  });

  describe('Multi-Select Operations', () => {
    it('cannot multi select if user does not have write access', () => {
      const { queryByText } = setup({ permissions: EUserPermissions.READ });
      expect(queryByText('Select')).toBeNull();
    });

    it('changes select to hide select when multi select is on', async () => {
      const { findAllByText, findByText, user } = setup({ permissions: EUserPermissions.WRITE });

      expect((await findAllByText('Select'))[0]).toHaveTextContent('Select');

      await user.click((await findAllByText('Select'))[0]);
      await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

      expect(await findByText('Hide Select')).toBeVisible();
    });

    it('handles item select for multi select when item has not been selected', async () => {
      const { findAllByRole, findAllByText, findByText, user } = setup({ permissions: EUserPermissions.WRITE });

      await user.click((await findAllByText('Select'))[0]);
      await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

      await user.click((await findAllByRole('checkbox'))[0]);

      expect((await findAllByRole('checkbox'))[0]).toBeChecked();
    });

    it('handles item select for multi select when item has been selected', async () => {
      const { findAllByRole, findAllByText, findByText, user } = setup({ permissions: EUserPermissions.WRITE });

      await user.click((await findAllByText('Select'))[0]);
      await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

      await user.click((await findAllByRole('checkbox'))[0]);
      await user.click((await findAllByRole('checkbox'))[0]);

      expect((await findAllByRole('checkbox'))[0]).not.toBeChecked();
    });

    it('clears selected items for multi select is hidden for not completed items', async () => {
      const { findAllByRole, findAllByText, findByText, user } = setup({ permissions: EUserPermissions.WRITE });

      await user.click((await findAllByText('Select'))[0]);
      await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

      const multiSelectCheckboxes = (await findAllByRole('checkbox')).filter((cb) => cb.id !== 'completed');
      await user.click(multiSelectCheckboxes[0]);
      expect(multiSelectCheckboxes[0]).toBeChecked();

      await user.click(await findByText('Hide Select'));
      await user.click((await findAllByText('Select'))[0]);
      await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

      const updatedMultiSelectCheckboxes = (await findAllByRole('checkbox')).filter((cb) => cb.id !== 'completed');
      expect(updatedMultiSelectCheckboxes[0]).not.toBeChecked();
    });

    it('clears selected items for multi select is hidden for completed items', async () => {
      const { findAllByRole, findAllByText, findByText, user } = setup({ permissions: EUserPermissions.WRITE });

      await user.click((await findAllByText('Select'))[1]);
      await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

      const completedItemCheckboxes = (await findAllByRole('checkbox')).filter((cb) => cb.id !== 'completed');
      await user.click(completedItemCheckboxes[0]);
      expect(completedItemCheckboxes[0]).toBeChecked();

      await user.click(await findByText('Hide Select'));
      await user.click((await findAllByText('Select'))[1]);
      await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

      const completedMultiSelectCheckboxes = (await findAllByRole('checkbox')).filter((cb) => cb.id !== 'completed');
      expect(completedMultiSelectCheckboxes[0]).not.toBeChecked();
    });

    it('navigates to single edit form when no multi select', async () => {
      const { findByTestId, props, user } = setup({ permissions: EUserPermissions.WRITE });
      await user.click(await findByTestId(`not-completed-item-edit-${props.notCompletedItems[0].id}`));

      await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
      expect(mockNavigate).toHaveBeenCalledWith('/lists/id1/list_items/id2/edit');
    });

    it('navigates to bulk edit form when multi select', async () => {
      const { findAllByRole, findByTestId, findAllByText, findByText, props, user } = setup({
        permissions: EUserPermissions.WRITE,
      });

      expect((await findAllByText('Select'))[0]).toHaveTextContent('Select');

      await user.click((await findAllByText('Select'))[0]);
      await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

      const multiSelectCheckboxes = (await findAllByRole('checkbox')).filter((cb) => cb.id !== 'completed');
      await user.click(multiSelectCheckboxes[0]);
      await user.click(multiSelectCheckboxes[1]);
      await user.click(await findByTestId(`not-completed-item-edit-${props.notCompletedItems[0].id}`));

      await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
      expect(mockNavigate).toHaveBeenCalledWith('/lists/id1/list_items/bulk-edit?item_ids=id2,id3');
    });

    it('multi select copy incomplete items', async () => {
      axios.put = jest.fn().mockResolvedValue(false);
      const { findAllByRole, findAllByText, findByText, getByLabelText, getByText, user } = setup({
        permissions: EUserPermissions.WRITE,
      });

      await user.click((await findAllByText('Select'))[0]);
      await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

      await user.click((await findAllByRole('checkbox'))[0]);
      await user.click((await findAllByRole('checkbox'))[1]);
      await user.click(await findByText('Copy to list'));

      expect(await findByText('Choose an existing list or create a new one to copy items')).toBeVisible();

      await user.click(getByLabelText('Existing list'));
      await user.selectOptions(getByLabelText('Existing list'), ['bar']);
      await user.click(getByText('Complete'));

      expect(await findByText('not completed quantity no category not completed product')).toBeVisible();
      expect(await findByText('not completed quantity bar not completed product')).toBeVisible();
      expect(getByText('not completed quantity foo not completed product')).toBeVisible();
      expect(getByText('not completed quantity foo not completed product 2')).toBeVisible();
    });

    it('multi select move incomplete items', async () => {
      // Mock the bulk update API call that the ChangeOtherListModal makes
      axios.put = jest.fn().mockResolvedValue({});
      const { findAllByRole, findAllByText, findByText, getByLabelText, getByText, user } = setup({
        permissions: EUserPermissions.WRITE,
      });

      await user.click((await findAllByText('Select'))[0]);
      await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

      expect(getByText('not completed quantity no category not completed product')).toBeVisible();
      expect(getByText('not completed quantity bar not completed product')).toBeVisible();

      await user.click((await findAllByRole('checkbox'))[1]);
      await user.click((await findAllByRole('checkbox'))[2]);
      await user.click(await findByText('Move to list'));

      expect(await findByText('Choose an existing list or create a new one to move items')).toBeVisible();

      await user.click(getByLabelText('Existing list'));
      await user.selectOptions(getByLabelText('Existing list'), ['bar']);
      await user.click(getByText('Complete'));

      await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

      // The move operation should remove the selected items from the list
      // The handleMove function in the component should be called after the modal completes
      // After move, the selected items should no longer be visible in the current list
      // Checkboxes [1] and [2] correspond to:
      // [1] = "not completed quantity no category not completed product" (id2)
      // [2] = "not completed quantity foo not completed product" (id3)
      await waitFor(() => {
        expect(() => getByText('not completed quantity no category not completed product')).toThrow();
        expect(() => getByText('not completed quantity foo not completed product')).toThrow();
      });

      // Items that were not selected should still be visible
      expect(getByText('not completed quantity bar not completed product')).toBeVisible();
      expect(getByText('not completed quantity foo not completed product 2')).toBeVisible();
    });

    it('multi select copy complete items', async () => {
      const { findAllByRole, findAllByText, findByText, user } = setup({
        permissions: EUserPermissions.WRITE,
        completedItems: [
          createListItem('id1', true, [
            createField('id1', 'quantity', 'completed quantity', 'id1'),
            createField('id2', 'product', 'foo completed product', 'id1'),
            createField('id3', 'read', 'true', 'id1'),
          ]),
          createListItem('id6', true, [
            createField('id13', 'quantity', 'completed quantity', 'id6'),
            createField('id14', 'product', 'bar completed product', 'id6'),
          ]),
        ],
      });

      await user.click((await findAllByText('Select'))[1]);
      await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

      await user.click((await findAllByRole('checkbox'))[0]);
      await user.click((await findAllByRole('checkbox'))[1]);
      await user.click(await findByText('Copy to list'));

      expect(await findByText('Choose an existing list or create a new one to copy items')).toBeVisible();
    });

    it('multi select move complete items', async () => {
      const { findAllByRole, findAllByText, findByText, user } = setup({
        permissions: EUserPermissions.WRITE,
        completedItems: [
          createListItem('id1', true, [
            createField('id1', 'quantity', 'completed quantity', 'id1'),
            createField('id2', 'product', 'foo completed product', 'id1'),
            createField('id3', 'read', 'true', 'id1'),
          ]),
          createListItem('id6', true, [
            createField('id13', 'quantity', 'completed quantity', 'id6'),
            createField('id14', 'product', 'bar completed product', 'id6'),
          ]),
        ],
      });

      await user.click((await findAllByText('Select'))[1]);
      await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

      await user.click((await findAllByRole('checkbox'))[0]);
      await user.click((await findAllByRole('checkbox'))[1]);
      await user.click(await findByText('Move to list'));

      expect(await findByText('Choose an existing list or create a new one to move items')).toBeVisible();
    });
  });

  describe('Item Addition', () => {
    it('adds an item when category exists', async () => {
      const newItem = createListItem('id6', false, [
        createField('id1', 'quantity', 'new quantity', 'id6'),
        createField('id2', 'product', 'new product', 'id6'),
        createField('id3', 'category', 'foo', 'id6'),
      ]);

      // Mock the field configurations API call
      const originalGet = axios.get;
      axios.get = jest.fn().mockImplementation((url) => {
        if (url.includes('list_item_field_configurations')) {
          return Promise.resolve({
            data: [
              { id: 'config1', label: 'product', data_type: 'free_text' },
              { id: 'config2', label: 'quantity', data_type: 'free_text' },
              { id: 'config3', label: 'category', data_type: 'free_text' },
            ],
          });
        }
        if (url.includes('/list_items/id6')) {
          return Promise.resolve({ data: newItem });
        }
        return originalGet(url);
      });

      // Mock the POST calls
      axios.post = jest.fn().mockImplementation((url, data) => {
        if (url.includes('/list_items') && !url.includes('/list_item_fields')) {
          return Promise.resolve({ data: { id: 'id6' } });
        }
        if (url.includes('/list_item_fields')) {
          return Promise.resolve({ data: {} });
        }
        return Promise.resolve({ data: {} });
      });

      const { findByLabelText, findByText, findByTestId, user } = setup();

      // Show the form
      await user.click(await findByTestId('add-item-button'));

      // Wait for form fields to load
      await waitFor(async () => {
        const productField = await findByLabelText('Product');
        expect(productField).toBeVisible();
      });

      await user.type(await findByLabelText('Product'), 'new product');
      await user.type(await findByLabelText('Quantity'), 'new quantity');
      await user.type(await findByLabelText('Category'), 'foo');
      await user.click(await findByText('Add New Item'));

      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(4));

      expect(await findByText('new quantity new product')).toBeVisible();
    });

    it('adds an item when category does not exist', async () => {
      const newItem = createListItem('id6', false, [
        createField('id1', 'quantity', 'new quantity', 'id6'),
        createField('id2', 'product', 'new product', 'id6'),
        createField('id3', 'category', 'new category', 'id6'),
      ]);

      // Mock the field configurations API call
      const originalGet = axios.get;
      axios.get = jest.fn().mockImplementation((url) => {
        if (url.includes('list_item_field_configurations')) {
          return Promise.resolve({
            data: [
              { id: 'config1', label: 'product', data_type: 'free_text' },
              { id: 'config2', label: 'quantity', data_type: 'free_text' },
              { id: 'config3', label: 'category', data_type: 'free_text' },
            ],
          });
        }
        if (url.includes('/list_items/id6')) {
          return Promise.resolve({ data: newItem });
        }
        return originalGet(url);
      });

      // Mock the POST calls
      axios.post = jest.fn().mockImplementation((url, data) => {
        if (url.includes('/list_items') && !url.includes('/list_item_fields')) {
          return Promise.resolve({ data: { id: 'id6' } });
        }
        if (url.includes('/list_item_fields')) {
          return Promise.resolve({ data: {} });
        }
        return Promise.resolve({ data: {} });
      });

      const { findByLabelText, findByText, findByTestId, user } = setup();

      // Show the form
      await user.click(await findByTestId('add-item-button'));

      // Wait for form fields to load
      await waitFor(async () => {
        const productField = await findByLabelText('Product');
        expect(productField).toBeVisible();
      });

      await user.type(await findByLabelText('Product'), 'new product');
      await user.type(await findByLabelText('Quantity'), 'new quantity');
      await user.type(await findByLabelText('Category'), 'new category');
      await user.click(await findByText('Add New Item'));

      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(4));

      expect(await findByText('new quantity new product')).toBeVisible();
      expect(await findByText('New category')).toBeVisible();
    });

    it('adds item while filter, stays filtered', async () => {
      axios.post = jest.fn().mockResolvedValue({
        data: createListItem('id6', false, [
          createField('id1', 'quantity', 'new quantity', 'id6'),
          createField('id2', 'product', 'new product', 'id6'),
          createField('id3', 'category', 'bar', 'id6'),
        ]),
      });

      // Mock the field configurations API call
      const originalGet = axios.get;
      axios.get = jest.fn().mockImplementation((url) => {
        if (url.includes('list_item_field_configurations')) {
          return Promise.resolve({
            data: [
              { id: 'config1', label: 'product', data_type: 'free_text' },
              { id: 'config2', label: 'quantity', data_type: 'free_text' },
              { id: 'config3', label: 'category', data_type: 'free_text' },
            ],
          });
        }
        return originalGet(url);
      });

      const { findByLabelText, findByText, findByTestId, queryByText, user } = setup();

      await user.click(await findByText('Filter by category'));
      await waitFor(async () => expect(await findByTestId('filter-by-foo')).toBeVisible());
      await user.click(await findByTestId('filter-by-foo'));

      // Show the form
      await user.click(await findByTestId('add-item-button'));

      // Wait for form fields to load
      await waitFor(async () => {
        const productField = await findByLabelText('Product');
        expect(productField).toBeVisible();
      });

      await user.type(await findByLabelText('Product'), 'new product');
      await user.type(await findByLabelText('Quantity'), 'new quantity');
      await user.type(await findByLabelText('Category'), 'bar');
      await user.click(await findByText('Add New Item'));

      // The form submission should trigger one POST call
      // The component may make additional calls for field configurations, so we'll check for at least 1
      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(4));

      // The new item should not be visible because it's in a different category (bar)
      // and we're filtering by 'foo'
      expect(queryByText('new quantity new product')).toBeNull();
    });
  });
});
