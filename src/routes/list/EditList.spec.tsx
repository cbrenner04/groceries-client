import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import axios from 'utils/api';
import { AxiosError } from 'axios';

import { UserContext } from '../../AppRouter';
import { handleFailure } from '../../utils/handleFailure';

import EditList from './EditList';

const mockHandleFailure = handleFailure as MockedFunction<typeof handleFailure>;
const mockNavigate = vi.fn();

// Mock router hooks in a single module factory to avoid mock-order flakiness.
vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useParams: (): { id: string } => ({ id: '123' }),
  useNavigate: (): ((url: string) => void) => mockNavigate,
}));

vi.mock('../../utils/handleFailure', () => ({
  handleFailure: vi.fn(),
}));

const mockUser = {
  accessToken: 'test-token',
  client: 'test-client',
  uid: 'test-uid',
};

const mockEditListData = {
  id: '123',
  name: 'Test List',
  completed: false,
  list_item_configuration_id: 'config-1',
  archived_at: null,
  refreshed: false,
};

// Helper function to render the EditList component with consistent setup
const renderEditList = (): ReturnType<typeof render> => {
  return render(
    <UserContext.Provider value={mockUser}>
      <MemoryRouter initialEntries={['/lists/123/edit']}>
        <Routes>
          <Route path="/lists/:id/edit" element={<EditList />} />
          <Route path="/users/sign_in" element={<div>Sign In Page</div>} />
        </Routes>
      </MemoryRouter>
    </UserContext.Provider>,
  );
};

describe('EditList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    axios.get = vi.fn().mockImplementation(
      () =>
        new Promise(() => {
          /* never resolves for loading state */
        }),
    );
    renderEditList();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders edit form when fetch succeeds', async () => {
    axios.get = vi.fn().mockResolvedValue({ data: mockEditListData });
    await act(async () => {
      renderEditList();
    });

    expect(await screen.findByText('Edit List')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test List')).toBeInTheDocument();
    expect(screen.getByText('Update List')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('renders error state when fetch fails', async () => {
    axios.get = vi.fn().mockRejectedValue(new Error('Network error'));
    await act(async () => {
      renderEditList();
    });
    expect(await screen.findByText('Something went wrong!')).toBeInTheDocument();
    expect(screen.getByText('We are currently unable to render this page.')).toBeInTheDocument();
  });

  it('handles authentication errors', async () => {
    const authError = new AxiosError('Unauthorized', '401');
    axios.get = vi.fn().mockRejectedValue(authError);
    await act(async () => {
      renderEditList();
    });
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(1);
    });
    expect(mockHandleFailure).toHaveBeenCalledWith(
      expect.objectContaining({
        error: authError,
        notFoundMessage: 'List not found',
        navigate: mockNavigate,
        redirectURI: '/lists',
      }),
    );
  });

  it('handles case where data is undefined', async () => {
    axios.get = vi.fn().mockResolvedValue({ data: undefined });
    await act(async () => {
      renderEditList();
    });
    expect(await screen.findByText('Something went wrong!')).toBeInTheDocument();
    expect(screen.getByText('We are currently unable to render this page.')).toBeInTheDocument();
  });

  it('handles completed list data', async () => {
    const completedListData = {
      ...mockEditListData,
      completed: true,
      archived_at: '2023-01-01T00:00:00Z',
    };
    axios.get = vi.fn().mockResolvedValue({ data: completedListData });
    await act(async () => {
      renderEditList();
    });

    expect(await screen.findByText('Edit List')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test List')).toBeInTheDocument();
  });

  it('handles different list types', async () => {
    const bookListData = {
      ...mockEditListData,
      list_item_configuration_id: 'config-1',
    };
    axios.get = vi.fn().mockResolvedValue({ data: bookListData });
    await act(async () => {
      renderEditList();
    });

    expect(await screen.findByText('Edit List')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test List')).toBeInTheDocument();
  });

  it('handles list with null list_item_configuration_id', async () => {
    const listDataWithoutConfig = {
      ...mockEditListData,
      list_item_configuration_id: null,
    };
    axios.get = vi.fn().mockResolvedValue({ data: listDataWithoutConfig });
    await act(async () => {
      renderEditList();
    });

    expect(await screen.findByText('Edit List')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test List')).toBeInTheDocument();
  });

  it('handles refreshed list data', async () => {
    const refreshedListData = {
      ...mockEditListData,
      refreshed: true,
    };
    axios.get = vi.fn().mockResolvedValue({ data: refreshedListData });
    await act(async () => {
      renderEditList();
    });

    expect(await screen.findByText('Edit List')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test List')).toBeInTheDocument();
  });

  it('calls the correct API endpoint', async () => {
    axios.get = vi.fn().mockResolvedValue({ data: mockEditListData });
    await act(async () => {
      renderEditList();
    });

    expect(axios.get).toHaveBeenCalledWith('/lists/123/edit');
  });

  it('passes correct props to EditListForm when data is available', async () => {
    axios.get = vi.fn().mockResolvedValue({ data: mockEditListData });
    await act(async () => {
      renderEditList();
    });

    // Verify the form is rendered with correct data
    expect(await screen.findByText('Edit List')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test List')).toBeInTheDocument();
    expect(screen.getByText('Update List')).toBeInTheDocument();
  });
});
