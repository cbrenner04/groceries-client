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
    props = {
      history: {
        push: jest.fn(),
        replace: jest.fn(),
        location: {
          pathname: '/lists',
        },
      },
      userId: 1,
      pendingLists: [
        {
          id: 1,
          name: 'foo',
          type: 'GroceryList',
          created_at: new Date('05/31/2020').toISOString(),
          completed: false,
          users_list_id: 1,
          owner_id: 1,
          refreshed: false,
        },
      ],
      completedLists: [
        {
          id: 2,
          name: 'bar',
          type: 'BookList',
          created_at: new Date('05/31/2020').toISOString(),
          completed: true,
          users_list_id: 2,
          owner_id: 1,
          refreshed: false,
        },
        {
          id: 4,
          name: 'bar',
          type: 'BookList',
          created_at: new Date('05/31/2020').toISOString(),
          completed: true,
          users_list_id: 4,
          owner_id: 2,
          refreshed: false,
        },
      ],
      incompleteLists: [
        {
          id: 3,
          name: 'baz',
          type: 'MusicList',
          created_at: new Date('05/31/2020').toISOString(),
          completed: false,
          users_list_id: 3,
          owner_id: 1,
          refreshed: false,
        },
        {
          id: 5,
          name: 'foobar',
          type: 'ToDoList',
          created_at: new Date('05/31/2020').toISOString(),
          completed: false,
          users_list_id: 5,
          owner_id: 2,
          refreshed: false,
        },
      ],
      currentUserPermissions: {
        1: 'write',
        2: 'write',
        3: 'write',
        4: 'read',
        5: 'read',
      },
    };
  });

  it('renders', () => {
    const { container } = renderListsContainer(props);

    expect(container).toMatchSnapshot();
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
        id: 6,
        name: 'new list',
        type: 'BookList',
        created_at: new Date('05/31/2020').toISOString(),
        owner_id: 1,
        completed: false,
        refreshed: false,
        users_list_id: 9,
      },
    });
    const { getByLabelText, getByTestId, getByText } = renderListsContainer(props);

    fireEvent.change(getByLabelText('Name'), { target: { value: 'new list' } });
    fireEvent.change(getByLabelText('Type'), { target: { value: 'BookList' } });
    fireEvent.click(getByText('Create List'));
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List successfully added.', { type: 'info' });
    expect(getByTestId('list-6')).toHaveTextContent('new list');
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
