import React from 'react';
import { render } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import CheckboxField, { type ICheckboxFieldProps } from './CheckboxField';

async function setup(suppliedProps?: Partial<ICheckboxFieldProps>): Promise<{
  formInput: HTMLElement;
  props: ICheckboxFieldProps;
  user: UserEvent;
}> {
  const user = userEvent.setup();
  const defaultProps = {
    handleChange: jest.fn(),
    name: 'testName',
    label: 'testLabel',
    value: true,
  };
  const props = { ...defaultProps, ...suppliedProps };
  const { findByLabelText } = render(<CheckboxField {...props} />);
  const formInput = await findByLabelText(props.label);
  return { formInput, props, user };
}

describe('CheckboxField', () => {
  it('renders input', async () => {
    const { formInput } = await setup();
    const formGroup = formInput.parentElement;

    expect(formGroup).toMatchSnapshot();
    expect(formInput).toBeChecked();
  });

  it('renders with defaults', async () => {
    const { formInput } = await setup({ value: undefined });
    const formGroup = formInput.parentElement;

    expect(formGroup).toMatchSnapshot();
    expect(formInput).not.toBeChecked();
  });

  describe('when value changes', () => {
    it('calls handleChange', async () => {
      const { formInput, props, user } = await setup();
      await user.click(formInput);

      expect(props.handleChange).toHaveBeenCalled();
    });
  });
});
