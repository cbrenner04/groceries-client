import React from 'react';
import { render } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import ListItemButtons from './index';

describe('ListItemButtons', () => {
  let props;

  const renderListItemButtons = (localProps) => {
    const history = createMemoryHistory();
    return render(
      <Router history={history}>
        <ListItemButtons {...localProps} />
      </Router>,
    );
  };

  beforeEach(() => {
    props = {
      item: {
        grocery_list_id: 'id1',
        id: 'id1',
        read: true,
      },
      purchased: true,
      handleItemDelete: jest.fn(),
      handlePurchaseOfItem: jest.fn(),
      toggleItemRead: jest.fn(),
      handleItemRefresh: jest.fn(),
      handleItemEdit: jest.fn(),
      listType: 'GroceryList',
      multiSelect: false,
      selectedItems: [],
      pending: false,
    };
  });

  it('renders Purchased when the item is purchased', () => {
    props.purchased = true;
    const { container, getAllByRole } = renderListItemButtons(props);
    const buttons = getAllByRole('button');

    expect(container).toMatchSnapshot();
    expect(buttons.length).toBe(3);
    expect(buttons[0].firstChild).toHaveClass('fa-redo');
    expect(buttons[1].firstChild).toHaveClass('fa-edit');
    expect(buttons[2].firstChild).toHaveClass('fa-trash');
  });

  it('renders NotPurchased when the item is not purchased', () => {
    props.purchased = false;
    const { container, getAllByRole } = renderListItemButtons(props);
    const buttons = getAllByRole('button');

    expect(container).toMatchSnapshot();
    expect(buttons.length).toBe(3);
    expect(buttons[0].firstChild).toHaveClass('fa-check');
    expect(buttons[1].firstChild).toHaveClass('fa-edit');
    expect(buttons[2].firstChild).toHaveClass('fa-trash');
  });
});
