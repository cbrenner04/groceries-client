import React from 'react';
import { render } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import Bookmark, { type IBookmarkProps } from './Bookmark';

async function setup(suppliedProps?: Partial<IBookmarkProps>): Promise<{
  bookmark: HTMLElement;
  handleClick: jest.Mock;
  user: UserEvent;
}> {
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
      // SVG icon (solid version when read=true)
      expect(bookmark.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('when read is false', () => {
    it('renders the bookmark outline', async () => {
      const { bookmark } = await setup({ read: false });

      expect(bookmark).toMatchSnapshot();
      // SVG icon (outline version when read=false)
      expect(bookmark.querySelector('svg')).toBeInTheDocument();
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
