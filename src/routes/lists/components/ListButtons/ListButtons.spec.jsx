import React from 'react';
import { render } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import ListButtons from './index';

describe('ListButtons', () => {
  let props;
  const renderListButtons = (props) => {
    const history = createMemoryHistory();
    return render(
      <Router history={history}>
        <ListButtons {...props} />
      </Router>,
    );
  };

  beforeEach(() => {
    props = {
      userId: 1,
      list: {
        id: 1,
        name: 'foo',
        type: 'GroceryList',
        created_at: new Date('05/27/2020').toISOString(),
        completed: false,
        users_list_id: 1,
        owner_id: 1,
        refreshed: false,
      },
      accepted: false,
      onListDeletion: jest.fn(),
      onListCompletion: jest.fn(),
      onListRefresh: jest.fn(),
      onListAcceptance: jest.fn(),
      onListRejection: jest.fn(),
      onListRemoval: jest.fn(),
      currentUserPermissions: 'write',
      multiSelect: false,
      selectedLists: [],
      handleMerge: jest.fn(),
    };
  });

  it('renders CompleteListButtons when list is accepted and completed', () => {
    props.accepted = true;
    props.list.completed = true;
    const { container, getByTestId, queryByTestId } = renderListButtons(props);

    expect(container).toMatchSnapshot();
    expect(getByTestId('complete-list-refresh')).toBeVisible();
    expect(getByTestId('complete-list-trash')).toBeVisible();
    expect(queryByTestId('incomplete-list-complete')).toBeNull();
    expect(queryByTestId('incomplete-list-share')).toBeNull();
    expect(queryByTestId('incomplete-list-edit')).toBeNull();
    expect(queryByTestId('incomplete-list-trash')).toBeNull();
    expect(queryByTestId('pending-list-accept')).toBeNull();
    expect(queryByTestId('pending-list-trash')).toBeNull();
  });

  it('renders IncompleteListButtons when list is accepted and not completed', () => {
    props.accepted = true;
    props.list.completed = false;
    const { container, getByTestId, queryByTestId } = renderListButtons(props);

    expect(container).toMatchSnapshot();
    expect(queryByTestId('complete-list-refresh')).toBeNull();
    expect(queryByTestId('complete-list-trash')).toBeNull();
    expect(getByTestId('incomplete-list-complete')).toBeVisible();
    expect(getByTestId('incomplete-list-share')).toBeVisible();
    expect(getByTestId('incomplete-list-edit')).toBeVisible();
    expect(getByTestId('incomplete-list-trash')).toBeVisible();
    expect(queryByTestId('pending-list-accept')).toBeNull();
    expect(queryByTestId('pending-list-trash')).toBeNull();
  });

  it('renders PendingListButtons when list is not accepted', () => {
    props.accepted = false;
    const { container, getByTestId, queryByTestId } = renderListButtons(props);

    expect(container).toMatchSnapshot();
    expect(queryByTestId('complete-list-refresh')).toBeNull();
    expect(queryByTestId('complete-list-trash')).toBeNull();
    expect(queryByTestId('incomplete-list-complete')).toBeNull();
    expect(queryByTestId('incomplete-list-share')).toBeNull();
    expect(queryByTestId('incomplete-list-edit')).toBeNull();
    expect(queryByTestId('incomplete-list-trash')).toBeNull();
    expect(getByTestId('pending-list-accept')).toBeVisible();
    expect(getByTestId('pending-list-trash')).toBeVisible();
  });
});
