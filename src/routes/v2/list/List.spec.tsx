import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import { toast } from 'react-toastify';
import axios from 'utils/api';

import { UserContext } from '../../../AppRouter';

import List from './List';

// Mock useParams for this specific test
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useParams: (): { id: string } => ({ id: '123' }),
}));

const mockUser = {
  accessToken: 'test-token',
  client: 'test-client',
  uid: 'test-uid',
};

const mockListData = {
  current_user_id: 'test-user-id',
  list: {
    id: '123',
    name: 'Test List',
    type: 'GroceryList',
    user_id: 'test-user-id',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  not_completed_items: [],
  completed_items: [],
  list_users: [],
  permissions: 'write',
  lists_to_update: [],
  list_item_configuration: {
    id: '1',
    name: 'Default Configuration',
    user_id: 'test-user-id',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    archived_at: null,
  },
  list_item_configurations: [],
  categories: [],
};

// Helper function to render the List component with consistent setup
const renderList = (): ReturnType<typeof render> => {
  return render(
    <UserContext.Provider value={mockUser}>
      <MemoryRouter initialEntries={['/v2/lists/123']}>
        <Routes>
          <Route path="/v2/lists/:id" element={<List />} />
          <Route path="/users/sign_in" element={<div>Sign In Page</div>} />
        </Routes>
      </MemoryRouter>
    </UserContext.Provider>,
  );
};

describe('V2 List', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    axios.get = jest.fn().mockImplementation(
      () =>
        new Promise(() => {
          /* never resolves for loading state */
        }),
    );
    renderList();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders list data when fetch succeeds', async () => {
    axios.get = jest.fn().mockResolvedValue({ data: mockListData });
    await act(async () => {
      renderList();
    });
    expect(await screen.findByText('Test List')).toBeInTheDocument();
    expect(screen.getByText('Back to lists')).toBeInTheDocument();
    expect(screen.getByText('Items')).toBeInTheDocument();
    expect(screen.getByText('Completed Items')).toBeInTheDocument();
  });

  it('renders error state when fetch fails', async () => {
    axios.get = jest.fn().mockRejectedValue(new Error('Network error'));
    await act(async () => {
      renderList();
    });
    expect(await screen.findByText('Something went wrong!')).toBeInTheDocument();
    expect(screen.getByText('We are currently unable to render this page.')).toBeInTheDocument();
  });

  it('handles authentication errors', async () => {
    const authError = new Error('Unauthorized') as Error & { response?: { status: number } };
    authError.response = { status: 401 };
    axios.get = jest.fn().mockRejectedValue(authError);
    await act(async () => {
      renderList();
    });
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
  });
});
