import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import ShareList from './ShareList';
import axios from '../../utils/api';

describe('ShareList', () => {
  const renderShareList = () => {
    const history = createMemoryHistory();
    const props = {
      history,
      match: {
        params: {
          list_id: '1',
        },
      },
    };
    return render(
      <Router history={history}>
        <ShareList {...props} />
      </Router>,
    );
  };

  it('renders loading when data fetch is not complete', () => {
    const { container, getByText } = renderShareList();

    expect(container).toMatchSnapshot();
    expect(getByText('Loading...')).toBeVisible();
  });

  it('renders unknown error component when error occurs', async () => {
    axios.get = jest.fn().mockRejectedValue({ response: { status: 400 } });
    const { container, getByRole } = renderShareList();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(container).toMatchSnapshot();
    expect(getByRole('button')).toHaveTextContent('refresh the page');
  });

  it('renders ShareList when data fetch is successful', async () => {
    axios.get = jest.fn().mockResolvedValue({
      data: {
        accepted: [
          { user: { id: 'id1', email: 'foo@example.com' }, users_list: { id: 'id1', permissions: 'read' } },
          { user: { id: 'id4', email: 'foobaz@example.com' }, users_list: { id: 'id4', permissions: 'write' } },
        ],
        pending: [{ user: { id: 'id2', email: 'bar@example.com' }, users_list: { id: 'id2', permissions: 'write' } }],
        refused: [{ user: { id: 'id3', email: 'baz@example.com' }, users_list: { id: 'id3', permissions: 'read' } }],
        current_user_id: 'id4',
        user_is_owner: true,
        invitable_users: [{ id: 'id5', email: 'foobar@example.com' }],
        list: {
          name: 'foo',
          id: 'id1',
        },
      },
    });
    const { container, getByTestId, queryByTestId } = renderShareList();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(container).toMatchSnapshot();
    expect(getByTestId('invite-user-id5')).toHaveTextContent('foobar@example.com');
    expect(getByTestId('accepted-user-id1')).toHaveTextContent('foo@example.com');
    expect(queryByTestId('accepted-user-id4')).toBeNull();
    expect(getByTestId('pending-user-id2')).toHaveTextContent('bar@example.com');
    expect(getByTestId('refused-user-id3')).toHaveTextContent('baz@example.com');
  });
});
