import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import List from './List';
import axios from '../../utils/api';

describe('List', () => {
  const props = {
    match: {
      params: {
        id: '1',
      },
    },
  };
  const renderList = (newProps) => {
    const history = createMemoryHistory();
    return render(
      <Router history={history}>
        <List {...newProps} history={history} />
      </Router>,
    );
  };

  it('renders the Loading component when fetch request is pending', () => {
    const { container, getByText } = renderList(props);
    const status = getByText('Loading...');

    expect(container).toMatchSnapshot();
    expect(status).toBeTruthy();
  });

  it('displays UnknownError when an error occurs', async () => {
    axios.get = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { getByRole } = renderList(props);
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(getByRole('button')).toHaveTextContent('refresh the page');
  });

  it('displays List', async () => {
    axios.get = jest.fn().mockResolvedValue({
      data: {
        current_user_id: 'id1',
        not_purchased_items: [],
        purchased_items: [],
        list: {
          id: 'id1',
          name: 'foo',
          type: 'GroceryList',
          created_at: new Date('05/22/2020').toISOString(),
          completed: false,
          owner_id: 'id1',
        },
        categories: [],
        list_users: [{ id: 'id1', email: 'foo@example.com' }],
        permissions: 'write',
      },
    });
    const { container, getByText } = renderList(props);
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(container).toMatchSnapshot();
    expect(getByText('foo')).toBeVisible();
  });
});
