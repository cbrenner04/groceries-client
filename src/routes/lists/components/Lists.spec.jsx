import React from 'react';
import { render } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import Lists from './Lists';

describe('Lists', () => {
  let props;
  let list;
  const renderLists = (props) => {
    const history = createMemoryHistory();
    return render(
      <Router history={history}>
        <Lists {...props} />
      </Router>,
    );
  };

  beforeEach(() => {
    props = {
      userId: 1,
      completedLists: [],
      nonCompletedLists: [],
      pendingLists: [],
      onAccept: jest.fn(),
      onReject: jest.fn(),
      onListCompletion: jest.fn(),
      onListDelete: jest.fn(),
      onListRefresh: jest.fn(),
      currentUserPermissions: {
        1: 'write',
      },
    };
    list = {
      id: 1,
      name: 'foo',
      type: 'GroceryList',
      created_at: new Date('05/27/2020').toISOString(),
      completed: false,
      users_list_id: 1,
      owner_id: 1,
      refreshed: false,
    };
  });

  it('renders pending lists when they exist', () => {
    props.pendingLists = [list];
    const { container, getByTestId, getByText } = renderLists(props);

    expect(container).toMatchSnapshot();
    expect(getByText('These lists have been shared with you but you have not accepted the invitation.')).toBeVisible();
    expect(getByTestId('list-1')).toHaveAttribute('data-test-class', 'pending-list');
  });

  it('does not render pending lists when they do not exist', () => {
    props.nonCompletedLists = [list];
    const { container, queryByText } = renderLists(props);

    expect(container).toMatchSnapshot();
    expect(queryByText('These lists have been shared with you but you have not accepted the invitation.')).toBeNull();
  });

  it('renders incomplete lists', () => {
    props.nonCompletedLists = [list];
    const { container, getByTestId } = renderLists(props);

    expect(container).toMatchSnapshot();
    expect(getByTestId('list-1')).toHaveAttribute('data-test-class', 'non-completed-list');
  });

  it('renders complete lists', () => {
    list.completed = true;
    props.completedLists = [list];
    const { container, getByTestId } = renderLists(props);

    expect(container).toMatchSnapshot();
    expect(getByTestId('list-1')).toHaveAttribute('data-test-class', 'completed-list');
  });
});