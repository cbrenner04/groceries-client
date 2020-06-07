import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import EditListItem from './EditListItem';
import axios from '../../utils/api';

describe('EditListItem', () => {
  const props = {
    match: {
      params: {
        0: 'grocery_list_items',
        id: '1',
        list_id: '1',
      },
    },
  };
  const renderEditListItem = (newProps) => {
    const history = createMemoryHistory();
    return render(
      <Router history={history}>
        <EditListItem {...newProps} history={history} />
      </Router>,
    );
  };

  it('renders the Loading component when fetch request is pending', () => {
    const { container, getByText } = renderEditListItem(props);
    const status = getByText('Loading...');

    expect(container).toMatchSnapshot();
    expect(status).toBeTruthy();
  });

  it('displays UnknownError when an error occurs', async () => {
    axios.get = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { container, getByRole } = renderEditListItem(props);
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(container).toMatchSnapshot();
    expect(getByRole('button')).toHaveTextContent('refresh the page');
  });

  it('displays EditListItem', async () => {
    axios.get = jest.fn().mockResolvedValue({
      data: {
        item: {
          user_id: 1,
          id: 1,
          product: 'foo',
        },
        list: { id: 1, type: 'GroceryList' },
        list_users: [{ id: 1, email: 'foo@example.com' }],
        categories: [],
      },
    });
    const { container, getByText } = renderEditListItem(props);
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(container).toMatchSnapshot();
    expect(getByText('Update Item')).toBeVisible();
  });
});
