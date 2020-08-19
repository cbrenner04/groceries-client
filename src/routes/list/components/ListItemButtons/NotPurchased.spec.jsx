import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import NotPurchased from './NotPurchased';

describe('NotPurchased', () => {
  let props;
  const renderNotPurchased = (localProps) => render(<NotPurchased {...localProps} />);

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
      handleItemEdit: jest.fn(),
      listType: 'GroceryList',
      pending: false,
    };
  });

  it('renders Bookmark when listType is BookList', () => {
    props.listType = 'BookList';
    props.item.book_list_id = 1;
    const { container, getAllByRole } = renderNotPurchased(props);

    expect(container).toMatchSnapshot();
    expect(getAllByRole('button')[0].firstChild).toHaveClass('fa-bookmark');
  });

  it('does not render Bookmark when listType is not BookList', () => {
    props.listType = 'GroceryList';
    const { container, getAllByRole } = renderNotPurchased(props);

    expect(container).toMatchSnapshot();
    getAllByRole('button').forEach((button) => {
      expect(button).not.toHaveClass('fa-bookmark');
    });
  });

  it('calls toggleItemRead when listType is BookList and read is false and Bookmark is clicked', () => {
    props.listType = 'BookList';
    props.item.read = false;
    const { getAllByRole } = renderNotPurchased(props);

    fireEvent.click(getAllByRole('button')[0]);

    expect(props.toggleItemRead).toHaveBeenCalledWith(props.item);
  });

  it('calls toggleItemRead when listType is BookList and read is true and Bookmark is clicked', () => {
    props.listType = 'BookList';
    props.item.read = true;
    const { getAllByRole } = renderNotPurchased(props);

    fireEvent.click(getAllByRole('button')[0]);

    expect(props.toggleItemRead).toHaveBeenCalledWith(props.item);
  });

  it('calls handlePurchaseOfItem when Complete is clicked', () => {
    const { getAllByRole } = renderNotPurchased(props);

    fireEvent.click(getAllByRole('button')[0]);

    expect(props.handlePurchaseOfItem).toHaveBeenCalledWith(props.item);
  });

  it('navigates to edit list item when Edit is clicked', () => {
    const { getAllByRole } = renderNotPurchased(props);

    fireEvent.click(getAllByRole('button')[1]);

    expect(props.handleItemEdit).toHaveBeenCalledWith(props.item);
  });

  it('calls handleItemDelete when Trash is clicked', () => {
    const { getAllByRole } = renderNotPurchased(props);

    fireEvent.click(getAllByRole('button')[2]);

    expect(props.handleItemDelete).toHaveBeenCalledWith(props.item);
  });
});
