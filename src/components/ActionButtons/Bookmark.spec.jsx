import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import Bookmark from './Bookmark';

const defaultProps = {
  handleClick: jest.fn(),
  read: false,
  testID: 'foo',
};

describe('Bookmark', () => {
  describe('when read is true', () => {
    it('renders the filled in bookmark', () => {
      defaultProps.read = true;
      const { getByRole } = render(<Bookmark {...defaultProps} />);
      const bookmark = getByRole('button');

      expect(bookmark).toMatchSnapshot();
      expect(bookmark.firstChild).toHaveAttribute('class', expect.stringContaining('fas'));
    });
  });

  describe('when read is false', () => {
    it('renders the bookmark outline', () => {
      defaultProps.read = false;
      const { getByRole } = render(<Bookmark {...defaultProps} />);
      const bookmark = getByRole('button');

      expect(bookmark).toMatchSnapshot();
      expect(bookmark.firstChild).toHaveAttribute('class', expect.stringContaining('far'));
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
