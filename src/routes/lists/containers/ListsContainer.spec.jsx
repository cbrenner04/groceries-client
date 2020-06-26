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
      ],
      currentUserPermissions: {
        1: 'write',
        2: 'write',
        3: 'write',
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
        id: 4,
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
    expect(getByTestId('list-4')).toHaveTextContent('new list');
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
        id: 4,
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
    expect(getByTestId('list-4')).toHaveAttribute('data-test-class', 'non-completed-list');
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

  it('does not rejects list when confirm modal is cleared', async () => {
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
});
