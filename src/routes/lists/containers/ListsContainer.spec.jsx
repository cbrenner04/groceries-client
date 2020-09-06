import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { toast } from 'react-toastify';

import ListsContainer from './ListsContainer';
import axios from '../../../utils/api';

jest.mock('react-toastify', () => ({
  toast: jest.fn(),
}));

describe('ListsContainer', () => {
  let props;
  const renderListsContainer = (props) => {
    const history = createMemoryHistory();
    return render(
      <Router history={history}>
        <ListsContainer {...props} />
      </Router>,
    );
  };

  beforeEach(() => {
    jest.useFakeTimers();
    props = {
      history: {
        push: jest.fn(),
        replace: jest.fn(),
        location: {
          pathname: '/lists',
        },
      },
      userId: 'id1',
      pendingLists: [
        {
          id: 'id1',
          name: 'foo',
          type: 'GroceryList',
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
          type: 'BookList',
          created_at: new Date('05/31/2020').toISOString(),
          completed: true,
          users_list_id: 'id2',
          owner_id: 'id1',
          refreshed: false,
        },
        {
          id: 'id4',
          name: 'bar',
          type: 'BookList',
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
          type: 'MusicList',
          created_at: new Date('05/31/2020').toISOString(),
          completed: false,
          users_list_id: 'id3',
          owner_id: 'id1',
          refreshed: false,
        },
        {
          id: 'id5',
          name: 'foobar',
          type: 'ToDoList',
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
      },
    };
  });

  it('renders', () => {
    const { container } = renderListsContainer(props);

    expect(container).toMatchSnapshot();
  });

  it('updates via polling when different data is returned', async () => {
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
                type: 'GroceryList',
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
                type: 'BookList',
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
              type: 'GroceryList',
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
                type: 'GroceryList',
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
                type: 'GroceryList',
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
                type: 'BookList',
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

    const { getByTestId } = renderListsContainer(props);

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(getByTestId('list-id3')).toHaveAttribute('data-test-class', 'pending-list');

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    expect(getByTestId('list-id3')).toHaveAttribute('data-test-class', 'completed-list');
  });

  it('does not update via polling when different data is not returned', async () => {
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
              type: 'GroceryList',
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
              type: 'BookList',
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
            type: 'GroceryList',
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

    const { getByTestId } = renderListsContainer(props);

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(getByTestId('list-id3')).toHaveAttribute('data-test-class', 'pending-list');

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    expect(getByTestId('list-id3')).toHaveAttribute('data-test-class', 'pending-list');
  });

  it('does not render pending lists when they do not exist', () => {
    props.pendingLists = [];
    const { container, queryByText } = renderListsContainer(props);

    expect(container).toMatchSnapshot();
    expect(queryByText('Pending')).toBeNull();
  });

  it('creates list on form submit', async () => {
    axios.post = jest.fn().mockResolvedValue({
      data: {
        id: 'id6',
        name: 'new list',
        type: 'BookList',
        created_at: new Date('05/31/2020').toISOString(),
        owner_id: 'id1',
        completed: false,
        refreshed: false,
        users_list_id: 'id9',
      },
    });
    const { getByLabelText, getByTestId, getByText } = renderListsContainer(props);

    fireEvent.change(getByLabelText('Name'), { target: { value: 'new list' } });
    fireEvent.change(getByLabelText('Type'), { target: { value: 'BookList' } });
    fireEvent.click(getByText('Create List'));
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List successfully added.', { type: 'info' });
    expect(getByTestId('list-id6')).toHaveTextContent('new list');
  });

  it('redirects to login when submit response is 401', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 401 } });
    const { getByLabelText, getByText } = renderListsContainer(props);

    fireEvent.change(getByLabelText('Name'), { target: { value: 'new list' } });
    fireEvent.change(getByLabelText('Type'), { target: { value: 'BookList' } });
    fireEvent.click(getByText('Create List'));
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(props.history.push).toHaveBeenCalledWith('/users/sign_in');
  });

  it('shows errors when submission fails', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 400, data: { foo: 'bar', foobar: 'foobaz' } } });
    const { getByLabelText, getByText } = renderListsContainer(props);

    fireEvent.change(getByLabelText('Name'), { target: { value: 'new list' } });
    fireEvent.change(getByLabelText('Type'), { target: { value: 'BookList' } });
    fireEvent.click(getByText('Create List'));
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and foobar foobaz', { type: 'error' });
  });

  it('shows errors when request fails', async () => {
    axios.post = jest.fn().mockRejectedValue({ request: 'failed to send request' });
    const { getByLabelText, getByText } = renderListsContainer(props);

    fireEvent.change(getByLabelText('Name'), { target: { value: 'new list' } });
    fireEvent.change(getByLabelText('Type'), { target: { value: 'BookList' } });
    fireEvent.click(getByText('Create List'));
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('shows errors when unknown error occurs', async () => {
    axios.post = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { getByLabelText, getByText } = renderListsContainer(props);

    fireEvent.change(getByLabelText('Name'), { target: { value: 'new list' } });
    fireEvent.change(getByLabelText('Type'), { target: { value: 'BookList' } });
    fireEvent.click(getByText('Create List'));
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('failed to send request', { type: 'error' });
  });
});
