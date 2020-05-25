import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import List from './List';
import axios from '../../utils/api';

describe('List', () => {
  const history = createMemoryHistory();
  const props = {
    history,
    match: {
      params: {
        id: '1',
      },
    },
  };
  const renderList = (newProps) => {
    return render(
      <Router history={history}>
        <List {...newProps} />
      </Router>,
    );
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders the Loading component when fetch request is pending', () => {
    const { container, getByText } = renderList(props);
    const status = getByText('Loading...');

    expect(container).toMatchSnapshot();
    expect(status).toBeTruthy();
  });

  it('displays UnknownError when an error occurs', async () => {
    axios.get = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { container, getByRole } = renderList(props);
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    expect(container).toMatchSnapshot();
    expect(getByRole('button')).toHaveTextContent('refresh the page');
  });

  it('displays List', async () => {
    axios.get = jest.fn().mockImplementation((route) => {
      if (route === '/lists/1/users_lists') {
        return {
          data: {
            accepted: [{ id: 1, user: { id: 1, email: 'foo@example.com' }, users_list: { permissions: 'write' } }],
            pending: [],
          },
        };
      }
      if (route === '/lists/1') {
        return {
          data: {
            current_user_id: 1,
            not_purchased_items: [],
            purchased_items: [],
            list: {
              id: 1,
              name: 'foo',
              type: 'GroceryList',
              created_at: new Date('05/22/2020').toISOString(),
              completed: false,
              owner_id: 1,
            },
            categories: [],
          },
        };
      }
    });
    const { container, getByText } = renderList(props);
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    expect(container).toMatchSnapshot();
    expect(getByText('foo')).toBeVisible();
  });
});
