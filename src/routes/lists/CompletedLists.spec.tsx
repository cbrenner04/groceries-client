import React from 'react';
import { render, type RenderResult, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import axios from 'utils/api';

// Mock listPrefetch at module level
vi.mock('utils/listPrefetch', () => ({
  prefetchListsIdle: vi.fn(() => Promise.resolve()),
  prefetchList: vi.fn(() => Promise.resolve()),
  getPrefetchedList: vi.fn(() => null),
}));

import CompletedLists from './CompletedLists';

const setup = (): RenderResult =>
  render(
    <MemoryRouter>
      <CompletedLists />
    </MemoryRouter>,
  );

describe('CompletedLists', () => {
  it('renders loading component when data is being fetched', async () => {
    axios.get = vi.fn().mockReturnValue(new Promise(() => {}));
    const { container, findByText } = setup();

    expect(await findByText('Loading...')).toBeVisible();
    expect(container).toMatchSnapshot();
  });

  it('renders unknown error when error occurs', async () => {
    axios.get = vi.fn().mockRejectedValue({ response: { status: 400 } });
    const { container, findByRole } = setup();

    await act(async () => {
      await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
    });

    expect(await findByRole('button')).toHaveTextContent('refresh the page');
    expect(container).toMatchSnapshot();
  });

  it('renders completed lists with completed filter active', async () => {
    axios.get = vi.fn().mockResolvedValue({
      data: {
        current_user_id: 'id1',
        accepted_lists: {
          completed_lists: [
            {
              id: 'id1',
              users_list_id: 'id1',
              name: 'foo',
              user_id: 'id1',
              list_item_configuration_id: 'config-1',
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
              list_item_configuration_id: 'config-1',
              created_at: new Date('05/31/2020').toISOString(),
              completed: false,
              refreshed: false,
              owner_id: 'id1',
            },
          ],
        },
        pending_lists: [],
        current_list_permissions: { id1: 'write', id2: 'write' },
        list_item_configurations: [{ id: 'config-1', name: 'grocery list template' }],
      },
    });
    const { findByTestId, queryByTestId } = setup();

    await act(async () => {
      await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
    });

    expect(axios.get).toHaveBeenCalledWith('/lists/');
    // Completed filter should be active — only completed lists shown
    expect(await findByTestId('list-id1')).toHaveAttribute('data-test-class', 'completed-list');
    // Incomplete lists should not be shown
    expect(queryByTestId('list-id2')).toBeNull();
    // Completed filter chip should be active
    expect(await findByTestId('filter-completed')).toHaveAttribute('aria-pressed', 'true');
  });
});
