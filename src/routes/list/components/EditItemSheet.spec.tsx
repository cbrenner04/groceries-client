import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AxiosError } from 'axios';

import axios from 'utils/api';
import { defaultTestData, createListItem, createField } from 'test-utils/factories';
import type { IListItemFieldConfiguration } from 'typings';
import EditItemSheet from './EditItemSheet';
import { showToast } from 'utils/toast';

vi.mock('utils/api');
vi.mock('utils/toast');

const mockShowToast = showToast as Mocked<typeof showToast>;

describe('EditItemSheet', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();
  const listId = 'list123';
  const itemId = 'item123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    axios.get = vi.fn().mockImplementation(() => new Promise(() => {}));

    const { getByText } = render(
      <EditItemSheet listId={listId} itemId={itemId} onClose={mockOnClose} onSave={mockOnSave} />,
    );

    expect(getByText('Edit Item')).toBeInTheDocument();
  });

  it('renders form with item data when loaded', async () => {
    const itemData = {
      list: defaultTestData.list,
      item: createListItem('item123', false, [createField('field1', 'product', 'Test Item', 'config1')]),
      list_users: defaultTestData.listUsers,
      list_item_configuration: defaultTestData.listItemConfiguration,
      list_item_field_configurations: (defaultTestData.listItemConfigurations ||
        []) as unknown as IListItemFieldConfiguration[],
      categories: ['Produce', 'Dairy'],
    };

    axios.get = vi.fn().mockResolvedValue({ data: itemData });

    const { getByDisplayValue } = render(
      <EditItemSheet listId={listId} itemId={itemId} onClose={mockOnClose} onSave={mockOnSave} />,
    );

    await waitFor(() => {
      expect(getByDisplayValue('Test Item')).toBeInTheDocument();
    });
  });

  it('calls onClose when bottom sheet is closed', async () => {
    const itemData = {
      list: defaultTestData.list,
      item: createListItem('item123', false, [createField('field1', 'product', 'Test Item', 'config1')]),
      list_users: defaultTestData.listUsers,
      list_item_configuration: defaultTestData.listItemConfiguration,
      list_item_field_configurations: (defaultTestData.listItemConfigurations ||
        []) as unknown as IListItemFieldConfiguration[],
      categories: ['Produce', 'Dairy'],
    };

    axios.get = vi.fn().mockResolvedValue({ data: itemData });

    const { getByRole } = render(
      <EditItemSheet listId={listId} itemId={itemId} onClose={mockOnClose} onSave={mockOnSave} />,
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    // Click the overlay to close
    const overlay = getByRole('dialog');
    await userEvent.click(overlay);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles error when fetching item', async () => {
    const error = new Error('Not found') as AxiosError;
    (error as unknown as { response?: { status?: number } }).response = { status: 404 };
    axios.get = vi.fn().mockRejectedValue(error);

    render(<EditItemSheet listId={listId} itemId={itemId} onClose={mockOnClose} onSave={mockOnSave} />);

    await waitFor(() => {
      expect(mockShowToast.error).toHaveBeenCalledWith('Item not found');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
