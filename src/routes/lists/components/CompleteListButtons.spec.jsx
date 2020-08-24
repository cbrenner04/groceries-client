import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import CompleteListButtons from './CompleteListButtons';

describe('CompleteListButtons', () => {
  let props;

  beforeEach(() => {
    props = {
      onListRefresh: jest.fn(),
      onListDeletion: jest.fn(),
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
      multiSelect: false,
      selectedLists: [],
      handleMerge: jest.fn(),
      pending: false,
    };
  });
  it('renders refresh disabled when user is not owner', () => {
    props.userId = 'id2';
    props.list.owner_id = 'id1';
    const { container, getByTestId } = render(<CompleteListButtons {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByTestId('complete-list-refresh')).toBeDisabled();
    expect(getByTestId('complete-list-refresh')).toHaveStyle({ opacity: 0.3 });
  });

  it('renders refresh enabled when user is owner', () => {
    props.userId = 'id1';
    props.list.owner_id = 'id1';
    const { container, getByTestId } = render(<CompleteListButtons {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByTestId('complete-list-refresh')).toBeEnabled();
    expect(getByTestId('complete-list-refresh')).toHaveStyle({ opacity: 1 });
  });

  it('calls props.onListRefresh when refresh button is clicked', () => {
    const { getByTestId } = render(<CompleteListButtons {...props} />);

    fireEvent.click(getByTestId('complete-list-refresh'));

    expect(props.onListRefresh).toHaveBeenCalledWith(props.list);
  });

  it('calls props.onListDeletion when delete button is clicked', () => {
    const { getByTestId } = render(<CompleteListButtons {...props} />);

    fireEvent.click(getByTestId('complete-list-trash'));

    expect(props.onListDeletion).toHaveBeenCalledWith(props.list);
  });

  it('calls handleMerge when Merge is selected', () => {
    props.multiSelect = true;
    props.selectedLists = [
      {
        id: 'id1',
        name: 'foo',
        type: 'GroceryList',
        created_at: 'some date',
        completed: false,
        refreshed: false,
        owner_id: 'id1',
      },
      {
        id: 'id12',
        name: 'bar',
        type: 'GroceryList',
        created_at: 'some date',
        completed: false,
        refreshed: false,
        owner_id: 'id1',
      },
    ];
    const { container, getByTestId } = render(<CompleteListButtons {...props} />);

    expect(container).toMatchSnapshot();

    fireEvent.click(getByTestId('complete-list-merge'));

    expect(props.handleMerge).toHaveBeenCalled();
  });
});
