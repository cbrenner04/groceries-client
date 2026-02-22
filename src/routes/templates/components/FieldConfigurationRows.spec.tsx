import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { EListItemFieldType } from 'typings';

import FieldConfigurationRows, { type IFieldConfigurationRowsProps } from './FieldConfigurationRows';

interface ISetupReturn extends RenderResult {
  props: IFieldConfigurationRowsProps;
  user: UserEvent;
}

function setup(suppliedProps?: Partial<IFieldConfigurationRowsProps>): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps: IFieldConfigurationRowsProps = {
    fieldRows: [
      {
        key: '0',
        label: 'product',
        dataType: EListItemFieldType.FREE_TEXT,
        position: 1,
        primary: true,
      },
    ],
    setFieldRows: jest.fn(),
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<FieldConfigurationRows {...props} />);

  return { ...component, props, user };
}

describe('FieldConfigurationRows', () => {
  it('renders fields heading', () => {
    const { getByText } = setup();

    expect(getByText('Fields')).toBeVisible();
  });

  it('renders add field button', () => {
    const { getByTestId } = setup();

    expect(getByTestId('add-field-button')).toBeVisible();
  });

  it('renders each field row', () => {
    const { getByTestId } = setup({
      fieldRows: [
        {
          key: '0',
          label: 'product',
          dataType: EListItemFieldType.FREE_TEXT,
          position: 1,
          primary: true,
        },
        {
          key: '1',
          label: 'quantity',
          dataType: EListItemFieldType.NUMBER,
          position: 2,
          primary: false,
        },
      ],
    });

    expect(getByTestId('field-row-label-0')).toBeVisible();
    expect(getByTestId('field-row-label-1')).toBeVisible();
  });

  it('adds a new field when add button clicked', async () => {
    const { getByTestId, props, user } = setup();

    await user.click(getByTestId('add-field-button'));

    expect(props.setFieldRows).toHaveBeenCalled();
    const call = (props.setFieldRows as jest.Mock).mock.calls[0][0];
    expect(call).toHaveLength(2);
    expect(call[1].label).toBe('');
    expect(call[1].dataType).toBe(EListItemFieldType.FREE_TEXT);
    expect(call[1].primary).toBe(false);
  });

  it('assigns correct position to new field', async () => {
    const { getByTestId, props, user } = setup({
      fieldRows: [
        {
          key: '0',
          label: 'product',
          dataType: EListItemFieldType.FREE_TEXT,
          position: 1,
          primary: true,
        },
        {
          key: '1',
          label: 'quantity',
          dataType: EListItemFieldType.NUMBER,
          position: 2,
          primary: false,
        },
      ],
    });

    await user.click(getByTestId('add-field-button'));

    const call = (props.setFieldRows as jest.Mock).mock.calls[0][0];
    expect(call[2].position).toBe(3);
  });

  it('removes field when remove button clicked', async () => {
    const { getByTestId, props, user } = setup({
      fieldRows: [
        {
          key: '0',
          label: 'product',
          dataType: EListItemFieldType.FREE_TEXT,
          position: 1,
          primary: true,
        },
        {
          key: '1',
          label: 'quantity',
          dataType: EListItemFieldType.NUMBER,
          position: 2,
          primary: false,
        },
      ],
    });

    await user.click(getByTestId('field-row-remove-0'));

    expect(props.setFieldRows).toHaveBeenCalled();
    const call = (props.setFieldRows as jest.Mock).mock.calls[0][0];
    expect(call).toHaveLength(1);
    expect(call[0].key).toBe('1');
  });

  it('updates field when row changed', async () => {
    const { getByTestId, props, user } = setup();

    const labelInput = getByTestId('field-row-label-0');
    await user.clear(labelInput);
    await user.type(labelInput, 'n');

    expect(props.setFieldRows).toHaveBeenCalled();
    const mock = props.setFieldRows as jest.Mock;
    const lastCall = mock.mock.calls[mock.mock.calls.length - 1][0];
    expect(lastCall[0].label).toContain('n');
  });

  it('generates unique keys for new fields', async () => {
    const { getByTestId, props, user } = setup({
      fieldRows: [
        { key: '0', label: 'p1', dataType: EListItemFieldType.FREE_TEXT, position: 1, primary: true },
        { key: '5', label: 'p2', dataType: EListItemFieldType.FREE_TEXT, position: 2, primary: false },
        { key: '3', label: 'p3', dataType: EListItemFieldType.FREE_TEXT, position: 3, primary: false },
      ],
    });

    await user.click(getByTestId('add-field-button'));

    const call = (props.setFieldRows as jest.Mock).mock.calls[0][0];
    expect(call[3].key).toBe('6');
  });

  it('renders with container', () => {
    const { container } = setup();

    expect(container).toMatchSnapshot();
  });
});
