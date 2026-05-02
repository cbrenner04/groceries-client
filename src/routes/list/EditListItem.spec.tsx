import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import axios from 'utils/api';

import { UserContext } from '../../AppRouter';
import {
  createList,
  createListItem,
  createListUser,
  createListItemConfiguration,
  createField,
} from '../../test-utils/factories';

import EditListItem from './EditListItem';

vi.mock('../../utils/handleFailure', () => ({
  handleFailure: vi.fn(),
}));
vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useParams: (): { list_id: string; id: string } => ({ list_id: '123', id: '456' }),
  useNavigate: (): ReturnType<typeof vi.fn> => vi.fn(),
}));

const mockUser = {
  accessToken: 'test-token',
  client: 'test-client',
  uid: 'test-uid',
};

const mockListData = {
  current_user_id: 'user-1',
  list: createList('123', 'Test List', 'config-grocery'),
  not_completed_items: [
    createListItem('456', false, [
      createField('field1', 'quantity', '2', '456', { list_item_field_configuration_id: 'field-config1' }),
      createField('field2', 'product', 'Apples', '456', { list_item_field_configuration_id: 'field-config2' }),
    ]),
  ],
  completed_items: [],
  list_users: [createListUser('user1', 'test@example.com')],
  permissions: 'write',
  lists_to_update: [],
  list_item_configuration: createListItemConfiguration('config1', 'Default Configuration'),
  categories: [],
  list_item_field_configurations: [
    {
      id: 'field-config1',
      label: 'Quantity',
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
      label: 'Product',
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

const renderEditListItem = (): ReturnType<typeof render> => {
  return render(
    <UserContext.Provider value={mockUser}>
      <MemoryRouter initialEntries={['/lists/123/list_items/456/edit']}>
        <Routes>
          <Route path="/lists/:list_id/list_items/:id/edit" element={<EditListItem />} />
          <Route path="/users/sign_in" element={<div>Sign In Page</div>} />
          <Route path="/lists/:id" element={<div>List Page</div>} />
        </Routes>
      </MemoryRouter>
    </UserContext.Provider>,
  );
};

// Mock axios.get to handle different URLs
const setupApiMock = (listData: typeof mockListData): void => {
  axios.get = vi.fn().mockImplementation((url: string) => {
    if (url.includes('/list_items/456/edit')) {
      // EditItemSheet requests item-specific data
      // Extract the item from the list data
      const item = listData.not_completed_items.find((i) => i.id === '456') || listData.not_completed_items[0];
      return Promise.resolve({
        data: {
          list: listData.list,
          item: item,
          list_users: listData.list_users,
          list_item_configuration: listData.list_item_configuration,
          list_item_field_configurations: listData.list_item_field_configurations,
          categories: listData.categories,
        },
      });
    }
    // EditListItem requests list data
    return Promise.resolve({ data: listData });
  });
};

describe('EditListItem', () => {
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
    renderEditListItem();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders edit form when fetch succeeds', async () => {
    setupApiMock(mockListData);
    await act(async () => {
      renderEditListItem();
    });

    expect(await screen.findByText('Edit Item')).toBeInTheDocument();
  });

  it('renders error state when fetch fails', async () => {
    axios.get = vi.fn().mockRejectedValue(new Error('Network error'));
    await act(async () => {
      renderEditListItem();
    });
    expect(await screen.findByText('Something went wrong!')).toBeInTheDocument();
  });

  it('calls the correct API endpoint with list_id and id parameters', async () => {
    setupApiMock(mockListData);
    await act(async () => {
      renderEditListItem();
    });

    expect(axios.get).toHaveBeenCalledWith('/lists/123', expect.any(Object));
  });

  it('renders form with correct props when data is fetched successfully', async () => {
    setupApiMock(mockListData);
    await act(async () => {
      renderEditListItem();
    });

    expect(await screen.findByText('Edit Item')).toBeInTheDocument();
  });

  it('handles different list types correctly', async () => {
    const bookListData = {
      ...mockListData,
      list: createList('123', 'Book List', 'config-book'),
    };

    setupApiMock(bookListData);
    await act(async () => {
      renderEditListItem();
    });

    expect(await screen.findByText('Edit Item')).toBeInTheDocument();
  });

  it('handles empty item fields gracefully', async () => {
    const emptyItemData = {
      ...mockListData,
      not_completed_items: [createListItem('456', false, [])],
    };

    setupApiMock(emptyItemData);
    await act(async () => {
      renderEditListItem();
    });

    expect(await screen.findByText('Edit Item')).toBeInTheDocument();
  });

  it('handles authentication errors', async () => {
    axios.get = vi.fn().mockRejectedValue(new Error('Unauthorized'));
    await act(async () => {
      renderEditListItem();
    });

    expect(await screen.findByText('Something went wrong!')).toBeInTheDocument();
  });

  it('handles not found errors', async () => {
    axios.get = vi.fn().mockRejectedValue(new Error('Not found'));
    await act(async () => {
      renderEditListItem();
    });

    expect(await screen.findByText('Something went wrong!')).toBeInTheDocument();
  });
});
