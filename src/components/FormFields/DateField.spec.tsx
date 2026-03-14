import React from 'react';
import { render } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import DateField, { type IDateFieldProps } from './DateField';

async function setup(): Promise<{
  formInput: HTMLElement;
  props: IDateFieldProps;
  user: UserEvent;
}> {
  const props = {
    handleChange: vi.fn(),
    name: 'testName',
    label: 'testLabel',
    value: '2020-03-03',
  };
  const { findByLabelText } = render(<DateField {...props} />);
  const formInput = await findByLabelText(props.label);
  const user = userEvent.setup();
  return { formInput, props, user };
}

describe('DateField', () => {
  it('renders input', async () => {
    const { formInput, props } = await setup();
    const formGroup = formInput.parentElement;

    expect(formGroup).toMatchSnapshot();
    expect(formInput).toHaveAttribute('value', props.value);
  });

  describe('when value changes', () => {
    it('calls handleChange', async () => {
      const { formInput, props, user } = await setup();
      await user.clear(formInput);
      await user.type(formInput, '2024-12-25T14:30');

      expect(props.handleChange).toHaveBeenCalled();
    });
  });
});
