import React from 'react';
import { render } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import ListItem from './ListItem';
import { prettyDueBy } from '../../../utils/format';

describe('ListItem', () => {
  const history = createMemoryHistory();
  const props = {
    item: {
      id: 1,
      product: 'foo',
      task: 'foo',
      quantity: 'foo',
      author: 'foo',
      title: 'foo',
      artist: 'foo',
      album: 'foo',
      assignee_id: 1,
      due_by: new Date('05/21/2020').toISOString(),
      read: false,
      number_in_series: 1,
      category: 'foo',
    },
    purchased: false,
    handleItemDelete: jest.fn(),
    handlePurchaseOfItem: jest.fn(),
    handleReadOfItem: jest.fn(),
    handleUnReadOfItem: jest.fn(),
    handleItemUnPurchase: jest.fn(),
    listType: 'GroceryList',
    listUsers: [],
    permission: 'write',
  };

  const renderListItem = (localProps) => {
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
    props.item.assignee_id = 1;
    props.listUsers = [
      {
        id: 1,
        email,
      },
    ];
    const { container, getByTestId } = renderListItem(props);

    expect(container).toMatchSnapshot();
    expect(getByTestId('assignee-email')).toHaveTextContent(`Assigned To: ${email}`);
  });

  it('does not show assignee when listType is ToDoList, the item is assigned, the assignee is not in listUsers', () => {
    props.listType = 'ToDoList';
    props.item.assignee_id = 1;
    props.listUsers = [
      {
        id: 2,
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
        id: 1,
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
});
