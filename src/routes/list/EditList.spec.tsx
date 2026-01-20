import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import axios from 'utils/api';
import { AxiosError } from 'axios';

import { UserContext } from '../../AppRouter';
import { handleFailure } from '../../utils/handleFailure';

import EditList from './EditList';

// Mock useParams for this specific test
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useParams: (): { id: string } => ({ id: '123' }),
}));

const mockHandleFailure = handleFailure as jest.MockedFunction<typeof handleFailure>;
const mockNavigate = jest.fn();
jest.mock('../../utils/handleFailure', () => ({
  handleFailure: jest.fn(),
}));
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: (): ((url: string) => void) => mockNavigate,
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
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    axios.get = jest.fn().mockImplementation(
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
    axios.get = jest.fn().mockResolvedValue({ data: mockEditListData });
    await act(async () => {
      renderEditList();
    });

    expect(await screen.findByText('Edit Test List')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test List')).toBeInTheDocument();
    expect(screen.getByText('Update List')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('renders error state when fetch fails', async () => {
    axios.get = jest.fn().mockRejectedValue(new Error('Network error'));
    await act(async () => {
      renderEditList();
    });
    expect(await screen.findByText('Something went wrong!')).toBeInTheDocument();
    expect(screen.getByText('We are currently unable to render this page.')).toBeInTheDocument();
  });

  it('handles authentication errors', async () => {
    const authError = new AxiosError('Unauthorized', '401');
    axios.get = jest.fn().mockRejectedValue(authError);
    await act(async () => {
      renderEditList();
    });
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(1);
    });
    expect(mockHandleFailure).toHaveBeenCalledWith({
      error: authError,
      notFoundMessage: 'List not found',
      navigate: mockNavigate,
      redirectURI: '/lists',
    });
  });

  it('handles case where data is undefined', async () => {
    axios.get = jest.fn().mockResolvedValue({ data: undefined });
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
    axios.get = jest.fn().mockResolvedValue({ data: completedListData });
    await act(async () => {
      renderEditList();
    });

    expect(await screen.findByText('Edit Test List')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test List')).toBeInTheDocument();
  });

  it('handles different list types', async () => {
    const bookListData = {
      ...mockEditListData,
      list_item_configuration_id: 'config-1',
    };
    axios.get = jest.fn().mockResolvedValue({ data: bookListData });
    await act(async () => {
      renderEditList();
    });

    expect(await screen.findByText('Edit Test List')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test List')).toBeInTheDocument();
  });

  it('handles list with null list_item_configuration_id', async () => {
    const listDataWithoutConfig = {
      ...mockEditListData,
      list_item_configuration_id: null,
    };
    axios.get = jest.fn().mockResolvedValue({ data: listDataWithoutConfig });
    await act(async () => {
      renderEditList();
    });

    expect(await screen.findByText('Edit Test List')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test List')).toBeInTheDocument();
  });

  it('handles refreshed list data', async () => {
    const refreshedListData = {
      ...mockEditListData,
      refreshed: true,
    };
    axios.get = jest.fn().mockResolvedValue({ data: refreshedListData });
    await act(async () => {
      renderEditList();
    });

    expect(await screen.findByText('Edit Test List')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test List')).toBeInTheDocument();
  });

  it('calls the correct API endpoint', async () => {
    axios.get = jest.fn().mockResolvedValue({ data: mockEditListData });
    await act(async () => {
      renderEditList();
    });

    expect(axios.get).toHaveBeenCalledWith('/lists/123/edit');
  });

  it('passes correct props to EditListForm when data is available', async () => {
    axios.get = jest.fn().mockResolvedValue({ data: mockEditListData });
    await act(async () => {
      renderEditList();
    });

    // Verify the form is rendered with correct data
    expect(await screen.findByText('Edit Test List')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test List')).toBeInTheDocument();
    expect(screen.getByText('Update List')).toBeInTheDocument();
  });
});
