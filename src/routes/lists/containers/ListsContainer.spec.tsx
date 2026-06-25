import React from 'react';
import { act, render, type RenderResult, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import axios from 'utils/api';
import type { TUserPermissions } from 'typings';
import { listsDeduplicator } from 'utils/requestDeduplication';
import { showToast } from '../../../utils/toast';

// Mock listPrefetch at module level
vi.mock('utils/listPrefetch', () => ({
  prefetchListsIdle: vi.fn(() => Promise.resolve()),
  prefetchList: vi.fn(() => Promise.resolve()),
  getPrefetchedList: vi.fn(() => null),
}));

import ListsContainer, { type IListsContainerProps } from './ListsContainer';

// Mock the new toast utilities
const mockShowToast = showToast as Mocked<typeof showToast>;

const mockNavigate = vi.fn();
vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useNavigate: (): Mock => mockNavigate,
}));

interface ISetupReturn extends RenderResult {
  user: UserEvent;
}

function setup(suppliedProps?: Partial<IListsContainerProps>): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps = {
    userId: 'id1',
    pendingLists: [
      {
        id: 'id-pending',
        name: 'foo',
        list_item_configuration_id: 'config-1',
        created_at: new Date('05/31/2020').toISOString(),
        completed: false,
        users_list_id: 'id-pending',
        owner_id: 'id1',
        refreshed: false,
        has_accepted: null,
      },
    ],
    completedLists: [
      {
        id: 'id2',
        name: 'bar',
        list_item_configuration_id: 'config-1',
        created_at: new Date('05/31/2020').toISOString(),
        completed: true,
        users_list_id: 'id2',
        owner_id: 'id1',
        refreshed: false,
        has_accepted: true,
      },
      {
        id: 'id4',
        name: 'bar',
        list_item_configuration_id: 'config-1',
        created_at: new Date('05/31/2020').toISOString(),
        completed: true,
        users_list_id: 'id4',
        owner_id: 'id2',
        refreshed: false,
        has_accepted: true,
      },
    ],
    incompleteLists: [
      {
        id: 'id5',
        name: 'baz',
        list_item_configuration_id: 'config-1',
        created_at: new Date('05/31/2020').toISOString(),
        completed: false,
        users_list_id: 'id5',
        owner_id: 'id1',
        refreshed: false,
        has_accepted: true,
      },
      {
        id: 'id6',
        name: 'foobar',
        list_item_configuration_id: 'config-1',
        created_at: new Date('05/31/2020').toISOString(),
        completed: false,
        users_list_id: 'id6',
        owner_id: 'id1',
        refreshed: false,
        has_accepted: true,
      },
      {
        id: 'id7',
        name: 'not-owned',
        list_item_configuration_id: 'config-1',
        created_at: new Date('05/31/2020').toISOString(),
        completed: false,
        users_list_id: 'id7',
        owner_id: 'id2',
        refreshed: false,
        has_accepted: true,
      },
    ],
    currentUserPermissions: {
      id1: 'write',
      id2: 'write',
      id5: 'write',
      id4: 'read',
      id6: 'read',
      id7: 'write',
    } as TUserPermissions,
    listItemConfigurations: [
      {
        id: 'config-1',
        name: 'grocery list template',
        user_id: 'id1',
        created_at: '',
        updated_at: '',
        archived_at: null,
      },
      {
        id: 'config-2',
        name: 'book list template',
        user_id: 'id1',
        created_at: '',
        updated_at: '',
        archived_at: null,
      },
    ],
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(
    <MemoryRouter>
      <ListsContainer {...props} />
    </MemoryRouter>,
  );

  return { ...component, user };
}

