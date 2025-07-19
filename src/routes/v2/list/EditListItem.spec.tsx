import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import axios from 'utils/api';
import { AxiosError } from 'axios';

import { UserContext } from '../../../AppRouter';
import { handleFailure } from '../../../utils/handleFailure';
import {
  createList,
  createListItem,
  createListUser,
  createListItemConfiguration,
  createField,
} from '../../../test-utils/factories';
import { EListType } from '../../../typings';

import EditListItem from './EditListItem';

// Mock useParams for this specific test
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useParams: (): { list_id: string; id: string } => ({ list_id: '123', id: '456' }),
}));

const mockHandleFailure = handleFailure as jest.MockedFunction<typeof handleFailure>;
const mockNavigate = jest.fn();
jest.mock('../../../utils/handleFailure', () => ({
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

const mockEditListItemData = {
  id: '456',
  item: createListItem('456', false, [
    createField('field1', 'quantity', '2', '456', { list_item_field_configuration_id: 'field-config1' }),
    createField('field2', 'product', 'Apples', '456', { list_item_field_configuration_id: 'field-config2' }),
  ]),
  list: createList('123', 'Test List', EListType.GROCERY_LIST),
  list_users: [createListUser('user1', 'test@example.com')],
  list_item_configuration: createListItemConfiguration('config1', 'Default Configuration'),
  list_item_field_configurations: [
    {
      id: 'field-config1',
      label: 'quantity',
      data_type: 'free_text',
      position: 0,
      list_item_configuration_id: 'config1',
      user_id: 'test-user-id',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      archived_at: null,
    },
    {
      id: 'field-config2',
      label: 'product',
      data_type: 'free_text',
      position: 1,
      list_item_configuration_id: 'config1',
      user_id: 'test-user-id',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      archived_at: null,
    },
  ],
};

// Helper function to render the EditListItem component with consistent setup
const renderEditListItem = (): ReturnType<typeof render> => {
  return render(
    <UserContext.Provider value={mockUser}>
      <MemoryRouter initialEntries={['/v2/lists/123/list_items/456/edit']}>
        <Routes>
          <Route path="/v2/lists/:list_id/list_items/:id/edit" element={<EditListItem />} />
          <Route path="/users/sign_in" element={<div>Sign In Page</div>} />
        </Routes>
      </MemoryRouter>
    </UserContext.Provider>,
  );
};

describe('V2 EditListItem', () => {
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
    renderEditListItem();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders edit form when fetch succeeds', async () => {
    axios.get = jest.fn().mockResolvedValue({ data: mockEditListItemData });
    await act(async () => {
      renderEditListItem();
    });

    // Check that the form title is rendered
    expect(await screen.findByText('Edit 2 Apples')).toBeInTheDocument();

    // Check that form fields are rendered
    expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
    expect(screen.getByLabelText('Product')).toBeInTheDocument();

    // Check that form buttons are rendered
    expect(screen.getByText('Update Item')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('renders error state when fetch fails', async () => {
    axios.get = jest.fn().mockRejectedValue(new Error('Network error'));
    await act(async () => {
      renderEditListItem();
    });
    expect(await screen.findByText('Something went wrong!')).toBeInTheDocument();
    expect(screen.getByText('We are currently unable to render this page.')).toBeInTheDocument();
  });

  it('renders error state when data is undefined', async () => {
    axios.get = jest.fn().mockResolvedValue({ data: undefined });
    await act(async () => {
      renderEditListItem();
    });
    expect(await screen.findByText('Something went wrong!')).toBeInTheDocument();
    expect(screen.getByText('We are currently unable to render this page.')).toBeInTheDocument();
  });

  it('handles authentication errors', async () => {
    const authError = new AxiosError('Unauthorized', '401');
    axios.get = jest.fn().mockRejectedValue(authError);
    await act(async () => {
      renderEditListItem();
    });
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(1);
    });
    expect(mockHandleFailure).toHaveBeenCalledWith({
      error: authError,
      notFoundMessage: 'List item not found',
      navigate: mockNavigate,
      redirectURI: '/v2/lists/123/',
    });
  });

  it('handles not found errors', async () => {
    const notFoundError = new AxiosError('Not Found', '404');
    axios.get = jest.fn().mockRejectedValue(notFoundError);
    await act(async () => {
      renderEditListItem();
    });
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(1);
    });
    expect(mockHandleFailure).toHaveBeenCalledWith({
      error: notFoundError,
      notFoundMessage: 'List item not found',
      navigate: mockNavigate,
      redirectURI: '/v2/lists/123/',
    });
  });

  it('calls the correct API endpoint with list_id and id parameters', async () => {
    axios.get = jest.fn().mockResolvedValue({ data: mockEditListItemData });
    await act(async () => {
      renderEditListItem();
    });

    expect(axios.get).toHaveBeenCalledWith('/v2/lists/123/list_items/456/edit');
  });

  it('renders form with correct props when data is fetched successfully', async () => {
    axios.get = jest.fn().mockResolvedValue({ data: mockEditListItemData });
    await act(async () => {
      renderEditListItem();
    });

    // Verify that the form receives the correct props by checking the rendered content
    expect(await screen.findByText('Edit 2 Apples')).toBeInTheDocument();

    // Check that the form fields have the correct initial values
    const quantityInput = screen.getByLabelText('Quantity') as HTMLInputElement;
    const productInput = screen.getByLabelText('Product') as HTMLInputElement;

    expect(quantityInput.value).toBe('2');
    expect(productInput.value).toBe('Apples');
  });

  it('handles different list types correctly', async () => {
    const bookListData = {
      ...mockEditListItemData,
      list: createList('123', 'Book List', EListType.BOOK_LIST),
      item: createListItem('456', false, [
        createField('field1', 'title', 'Test Book', '456'),
        createField('field2', 'author', 'Test Author', '456'),
      ]),
    };

    axios.get = jest.fn().mockResolvedValue({ data: bookListData });
    await act(async () => {
      renderEditListItem();
    });

    expect(await screen.findByText('Edit "Test Book" Test Author')).toBeInTheDocument();
  });

  it('handles empty item fields gracefully', async () => {
    const emptyItemData = {
      ...mockEditListItemData,
      item: createListItem('456', false, []),
    };

    axios.get = jest.fn().mockResolvedValue({ data: emptyItemData });
    await act(async () => {
      renderEditListItem();
    });

    expect(await screen.findByText('Edit')).toBeInTheDocument();
  });
});
