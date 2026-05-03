import React from 'react';
import { render, type RenderResult, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import EditList from './EditList';
import axios from '../../utils/api';

vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useNavigate: (): Mock => vi.fn(),
  useParams: (): { id: string } => ({ id: '1' }),
}));

const setup = (): RenderResult =>
  render(
    <MemoryRouter>
      <EditList />
    </MemoryRouter>,
  );

describe('EditList', () => {
  it('renders the lists page (defers to Async loading)', async () => {
    axios.get = vi.fn().mockResolvedValue({
      data: {
        current_user_id: 'u1',
        accepted_lists: { completed_lists: [], not_completed_lists: [] },
        pending_lists: [],
        current_list_permissions: {},
        list_item_configurations: [],
      },
    });
    const { findByText } = setup();
    expect(await findByText('Loading...')).toBeTruthy();
  });

  it('opens the edit sheet when fetchListToEdit succeeds', async () => {
    axios.get = vi.fn().mockImplementation(async (url: string) => {
      if (url === '/lists/') {
        return {
          data: {
            current_user_id: 'u1',
            accepted_lists: { completed_lists: [], not_completed_lists: [] },
            pending_lists: [],
            current_list_permissions: {},
            list_item_configurations: [],
          },
        };
      }
      if (url === '/lists/1/edit') {
        return {
          data: {
            id: '1',
            name: 'My List',
            completed: false,
            refreshed: false,
            archived_at: null,
            list_item_configuration_id: 'cfg-1',
          },
        };
      }
      return { data: {} };
    });
    const { findByText } = setup();
    await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/lists/1/edit'));
    expect(await findByText('Edit List')).toBeVisible();
  });
});
