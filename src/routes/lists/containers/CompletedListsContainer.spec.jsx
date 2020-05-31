import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { toast } from 'react-toastify';

import CompletedListsContainer from './CompletedListsContainer';
import axios from '../../../utils/api';

jest.mock('react-toastify', () => ({
  toast: jest.fn(),
}));

describe('CompletedListsContainer', () => {
  let props;
  const renderCompletedListsContainer = (props) => {
    const history = createMemoryHistory();
    return render(
      <Router history={history}>
        <CompletedListsContainer {...props} />
      </Router>,
    );
  };

  beforeEach(() => {
    props = {
      history: {
        push: jest.fn(),
      },
      completedLists: [
        {
          id: 1,
          name: 'foo',
          type: 'GroceryList',
          created_at: new Date('05/28/2020').toISOString(),
          completed: true,
          users_list_id: 1,
          owner_id: 1,
          user_id: 1,
          refreshed: false,
        },
        {
          id: 2,
          name: 'bar',
          type: 'BookList',
          created_at: new Date('05/28/2020').toISOString(),
          completed: true,
          users_list_id: 2,
          owner_id: 1,
          user_id: 1,
          refreshed: false,
        },
      ],
      currentUserPermissions: {
        1: 'write',
        2: 'write',
      },
    };
  });

  it('renders', () => {
    const { container } = renderCompletedListsContainer(props);

    expect(container).toMatchSnapshot();
  });

  it('refreshes list on successful refresh', async () => {
    axios.post = jest.fn().mockResolvedValue({});
    const { getAllByTestId } = renderCompletedListsContainer(props);

    fireEvent.click(getAllByTestId('complete-list-refresh')[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Your list was successfully refreshed.', { type: 'info' });
  });

  it('redirects to users/sign_in on 401 of refresh', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 401 } });
    const { getAllByTestId } = renderCompletedListsContainer(props);

    fireEvent.click(getAllByTestId('complete-list-refresh')[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(props.history.push).toHaveBeenCalledWith('/users/sign_in');
  });

  it('fires toast and does not redirect on 403 of refresh', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 403 } });
    const { getAllByTestId } = renderCompletedListsContainer(props);

    fireEvent.click(getAllByTestId('complete-list-refresh')[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
  });

  it('fires toast and does not redirect on 404 of refresh', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 404 } });
    const { getAllByTestId } = renderCompletedListsContainer(props);

    fireEvent.click(getAllByTestId('complete-list-refresh')[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
  });

  it('displays errors on error other than 401, 403, 404 of refresh', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 500, data: { foo: 'bar', foobar: 'foobaz' } } });
    const { getAllByTestId } = renderCompletedListsContainer(props);

    fireEvent.click(getAllByTestId('complete-list-refresh')[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and foobar foobaz', { type: 'error' });
  });

  it('displays error on request failure of refresh', async () => {
    axios.post = jest.fn().mockRejectedValue({ request: 'failed to send request' });
    const { getAllByTestId } = renderCompletedListsContainer(props);

    fireEvent.click(getAllByTestId('complete-list-refresh')[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('displays error on unknown error of refresh', async () => {
    axios.post = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { getAllByTestId } = renderCompletedListsContainer(props);

    fireEvent.click(getAllByTestId('complete-list-refresh')[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('failed to send request', { type: 'error' });
  });

  it('does not delete when confirm modal is cleared', async () => {
    axios.delete = jest.fn().mockResolvedValue({});
    const { getAllByTestId, getByTestId, queryByTestId } = renderCompletedListsContainer(props);

    fireEvent.click(getAllByTestId('complete-list-trash')[0]);
    await waitFor(() => getByTestId('clear-delete'));

    fireEvent.click(getByTestId('clear-delete'));
    await waitFor(() => expect(queryByTestId('clear-delete')).toBeNull());

    expect(axios.delete).not.toHaveBeenCalled();
    expect(toast).not.toHaveBeenCalled();
  });

  it('deletes list on successful delete', async () => {
    axios.delete = jest.fn().mockResolvedValue({});
    const { getAllByTestId, getByTestId } = renderCompletedListsContainer(props);

    fireEvent.click(getAllByTestId('complete-list-trash')[0]);
    await waitFor(() => getByTestId('confirm-delete'));

    fireEvent.click(getByTestId('confirm-delete'));
    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Your list was successfully deleted.', { type: 'info' });
  });

  it('redirects to users/sign_in on 401 of delete', async () => {
    axios.delete = jest.fn().mockRejectedValue({ response: { status: 401 } });
    const { getAllByTestId, getByTestId } = renderCompletedListsContainer(props);

    fireEvent.click(getAllByTestId('complete-list-trash')[0]);
    await waitFor(() => getByTestId('confirm-delete'));

    fireEvent.click(getByTestId('confirm-delete'));
    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(props.history.push).toHaveBeenCalledWith('/users/sign_in');
  });

  it('fires toast and does not redirect on 403 of delete', async () => {
    axios.delete = jest.fn().mockRejectedValue({ response: { status: 403 } });
    const { getAllByTestId, getByTestId } = renderCompletedListsContainer(props);

    fireEvent.click(getAllByTestId('complete-list-trash')[0]);
    await waitFor(() => getByTestId('confirm-delete'));

    fireEvent.click(getByTestId('confirm-delete'));
    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
  });

  it('fires toast and does not redirect on 404 of delete', async () => {
    axios.delete = jest.fn().mockRejectedValue({ response: { status: 404 } });
    const { getAllByTestId, getByTestId } = renderCompletedListsContainer(props);

    fireEvent.click(getAllByTestId('complete-list-trash')[0]);
    await waitFor(() => getByTestId('confirm-delete'));

    fireEvent.click(getByTestId('confirm-delete'));
    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
  });

  it('displays errors on error other than 401, 403, 404 of delete', async () => {
    axios.delete = jest.fn().mockRejectedValue({ response: { status: 500, data: { foo: 'bar', foobar: 'foobaz' } } });
    const { getAllByTestId, getByTestId } = renderCompletedListsContainer(props);

    fireEvent.click(getAllByTestId('complete-list-trash')[0]);
    await waitFor(() => getByTestId('confirm-delete'));

    fireEvent.click(getByTestId('confirm-delete'));
    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and foobar foobaz', { type: 'error' });
  });

  it('displays error on request failure of delete', async () => {
    axios.delete = jest.fn().mockRejectedValue({ request: 'failed to send request' });
    const { getAllByTestId, getByTestId } = renderCompletedListsContainer(props);

    fireEvent.click(getAllByTestId('complete-list-trash')[0]);
    await waitFor(() => getByTestId('confirm-delete'));

    fireEvent.click(getByTestId('confirm-delete'));
    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('displays error on unknown error of delete', async () => {
    axios.delete = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { getAllByTestId, getByTestId } = renderCompletedListsContainer(props);

    fireEvent.click(getAllByTestId('complete-list-trash')[0]);
    await waitFor(() => getByTestId('confirm-delete'));

    fireEvent.click(getByTestId('confirm-delete'));
    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('failed to send request', { type: 'error' });
  });
});
