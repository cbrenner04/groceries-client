import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import SelectField from './SelectField';

const defaultProps = {
  handleChange: jest.fn(),
  name: 'testName',
  label: 'testLabel',
  options: [
    {
      value: 'testOption1Value',
      label: 'testOption1Label',
    },
    {
      value: 'testOption2Value',
      label: 'testOption2Label',
    },
  ],
};

describe('SelectField', () => {
  describe('when blankOption is true', () => {
    describe('when value is not blank', () => {
      it('renders input with first option of empty string and clear input text', () => {
        defaultProps.blankOption = true;
        defaultProps.value = 'testValue';
        const { getByLabelText, getByText } = render(<SelectField {...defaultProps} />);
        const formInput = getByLabelText(defaultProps.label);
        const formGroup = formInput.parentElement;

        expect(formGroup).toMatchSnapshot();
        expect(formInput).toHaveValue('');
        expect(getByText(`Clear ${defaultProps.label}`)).toBeVisible();
      });
    });

    describe('when value is not blank', () => {
      it('renders input with first option of empty string and select input text', () => {
        defaultProps.blankOption = true;
        defaultProps.value = '';
        const { getByLabelText, getByText } = render(<SelectField {...defaultProps} />);
        const formInput = getByLabelText(defaultProps.label);
        const formGroup = formInput.parentElement;

        expect(formGroup).toMatchSnapshot();
        expect(formInput).toHaveValue('');
        expect(getByText(`Select ${defaultProps.label}`)).toBeVisible();
      });
    });
  });

  describe('when blankOption is false', () => {
    it('renders input with first option as first option provided', () => {
      defaultProps.blankOption = false;
      const { getByLabelText } = render(<SelectField {...defaultProps} />);
      const formInput = getByLabelText(defaultProps.label);
      const formGroup = formInput.parentElement;

      expect(formGroup).toMatchSnapshot();
      expect(formInput).toHaveValue(defaultProps.options[0].value);
    });
  });

  describe('when value changes', () => {
    it('calls handleChange', () => {
      const { getByLabelText } = render(<SelectField {...defaultProps} />);
      const formInput = getByLabelText(defaultProps.label);
      fireEvent.change(formInput, { target: { value: 'a' } });

      expect(defaultProps.handleChange).toHaveBeenCalled();
    });
  });
});
