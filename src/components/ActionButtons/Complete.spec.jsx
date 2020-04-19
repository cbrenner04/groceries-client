import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import Complete from './Complete';

const defaultProps = {
  handleClick: jest.fn(),
};

describe('Complete', () => {
  it('renders a button', () => {
    const { getByRole } = render(<Complete {...defaultProps} />);

    expect(getByRole('button')).toMatchSnapshot();
  });

  describe('when button is clicked', () => {
    it('calls handleClick', () => {
      const { getByRole } = render(<Complete {...defaultProps} />);
      fireEvent.click(getByRole('button'));

      expect(defaultProps.handleClick).toHaveBeenCalled();
    });
  });
});
