import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import ListItemFormFields, { type IListItemFormFieldsProps } from './ListItemFormFields';
import { createField } from 'test-utils/factories';
import { EListItemFieldType } from 'typings';

async function setup(suppliedProps?: Partial<IListItemFormFieldsProps>): Promise<{
  props: IListItemFormFieldsProps;
  user: UserEvent;
}> {
  const user = userEvent.setup();
  const defaultProps: IListItemFormFieldsProps = {
    fieldConfigurations: [
      {
        id: 'field1',
        label: 'title',
        data_type: EListItemFieldType.FREE_TEXT,
        position: 1,
      },
      {
        id: 'field2',
        label: 'completed',
        data_type: EListItemFieldType.BOOLEAN,
        position: 2,
      },
      {
        id: 'field3',
        label: 'due_date',
        data_type: EListItemFieldType.DATE_TIME,
        position: 3,
      },
      {
        id: 'field4',
        label: 'quantity',
        data_type: EListItemFieldType.NUMBER,
        position: 4,
      },
    ],
    fields: [
      createField('field1', 'title', 'Test Item', 'item1'),
      createField('field2', 'completed', 'true', 'item1'),
      createField('field3', 'due_date', '2024-01-15', 'item1'),
      createField('field4', 'quantity', '5', 'item1'),
    ],
    setFormData: jest.fn(),
    listType: 'grocery',
    editForm: false,
  };
  const props = { ...defaultProps, ...suppliedProps };
  render(<ListItemFormFields {...props} />);
  return { props, user };
}

