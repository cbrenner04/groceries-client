import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import ListItem, { type IListItemProps } from './ListItem';
import { prettyDueBy } from '../../../utils/format';
import { EListType, type IListItem } from '../../../typings';

interface ISetupReturn extends RenderResult {
  props: IListItemProps;
  user: UserEvent;
}

function setup(suppliedProps: Partial<IListItemProps>, suppliedItem: Partial<IListItem>): ISetupReturn {
  const user = userEvent.setup();
  const defaultItem = {
    id: 'id1',
    product: 'foo',
    task: 'foo',
    quantity: 'foo',
    author: 'foo',
    title: 'foo',
    artist: 'foo',
    album: 'foo',
    assignee_id: 'id1',
    due_by: new Date('05/21/2020').toISOString(),
    read: false,
    number_in_series: 1,
    category: 'foo',
  };
  const defaultProps = {
    item: { ...defaultItem, ...suppliedItem },
    purchased: false,
    handleItemDelete: jest.fn(),
    handlePurchaseOfItem: jest.fn(),
    handleItemRefresh: jest.fn(),
    handleItemSelect: jest.fn(),
    handleItemEdit: jest.fn(),
    multiSelect: false,
    toggleItemRead: jest.fn(),
    listType: EListType.GROCERY_LIST,
    listUsers: [],
    permission: 'write',
    selectedItems: [],
    pending: false,
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(
    <MemoryRouter>
      <ListItem {...props} />
    </MemoryRouter>,
  );

  return { ...component, props, user };
}

describe('ListItem', () => {
  it('sets the data-test-class to purchased-item when item is purchased', () => {
    const { container } = setup({ purchased: true }, {});

    expect(container).toMatchSnapshot();
    expect(container.firstChild).toHaveAttribute('data-test-class', 'purchased-item');
  });

  it('sets the data-test-class to not-purchased-item when item is not purchased', () => {
    const { container } = setup({ purchased: false }, {});

    expect(container).toMatchSnapshot();
    expect(container.firstChild).toHaveAttribute('data-test-class', 'non-purchased-item');
  });

  it('shows assignee when listType is ToDoList, the item is assigned, the assignee is in the listUsers', async () => {
    const email = 'foo@example.com';
    const { container, findByTestId } = setup(
      {
        listType: EListType.TO_DO_LIST,
        listUsers: [
          {
            id: 'id1',
            email,
          },
        ],
      },
      {
        assignee_id: 'id1',
      },
    );

    expect(container).toMatchSnapshot();
    expect(await findByTestId('assignee-email')).toHaveTextContent(`Assigned To: ${email}`);
  });

  it('does not show assignee when listType is ToDoList, item is assigned & assignee is not in listUsers', async () => {
    const { container, findByTestId } = setup(
      {
        listType: EListType.TO_DO_LIST,
        listUsers: [
          {
            id: 'id2',
            email: 'foo@example.com',
          },
        ],
      },
      {
        assignee_id: 'id1',
      },
    );

    expect(container).toMatchSnapshot();
    expect(await findByTestId('assignee-email')).not.toHaveTextContent('Assigned To');
  });

  it('does not show assignee when listType is ToDoList and the item is not assigned', async () => {
    const { container, findByTestId } = setup(
      {
        listType: EListType.TO_DO_LIST,
        listUsers: [
          {
            id: 'id1',
            email: 'foo@example.com',
          },
        ],
      },
      {
        assignee_id: null,
      },
    );

    expect(container).toMatchSnapshot();
    expect(await findByTestId('assignee-email')).not.toHaveTextContent('Assigned To');
  });

  it('displays due by when listType is ToDoList and dueBy exists', async () => {
    const dueBy = new Date('05/21/2020').toISOString();
    const { container, findByTestId } = setup(
      {
        listType: EListType.TO_DO_LIST,
      },
      {
        due_by: dueBy,
      },
    );

    expect(container).toMatchSnapshot();
    expect(await findByTestId('due-by')).toHaveTextContent(`Due By: ${prettyDueBy(dueBy)}`);
  });

  it('does not display due by when listType is ToDoList and dueBy does not exist', async () => {
    const { container, findByTestId } = setup(
      {
        listType: EListType.TO_DO_LIST,
      },
      {
        due_by: null,
      },
    );

    expect(container).toMatchSnapshot();
    expect(await findByTestId('due-by')).not.toHaveTextContent('Due By');
  });

  it('renders ListItemButtons when the user has write permission', async () => {
    const { container, findAllByRole } = setup({ permission: 'write' }, {});

    expect(container).toMatchSnapshot();
    expect((await findAllByRole('button')).length).toBeTruthy();
  });

  it('does not render ListItemButtons when the user has read permission', () => {
    const { container, queryAllByRole } = setup({ permission: 'read' }, {});
    expect(container).toMatchSnapshot();
    expect(queryAllByRole('button').length).toBeFalsy();
  });

  it('sets selected items when multi select checkbox is selected', async () => {
    const { container, findByRole, props, user } = setup({ multiSelect: true }, {});

    expect(container).toMatchSnapshot();

    await user.click(await findByRole('checkbox'));

    expect(props.handleItemSelect).toHaveBeenCalledWith(props.item);
  });
});
