import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import List from './List';

describe('List', () => {
  let props;
  const renderList = (p) => {
    return render(
      <MemoryRouter>
        <List {...p} />
      </MemoryRouter>,
    );
  };

  beforeEach(() => {
    props = {
      listButtons: <div />,
      listName: 'foo',
      listClass: 'foo',
      testClass: 'foo',
      includeLinkToList: false,
      list: {
        id: 'id1',
        name: 'foo',
        type: 'GroceryList',
        created_at: new Date('05/27/2020').toISOString(),
        completed: true,
        users_list_id: 'id1',
        owner_id: 'id1',
        refreshed: false,
      },
      multiSelect: false,
      selectedLists: [],
      setSelectedLists: jest.fn(),
    };
  });

  it('does not render Link when includeLinkToList is false', () => {
    props.includeLinkToList = false;
    const { container, queryByRole } = renderList(props);

    expect(container).toMatchSnapshot();
    expect(queryByRole('link')).toBeNull();
  });

  it('does render Link when includeLinkToList is true', () => {
    props.includeLinkToList = true;
    const { container, getByRole } = renderList(props);

    expect(container).toMatchSnapshot();
    expect(getByRole('link')).toBeVisible();
  });

  it('calls setSelectedLists with list when selecting list', async () => {
    props.multiSelect = true;
    props.setSelectedLists = jest.fn();

    const { container, getByRole } = renderList(props);

    expect(container).toMatchSnapshot();

    fireEvent.click(getByRole('checkbox'));

    expect(props.setSelectedLists).toHaveBeenCalledWith([props.list]);
  });

  it('calls setSelectedLists with empty array when deselecting list', async () => {
    props.multiSelect = true;
    props.setSelectedLists = jest.fn();
    props.selectedLists = [props.list];

    const { container, getByRole } = renderList(props);

    expect(container).toMatchSnapshot();

    fireEvent.click(getByRole('checkbox'));

    expect(props.setSelectedLists).toHaveBeenCalledWith([]);
  });
});
