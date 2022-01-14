import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import AppNav from './AppNav';
import instance from '../utils/api';
import { UserContext } from '../AppRouter';

const signOutUser = jest.fn();
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('AppNav', () => {
  const renderAppNav = (context) => {
    return render(
      <MemoryRouter>
        <UserContext.Provider value={context}>
          <AppNav signOutUser={signOutUser} />
        </UserContext.Provider>
      </MemoryRouter>,
    );
  };

  describe('when user is not signed in', () => {
    it('renders basic nav with brand linking to sign in', () => {
      const { getByTestId, getByText } = renderAppNav(null);

      expect(getByTestId('nav')).toMatchSnapshot();
      fireEvent.click(getByText('Groceries'));
      expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
    });
  });

  describe('when user is signed in', () => {
    let getByTestId;
    let getByText;

    beforeEach(() => {
      ({ getByTestId, getByText } = renderAppNav({ uid: 1, client: 2, accessToken: 3 }));
    });

    it('renders nav with brand linking to root, invite link and logout visible', () => {
      expect(getByTestId('nav')).toMatchSnapshot();
      fireEvent.click(getByText('Groceries'));
      expect(mockNavigate).toHaveBeenCalledWith('/');
      fireEvent.click(getByText('Invite'));
      expect(mockNavigate).toHaveBeenCalledWith('/users/invitation/new');
      fireEvent.click(getByText('Log out'));
      expect(instance.delete).toHaveBeenCalledWith('/auth/sign_out');
    });

    it('logs the user out when Log out is clicked', async () => {
      fireEvent.click(getByText('Log out'));

      expect(instance.delete).toHaveBeenCalledWith('/auth/sign_out');

      await waitFor(() => expect(instance.delete).toHaveBeenCalledTimes(1));

      expect(signOutUser).toHaveBeenCalled();
    });
  });
});
