import React from 'react';
import { render, type RenderResult, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import BulkEditListItems from './BulkEditListItems';
import axios from '../../utils/api';

describe('BulkEditListItems', () => {
  const renderBulkEditListItems = (): RenderResult => {
    return render(
      <MemoryRouter>
        <BulkEditListItems />
      </MemoryRouter>,
    );
  };

  it('renders the Loading component when fetch request is pending', async () => {
    const { container, findByText } = renderBulkEditListItems();
    const status = await findByText('Loading...');

    expect(container).toMatchSnapshot();
    expect(status).toBeTruthy();
  });

  it('displays UnknownError when an error occurs', async () => {
    axios.get = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { container, findByRole } = renderBulkEditListItems();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(await findByRole('button')).toHaveTextContent('refresh the page');
    expect(container).toMatchSnapshot();
  });

  it('displays BulkEditListItems', async () => {
    axios.get = jest.fn().mockResolvedValue({
      data: {
        items: [
          {
            user_id: 'id1',
            id: 'id1',
            product: 'foo',
          },
        ],
        list: {
          id: 'id1',
          type: 'GroceryList',
          name: 'foo',
          created_at: 'some date',
          completed: false,
          refreshed: false,
          owner_id: 'id1',
        },
        list_users: [{ id: 'id1', email: 'foo@example.com' }],
        categories: [],
        lists: [
          {
            id: 'id1',
            type: 'GroceryList',
            name: 'foobar',
            created_at: 'some date',
            completed: false,
            refreshed: false,
            owner_id: 'id1',
          },
        ],
      },
    });
    const { container, findByText } = renderBulkEditListItems();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(await findByText('Update Items')).toBeVisible();
    expect(container).toMatchSnapshot();
  });
});
