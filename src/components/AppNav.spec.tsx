import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { mockNavigate } from 'test-utils';

import mockAxios from 'utils/api';
import { UserContext } from 'AppRouter';

import AppNav from './AppNav';

interface ISetupReturn extends RenderResult {
  signOutUser: jest.Mock;
  user: UserEvent;
}

function setup(userData?: { uid: string; client: string; accessToken: string }): ISetupReturn {
  const user = userEvent.setup();
  const signOutUser = jest.fn();
  const component = render(
    <UserContext.Provider value={userData ?? null}>
      <MemoryRouter>
        <AppNav signOutUser={signOutUser} />
      </MemoryRouter>
    </UserContext.Provider>,
  );

  return { ...component, signOutUser, user };
}

describe('AppNav', () => {
  describe('when user is signed in', () => {
    it('renders nav with brand linking to root, invite link and logout visible', async () => {
      const { findByTestId, findByText, signOutUser, user } = setup({ uid: '1', client: '2', accessToken: '3' });

      expect(await findByTestId('nav')).toMatchSnapshot();

      await user.click(await findByText('Groceries'));

      expect(mockNavigate).toHaveBeenCalledWith('/');

      await user.click(await findByText('Invite'));

      expect(mockNavigate).toHaveBeenCalledWith('/users/invitation/new');

      await user.click(await findByText('Log out'));

      expect(mockAxios.delete).toHaveBeenCalledWith('/auth/sign_out');
      expect(mockAxios.delete).toHaveBeenCalledTimes(1);
      expect(signOutUser).toHaveBeenCalled();
    });
  });

  describe('when user is not signed in', () => {
    it('renders nav with brand linking to sign in, no invite or logout links', async () => {
      const { findByTestId, queryByText, findByText, user } = setup();

      expect(await findByTestId('nav')).toBeInTheDocument();
      expect(queryByText('Invite')).not.toBeInTheDocument();
      expect(queryByText('Log out')).not.toBeInTheDocument();

      await user.click(await findByText('Groceries'));
      expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
    });
  });
});
