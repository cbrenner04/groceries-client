import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import PasswordField from './PasswordField';

const defaultProps = {
  handleChange: jest.fn(),
  name: 'testName',
  label: 'testLabel',
  value: 'testValue',
};

describe('PasswordField', () => {
  it('renders input', () => {
    const { getByLabelText } = render(<PasswordField {...defaultProps} />);
    const formInput = getByLabelText(defaultProps.label);
    const formGroup = formInput.parentElement;

    expect(formGroup).toMatchSnapshot();
    expect(formInput).toHaveValue(defaultProps.value);
  });

  describe('when value changes', () => {
    it('calls handleChange', () => {
      const { getByLabelText } = render(<PasswordField {...defaultProps} />);
      const formInput = getByLabelText(defaultProps.label);
      fireEvent.change(formInput, { target: { value: 'a' } });

      expect(defaultProps.handleChange).toHaveBeenCalled();
    });
  });
});
