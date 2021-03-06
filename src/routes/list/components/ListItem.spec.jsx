import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import ListItem from './ListItem';
import { prettyDueBy } from '../../../utils/format';

describe('ListItem', () => {
  const props = {
    item: {
      id: 'id1',
      product: 'foo',
      task: 'foo',
      quantity: 'foo',
      author: 'foo',
      title: 'foo',
      artist: 'foo',
      album: 'foo',
      assignee_id: 'id1',
      due_by: new Date('05/21/2020').toISOString(),
      read: false,
      number_in_series: 1,
      category: 'foo',
    },
    purchased: false,
    handleItemDelete: jest.fn(),
    handlePurchaseOfItem: jest.fn(),
    handleItemRefresh: jest.fn(),
    handleItemSelect: jest.fn(),
    handleItemEdit: jest.fn(),
    multiSelect: false,
    toggleItemRead: jest.fn(),
    listType: 'GroceryList',
    listUsers: [],
    permission: 'write',
    selectedItems: [],
    pending: false,
  };

  const renderListItem = (localProps) => {
    const history = createMemoryHistory();
    return render(
      <Router history={history}>
        <ListItem {...localProps} />
      </Router>,
    );
  };

  it('sets the data-test-class to purchased-item when item is purchased', () => {
    props.purchased = true;
    const { container } = renderListItem(props);

    expect(container).toMatchSnapshot();
    expect(container.firstChild.getAttribute('data-test-class')).toBe('purchased-item');
  });

  it('sets the data-test-class to not-purchased-item when item is not purchased', () => {
    props.purchased = false;
    const { container } = renderListItem(props);

    expect(container).toMatchSnapshot();
    expect(container.firstChild.getAttribute('data-test-class')).toBe('non-purchased-item');
  });

  it('shows assignee when listType is ToDoList and the item is assigned and the assignee is in the listUsers', () => {
    const email = 'foo@example.com';
    props.listType = 'ToDoList';
    props.item.assignee_id = 'id1';
    props.listUsers = [
      {
        id: 'id1',
        email,
      },
    ];
    const { container, getByTestId } = renderListItem(props);

    expect(container).toMatchSnapshot();
    expect(getByTestId('assignee-email')).toHaveTextContent(`Assigned To: ${email}`);
  });

  it('does not show assignee when listType is ToDoList, the item is assigned, the assignee is not in listUsers', () => {
    props.listType = 'ToDoList';
    props.item.assignee_id = 'id1';
    props.listUsers = [
      {
        id: 'id2',
        email: 'foo@example.com',
      },
    ];
    const { container, getByTestId } = renderListItem(props);

    expect(container).toMatchSnapshot();
    expect(getByTestId('assignee-email')).not.toHaveTextContent('Assigned To');
  });

  it('does not show assignee when listType is ToDoList and the item is not assigned', () => {
    props.listType = 'ToDoList';
    props.item.assignee_id = null;
    props.listUsers = [
      {
        id: 'id1',
        email: 'foo@example.com',
      },
    ];
    const { container, getByTestId } = renderListItem(props);

    expect(container).toMatchSnapshot();
    expect(getByTestId('assignee-email')).not.toHaveTextContent('Assigned To');
  });

  it('displays due by when listType is ToDoList and dueBy exists', () => {
    props.listType = 'ToDoList';
    props.item.due_by = new Date('05/21/2020').toISOString();

    const { container, getByTestId } = renderListItem(props);

    expect(container).toMatchSnapshot();
    expect(getByTestId('due-by')).toHaveTextContent(`Due By: ${prettyDueBy(props.item.due_by)}`);
  });

  it('does not display due by when listType is ToDoList and dueBy does not exist', () => {
    props.listType = 'ToDoList';
    props.item.due_by = null;

    const { container, getByTestId } = renderListItem(props);

    expect(container).toMatchSnapshot();
    expect(getByTestId('due-by')).not.toHaveTextContent('Due By');
  });

  it('renders ListItemButtons when the user has write permission', () => {
    props.permission = 'write';

    const { container, getAllByRole } = renderListItem(props);

    expect(container).toMatchSnapshot();
    expect(getAllByRole('button').length).toBeTruthy();
  });

  it('does not render ListItemButtons when the user has read permission', () => {
    props.permission = 'read';

    const { container, queryAllByRole } = renderListItem(props);

    expect(container).toMatchSnapshot();
    expect(queryAllByRole('button').length).toBeFalsy();
  });

  it('sets selected items when multi select checkbox is selected', () => {
    props.multiSelect = true;

    const { container, getByRole } = renderListItem(props);

    expect(container).toMatchSnapshot();

    fireEvent.click(getByRole('checkbox'));

    expect(props.handleItemSelect).toHaveBeenCalledWith(props.item);
  });
});
