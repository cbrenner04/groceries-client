import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import BulkEditListItemsFormFields, { type IBulkEditListItemsFormFieldsProps } from './BulkEditListItemsFormFields';

async function setup(suppliedProps?: Partial<IBulkEditListItemsFormFieldsProps>): Promise<{
  props: IBulkEditListItemsFormFieldsProps;
  user: UserEvent;
}> {
  const user = userEvent.setup();
  const defaultProps: IBulkEditListItemsFormFieldsProps = {
    fieldConfigurations: [
      {
        id: 'field1',
        label: 'title',
        data_type: 'free_text',
        position: 1,
      },
      {
        id: 'field2',
        label: 'completed',
        data_type: 'boolean',
        position: 2,
      },
      {
        id: 'field3',
        label: 'due_date',
        data_type: 'date_time',
        position: 3,
      },
      {
        id: 'field4',
        label: 'quantity',
        data_type: 'number',
        position: 4,
      },
    ],
    fieldUpdates: [
      {
        label: 'title',
        data: 'Test Item',
        clear: false,
      },
      {
        label: 'completed',
        data: 'true',
        clear: false,
      },
      {
        label: 'due_date',
        data: '2024-01-15',
        clear: false,
      },
      {
        label: 'quantity',
        data: '5',
        clear: false,
      },
    ],
    handleFieldChange: jest.fn(),
    handleClearField: jest.fn(),
    listType: 'grocery',
  };
  const props = { ...defaultProps, ...suppliedProps };
  render(<BulkEditListItemsFormFields {...props} />);
  return { props, user };
}

