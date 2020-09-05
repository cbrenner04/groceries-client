import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
// import { createMemoryHistory } from 'history';

import AppNav from './AppNav';
import instance from '../utils/api';
import { UserContext } from '../AppRouter';

describe('AppNav', () => {
  const signOutUser = jest.fn();
  const mockHistory = { push: jest.fn(), listen: jest.fn(), location: { pathname: '' } };

  const renderAppNav = (context) => {
    // const history = createMemoryHistory();
    return render(
      <Router history={mockHistory}>
        <UserContext.Provider value={context}>
          <AppNav signOutUser={signOutUser} />
        </UserContext.Provider>
      </Router>,
    );
  };

  describe('when user is not signed in', () => {
    it('renders basic nav with brand linking to sign in', () => {
      const { getByTestId, getByText } = renderAppNav(null);

      expect(getByTestId('nav')).toMatchSnapshot();
      fireEvent.click(getByText('Groceries'));
      expect(mockHistory.push).toHaveBeenCalledWith('/users/sign_in');
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
      expect(mockHistory.push).toHaveBeenCalledWith('/');
      fireEvent.click(getByText('Invite'));
      expect(mockHistory.push).toHaveBeenCalledWith('/users/invitation/new');
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
