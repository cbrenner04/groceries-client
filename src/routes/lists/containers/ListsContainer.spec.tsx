import React from 'react';
import { act, render, type RenderResult, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import axios from 'utils/api';
import type { TUserPermissions } from 'typings';

// Mock listPrefetch at module level
jest.mock('utils/listPrefetch', () => ({
  prefetchListsIdle: jest.fn(() => Promise.resolve()),
  prefetchList: jest.fn(() => Promise.resolve()),
  getPrefetchedList: jest.fn(() => null),
}));

// eslint-disable-next-line import/first
import ListsContainer, { type IListsContainerProps } from './ListsContainer';

// Mock the new toast utilities
const mockShowToast = jest.requireMock('../../../utils/toast').showToast;

const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: (): jest.Mock => mockNavigate,
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
        id: 'id1',
        name: 'foo',
        list_item_configuration_id: 'config-1',
        created_at: new Date('05/31/2020').toISOString(),
        completed: false,
        users_list_id: 'id1',
        owner_id: 'id1',
        refreshed: false,
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
      },
    ],
    currentUserPermissions: {
      id1: 'write',
      id2: 'write',
      id5: 'write',
      id4: 'read',
      id6: 'read',
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
  it('renders', () => {
    const { container } = setup();

    expect(container).toMatchSnapshot();
  });

  it('updates via polling when different data is returned', async () => {
    // messes with `userEvent` actions
    jest.useFakeTimers();
    axios.get = jest
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
            id3: 'write',
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
                completed: false,
                refreshed: false,
                owner_id: 'id2',
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
      jest.advanceTimersByTime(10000);
    });

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(await findByTestId('list-id3')).toHaveAttribute('data-test-class', 'pending-list');

    await act(async () => {
      jest.advanceTimersByTime(10000);
    });

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    expect(await findByTestId('list-id3')).toHaveAttribute('data-test-class', 'completed-list');
    jest.useRealTimers();
  });

  it('does not update via polling when different data is not returned', async () => {
    // messes with `userEvent` actions
    jest.useFakeTimers();
    axios.get = jest.fn().mockResolvedValue({
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
          id3: 'write',
        },
        list_item_configurations: [{ id: 'config-1', name: 'grocery list template' }],
      },
    });

    const { findByTestId } = setup();

    await act(async () => {
      jest.advanceTimersByTime(10000);
    });

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(await findByTestId('list-id3')).toHaveAttribute('data-test-class', 'pending-list');

    await act(async () => {
      jest.advanceTimersByTime(10000);
    });

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    expect(await findByTestId('list-id3')).toHaveAttribute('data-test-class', 'pending-list');
    jest.useRealTimers();
  });

  it('fires generic toast when unknown error on usePolling', async () => {
    jest.useFakeTimers();
    axios.get = jest.fn().mockRejectedValue({ response: { status: 500 } });
    setup();

    await act(async () => {
      jest.advanceTimersByTime(10000);
    });

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(mockShowToast.error).toHaveBeenCalledWith(
      'You may not be connected to the internet. Please check your connection. ' +
        'Data may be incomplete and user actions may not persist.',
    );
    jest.useRealTimers();
  });

  it('does not render pending lists when they do not exist', () => {
    const { container, queryByText } = setup({ pendingLists: [] });

    expect(container).toMatchSnapshot();
    expect(queryByText('Pending')).toBeNull();
  });

  it('creates list on form submit', async () => {
    axios.post = jest.fn().mockResolvedValue({
      data: {
        id: 'id7',
        name: 'new list',
        list_item_configuration_id: 'config-1',
        created_at: new Date('05/31/2020').toISOString(),
        owner_id: 'id1',
        completed: false,
        refreshed: false,
        users_list_id: 'id9',
      },
    });
    const { findByLabelText, findByTestId, findByText, user } = setup();

    await user.type(await findByLabelText('Name'), 'new list');
    await user.selectOptions(await findByLabelText('Template'), 'book list template');
    await user.click(await findByText('Create List'));
    await act(async () => {
      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    });

    expect(mockShowToast.info).toHaveBeenCalledWith('List successfully added.');
    expect(await findByTestId('list-id7')).toHaveTextContent('new list');
  });

  it('redirects to login when submit response is 401', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 401 } });
    const { findByLabelText, findByText, user } = setup();

    await user.type(await findByLabelText('Name'), 'new list');
    await user.selectOptions(await findByLabelText('Template'), 'book list template');
    await user.click(await findByText('Create List'));
    await act(async () => {
      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    });

    expect(mockShowToast.error).toHaveBeenCalledWith('You must sign in');
    expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
  });

  it('shows errors when submission fails', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 400, data: { foo: 'bar', foobar: 'foobaz' } } });
    const { findByLabelText, findByText, user } = setup();

    await user.type(await findByLabelText('Name'), 'new list');
    await user.selectOptions(await findByLabelText('Template'), 'book list template');
    await user.click(await findByText('Create List'));
    await act(async () => {
      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    });

    expect(mockShowToast.error).toHaveBeenCalledWith('foo bar and foobar foobaz');
  });

  it('shows errors when request fails', async () => {
    axios.post = jest.fn().mockRejectedValue({ request: 'failed to send request' });
    const { findByLabelText, findByText, user } = setup();

    await user.type(await findByLabelText('Name'), 'new list');
    await user.selectOptions(await findByLabelText('Template'), 'book list template');
    await user.click(await findByText('Create List'));
    await act(async () => {
      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    });

    expect(mockShowToast.error).toHaveBeenCalledWith('Something went wrong');
  });

  it('shows errors when unknown error occurs', async () => {
    axios.post = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { findByLabelText, findByText, user } = setup();

    await user.type(await findByLabelText('Name'), 'new list');
    await user.selectOptions(await findByLabelText('Template'), 'book list template');
    await user.click(await findByText('Create List'));
    await act(async () => {
      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    });

    expect(mockShowToast.error).toHaveBeenCalledWith('failed to send request');
  });

  describe('prefetch logic', () => {
    let mockPrefetchListsIdle: jest.Mock;
    const originalPrefetchIdle = process.env.REACT_APP_PREFETCH_IDLE;

    beforeEach(() => {
      // Ensure prefetch is enabled for tests
      process.env.REACT_APP_PREFETCH_IDLE = 'true';
      // Get the mocked function
      const listPrefetchModule = require('utils/listPrefetch');
      mockPrefetchListsIdle = listPrefetchModule.prefetchListsIdle as jest.Mock;
      mockPrefetchListsIdle.mockClear();
    });

    afterEach(() => {
      mockPrefetchListsIdle.mockClear();
      process.env.REACT_APP_PREFETCH_IDLE = originalPrefetchIdle;
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

      // Wait for useEffect to run (lines 99-107)
      await act(async () => {
        await waitFor(() => {
          expect(mockPrefetchListsIdle).toHaveBeenCalled();
        }, { timeout: 2000 });
      });

      // Verify prefetch was called with list IDs from pendingLists and incompleteLists
      expect(mockPrefetchListsIdle).toHaveBeenCalledWith(['id1', 'id5', 'id6']);
    });

    it('limits prefetch to MAX_PREFETCH_LISTS (5)', async () => {
      // Create 7 lists (more than MAX_PREFETCH_LISTS)
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
        await waitFor(() => {
          expect(mockPrefetchListsIdle).toHaveBeenCalled();
        }, { timeout: 2000 });
      });

      // Should only prefetch first 5 lists (line 101: slice(0, MAX_PREFETCH_LISTS))
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
        await waitFor(() => {
          expect(mockPrefetchListsIdle).toHaveBeenCalled();
        }, { timeout: 2000 });
      });

      // Should only prefetch lists with valid IDs (line 102: filter with type guard)
      expect(mockPrefetchListsIdle).toHaveBeenCalledWith(['id1']);
    });

    it('does not prefetch when listIds is empty', async () => {
      setup({
        pendingLists: [],
        incompleteLists: [],
      });

      // Wait a bit to ensure useEffect has run
      await waitFor(() => {
        // prefetchListsIdle should not be called when there are no lists (line 105: if (listIds.length > 0))
        expect(mockPrefetchListsIdle).not.toHaveBeenCalled();
      }, { timeout: 100 });
    });
  });
});
