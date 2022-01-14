import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import IncompleteListButtons from './IncompleteListButtons';

describe('IncompleteListButtons', () => {
  let props;
  const renderIncompleteListButtons = (props) => {
    return render(
      <MemoryRouter>
        <IncompleteListButtons {...props} />
      </MemoryRouter>,
    );
  };

  beforeEach(() => {
    props = {
      userId: 'id1',
      list: {
        id: 'id1',
        owner_id: 'id1',
        name: 'foo',
        type: 'GroceryList',
        created_at: 'some date',
        completed: false,
        refreshed: false,
      },
      onListCompletion: jest.fn(),
      onListDeletion: jest.fn(),
      currentUserPermissions: 'write',
      multiSelect: false,
      handleMerge: jest.fn(),
      selectedLists: [],
      pending: false,
    };
  });

  it('complete and edit are disabled when user is not owner', () => {
    props.userId = 'id2';
    props.list.owner_id = 'id3';
    const { container, getByTestId } = renderIncompleteListButtons(props);

    expect(container).toMatchSnapshot();
    expect(getByTestId('incomplete-list-complete')).toBeDisabled();
    expect(getByTestId('incomplete-list-complete')).toHaveClass('list-button-disabled');
    expect(getByTestId('incomplete-list-edit')).toHaveAttribute('disabled', '');
    expect(getByTestId('incomplete-list-edit')).toHaveClass('list-button-disabled');
  });

  it('complete and edit are enabled when user is owner', () => {
    props.userId = 'id1';
    props.list.owner_id = 'id1';
    const { container, getByTestId } = renderIncompleteListButtons(props);

    expect(container).toMatchSnapshot();
    expect(getByTestId('incomplete-list-complete')).toBeEnabled();
    expect(getByTestId('incomplete-list-complete')).toHaveClass('list-button-enabled');
    expect(getByTestId('incomplete-list-edit')).not.toHaveAttribute('disabled', '');
    expect(getByTestId('incomplete-list-edit')).toHaveClass('list-button-enabled');
  });

  it('edit is hidden when multiSelect and selectedLists > 1', () => {
    props.multiSelect = true;
    props.selectedLists = [
      {
        id: 'id1',
        owner_id: 'id1',
        name: 'foo',
        type: 'GroceryList',
        created_at: 'some date',
        completed: false,
        refreshed: false,
      },
      {
        id: 'id2',
        owner_id: 'id1',
        name: 'bar',
        type: 'GroceryList',
        created_at: 'some date',
        completed: false,
        refreshed: false,
      },
    ];
    const { container, queryByTestId } = renderIncompleteListButtons(props);

    expect(container).toMatchSnapshot();
    expect(queryByTestId('incomplete-list-edit')).toBeNull();
  });

  it('merge is displayed when multiSelect and selectedLists > 1', () => {
    props.multiSelect = true;
    props.selectedLists = [
      {
        id: 'id1',
        owner_id: 'id1',
        name: 'foo',
        type: 'GroceryList',
        created_at: 'some date',
        completed: false,
        refreshed: false,
      },
      {
        id: 'id2',
        owner_id: 'id1',
        name: 'bar',
        type: 'GroceryList',
        created_at: 'some date',
        completed: false,
        refreshed: false,
      },
    ];
    const { container, getByTestId } = renderIncompleteListButtons(props);

    expect(container).toMatchSnapshot();
    expect(getByTestId('incomplete-list-merge')).toBeVisible();
  });

  it('share is disabled when user does not have write permissions', () => {
    props.currentUserPermissions = 'read';
    const { container, getByTestId } = renderIncompleteListButtons(props);

    expect(container).toMatchSnapshot();
    expect(getByTestId('incomplete-list-share')).toHaveAttribute('disabled', '');
    expect(getByTestId('incomplete-list-share')).toHaveClass('list-button-disabled');
  });

  it('share is hidden when multiSelect and selectedLists > 1', () => {
    props.multiSelect = true;
    props.selectedLists = [
      {
        id: 'id1',
        owner_id: 'id1',
        name: 'foo',
        type: 'GroceryList',
        created_at: 'some date',
        completed: false,
        refreshed: false,
      },
      {
        id: 'id2',
        owner_id: 'id1',
        name: 'bar',
        type: 'GroceryList',
        created_at: 'some date',
        completed: false,
        refreshed: false,
      },
    ];
    const { container, queryByTestId } = renderIncompleteListButtons(props);

    expect(container).toMatchSnapshot();
    expect(queryByTestId('incomplete-list-share')).toBeNull();
  });

  it('share is enabled when user has write permissions and not multiSelect', () => {
    props.currentUserPermissions = 'write';
    props.multiSelect = false;
    const { container, getByTestId } = renderIncompleteListButtons(props);

    expect(container).toMatchSnapshot();
    expect(getByTestId('incomplete-list-share')).not.toHaveAttribute('disabled', '');
    expect(getByTestId('incomplete-list-share')).toHaveClass('list-button-enabled');
  });

  it('calls props.onListCompletion when complete is clicked', () => {
    const { getByTestId } = renderIncompleteListButtons(props);

    fireEvent.click(getByTestId('incomplete-list-complete'));

    expect(props.onListCompletion).toHaveBeenCalledWith(props.list);
  });

  it('calls props.onListDeletion when delete is clicked', () => {
    const { getByTestId } = renderIncompleteListButtons(props);

    fireEvent.click(getByTestId('incomplete-list-trash'));

    expect(props.onListDeletion).toHaveBeenCalledWith(props.list);
  });
});
