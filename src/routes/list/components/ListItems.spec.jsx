import React from 'react';
import { render } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import ListItems from './ListItems';

describe('ListItems', () => {
  const props = {
    category: 'foo',
    items: [
      {
        id: 1,
        product: 'foo',
        task: 'foo',
        quantity: 'foo',
        author: 'foo',
        title: 'foo',
        artist: 'foo',
        album: 'foo',
        assignee_id: 1,
        due_by: new Date().toISOString(),
        read: false,
        number_in_series: 1,
        category: 'foo',
      },
    ],
    purchased: false,
    handleItemDelete: jest.fn(),
    handlePurchaseOfItem: jest.fn(),
    handleItemRefresh: jest.fn(),
    multiSelect: false,
    handleItemEdit: jest.fn(),
    handleItemSelect: jest.fn(),
    toggleItemRead: jest.fn(),
    listType: 'GroceryList',
    listUsers: [
      {
        id: 1,
        email: 'foo@example.com',
      },
    ],
    permission: 'write',
    selectedItems: [],
  };
  const renderListItems = (localProps) => {
    const history = createMemoryHistory();
    return render(
      <Router history={history}>
        <ListItems {...localProps} />
      </Router>,
    );
  };

  it('renders a mapping of ListItem', () => {
    const { container } = renderListItems(props);

    expect(container).toMatchSnapshot();
  });
});
