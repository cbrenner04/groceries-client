import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import RefusedUsersList, { type IRefusedUsersListProps } from './RefusedUsersList';

interface ISetupReturn extends RenderResult {
  user: UserEvent;
  props: IRefusedUsersListProps;
}

function setup(userIsOwner = true): ISetupReturn {
  const user = userEvent.setup();
  const props = {
    refreshShare: jest.fn(),
    userIsOwner,
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
  const component = render(<RefusedUsersList {...props} />);

  return { ...component, props, user };
}

describe('RefusedUsersList', () => {
  it('renders refresh share button', async () => {
    const { container, findByRole, findByTestId, queryByTestId } = setup(true);

    expect(container).toMatchSnapshot();
    expect(queryByTestId('refused-user-id1')).toBeNull();
    expect(await findByTestId('refused-user-id2')).toHaveTextContent('bar@example.com');
    expect(await findByRole('button')).toBeVisible();
  });

  it('does not render refresh share button', async () => {
    const { container, findByTestId, queryByRole, queryByText } = setup(false);

    expect(container).toMatchSnapshot();
    expect(queryByText('foo@example.com')).toBeNull();
    expect(await findByTestId('refused-user-id2')).toHaveTextContent('bar@example.com');
    expect(queryByRole('button')).toBeNull();
  });

  it('refreshes share on click', async () => {
    const { findAllByRole, props, user } = setup(true);

    await user.click((await findAllByRole('button'))[0]);

    // the first user in the list is the signed in user and is therefore not displayed
    const firstDisplayedUser = props.users[1];
    expect(props.refreshShare).toHaveBeenCalledWith(firstDisplayedUser.users_list.id, firstDisplayedUser.user.id);
  });
});
