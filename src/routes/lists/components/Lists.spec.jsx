import React from 'react';
import { render, fireEvent } from '@testing-library/react';
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
      onRemove: jest.fn(),
      onListCompletion: jest.fn(),
      onListDelete: jest.fn(),
      onListRefresh: jest.fn(),
      currentUserPermissions: {
        1: 'write',
      },
      selectedLists: [],
      multiSelect: false,
      setMultiSelect: jest.fn(),
      setSelectedLists: jest.fn(),
      handleMerge: jest.fn(),
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
    expect(getByText('Pending')).toBeVisible();
    expect(getByTestId('list-1')).toHaveAttribute('data-test-class', 'pending-list');
  });

  it('does not render pending lists when they do not exist', () => {
    props.nonCompletedLists = [list];
    const { container, queryByText } = renderLists(props);

    expect(container).toMatchSnapshot();
    expect(queryByText('Pending')).toBeNull();
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

  it('sets multiSelect to true when select is clicked', () => {
    props.multiSelect = false;
    props.selectedLists = [];
    const { container, getAllByText } = renderLists(props);

    fireEvent.click(getAllByText('Select')[0]);

    expect(container).toMatchSnapshot();
    expect(props.setMultiSelect).toHaveBeenCalledWith(true);
  });

  it('sets multiSelect to false and clears selectedLists when Hide Select is clicked', () => {
    props.multiSelect = true;
    props.selectedLists = [list];
    const { container, getAllByText } = renderLists(props);

    fireEvent.click(getAllByText('Hide Select')[0]);

    expect(container).toMatchSnapshot();
    expect(props.setMultiSelect).toHaveBeenCalledWith(false);
    expect(props.setSelectedLists).toHaveBeenCalledWith([]);
  });
});
