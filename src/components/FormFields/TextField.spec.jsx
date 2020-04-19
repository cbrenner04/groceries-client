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
  let formInput;

  beforeEach(() => {
    const { getByLabelText } = render(<TextField {...defaultProps} />);
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
