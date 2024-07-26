import React from 'react';
import { render } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import CheckboxField, { type ICheckboxFieldProps } from './CheckboxField';

async function setup(): Promise<{
  formInput: HTMLElement;
  props: ICheckboxFieldProps;
  user: UserEvent;
}> {
  const user = userEvent.setup();
  const props = {
    handleChange: jest.fn(),
    name: 'testName',
    label: 'testLabel',
    value: true,
  };
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

  describe('when value changes', () => {
    it('calls handleChange', async () => {
      const { formInput, props, user } = await setup();
      await user.click(formInput);

      expect(props.handleChange).toHaveBeenCalled();
    });
  });
});