describe('ListItemFormFields', () => {
  it('renders all field types correctly', async () => {
    await setup();

    // Check that all fields are rendered
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Completed')).toBeInTheDocument();
    expect(screen.getByLabelText('Due_date')).toBeInTheDocument();
    expect(screen.getByLabelText('Quantity')).toBeInTheDocument();

    // Check field values
    expect(screen.getByLabelText('Title')).toHaveValue('Test Item');
    expect(screen.getByLabelText('Completed')).toBeChecked();
    expect(screen.getByLabelText('Due_date')).toHaveValue('2024-01-15');
    expect(screen.getByLabelText('Quantity')).toHaveValue(5);
  });

  it('renders fields with empty values', async () => {
    await setup({
      fields: [
        createField('field1', 'title', '', 'item1'),
        createField('field2', 'completed', 'false', 'item1'),
        createField('field3', 'due_date', '', 'item1'),
        createField('field4', 'quantity', '', 'item1'),
      ],
    });

    expect(screen.getByLabelText('Title')).toHaveValue('');
    expect(screen.getByLabelText('Completed')).not.toBeChecked();
    expect(screen.getByLabelText('Due_date')).toHaveValue('');
    expect(screen.getByLabelText('Quantity')).toHaveValue(null);
  });

  it('renders fields when no field data exists', async () => {
    await setup({
      fields: [],
    });

    expect(screen.getByLabelText('Title')).toHaveValue('');
    expect(screen.getByLabelText('Completed')).not.toBeChecked();
    expect(screen.getByLabelText('Due_date')).toHaveValue('');
    expect(screen.getByLabelText('Quantity')).toHaveValue(null);
  });

  it('capitalizes field labels correctly', async () => {
    await setup({
      fieldConfigurations: [
        {
          id: 'field1',
          label: 'product_name',
          data_type: EListItemFieldType.FREE_TEXT,
          position: 1,
        },
        {
          id: 'field2',
          label: 'is_urgent',
          data_type: EListItemFieldType.BOOLEAN,
          position: 2,
        },
      ],
      fields: [
        createField('field1', 'product_name', 'Apple', 'item1'),
        createField('field2', 'is_urgent', 'true', 'item1'),
      ],
    });

    expect(screen.getByLabelText('Product_name')).toBeInTheDocument();
    expect(screen.getByLabelText('Is_urgent')).toBeInTheDocument();
  });

  describe('field interactions', () => {
    it('calls setFormData when text field changes', async () => {
      const { props, user } = await setup();
      const titleField = screen.getByLabelText('Title');

      await user.type(titleField, ' Updated');

      expect(props.setFormData).toHaveBeenCalled();
    });

    it('calls setFormData when checkbox changes', async () => {
      const { props, user } = await setup();
      const completedField = screen.getByLabelText('Completed');

      await user.click(completedField);

      expect(props.setFormData).toHaveBeenCalled();
    });

    it('calls setFormData when date field changes', async () => {
      const { props, user } = await setup();
      const dateField = screen.getByLabelText('Due_date');

      await user.clear(dateField);
      await user.type(dateField, '2024-02-01');

      expect(props.setFormData).toHaveBeenCalled();
    });

    it('calls setFormData when number field changes', async () => {
      const { props, user } = await setup();
      const quantityField = screen.getByLabelText('Quantity');

      await user.type(quantityField, '10');

      expect(props.setFormData).toHaveBeenCalled();
    });
  });

  describe('boolean field handling', () => {
    it('handles boolean field with true value', async () => {
      await setup({
        fieldConfigurations: [
          {
            id: 'field1',
            label: 'completed',
            data_type: EListItemFieldType.BOOLEAN,
            position: 1,
          },
        ],
        fields: [createField('field1', 'completed', 'true', 'item1')],
      });

      expect(screen.getByLabelText('Completed')).toBeChecked();
    });

    it('handles boolean field with false value', async () => {
      await setup({
        fieldConfigurations: [
          {
            id: 'field1',
            label: 'completed',
            data_type: EListItemFieldType.BOOLEAN,
            position: 1,
          },
        ],
        fields: [createField('field1', 'completed', 'false', 'item1')],
      });

      expect(screen.getByLabelText('Completed')).not.toBeChecked();
    });

    it('handles boolean field with no value', async () => {
      await setup({
        fieldConfigurations: [
          {
            id: 'field1',
            label: 'completed',
            data_type: EListItemFieldType.BOOLEAN,
            position: 1,
          },
        ],
        fields: [],
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
            data_type: EListItemFieldType.NUMBER,
            position: 1,
          },
        ],
        fields: [createField('field1', 'quantity', '42', 'item1')],
      });

      expect(screen.getByLabelText('Quantity')).toHaveValue(42);
    });

    it('handles number field with empty value', async () => {
      await setup({
        fieldConfigurations: [
          {
            id: 'field1',
            label: 'quantity',
            data_type: EListItemFieldType.NUMBER,
            position: 1,
          },
        ],
        fields: [createField('field1', 'quantity', '', 'item1')],
      });

      expect(screen.getByLabelText('Quantity')).toHaveValue(null);
    });

    it('handles number field with no field data', async () => {
      await setup({
        fieldConfigurations: [
          {
            id: 'field1',
            label: 'quantity',
            data_type: EListItemFieldType.NUMBER,
            position: 1,
          },
        ],
        fields: [],
      });

      expect(screen.getByLabelText('Quantity')).toHaveValue(null);
    });
  });

  describe('date field handling', () => {
    it('handles date field with valid date', async () => {
      await setup({
        fieldConfigurations: [
          {
            id: 'field1',
            label: 'due_date',
            data_type: EListItemFieldType.DATE_TIME,
            position: 1,
          },
        ],
        fields: [createField('field1', 'due_date', '2024-01-15', 'item1')],
      });

      expect(screen.getByLabelText('Due_date')).toHaveValue('2024-01-15');
    });

    it('handles date field with empty value', async () => {
      await setup({
        fieldConfigurations: [
          {
            id: 'field1',
            label: 'due_date',
            data_type: EListItemFieldType.DATE_TIME,
            position: 1,
          },
        ],
        fields: [createField('field1', 'due_date', '', 'item1')],
      });

      expect(screen.getByLabelText('Due_date')).toHaveValue('');
    });
  });

  describe('text field handling', () => {
    it('handles text field with value', async () => {
      await setup({
        fieldConfigurations: [
          {
            id: 'field1',
            label: 'title',
            data_type: EListItemFieldType.FREE_TEXT,
            position: 1,
          },
        ],
        fields: [createField('field1', 'title', 'Test Item', 'item1')],
      });

      expect(screen.getByLabelText('Title')).toHaveValue('Test Item');
    });

    it('handles text field with empty value', async () => {
      await setup({
        fieldConfigurations: [
          {
            id: 'field1',
            label: 'title',
            data_type: EListItemFieldType.FREE_TEXT,
            position: 1,
          },
        ],
        fields: [createField('field1', 'title', '', 'item1')],
      });

      expect(screen.getByLabelText('Title')).toHaveValue('');
    });
  });

  describe('field ordering', () => {
    it('renders fields in configuration order', async () => {
      await setup({
        fieldConfigurations: [
          {
            id: 'field2',
            label: 'second',
            data_type: EListItemFieldType.FREE_TEXT,
            position: 2,
          },
          {
            id: 'field1',
            label: 'first',
            data_type: EListItemFieldType.FREE_TEXT,
            position: 1,
          },
        ],
        fields: [
          createField('field1', 'first', 'First Field', 'item1'),
          createField('field2', 'second', 'Second Field', 'item1'),
        ],
      });

      const fields = screen.getAllByRole('textbox');
      expect(fields[0]).toHaveValue('Second Field');
      expect(fields[1]).toHaveValue('First Field');
    });
  });

  describe('unknown data type', () => {
    it('defaults to text field for unknown data type', async () => {
      await setup({
        fieldConfigurations: [
          {
            id: 'field1',
            label: 'unknown_field',
            data_type: EListItemFieldType.FREE_TEXT,
            position: 1,
          },
        ],
        fields: [createField('field1', 'unknown_field', 'Unknown Value', 'item1')],
      });

      expect(screen.getByLabelText('Unknown_field')).toBeInTheDocument();
      expect(screen.getByLabelText('Unknown_field')).toHaveValue('Unknown Value');
    });
  });

  it('matches snapshot', async () => {
    await setup();
    const container = screen.getByLabelText('Title').closest('div')?.parentElement;

    expect(container).toMatchSnapshot();
  });
});
