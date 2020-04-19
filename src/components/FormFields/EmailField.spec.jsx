import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import EmailField from './EmailField';

const defaultProps = {
  handleChange: jest.fn(),
  value: 'test@test',
};

describe('EmailField', () => {
  it('renders input', () => {
    const { getByLabelText } = render(<EmailField {...defaultProps} />);
    const formInput = getByLabelText('Email');
    const formGroup = formInput.parentElement;

    expect(formGroup).toMatchSnapshot();
    expect(formInput).toHaveValue(defaultProps.value);
  });

  describe('when value changes', () => {
    it('calls handleChange', () => {
      const { getByLabelText } = render(<EmailField {...defaultProps} />);
      const formInput = getByLabelText('Email');
      fireEvent.change(formInput, { target: { value: 'a' } });

      expect(defaultProps.handleChange).toHaveBeenCalled();
    });
  });
});
