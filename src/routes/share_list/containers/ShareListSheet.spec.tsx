import React from 'react';
import { render, type RenderResult, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import axios from 'utils/api';
import ShareListSheet, { type IShareListSheetProps } from './ShareListSheet';

const mockNavigate = vi.fn();
vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useNavigate: (): Mock => mockNavigate,
}));

function setup(overrides: Partial<IShareListSheetProps> = {}): RenderResult {
  const props: IShareListSheetProps = {
    isOpen: true,
    onClose: vi.fn(),
    listId: 'l1',
    listName: 'My List',
    ...overrides,
  };
  return render(
    <MemoryRouter>
      <ShareListSheet {...props} />
    </MemoryRouter>,
  );
}

describe('ShareListSheet', () => {
  it('renders nothing when closed', () => {
    const { queryByText } = setup({ isOpen: false });
    expect(queryByText('Share My List')).toBeNull();
  });

  it('renders the share form once data is fetched', async () => {
    axios.get = vi.fn().mockResolvedValue({
      data: {
        list: { id: 'l1', name: 'My List' },
        accepted: [{ user: { id: 'me', email: 'me@example.com' }, users_list: { id: 'ul', permissions: 'write' } }],
        pending: [],
        refused: [],
        invitable_users: [{ id: 'u1', email: 'foo@example.com' }],
        current_user_id: 'me',
        user_is_owner: true,
      },
    });

    const { findByText, findByTestId } = setup();
    expect(await findByText('Share My List')).toBeVisible();
    expect(await findByTestId('invite-user-u1')).toBeInTheDocument();
  });

  it('closes the sheet and exits loading when fetchData returns undefined', async () => {
    axios.get = vi.fn().mockImplementation(async () => {
      throw { response: { status: 401 } };
    });

    const onClose = vi.fn();
    const { queryByText } = setup({ onClose });
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in'));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    await waitFor(() => expect(queryByText('Loading...')).toBeNull());
  });
});
