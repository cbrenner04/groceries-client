import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import DateField from './DateField';

const defaultProps = {
  handleChange: jest.fn(),
  name: 'testName',
  label: 'testLabel',
  value: '03/03/2020',
};

describe('DateField', () => {
  let formInput;

  beforeEach(() => {
    const { getByLabelText } = render(<DateField {...defaultProps} />);
    formInput = getByLabelText(defaultProps.label);
  });

  it('renders input', () => {
    const formGroup = formInput.parentElement;

    expect(formGroup).toMatchSnapshot();
    expect(formInput).toHaveAttribute('value', defaultProps.value);
  });

  describe('when value changes', () => {
    it('calls handleChange', () => {
      fireEvent.change(formInput, { target: { value: 'a' } });

      expect(defaultProps.handleChange).toHaveBeenCalled();
    });
  });
});
