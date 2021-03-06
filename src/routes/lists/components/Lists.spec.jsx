import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import Lists from './Lists';

describe('Lists', () => {
  let props;
  const renderLists = (p) => {
    return render(<Lists {...p} />);
  };

  const list = {
    id: 'id1',
    name: 'foo',
    type: 'GroceryList',
    created_at: new Date('05/27/2020').toISOString(),
    completed: true,
    users_list_id: 'id1',
    owner_id: 'id1',
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
