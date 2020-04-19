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
  let formInput;

  beforeEach(() => {
    const { getByLabelText } = render(<CheckboxField {...defaultProps} />);
    formInput = getByLabelText(defaultProps.label);
  });

  it('renders input', () => {
    const formGroup = formInput.parentElement;

    expect(formGroup).toMatchSnapshot();
    expect(formInput).toBeChecked();
  });

  describe('when value changes', () => {
    it('calls handleChange', () => {
      fireEvent.click(formInput);

      expect(defaultProps.handleChange).toHaveBeenCalled();
    });
  });
});
