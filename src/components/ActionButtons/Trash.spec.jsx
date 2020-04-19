import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import Trash from './Trash';

const defaultProps = {
  handleClick: jest.fn(),
};

describe('Trash', () => {
  it('renders a button', () => {
    const { getByRole } = render(<Trash {...defaultProps} />);

    expect(getByRole('button')).toMatchSnapshot();
  });

  describe('when button is clicked', () => {
    it('calls handleClick', () => {
      const { getByRole } = render(<Trash {...defaultProps} />);
      fireEvent.click(getByRole('button'));

      expect(defaultProps.handleClick).toHaveBeenCalled();
    });
  });
});
