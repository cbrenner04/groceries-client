import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import Refresh from './Refresh';

const defaultProps = {
  handleClick: jest.fn(),
};

describe('Refresh', () => {
  it('renders a button', () => {
    const { getByRole } = render(<Refresh {...defaultProps} />);

    expect(getByRole('button')).toMatchSnapshot();
  });

  describe('when button is clicked', () => {
    it('calls handleClick', () => {
      const { getByRole } = render(<Refresh {...defaultProps} />);
      fireEvent.click(getByRole('button'));

      expect(defaultProps.handleClick).toHaveBeenCalled();
    });
  });
});
