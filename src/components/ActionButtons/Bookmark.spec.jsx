import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import Bookmark from './Bookmark';

const defaultProps = {
  handleClick: jest.fn(),
};

describe('Bookmark', () => {
  describe('when read is true', () => {
    it('renders the filled in bookmark', () => {
      defaultProps.read = true;
      const { getByRole } = render(<Bookmark {...defaultProps} />);

      expect(getByRole('button')).toMatchSnapshot();
      expect(getByRole('button').firstChild).toHaveAttribute('class', expect.stringContaining('fas'));
    });
  });

  describe('when read is false', () => {
    it('renders the bookmark outline', () => {
      defaultProps.read = false;
      const { getByRole } = render(<Bookmark {...defaultProps} />);

      expect(getByRole('button')).toMatchSnapshot();
      expect(getByRole('button').firstChild).toHaveAttribute('class', expect.stringContaining('far'));
    });
  });

  describe('when the button is clicked', () => {
    it('calls handleClick', () => {
      const { getByRole } = render(<Bookmark {...defaultProps} />);
      fireEvent.click(getByRole('button'));

      expect(defaultProps.handleClick).toHaveBeenCalled();
    });
  });
});
