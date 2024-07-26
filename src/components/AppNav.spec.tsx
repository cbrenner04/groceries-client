import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import AppNav from './AppNav';
import mockAxios from '../utils/api';
import { UserContext } from '../AppRouter';

interface ISetupReturn extends RenderResult {
  signOutUser: jest.Mock;
  user: UserEvent;
}

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: (): jest.Mock => mockNavigate,
}));

function setup(context: { uid: string; client: string; accessToken: string } | null): ISetupReturn {
  const user = userEvent.setup();
  const signOutUser = jest.fn();
  const component = render(
    <MemoryRouter>
      <UserContext.Provider value={context}>
        <AppNav signOutUser={signOutUser} />
      </UserContext.Provider>
    </MemoryRouter>,
  );
  return { ...component, signOutUser, user };
}

describe('AppNav', () => {
  describe('when user is not signed in', () => {
    it('renders basic nav with brand linking to sign in', async () => {
      const { findByTestId, findByText, user } = setup(null);

      expect(await findByTestId('nav')).toMatchSnapshot();

      await user.click(await findByText('Groceries'));

      expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
    });
  });

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
});
