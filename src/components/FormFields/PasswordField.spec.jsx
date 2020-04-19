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
  let formInput;

  beforeEach(() => {
    const { getByLabelText } = render(<PasswordField {...defaultProps} />);
    formInput = getByLabelText(defaultProps.label);
  });

  it('renders input', () => {
    const formGroup = formInput.parentElement;

    expect(formGroup).toMatchSnapshot();
    expect(formInput).toHaveValue(defaultProps.value);
  });

  describe('when value changes', () => {
    it('calls handleChange', () => {
      fireEvent.change(formInput, { target: { value: 'a' } });

      expect(defaultProps.handleChange).toHaveBeenCalled();
    });
  });
});
