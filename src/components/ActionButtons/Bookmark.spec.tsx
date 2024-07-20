import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Bookmark from './Bookmark';

async function setup(suppliedProps = {}) {
  const handleClick = jest.fn();
  const user = userEvent.setup();
  const defaultProps = {
    handleClick,
    read: false,
    testID: 'foo',
  };
  const props = {
    ...defaultProps,
    ...suppliedProps,
  };

  const { findByRole } = render(<Bookmark {...props} />);
  const bookmark = await findByRole('button');

  return { bookmark, handleClick, user };
}

describe('Bookmark', () => {
  describe('when read is true', () => {
    it('renders the filled in bookmark', async () => {
      const { bookmark } = await setup({ read: true });

      expect(bookmark).toMatchSnapshot();
      expect(bookmark.firstChild).toHaveAttribute('class', expect.stringContaining('fas'));
    });
  });

  describe('when read is false', () => {
    it('renders the bookmark outline', async () => {
      const { bookmark } = await setup({ read: false });

      expect(bookmark).toMatchSnapshot();
      expect(bookmark.firstChild).toHaveAttribute('class', expect.stringContaining('far'));
    });
  });

  describe('when the button is clicked', () => {
    it('calls handleClick', async () => {
      const { bookmark, handleClick, user } = await setup();

      await user.click(bookmark);

      expect(handleClick).toHaveBeenCalled();
    });
  });
});
