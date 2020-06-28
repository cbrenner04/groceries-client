import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import UsersList from './UsersList';

describe('UsersList', () => {
  let props;

  beforeEach(() => {
    props = {
      togglePermission: jest.fn(),
      removeShare: jest.fn(),
      userIsOwner: true,
      userId: 1,
      status: 'accepted',
      users: [
        {
          user: {
            id: 1,
            email: 'foo@example.com',
          },
          users_list: {
            id: 1,
            permissions: 'write',
          },
        },
        {
          user: {
            id: 2,
            email: 'bar@example.com',
          },
          users_list: {
            id: 2,
            permissions: 'write',
          },
        },
        {
          user: {
            id: 3,
            email: 'baz@example.com',
          },
          users_list: {
            id: 4,
            permissions: 'read',
          },
        },
      ],
    };
  });

  it('renders read and write badges when user is owner', () => {
    props.userIsOwner = true;
    const { container, getByTestId, queryByTestId } = render(<UsersList {...props} />);

    expect(container).toMatchSnapshot();
    expect(queryByTestId('accepted-user-1')).toBeNull();
    expect(getByTestId('accepted-user-2').firstChild.children[1].firstChild).toHaveAttribute(
      'data-test-id',
      'perm-write',
    );
    expect(getByTestId('accepted-user-2').firstChild.children[1].firstChild).toHaveClass('badge-success');
    expect(getByTestId('accepted-user-3').firstChild.children[1].firstChild).toHaveAttribute(
      'data-test-id',
      'perm-read',
    );
    expect(getByTestId('accepted-user-3').firstChild.children[1].firstChild).toHaveClass('badge-primary');
  });

  it('does not render read and write badges when user is not owner', () => {
    props.userIsOwner = false;
    const { container, getByTestId, queryByText } = render(<UsersList {...props} />);

    expect(container).toMatchSnapshot();
    expect(queryByText('foo@example.com')).toBeNull();
    expect(getByTestId('accepted-user-2')).toHaveTextContent('bar@example.com');
    expect(getByTestId('accepted-user-2')).not.toHaveTextContent('write');
    expect(getByTestId('accepted-user-3')).toHaveTextContent('baz@example.com');
    expect(getByTestId('accepted-user-3')).not.toHaveTextContent('read');
  });

  it('toggles user permissions', async () => {
    props.userIsOwner = true;
    const { getAllByRole } = render(<UsersList {...props} />);

    fireEvent.click(getAllByRole('button')[0]);

    // the first user in the list is the signed in user and is therefore not displayed
    const firstDisplayedUser = props.users[1];
    expect(props.togglePermission).toHaveBeenCalledWith(
      firstDisplayedUser.users_list.id,
      firstDisplayedUser.users_list.permissions,
      props.status,
    );
  });

  it('toggles user permissions', async () => {
    props.userIsOwner = true;
    const { getAllByRole } = render(<UsersList {...props} />);

    fireEvent.click(getAllByRole('button')[1]);

    // the first user in the list is the signed in user and is therefore not displayed
    const firstDisplayedUser = props.users[1];
    expect(props.removeShare).toHaveBeenCalledWith(firstDisplayedUser.users_list.id);
  });
});
