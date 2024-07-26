import React from 'react';
import { render } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import EmailField, { type IEmailFieldProps } from './EmailField';

async function setup(): Promise<{
  formInput: HTMLElement;
  props: IEmailFieldProps;
  user: UserEvent;
}> {
  const user = userEvent.setup();
  const props = {
    handleChange: jest.fn(),
    value: 'test@test',
  };
  const { findByLabelText } = render(<EmailField {...props} />);
  const formInput = await findByLabelText('Email');

  return { formInput, props, user };
}

describe('EmailField', () => {
  it('renders input', async () => {
    const { formInput, props } = await setup();
    const formGroup = formInput.parentElement;

    expect(formGroup).toMatchSnapshot();
    expect(formInput).toHaveValue(props.value);
  });

  describe('when value changes', () => {
    it('calls handleChange', async () => {
      const { formInput, props, user } = await setup();
      await user.type(formInput, 'a');

      expect(props.handleChange).toHaveBeenCalled();
    });
  });
});
