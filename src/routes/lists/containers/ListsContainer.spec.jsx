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
      nonCompletedLists: [
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

  it('does not delete list when confirm modal is cleared', async () => {
    axios.delete = jest.fn().mockResolvedValue({});
    const { getAllByTestId, getByTestId, queryByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('incomplete-list-trash')[0]);
    await waitFor(() => getByTestId('clear-delete'));

    fireEvent.click(getByTestId('clear-delete'));
    await waitFor(() => expect(queryByTestId('clear-delete')).toBeNull());

    expect(toast).not.toHaveBeenCalled();
    expect(axios.delete).not.toHaveBeenCalled();
  });

  it('deletes incomplete list', async () => {
    axios.delete = jest.fn().mockResolvedValue({});
    const { getAllByTestId, getByTestId, queryByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('incomplete-list-trash')[0]);
    await waitFor(() => getByTestId('confirm-delete'));

    fireEvent.click(getByTestId('confirm-delete'));
    await waitFor(() => expect(queryByTestId('confirm-delete')).toBeNull());

    expect(toast).toHaveBeenCalledWith('List successfully deleted.', { type: 'info' });
    expect(axios.delete).toHaveBeenCalledTimes(1);
    expect(queryByTestId(`list-${props.nonCompletedLists[0].id}`)).toBeNull();
  });

  it('deletes complete list', async () => {
    axios.delete = jest.fn().mockResolvedValue({});
    const { getAllByTestId, getByTestId, queryByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('complete-list-trash')[0]);
    await waitFor(() => getByTestId('confirm-delete'));

    fireEvent.click(getByTestId('confirm-delete'));
    await waitFor(() => expect(queryByTestId('confirm-delete')).toBeNull());

    expect(toast).toHaveBeenCalledWith('List successfully deleted.', { type: 'info' });
    expect(axios.delete).toHaveBeenCalledTimes(1);
    expect(queryByTestId(`list-${props.completedLists[0].id}`)).toBeNull();
  });

  it('deletes multiple lists', async () => {
    axios.delete = jest.fn().mockResolvedValue({});
    axios.patch = jest.fn().mockResolvedValue({});
    const { getAllByTestId, getByTestId, queryByTestId, getAllByRole, getByText } = renderListsContainer(props);

    fireEvent.click(getByText('Select'));

    const checkboxes = getAllByRole('checkbox');

    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);
    fireEvent.click(checkboxes[2]);

    fireEvent.click(getAllByTestId('complete-list-trash')[0]);
    await waitFor(() => getByTestId('confirm-remove'));

    fireEvent.click(getByTestId('confirm-remove'));
    await waitFor(() => expect(queryByTestId('confirm-remove')).toBeNull());

    fireEvent.click(getByTestId('confirm-delete'));
    await waitFor(() => expect(queryByTestId('confirm-delete')).toBeNull());

    expect(toast).toHaveBeenCalledWith('Lists successfully deleted.', { type: 'info' });
    expect(axios.delete).toHaveBeenCalledTimes(2);
    expect(axios.patch).toHaveBeenCalledTimes(1);
    expect(queryByTestId(`list-${props.nonCompletedLists[0].id}`)).toBeNull();
    expect(queryByTestId(`list-${props.nonCompletedLists[1].id}`)).toBeNull();
    expect(queryByTestId(`list-${props.completedLists[0].id}`)).toBeNull();
  });

  it('redirects to login when delete fails with 401', async () => {
    axios.delete = jest.fn().mockRejectedValue({ response: { status: 401 } });
    const { getAllByTestId, getByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('incomplete-list-trash')[0]);
    await waitFor(() => getByTestId('confirm-delete'));

    fireEvent.click(getByTestId('confirm-delete'));
    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(props.history.push).toHaveBeenCalledWith('/users/sign_in');
  });

  it('shows errors when delete fails with 403', async () => {
    axios.delete = jest.fn().mockRejectedValue({ response: { status: 403 } });
    const { getAllByTestId, getByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('incomplete-list-trash')[0]);
    await waitFor(() => getByTestId('confirm-delete'));

    fireEvent.click(getByTestId('confirm-delete'));
    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
  });

  it('shows errors when delete fails with 404', async () => {
    axios.delete = jest.fn().mockRejectedValue({ response: { status: 404 } });
    const { getAllByTestId, getByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('incomplete-list-trash')[0]);
    await waitFor(() => getByTestId('confirm-delete'));

    fireEvent.click(getByTestId('confirm-delete'));
    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
  });

  it('shows errors when delete fails with error other than 401, 403, 404', async () => {
    axios.delete = jest.fn().mockRejectedValue({ response: { status: 500, data: { foo: 'bar', foobar: 'foobaz' } } });
    const { getAllByTestId, getByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('incomplete-list-trash')[0]);
    await waitFor(() => getByTestId('confirm-delete'));

    fireEvent.click(getByTestId('confirm-delete'));
    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and foobar foobaz', { type: 'error' });
  });

  it('shows errors when delete fails to send request', async () => {
    axios.delete = jest.fn().mockRejectedValue({ request: 'failed to send request' });
    const { getAllByTestId, getByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('incomplete-list-trash')[0]);
    await waitFor(() => getByTestId('confirm-delete'));

    fireEvent.click(getByTestId('confirm-delete'));
    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('shows errors when delete unknown error occurs', async () => {
    axios.delete = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { getAllByTestId, getByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('incomplete-list-trash')[0]);
    await waitFor(() => getByTestId('confirm-delete'));

    fireEvent.click(getByTestId('confirm-delete'));
    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('failed to send request', { type: 'error' });
  });

  it('completes list', async () => {
    axios.put = jest.fn().mockResolvedValue({});
    const { getAllByTestId, getByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('incomplete-list-complete')[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List successfully completed.', { type: 'info' });
    expect(getByTestId('list-3')).toHaveAttribute('data-test-class', 'completed-list');
  });

  it('completes multiple lists', async () => {
    axios.put = jest.fn().mockResolvedValue({});
    const { getAllByTestId, getByTestId, getAllByRole, getByText } = renderListsContainer(props);

    fireEvent.click(getByText('Select'));

    const checkboxes = getAllByRole('checkbox');

    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);
    fireEvent.click(checkboxes[2]);
    fireEvent.click(getAllByTestId('incomplete-list-complete')[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(2)); // one list is already complete

    expect(toast).toHaveBeenCalledWith('Lists successfully completed.', { type: 'info' });
    expect(getByTestId('list-2')).toHaveAttribute('data-test-class', 'completed-list');
    expect(getByTestId('list-3')).toHaveAttribute('data-test-class', 'completed-list');
    expect(getByTestId('list-5')).toHaveAttribute('data-test-class', 'completed-list');
  });

  it('redirects on 401 from list completion', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 401 } });
    const { getAllByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('incomplete-list-complete')[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(props.history.push).toHaveBeenCalledWith('/users/sign_in');
  });

  it('shows error on 403 from list completion', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 403 } });
    const { getAllByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('incomplete-list-complete')[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
  });

  it('shows errors on 404 from list completion', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 404 } });
    const { getAllByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('incomplete-list-complete')[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
  });

  it('shows errors when error not 401, 403, 404 from list completion', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 500, data: { foo: 'bar', foobar: 'foobaz' } } });
    const { getAllByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('incomplete-list-complete')[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and foobar foobaz', { type: 'error' });
  });

  it('shows errors when request fails from list completion', async () => {
    axios.put = jest.fn().mockRejectedValue({ request: 'failed to send request' });
    const { getAllByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('incomplete-list-complete')[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('shows errors when known failure from list completion', async () => {
    axios.put = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { getAllByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('incomplete-list-complete')[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('failed to send request', { type: 'error' });
  });

  it('refreshes list', async () => {
    axios.post = jest.fn().mockResolvedValue({
      data: {
        id: 6,
        name: 'new list',
        type: 'BookList',
        created_at: new Date('05/31/2020').toISOString(),
        owner_id: 1,
        completed: false,
        refreshed: false,
      },
    });
    const { getAllByTestId, getByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('complete-list-refresh')[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List successfully refreshed.', { type: 'info' });
    expect(getByTestId('list-6')).toHaveAttribute('data-test-class', 'non-completed-list');
  });

  it('refreshes multiple lists', async () => {
    axios.post = jest.fn().mockResolvedValueOnce({
      data: {
        id: 6,
        name: 'new list',
        type: 'BookList',
        created_at: new Date('05/31/2020').toISOString(),
        owner_id: 1,
        completed: false,
        refreshed: false,
      },
    });
    const { getAllByTestId, getByTestId, getAllByRole, getByText } = renderListsContainer(props);

    fireEvent.click(getByText('Select'));

    const checkboxes = getAllByRole('checkbox');

    fireEvent.click(checkboxes[1]);
    fireEvent.click(checkboxes[2]);
    fireEvent.click(checkboxes[3]);

    fireEvent.click(getAllByTestId('complete-list-refresh')[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List successfully refreshed.', { type: 'info' });
    expect(getByTestId('list-2')).toHaveAttribute('data-test-class', 'completed-list');
    expect(getByTestId('list-3')).toHaveAttribute('data-test-class', 'non-completed-list');
    expect(getByTestId('list-6')).toHaveAttribute('data-test-class', 'non-completed-list');
  });

  it('redirects on 401 from list refresh', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 401 } });
    const { getAllByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('complete-list-refresh')[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(props.history.push).toHaveBeenCalledWith('/users/sign_in');
  });

  it('shows error on 403 from list refresh', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 403 } });
    const { getAllByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('complete-list-refresh')[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
  });

  it('shows errors on 404 from list refresh', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 404 } });
    const { getAllByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('complete-list-refresh')[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
  });

  it('shows errors when error not 401, 403, 404 from list refresh', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 500, data: { foo: 'bar', foobar: 'foobaz' } } });
    const { getAllByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('complete-list-refresh')[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and foobar foobaz', { type: 'error' });
  });

  it('shows errors when request fails from list refresh', async () => {
    axios.post = jest.fn().mockRejectedValue({ request: 'failed to send request' });
    const { getAllByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('complete-list-refresh')[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('shows errors when known failure from list refresh', async () => {
    axios.post = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { getAllByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('complete-list-refresh')[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('failed to send request', { type: 'error' });
  });

  it('accepts incomplete list', async () => {
    axios.patch = jest.fn().mockResolvedValue({});
    const { getAllByTestId, getByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('pending-list-accept')[0]);
    await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List successfully accepted.', { type: 'info' });
    expect(getByTestId('list-1')).toHaveAttribute('data-test-class', 'non-completed-list');
  });

  it('accepts complete list', async () => {
    props.pendingLists[0].completed = true;
    axios.patch = jest.fn().mockResolvedValue({});
    const { getAllByTestId, getByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('pending-list-accept')[0]);
    await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List successfully accepted.', { type: 'info' });
    expect(getByTestId('list-1')).toHaveAttribute('data-test-class', 'completed-list');
  });

  it('redirects on 401 from list refresh', async () => {
    axios.patch = jest.fn().mockRejectedValue({ response: { status: 401 } });
    const { getAllByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('pending-list-accept')[0]);
    await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(props.history.push).toHaveBeenCalledWith('/users/sign_in');
  });

  it('shows error on 403 from list refresh', async () => {
    axios.patch = jest.fn().mockRejectedValue({ response: { status: 403 } });
    const { getAllByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('pending-list-accept')[0]);
    await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
  });

  it('shows errors on 404 from list refresh', async () => {
    axios.patch = jest.fn().mockRejectedValue({ response: { status: 404 } });
    const { getAllByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('pending-list-accept')[0]);
    await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
  });

  it('shows errors when error not 401, 403, 404 from list refresh', async () => {
    axios.patch = jest.fn().mockRejectedValue({ response: { status: 500, data: { foo: 'bar', foobar: 'foobaz' } } });
    const { getAllByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('pending-list-accept')[0]);
    await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and foobar foobaz', { type: 'error' });
  });

  it('shows errors when request fails from list refresh', async () => {
    axios.patch = jest.fn().mockRejectedValue({ request: 'failed to send request' });
    const { getAllByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('pending-list-accept')[0]);
    await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('shows errors when known failure from list refresh', async () => {
    axios.patch = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { getAllByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('pending-list-accept')[0]);
    await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('failed to send request', { type: 'error' });
  });

  it('does not reject list when confirm modal is cleared', async () => {
    axios.patch = jest.fn().mockResolvedValue({});
    const { getAllByTestId, getByTestId, queryByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('pending-list-trash')[0]);
    await waitFor(() => getByTestId('clear-reject'));

    fireEvent.click(getByTestId('clear-reject'));
    await waitFor(() => expect(queryByTestId('clear-reject')).toBeNull());

    expect(toast).not.toHaveBeenCalled();
    expect(axios.patch).not.toHaveBeenCalled();
  });

  it('rejects list', async () => {
    axios.patch = jest.fn().mockResolvedValue({});
    const { getAllByTestId, getByTestId, queryByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('pending-list-trash')[0]);
    await waitFor(() => getByTestId('confirm-reject'));

    fireEvent.click(getByTestId('confirm-reject'));
    await waitFor(() => expect(queryByTestId('confirm-reject')).toBeNull());

    expect(toast).toHaveBeenCalledWith('List successfully rejected.', { type: 'info' });
    expect(axios.patch).toHaveBeenCalledTimes(1);
    expect(queryByTestId(`list-${props.pendingLists[0].id}`)).toBeNull();
  });

  it('redirects to login when reject fails with 401', async () => {
    axios.patch = jest.fn().mockRejectedValue({ response: { status: 401 } });
    const { getAllByTestId, getByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('pending-list-trash')[0]);
    await waitFor(() => getByTestId('confirm-reject'));

    fireEvent.click(getByTestId('confirm-reject'));
    await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(props.history.push).toHaveBeenCalledWith('/users/sign_in');
  });

  it('shows errors when reject fails with 403', async () => {
    axios.patch = jest.fn().mockRejectedValue({ response: { status: 403 } });
    const { getAllByTestId, getByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('pending-list-trash')[0]);
    await waitFor(() => getByTestId('confirm-reject'));

    fireEvent.click(getByTestId('confirm-reject'));
    await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
  });

  it('shows errors when reject fails with 404', async () => {
    axios.patch = jest.fn().mockRejectedValue({ response: { status: 404 } });
    const { getAllByTestId, getByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('pending-list-trash')[0]);
    await waitFor(() => getByTestId('confirm-reject'));

    fireEvent.click(getByTestId('confirm-reject'));
    await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
  });

  it('shows errors when reject fails with error other than 401, 403, 404', async () => {
    axios.patch = jest.fn().mockRejectedValue({ response: { status: 500, data: { foo: 'bar', foobar: 'foobaz' } } });
    const { getAllByTestId, getByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('pending-list-trash')[0]);
    await waitFor(() => getByTestId('confirm-reject'));

    fireEvent.click(getByTestId('confirm-reject'));
    await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and foobar foobaz', { type: 'error' });
  });

  it('shows errors when reject fails to send request', async () => {
    axios.patch = jest.fn().mockRejectedValue({ request: 'failed to send request' });
    const { getAllByTestId, getByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('pending-list-trash')[0]);
    await waitFor(() => getByTestId('confirm-reject'));

    fireEvent.click(getByTestId('confirm-reject'));
    await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('shows errors when reject unknown error occurs', async () => {
    axios.patch = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { getAllByTestId, getByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('pending-list-trash')[0]);
    await waitFor(() => getByTestId('confirm-reject'));

    fireEvent.click(getByTestId('confirm-reject'));
    await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('failed to send request', { type: 'error' });
  });

  it('does not remove list when confirm modal is cleared', async () => {
    axios.patch = jest.fn().mockResolvedValue({});
    const { getAllByTestId, getByTestId, queryByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('incomplete-list-trash')[1]);
    await waitFor(() => getByTestId('clear-remove'));

    fireEvent.click(getByTestId('clear-remove'));
    await waitFor(() => expect(queryByTestId('clear-remove')).toBeNull());

    expect(toast).not.toHaveBeenCalled();
    expect(axios.patch).not.toHaveBeenCalled();
  });

  it('removes incomplete list', async () => {
    axios.patch = jest.fn().mockResolvedValue({});
    const { getAllByTestId, getByTestId, queryByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('incomplete-list-trash')[1]);
    await waitFor(() => getByTestId('confirm-remove'));

    fireEvent.click(getByTestId('confirm-remove'));
    await waitFor(() => expect(queryByTestId('confirm-remove')).toBeNull());

    expect(toast).toHaveBeenCalledWith('List successfully removed.', { type: 'info' });
    expect(axios.patch).toHaveBeenCalledTimes(1);
    expect(queryByTestId(`list-${props.nonCompletedLists[1].id}`)).toBeNull();
  });

  it('removes complete list', async () => {
    axios.patch = jest.fn().mockResolvedValue({});
    const { getAllByTestId, getByTestId, queryByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('complete-list-trash')[1]);
    await waitFor(() => getByTestId('confirm-remove'));

    fireEvent.click(getByTestId('confirm-remove'));
    await waitFor(() => expect(queryByTestId('confirm-remove')).toBeNull());

    expect(toast).toHaveBeenCalledWith('List successfully removed.', { type: 'info' });
    expect(axios.patch).toHaveBeenCalledTimes(1);
    expect(queryByTestId(`list-${props.completedLists[1].id}`)).toBeNull();
  });

  it('redirects to login when remove fails with 401', async () => {
    axios.patch = jest.fn().mockRejectedValue({ response: { status: 401 } });
    const { getAllByTestId, getByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('incomplete-list-trash')[1]);
    await waitFor(() => getByTestId('confirm-remove'));

    fireEvent.click(getByTestId('confirm-remove'));
    await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(props.history.push).toHaveBeenCalledWith('/users/sign_in');
  });

  it('shows errors when remove fails with 403', async () => {
    axios.patch = jest.fn().mockRejectedValue({ response: { status: 403 } });
    const { getAllByTestId, getByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('incomplete-list-trash')[1]);
    await waitFor(() => getByTestId('confirm-remove'));

    fireEvent.click(getByTestId('confirm-remove'));
    await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
  });

  it('shows errors when remove fails with 404', async () => {
    axios.patch = jest.fn().mockRejectedValue({ response: { status: 404 } });
    const { getAllByTestId, getByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('incomplete-list-trash')[1]);
    await waitFor(() => getByTestId('confirm-remove'));

    fireEvent.click(getByTestId('confirm-remove'));
    await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
  });

  it('shows errors when remove fails with error other than 401, 403, 404', async () => {
    axios.patch = jest.fn().mockRejectedValue({ response: { status: 500, data: { foo: 'bar', foobar: 'foobaz' } } });
    const { getAllByTestId, getByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('incomplete-list-trash')[1]);
    await waitFor(() => getByTestId('confirm-remove'));

    fireEvent.click(getByTestId('confirm-remove'));
    await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and foobar foobaz', { type: 'error' });
  });

  it('shows errors when remove fails to send request', async () => {
    axios.patch = jest.fn().mockRejectedValue({ request: 'failed to send request' });
    const { getAllByTestId, getByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('incomplete-list-trash')[1]);
    await waitFor(() => getByTestId('confirm-remove'));

    fireEvent.click(getByTestId('confirm-remove'));
    await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('shows errors when remove unknown error occurs', async () => {
    axios.patch = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { getAllByTestId, getByTestId } = renderListsContainer(props);

    fireEvent.click(getAllByTestId('incomplete-list-trash')[1]);
    await waitFor(() => getByTestId('confirm-remove'));

    fireEvent.click(getByTestId('confirm-remove'));
    await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('failed to send request', { type: 'error' });
  });

  it('shows merge button when multi select', async () => {
    const { container, getByText, getAllByTestId } = renderListsContainer(props);

    fireEvent.click(getByText('Select'));
    await waitFor(() => getByText('Hide Select'));

    expect(container).toMatchSnapshot();
    expect(getAllByTestId('incomplete-list-merge')).toHaveLength(2);
  });

  it('shows modal to set the new list name for merging and clears', async () => {
    const { container, getAllByRole, getByTestId, getAllByTestId, queryByTestId, getByText } = renderListsContainer(
      props,
    );

    fireEvent.click(getByText('Select'));
    await waitFor(() => getByText('Hide Select'));

    fireEvent.click(getAllByRole('checkbox')[0]);
    fireEvent.click(getAllByRole('checkbox')[1]);
    fireEvent.click(getAllByTestId('incomplete-list-merge')[0]);

    expect(container).toMatchSnapshot();
    expect(getByTestId('clear-merge')).toBeVisible();
    expect(getByTestId('confirm-merge')).toBeVisible();

    fireEvent.click(getByTestId('clear-merge'));

    await waitFor(() => expect(queryByTestId('clear-merge')).toBeNull());

    expect(queryByTestId('confirm-merge')).toBeNull();
  });

  it('only merges lists of the same type', async () => {
    axios.post = jest.fn().mockResolvedValue({
      data: {
        archived_at: null,
        completed: false,
        created_at: '2020-08-03T08:42:13.331-05:00',
        has_accepted: true,
        id: 17,
        name: 'a',
        owner_id: 1,
        refreshed: false,
        type: 'MusicList',
        updated_at: '2020-08-03T08:42:13.331-05:00',
        user_id: 1,
        users_list_id: 29,
      },
    });
    const { getByLabelText, getAllByRole, getByTestId, getAllByTestId, getByText } = renderListsContainer(props);

    fireEvent.click(getByText('Select'));
    await waitFor(() => getByText('Hide Select'));

    fireEvent.click(getAllByRole('checkbox')[0]);
    fireEvent.click(getAllByRole('checkbox')[1]);
    fireEvent.click(getAllByTestId('incomplete-list-merge')[0]);
    fireEvent.change(getByLabelText('Name for the merged list'), { target: { value: 'a' } });

    expect(getByLabelText('Name for the merged list')).toHaveValue('a');

    await waitFor(() => expect(getByTestId('confirm-merge')).not.toBeDisabled());

    fireEvent.click(getByTestId('confirm-merge'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(axios.post).toHaveBeenCalledWith('/lists/merge_lists', {
      merge_lists: { list_ids: '3', new_list_name: 'a' },
    });
    expect(getByTestId('list-17')).toBeVisible();
  });

  it('shows errors when merge fails with 403', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 403 } });
    const { getByLabelText, getAllByRole, getByTestId, getAllByTestId, getByText } = renderListsContainer(props);

    fireEvent.click(getByText('Select'));
    await waitFor(() => getByText('Hide Select'));

    fireEvent.click(getAllByRole('checkbox')[0]);
    fireEvent.click(getAllByRole('checkbox')[1]);
    fireEvent.click(getAllByTestId('incomplete-list-merge')[0]);
    fireEvent.change(getByLabelText('Name for the merged list'), { target: { value: 'a' } });

    expect(getByLabelText('Name for the merged list')).toHaveValue('a');

    await waitFor(() => expect(getByTestId('confirm-merge')).not.toBeDisabled());

    fireEvent.click(getByTestId('confirm-merge'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
  });

  it('shows errors when merge fails with 404', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 404 } });
    const { getByLabelText, getAllByRole, getByTestId, getAllByTestId, getByText } = renderListsContainer(props);

    fireEvent.click(getByText('Select'));
    await waitFor(() => getByText('Hide Select'));

    fireEvent.click(getAllByRole('checkbox')[0]);
    fireEvent.click(getAllByRole('checkbox')[1]);
    fireEvent.click(getAllByTestId('incomplete-list-merge')[0]);
    fireEvent.change(getByLabelText('Name for the merged list'), { target: { value: 'a' } });

    expect(getByLabelText('Name for the merged list')).toHaveValue('a');

    await waitFor(() => expect(getByTestId('confirm-merge')).not.toBeDisabled());

    fireEvent.click(getByTestId('confirm-merge'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
  });

  it('shows errors when merge fails with error other than 401, 403, 404', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 500, data: { foo: 'bar', foobar: 'foobaz' } } });
    const { getByLabelText, getAllByRole, getByTestId, getAllByTestId, getByText } = renderListsContainer(props);

    fireEvent.click(getByText('Select'));
    await waitFor(() => getByText('Hide Select'));

    fireEvent.click(getAllByRole('checkbox')[0]);
    fireEvent.click(getAllByRole('checkbox')[1]);
    fireEvent.click(getAllByTestId('incomplete-list-merge')[0]);
    fireEvent.change(getByLabelText('Name for the merged list'), { target: { value: 'a' } });

    expect(getByLabelText('Name for the merged list')).toHaveValue('a');

    await waitFor(() => expect(getByTestId('confirm-merge')).not.toBeDisabled());

    fireEvent.click(getByTestId('confirm-merge'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and foobar foobaz', { type: 'error' });
  });

  it('shows errors when merge fails to send request', async () => {
    axios.post = jest.fn().mockRejectedValue({ request: 'failed to send request' });
    const { getByLabelText, getAllByRole, getByTestId, getAllByTestId, getByText } = renderListsContainer(props);

    fireEvent.click(getByText('Select'));
    await waitFor(() => getByText('Hide Select'));

    fireEvent.click(getAllByRole('checkbox')[0]);
    fireEvent.click(getAllByRole('checkbox')[1]);
    fireEvent.click(getAllByTestId('incomplete-list-merge')[0]);
    fireEvent.change(getByLabelText('Name for the merged list'), { target: { value: 'a' } });

    expect(getByLabelText('Name for the merged list')).toHaveValue('a');

    await waitFor(() => expect(getByTestId('confirm-merge')).not.toBeDisabled());

    fireEvent.click(getByTestId('confirm-merge'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('shows errors when merge unknown error occurs', async () => {
    axios.post = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { getByLabelText, getAllByRole, getByTestId, getAllByTestId, getByText } = renderListsContainer(props);

    fireEvent.click(getByText('Select'));
    await waitFor(() => getByText('Hide Select'));

    fireEvent.click(getAllByRole('checkbox')[0]);
    fireEvent.click(getAllByRole('checkbox')[1]);
    fireEvent.click(getAllByTestId('incomplete-list-merge')[0]);
    fireEvent.change(getByLabelText('Name for the merged list'), { target: { value: 'a' } });

    expect(getByLabelText('Name for the merged list')).toHaveValue('a');

    await waitFor(() => expect(getByTestId('confirm-merge')).not.toBeDisabled());

    fireEvent.click(getByTestId('confirm-merge'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('failed to send request', { type: 'error' });
  });

  // using fake timers seemed to have affected other tests so keeping it separated
  describe('loading state when certain actions are pending', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.clearAllTimers();
    });

    it('renders Loading when refresh pending', async () => {
      // not resolving to keep in pending state
      axios.post = jest.fn().mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
      const { getAllByTestId, getByRole } = renderListsContainer(props);

      fireEvent.click(getAllByTestId('complete-list-refresh')[0]);
      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

      expect(getByRole('status')).toBeVisible();
    });

    it('shows loading when merge is pending', async () => {
      // not resolving to keep in pending state
      axios.post = jest.fn().mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
      const { getByLabelText, getByRole, getAllByRole, getByTestId, getAllByTestId, getByText } = renderListsContainer(
        props,
      );

      fireEvent.click(getByText('Select'));
      await waitFor(() => getByText('Hide Select'));

      fireEvent.click(getAllByRole('checkbox')[0]);
      fireEvent.click(getAllByRole('checkbox')[1]);
      fireEvent.click(getAllByTestId('incomplete-list-merge')[0]);
      fireEvent.change(getByLabelText('Name for the merged list'), { target: { value: 'a' } });

      expect(getByLabelText('Name for the merged list')).toHaveValue('a');

      await waitFor(() => expect(getByTestId('confirm-merge')).not.toBeDisabled());

      fireEvent.click(getByTestId('confirm-merge'));

      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

      expect(getByRole('status')).toBeVisible();
    });
  });
});
