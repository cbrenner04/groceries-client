import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import DateField, { type IDateFieldProps } from './DateField';

async function setup(): Promise<{
  formInput: HTMLElement;
  props: IDateFieldProps;
}> {
  const props = {
    handleChange: jest.fn(),
    name: 'testName',
    label: 'testLabel',
    value: '03/03/2020',
  };
  const { findByLabelText } = render(<DateField {...props} />);
  const formInput = await findByLabelText(props.label);
  return { formInput, props };
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
      const { formInput, props } = await setup();
      // userEvent doesn't work with this input
      fireEvent.change(formInput, { target: { value: '06/30/2022' } });

      expect(props.handleChange).toHaveBeenCalled();
    });
  });
});
