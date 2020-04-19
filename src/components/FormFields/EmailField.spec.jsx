import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import EmailField from './EmailField';

const defaultProps = {
  handleChange: jest.fn(),
  value: 'test@test',
};

describe('EmailField', () => {
  let formInput;

  beforeEach(() => {
    const { getByLabelText } = render(<EmailField {...defaultProps} />);
    formInput = getByLabelText('Email');
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