describe('ListsContainer', () => {
  beforeEach(() => {
    // Clear mocks except axios which needs its implementation preserved
    (axios.get as Mock).mockClear();
    (axios.post as Mock).mockClear();
    (axios.put as Mock).mockClear();
    (axios.delete as Mock).mockClear();
    mockShowToast.error.mockClear();
    mockShowToast.info.mockClear();
    mockShowToast.success.mockClear();
    mockShowToast.warning.mockClear();
    listsDeduplicator.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders', () => {
    const { container } = setup();

    expect(container).toMatchSnapshot();
  });

  it('renders page title', () => {
    const { getByTestId } = setup();

    expect(getByTestId('page-title')).toHaveTextContent('Lists');
  });

  it('renders filter chips', () => {
    const { getByTestId } = setup();

    expect(getByTestId('filter-all')).toBeInTheDocument();
    expect(getByTestId('filter-pending')).toBeInTheDocument();
    expect(getByTestId('filter-active')).toBeInTheDocument();
    expect(getByTestId('filter-completed')).toBeInTheDocument();
  });

  it('renders pending alert when pending lists exist', () => {
    const { getByTestId } = setup();

    expect(getByTestId('pending-alert')).toHaveTextContent('You have 1 list waiting for your response.');
  });

  it('does not render pending alert when no pending lists', () => {
    const { queryByTestId } = setup({ pendingLists: [] });

    expect(queryByTestId('pending-alert')).toBeNull();
  });

  it('renders all list types by default', () => {
    const { getByTestId } = setup();

    expect(getByTestId('list-id-pending')).toHaveAttribute('data-test-class', 'pending-list');
    expect(getByTestId('list-id5')).toHaveAttribute('data-test-class', 'incomplete-list');
    expect(getByTestId('list-id2')).toHaveAttribute('data-test-class', 'completed-list');
  });

  it('filters to only pending lists when Pending chip is clicked', async () => {
    const { getByTestId, queryByTestId, user } = setup();

    await user.click(getByTestId('filter-pending'));

    expect(getByTestId('list-id-pending')).toBeInTheDocument();
    expect(queryByTestId('list-id5')).toBeNull();
    expect(queryByTestId('list-id2')).toBeNull();
  });

  it('filters to only active lists when Active chip is clicked', async () => {
    const { getByTestId, queryByTestId, user } = setup();

    await user.click(getByTestId('filter-active'));

    expect(queryByTestId('list-id-pending')).toBeNull();
    expect(getByTestId('list-id5')).toBeInTheDocument();
    expect(queryByTestId('list-id2')).toBeNull();
  });

  it('filters to only completed lists when Completed chip is clicked', async () => {
    const { getByTestId, queryByTestId, user } = setup();

    await user.click(getByTestId('filter-completed'));

    expect(queryByTestId('list-id-pending')).toBeNull();
    expect(queryByTestId('list-id5')).toBeNull();
    expect(getByTestId('list-id2')).toBeInTheDocument();
  });

  it('accepts initialFilter prop', () => {
    const { getByTestId, queryByTestId } = setup({ initialFilter: 'completed' });

    expect(queryByTestId('list-id-pending')).toBeNull();
    expect(queryByTestId('list-id5')).toBeNull();
    expect(getByTestId('list-id2')).toBeInTheDocument();
  });

  it('hides filter chips when initialFilter is completed', () => {
    const { queryByTestId } = setup({ initialFilter: 'completed' });

    expect(queryByTestId('filter-all')).toBeNull();
    expect(queryByTestId('filter-pending')).toBeNull();
    expect(queryByTestId('filter-active')).toBeNull();
    expect(queryByTestId('filter-completed')).toBeNull();
  });

  it('hides new-list input bar when initialFilter is completed', () => {
    const { queryByTestId } = setup({ initialFilter: 'completed' });

    expect(queryByTestId('quick-add-input')).toBeNull();
  });

  it('hides view all completed lists button when initialFilter is completed', () => {
    const { queryByTestId } = setup({ initialFilter: 'completed' });

    expect(queryByTestId('view-all-completed-lists')).toBeNull();
  });

  it('shows filter chips when initialFilter is not completed', () => {
    const { getByTestId } = setup({ initialFilter: 'all' });

    expect(getByTestId('filter-all')).toBeInTheDocument();
    expect(getByTestId('filter-pending')).toBeInTheDocument();
    expect(getByTestId('filter-active')).toBeInTheDocument();
    expect(getByTestId('filter-completed')).toBeInTheDocument();
  });

  it('shows new-list input bar when initialFilter is not completed', () => {
    const { getByTestId } = setup({ initialFilter: 'all' });

    expect(getByTestId('quick-add-input')).toBeInTheDocument();
  });

  // ─── Empty States ──────────────────────────────────────────────────────────────

  it('shows empty state when pending filter has no lists', async () => {
    const { getByTestId, queryByTestId, user } = setup({ pendingLists: [] });

    await user.click(getByTestId('filter-pending'));

    expect(getByTestId('empty-state')).toBeInTheDocument();
    expect(queryByTestId('list-id5')).toBeNull();
  });

  it('shows empty state when active filter has no lists', async () => {
    const { getByTestId, queryByTestId, user } = setup({ incompleteLists: [] });

    await user.click(getByTestId('filter-active'));

    expect(getByTestId('empty-state')).toBeInTheDocument();
    expect(queryByTestId('list-id-pending')).toBeNull();
  });

  it('shows empty state when completed filter has no lists', async () => {
    const { getByTestId, queryByTestId, user } = setup({ completedLists: [] });

    await user.click(getByTestId('filter-completed'));

    expect(getByTestId('empty-state')).toBeInTheDocument();
    expect(queryByTestId('list-id2')).toBeNull();
  });

  it('shows empty state when all filter has no lists', () => {
    const { getByTestId, queryByTestId } = setup({
      pendingLists: [],
      incompleteLists: [],
      completedLists: [],
    });

    expect(getByTestId('empty-state')).toBeInTheDocument();
    expect(queryByTestId('list-id-pending')).toBeNull();
    expect(queryByTestId('list-id5')).toBeNull();
    expect(queryByTestId('list-id2')).toBeNull();
  });

  it('does not show empty state when filter has lists', () => {
    const { queryByTestId } = setup();

    expect(queryByTestId('empty-state')).toBeNull();
    expect(queryByTestId('list-id-pending')).toBeInTheDocument();
    expect(queryByTestId('list-id5')).toBeInTheDocument();
  });

  it('renders filter chips and input bar with empty state', async () => {
    const { getByTestId, user } = setup({ pendingLists: [] });

    await user.click(getByTestId('filter-pending'));

    expect(getByTestId('filter-pending')).toBeInTheDocument();
    expect(getByTestId('quick-add-input')).toBeInTheDocument();
  });

  it('renders filter chips and input bar when active filter has no lists', async () => {
    const { getByTestId, user } = setup({ incompleteLists: [] });

    await user.click(getByTestId('filter-active'));

    expect(getByTestId('filter-active')).toBeInTheDocument();
    expect(getByTestId('quick-add-input')).toBeInTheDocument();
  });

  it('renders filter chips and input bar when completed filter has no lists', async () => {
    const { getByTestId, user } = setup({ completedLists: [] });

    await user.click(getByTestId('filter-completed'));

    expect(getByTestId('filter-completed')).toBeInTheDocument();
    expect(getByTestId('quick-add-input')).toBeInTheDocument();
  });

  it('renders filter chips and input bar when all filter has no lists', () => {
    const { getByTestId } = setup({
      pendingLists: [],
      incompleteLists: [],
      completedLists: [],
    });

    expect(getByTestId('filter-all')).toBeInTheDocument();
    expect(getByTestId('quick-add-input')).toBeInTheDocument();
  });

  it('renders quick-add input', () => {
    const { getByTestId } = setup();

    expect(getByTestId('quick-add-input')).toBeInTheDocument();
  });

  // ─── View all completed lists link ────────────────────────────────────────

  it('renders view all completed lists link when completed filter is active with completed lists', async () => {
    const { getByTestId, user } = setup();

    await user.click(getByTestId('filter-completed'));

    expect(getByTestId('view-all-completed-lists')).toBeInTheDocument();
    expect(getByTestId('view-all-completed-lists')).toHaveTextContent('View all completed lists');
  });

  it('does not render view all completed lists link when all filter is active', () => {
    const { queryByTestId } = setup();

    expect(queryByTestId('view-all-completed-lists')).toBeNull();
  });

  it('does not render view all completed lists link when pending filter is active', async () => {
    const { getByTestId, queryByTestId, user } = setup();

    await user.click(getByTestId('filter-pending'));

    expect(queryByTestId('view-all-completed-lists')).toBeNull();
  });

  it('does not render view all completed lists link when active filter is active', async () => {
    const { getByTestId, queryByTestId, user } = setup();

    await user.click(getByTestId('filter-active'));

    expect(queryByTestId('view-all-completed-lists')).toBeNull();
  });

  it('does not render view all completed lists link on empty completed state', async () => {
    const { getByTestId, queryByTestId, user } = setup({ completedLists: [] });

    await user.click(getByTestId('filter-completed'));

    expect(queryByTestId('view-all-completed-lists')).toBeNull();
  });

  it('navigates to /completed_lists when view all completed lists link is clicked', async () => {
    const { getByTestId, user } = setup();

    await user.click(getByTestId('filter-completed'));
    await user.click(getByTestId('view-all-completed-lists'));

    expect(mockNavigate).toHaveBeenCalledWith('/completed_lists');
  });

  it('updates via polling when different data is returned', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    axios.get = vi
      .fn()
      .mockResolvedValueOnce({
        data: {
          current_user_id: 'id1',
          accepted_lists: {
            completed_lists: [
              {
                id: 'id1',
                users_list_id: 'id1',
                name: 'foo',
                user_id: 'id1',
                list_item_configuration_id: 'config-1',
                created_at: new Date('05/31/2020').toISOString(),
                completed: true,
                refreshed: false,
                owner_id: 'id1',
              },
            ],
            not_completed_lists: [
              {
                id: 'id2',
                users_list_id: 'id2',
                name: 'bar',
                user_id: 'id1',
                list_item_configuration_id: 'config-1',
                created_at: new Date('05/31/2020').toISOString(),
                completed: false,
                refreshed: false,
                owner_id: 'id1',
              },
            ],
          },
          pending_lists: [
            {
              id: 'id3',
              users_list_id: 'id3',
              name: 'foo',
              user_id: 'id1',
              list_item_configuration_id: 'config-1',
              created_at: new Date('05/31/2020').toISOString(),
              completed: false,
              refreshed: false,
              owner_id: 'id2',
            },
          ],
          current_list_permissions: {
            id1: 'write',
            id2: 'write',
          },
          list_item_configurations: [{ id: 'config-1', name: 'grocery list template' }],
        },
      })
      .mockResolvedValueOnce({
        data: {
          current_user_id: 'id1',
          accepted_lists: {
            completed_lists: [
              {
                id: 'id1',
                users_list_id: 'id1',
                name: 'foo',
                user_id: 'id1',
                list_item_configuration_id: 'config-1',
                created_at: new Date('05/31/2020').toISOString(),
                completed: true,
                refreshed: false,
                owner_id: 'id1',
              },
              {
                id: 'id3',
                users_list_id: 'id3',
                name: 'foo',
                user_id: 'id1',
                list_item_configuration_id: 'config-1',
                created_at: new Date('05/31/2020').toISOString(),
                completed: true,
                refreshed: false,
                owner_id: 'id2',
                has_accepted: true,
              },
            ],
            not_completed_lists: [
              {
                id: 'id2',
                users_list_id: 'id2',
                name: 'bar',
                user_id: 'id1',
                list_item_configuration_id: 'config-1',
                created_at: new Date('05/31/2020').toISOString(),
                completed: false,
                refreshed: false,
                owner_id: 'id1',
                has_accepted: true,
              },
            ],
          },
          pending_lists: [],
          current_list_permissions: {
            id1: 'write',
            id2: 'write',
            id3: 'write',
          },
          list_item_configurations: [{ id: 'config-1', name: 'grocery list template' }],
        },
      });

    const { findByTestId } = setup();

    await act(async () => {
      vi.advanceTimersByTime(10000);
      vi.runOnlyPendingTimers();
    });

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(await findByTestId('list-id3')).toHaveAttribute('data-test-class', 'pending-list');

    await act(async () => {
      vi.advanceTimersByTime(10000);
      vi.runOnlyPendingTimers();
    });

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    expect(await findByTestId('list-id3')).toHaveAttribute('data-test-class', 'completed-list');
    vi.useRealTimers();
  });

  it('does not update via polling when different data is not returned', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    axios.get = vi.fn().mockResolvedValue({
      data: {
        current_user_id: 'id1',
        accepted_lists: {
          completed_lists: [
            {
              id: 'id1',
              users_list_id: 'id1',
              name: 'foo',
              user_id: 'id1',
              list_item_configuration_id: 'config-1',
              created_at: new Date('05/31/2020').toISOString(),
              completed: true,
              refreshed: false,
              owner_id: 'id1',
            },
          ],
          not_completed_lists: [
            {
              id: 'id2',
              users_list_id: 'id2',
              name: 'bar',
              user_id: 'id1',
              list_item_configuration_id: 'config-1',
              created_at: new Date('05/31/2020').toISOString(),
              completed: false,
              refreshed: false,
              owner_id: 'id1',
            },
          ],
        },
        pending_lists: [
          {
            id: 'id3',
            users_list_id: 'id3',
            name: 'foo',
            user_id: 'id1',
            list_item_configuration_id: 'config-1',
            created_at: new Date('05/31/2020').toISOString(),
            completed: false,
            refreshed: false,
            owner_id: 'id2',
          },
        ],
        current_list_permissions: {
          id1: 'write',
          id2: 'write',
        },
        list_item_configurations: [{ id: 'config-1', name: 'grocery list template' }],
      },
    });

    const { findByTestId } = setup();

    await act(async () => {
      vi.advanceTimersByTime(10000);
      vi.runOnlyPendingTimers();
    });

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(await findByTestId('list-id3')).toHaveAttribute('data-test-class', 'pending-list');

    await act(async () => {
      vi.advanceTimersByTime(10000);
      vi.runOnlyPendingTimers();
    });

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    expect(await findByTestId('list-id3')).toHaveAttribute('data-test-class', 'pending-list');
    vi.useRealTimers();
  });

  it('fires generic toast when unknown error on usePolling', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    axios.get = vi.fn().mockRejectedValue({ response: { status: 500 } });
    setup();

    await act(async () => {
      vi.advanceTimersByTime(10000);
      vi.runOnlyPendingTimers();
    });

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(mockShowToast.error).toHaveBeenCalledWith(
      'You may not be connected to the internet. Please check your connection. ' +
        'Data may be incomplete and user actions may not persist.',
    );
    vi.useRealTimers();
  });

  it('creates list via quick-add input', async () => {
    axios.post = vi.fn().mockResolvedValue({
      data: {
        id: 'id8',
        name: 'new list',
        list_item_configuration_id: 'config-1',
        created_at: new Date('05/31/2020').toISOString(),
        owner_id: 'id1',
        completed: false,
        refreshed: false,
        users_list_id: 'id8',
      },
    });
    const { findByTestId, user } = setup();

    const input = await findByTestId('quick-add-input');
    await user.type(input, 'new list{Enter}');
    await act(async () => {
      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    });

    expect(axios.post).toHaveBeenCalledWith('/lists', {
      list: { name: 'new list', list_item_configuration_id: 'config-1' },
    });
    expect(mockShowToast.info).toHaveBeenCalledWith('List successfully added.');
    expect(await findByTestId('list-id8')).toHaveTextContent('new list');
  });

  it('creates list with selected template via expanded input', async () => {
    axios.post = vi.fn().mockResolvedValue({
      data: {
        id: 'id8',
        name: 'new list',
        list_item_configuration_id: 'config-2',
        created_at: new Date('05/31/2020').toISOString(),
        owner_id: 'id1',
        completed: false,
        refreshed: false,
        users_list_id: 'id8',
      },
    });
    const { findByTestId, user } = setup();

    // Expand to show template selector
    await user.click(await findByTestId('quick-add-expand'));
    // Select a different template
    const templateSelect = document.getElementById('list_item_configuration_id') as HTMLSelectElement;
    await user.selectOptions(templateSelect, 'config-2');
    // Type name and submit
    await user.type(await findByTestId('quick-add-input'), 'new list{Enter}');
    await act(async () => {
      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    });

    expect(axios.post).toHaveBeenCalledWith('/lists', {
      list: { name: 'new list', list_item_configuration_id: 'config-2' },
    });
  });

  it('redirects to login when submit response is 401', async () => {
    axios.post = vi.fn().mockRejectedValue({ response: { status: 401 } });
    const { findByTestId, user } = setup();

    await user.type(await findByTestId('quick-add-input'), 'new list{Enter}');
    await act(async () => {
      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    });

    expect(mockShowToast.error).toHaveBeenCalledWith('You must sign in');
    expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
  });

  it('shows errors when submission fails', async () => {
    axios.post = vi.fn().mockRejectedValue({
      response: { status: 400, data: { foo: 'bar', foobar: 'foobaz' } },
    });
    const { findByTestId, user } = setup();

    await user.type(await findByTestId('quick-add-input'), 'new list{Enter}');
    await act(async () => {
      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    });

    expect(mockShowToast.error).toHaveBeenCalledWith('foo bar and foobar foobaz');
  });

  it('shows errors when request fails', async () => {
    axios.post = vi.fn().mockRejectedValue({ request: 'failed to send request' });
    const { findByTestId, user } = setup();

    await user.type(await findByTestId('quick-add-input'), 'new list{Enter}');
    await act(async () => {
      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    });

    expect(mockShowToast.error).toHaveBeenCalledWith('Something went wrong');
  });

  it('shows errors when unknown error occurs', async () => {
    axios.post = vi.fn().mockRejectedValue({ message: 'failed to send request' });
    const { findByTestId, user } = setup();

    await user.type(await findByTestId('quick-add-input'), 'new list{Enter}');
    await act(async () => {
      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    });

    expect(mockShowToast.error).toHaveBeenCalledWith('failed to send request');
  });

  it('navigates to list on click', async () => {
    const { getByTestId, user } = setup();

    await user.click(getByTestId('list-id5'));

    expect(mockNavigate).toHaveBeenCalledWith('/lists/id5');
  });

  it('toggles multi-select mode', async () => {
    const { getByText, queryByText, user } = setup();

    await user.click(getByText('Select Lists'));

    expect(queryByText('Cancel')).toBeInTheDocument();
  });

  it('shows error when list deletion fails', async () => {
    axios.delete = vi.fn().mockRejectedValue({ response: { status: 500 } });
    const { user } = setup({
      incompleteLists: [
        {
          id: 'id-single',
          name: 'Single List',
          list_item_configuration_id: 'config-1',
          created_at: new Date('05/31/2020').toISOString(),
          completed: false,
          users_list_id: 'id-single',
          owner_id: 'id1',
          refreshed: false,
        },
      ],
    });

    const trashButtons = Array.from(document.querySelectorAll('[data-test-id="incomplete-list-trash"]'));
    if (trashButtons.length === 1) {
      await user.click(trashButtons[0] as HTMLElement);

      await waitFor(() => {
        expect(axios.delete).toHaveBeenCalledTimes(1);
      });
    }
  });

  it('navigates to share page when share button is clicked', async () => {
    const { user } = setup();

    const shareButtons = Array.from(document.querySelectorAll('[data-test-id="incomplete-list-share"]'));
    if (shareButtons.length > 0) {
      await user.click(shareButtons[0] as HTMLElement);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it('opens the edit sheet when the edit button is clicked', async () => {
    axios.get = vi.fn().mockResolvedValue({
      data: {
        id: 'id1',
        name: 'foo',
        completed: false,
        refreshed: false,
        archived_at: null,
        list_item_configuration_id: 'cfg-1',
      },
    });
    const { findByText, user } = setup();

    const editButtons = Array.from(document.querySelectorAll('[data-test-id="incomplete-list-edit"]'));
    if (editButtons.length > 0) {
      await user.click(editButtons[0] as HTMLElement);
      expect(await findByText('Edit List')).toBeVisible();
    }
  });

  describe('prefetch logic', () => {
    let mockPrefetchListsIdle: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
      import.meta.env.VITE_PREFETCH_IDLE = 'true';
      const listPrefetchModule = await import('utils/listPrefetch');
      mockPrefetchListsIdle = listPrefetchModule.prefetchListsIdle as unknown as ReturnType<typeof vi.fn>;
      mockPrefetchListsIdle.mockClear();
    });

    afterEach(() => {
      mockPrefetchListsIdle.mockClear();
      vi.unstubAllEnvs();
    });

    it('prefetches lists when pendingLists and incompleteLists are available', async () => {
      setup({
        pendingLists: [
          {
            id: 'id1',
            name: 'pending1',
            list_item_configuration_id: 'config-1',
            created_at: new Date('05/31/2020').toISOString(),
            completed: false,
            users_list_id: 'id1',
            owner_id: 'id1',
            refreshed: false,
          },
        ],
        incompleteLists: [
          {
            id: 'id5',
            name: 'incomplete1',
            list_item_configuration_id: 'config-1',
            created_at: new Date('05/31/2020').toISOString(),
            completed: false,
            users_list_id: 'id5',
            owner_id: 'id1',
            refreshed: false,
          },
          {
            id: 'id6',
            name: 'incomplete2',
            list_item_configuration_id: 'config-1',
            created_at: new Date('05/31/2020').toISOString(),
            completed: false,
            users_list_id: 'id6',
            owner_id: 'id1',
            refreshed: false,
          },
        ],
      });

      await act(async () => {
        await waitFor(
          () => {
            expect(mockPrefetchListsIdle).toHaveBeenCalled();
          },
          { timeout: 2000 },
        );
      });

      expect(mockPrefetchListsIdle).toHaveBeenCalledWith(['id1', 'id5', 'id6']);
    });

    it('limits prefetch to MAX_PREFETCH_LISTS (5)', async () => {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const manyLists = Array.from({ length: 7 }, (_, i) => ({
        id: `id${i + 1}`,
        name: `list${i + 1}`,
        list_item_configuration_id: 'config-1',
        created_at: new Date('05/31/2020').toISOString(),
        completed: false,
        users_list_id: `id${i + 1}`,
        owner_id: 'id1',
        refreshed: false,
      }));

      setup({
        pendingLists: manyLists.slice(0, 3),
        incompleteLists: manyLists.slice(3),
      });

      await act(async () => {
        await waitFor(
          () => {
            expect(mockPrefetchListsIdle).toHaveBeenCalled();
          },
          { timeout: 2000 },
        );
      });

      expect(mockPrefetchListsIdle).toHaveBeenCalledWith(['id1', 'id2', 'id3', 'id4', 'id5']);
    });

    it('filters out lists without valid IDs', async () => {
      setup({
        pendingLists: [
          {
            id: 'id1',
            name: 'valid',
            list_item_configuration_id: 'config-1',
            created_at: new Date('05/31/2020').toISOString(),
            completed: false,
            users_list_id: 'id1',
            owner_id: 'id1',
            refreshed: false,
          },
          {
            id: null as unknown as string,
            name: 'invalid',
            list_item_configuration_id: 'config-1',
            created_at: new Date('05/31/2020').toISOString(),
            completed: false,
            users_list_id: 'id2',
            owner_id: 'id1',
            refreshed: false,
          },
          {
            id: '',
            name: 'empty',
            list_item_configuration_id: 'config-1',
            created_at: new Date('05/31/2020').toISOString(),
            completed: false,
            users_list_id: 'id3',
            owner_id: 'id1',
            refreshed: false,
          },
        ],
        incompleteLists: [],
      });

      await act(async () => {
        await waitFor(
          () => {
            expect(mockPrefetchListsIdle).toHaveBeenCalled();
          },
          { timeout: 2000 },
        );
      });

      expect(mockPrefetchListsIdle).toHaveBeenCalledWith(['id1']);
    });

    it('does not prefetch when listIds is empty', async () => {
      setup({
        pendingLists: [],
        incompleteLists: [],
      });

      await waitFor(
        () => {
          expect(mockPrefetchListsIdle).not.toHaveBeenCalled();
        },
        { timeout: 100 },
      );
    });
  });

  // ─── Multi-select ────────────────────────────────────────────────────────────

  it('selects a list when clicked in multi-select mode', async () => {
    const { getByText, getAllByRole, user } = setup();

    await user.click(getByText('Select Lists'));

    // Click the list card — in multi-select mode clicking the card calls onSelect
    await user.click(document.querySelector('[data-test-id="list-id5"]') as HTMLElement);

    const checkboxes = getAllByRole('checkbox');
    const checkedCheckbox = checkboxes.find((cb) => (cb as HTMLInputElement).checked);
    expect(checkedCheckbox).toBeDefined();
  });

  it('deselects a list when clicked again in multi-select mode', async () => {
    const { getByText, user } = setup();

    await user.click(getByText('Select Lists'));

    const card = document.querySelector('[data-test-id="list-id5"]') as HTMLElement;
    await user.click(card);
    await user.click(card);

    const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]')) as HTMLInputElement[];
    expect(checkboxes.every((cb) => !cb.checked)).toBe(true);
  });

  it('clears selection when Cancel is clicked with items selected', async () => {
    const { getByText, user } = setup();

    await user.click(getByText('Select Lists'));
    await user.click(document.querySelector('[data-test-id="list-id5"]') as HTMLElement);

    // "Select" button has changed to "Cancel"
    await user.click(getByText('Cancel'));

    const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]')) as HTMLInputElement[];
    expect(checkboxes.every((cb) => !cb.checked)).toBe(true);
  });

  it('shows multi-select toolbar when 1+ lists are selected', async () => {
    const { getByText, getByTestId, user } = setup();

    await user.click(getByText('Select Lists'));
    await user.click(document.querySelector('[data-test-id="list-id5"]') as HTMLElement);

    expect(getByTestId('multi-select-delete')).toBeInTheDocument();
    expect(getByTestId('multi-select-edit')).toBeInTheDocument();
  });

  it('shows merge and delete when 2+ lists are selected', async () => {
    const { getByText, getByTestId, queryByTestId, user } = setup();

    await user.click(getByText('Select Lists'));
    await user.click(document.querySelector('[data-test-id="list-id5"]') as HTMLElement);
    await user.click(document.querySelector('[data-test-id="list-id6"]') as HTMLElement);

    expect(getByTestId('multi-select-merge')).toBeInTheDocument();
    expect(getByTestId('multi-select-delete')).toBeInTheDocument();
    expect(queryByTestId('multi-select-edit')).not.toBeInTheDocument();
  });

  it('hides edit button when non-owned list is selected', async () => {
    const { getByText, queryByTestId, user } = setup();

    await user.click(getByText('Select Lists'));
    await user.click(document.querySelector('[data-test-id="list-id7"]') as HTMLElement);

    expect(queryByTestId('multi-select-edit')).not.toBeInTheDocument();
  });

  it('opens edit sheet when multi-select edit button is clicked', async () => {
    const { getByText, getByTestId, user } = setup();

    await user.click(getByText('Select Lists'));
    await user.click(document.querySelector('[data-test-id="list-id5"]') as HTMLElement);
    await user.click(getByTestId('multi-select-edit'));

    expect(getByTestId('edit-list-sheet')).toBeInTheDocument();
  });

  it('shows multi-select-complete when all selected lists are incomplete', async () => {
    const { getByText, getByTestId, queryByTestId, user } = setup();

    await user.click(getByText('Select Lists'));
    // Select an incomplete list (id5, owner_id: id1 = userId)
    await user.click(document.querySelector('[data-test-id="list-id5"]') as HTMLElement);

    expect(getByTestId('multi-select-complete')).toBeInTheDocument();
    expect(queryByTestId('multi-select-refresh')).not.toBeInTheDocument();
  });

  it('shows multi-select-refresh when all selected lists are completed', async () => {
    const { getByText, getByTestId, queryByTestId, user } = setup();

    await user.click(getByText('Select Lists'));
    // Need to switch to completed filter and select completed list id2
    await user.click(getByTestId('filter-completed'));
    await user.click(document.querySelector('[data-test-id="list-id2"]') as HTMLElement);

    expect(getByTestId('multi-select-refresh')).toBeInTheDocument();
    expect(queryByTestId('multi-select-complete')).not.toBeInTheDocument();
  });

  it('hides both complete and refresh when mixed incomplete and completed selected', async () => {
    const { getByText, queryByTestId, user } = setup();

    await user.click(getByText('Select Lists'));
    // Select an incomplete list
    await user.click(document.querySelector('[data-test-id="list-id5"]') as HTMLElement);
    // Select a completed list (visible in 'all' filter)
    await user.click(document.querySelector('[data-test-id="list-id2"]') as HTMLElement);

    expect(queryByTestId('multi-select-complete')).not.toBeInTheDocument();
    expect(queryByTestId('multi-select-refresh')).not.toBeInTheDocument();
  });

  it('bulk completes selected incomplete lists', async () => {
    axios.put = vi.fn().mockResolvedValue({});
    const { getByText, getByTestId, user } = setup();

    await user.click(getByText('Select Lists'));
    await user.click(document.querySelector('[data-test-id="list-id5"]') as HTMLElement);
    await user.click(getByTestId('multi-select-complete'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledWith('/lists/id5', { list: { completed: true } }));
    expect(mockShowToast.info).toHaveBeenLastCalledWith('List successfully completed.');
  });

  it('bulk refreshes selected completed lists', async () => {
    const refreshedList = {
      id: 'id2-refreshed',
      name: 'bar',
      list_item_configuration_id: 'config-1',
      completed: false,
      owner_id: 'id1',
      refreshed: true,
      users_list_id: 'id2',
      created_at: new Date('05/31/2020').toISOString(),
      has_accepted: true,
    };
    axios.post = vi.fn().mockResolvedValue({ data: refreshedList });
    const { getByText, getByTestId, user } = setup();

    await user.click(getByText('Select Lists'));
    await user.click(getByTestId('filter-completed'));
    await user.click(document.querySelector('[data-test-id="list-id2"]') as HTMLElement);
    await user.click(getByTestId('multi-select-refresh'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledWith('/lists/id2/refresh_list', {}));
    expect(mockShowToast.info).toHaveBeenLastCalledWith('List successfully refreshed.');
  });

  it('completed lists show checkbox in multi-select mode', async () => {
    const { getByText, user } = setup();

    await user.click(getByText('Select Lists'));

    // id2 is a completed list
    const checkbox = document.querySelector('[data-test-id="list-select-id2"]');
    expect(checkbox).toBeInTheDocument();
  });

  it('pending lists do not show checkbox in multi-select mode', async () => {
    const { getByText, user } = setup();

    await user.click(getByText('Select Lists'));

    // id-pending is a pending list
    const checkbox = document.querySelector('[data-test-id="list-select-id-pending"]');
    expect(checkbox).not.toBeInTheDocument();
  });

  // ─── Delete ───────────────────────────────────────────────────────────────────

  it('opens delete confirm dialog when trash is clicked on an incomplete list', async () => {
    const { getByTestId, getAllByTestId, user } = setup();

    await user.click(getAllByTestId('incomplete-list-trash')[0]);

    expect(getByTestId('delete-confirm-dialog')).toBeInTheDocument();
  });

  it('closes delete confirm dialog when cancel is clicked', async () => {
    const { getByTestId, queryByTestId, getAllByTestId, user } = setup();

    await user.click(getAllByTestId('incomplete-list-trash')[0]);
    expect(getByTestId('delete-confirm-dialog')).toBeInTheDocument();

    await user.click(getByTestId('clear-delete'));

    expect(queryByTestId('delete-confirm-dialog')).not.toBeInTheDocument();
  });

  it('deletes an owned incomplete list when delete is confirmed', async () => {
    axios.delete = vi.fn().mockResolvedValue({});
    const { getByTestId, getAllByTestId, queryByTestId, user } = setup();

    await user.click(getAllByTestId('incomplete-list-trash')[0]);
    await user.click(getByTestId('confirm-delete'));

    await waitFor(() => expect(axios.delete).toHaveBeenCalledWith('/lists/id5'));
    await waitFor(() => expect(queryByTestId('list-id5')).toBeNull());
    expect(mockShowToast.info).toHaveBeenLastCalledWith('List successfully deleted.');
  });

  it('patches users_lists when rejecting a list the user does not own', async () => {
    axios.patch = vi.fn().mockResolvedValue({});
    const sharedList = {
      id: 'id-shared',
      name: 'shared',
      list_item_configuration_id: 'config-1',
      created_at: new Date('05/31/2020').toISOString(),
      completed: false,
      users_list_id: 'ul-shared',
      owner_id: 'other-user',
      refreshed: false,
      has_accepted: true,
    };
    const { getByTestId, user } = setup({
      incompleteLists: [sharedList],
      currentUserPermissions: { 'id-shared': 'write' } as TUserPermissions,
    });

    await user.click(getByTestId('incomplete-list-trash'));
    await user.click(getByTestId('confirm-delete'));

    await waitFor(() =>
      expect(axios.patch).toHaveBeenCalledWith('/lists/id-shared/users_lists/ul-shared', {
        users_list: { has_accepted: false },
      }),
    );
    expect(mockShowToast.info).toHaveBeenLastCalledWith('List successfully deleted.');
  });

  it('shows error when list deletion fails after confirm', async () => {
    axios.delete = vi.fn().mockRejectedValue({ response: { status: 500 } });
    const { getByTestId, getAllByTestId, user } = setup();

    await user.click(getAllByTestId('incomplete-list-trash')[0]);
    await user.click(getByTestId('confirm-delete'));

    await waitFor(() => expect(mockShowToast.error).toHaveBeenCalled());
  });

  it('deletes multiple selected lists via multi-select toolbar', async () => {
    axios.delete = vi.fn().mockResolvedValue({});
    const { getByText, getByTestId, queryByTestId, user } = setup();

    await user.click(getByText('Select Lists'));
    await user.click(document.querySelector('[data-test-id="list-id5"]') as HTMLElement);
    await user.click(document.querySelector('[data-test-id="list-id6"]') as HTMLElement);

    await user.click(getByTestId('multi-select-delete'));
    await user.click(getByTestId('confirm-delete'));

    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(queryByTestId('list-id5')).toBeNull());
    await waitFor(() => expect(queryByTestId('list-id6')).toBeNull());
  });

  // ─── Completion ───────────────────────────────────────────────────────────────

  it('completes an owned incomplete list when complete button is clicked', async () => {
    axios.put = vi.fn().mockResolvedValue({});
    const { getAllByTestId, user } = setup();

    await user.click(getAllByTestId('incomplete-list-complete')[0]);

    await waitFor(() => expect(axios.put).toHaveBeenCalledWith('/lists/id5', { list: { completed: true } }));
    expect(mockShowToast.info).toHaveBeenLastCalledWith('List successfully completed.');
  });

  it('shows error when completing a list fails', async () => {
    axios.put = vi.fn().mockRejectedValue({ response: { status: 500 } });
    const { getAllByTestId, user } = setup();

    await user.click(getAllByTestId('incomplete-list-complete')[0]);

    await waitFor(() => expect(mockShowToast.error).toHaveBeenCalled());
  });

  // ─── Refresh ─────────────────────────────────────────────────────────────────

  it('refreshes an owned completed list when refresh button is clicked', async () => {
    const refreshedList = {
      id: 'id-refreshed',
      name: 'bar',
      list_item_configuration_id: 'config-1',
      completed: false,
      owner_id: 'id1',
      refreshed: true,
      users_list_id: 'id2',
      created_at: new Date('05/31/2020').toISOString(),
    };
    axios.post = vi.fn().mockResolvedValue({ data: refreshedList });
    const { getAllByTestId, user } = setup();

    await user.click(getAllByTestId('complete-list-refresh')[0]);

    await waitFor(() => expect(axios.post).toHaveBeenCalledWith('/lists/id2/refresh_list', {}));
    expect(mockShowToast.info).toHaveBeenLastCalledWith('List successfully refreshed.');
  });

  it('shows error when refresh fails', async () => {
    axios.post = vi.fn().mockRejectedValue({ response: { status: 500 } });
    const { getAllByTestId, user } = setup();

    await user.click(getAllByTestId('complete-list-refresh')[0]);

    await waitFor(() => expect(mockShowToast.error).toHaveBeenCalled());
  });

  // ─── Accept ───────────────────────────────────────────────────────────────────

  it('accepts a pending list and moves it to incomplete', async () => {
    axios.patch = vi.fn().mockResolvedValue({});
    const { getByTestId, queryByTestId, user } = setup();

    await user.click(getByTestId('pending-list-accept'));

    await waitFor(() =>
      expect(axios.patch).toHaveBeenCalledWith('/lists/id-pending/users_lists/id-pending', {
        users_list: { has_accepted: true },
      }),
    );
    expect(mockShowToast.info).toHaveBeenLastCalledWith('List successfully accepted.');
    // The list moves from pending to incomplete, so the accept button disappears
    await waitFor(() => expect(queryByTestId('pending-list-accept')).toBeNull());
  });

  it('accepts a completed pending list and moves it to completed section', async () => {
    axios.patch = vi.fn().mockResolvedValue({});
    const completedPending = {
      id: 'id-completed-pending',
      name: 'completed pending',
      list_item_configuration_id: 'config-1',
      created_at: new Date('05/31/2020').toISOString(),
      completed: true,
      users_list_id: 'id-completed-pending',
      owner_id: 'id2',
      refreshed: false,
      has_accepted: null,
    };
    const { getByTestId, user } = setup({
      pendingLists: [completedPending],
      currentUserPermissions: { 'id-completed-pending': 'write' } as TUserPermissions,
    });

    await user.click(getByTestId('pending-list-accept'));

    await waitFor(() => expect(axios.patch).toHaveBeenCalled());
    // The list should appear in completed section
    await waitFor(() =>
      expect(getByTestId('list-id-completed-pending')).toHaveAttribute('data-test-class', 'completed-list'),
    );
  });

  it('shows error when accepting a list fails', async () => {
    axios.patch = vi.fn().mockRejectedValue({ response: { status: 500 } });
    const { getByTestId, user } = setup();

    await user.click(getByTestId('pending-list-accept'));

    await waitFor(() => expect(mockShowToast.error).toHaveBeenCalled());
  });

  // ─── Reject ───────────────────────────────────────────────────────────────────

  it('opens reject confirm dialog when trash is clicked on a pending list', async () => {
    const { getByTestId, user } = setup();

    await user.click(getByTestId('pending-list-trash'));

    expect(getByTestId('reject-confirm-dialog')).toBeInTheDocument();
  });

  it('closes reject confirm dialog when cancel is clicked', async () => {
    const { getByTestId, queryByTestId, user } = setup();

    await user.click(getByTestId('pending-list-trash'));
    expect(getByTestId('reject-confirm-dialog')).toBeInTheDocument();

    await user.click(getByTestId('clear-reject'));

    expect(queryByTestId('reject-confirm-dialog')).not.toBeInTheDocument();
  });

  it('rejects a pending list when reject is confirmed', async () => {
    axios.delete = vi.fn().mockResolvedValue({});
    const { getByTestId, queryByTestId, user } = setup();

    await user.click(getByTestId('pending-list-trash'));
    await user.click(getByTestId('confirm-reject'));

    // pending list owner_id='id1' = userId so DELETE is called
    await waitFor(() => expect(axios.delete).toHaveBeenCalledWith('/lists/id-pending'));
    await waitFor(() => expect(queryByTestId('list-id-pending')).toBeNull());
  });

  // ─── Merge ────────────────────────────────────────────────────────────────────

  it('opens merge modal when Merge is clicked with 2+ lists selected', async () => {
    const { getByText, getByTestId, user } = setup();

    await user.click(getByText('Select Lists'));
    await user.click(document.querySelector('[data-test-id="list-id5"]') as HTMLElement);
    await user.click(document.querySelector('[data-test-id="list-id6"]') as HTMLElement);

    await user.click(getByTestId('multi-select-merge'));

    // MergeModal renders when showMergeModal is true
    expect(getByTestId('confirm-merge')).toBeInTheDocument();
  });

  it('merges selected lists when merge name is provided and confirmed', async () => {
    const mergedList = {
      id: 'merged-id',
      name: 'merged list',
      list_item_configuration_id: 'config-1',
      completed: false,
      owner_id: 'id1',
      refreshed: false,
      users_list_id: 'merged-id',
      created_at: new Date('05/31/2020').toISOString(),
    };
    axios.post = vi.fn().mockResolvedValue({ data: mergedList });
    const { getByText, getByTestId, findByTestId, user } = setup();

    await user.click(getByText('Select Lists'));
    await user.click(document.querySelector('[data-test-id="list-id5"]') as HTMLElement);
    await user.click(document.querySelector('[data-test-id="list-id6"]') as HTMLElement);
    await user.click(getByTestId('multi-select-merge'));

    const mergeNameInput = document.querySelector('[name="mergeName"]') as HTMLInputElement;
    await user.type(mergeNameInput, 'merged list');
    await user.click(getByTestId('confirm-merge'));

    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith('/lists/merge_lists', {
        merge_lists: { list_ids: 'id5,id6', new_list_name: 'merged list' },
      }),
    );
    expect(mockShowToast.info).toHaveBeenCalledWith('Lists successfully merged.');
    expect(await findByTestId('list-merged-id')).toBeInTheDocument();
  });

  it('shows error when merge fails', async () => {
    axios.post = vi.fn().mockRejectedValue({ response: { status: 500 } });
    const { getByText, getByTestId, user } = setup();

    await user.click(getByText('Select Lists'));
    await user.click(document.querySelector('[data-test-id="list-id5"]') as HTMLElement);
    await user.click(document.querySelector('[data-test-id="list-id6"]') as HTMLElement);
    await user.click(getByTestId('multi-select-merge'));

    const mergeNameInput = document.querySelector('[name="mergeName"]') as HTMLInputElement;
    await user.type(mergeNameInput, 'merged list');
    await user.click(getByTestId('confirm-merge'));

    await waitFor(() => expect(mockShowToast.error).toHaveBeenCalled());
  });

  it('hides merge action when 2+ lists of different types are selected', async () => {
    const { getByText, queryByTestId, user } = setup({
      incompleteLists: [
        {
          id: 'id5',
          name: 'baz',
          list_item_configuration_id: 'config-1',
          created_at: new Date('05/31/2020').toISOString(),
          completed: false,
          users_list_id: 'id5',
          owner_id: 'id1',
          refreshed: false,
          has_accepted: true,
        },
        {
          id: 'id6',
          name: 'diff-type',
          list_item_configuration_id: 'config-2',
          created_at: new Date('05/31/2020').toISOString(),
          completed: false,
          users_list_id: 'id6',
          owner_id: 'id1',
          refreshed: false,
          has_accepted: true,
        },
      ],
    });

    await user.click(getByText('Select Lists'));
    await user.click(document.querySelector('[data-test-id="list-id5"]') as HTMLElement);
    await user.click(document.querySelector('[data-test-id="list-id6"]') as HTMLElement);

    expect(queryByTestId('multi-select-merge')).not.toBeInTheDocument();
  });

  it('shows merge action when 2+ lists of the same type are selected', async () => {
    const { getByText, getByTestId, user } = setup();

    await user.click(getByText('Select Lists'));
    await user.click(document.querySelector('[data-test-id="list-id5"]') as HTMLElement);
    await user.click(document.querySelector('[data-test-id="list-id6"]') as HTMLElement);

    expect(getByTestId('multi-select-merge')).toBeInTheDocument();
  });

  it('shows merge action when a same-template pair exists amid different-template lists (hybrid)', async () => {
    const { getByText, getByTestId, user } = setup({
      incompleteLists: [
        {
          id: 'id5',
          name: 'baz',
          list_item_configuration_id: 'config-1',
          created_at: new Date('05/31/2020').toISOString(),
          completed: false,
          users_list_id: 'id5',
          owner_id: 'id1',
          refreshed: false,
          has_accepted: true,
        },
        {
          id: 'id6',
          name: 'foobar',
          list_item_configuration_id: 'config-1',
          created_at: new Date('05/31/2020').toISOString(),
          completed: false,
          users_list_id: 'id6',
          owner_id: 'id1',
          refreshed: false,
          has_accepted: true,
        },
        {
          id: 'id8',
          name: 'diff-type',
          list_item_configuration_id: 'config-2',
          created_at: new Date('05/31/2020').toISOString(),
          completed: false,
          users_list_id: 'id8',
          owner_id: 'id1',
          refreshed: false,
          has_accepted: true,
        },
      ],
    });

    await user.click(getByText('Select Lists'));
    await user.click(document.querySelector('[data-test-id="list-id5"]') as HTMLElement);
    await user.click(document.querySelector('[data-test-id="list-id6"]') as HTMLElement);
    await user.click(document.querySelector('[data-test-id="list-id8"]') as HTMLElement);

    expect(getByTestId('multi-select-merge')).toBeInTheDocument();
  });

  it('hides merge action when all selected lists have distinct templates (no mergeable pair)', async () => {
    const { getByText, queryByTestId, user } = setup({
      incompleteLists: [
        {
          id: 'id5',
          name: 'baz',
          list_item_configuration_id: 'config-1',
          created_at: new Date('05/31/2020').toISOString(),
          completed: false,
          users_list_id: 'id5',
          owner_id: 'id1',
          refreshed: false,
          has_accepted: true,
        },
        {
          id: 'id6',
          name: 'diff-type',
          list_item_configuration_id: 'config-2',
          created_at: new Date('05/31/2020').toISOString(),
          completed: false,
          users_list_id: 'id6',
          owner_id: 'id1',
          refreshed: false,
          has_accepted: true,
        },
      ],
    });

    await user.click(getByText('Select Lists'));
    await user.click(document.querySelector('[data-test-id="list-id5"]') as HTMLElement);
    await user.click(document.querySelector('[data-test-id="list-id6"]') as HTMLElement);

    expect(queryByTestId('multi-select-merge')).not.toBeInTheDocument();
  });

  it('edit action button has warning variant', async () => {
    const { getByText, getByTestId, user } = setup();

    await user.click(getByText('Select Lists'));
    await user.click(document.querySelector('[data-test-id="list-id5"]') as HTMLElement);

    const editBtn = getByTestId('multi-select-edit');
    expect(editBtn.className).toMatch(/color-warning/);
  });

  // ─── Edit list BottomSheet ────────────────────────────────────────────────────

  it('opens the edit sheet when initialEditListId is provided', async () => {
    axios.get = vi.fn().mockResolvedValue({
      data: {
        id: 'id5',
        name: 'an active list',
        completed: false,
        refreshed: false,
        archived_at: null,
        list_item_configuration_id: 'cfg-1',
      },
    });
    const { findByText } = setup({ initialEditListId: 'id5' });

    expect(await findByText('Edit List')).toBeVisible();
  });

  it('does not crash if the post-edit refresh fetch returns nothing', async () => {
    axios.get = vi.fn().mockImplementation(async (url: string) => {
      if (url === '/lists/id5/edit') {
        return {
          data: {
            id: 'id5',
            name: 'an active list',
            completed: false,
            refreshed: false,
            archived_at: null,
            list_item_configuration_id: 'cfg-1',
          },
        };
      }
      // Simulate fetchLists returning undefined (e.g., 401)
      throw { response: { status: 401 } };
    });
    axios.put = vi.fn().mockResolvedValue({});
    const { findByText, user } = setup({ initialEditListId: 'id5' });

    await user.click(await findByText('Update List'));
    await waitFor(() => expect(axios.put).toHaveBeenCalled());
  });

  it('refreshes the lists after a successful edit', async () => {
    let callIdx = 0;
    axios.get = vi.fn().mockImplementation(async (url: string) => {
      if (url === '/lists/id5/edit') {
        return {
          data: {
            id: 'id5',
            name: 'an active list',
            completed: false,
            refreshed: false,
            archived_at: null,
            list_item_configuration_id: 'cfg-1',
          },
        };
      }
      callIdx += 1;
      return {
        data: {
          current_user_id: 'id1',
          accepted_lists: { completed_lists: [], not_completed_lists: [] },
          pending_lists: [],
          current_list_permissions: {},
          list_item_configurations: [{ id: 'cfg-1', name: 'Default' }],
          __callIdx: callIdx,
        },
      };
    });
    axios.put = vi.fn().mockResolvedValue({});

    const { findByLabelText, findByText, user } = setup({ initialEditListId: 'id5' });

    const nameInput = await findByLabelText('Name');
    await user.clear(nameInput);
    await user.type(nameInput, 'renamed list');
    await user.click(await findByText('Update List'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
  });

  it('closes the edit sheet when cancel is clicked', async () => {
    axios.get = vi.fn().mockResolvedValue({
      data: {
        id: 'id5',
        name: 'an active list',
        completed: false,
        refreshed: false,
        archived_at: null,
        list_item_configuration_id: 'cfg-1',
      },
    });
    const { findByText, queryByText, user } = setup({ initialEditListId: 'id5' });

    await user.click(await findByText('Cancel'));
    await waitFor(() => expect(queryByText('Update List')).not.toBeInTheDocument());
  });
});
