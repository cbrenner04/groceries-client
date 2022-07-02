import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Purchased from './Purchased';

async function setup(suppliedProps) {
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
    listType: 'GroceryList',
    handleItemEdit: jest.fn(),
    multiSelect: false,
    selectedItems: [],
    pending: false,
  };
  const props = { ...defaultProps, ...suppliedProps };
  const { container, findAllByRole } = render(<Purchased {...props} />);
  const buttons = await findAllByRole('button');

  return { container, buttons, props, user };
}

describe('Purchased', () => {
  it('renders Refresh and does not render Bookmark when listType is GroceryList', async () => {
    const { container, buttons } = await setup({ listType: 'GroceryList' });

    expect(container).toMatchSnapshot();
    expect(buttons.length).toBe(3);
    expect(buttons[0].firstChild).toHaveClass('fa-redo');
    expect(buttons[1].firstChild).toHaveClass('fa-edit');
    expect(buttons[2].firstChild).toHaveClass('fa-trash');
  });

  it('renders Refresh and does not render Bookmark when listType is ToDoList', async () => {
    const { container, buttons } = await setup({ listType: 'ToDoList' });

    expect(container).toMatchSnapshot();
    expect(buttons.length).toBe(3);
    expect(buttons[0].firstChild).toHaveClass('fa-redo');
    expect(buttons[1].firstChild).toHaveClass('fa-edit');
    expect(buttons[2].firstChild).toHaveClass('fa-trash');
  });

  it('does not render Refresh and does render Bookmark when listType is BookList', async () => {
    const { container, buttons } = await setup({ listType: 'BookList' });

    expect(container).toMatchSnapshot();
    expect(buttons.length).toBe(3);
    expect(buttons[0].firstChild).toHaveClass('fa-bookmark');
    expect(buttons[1].firstChild).toHaveClass('fa-edit');
    expect(buttons[2].firstChild).toHaveClass('fa-trash');
  });

  it('does not render Refresh or Bookmark when listType is MusicList', async () => {
    const { container, buttons } = await setup({ listType: 'MusicList' });

    expect(container).toMatchSnapshot();
    expect(buttons.length).toBe(2);
    expect(buttons[0].firstChild).toHaveClass('fa-edit');
    expect(buttons[1].firstChild).toHaveClass('fa-trash');
  });

  it('calls handleItemRefresh when listType is GroceryList and Refresh is clicked', async () => {
    const { buttons, props, user } = await setup({ listType: 'GroceryList' });

    await user.click(buttons[0]);

    expect(props.handleItemRefresh).toHaveBeenCalledWith(props.item);
  });

  it('calls handleItemRefresh when listType is ToDoList and Refresh is clicked', async () => {
    const { buttons, props, user } = await setup({ listType: 'ToDoList' });

    await user.click(buttons[0]);

    expect(props.handleItemRefresh).toHaveBeenCalledWith(props.item);
  });

  it('calls toggleItemRead when listType is BookList and read is false and Bookmark is clicked', async () => {
    const { buttons, props, user } = await setup({
      listType: 'BookList',
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
      listType: 'BookList',
      item: {
        book_list_id: 'id1',
        id: 'id1',
        read: true,
      },
    });

    await user.click(buttons[0]);

    expect(props.toggleItemRead).toHaveBeenCalledWith(props.item);
  });

  it('calls handleItemEdi when Edit is clicked', async () => {
    const { buttons, props, user } = await setup({
      multiSelect: true,
      selectedItems: [{ id: 'id1' }],
    });

    await user.click(buttons[1]);

    expect(props.handleItemEdit).toHaveBeenCalledWith(props.item);
  });

  it('calls handleItemDelete when Trash is clicked', async () => {
    const { buttons, props, user } = await setup();

    await user.click(buttons[2]);

    expect(props.handleItemDelete).toHaveBeenCalledWith(props.item);
  });
});
