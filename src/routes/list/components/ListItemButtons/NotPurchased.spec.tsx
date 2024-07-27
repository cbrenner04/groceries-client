import React from 'react';
import { render } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import { EListType } from 'typings';

import NotPurchased, { type INotPurchasedItemButtonsProps } from './NotPurchased';

interface ISetupReturn {
  container: HTMLElement;
  buttons: HTMLElement[];
  props: INotPurchasedItemButtonsProps;
  user: UserEvent;
}

async function setup(suppliedProps?: Partial<INotPurchasedItemButtonsProps>): Promise<ISetupReturn> {
  const user = userEvent.setup();
  const defaultProps = {
    item: {
      grocery_list_id: 'id1',
      id: 'id1',
      read: true,
    },
    purchased: false,
    handleItemDelete: jest.fn(),
    handlePurchaseOfItem: jest.fn(),
    toggleItemRead: jest.fn(),
    handleItemRefresh: jest.fn(),
    handleItemEdit: jest.fn(),
    listType: EListType.GROCERY_LIST,
    pending: false,
  };
  const props = { ...defaultProps, ...suppliedProps };
  const { container, findAllByRole } = render(<NotPurchased {...props} />);
  const buttons = await findAllByRole('button');

  return { container, buttons, props, user };
}

describe('NotPurchased', () => {
  it('renders Bookmark when listType is BookList', async () => {
    const { container, buttons } = await setup({
      listType: EListType.BOOK_LIST,
      item: { book_list_id: 'id1', id: 'id1', read: true },
    });

    expect(container).toMatchSnapshot();
    expect(buttons[0].firstChild).toHaveClass('fa-bookmark');
    expect(buttons[0].firstChild).toHaveClass('fas');
  });

  it('renders Bookmark when listType is BookList and item.read is undefined', async () => {
    const { container, buttons } = await setup({
      listType: EListType.BOOK_LIST,
      item: { book_list_id: 'id1', id: 'id1' },
    });

    expect(container).toMatchSnapshot();
    expect(buttons[0].firstChild).toHaveClass('fa-bookmark');
    expect(buttons[0].firstChild).toHaveClass('far');
  });

  it('does not render Bookmark when listType is not BookList', async () => {
    const { container, buttons } = await setup({ listType: EListType.GROCERY_LIST });

    expect(container).toMatchSnapshot();
    buttons.forEach((button) => {
      expect(button).not.toHaveClass('fa-bookmark');
    });
  });

  it('calls toggleItemRead when listType is BookList and read is false and Bookmark is clicked', async () => {
    const { buttons, props, user } = await setup({
      listType: EListType.BOOK_LIST,
      item: {
        book_list_id: 'id1',
        id: 'id1',
        read: false,
      },
    });

    await user.click(buttons[0]);

    expect(props.toggleItemRead).toHaveBeenCalledWith(props.item);
  });

  it('calls toggleItemRead when listType is BookList and read is true and Bookmark is clicked', async () => {
    const { buttons, props, user } = await setup({
      listType: EListType.BOOK_LIST,
      item: {
        book_list_id: 'id1',
        id: 'id1',
        read: true,
      },
    });

    await user.click(buttons[0]);

    expect(props.toggleItemRead).toHaveBeenCalledWith(props.item);
  });

  it('calls handlePurchaseOfItem when Complete is clicked', async () => {
    const { buttons, props, user } = await setup();

    await user.click(buttons[0]);

    expect(props.handlePurchaseOfItem).toHaveBeenCalledWith(props.item);
  });

  it('navigates to edit list item when Edit is clicked', async () => {
    const { buttons, props, user } = await setup();

    await user.click(buttons[1]);

    expect(props.handleItemEdit).toHaveBeenCalledWith(props.item);
  });

  it('calls handleItemDelete when Trash is clicked', async () => {
    const { buttons, props, user } = await setup();

    await user.click(buttons[2]);

    expect(props.handleItemDelete).toHaveBeenCalledWith(props.item);
  });
});
