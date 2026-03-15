import React from 'react';
import { render, type RenderResult, waitFor } from '@testing-library/react';
import { userEvent as user, type UserEvent } from '@testing-library/user-event';
import { showToast } from '../../../utils/toast';
import { type AxiosError } from 'axios';

import axios from 'utils/api';
import {
  EListItemFieldType,
  type IList,
  type IListUser,
  type IListItemConfiguration,
  type IListItemFieldConfiguration,
  type IListItem,
} from 'typings';

import BulkEditListItemsForm, { type IBulkEditListItemsFormProps } from './BulkEditListItemsForm';
import * as fieldHelpers from '../fieldHelpers';

// Mock dependencies
vi.mock('utils/api');

const mockAxios = axios as jest.Mocked<typeof axios>;
const mockShowToast = showToast as jest.Mocked<typeof showToast>;

describe('BulkEditListItemsForm', () => {
  const mockNavigate = vi.fn();

  const mockList: IList = {
    id: 'list-1',
    name: 'Test List',
    list_item_configuration_id: 'config-1',
    owner_id: 'user-1',
    created_at: '2023-01-01T00:00:00Z',
  };

  const mockListItemConfiguration: IListItemConfiguration = {
    id: 'config-1',
    name: 'Test Config',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: null,
    user_id: 'user-1',
    archived_at: null,
  };

  const mockListItemFieldConfigurations: IListItemFieldConfiguration[] = [
    {
      id: 'field-config-1',
      label: 'product',
      position: 1,
      data_type: EListItemFieldType.FREE_TEXT,
      primary: true,
      list_item_configuration_id: 'config-1',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: null,
      archived_at: null,
    },
    {
      id: 'field-config-2',
      label: 'quantity',
      position: 2,
      data_type: EListItemFieldType.NUMBER,
      primary: false,
      list_item_configuration_id: 'config-1',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: null,
      archived_at: null,
    },
  ];

  const mockItems: IListItem[] = [
    {
      id: 'item-1',
      list_id: 'list-1',
      user_id: 'user-1',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: null,
      archived_at: null,
      refreshed: false,
      completed: false,
      fields: [
        {
          id: 'field-1',
          list_item_id: 'item-1',
          list_item_field_configuration_id: 'field-config-1',
          data: 'Apples',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: null,
          label: 'product',
          archived_at: null,
          user_id: 'user-1',
          position: 1,
          data_type: EListItemFieldType.FREE_TEXT,
        },
        {
          id: 'field-2',
          list_item_id: 'item-1',
          list_item_field_configuration_id: 'field-config-2',
          data: '5',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: null,
          label: 'quantity',
          archived_at: null,
          user_id: 'user-1',
          position: 2,
          data_type: EListItemFieldType.NUMBER,
        },
      ],
    },
    {
      id: 'item-2',
      list_id: 'list-1',
      user_id: 'user-1',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: null,
      archived_at: null,
      refreshed: false,
      completed: false,
      fields: [
        {
          id: 'field-3',
          list_item_id: 'item-2',
          list_item_field_configuration_id: 'field-config-1',
          data: 'Bananas',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: null,
          label: 'product',
          archived_at: null,
          user_id: 'user-1',
          position: 1,
          data_type: EListItemFieldType.FREE_TEXT,
        },
        {
          id: 'field-4',
          list_item_id: 'item-2',
          list_item_field_configuration_id: 'field-config-2',
          data: '3',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: null,
          label: 'quantity',
          archived_at: null,
          user_id: 'user-1',
          position: 2,
          data_type: EListItemFieldType.NUMBER,
        },
      ],
    },
  ];

  const mockLists: IList[] = [];
  const mockCategories: string[] = ['Fruits', 'Vegetables'];
  const mockListUsers: IListUser[] = [];

  const defaultProps: IBulkEditListItemsFormProps = {
    navigate: mockNavigate,
    items: mockItems,
    list: mockList,
    lists: mockLists,
    categories: mockCategories,
    listUsers: mockListUsers,
    listItemConfiguration: mockListItemConfiguration,
    listItemFieldConfigurations: mockListItemFieldConfigurations,
  };

  const renderComponent = (props = {}): RenderResult & { user: UserEvent } => {
    const result = render(<BulkEditListItemsForm {...defaultProps} {...props} />);
    return { ...result, user: user.setup() };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.put = vi.fn().mockResolvedValue({});
  });

  it('renders the form with generic title', () => {
    const { container, getByText } = renderComponent();

    expect(container).toMatchSnapshot();
    expect(getByText('Edit Items')).toBeInTheDocument();
  });

  it('initializes field updates with common values when all items have the same value', () => {
    const itemsWithSameQuantity = [
      {
        ...mockItems[0],
        category: 'Produce',
        fields: [{ ...mockItems[0].fields[0] }, { ...mockItems[0].fields[1], data: '5' }],
      },
      {
        ...mockItems[1],
        category: 'Produce',
        fields: [{ ...mockItems[1].fields[0] }, { ...mockItems[1].fields[1], data: '5' }],
      },
    ];

    const { getByDisplayValue } = renderComponent({ items: itemsWithSameQuantity });

    // Should show the common value for quantity and category
    expect(getByDisplayValue('5')).toBeInTheDocument();
    expect(getByDisplayValue('Produce')).toBeInTheDocument();
  });

  it('submits form with correct parameters when updating fields', async () => {
    const { getByText, user } = renderComponent();

    await user.click(getByText('Update Items'));

    await waitFor(() => {
      expect(mockAxios.put).toHaveBeenCalledWith('/lists/list-1/list_items/bulk_update?item_ids=item-1,item-2', {
        item_ids: 'item-1,item-2',
        list_id: 'list-1',
        list_items: {
          update_current_items: true,
          fields_to_update: [],
        },
      });
    });

    expect(mockShowToast.info).toHaveBeenCalledWith('Items successfully updated');
    expect(mockNavigate).toHaveBeenCalledWith('/lists/list-1');
  });

  it('submits form with updated field values', async () => {
    const { getByLabelText, getByText, user } = renderComponent();

    // Update the product field
    const productField = getByLabelText('Product');
    await user.clear(productField);
    await user.type(productField, 'Updated Product');

    await user.click(getByText('Update Items'));

    await waitFor(() => {
      expect(mockAxios.put).toHaveBeenCalledWith(
        '/lists/list-1/list_items/bulk_update?item_ids=item-1,item-2',
        expect.objectContaining({
          list_items: expect.objectContaining({
            fields_to_update: expect.arrayContaining([
              expect.objectContaining({
                data: 'Updated Product',
                label: 'product',
                item_ids: ['item-1', 'item-2'],
              }),
            ]),
          }),
        }),
      );
    });
  });

  it('does not update state when parseBulkFieldChange returns null (clear_ handled by handleClearField)', async () => {
    vi.spyOn(fieldHelpers, 'parseBulkFieldChange').mockReturnValue(null);
    const { getByLabelText, getByText, user } = renderComponent();

    await user.clear(getByLabelText('Product'));
    await user.type(getByLabelText('Product'), 'Updated Product');
    await user.click(getByText('Update Items'));

    await waitFor(() => {
      expect(mockAxios.put).toHaveBeenCalledWith(
        '/lists/list-1/list_items/bulk_update?item_ids=item-1,item-2',
        expect.objectContaining({
          list_items: expect.objectContaining({
            fields_to_update: [],
          }),
        }),
      );
    });
    vi.restoreAllMocks();
  });

  it('handles clear field functionality', async () => {
    const { getByText, user } = renderComponent();

    // Click clear button for the Product field
    const clearCheckbox = document.querySelector('input[id="clear_product"]') as HTMLElement;
    await user.click(clearCheckbox);

    await user.click(getByText('Update Items'));

    await waitFor(() => {
      expect(mockAxios.put).toHaveBeenCalledWith(
        '/lists/list-1/list_items/bulk_update?item_ids=item-1,item-2',
        expect.objectContaining({
          list_items: expect.objectContaining({
            fields_to_update: expect.arrayContaining([
              expect.objectContaining({
                data: '',
                label: 'product',
                item_ids: ['item-1', 'item-2'],
              }),
            ]),
          }),
        }),
      );
    });
  });

  it('handles toggling clear field off removes field from update', async () => {
    const { getByText, user } = renderComponent();

    // Click clear checkbox to enter clear mode
    const clearCheckbox = document.querySelector('input[id="clear_product"]') as HTMLElement;
    await user.click(clearCheckbox);

    // Click clear checkbox again to exit clear mode
    await user.click(clearCheckbox);

    await user.click(getByText('Update Items'));

    // When clear is toggled off, the field should not be included in the update
    // since it has no data and is not marked for clearing
    await waitFor(() => {
      expect(mockAxios.put).toHaveBeenCalledWith(
        '/lists/list-1/list_items/bulk_update?item_ids=item-1,item-2',
        expect.objectContaining({
          list_items: expect.objectContaining({
            fields_to_update: [], // No fields should be updated
          }),
        }),
      );
    });
  });

  it('handles 401 error response', async () => {
    const axiosError = {
      response: { status: 401 },
    } as AxiosError;
    mockAxios.put = vi.fn().mockRejectedValue(axiosError);

    const { getByText, user } = renderComponent();

    await user.click(getByText('Update Items'));

    await waitFor(() => {
      expect(mockShowToast.error).toHaveBeenCalledWith('You must sign in');
      expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
    });
  });

  it('handles 404 error response', async () => {
    const axiosError = {
      response: { status: 404 },
    } as AxiosError;
    mockAxios.put = vi.fn().mockRejectedValue(axiosError);

    const { getByText, user } = renderComponent();

    await user.click(getByText('Update Items'));

    await waitFor(() => {
      expect(mockShowToast.error).toHaveBeenCalledWith('Some items not found');
      expect(mockNavigate).toHaveBeenCalledWith('/lists/list-1');
    });
  });

  it('handles 403 error response', async () => {
    const axiosError = {
      response: { status: 403 },
    } as AxiosError;
    mockAxios.put = vi.fn().mockRejectedValue(axiosError);

    const { getByText, user } = renderComponent();

    await user.click(getByText('Update Items'));

    await waitFor(() => {
      expect(mockShowToast.error).toHaveBeenCalledWith('Some items not found');
      expect(mockNavigate).toHaveBeenCalledWith('/lists/list-1');
    });
  });

  it('handles validation errors from server', async () => {
    const axiosError = {
      response: {
        status: 422,
        data: { name: 'cannot be blank', quantity: 'must be a number' },
      },
    } as AxiosError;
    mockAxios.put = vi.fn().mockRejectedValue(axiosError);

    const { getByText, user } = renderComponent();

    await user.click(getByText('Update Items'));

    await waitFor(() => {
      expect(mockShowToast.error).toHaveBeenCalledWith('name cannot be blank and quantity must be a number');
    });
  });

  it('handles network error', async () => {
    const axiosError = {
      request: {},
    } as AxiosError;
    mockAxios.put = vi.fn().mockRejectedValue(axiosError);

    const { getByText, user } = renderComponent();

    await user.click(getByText('Update Items'));

    await waitFor(() => {
      expect(mockShowToast.error).toHaveBeenCalledWith('Something went wrong');
    });
  });

  it('handles unexpected error', async () => {
    const axiosError = {
      message: 'Unexpected error',
    } as AxiosError;
    mockAxios.put = vi.fn().mockRejectedValue(axiosError);

    const { getByText, user } = renderComponent();

    await user.click(getByText('Update Items'));

    await waitFor(() => {
      expect(mockShowToast.error).toHaveBeenCalledWith('Unexpected error');
    });
  });

  it('cancels form submission', async () => {
    const { getByText, user } = renderComponent();

    await user.click(getByText('Cancel'));

    expect(mockNavigate).toHaveBeenCalledWith('/lists/list-1');
    expect(mockAxios.put).not.toHaveBeenCalled();
  });

  it('submits category as empty when Clear Category is checked', async () => {
    const itemsWithCategory = mockItems.map((item) => ({ ...item, category: 'Produce' }));
    const { getByText, user } = renderComponent({ items: itemsWithCategory });

    const clearCategoryCheckbox = document.querySelector('input[id="clear_category"]') as HTMLElement;
    await user.click(clearCategoryCheckbox);

    await user.click(getByText('Update Items'));

    await waitFor(() => {
      expect(mockAxios.put).toHaveBeenCalledWith(
        '/lists/list-1/list_items/bulk_update?item_ids=item-1,item-2',
        expect.objectContaining({
          list_items: expect.objectContaining({
            fields_to_update: expect.arrayContaining([
              expect.objectContaining({
                data: '',
                label: 'category',
                item_ids: ['item-1', 'item-2'],
              }),
            ]),
          }),
        }),
      );
    });
  });

  it('unsets clear category when user types in category field', async () => {
    const itemsWithCategory = mockItems.map((item) => ({ ...item, category: 'Produce' }));
    const { getByText, user } = renderComponent({ items: itemsWithCategory });

    const clearCategoryCheckbox = document.querySelector('input[id="clear_category"]') as HTMLElement;
    await user.click(clearCategoryCheckbox);

    const categoryInput = document.querySelector('input[id="category"]') as HTMLElement;
    await user.type(categoryInput, 'Dairy');

    await user.click(getByText('Update Items'));

    await waitFor(() => {
      expect(mockAxios.put).toHaveBeenCalledWith(
        '/lists/list-1/list_items/bulk_update?item_ids=item-1,item-2',
        expect.objectContaining({
          list_items: expect.objectContaining({
            fields_to_update: expect.arrayContaining([
              expect.objectContaining({
                data: 'Dairy',
                label: 'category',
                item_ids: ['item-1', 'item-2'],
              }),
            ]),
          }),
        }),
      );
    });
  });

  it('filters out empty fields that are not marked for clearing', async () => {
    const { getByText, user } = renderComponent();

    // Don't modify any fields, just submit
    await user.click(getByText('Update Items'));

    await waitFor(() => {
      expect(mockAxios.put).toHaveBeenCalledWith(
        '/lists/list-1/list_items/bulk_update?item_ids=item-1,item-2',
        expect.objectContaining({
          list_items: expect.objectContaining({
            fields_to_update: [],
          }),
        }),
      );
    });
  });

  describe('category auto-creation', () => {
    beforeEach(() => {
      mockAxios.post = vi.fn().mockResolvedValue({});
    });

    it('creates a new category when a category value is provided', async () => {
      const { getByLabelText, getByText, user } = renderComponent();

      // Enter a new category
      const categoryField = getByLabelText('Category');
      await user.clear(categoryField);
      await user.type(categoryField, 'New Category');

      await user.click(getByText('Update Items'));

      await waitFor(() => {
        expect(mockAxios.post).toHaveBeenCalledWith('/lists/list-1/categories', {
          category: { name: 'New Category' },
        });
      });

      expect(mockShowToast.info).toHaveBeenCalledWith('Items successfully updated');
      expect(mockNavigate).toHaveBeenCalledWith('/lists/list-1');
    });

    it('does not create a category when no category value is provided', async () => {
      const { getByText, user } = renderComponent();

      await user.click(getByText('Update Items'));

      await waitFor(() => {
        expect(mockAxios.put).toHaveBeenCalled();
      });

      expect(mockAxios.post).not.toHaveBeenCalled();
      expect(mockShowToast.info).toHaveBeenCalledWith('Items successfully updated');
    });

    it('continues successfully when category creation fails', async () => {
      mockAxios.post = vi.fn().mockRejectedValue({ response: { status: 422 } });

      const { getByLabelText, getByText, user } = renderComponent();

      // Enter a category that already exists
      const categoryField = getByLabelText('Category');
      await user.clear(categoryField);
      await user.type(categoryField, 'Existing Category');

      await user.click(getByText('Update Items'));

      await waitFor(() => {
        expect(mockAxios.post).toHaveBeenCalledWith('/lists/list-1/categories', {
          category: { name: 'Existing Category' },
        });
      });

      // Should still show success and navigate, even though POST failed
      expect(mockShowToast.info).toHaveBeenCalledWith('Items successfully updated');
      expect(mockNavigate).toHaveBeenCalledWith('/lists/list-1');
    });
  });
});
