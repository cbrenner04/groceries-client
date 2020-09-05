import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import AppNav from './AppNav';
import instance from '../utils/api';
import { UserContext } from '../context/UserContext';

describe('AppNav', () => {
  const signOutUser = jest.fn();

  const renderAppNav = (context) => {
    const history = createMemoryHistory();
    return render(
      <Router history={history}>
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
      expect(getByText('Groceries')).toHaveAttribute('href', '/users/sign_in');
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
      expect(getByText('Groceries')).toHaveAttribute('href', '/');
      expect(getByText('Invite')).toHaveAttribute('href', '/users/invitation/new');
      expect(getByText('Log out')).toHaveAttribute('href', '#');
    });

    it('logs the user out when Log out is clicked', async () => {
      fireEvent.click(getByText('Log out'));

      expect(instance.delete).toHaveBeenCalledWith('/auth/sign_out');

      await waitFor(() => expect(instance.delete).toHaveBeenCalledTimes(1));

      expect(signOutUser).toHaveBeenCalled();
    });
  });
});
