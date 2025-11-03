import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import Bookmark, { type IBookmarkProps } from './Bookmark';

async function setup(suppliedProps?: Partial<IBookmarkProps>): Promise<{
  bookmark: HTMLElement;
  findByTestId: RenderResult['findByTestId'];
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

  const component = render(<Bookmark {...props} />);
  const { findByRole, findByTestId } = component;
  const bookmark = await findByRole('button');

  return { bookmark, findByTestId, handleClick, user };
}

describe('Bookmark', () => {
  describe('when read is true', () => {
    it('renders the filled in bookmark', async () => {
      const { bookmark, findByTestId } = await setup({ read: true });

      expect(bookmark).toMatchSnapshot();
      // SVG icon (solid version when read=true)
      expect(await findByTestId('read-bookmark-icon')).toBeInTheDocument();
    });
  });

  describe('when read is false', () => {
    it('renders the bookmark outline', async () => {
      const { bookmark, findByTestId } = await setup({ read: false });

      expect(bookmark).toMatchSnapshot();
      // SVG icon (outline version when read=false)
      expect(await findByTestId('unread-bookmark-icon')).toBeInTheDocument();
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
