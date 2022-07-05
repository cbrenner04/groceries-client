import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

import List from './List';

function setup(suppliedProps) {
  const user = userEvent.setup();
  const defaultProps = {
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
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(
    <MemoryRouter>
      <List {...props} />
    </MemoryRouter>,
  );

  return { ...component, props, user };
}

describe('List', () => {
  it('does not render Link when includeLinkToList is false', () => {
    const { container, queryByRole } = setup({ includeLinkToList: false });

    expect(container).toMatchSnapshot();
    expect(queryByRole('link')).toBeNull();
  });

  it('does render Link when includeLinkToList is true', async () => {
    const { container, findByRole } = setup({ includeLinkToList: true });

    expect(container).toMatchSnapshot();
    expect(await findByRole('link')).toBeVisible();
  });

  it('calls setSelectedLists with list when selecting list', async () => {
    const { container, findByRole, props, user } = setup({ multiSelect: true });

    expect(container).toMatchSnapshot();

    await user.click(await findByRole('checkbox'));

    expect(props.setSelectedLists).toHaveBeenCalledWith([props.list]);
  });

  it('calls setSelectedLists with empty array when deselecting list', async () => {
    const { container, findByRole, props, user } = setup({
      multiSelect: true,
      selectedLists: [
        {
          id: 'id1',
          name: 'foo',
          type: 'GroceryList',
          created_at: new Date('05/27/2020').toISOString(),
          completed: true,
          users_list_id: 'id1',
          owner_id: 'id1',
          refreshed: false,
        },
      ],
    });

    expect(container).toMatchSnapshot();

    await user.click(await findByRole('checkbox'));

    expect(props.setSelectedLists).toHaveBeenCalledWith([]);
  });
});
