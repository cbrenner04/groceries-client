import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import NotPurchased from './NotPurchased';

describe('NotPurchased', () => {
  const history = createMemoryHistory();
  let props;

  const renderNotPurchased = (localProps) => {
    return render(
      <Router history={history}>
        <NotPurchased {...localProps} />
      </Router>,
    );
  };

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
      handleReadOfItem: jest.fn(),
      handleUnReadOfItem: jest.fn(),
      handleItemUnPurchase: jest.fn(),
      listType: 'GroceryList',
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

  it('calls handleReadOfItem when listType is BookList and read is false and Bookmark is clicked', () => {
    props.listType = 'BookList';
    props.item.read = false;
    const { getAllByRole } = renderNotPurchased(props);

    fireEvent.click(getAllByRole('button')[0]);

    expect(props.handleReadOfItem).toHaveBeenCalledWith(props.item);
  });

  it('calls handleUnReadOfItem when listType is BookList and read is true and Bookmark is clicked', () => {
    props.listType = 'BookList';
    props.item.read = true;
    const { getAllByRole } = renderNotPurchased(props);

    fireEvent.click(getAllByRole('button')[0]);

    expect(props.handleUnReadOfItem).toHaveBeenCalledWith(props.item);
  });

  it('calls handlePurchaseOfItem when Complete is clicked', () => {
    const { getAllByRole } = renderNotPurchased(props);

    fireEvent.click(getAllByRole('button')[0]);

    expect(props.handlePurchaseOfItem).toHaveBeenCalledWith(props.item);
  });

  it('navigates to edit list item when Edit is clicked', () => {
    const { getByRole } = renderNotPurchased(props);

    fireEvent.click(getByRole('link'));

    expect(history.location.pathname).toBe('/lists/1/grocery_list_items/1/edit');
  });

  it('calls handleItemDelete when Trash is clicked', () => {
    const { getAllByRole } = renderNotPurchased(props);

    fireEvent.click(getAllByRole('button')[1]);

    expect(props.handleItemDelete).toHaveBeenCalledWith(props.item);
  });
});
