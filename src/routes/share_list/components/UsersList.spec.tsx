import React from 'react';
import { render, type RenderResult, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import UsersList, { type IUsersListProps } from './UsersList';

interface ISetupReturn extends RenderResult {
  user: UserEvent;
  props: IUsersListProps;
}

function setup(userIsOwner = true): ISetupReturn {
  const user = userEvent.setup();
  const props = {
    togglePermission: vi.fn(),
    removeShare: vi.fn(),
    userIsOwner,
    userId: 'id1',
    status: 'accepted',
    users: [
      { user: { id: 'id1', email: 'foo@example.com' }, users_list: { id: 'id1', permissions: 'write' } },
      { user: { id: 'id2', email: 'bar@example.com' }, users_list: { id: 'id2', permissions: 'write' } },
      { user: { id: 'id3', email: 'baz@example.com' }, users_list: { id: 'id4', permissions: 'read' } },
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
    expect(within(await findByTestId('accepted-user-id2')).getByTestId('perm-write')).toBeInTheDocument();
    expect(within(await findByTestId('accepted-user-id3')).getByTestId('perm-read')).toBeInTheDocument();
  });

  it('does not render read and write badges when user is not owner', async () => {
    const { container, findByTestId, queryByText, queryByTestId } = setup(false);

    expect(container).toMatchSnapshot();
    expect(queryByText('foo@example.com')).toBeNull();
    expect(await findByTestId('accepted-user-id2')).toHaveTextContent('bar@example.com');
    expect(queryByTestId('perm-write')).toBeNull();
    expect(await findByTestId('accepted-user-id3')).toHaveTextContent('baz@example.com');
    expect(queryByTestId('perm-read')).toBeNull();
  });

  it('toggles user permissions', async () => {
    const { findAllByTestId, props, user } = setup(true);

    await user.click((await findAllByTestId('toggle-permissions'))[0]);

    // the first user in the list is the signed in user and is therefore not displayed
    const firstDisplayedUser = props.users[1];
    expect(props.togglePermission).toHaveBeenCalledWith(
      firstDisplayedUser.users_list.id,
      firstDisplayedUser.users_list.permissions,
      props.status,
    );
  });

  it('removes share', async () => {
    const { findAllByTestId, props, user } = setup(true);

    await user.click((await findAllByTestId('remove-share'))[0]);

    // the first user in the list is the signed in user and is therefore not displayed
    const firstDisplayedUser = props.users[1];
    expect(props.removeShare).toHaveBeenCalledWith(firstDisplayedUser.users_list.id);
  });
});
