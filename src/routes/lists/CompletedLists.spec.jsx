import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import CompletedLists from './CompletedLists';
import axios from '../../utils/api';

describe('CompletedLists', () => {
  const renderCompletedLists = () => {
    const history = createMemoryHistory();
    const props = {
      history,
    };
    return render(
      <Router history={history}>
        <CompletedLists {...props} />
      </Router>,
    );
  };

  it('renders loading component when data is being fetched', () => {
    const { container, getByText } = renderCompletedLists();

    expect(container).toMatchSnapshot();
    expect(getByText('Loading...')).toBeVisible();
  });

  it('renders unknown error when error occurs', async () => {
    axios.get = jest.fn().mockRejectedValue({ response: { status: 400 } });
    const { container, getByRole } = renderCompletedLists();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(container).toMatchSnapshot();
    expect(getByRole('button')).toHaveTextContent('refresh the page');
  });

  it('renders CompletedLists when data retrieval is complete', async () => {
    axios.get = jest.fn().mockImplementation((route) => {
      if (route === '/completed_lists/') {
        return Promise.resolve({
          data: {
            completed_lists: [
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
            ],
          },
        });
      }
      if (route === '/lists/1/users_lists/1') {
        return Promise.resolve({ data: { list_id: 1, permissions: 'write' } });
      }
    });
    const { container, getByTestId } = renderCompletedLists();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    expect(container).toMatchSnapshot();
    expect(getByTestId('list-1')).toHaveAttribute('data-test-class', 'completed-list');
  });
});
