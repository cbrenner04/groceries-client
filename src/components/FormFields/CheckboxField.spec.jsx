import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import CheckboxField from './CheckboxField';

const defaultProps = {
  handleChange: jest.fn(),
  name: 'testName',
  label: 'testLabel',
  value: true,
};

describe('CheckboxField', () => {
  it('renders input', () => {
    const { getByLabelText } = render(<CheckboxField {...defaultProps} />);
    const formInput = getByLabelText(defaultProps.label);
    const formGroup = formInput.parentElement;

    expect(formGroup).toMatchSnapshot();
    expect(formInput).toBeChecked();
  });

  describe('when value changes', () => {
    it('calls handleChange', () => {
      const { getByLabelText } = render(<CheckboxField {...defaultProps} />);
      const formInput = getByLabelText(defaultProps.label);
      fireEvent.click(formInput);

      expect(defaultProps.handleChange).toHaveBeenCalled();
    });
  });
});
