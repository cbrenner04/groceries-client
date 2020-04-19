import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import Refresh from './Refresh';

const defaultProps = {
  handleClick: jest.fn(),
};

describe('Refresh', () => {
  let refreshButton;

  beforeEach(() => {
    const { getByRole } = render(<Refresh {...defaultProps} />);
    refreshButton = getByRole('button');
  });

  it('renders a button', () => {
    expect(refreshButton).toMatchSnapshot();
  });

  describe('when button is clicked', () => {
    it('calls handleClick', () => {
      fireEvent.click(refreshButton);

      expect(defaultProps.handleClick).toHaveBeenCalled();
    });
  });
});
