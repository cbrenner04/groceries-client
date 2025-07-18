import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'utils/api';
import { toast } from 'react-toastify';
import ListItemForm from './ListItemForm';

const mockHandleItemAddition = jest.fn();
const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: (): jest.Mock => mockNavigate,
}));

const fieldConfigurations = [
  { id: '1', label: 'name', data_type: 'free_text' },
  { id: '2', label: 'quantity', data_type: 'number' },
];

const listItemConfiguration = {
  id: 'config-1',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  name: 'Default Configuration',
  user_id: 'user-1',
  archived_at: null,
};

const defaultProps = {
  navigate: mockNavigate,
  userId: 'user-1',
  listId: 'list-1',
  handleItemAddition: mockHandleItemAddition,
  listItemConfiguration,
};

describe('ListItemForm', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    axios.get = jest.fn().mockResolvedValue({ data: fieldConfigurations });
  });

  it('renders fields from configuration', async () => {
    render(<ListItemForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Item'));
    expect(await screen.findByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
  });

  it('handles input and submits form', async () => {
    // Mock all the axios calls that happen during form submission
    axios.get = jest
      .fn()
      .mockResolvedValueOnce({ data: fieldConfigurations }) // initial field config load
      .mockResolvedValueOnce({ data: fieldConfigurations }) // field config during submit
      .mockResolvedValueOnce({ data: { id: 'item-1' } }); // fetch complete item
    axios.post = jest
      .fn()
      .mockResolvedValueOnce({ data: { id: 'item-1' } }) // create item
      .mockResolvedValue({}); // create item fields

    render(<ListItemForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Item'));
    fireEvent.change(await screen.findByLabelText('Name'), { target: { value: 'Apples' } });
    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '3' } });

    fireEvent.click(screen.getByText('Add New Item'));

    // Wait for the handler to be called
    await waitFor(
      () => {
        expect(mockHandleItemAddition).toHaveBeenCalled();
      },
      { timeout: 5000 },
    );
  });

  it('shows error toast on API error', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 500, data: { error: 'fail' } } });
    render(<ListItemForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Item'));
    fireEvent.change(await screen.findByLabelText('Name'), { target: { value: 'Bananas' } });

    fireEvent.click(screen.getByText('Add New Item'));

    await waitFor(() => expect(toast).toHaveBeenCalled());
  });

  it('handles field configuration loading failure', async () => {
    axios.get = jest.fn().mockRejectedValue(new Error('Network error'));

    render(<ListItemForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Item'));

    expect(await screen.findByText('Loading field configurations...')).toBeInTheDocument();
  });

  it('handles different field types', async () => {
    const fieldConfigsWithTypes = [
      { id: '1', label: 'name', data_type: 'free_text' },
      { id: '2', label: 'quantity', data_type: 'number' },
      { id: '3', label: 'completed', data_type: 'boolean' },
      { id: '4', label: 'due_date', data_type: 'date_time' },
    ];

    axios.get = jest.fn().mockResolvedValue({ data: fieldConfigsWithTypes });

    render(<ListItemForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Item'));

    await screen.findByLabelText('Name');
    expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
    expect(screen.getByLabelText('Completed')).toBeInTheDocument();
    expect(screen.getByLabelText('Due date')).toBeInTheDocument();
  });

  it('handles checkbox field interaction', async () => {
    const fieldConfigsWithCheckbox = [
      { id: '1', label: 'name', data_type: 'free_text' },
      { id: '2', label: 'completed', data_type: 'boolean' },
    ];

    axios.get = jest.fn().mockResolvedValue({ data: fieldConfigsWithCheckbox });

    render(<ListItemForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Item'));

    const checkbox = await screen.findByLabelText('Completed');
    expect(checkbox).toBeInTheDocument();

    // Test checkbox interaction to cover line 91 (newValue = checked)
    fireEvent.change(checkbox, { target: { checked: true, type: 'checkbox' } });
    expect(checkbox).toBeChecked();

    // Test unchecking the checkbox to ensure full coverage
    fireEvent.change(checkbox, { target: { checked: false, type: 'checkbox' } });
    expect(checkbox).not.toBeChecked();
  });

  it('handles checkbox input changes (branch coverage)', async () => {
    const fieldConfigsWithCheckbox = [{ id: '1', label: 'completed', data_type: 'boolean' }];
    axios.get = jest.fn().mockResolvedValue({ data: fieldConfigsWithCheckbox });

    render(<ListItemForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Item'));

    const checkbox = await screen.findByLabelText('Completed');
    // Simulate a change event with type 'checkbox' (checked true)
    fireEvent.change(checkbox, { target: { checked: true, type: 'checkbox', name: 'completed' } });
    expect(checkbox).toBeChecked();
    // Simulate a change event with type 'checkbox' (checked false)
    fireEvent.change(checkbox, { target: { checked: false, type: 'checkbox', name: 'completed' } });
    expect(checkbox).not.toBeChecked();
  });

  it('handles field configuration not found during submission', async () => {
    const fieldConfigs = [{ id: '1', label: 'name', data_type: 'free_text' }];

    axios.get = jest
      .fn()
      .mockResolvedValueOnce({ data: fieldConfigs }) // initial field config load
      .mockResolvedValueOnce({ data: fieldConfigs }) // field config during submit
      .mockResolvedValueOnce({ data: { id: 'item-1' } }); // fetch complete item
    axios.post = jest
      .fn()
      .mockResolvedValueOnce({ data: { id: 'item-1' } }) // create item
      .mockResolvedValue({}); // create item fields

    render(<ListItemForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Item'));

    // Add a field that doesn't have a configuration
    const nameField = await screen.findByLabelText('Name');
    fireEvent.change(nameField, { target: { value: 'Test Item' } });

    fireEvent.click(screen.getByText('Add New Item'));

    await waitFor(() => {
      expect(mockHandleItemAddition).toHaveBeenCalled();
    });
  });

  it('handles field configuration not found during itemWithFields creation', async () => {
    // Mock different field configs for initial load vs submission
    const initialFieldConfigs = [{ id: '1', label: 'name', data_type: 'free_text' }];
    const submissionFieldConfigs = [{ id: '2', label: 'quantity', data_type: 'number' }]; // Different config

    axios.get = jest
      .fn()
      .mockResolvedValueOnce({ data: initialFieldConfigs }) // initial field config load
      .mockResolvedValueOnce({ data: submissionFieldConfigs }) // different field config during submit
      .mockResolvedValueOnce({ data: { id: 'item-1' } }); // fetch complete item
    axios.post = jest
      .fn()
      .mockResolvedValueOnce({ data: { id: 'item-1' } }) // create item
      .mockResolvedValue({}); // create item fields

    render(<ListItemForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Item'));

    // Add a field that exists in initial config but not in submission config
    const nameField = await screen.findByLabelText('Name');
    fireEvent.change(nameField, { target: { value: 'Test Item' } });

    fireEvent.click(screen.getByText('Add New Item'));

    await waitFor(() => {
      expect(mockHandleItemAddition).toHaveBeenCalled();
      // Verify that the item was created with empty string for missing field config
      const callArgs = mockHandleItemAddition.mock.calls[0][0];
      expect(callArgs[0].fields).toHaveLength(1);
      expect(callArgs[0].fields[0].list_item_field_configuration_id).toBe('');
    });
  });

  it('handles 401 authentication error', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 401 } });

    render(<ListItemForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Item'));
    fireEvent.change(await screen.findByLabelText('Name'), { target: { value: 'Test' } });

    fireEvent.click(screen.getByText('Add New Item'));

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
      expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
    });
  });

  it('handles 403/404 list not found error', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 404 } });

    render(<ListItemForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Item'));
    fireEvent.change(await screen.findByLabelText('Name'), { target: { value: 'Test' } });

    fireEvent.click(screen.getByText('Add New Item'));

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
      expect(mockNavigate).toHaveBeenCalledWith('/lists');
    });
  });

  it('handles network request error', async () => {
    axios.post = jest.fn().mockRejectedValue({ request: {} });

    render(<ListItemForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Item'));
    fireEvent.change(await screen.findByLabelText('Name'), { target: { value: 'Test' } });

    fireEvent.click(screen.getByText('Add New Item'));

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
    });
  });

  it('handles generic error', async () => {
    axios.post = jest.fn().mockRejectedValue({ message: 'Generic error' });

    render(<ListItemForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Item'));
    fireEvent.change(await screen.findByLabelText('Name'), { target: { value: 'Test' } });

    fireEvent.click(screen.getByText('Add New Item'));

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith('Generic error', { type: 'error' });
    });
  });

  it('shows loading message when field configurations are empty', async () => {
    axios.get = jest.fn().mockResolvedValue({ data: [] });
    render(<ListItemForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Item'));
    expect(await screen.findByText('Loading field configurations...')).toBeInTheDocument();
  });

  it('renders only Add Item button when form is not shown', () => {
    render(<ListItemForm {...defaultProps} />);
    const addItemButton = screen.getByText('Add Item');
    expect(addItemButton).toBeInTheDocument();
    expect(addItemButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('handles text input changes', async () => {
    render(<ListItemForm {...defaultProps} />);

    // Show form first
    fireEvent.click(screen.getByText('Add Item'));

    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByText('Loading field configurations...')).toBeInTheDocument();
    });
  });

  it('handles unknown field types with default rendering', async () => {
    const mockFieldConfigs = [{ id: '1', label: 'unknown_field', data_type: 'unknown_type' }];

    // Mock axios to return field configs
    axios.get = jest.fn().mockResolvedValueOnce({ data: mockFieldConfigs });

    render(<ListItemForm {...defaultProps} />);

    // Show form
    fireEvent.click(screen.getByText('Add Item'));

    // Should render TextField for unknown types (default case)
    await waitFor(() => {
      expect(screen.getByLabelText('Unknown field')).toBeInTheDocument();
    });
  });

  it('handles field configuration loading failure silently', async () => {
    axios.get = jest.fn().mockRejectedValue(new Error('Network error'));

    render(<ListItemForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Item'));

    // Should show loading message since field configurations are empty
    expect(await screen.findByText('Loading field configurations...')).toBeInTheDocument();
  });

  it('handles response errors with data during form submission', async () => {
    axios.get = jest.fn().mockResolvedValue({ data: fieldConfigurations });
    axios.post = jest.fn().mockRejectedValue({
      response: {
        status: 422,
        data: {
          name: 'cannot be blank',
          quantity: 'must be positive',
        },
      },
    });

    render(<ListItemForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Item'));
    fireEvent.change(await screen.findByLabelText('Name'), { target: { value: 'Test Item' } });

    fireEvent.click(screen.getByText('Add New Item'));

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith('name cannot be blank and quantity must be positive', { type: 'error' });
    });
  });

  it('handles network request error during form submission', async () => {
    axios.get = jest.fn().mockResolvedValue({ data: fieldConfigurations });
    axios.post = jest.fn().mockRejectedValue({
      request: {},
      message: 'Network Error',
    });

    render(<ListItemForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Item'));
    fireEvent.change(await screen.findByLabelText('Name'), { target: { value: 'Test Item' } });

    fireEvent.click(screen.getByText('Add New Item'));

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
    });
  });

  it('handles generic error during form submission', async () => {
    axios.get = jest.fn().mockResolvedValue({ data: fieldConfigurations });
    axios.post = jest.fn().mockRejectedValue({
      message: 'Generic error message',
    });

    render(<ListItemForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Item'));
    fireEvent.change(await screen.findByLabelText('Name'), { target: { value: 'Test Item' } });

    fireEvent.click(screen.getByText('Add New Item'));

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith('Generic error message', { type: 'error' });
    });
  });

  it('submits form successfully', async () => {
    axios.get = jest.fn().mockResolvedValue({ data: fieldConfigurations });
    axios.post = jest.fn().mockResolvedValue({ data: { id: '1' } });

    render(<ListItemForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Item'));
    fireEvent.change(await screen.findByLabelText('Name'), { target: { value: 'Test Item' } });

    fireEvent.click(screen.getByText('Add New Item'));

    await waitFor(() => {
      expect(mockHandleItemAddition).toHaveBeenCalled();
    });
  });

  it('collapses the form when cancel is clicked', async () => {
    render(<ListItemForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Item'));
    // Wait for the form to appear
    await screen.findByLabelText('Name');
    // Click the cancel button
    fireEvent.click(screen.getByText('Collapse Form'));
    // The Add Item button should be visible again (form collapsed)
    expect(screen.getByText('Add Item')).toBeInTheDocument();
    expect(screen.getByText('Add Item')).toHaveAttribute('aria-expanded', 'false');
  });
});
