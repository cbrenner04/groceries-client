import React from 'react';
import { render } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import NumberField, { type INumberFieldProps } from './NumberField';

async function setup(suppliedProps?: Partial<INumberFieldProps>): Promise<{
  formInput: HTMLElement;
  props: INumberFieldProps;
  user: UserEvent;
}> {
  const user = userEvent.setup();
  const defaultProps = {
    handleChange: jest.fn(),
    name: 'testName',
    label: 'testLabel',
  };
  const props: INumberFieldProps = { ...defaultProps, ...suppliedProps };
  const { findByLabelText } = render(<NumberField {...props} />);
  const formInput = await findByLabelText(props.label);
  return { formInput, props, user };
}

describe('NumberField', () => {
  describe('when value provided', () => {
    it('renders input with value', async () => {
      const { formInput, props } = await setup({ value: 1 });
      const formGroup = formInput.parentElement;

      expect(formGroup).toMatchSnapshot();
      expect(formInput).toHaveValue(props.value);
    });
  });

  describe('when no value provided', () => {
    it('renders input with value of empty string', async () => {
      const { formInput } = await setup();
      const formGroup = formInput.parentElement;

      expect(formGroup).toMatchSnapshot();
      expect(formInput).toHaveAttribute('value', '');
    });
  });

  describe('when value changes', () => {
    it('calls handleChange', async () => {
      const { formInput, props, user } = await setup({ value: 1 });
      await user.type(formInput, '9');

      expect(props.handleChange).toHaveBeenCalled();
    });
  });
});
