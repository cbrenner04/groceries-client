import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import TextField from './TextField';

const defaultProps = {
  handleChange: jest.fn(),
  name: 'testName',
  label: 'testLabel',
  value: 'testValue',
};

describe('TextField', () => {
  it('renders input', () => {
    const { getByLabelText } = render(<TextField {...defaultProps} />);
    const formInput = getByLabelText(defaultProps.label);
    const formGroup = formInput.parentElement;

    expect(formGroup).toMatchSnapshot();
    expect(formInput).toHaveValue(defaultProps.value);
  });

  describe('when value changes', () => {
    it('calls handleChange', () => {
      const { getByLabelText } = render(<TextField {...defaultProps} />);
      const formInput = getByLabelText(defaultProps.label);
      fireEvent.change(formInput, { target: { value: 'a' } });

      expect(defaultProps.handleChange).toHaveBeenCalled();
    });
  });
});
