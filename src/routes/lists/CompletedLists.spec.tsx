import React from 'react';
import { render, type RenderResult, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import axios from 'utils/api';

import CompletedLists from './CompletedLists';

const setup = (): RenderResult =>
  render(
    <MemoryRouter>
      <CompletedLists />
    </MemoryRouter>,
  );

describe('CompletedLists', () => {
  it('renders loading component when data is being fetched', async () => {
    const { container, findByText } = setup();

    expect(await findByText('Loading...')).toBeVisible();
    expect(container).toMatchSnapshot();
  });

  it('renders unknown error when error occurs', async () => {
    axios.get = jest.fn().mockRejectedValue({ response: { status: 400 } });
    const { container, findByRole } = setup();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(await findByRole('button')).toHaveTextContent('refresh the page');
    expect(container).toMatchSnapshot();
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

    expect(await findByTestId('list-id1')).toHaveAttribute('data-test-class', 'completed-list');
    expect(container).toMatchSnapshot();
  });
});
