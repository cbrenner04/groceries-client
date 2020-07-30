import React from 'React';
import { render, fireEvent } from '@testing-library/react';

import Purchased from './Purchased';

describe('Purchased', () => {
  let props;

  beforeEach(() => {
    props = {
      item: {
        grocery_list_id: 1,
        id: 1,
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
    };
  });

  it('renders Refresh and does not render Bookmark when listType is GroceryList', () => {
    props.listType = 'GroceryList';
    const { container, getAllByRole } = render(<Purchased {...props} />);
    const buttons = getAllByRole('button');

    expect(container).toMatchSnapshot();
    expect(buttons.length).toBe(3);
    expect(buttons[0].firstChild).toHaveClass('fa-redo');
    expect(buttons[1].firstChild).toHaveClass('fa-edit');
    expect(buttons[2].firstChild).toHaveClass('fa-trash');
  });

  it('renders Refresh and does not render Bookmark when listType is ToDoList', () => {
    props.listType = 'ToDoList';
    const { container, getAllByRole } = render(<Purchased {...props} />);
    const buttons = getAllByRole('button');

    expect(container).toMatchSnapshot();
    expect(buttons.length).toBe(3);
    expect(buttons[0].firstChild).toHaveClass('fa-redo');
    expect(buttons[1].firstChild).toHaveClass('fa-edit');
    expect(buttons[2].firstChild).toHaveClass('fa-trash');
  });

  it('does not render Refresh and does render Bookmark when listType is BookList', () => {
    props.listType = 'BookList';
    const { container, getAllByRole } = render(<Purchased {...props} />);
    const buttons = getAllByRole('button');

    expect(container).toMatchSnapshot();
    expect(buttons.length).toBe(3);
    expect(buttons[0].firstChild).toHaveClass('fa-bookmark');
    expect(buttons[1].firstChild).toHaveClass('fa-edit');
    expect(buttons[2].firstChild).toHaveClass('fa-trash');
  });

  it('does not render Refresh or Bookmark when listType is MusicList', () => {
    props.listType = 'MusicList';
    const { container, getAllByRole } = render(<Purchased {...props} />);
    const buttons = getAllByRole('button');

    expect(container).toMatchSnapshot();
    expect(buttons.length).toBe(2);
    expect(buttons[0].firstChild).toHaveClass('fa-edit');
    expect(buttons[1].firstChild).toHaveClass('fa-trash');
  });

  it('calls handleItemRefresh when listType is GroceryList and Refresh is clicked', () => {
    props.listType = 'GroceryList';
    const { getAllByRole } = render(<Purchased {...props} />);

    fireEvent.click(getAllByRole('button')[0]);

    expect(props.handleItemRefresh).toHaveBeenCalledWith(props.item);
  });

  it('calls handleItemRefresh when listType is ToDoList and Refresh is clicked', () => {
    props.listType = 'ToDoList';
    const { getAllByRole } = render(<Purchased {...props} />);

    fireEvent.click(getAllByRole('button')[0]);

    expect(props.handleItemRefresh).toHaveBeenCalledWith(props.item);
  });

  it('calls toggleItemRead when listType is BookList and read is false and Bookmark is clicked', () => {
    props.listType = 'BookList';
    props.item.read = false;
    const { getAllByRole } = render(<Purchased {...props} />);

    fireEvent.click(getAllByRole('button')[0]);

    expect(props.toggleItemRead).toHaveBeenCalledWith(props.item);
  });

  it('calls toggleItemRead when listType is BookList and read is true and Bookmark is clicked', () => {
    props.listType = 'BookList';
    props.item.read = true;
    const { getAllByRole } = render(<Purchased {...props} />);

    fireEvent.click(getAllByRole('button')[0]);

    expect(props.toggleItemRead).toHaveBeenCalledWith(props.item);
  });

  it('calls handleItemEdi when Edit is clicked', () => {
    props.multiSelect = true;
    props.selectedItems = [{ id: 1 }];
    const { getAllByRole } = render(<Purchased {...props} />);

    fireEvent.click(getAllByRole('button')[1]);

    expect(props.handleItemEdit).toHaveBeenCalledWith(props.item);
  });

  it('calls handleItemDelete when Trash is clicked', () => {
    const { getAllByRole } = render(<Purchased {...props} />);

    fireEvent.click(getAllByRole('button')[2]);

    expect(props.handleItemDelete).toHaveBeenCalledWith(props.item);
  });
});
