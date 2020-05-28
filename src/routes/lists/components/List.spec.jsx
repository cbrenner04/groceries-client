import React from 'react';
import { render } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import List from './List';

describe('List', () => {
  let props;
  const history = createMemoryHistory();
  const renderList = (props) =>
    render(
      <Router history={history}>
        <List {...props} />
      </Router>,
    );

  beforeEach(() => {
    props = {
      userId: 1,
      list: {
        id: 1,
        name: 'foo',
        type: 'GroceryList',
        created_at: new Date('05/27/2020').toISOString(),
        completed: true,
        users_list_id: 1,
        owner_id: 1,
        refreshed: false,
      },
      accepted: false,
      currentUserPermissions: 'write',
    };
  });

  it('renders correct list data-test-class and classes when list is accepted and completed', () => {
    props.accepted = true;
    props.list.completed = true;
    const { container, getByTestId } = renderList(props);

    expect(container).toMatchSnapshot();
    expect(getByTestId('list-1')).toHaveAttribute('data-test-class', 'completed-list');
    expect(getByTestId('list-1')).toHaveClass('accepted-list');
  });

  it('renders correct list data-test-class and classes when list is accepted and not completed', () => {
    props.accepted = true;
    props.list.completed = false;
    const { container, getByTestId } = renderList(props);

    expect(container).toMatchSnapshot();
    expect(getByTestId('list-1')).toHaveAttribute('data-test-class', 'non-completed-list');
    expect(getByTestId('list-1')).toHaveClass('accepted-list');
  });

  it('renders correct list data-test-class and classes when list is not accepted', () => {
    props.accepted = false;
    const { container, getByTestId } = renderList(props);

    expect(container).toMatchSnapshot();
    expect(getByTestId('list-1')).toHaveAttribute('data-test-class', 'pending-list');
    expect(getByTestId('list-1')).toHaveClass('pending-list');
  });

  it('renders * when list has been refreshed', () => {
    props.accepted = true;
    props.list.refreshed = true;

    const { container, getByRole } = renderList(props);

    expect(container).toMatchSnapshot();
    expect(getByRole('heading')).toHaveTextContent(`${props.list.name}*`);
  });
});
