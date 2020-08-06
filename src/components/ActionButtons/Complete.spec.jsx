import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import Complete from './Complete';

const defaultProps = {
  handleClick: jest.fn(),
  testID: 'foo',
};

describe('Complete', () => {
  let completeButton;

  beforeEach(() => {
    const { getByRole } = render(<Complete {...defaultProps} />);
    completeButton = getByRole('button');
  });

  it('renders a button', () => {
    expect(completeButton).toMatchSnapshot();
  });

  describe('when button is clicked', () => {
    it('calls handleClick', () => {
      fireEvent.click(completeButton);

      expect(defaultProps.handleClick).toHaveBeenCalled();
    });
  });
});
