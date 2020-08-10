import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import BulkEditListItems from './BulkEditListItems';
import axios from '../../utils/api';

describe('BulkEditListItems', () => {
  const props = {
    match: {
      params: {
        0: 'grocery_list_items',
        list_id: '1',
      },
    },
    location: {
      search: '?item_ids=1,2',
    },
  };
  const renderBulkEditListItems = (newProps) => {
    const history = createMemoryHistory();
    return render(
      <Router history={history}>
        <BulkEditListItems {...newProps} history={history} />
      </Router>,
    );
  };

  it('renders the Loading component when fetch request is pending', () => {
    const { container, getByText } = renderBulkEditListItems(props);
    const status = getByText('Loading...');

    expect(container).toMatchSnapshot();
    expect(status).toBeTruthy();
  });

  it('displays UnknownError when an error occurs', async () => {
    axios.get = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { container, getByRole } = renderBulkEditListItems(props);
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(container).toMatchSnapshot();
    expect(getByRole('button')).toHaveTextContent('refresh the page');
  });

  it('displays BulkEditListItems', async () => {
    axios.get = jest.fn().mockResolvedValue({
      data: {
        items: [
          {
            user_id: 1,
            id: 1,
            product: 'foo',
          },
        ],
        list: { id: 1, type: 'GroceryList' },
        list_users: [{ id: 1, email: 'foo@example.com' }],
        categories: [],
        lists: [{ id: 1, type: 'GroceryList', name: 'foobar' }],
      },
    });
    const { container, getByText } = renderBulkEditListItems(props);
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(container).toMatchSnapshot();
    expect(getByText('Update Items')).toBeVisible();
  });
});