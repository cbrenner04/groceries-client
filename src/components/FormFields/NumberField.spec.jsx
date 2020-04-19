import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import NumberField from './NumberField';

describe('NumberField', () => {
  let defaultProps;

  beforeEach(() => {
    defaultProps = {
      handleChange: jest.fn(),
      name: 'testName',
      label: 'testLabel',
    };
  });

  describe('when value provided', () => {
    it('renders input with value', () => {
      defaultProps.value = 1;
      const { getByLabelText } = render(<NumberField {...defaultProps} />);
      const formInput = getByLabelText(defaultProps.label);
      const formGroup = formInput.parentElement;

      expect(formGroup).toMatchSnapshot();
      expect(formInput).toHaveValue(defaultProps.value);
    });
  });

  describe('when no value provided', () => {
    it('renders input with value of empty string', () => {
      const { getByLabelText } = render(<NumberField {...defaultProps} />);
      const formInput = getByLabelText(defaultProps.label);
      const formGroup = formInput.parentElement;

      expect(formGroup).toMatchSnapshot();
      expect(formInput).toHaveAttribute('value', '');
    });
  });

  describe('when value changes', () => {
    it('calls handleChange', () => {
      defaultProps.value = 1;
      const { getByLabelText } = render(<NumberField {...defaultProps} />);
      const formInput = getByLabelText(defaultProps.label);
      fireEvent.change(formInput, { target: { value: 'a' } });

      expect(defaultProps.handleChange).toHaveBeenCalled();
    });
  });
});
