import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import RefusedUsersList from './RefusedUsersList';

describe('RefusedUsersList', () => {
  let props;

  beforeEach(() => {
    props = {
      refreshShare: jest.fn(),
      userIsOwner: true,
      userId: 'id1',
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
      ],
    };
  });

  it('renders refresh share button', () => {
    props.userIsOwner = true;
    const { container, getByRole, getByTestId, queryByTestId } = render(<RefusedUsersList {...props} />);

    expect(container).toMatchSnapshot();
    expect(queryByTestId('refused-user-id1')).toBeNull();
    expect(getByTestId('refused-user-id2')).toHaveTextContent('bar@example.com');
    expect(getByRole('button')).toBeVisible();
  });

  it('does not render refresh share button', () => {
    props.userIsOwner = false;
    const { container, getByTestId, queryByRole, queryByText } = render(<RefusedUsersList {...props} />);

    expect(container).toMatchSnapshot();
    expect(queryByText('foo@example.com')).toBeNull();
    expect(getByTestId('refused-user-id2')).toHaveTextContent('bar@example.com');
    expect(queryByRole('button')).toBeNull();
  });

  it('refreshes share on click', async () => {
    props.userIsOwner = true;
    const { getAllByRole } = render(<RefusedUsersList {...props} />);

    fireEvent.click(getAllByRole('button')[0]);

    // the first user in the list is the signed in user and is therefore not displayed
    const firstDisplayedUser = props.users[1];
    expect(props.refreshShare).toHaveBeenCalledWith(firstDisplayedUser.users_list.id, firstDisplayedUser.user.id);
  });
});
