import React from 'react';
import { act, render, type RenderResult, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { toast } from 'react-toastify';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import axios from 'utils/api';
import { EListType, type TUserPermissions } from 'typings';

import ListsContainer, { type IListsContainerProps } from './ListsContainer';

jest.mock('react-toastify', () => ({
  toast: jest.fn(),
}));

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
        type: EListType.GROCERY_LIST,
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
        type: EListType.BOOK_LIST,
        created_at: new Date('05/31/2020').toISOString(),
        completed: true,
        users_list_id: 'id2',
        owner_id: 'id1',
        refreshed: false,
      },
      {
        id: 'id4',
        name: 'bar',
        type: EListType.BOOK_LIST,
        created_at: new Date('05/31/2020').toISOString(),
        completed: true,
        users_list_id: 'id4',
        owner_id: 'id2',
        refreshed: false,
      },
    ],
    incompleteLists: [
      {
        id: 'id3',
        name: 'baz',
        type: EListType.MUSIC_LIST,
        created_at: new Date('05/31/2020').toISOString(),
        completed: false,
        users_list_id: 'id3',
        owner_id: 'id1',
        refreshed: false,
      },
      {
        id: 'id5',
        name: 'foobar',
        type: EListType.TO_DO_LIST,
        created_at: new Date('05/31/2020').toISOString(),
        completed: false,
        users_list_id: 'id5',
        owner_id: 'id1',
        refreshed: false,
      },
    ],
    currentUserPermissions: {
      id1: 'write',
      id2: 'write',
      id3: 'write',
      id4: 'read',
      id5: 'read',
    } as TUserPermissions,
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
                type: EListType.GROCERY_LIST,
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
                type: EListType.BOOK_LIST,
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
              type: EListType.GROCERY_LIST,
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
                type: EListType.GROCERY_LIST,
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
                type: EListType.GROCERY_LIST,
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
                type: EListType.BOOK_LIST,
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
              type: EListType.GROCERY_LIST,
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
              type: EListType.BOOK_LIST,
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
            type: EListType.GROCERY_LIST,
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
    expect(toast).toHaveBeenCalledWith(
      'You may not be connected to the internet. Please check your connection. ' +
        'Data may be incomplete and user actions may not persist.',
      {
        type: 'error',
        autoClose: 5000,
      },
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
        id: 'id6',
        name: 'new list',
        type: EListType.BOOK_LIST,
        created_at: new Date('05/31/2020').toISOString(),
        owner_id: 'id1',
        completed: false,
        refreshed: false,
        users_list_id: 'id9',
      },
    });
    const { findByLabelText, findByTestId, findByText, user } = setup();

    // Click "Add List" to expand the form
    await user.click(await findByText('Add List'));

    await user.type(await findByLabelText('Name'), 'new list');
    await user.selectOptions(await findByLabelText('Type'), EListType.BOOK_LIST);
    await user.click(await findByText('Create List'));
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List successfully added.', { type: 'info' });
    expect(await findByTestId('list-id6')).toHaveTextContent('new list');
  });

  it('redirects to login when submit response is 401', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 401 } });
    const { findByLabelText, findByText, user } = setup();

    // Click "Add List" to expand the form
    await user.click(await findByText('Add List'));

    await user.type(await findByLabelText('Name'), 'new list');
    await user.selectOptions(await findByLabelText('Type'), EListType.BOOK_LIST);
    await user.click(await findByText('Create List'));
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
  });

  it('shows errors when submission fails', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 400, data: { foo: 'bar', foobar: 'foobaz' } } });
    const { findByLabelText, findByText, user } = setup();

    // Click "Add List" to expand the form
    await user.click(await findByText('Add List'));

    await user.type(await findByLabelText('Name'), 'new list');
    await user.selectOptions(await findByLabelText('Type'), EListType.BOOK_LIST);
    await user.click(await findByText('Create List'));
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and foobar foobaz', { type: 'error' });
  });

  it('shows errors when request fails', async () => {
    axios.post = jest.fn().mockRejectedValue({ request: 'failed to send request' });
    const { findByLabelText, findByText, user } = setup();

    // Click "Add List" to expand the form
    await user.click(await findByText('Add List'));

    await user.type(await findByLabelText('Name'), 'new list');
    await user.selectOptions(await findByLabelText('Type'), EListType.BOOK_LIST);
    await user.click(await findByText('Create List'));
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('shows errors when unknown error occurs', async () => {
    axios.post = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { findByLabelText, findByText, user } = setup();

    // Click "Add List" to expand the form
    await user.click(await findByText('Add List'));

    await user.type(await findByLabelText('Name'), 'new list');
    await user.selectOptions(await findByLabelText('Type'), EListType.BOOK_LIST);
    await user.click(await findByText('Create List'));
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('failed to send request', { type: 'error' });
  });
});
