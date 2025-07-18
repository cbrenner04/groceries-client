import React from 'react';
import { render, type RenderResult, waitFor } from '@testing-library/react';
import { userEvent as user, type UserEvent } from '@testing-library/user-event';
import { toast } from 'react-toastify';
import { type AxiosError } from 'axios';

import axios from 'utils/api';
import {
  EListType,
  EListItemFieldType,
  type IList,
  type IListUser,
  type IListItemConfiguration,
  type IListItemFieldConfiguration,
  type IV2ListItem,
} from 'typings';

import BulkEditListItemsForm, { type IBulkEditListItemsFormProps } from './BulkEditListItemsForm';

// Mock dependencies
jest.mock('utils/api');
jest.mock('react-toastify');

const mockAxios = axios as jest.Mocked<typeof axios>;
const mockToast = toast as jest.MockedFunction<typeof toast>;

describe('BulkEditListItemsForm', () => {
  const mockNavigate = jest.fn();

  const mockList: IList = {
    id: 'list-1',
    name: 'Test List',
    type: EListType.GROCERY_LIST,
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
    },
    {
      id: 'field-config-2',
      label: 'quantity',
      position: 2,
      data_type: EListItemFieldType.NUMBER,
    },
  ];

  const mockItems: IV2ListItem[] = [
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
    jest.clearAllMocks();
    mockAxios.put = jest.fn().mockResolvedValue({});
  });

  it('renders the form with item names in the title', () => {
    const { getByText } = renderComponent();

    expect(getByText('Edit 5 Apples, 3 Bananas')).toBeInTheDocument();
  });

  it('initializes field updates with common values when all items have the same value', () => {
    const itemsWithSameQuantity = [
      {
        ...mockItems[0],
        fields: [{ ...mockItems[0].fields[0] }, { ...mockItems[0].fields[1], data: '5' }],
      },
      {
        ...mockItems[1],
        fields: [{ ...mockItems[1].fields[0] }, { ...mockItems[1].fields[1], data: '5' }],
      },
    ];

    const { getByDisplayValue } = renderComponent({ items: itemsWithSameQuantity });

    // Should show the common value for quantity
    expect(getByDisplayValue('5')).toBeInTheDocument();
  });

  it('submits form with correct parameters when updating fields', async () => {
    const { getByText, user } = renderComponent();

    await user.click(getByText('Update Items'));

    await waitFor(() => {
      expect(mockAxios.put).toHaveBeenCalledWith('/v2/lists/list-1/list_items/bulk_update?item_ids=item-1,item-2', {
        item_ids: 'item-1,item-2',
        list_id: 'list-1',
        list_items: {
          update_current_items: true,
          list_item_fields_attributes: [],
        },
      });
    });

    expect(mockToast).toHaveBeenCalledWith('Items successfully updated', { type: 'info' });
    expect(mockNavigate).toHaveBeenCalledWith('/v2/lists/list-1');
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
        '/v2/lists/list-1/list_items/bulk_update?item_ids=item-1,item-2',
        expect.objectContaining({
          list_items: expect.objectContaining({
            list_item_fields_attributes: expect.arrayContaining([
              expect.objectContaining({
                list_item_field_ids: ['field-1', 'field-3'],
                data: 'Updated Product',
              }),
            ]),
          }),
        }),
      );
    });
  });

  it('handles clear field functionality', async () => {
    const { getByText, user } = renderComponent();

    // Click clear button for the Product field
    const clearCheckbox = document.querySelector('input[id="clear_product"]')!;
    await user.click(clearCheckbox);

    await user.click(getByText('Update Items'));

    await waitFor(() => {
      expect(mockAxios.put).toHaveBeenCalledWith(
        '/v2/lists/list-1/list_items/bulk_update?item_ids=item-1,item-2',
        expect.objectContaining({
          list_items: expect.objectContaining({
            list_item_fields_attributes: expect.arrayContaining([
              expect.objectContaining({
                list_item_field_ids: ['field-1', 'field-3'],
                data: '',
              }),
            ]),
          }),
        }),
      );
    });
  });

  it('handles 401 error response', async () => {
    const axiosError = {
      response: { status: 401 },
    } as AxiosError;
    mockAxios.put = jest.fn().mockRejectedValue(axiosError);

    const { getByText, user } = renderComponent();

    await user.click(getByText('Update Items'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
      expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
    });
  });

  it('handles 404 error response', async () => {
    const axiosError = {
      response: { status: 404 },
    } as AxiosError;
    mockAxios.put = jest.fn().mockRejectedValue(axiosError);

    const { getByText, user } = renderComponent();

    await user.click(getByText('Update Items'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Some items not found', { type: 'error' });
      expect(mockNavigate).toHaveBeenCalledWith('/v2/lists/list-1');
    });
  });

  it('handles 403 error response', async () => {
    const axiosError = {
      response: { status: 403 },
    } as AxiosError;
    mockAxios.put = jest.fn().mockRejectedValue(axiosError);

    const { getByText, user } = renderComponent();

    await user.click(getByText('Update Items'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Some items not found', { type: 'error' });
      expect(mockNavigate).toHaveBeenCalledWith('/v2/lists/list-1');
    });
  });

  it('handles validation errors from server', async () => {
    const axiosError = {
      response: {
        status: 422,
        data: { name: 'cannot be blank', quantity: 'must be a number' },
      },
    } as AxiosError;
    mockAxios.put = jest.fn().mockRejectedValue(axiosError);

    const { getByText, user } = renderComponent();

    await user.click(getByText('Update Items'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('name cannot be blank and quantity must be a number', { type: 'error' });
    });
  });

  it('handles network error', async () => {
    const axiosError = {
      request: {},
    } as AxiosError;
    mockAxios.put = jest.fn().mockRejectedValue(axiosError);

    const { getByText, user } = renderComponent();

    await user.click(getByText('Update Items'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
    });
  });

  it('handles unexpected error', async () => {
    const axiosError = {
      message: 'Unexpected error',
    } as AxiosError;
    mockAxios.put = jest.fn().mockRejectedValue(axiosError);

    const { getByText, user } = renderComponent();

    await user.click(getByText('Update Items'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Unexpected error', { type: 'error' });
    });
  });

  it('cancels form submission', async () => {
    const { getByText, user } = renderComponent();

    await user.click(getByText('Cancel'));

    expect(mockNavigate).toHaveBeenCalledWith('/v2/lists/list-1');
    expect(mockAxios.put).not.toHaveBeenCalled();
  });

  it('filters out empty fields that are not marked for clearing', async () => {
    const { getByText, user } = renderComponent();

    // Don't modify any fields, just submit
    await user.click(getByText('Update Items'));

    await waitFor(() => {
      expect(mockAxios.put).toHaveBeenCalledWith(
        '/v2/lists/list-1/list_items/bulk_update?item_ids=item-1,item-2',
        expect.objectContaining({
          list_items: expect.objectContaining({
            list_item_fields_attributes: [],
          }),
        }),
      );
    });
  });
});
