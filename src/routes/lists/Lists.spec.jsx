import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import Lists from './Lists';
import axios from '../../utils/api';
import { ActionCableContext } from '../../context/ActionCableContext';

describe('Lists', () => {
  const renderLists = () => {
    const history = createMemoryHistory();
    const props = {
      history,
    };
    return render(
      <Router history={history}>
        <ActionCableContext.Provider
          value={{ cable: { subscriptions: { create: jest.fn() }, disconnect: jest.fn() }, setCableContext: jest.fn() }}
        >
          <Lists {...props} />
        </ActionCableContext.Provider>
      </Router>,
    );
  };

  it('renders loading component when data is being fetched', () => {
    const { container, getByText } = renderLists();

    expect(container).toMatchSnapshot();
    expect(getByText('Loading...')).toBeVisible();
  });

  it('renders unknown error when error occurs', async () => {
    axios.get = jest.fn().mockRejectedValue({ response: { status: 400 } });
    const { container, getByRole } = renderLists();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(container).toMatchSnapshot();
    expect(getByRole('button')).toHaveTextContent('refresh the page');
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

    const { container, getByTestId } = renderLists();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(container).toMatchSnapshot();
    expect(getByTestId('list-id1')).toHaveAttribute('data-test-class', 'completed-list');
    expect(getByTestId('list-id2')).toHaveAttribute('data-test-class', 'incomplete-list');
    expect(getByTestId('list-id3')).toHaveAttribute('data-test-class', 'pending-list');
  });
});
