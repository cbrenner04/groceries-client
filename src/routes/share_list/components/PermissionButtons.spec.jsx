import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import PermissionButtons from './PermissionButtons';

describe('PermissionButtons', () => {
  let props;

  beforeEach(() => {
    props = {
      togglePermission: jest.fn(),
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
    const { container, getByTestId, queryByTestId } = render(<PermissionButtons {...props} />);

    expect(container).toMatchSnapshot();
    expect(queryByTestId('accepted-user-1')).toBeNull();
    expect(getByTestId('accepted-user-2').firstChild.children[1]).toHaveAttribute('data-test-id', 'perm-write');
    expect(getByTestId('accepted-user-2').firstChild.children[1]).toHaveClass('badge-success');
    expect(getByTestId('accepted-user-3').firstChild.children[1]).toHaveAttribute('data-test-id', 'perm-read');
    expect(getByTestId('accepted-user-3').firstChild.children[1]).toHaveClass('badge-primary');
  });

  it('does not render read and write badges when user is not owner', () => {
    props.userIsOwner = false;
    const { container, getByTestId, queryByText } = render(<PermissionButtons {...props} />);

    expect(container).toMatchSnapshot();
    expect(queryByText('foo@example.com')).toBeNull();
    expect(getByTestId('accepted-user-2')).toHaveTextContent('bar@example.com');
    expect(getByTestId('accepted-user-2')).not.toHaveTextContent('write');
    expect(getByTestId('accepted-user-3')).toHaveTextContent('baz@example.com');
    expect(getByTestId('accepted-user-3')).not.toHaveTextContent('read');
  });

  it('toggles user permissions on click', async () => {
    props.userIsOwner = true;
    const { getByTestId } = render(<PermissionButtons {...props} />);

    fireEvent.click(getByTestId('accepted-user-2').firstChild);
    expect(props.togglePermission).toHaveBeenCalledWith(2, 'write', 'accepted');
  });
});