describe('BulkEditListItemsFormFields', () => {
  it('renders the component with all field types', async () => {
    await setup();

    // Check that the description is rendered
    expect(screen.getByText('Update attributes for all items.')).toBeInTheDocument();

    // Check that all fields are rendered
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Completed')).toBeInTheDocument();
    expect(screen.getByLabelText('Due date')).toBeInTheDocument();
    expect(screen.getByLabelText('Quantity')).toBeInTheDocument();

    // Check that clear checkboxes are rendered for each field
    expect(screen.getByLabelText('Clear Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Clear Completed')).toBeInTheDocument();
    expect(screen.getByLabelText('Clear Due date')).toBeInTheDocument();
    expect(screen.getByLabelText('Clear Quantity')).toBeInTheDocument();
  });

  it('renders fields with correct values', async () => {
    await setup();

    // Check field values
    expect(screen.getByLabelText('Title')).toHaveValue('Test Item');
    expect(screen.getByLabelText('Completed')).toBeChecked();
    expect(screen.getByLabelText('Due date')).toHaveValue('2024-01-15');
    expect(screen.getByLabelText('Quantity')).toHaveValue(5);
  });

  it('renders fields with empty values when no field updates provided', async () => {
    await setup({
      fieldUpdates: [],
    });

    expect(screen.getByLabelText('Title')).toHaveValue('');
    expect(screen.getByLabelText('Completed')).not.toBeChecked();
    expect(screen.getByLabelText('Due date')).toHaveValue('');
    expect(screen.getByLabelText('Quantity')).toHaveValue(null);
  });

  it('capitalizes field labels correctly', async () => {
    await setup({
      fieldConfigurations: [
        {
          id: 'field1',
          label: 'product_name',
          data_type: 'free_text',
          position: 1,
        },
        {
          id: 'field2',
          label: 'is_urgent',
          data_type: 'boolean',
          position: 2,
        },
      ],
      fieldUpdates: [
        {
          label: 'product_name',
          data: 'Apple',
          clear: false,
        },
        {
          label: 'is_urgent',
          data: 'true',
          clear: false,
        },
      ],
    });

    expect(screen.getByLabelText('Product name')).toBeInTheDocument();
    expect(screen.getByLabelText('Is urgent')).toBeInTheDocument();
  });

  it('sorts fields by position when provided', async () => {
    await setup({
      fieldConfigurations: [
        {
          id: 'field3',
          label: 'third',
          data_type: 'free_text',
          position: 3,
        },
        {
          id: 'field1',
          label: 'first',
          data_type: 'free_text',
          position: 1,
        },
        {
          id: 'field2',
          label: 'second',
          data_type: 'free_text',
          position: 2,
        },
      ],
      fieldUpdates: [
        {
          label: 'first',
          data: 'First Value',
          clear: false,
        },
        {
          label: 'second',
          data: 'Second Value',
          clear: false,
        },
        {
          label: 'third',
          data: 'Third Value',
          clear: false,
        },
      ],
    });

    const textFields = screen.getAllByRole('textbox');
    expect(textFields[0]).toHaveValue('First Value');
    expect(textFields[1]).toHaveValue('Second Value');
    expect(textFields[2]).toHaveValue('Third Value');
  });

  it('handles fields without position (defaults to 0)', async () => {
    await setup({
      fieldConfigurations: [
        {
          id: 'field1',
          label: 'no_position',
          data_type: 'free_text',
        },
        {
          id: 'field2',
          label: 'with_position',
          data_type: 'free_text',
          position: 1,
        },
      ],
      fieldUpdates: [
        {
          label: 'no_position',
          data: 'No Position Value',
          clear: false,
        },
        {
          label: 'with_position',
          data: 'With Position Value',
          clear: false,
        },
      ],
    });

    const textFields = screen.getAllByRole('textbox');
    expect(textFields[0]).toHaveValue('No Position Value');
    expect(textFields[1]).toHaveValue('With Position Value');
  });

  describe('field interactions', () => {
    it('calls handleFieldChange when text field changes', async () => {
      const { props, user } = await setup();
      const titleField = screen.getByLabelText('Title');

      await user.type(titleField, ' Updated');

      expect(props.handleFieldChange).toHaveBeenCalled();
    });

    it('calls handleFieldChange when checkbox changes', async () => {
      const { props, user } = await setup();
      const completedField = screen.getByLabelText('Completed');

      await user.click(completedField);

      expect(props.handleFieldChange).toHaveBeenCalled();
    });

    it('calls handleFieldChange when date field changes', async () => {
      const { props, user } = await setup();
      const dateField = screen.getByLabelText('Due date');

      await user.clear(dateField);
      await user.type(dateField, '2024-02-01');

      expect(props.handleFieldChange).toHaveBeenCalled();
    });

    it('calls handleFieldChange when number field changes', async () => {
      const { props, user } = await setup();
      const quantityField = screen.getByLabelText('Quantity');

      await user.type(quantityField, '10');

      expect(props.handleFieldChange).toHaveBeenCalled();
    });

    it('calls handleClearField when clear checkbox is clicked', async () => {
      const { props, user } = await setup();
      const clearTitleCheckbox = screen.getByLabelText('Clear Title');

      await user.click(clearTitleCheckbox);

      expect(props.handleClearField).toHaveBeenCalledWith('title');
    });
  });

  describe('boolean field handling', () => {
    it('handles boolean field with true value', async () => {
      await setup({
        fieldConfigurations: [
          {
            id: 'field1',
            label: 'completed',
            data_type: 'boolean',
            position: 1,
          },
        ],
        fieldUpdates: [
          {
            label: 'completed',
            data: 'true',
            clear: false,
          },
        ],
      });

      expect(screen.getByLabelText('Completed')).toBeChecked();
    });

    it('handles boolean field with false value', async () => {
      await setup({
        fieldConfigurations: [
          {
            id: 'field1',
            label: 'completed',
            data_type: 'boolean',
            position: 1,
          },
        ],
        fieldUpdates: [
          {
            label: 'completed',
            data: 'false',
            clear: false,
          },
        ],
      });

      expect(screen.getByLabelText('Completed')).not.toBeChecked();
    });

    it('handles boolean field with empty value', async () => {
      await setup({
        fieldConfigurations: [
          {
            id: 'field1',
            label: 'completed',
            data_type: 'boolean',
            position: 1,
          },
        ],
        fieldUpdates: [
          {
            label: 'completed',
            data: '',
            clear: false,
          },
        ],
      });

      expect(screen.getByLabelText('Completed')).not.toBeChecked();
    });
  });

  describe('number field handling', () => {
    it('handles number field with valid number', async () => {
      await setup({
        fieldConfigurations: [
          {
            id: 'field1',
            label: 'quantity',
            data_type: 'number',
            position: 1,
          },
        ],
        fieldUpdates: [
          {
            label: 'quantity',
            data: '42',
            clear: false,
          },
        ],
      });

      expect(screen.getByLabelText('Quantity')).toHaveValue(42);
    });

    it('handles number field with empty value', async () => {
      await setup({
        fieldConfigurations: [
          {
            id: 'field1',
            label: 'quantity',
            data_type: 'number',
            position: 1,
          },
        ],
        fieldUpdates: [
          {
            label: 'quantity',
            data: '',
            clear: false,
          },
        ],
      });

      expect(screen.getByLabelText('Quantity')).toHaveValue(null);
    });
  });

  describe('clear field functionality', () => {
    it('shows clear checkbox as checked when field is marked for clearing', async () => {
      await setup({
        fieldUpdates: [
          {
            label: 'title',
            data: 'Test Item',
            clear: true,
          },
        ],
      });

      expect(screen.getByLabelText('Clear Title')).toBeChecked();
    });

    it('shows clear checkbox as unchecked when field is not marked for clearing', async () => {
      await setup({
        fieldUpdates: [
          {
            label: 'title',
            data: 'Test Item',
            clear: false,
          },
        ],
      });

      expect(screen.getByLabelText('Clear Title')).not.toBeChecked();
    });

    it('calls handleClearField with correct label for each field type', async () => {
      const { props, user } = await setup();

      // Test clear checkbox for text field
      await user.click(screen.getByLabelText('Clear Title'));
      expect(props.handleClearField).toHaveBeenCalledWith('title');

      // Test clear checkbox for boolean field
      await user.click(screen.getByLabelText('Clear Completed'));
      expect(props.handleClearField).toHaveBeenCalledWith('completed');

      // Test clear checkbox for date field
      await user.click(screen.getByLabelText('Clear Due date'));
      expect(props.handleClearField).toHaveBeenCalledWith('due_date');

      // Test clear checkbox for number field
      await user.click(screen.getByLabelText('Clear Quantity'));
      expect(props.handleClearField).toHaveBeenCalledWith('quantity');
    });
  });

  describe('field type rendering', () => {
    it('renders text field for free_text data type', async () => {
      await setup({
        fieldConfigurations: [
          {
            id: 'field1',
            label: 'description',
            data_type: 'free_text',
            position: 1,
          },
        ],
        fieldUpdates: [
          {
            label: 'description',
            data: 'Some description',
            clear: false,
          },
        ],
      });

      const textField = screen.getByLabelText('Description');
      expect(textField).toHaveAttribute('type', 'text');
      expect(textField).toHaveValue('Some description');
    });

    it('renders checkbox for boolean data type', async () => {
      await setup({
        fieldConfigurations: [
          {
            id: 'field1',
            label: 'urgent',
            data_type: 'boolean',
            position: 1,
          },
        ],
        fieldUpdates: [
          {
            label: 'urgent',
            data: 'true',
            clear: false,
          },
        ],
      });

      const checkbox = screen.getByLabelText('Urgent');
      expect(checkbox).toHaveAttribute('type', 'checkbox');
      expect(checkbox).toBeChecked();
    });

    it('renders date input for date_time data type', async () => {
      await setup({
        fieldConfigurations: [
          {
            id: 'field1',
            label: 'deadline',
            data_type: 'date_time',
            position: 1,
          },
        ],
        fieldUpdates: [
          {
            label: 'deadline',
            data: '2024-12-25',
            clear: false,
          },
        ],
      });

      const dateField = screen.getByLabelText('Deadline');
      expect(dateField).toHaveAttribute('type', 'date');
      expect(dateField).toHaveValue('2024-12-25');
    });

    it('renders number input for number data type', async () => {
      await setup({
        fieldConfigurations: [
          {
            id: 'field1',
            label: 'price',
            data_type: 'number',
            position: 1,
          },
        ],
        fieldUpdates: [
          {
            label: 'price',
            data: '19.99',
            clear: false,
          },
        ],
      });

      const numberField = screen.getByLabelText('Price');
      expect(numberField).toHaveAttribute('type', 'number');
      expect(numberField).toHaveValue(19.99);
    });

    it('defaults to text field for unknown data type', async () => {
      await setup({
        fieldConfigurations: [
          {
            id: 'field1',
            label: 'unknown_field',
            data_type: 'unknown_type' as 'boolean' | 'date_time' | 'free_text' | 'number',
            position: 1,
          },
        ],
        fieldUpdates: [
          {
            label: 'unknown_field',
            data: 'Some value',
            clear: false,
          },
        ],
      });

      const textField = screen.getByLabelText('Unknown field');
      expect(textField).toHaveAttribute('type', 'text');
      expect(textField).toHaveValue('Some value');
    });
  });

  describe('accessibility', () => {
    it('has proper labels for all form fields', async () => {
      await setup();

      expect(screen.getByLabelText('Title')).toBeInTheDocument();
      expect(screen.getByLabelText('Completed')).toBeInTheDocument();
      expect(screen.getByLabelText('Due date')).toBeInTheDocument();
      expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
    });

    it('has proper labels for all clear checkboxes', async () => {
      await setup();

      expect(screen.getByLabelText('Clear Title')).toBeInTheDocument();
      expect(screen.getByLabelText('Clear Completed')).toBeInTheDocument();
      expect(screen.getByLabelText('Clear Due date')).toBeInTheDocument();
      expect(screen.getByLabelText('Clear Quantity')).toBeInTheDocument();
    });
  });
});
