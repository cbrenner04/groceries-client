import React from 'react';
import { render, type RenderResult, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import { AnimatePresence } from 'framer-motion';

import axios from 'utils/api';
import { PageTransition } from 'components/layout/PageTransition';

// Mock listPrefetch at module level
vi.mock('utils/listPrefetch', () => ({
  prefetchListsIdle: vi.fn(() => Promise.resolve()),
  prefetchList: vi.fn(() => Promise.resolve()),
  getPrefetchedList: vi.fn(() => null),
}));

import CompletedLists from './CompletedLists';
import Lists from './Lists';

const createMockListsData = (): { data: Record<string, unknown> } => ({
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

const setup = (): RenderResult =>
  render(
    <MemoryRouter>
      <CompletedLists />
    </MemoryRouter>,
  );

describe('CompletedLists', () => {
  it('renders loading component when data is being fetched', async () => {
    axios.get = vi.fn().mockReturnValue(new Promise(() => {}));
    const { container } = setup();

    const skeletonLoader = container.querySelector('.tw\\:space-y-3');
    expect(skeletonLoader).toBeInTheDocument();
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

  it('renders completed lists in the reduced view', async () => {
    axios.get = vi.fn().mockResolvedValue(createMockListsData());
    const { findByTestId, queryByTestId } = setup();

    await act(async () => {
      await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
    });

    expect(axios.get).toHaveBeenCalledWith('/lists/');
    // Completed lists should be shown
    expect(await findByTestId('list-id1')).toHaveAttribute('data-test-class', 'completed-list');
    // Incomplete lists should not be shown
    expect(queryByTestId('list-id2')).toBeNull();
    // Filter chips should not be present in the reduced view
    expect(queryByTestId('filter-completed')).toBeNull();
    // New-list form should not be present in the reduced view
    expect(queryByTestId('quick-add-input')).toBeNull();
    // In-section "View all completed lists" button should not be present
    expect(queryByTestId('view-all-completed-lists')).toBeNull();
  });

  it('renders completed view with keyed PageTransition on /completed_lists route', async () => {
    axios.get = vi.fn().mockResolvedValue(createMockListsData());

    const { queryByTestId, findByTestId } = render(
      <MemoryRouter initialEntries={['/completed_lists']}>
        <AnimatePresence mode="wait">
          <PageTransition key="/completed_lists" direction="fade">
            <Routes>
              <Route path="/lists" element={<Lists />} />
              <Route path="/completed_lists" element={<CompletedLists />} />
            </Routes>
          </PageTransition>
        </AnimatePresence>
      </MemoryRouter>,
    );

    await act(async () => {
      await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
    });

    // Completed lists should be shown
    expect(await findByTestId('list-id1')).toHaveAttribute('data-test-class', 'completed-list');
    // Incomplete lists should not be shown
    expect(queryByTestId('list-id2')).toBeNull();
    // Filter chips should not be present in the reduced view
    expect(queryByTestId('filter-completed')).toBeNull();
    // New-list form should not be present
    expect(queryByTestId('quick-add-input')).toBeNull();
    // In-section "View all completed lists" button should not be present
    expect(queryByTestId('view-all-completed-lists')).toBeNull();
  });
});
