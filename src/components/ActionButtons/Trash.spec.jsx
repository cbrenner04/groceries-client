import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import Trash from './Trash';

const defaultProps = {
  handleClick: jest.fn(),
};

describe('Trash', () => {
  let trashButton;

  beforeEach(() => {
    const { getByRole } = render(<Trash {...defaultProps} />);
    trashButton = getByRole('button');
  });

  it('renders a button', () => {
    expect(trashButton).toMatchSnapshot();
  });

  describe('when button is clicked', () => {
    it('calls handleClick', () => {
      fireEvent.click(trashButton);

      expect(defaultProps.handleClick).toHaveBeenCalled();
    });
  });
});
