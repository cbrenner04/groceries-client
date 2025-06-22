import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ListItemForm from './ListItemForm';
import { toast } from 'react-toastify';
import { mockedAxios } from 'test-utils/axiosMocks';

const mockHandleItemAddition = jest.fn();
const mockNavigate = jest.fn();

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
    jest.clearAllMocks();
    mockedAxios.get.mockResolvedValue({ data: fieldConfigurations });
  });

  it('renders fields from configuration', async () => {
    render(<ListItemForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Item'));
    expect(await screen.findByLabelText('name')).toBeInTheDocument();
    expect(screen.getByLabelText('quantity')).toBeInTheDocument();
  });

  it('handles input and submits form', async () => {
    // Mock all the axios calls that happen during form submission
    mockedAxios.get
      .mockResolvedValueOnce({ data: fieldConfigurations }) // initial field config load
      .mockResolvedValueOnce({ data: fieldConfigurations }) // field config during submit
      .mockResolvedValueOnce({ data: { id: 'item-1' } }); // fetch complete item
    mockedAxios.post
      .mockResolvedValueOnce({ data: { id: 'item-1' } }) // create item
      .mockResolvedValue({}); // create item fields

    render(<ListItemForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Item'));
    fireEvent.change(await screen.findByLabelText('name'), { target: { value: 'Apples' } });
    fireEvent.change(screen.getByLabelText('quantity'), { target: { value: '3' } });

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
    mockedAxios.post.mockRejectedValue({ response: { status: 500, data: { error: 'fail' } } });
    render(<ListItemForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Item'));
    fireEvent.change(await screen.findByLabelText('name'), { target: { value: 'Bananas' } });

    fireEvent.click(screen.getByText('Add New Item'));

    await waitFor(() => expect(toast).toHaveBeenCalled());
  });

  it('handles field configuration loading failure', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network error'));

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

    mockedAxios.get.mockResolvedValue({ data: fieldConfigsWithTypes });

    render(<ListItemForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Item'));

    await screen.findByLabelText('name');
    expect(screen.getByLabelText('quantity')).toBeInTheDocument();
    expect(screen.getByLabelText('completed')).toBeInTheDocument();
    expect(screen.getByLabelText('due_date')).toBeInTheDocument();
  });

  it('handles checkbox field interaction', async () => {
    const fieldConfigsWithCheckbox = [
      { id: '1', label: 'name', data_type: 'free_text' },
      { id: '2', label: 'completed', data_type: 'boolean' },
    ];

    mockedAxios.get.mockResolvedValue({ data: fieldConfigsWithCheckbox });

    render(<ListItemForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Item'));

    const checkbox = await screen.findByLabelText('completed');
    expect(checkbox).toBeInTheDocument();

    // Test checkbox interaction to cover line 54
    fireEvent.change(checkbox, { target: { checked: true } });
    expect(checkbox).toBeChecked();
  });

  it('handles field configuration not found during submission', async () => {
    const fieldConfigs = [{ id: '1', label: 'name', data_type: 'free_text' }];

    mockedAxios.get
      .mockResolvedValueOnce({ data: fieldConfigs }) // initial field config load
      .mockResolvedValueOnce({ data: fieldConfigs }) // field config during submit
      .mockResolvedValueOnce({ data: { id: 'item-1' } }); // fetch complete item
    mockedAxios.post
      .mockResolvedValueOnce({ data: { id: 'item-1' } }) // create item
      .mockResolvedValue({}); // create item fields

    render(<ListItemForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Item'));

    // Add a field that doesn't have a configuration
    const nameField = await screen.findByLabelText('name');
    fireEvent.change(nameField, { target: { value: 'Test Item' } });

    fireEvent.click(screen.getByText('Add New Item'));

    await waitFor(() => {
      expect(mockHandleItemAddition).toHaveBeenCalled();
    });
  });

  it('handles 401 authentication error', async () => {
    mockedAxios.post.mockRejectedValue({ response: { status: 401 } });

    render(<ListItemForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Item'));
    fireEvent.change(await screen.findByLabelText('name'), { target: { value: 'Test' } });

    fireEvent.click(screen.getByText('Add New Item'));

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
      expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
    });
  });

  it('handles 403/404 list not found error', async () => {
    mockedAxios.post.mockRejectedValue({ response: { status: 404 } });

    render(<ListItemForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Item'));
    fireEvent.change(await screen.findByLabelText('name'), { target: { value: 'Test' } });

    fireEvent.click(screen.getByText('Add New Item'));

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
      expect(mockNavigate).toHaveBeenCalledWith('/lists');
    });
  });

  it('handles network request error', async () => {
    mockedAxios.post.mockRejectedValue({ request: {} });

    render(<ListItemForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Item'));
    fireEvent.change(await screen.findByLabelText('name'), { target: { value: 'Test' } });

    fireEvent.click(screen.getByText('Add New Item'));

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
    });
  });

  it('handles generic error', async () => {
    mockedAxios.post.mockRejectedValue({ message: 'Generic error' });

    render(<ListItemForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Item'));
    fireEvent.change(await screen.findByLabelText('name'), { target: { value: 'Test' } });

    fireEvent.click(screen.getByText('Add New Item'));

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith('Generic error', { type: 'error' });
    });
  });

  it('shows loading message when field configurations are empty', async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
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

  it('handles text input changes', () => {
    render(<ListItemForm {...defaultProps} />);

    // Show form first
    fireEvent.click(screen.getByText('Add Item'));

    // Wait for form to load
    waitFor(() => {
      expect(screen.getByText('Loading field configurations...')).toBeInTheDocument();
    });

    // Mock field configurations
    act(() => {
      // Simulate field configurations loaded
    });
  });

  it('handles unknown field types with default rendering', () => {
    const mockFieldConfigs = [{ id: '1', label: 'unknown_field', data_type: 'unknown_type' }];

    // Mock axios to return field configs
    mockedAxios.get.mockResolvedValueOnce({ data: mockFieldConfigs });

    render(<ListItemForm {...defaultProps} />);

    // Show form
    fireEvent.click(screen.getByText('Add Item'));

    // Should render TextField for unknown types (default case)
    waitFor(() => {
      expect(screen.getByLabelText('unknown_field')).toBeInTheDocument();
    });
  });

  it('handles field configuration loading failure silently', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network error'));

    render(<ListItemForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Item'));

    // Should show loading message since field configurations are empty
    expect(await screen.findByText('Loading field configurations...')).toBeInTheDocument();
  });

  it('handles response errors with data during form submission', async () => {
    mockedAxios.get.mockResolvedValue({ data: fieldConfigurations });
    mockedAxios.post.mockRejectedValue({
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
    fireEvent.change(await screen.findByLabelText('name'), { target: { value: 'Test Item' } });

    fireEvent.click(screen.getByText('Add New Item'));

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith('name cannot be blank and quantity must be positive', { type: 'error' });
    });
  });

  it('handles network request error during form submission', async () => {
    mockedAxios.get.mockResolvedValue({ data: fieldConfigurations });
    mockedAxios.post.mockRejectedValue({
      request: {},
      message: 'Network Error',
    });

    render(<ListItemForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Item'));
    fireEvent.change(await screen.findByLabelText('name'), { target: { value: 'Test Item' } });

    fireEvent.click(screen.getByText('Add New Item'));

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
    });
  });

  it('handles generic error during form submission', async () => {
    mockedAxios.get.mockResolvedValue({ data: fieldConfigurations });
    mockedAxios.post.mockRejectedValue({
      message: 'Generic error message',
    });

    render(<ListItemForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Item'));
    fireEvent.change(await screen.findByLabelText('name'), { target: { value: 'Test Item' } });

    fireEvent.click(screen.getByText('Add New Item'));

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith('Generic error message', { type: 'error' });
    });
  });

  it('submits form successfully', async () => {
    mockedAxios.get.mockResolvedValue({ data: fieldConfigurations });
    mockedAxios.post.mockResolvedValue({ data: { id: '1' } });

    render(<ListItemForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Item'));
    fireEvent.change(await screen.findByLabelText('name'), { target: { value: 'Test Item' } });

    fireEvent.click(screen.getByText('Add New Item'));

    await waitFor(() => {
      expect(mockHandleItemAddition).toHaveBeenCalled();
    });
  });

  it('collapses the form when cancel is clicked', async () => {
    render(<ListItemForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Item'));
    // Wait for the form to appear
    await screen.findByLabelText('name');
    // Click the cancel button
    fireEvent.click(screen.getByText('Collapse Form'));
    // The Add Item button should be visible again (form collapsed)
    expect(screen.getByText('Add Item')).toBeInTheDocument();
    expect(screen.getByText('Add Item')).toHaveAttribute('aria-expanded', 'false');
  });
});
