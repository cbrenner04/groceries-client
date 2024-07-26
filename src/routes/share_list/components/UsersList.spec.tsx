import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import UsersList, { type IUsersListProps } from './UsersList';

interface ISetupReturn extends RenderResult {
  user: UserEvent;
  props: IUsersListProps;
}

function setup(userIsOwner = true): ISetupReturn {
  const user = userEvent.setup();
  const props = {
    togglePermission: jest.fn(),
    removeShare: jest.fn(),
    userIsOwner,
    userId: 'id1',
    status: 'accepted',
    users: [
      {
        user: {
          id: 'id1',
          email: 'foo@example.com',
        },
        users_list: {
          id: 'id1',
          permissions: 'write',
        },
      },
      {
        user: {
          id: 'id2',
          email: 'bar@example.com',
        },
        users_list: {
          id: 'id2',
          permissions: 'write',
        },
      },
      {
        user: {
          id: 'id3',
          email: 'baz@example.com',
        },
        users_list: {
          id: 'id4',
          permissions: 'read',
        },
      },
    ],
  };
  const component = render(<UsersList {...props} />);

  return { ...component, props, user };
}

describe('UsersList', () => {
  it('renders read and write badges when user is owner', async () => {
    const { container, findByTestId, queryByTestId } = setup(true);

    expect(container).toMatchSnapshot();
    expect(queryByTestId('accepted-user-id1')).toBeNull();
    expect((await findByTestId('accepted-user-id2')).children[0].children[1].firstChild).toHaveAttribute(
      'data-test-id',
      'perm-write',
    );
    expect((await findByTestId('accepted-user-id2')).children[0].children[1].firstChild).toHaveClass('badge');
    expect((await findByTestId('accepted-user-id3')).children[0].children[1].firstChild).toHaveAttribute(
      'data-test-id',
      'perm-read',
    );
    expect((await findByTestId('accepted-user-id3')).children[0].children[1].firstChild).toHaveClass('badge');
  });

  it('does not render read and write badges when user is not owner', async () => {
    const { container, findByTestId, queryByText } = setup(false);

    expect(container).toMatchSnapshot();
    expect(queryByText('foo@example.com')).toBeNull();
    expect(await findByTestId('accepted-user-id2')).toHaveTextContent('bar@example.com');
    expect(await findByTestId('accepted-user-id2')).not.toHaveTextContent('write');
    expect(await findByTestId('accepted-user-id3')).toHaveTextContent('baz@example.com');
    expect(await findByTestId('accepted-user-id3')).not.toHaveTextContent('read');
  });

  it('toggles user permissions', async () => {
    const { findAllByRole, props, user } = setup(true);

    await user.click((await findAllByRole('button'))[0]);

    // the first user in the list is the signed in user and is therefore not displayed
    const firstDisplayedUser = props.users[1];
    expect(props.togglePermission).toHaveBeenCalledWith(
      firstDisplayedUser.users_list.id,
      firstDisplayedUser.users_list.permissions,
      props.status,
    );
  });

  it('toggles user permissions', async () => {
    const { findAllByRole, props, user } = setup(true);

    await user.click((await findAllByRole('button'))[1]);

    // the first user in the list is the signed in user and is therefore not displayed
    const firstDisplayedUser = props.users[1];
    expect(props.removeShare).toHaveBeenCalledWith(firstDisplayedUser.users_list.id);
  });
});
