import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Lists from './Lists';

function setup(suppliedProps = {}) {
  const user = userEvent.setup();
  const defaultProps = {
    title: <div />,
    children: [<div key="1" />],
    multiSelect: false,
    selectedLists: [],
    setSelectedLists: jest.fn(),
    setMultiSelect: jest.fn(),
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<Lists {...props} />);

  return { ...component, props, user };
}

describe('Lists', () => {
  it('sets multiSelect to true when select is clicked', async () => {
    const { container, findAllByText, props, user } = setup({ multiSelect: false, selectedLists: [] });

    await user.click((await findAllByText('Select'))[0]);

    expect(container).toMatchSnapshot();
    expect(props.setMultiSelect).toHaveBeenCalledWith(true);
  });

  it('sets multiSelect to false and clears selectedLists when Hide Select is clicked', async () => {
    const { container, findAllByText, props, user } = setup({
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

    await user.click((await findAllByText('Hide Select'))[0]);

    expect(container).toMatchSnapshot();
    expect(props.setMultiSelect).toHaveBeenCalledWith(false);
    expect(props.setSelectedLists).toHaveBeenCalledWith([]);
  });
});
