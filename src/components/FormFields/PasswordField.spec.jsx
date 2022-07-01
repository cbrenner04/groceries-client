import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PasswordField from './PasswordField';

async function setup() {
  const user = userEvent.setup();
  const props = {
    handleChange: jest.fn(),
    name: 'testName',
    label: 'testLabel',
    value: 'testValue',
  };
  const { findByLabelText } = render(<PasswordField {...props} />);
  const formInput = await findByLabelText(props.label);
  return { formInput, props, user };
}

describe('PasswordField', () => {
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
