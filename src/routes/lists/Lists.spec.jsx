import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import Lists from './Lists';
import axios from '../../utils/api';

describe('Lists', () => {
  const renderLists = () => {
    const history = createMemoryHistory();
    const props = {
      history,
    };
    return render(
      <Router history={history}>
        <Lists {...props} />
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
    axios.get = jest.fn().mockImplementation((route) => {
      if (route === '/lists/') {
        return Promise.resolve({
          data: {
            current_user_id: 1,
            accepted_lists: [
              {
                id: 1,
                users_list_id: 1,
                name: 'foo',
                user_id: 1,
                type: 'GroceryList',
                created_at: new Date('05/31/2020').toISOString(),
                completed: true,
                refreshed: false,
                owner_id: 1,
              },
              {
                id: 2,
                users_list_id: 2,
                name: 'bar',
                user_id: 1,
                type: 'BookList',
                created_at: new Date('05/31/2020').toISOString(),
                completed: false,
                refreshed: false,
                owner_id: 1,
              },
            ],
            pending_lists: [
              {
                id: 3,
                users_list_id: 3,
                name: 'foo',
                user_id: 1,
                type: 'GroceryList',
                created_at: new Date('05/31/2020').toISOString(),
                completed: false,
                refreshed: false,
                owner_id: 2,
              },
            ],
          },
        });
      }
      if (route === '/lists/1/users_lists/1') {
        return Promise.resolve({ data: { list_id: 1, permissions: 'write' } });
      }
      if (route === '/lists/2/users_lists/2') {
        return Promise.resolve({ data: { list_id: 2, permissions: 'write' } });
      }
      if (route === '/lists/3/users_lists/3') {
        return Promise.resolve({ data: { list_id: 3, permissions: 'write' } });
      }
    });
    const { container, getByTestId } = renderLists();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(4));

    expect(container).toMatchSnapshot();
    expect(getByTestId('list-1')).toHaveAttribute('data-test-class', 'completed-list');
    expect(getByTestId('list-2')).toHaveAttribute('data-test-class', 'non-completed-list');
    expect(getByTestId('list-3')).toHaveAttribute('data-test-class', 'pending-list');
  });
});