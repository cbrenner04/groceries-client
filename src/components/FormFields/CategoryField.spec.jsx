import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import CategoryField from './CategoryField';

const defaultProps = {
  handleInput: jest.fn(),
  category: 'testCategory',
  categories: ['testCategory1'],
};

describe('CategoryField', () => {
  it('renders input with datalist', () => {
    const { getByLabelText } = render(<CategoryField {...defaultProps} />);
    const formInput = getByLabelText('Category');
    const formGroup = formInput.parentElement;

    expect(formGroup).toMatchSnapshot();
    expect(formInput).toHaveValue(defaultProps.category);
    expect(formGroup.children[2].firstChild).toHaveAttribute('value', defaultProps.categories[0]);
  });

  describe('when value changes', () => {
    it('calls handleInput', () => {
      const { getByLabelText } = render(<CategoryField {...defaultProps} />);
      const formInput = getByLabelText('Category');
      fireEvent.change(formInput, { target: { value: 'a' } });

      expect(defaultProps.handleInput).toHaveBeenCalled();
    });
  });
});
