import React from 'react';
import { render, type RenderResult, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import axios from 'utils/api';
import { BOTTOM_INPUT_BAR_PORTAL_TARGET_ID } from 'AppRouter';

// Mock listPrefetch at module level
vi.mock('utils/listPrefetch', () => ({
  prefetchListsIdle: vi.fn(() => Promise.resolve()),
  prefetchList: vi.fn(() => Promise.resolve()),
  getPrefetchedList: vi.fn(() => null),
}));

import Lists from './Lists';
import * as utils from './utils';

describe('Lists', () => {
  const renderLists = (initialFilter?: 'all' | 'pending' | 'active' | 'completed'): RenderResult => {
    // Create the portal target before rendering
    const portalTarget = document.createElement('div');
    portalTarget.id = BOTTOM_INPUT_BAR_PORTAL_TARGET_ID;
    document.body.appendChild(portalTarget);

    return render(
      <MemoryRouter>
        <Lists initialFilter={initialFilter} />
      </MemoryRouter>,
    );
  };

  it('renders loading component when data is being fetched', async () => {
    axios.get = vi.fn().mockReturnValue(new Promise(() => {}));
    const { container } = renderLists();

    const skeletonLoader = container.querySelector('.tw\\:space-y-3');
    expect(skeletonLoader).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('renders unknown error when error occurs', async () => {
    axios.get = vi.fn().mockRejectedValue({ response: { status: 400 } });
    const { container, findByRole } = renderLists();

    await act(async () => {
      await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
    });

    expect(await findByRole('button')).toHaveTextContent('refresh the page');
    expect(container).toMatchSnapshot();
  });

  it('displays UnknownError when data is undefined', async () => {
    // Mock the fetchLists function to return undefined
    vi.spyOn(utils, 'fetchLists').mockResolvedValue(undefined);
    const { container, findByRole } = renderLists();

    await act(async () => {
      await waitFor(() => expect(utils.fetchLists).toHaveBeenCalledTimes(1));
    });

    expect(await findByRole('button')).toHaveTextContent('refresh the page');
    expect(container).toMatchSnapshot();
  });

  it('renders Lists when data retrieval is complete', async () => {
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
              has_accepted: true,
            },
          ],
          not_completed_lists: [
            {
              id: 'id2',
              users_list_id: 'id2',
              name: 'bar',
              user_id: 'id1',
              list_item_configuration_id: 'config-2',
              created_at: new Date('05/31/2020').toISOString(),
              completed: false,
              has_accepted: true,
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
            list_item_configuration_id: 'config-1',
            created_at: new Date('05/31/2020').toISOString(),
            completed: false,
            refreshed: false,
            owner_id: 'id2',
            has_accepted: null,
          },
        ],
        current_list_permissions: {
          id1: 'write',
          id2: 'write',
        },
        list_item_configurations: [
          { id: 'config-1', name: 'grocery list template' },
          { id: 'config-2', name: 'book list template' },
        ],
      },
    });

    const { container, findByTestId } = renderLists();

    await act(async () => {
      await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
    });

    expect(await findByTestId('list-id1')).toHaveAttribute('data-test-class', 'completed-list');
    expect(await findByTestId('list-id2')).toHaveAttribute('data-test-class', 'incomplete-list');
    expect(await findByTestId('list-id3')).toHaveAttribute('data-test-class', 'pending-list');
    expect(container).toMatchSnapshot();
  });
});
