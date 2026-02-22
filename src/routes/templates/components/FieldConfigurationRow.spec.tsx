import React from 'react';
import { render, fireEvent, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { EListItemFieldType } from 'typings';

import FieldConfigurationRow, { type IFieldConfigurationRowProps } from './FieldConfigurationRow';

interface ISetupReturn extends RenderResult {
  props: IFieldConfigurationRowProps;
  user: UserEvent;
}

function setup(suppliedProps?: Partial<IFieldConfigurationRowProps>): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps: IFieldConfigurationRowProps = {
    index: 0,
    row: {
      key: '0',
      label: 'product',
      dataType: EListItemFieldType.FREE_TEXT,
      position: 1,
      primary: true,
    },
    onRemove: jest.fn(),
    onChange: jest.fn(),
    canRemove: true,
    totalFields: 3,
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<FieldConfigurationRow {...props} />);

  return { ...component, props, user };
}

describe('FieldConfigurationRow', () => {
  it('renders input fields', () => {
    const { container } = setup();

    expect(container).toMatchSnapshot();
  });

  it('updates label when changed', async () => {
    const { getByTestId, props, user } = setup();

    const labelInput = getByTestId('field-row-label-0');
    await user.clear(labelInput);
    await user.type(labelInput, 'n');

    const calls = (props.onChange as jest.Mock).mock.calls;
    expect(calls[calls.length - 1][0]).toBe('label');
    expect(calls[calls.length - 1][1]).toContain('n');
  });

  it('updates data type when changed', async () => {
    const { getByTestId, props, user } = setup();

    const dataTypeSelect = getByTestId('field-row-data-type-0');
    await user.selectOptions(dataTypeSelect, EListItemFieldType.BOOLEAN);

    expect(props.onChange).toHaveBeenCalledWith('dataType', EListItemFieldType.BOOLEAN);
  });

  it('updates position when changed', () => {
    const { getByTestId, props } = setup({ totalFields: 5 });

    const positionInput = getByTestId('field-row-position-0') as HTMLInputElement;
    fireEvent.change(positionInput, { target: { value: '2' } });

    expect(props.onChange).toHaveBeenCalledWith('position', 2);
  });

  it('updates primary when checked', async () => {
    const { getByTestId, props, user } = setup({
      row: {
        key: '0',
        label: 'product',
        dataType: EListItemFieldType.FREE_TEXT,
        position: 1,
        primary: false,
      },
    });

    const primaryCheckbox = getByTestId('field-row-primary-0');
    await user.click(primaryCheckbox);

    expect(props.onChange).toHaveBeenCalledWith('primary', true);
  });

  it('calls onRemove when delete button clicked', async () => {
    const { getByTestId, props, user } = setup();

    await user.click(getByTestId('field-row-remove-0'));

    expect(props.onRemove).toHaveBeenCalled();
  });

  it('disables delete button when canRemove is false', () => {
    const { getByTestId } = setup({ canRemove: false });

    const deleteButton = getByTestId('field-row-remove-0');
    expect(deleteButton).toBeDisabled();
  });

  it('enables delete button when canRemove is true', () => {
    const { getByTestId } = setup({ canRemove: true });

    const deleteButton = getByTestId('field-row-remove-0');
    expect(deleteButton).not.toBeDisabled();
  });

  it('renders different data type options', async () => {
    const { getByTestId } = setup();

    const dataTypeSelect = getByTestId('field-row-data-type-0') as HTMLSelectElement;
    const options = Array.from(dataTypeSelect.options).map((opt) => opt.value);

    expect(options).toContain(EListItemFieldType.FREE_TEXT);
    expect(options).toContain(EListItemFieldType.BOOLEAN);
    expect(options).toContain(EListItemFieldType.DATE_TIME);
    expect(options).toContain(EListItemFieldType.NUMBER);
  });

  it('displays correct placeholder for label', () => {
    const { getByTestId } = setup();

    const labelInput = getByTestId('field-row-label-0') as HTMLInputElement;
    expect(labelInput.placeholder).toBe('e.g., product');
  });

  it('does not update position when value is less than 1', async () => {
    const { getByTestId, props, user } = setup();

    const positionInput = getByTestId('field-row-position-0');
    await user.clear(positionInput);
    await user.type(positionInput, '0');

    expect(props.onChange).not.toHaveBeenCalledWith('position', 0);
  });

  it('does not update position when value exceeds totalFields', async () => {
    const { getByTestId, props, user } = setup({ totalFields: 3 });

    const positionInput = getByTestId('field-row-position-0');
    await user.clear(positionInput);
    await user.type(positionInput, '4');

    expect(props.onChange).not.toHaveBeenCalledWith('position', 4);
  });

  it('updates position when value is within valid range', () => {
    const { getByTestId, props } = setup({ totalFields: 5 });

    const positionInput = getByTestId('field-row-position-0') as HTMLInputElement;
    fireEvent.change(positionInput, { target: { value: '3' } });

    expect(props.onChange).toHaveBeenCalledWith('position', 3);
  });

  it('sets min and max attributes on position input', () => {
    const { getByTestId } = setup({ totalFields: 5 });

    const positionInput = getByTestId('field-row-position-0') as HTMLInputElement;
    expect(positionInput.min).toBe('1');
    expect(positionInput.max).toBe('5');
  });
});
