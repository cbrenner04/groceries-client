import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Lists from './Lists';
import axios from '../../utils/api';

describe('Lists', () => {
  const renderLists = () => {
    return render(
      <MemoryRouter>
        <Lists />
      </MemoryRouter>,
    );
  };

  it('renders loading component when data is being fetched', async () => {
    const { container, findByText } = renderLists();

    expect(await findByText('Loading...')).toBeVisible();
    expect(container).toMatchSnapshot();
  });

  it('renders unknown error when error occurs', async () => {
    axios.get = jest.fn().mockRejectedValue({ response: { status: 400 } });
    const { container, findByRole } = renderLists();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(await findByRole('button')).toHaveTextContent('refresh the page');
    expect(container).toMatchSnapshot();
  });

  it('renders Lists when data retrieval is complete', async () => {
    axios.get = jest.fn().mockResolvedValue({
      data: {
        current_user_id: 'id1',
        accepted_lists: {
          completed_lists: [
            {
              id: 'id1',
              users_list_id: 'id1',
              name: 'foo',
              user_id: 'id1',
              type: 'GroceryList',
              created_at: new Date('05/31/2020').toISOString(),
              completed: true,
              refreshed: false,
              owner_id: 'id1',
            },
          ],
          not_completed_lists: [
            {
              id: 'id2',
              users_list_id: 'id2',
              name: 'bar',
              user_id: 'id1',
              type: 'BookList',
              created_at: new Date('05/31/2020').toISOString(),
              completed: false,
              refreshed: false,
              owner_id: 'id1',
            },
          ],
        },
        pending_lists: [
          {
            id: 'id3',
            users_list_id: 'id3',
            name: 'foo',
            user_id: 'id1',
            type: 'GroceryList',
            created_at: new Date('05/31/2020').toISOString(),
            completed: false,
            refreshed: false,
            owner_id: 'id2',
          },
        ],
        current_list_permissions: {
          id1: 'write',
          id2: 'write',
          id3: 'write',
        },
      },
    });

    const { container, findByTestId } = renderLists();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(await findByTestId('list-id1')).toHaveAttribute('data-test-class', 'completed-list');
    expect(await findByTestId('list-id2')).toHaveAttribute('data-test-class', 'incomplete-list');
    expect(await findByTestId('list-id3')).toHaveAttribute('data-test-class', 'pending-list');
    expect(container).toMatchSnapshot();
  });
});
