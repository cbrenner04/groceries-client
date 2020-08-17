import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import ListsWrapper from './ListsWrapper';

describe('ListsWrapper', () => {
  let props;
  const renderListsWrapper = (p) => {
    return render(<ListsWrapper {...p} />);
  };

  const list = {
    id: 1,
    name: 'foo',
    type: 'GroceryList',
    created_at: new Date('05/27/2020').toISOString(),
    completed: true,
    users_list_id: 1,
    owner_id: 1,
    refreshed: false,
  };

  beforeEach(() => {
    props = {
      title: <div />,
      children: [<div key="1" />],
      multiSelect: false,
      selectedLists: [],
      setSelectedLists: jest.fn(),
      setMultiSelect: jest.fn(),
    };
  });

  it('sets multiSelect to true when select is clicked', () => {
    props.multiSelect = false;
    props.selectedLists = [];
    const { container, getAllByText } = renderListsWrapper(props);

    fireEvent.click(getAllByText('Select')[0]);

    expect(container).toMatchSnapshot();
    expect(props.setMultiSelect).toHaveBeenCalledWith(true);
  });

  it('sets multiSelect to false and clears selectedLists when Hide Select is clicked', () => {
    props.multiSelect = true;
    props.selectedLists = [list];
    const { container, getAllByText } = renderListsWrapper(props);

    fireEvent.click(getAllByText('Hide Select')[0]);

    expect(container).toMatchSnapshot();
    expect(props.setMultiSelect).toHaveBeenCalledWith(false);
    expect(props.setSelectedLists).toHaveBeenCalledWith([]);
  });
});
