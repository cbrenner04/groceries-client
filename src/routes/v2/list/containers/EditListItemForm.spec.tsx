import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'react-toastify';
import { type AxiosError } from 'axios';

import axios from 'utils/api';
import {
  createList,
  createListItem,
  createListUser,
  createListItemConfiguration,
  createField,
} from 'test-utils/factories';
import { EListType, EListItemFieldType } from 'typings';

import EditListItemForm from './EditListItemForm';

// Mock dependencies
jest.mock('utils/api');
jest.mock('react-toastify', () => ({
  toast: jest.fn(),
}));

const mockAxios = axios as jest.Mocked<typeof axios>;
const mockToast = toast as jest.MockedFunction<typeof toast>;

// Helper function to get the form element
const getForm = (): HTMLFormElement => {
  // Try to find the form by looking for any input field and getting its closest form
  const input = screen.getByLabelText('Quantity');
  return input.closest('form')!;
};

// Mock window.location
const mockLocation = {
  href: '',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('EditListItemForm', () => {
  const mockList = createList('123', 'Test List', EListType.GROCERY_LIST);
  const mockItem = createListItem('456', false, [
    createField('field1', 'quantity', '2', '456', { list_item_field_configuration_id: 'field-config1' }),
    createField('field2', 'product', 'Apples', '456', { list_item_field_configuration_id: 'field-config2' }),
  ]);
  const mockListUsers = [createListUser('user1', 'test@example.com')];
  const mockListItemConfiguration = createListItemConfiguration('config1', 'Default Configuration');
  const mockListItemFieldConfigurations = [
    {
      id: 'field-config1',
      label: 'quantity',
      data_type: EListItemFieldType.FREE_TEXT,
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
      data_type: EListItemFieldType.FREE_TEXT,
      position: 1,
      list_item_configuration_id: 'config1',
      user_id: 'test-user-id',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      archived_at: null,
    },
  ];

  const defaultProps = {
    list: mockList,
    item: mockItem,
    listUsers: mockListUsers,
    listItemConfiguration: mockListItemConfiguration,
    listItemFieldConfigurations: mockListItemFieldConfigurations,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation.href = '';
  });

  describe('Rendering', () => {
    it('renders the form with correct title', () => {
      render(<EditListItemForm {...defaultProps} />);
      expect(screen.getByText('Edit 2 Apples')).toBeInTheDocument();
    });

    it('renders form fields with correct labels and values', () => {
      render(<EditListItemForm {...defaultProps} />);

      const quantityInput = screen.getByLabelText('Quantity') as HTMLInputElement;
      const productInput = screen.getByLabelText('Product') as HTMLInputElement;

      expect(quantityInput).toBeInTheDocument();
      expect(productInput).toBeInTheDocument();
      expect(quantityInput.value).toBe('2');
      expect(productInput.value).toBe('Apples');
    });

    it('renders form buttons', () => {
      render(<EditListItemForm {...defaultProps} />);

      expect(screen.getByText('Update Item')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('renders placeholder fields for missing configurations', () => {
      const itemWithMissingFields = createListItem('456', false, [
        createField('field1', 'quantity', '2', '456', { list_item_field_configuration_id: 'field-config1' }),
        // Missing product field
      ]);

      render(<EditListItemForm {...defaultProps} item={itemWithMissingFields} />);

      const quantityInput = screen.getByLabelText('Quantity') as HTMLInputElement;
      const productInput = screen.getByLabelText('Product') as HTMLInputElement;

      expect(quantityInput.value).toBe('2');
      expect(productInput.value).toBe(''); // Empty placeholder
    });
  });

  describe('Form Interactions', () => {
    it('updates field values when user types', () => {
      render(<EditListItemForm {...defaultProps} />);

      const quantityInput = screen.getByLabelText('Quantity') as HTMLInputElement;
      const productInput = screen.getByLabelText('Product') as HTMLInputElement;

      fireEvent.change(quantityInput, { target: { value: '5' } });
      fireEvent.change(productInput, { target: { value: 'Bananas' } });

      expect(quantityInput.value).toBe('5');
      expect(productInput.value).toBe('Bananas');
    });

    it('handles empty field values', () => {
      render(<EditListItemForm {...defaultProps} />);

      const quantityInput = screen.getByLabelText('Quantity') as HTMLInputElement;
      fireEvent.change(quantityInput, { target: { value: '' } });

      expect(quantityInput.value).toBe('');
    });
  });

  describe('Form Submission - Success Cases', () => {
    beforeEach(() => {
      mockAxios.put = jest.fn().mockResolvedValue({});
      mockAxios.post = jest.fn().mockResolvedValue({});
      mockAxios.delete = jest.fn().mockResolvedValue({});
    });

    it('submits form successfully and redirects', async () => {
      render(<EditListItemForm {...defaultProps} />);

      const form = getForm();
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockAxios.put).toHaveBeenCalledTimes(2);
        expect(mockAxios.put).toHaveBeenCalledWith('/v2/lists/123/list_items/456/list_item_fields/field1', {
          list_item_field: {
            data: '2',
            list_item_field_configuration_id: 'field-config1',
          },
        });
        expect(mockAxios.put).toHaveBeenCalledWith('/v2/lists/123/list_items/456/list_item_fields/field2', {
          list_item_field: {
            data: 'Apples',
            list_item_field_configuration_id: 'field-config2',
          },
        });
        expect(mockToast).toHaveBeenCalledWith('Item successfully updated', { type: 'info' });
        expect(mockLocation.href).toBe('/v2/lists/123');
      });
    });

    it('creates new fields when data is provided for placeholder fields', async () => {
      const itemWithMissingFields = createListItem('456', false, [
        createField('field1', 'quantity', '2', '456', { list_item_field_configuration_id: 'field-config1' }),
        // Missing product field
      ]);

      render(<EditListItemForm {...defaultProps} item={itemWithMissingFields} />);

      const productInput = screen.getByLabelText('Product') as HTMLInputElement;
      fireEvent.change(productInput, { target: { value: 'New Product' } });

      const form = getForm();
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockAxios.put).toHaveBeenCalledTimes(1); // Update quantity
        expect(mockAxios.post).toHaveBeenCalledTimes(1); // Create product
        expect(mockAxios.post).toHaveBeenCalledWith('/v2/lists/123/list_items/456/list_item_fields', {
          list_item_field: {
            data: 'New Product',
            list_item_field_configuration_id: 'field-config2',
          },
        });
      });
    });

    it('archives fields when data is cleared', async () => {
      render(<EditListItemForm {...defaultProps} />);

      const quantityInput = screen.getByLabelText('Quantity') as HTMLInputElement;
      fireEvent.change(quantityInput, { target: { value: '' } });

      const form = getForm();
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockAxios.delete).toHaveBeenCalledTimes(1);
        expect(mockAxios.delete).toHaveBeenCalledWith('/v2/lists/123/list_items/456/list_item_fields/field1');
        expect(mockAxios.put).toHaveBeenCalledTimes(1); // Only product field
      });
    });

    it('handles mixed operations (update, create, delete) in single submission', async () => {
      const itemWithMixedFields = createListItem('456', false, [
        createField('field1', 'quantity', '2', '456', { list_item_field_configuration_id: 'field-config1' }),
        // Missing product field
      ]);

      render(<EditListItemForm {...defaultProps} item={itemWithMixedFields} />);

      const quantityInput = screen.getByLabelText('Quantity') as HTMLInputElement;
      const productInput = screen.getByLabelText('Product') as HTMLInputElement;

      fireEvent.change(quantityInput, { target: { value: '' } }); // Clear quantity
      fireEvent.change(productInput, { target: { value: 'New Product' } }); // Add product

      const form = getForm();
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockAxios.delete).toHaveBeenCalledTimes(1); // Delete quantity
        expect(mockAxios.post).toHaveBeenCalledTimes(1); // Create product
      });
    });
  });

  describe('Form Submission - Error Cases', () => {
    it('handles 401 authentication error', async () => {
      const authError = {
        response: { status: 401 },
      } as AxiosError;

      mockAxios.put = jest.fn().mockRejectedValue(authError);

      render(<EditListItemForm {...defaultProps} />);

      const form = getForm();
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
        expect(mockLocation.href).toBe('/users/sign_in');
      });
    });

    it('handles 403 forbidden error', async () => {
      const forbiddenError = {
        response: { status: 403 },
      } as AxiosError;

      mockAxios.put = jest.fn().mockRejectedValue(forbiddenError);

      render(<EditListItemForm {...defaultProps} />);

      const form = getForm();
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith('Item not found', { type: 'error' });
        expect(mockLocation.href).toBe('/v2/lists/123');
      });
    });

    it('handles 404 not found error', async () => {
      const notFoundError = {
        response: { status: 404 },
      } as AxiosError;

      mockAxios.put = jest.fn().mockRejectedValue(notFoundError);

      render(<EditListItemForm {...defaultProps} />);

      const form = getForm();
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith('Item not found', { type: 'error' });
        expect(mockLocation.href).toBe('/v2/lists/123');
      });
    });

    it('handles validation errors for grocery lists', async () => {
      const validationError = {
        response: {
          status: 422,
          data: {
            quantity: 'must be greater than 0',
            product: 'cannot be blank',
          },
        },
      } as AxiosError;

      mockAxios.put = jest.fn().mockRejectedValue(validationError);

      render(<EditListItemForm {...defaultProps} />);

      const form = getForm();
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith('quantity must be greater than 0 and product cannot be blank', {
          type: 'error',
        });
      });
    });

    it('handles validation errors for book lists', async () => {
      const bookList = createList('123', 'Book List', EListType.BOOK_LIST);
      const validationError = {
        response: {
          status: 422,
          data: {
            title: 'cannot be blank',
            author: 'cannot be blank',
          },
        },
      } as AxiosError;

      mockAxios.put = jest.fn().mockRejectedValue(validationError);

      render(<EditListItemForm {...defaultProps} list={bookList} />);

      const form = getForm();
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith('title cannot be blank or author cannot be blank', { type: 'error' });
      });
    });

    it('handles network request errors', async () => {
      const networkError = {
        request: {},
      } as AxiosError;

      mockAxios.put = jest.fn().mockRejectedValue(networkError);

      render(<EditListItemForm {...defaultProps} />);

      const form = getForm();
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
      });
    });

    it('handles generic errors', async () => {
      const genericError = {
        message: 'Unexpected error occurred',
      } as AxiosError;

      mockAxios.put = jest.fn().mockRejectedValue(genericError);

      render(<EditListItemForm {...defaultProps} />);

      const form = getForm();
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith('Unexpected error occurred', { type: 'error' });
      });
    });
  });

  describe('Cancel Functionality', () => {
    it('redirects to list page when cancel is clicked', () => {
      render(<EditListItemForm {...defaultProps} />);

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockLocation.href).toBe('/v2/lists/123');
    });
  });

  describe('Different List Types', () => {
    it('renders book list items correctly', () => {
      const bookList = createList('123', 'Book List', EListType.BOOK_LIST);
      const bookItem = createListItem('456', false, [
        createField('field1', 'title', 'Test Book', '456', { list_item_field_configuration_id: 'field-config1' }),
        createField('field2', 'author', 'Test Author', '456', { list_item_field_configuration_id: 'field-config2' }),
      ]);
      const bookFieldConfigs = [
        {
          id: 'field-config1',
          label: 'title',
          data_type: EListItemFieldType.FREE_TEXT,
          position: 0,
          list_item_configuration_id: 'config1',
          user_id: 'test-user-id',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          archived_at: null,
        },
        {
          id: 'field-config2',
          label: 'author',
          data_type: EListItemFieldType.FREE_TEXT,
          position: 1,
          list_item_configuration_id: 'config1',
          user_id: 'test-user-id',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          archived_at: null,
        },
      ];

      render(
        <EditListItemForm
          {...defaultProps}
          list={bookList}
          item={bookItem}
          listItemFieldConfigurations={bookFieldConfigs}
        />,
      );

      expect(screen.getByText('Edit "Test Book" Test Author')).toBeInTheDocument();
      expect(screen.getByLabelText('Title')).toBeInTheDocument();
      expect(screen.getByLabelText('Author')).toBeInTheDocument();
    });

    it('renders music list items correctly', () => {
      const musicList = createList('123', 'Music List', EListType.MUSIC_LIST);
      const musicItem = createListItem('456', false, [
        createField('field1', 'title', 'Test Song', '456', { list_item_field_configuration_id: 'field-config1' }),
        createField('field2', 'artist', 'Test Artist', '456', { list_item_field_configuration_id: 'field-config2' }),
      ]);
      const musicFieldConfigs = [
        {
          id: 'field-config1',
          label: 'title',
          data_type: EListItemFieldType.FREE_TEXT,
          position: 0,
          list_item_configuration_id: 'config1',
          user_id: 'test-user-id',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          archived_at: null,
        },
        {
          id: 'field-config2',
          label: 'artist',
          data_type: EListItemFieldType.FREE_TEXT,
          position: 1,
          list_item_configuration_id: 'config1',
          user_id: 'test-user-id',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          archived_at: null,
        },
      ];

      render(
        <EditListItemForm
          {...defaultProps}
          list={musicList}
          item={musicItem}
          listItemFieldConfigurations={musicFieldConfigs}
        />,
      );

      expect(screen.getByText('Edit "Test Song" Test Artist')).toBeInTheDocument();
      expect(screen.getByLabelText('Title')).toBeInTheDocument();
      expect(screen.getByLabelText('Artist')).toBeInTheDocument();
    });
  });

  describe('Field Type Handling', () => {
    it('handles different field data types correctly', () => {
      const mixedFieldConfigs = [
        {
          id: 'field-config1',
          label: 'quantity',
          data_type: EListItemFieldType.NUMBER,
          position: 0,
          list_item_configuration_id: 'config1',
          user_id: 'test-user-id',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          archived_at: null,
        },
        {
          id: 'field-config2',
          label: 'completed',
          data_type: EListItemFieldType.BOOLEAN,
          position: 1,
          list_item_configuration_id: 'config1',
          user_id: 'test-user-id',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          archived_at: null,
        },
        {
          id: 'field-config3',
          label: 'due_date',
          data_type: EListItemFieldType.DATE_TIME,
          position: 2,
          list_item_configuration_id: 'config1',
          user_id: 'test-user-id',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          archived_at: null,
        },
      ];

      const itemWithMixedFields = createListItem('456', false, [
        createField('field1', 'quantity', '5', '456', { list_item_field_configuration_id: 'field-config1' }),
        createField('field2', 'completed', 'true', '456', { list_item_field_configuration_id: 'field-config2' }),
        createField('field3', 'due_date', '2023-12-25', '456', { list_item_field_configuration_id: 'field-config3' }),
      ]);

      render(
        <EditListItemForm
          {...defaultProps}
          item={itemWithMixedFields}
          listItemFieldConfigurations={mixedFieldConfigs}
        />,
      );

      expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
      expect(screen.getByLabelText('Completed')).toBeInTheDocument();
      expect(screen.getByLabelText('Due_date')).toBeInTheDocument();
    });
  });
});
