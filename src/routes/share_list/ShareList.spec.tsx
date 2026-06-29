import React from 'react';
import { render, type RenderResult, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import { BottomInputBarFormProvider } from 'components/layout/BottomInputBarFormContext';

import ShareList from './ShareList';
import axios from '../../utils/api';

const mockNavigate = vi.fn();
vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useNavigate: (): Mock => mockNavigate,
  useParams: (): { list_id: string } => ({ list_id: '1' }),
}));

const listFetchData = {
  current_user_id: 'id4',
  list: { id: '1', name: 'My List', completed: false, refreshed: false, owner_id: 'id4' },
  not_completed_items: [],
  completed_items: [],
  list_users: [],
  permissions: 'write',
  lists_to_update: [],
  list_item_configuration: { id: 'cfg-1', name: 'Default' },
  categories: [],
  list_item_field_configurations: [],
};

const usersListData = {
  accepted: [
    { user: { id: 'id1', email: 'foo@example.com' }, users_list: { id: 'id1', permissions: 'read' } },
    { user: { id: 'id4', email: 'foobaz@example.com' }, users_list: { id: 'id4', permissions: 'write' } },
  ],
  pending: [{ user: { id: 'id2', email: 'bar@example.com' }, users_list: { id: 'id2', permissions: 'write' } }],
  refused: [{ user: { id: 'id3', email: 'baz@example.com' }, users_list: { id: 'id3', permissions: 'read' } }],
  current_user_id: 'id4',
  user_is_owner: true,
  invitable_users: [{ id: 'id5', email: 'foobar@example.com' }],
  list: { name: 'My List', id: '1' },
};

describe('ShareList', () => {
  const renderShareList = (): RenderResult =>
    render(
      <MemoryRouter>
        <BottomInputBarFormProvider>
          <ShareList />
        </BottomInputBarFormProvider>
      </MemoryRouter>,
    );

  it('renders loading when data fetch is not complete', async () => {
    axios.get = vi.fn().mockReturnValue(new Promise(() => {}));
    const { findByText } = renderShareList();

    expect(await findByText('Loading...')).toBeVisible();
  });

  it('renders unknown error component when error occurs', async () => {
    axios.get = vi.fn().mockRejectedValue({ response: { status: 400 } });
    const { findByRole } = renderShareList();
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    expect(await findByRole('button')).toHaveTextContent('refresh the page');
  });

  it('renders the list page with the share sheet auto-opened', async () => {
    axios.get = vi.fn().mockImplementation(async (url: string) => {
      if (url === '/lists/1') {
        return { data: listFetchData };
      }
      if (url === '/lists/1/users_lists') {
        return { data: usersListData };
      }
      return { data: {} };
    });
    const { findByTestId, queryByTestId } = renderShareList();

    expect(await findByTestId('invite-user-id5')).toHaveTextContent('foobar@example.com');
    expect(await findByTestId('accepted-user-id1')).toHaveTextContent('foo@example.com');
    expect(queryByTestId('accepted-user-id4')).toBeNull();
    expect(await findByTestId('pending-user-id2')).toHaveTextContent('bar@example.com');
    expect(await findByTestId('refused-user-id3')).toHaveTextContent('baz@example.com');
  });
});
