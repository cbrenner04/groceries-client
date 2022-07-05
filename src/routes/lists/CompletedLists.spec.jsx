import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import CompletedLists from './CompletedLists';
import axios from '../../utils/api';

function setup() {
  const component = render(
    <MemoryRouter>
      <CompletedLists />
    </MemoryRouter>,
  );

  return { ...component };
}

describe('CompletedLists', () => {
  it('renders loading component when data is being fetched', async () => {
    const { container, findByText } = setup();

    expect(container).toMatchSnapshot();
    expect(await findByText('Loading...')).toBeVisible();
  });

  it('renders unknown error when error occurs', async () => {
    axios.get = jest.fn().mockRejectedValue({ response: { status: 400 } });
    const { container, findByRole } = setup();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(container).toMatchSnapshot();
    expect(await findByRole('button')).toHaveTextContent('refresh the page');
  });

  it('renders CompletedLists when data retrieval is complete', async () => {
    axios.get = jest.fn().mockResolvedValue({
      data: {
        current_user_id: 'id1',
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
        current_list_permissions: { id1: 'write' },
      },
    });
    const { container, findByTestId } = setup();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(container).toMatchSnapshot();
    expect(await findByTestId('list-id1')).toHaveAttribute('data-test-class', 'completed-list');
  });
});
