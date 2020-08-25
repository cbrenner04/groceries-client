import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import AppNav from './AppNav';
import instance from '../utils/api';
import { UserContext } from '../context/UserContext';

describe('AppNav', () => {
  const renderAppNav = (context) => {
    const history = createMemoryHistory();
    return render(
      <Router history={history}>
        <UserContext.Provider value={context}>
          <AppNav />
        </UserContext.Provider>
      </Router>,
    );
  };

  describe('when user is not signed in', () => {
    it('renders basic nav with brand linking to sign in', () => {
      const { getByTestId, getByText } = renderAppNav({ user: null });

      expect(getByTestId('nav')).toMatchSnapshot();
      expect(getByText('Groceries')).toHaveAttribute('href', '/users/sign_in');
    });
  });

  describe('when user is signed in', () => {
    let getByTestId;
    let getByText;
    const userContext = {
      user: { uid: 1, client: 2, accessToken: 3 },
      signOutUser: jest.fn(),
    };

    beforeEach(() => {
      ({ getByTestId, getByText } = renderAppNav(userContext));
    });

    it('renders nav with brand linking to root, invite link and logout visible', () => {
      expect(getByTestId('nav')).toMatchSnapshot();
      expect(getByText('Groceries')).toHaveAttribute('href', '/');
      expect(getByText('Invite')).toHaveAttribute('href', '/users/invitation/new');
      expect(getByText('Log out')).toHaveAttribute('href', '#');
    });

    it('logs the user out when Log out is clicked', () => {
      fireEvent.click(getByText('Log out'));

      expect(instance.delete).toHaveBeenCalledWith('/auth/sign_out');
      expect(userContext.signOutUser).toHaveBeenCalled();
    });
  });
});
