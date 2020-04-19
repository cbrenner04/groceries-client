import React from 'react';
import { render, fireEvent, waitForElementToBeRemoved } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import AppNav from './AppNav';
import instance from '../utils/api';

describe('AppNav', () => {
  describe('when user is not signed in', () => {
    it('renders basic nav with brand linking to sign in', () => {
      const history = createMemoryHistory();
      const { getByTestId, getByText } = render(
        <Router history={history}>
          <AppNav />
        </Router>,
      );

      expect(getByTestId('nav')).toMatchSnapshot();
      expect(getByText('Groceries')).toHaveAttribute('href', '/users/sign_in');
    });
  });

  describe('when user is signed in', () => {
    it('renders nav with brand linking to root, invite link and logout visible', () => {
      const history = createMemoryHistory();
      sessionStorage.setItem('user', '{"foo":"bar"}');
      const { getByTestId, getByText } = render(
        <Router history={history}>
          <AppNav />
        </Router>,
      );

      expect(getByTestId('nav')).toMatchSnapshot();
      expect(getByText('Groceries')).toHaveAttribute('href', '/');
      expect(getByText('Invite')).toHaveAttribute('href', '/users/invitation/new');
      expect(getByText('Log out')).toHaveAttribute('href', '#');
    });

    it('clears logs the user out when Log out is clicked', async () => {
      const history = createMemoryHistory();
      sessionStorage.setItem('user', '{"foo":"bar"}');
      const { getByText, queryByText } = render(
        <Router history={history}>
          <AppNav />
        </Router>,
      );

      expect(getByText('Groceries')).toHaveAttribute('href', '/');
      expect(sessionStorage.getItem('user')).not.toBeNull();

      fireEvent.click(getByText('Log out'));

      await waitForElementToBeRemoved(() => queryByText('Invite'));

      expect(getByText('Groceries')).toHaveAttribute('href', '/users/sign_in');
      expect(sessionStorage.getItem('user')).toBeNull();
      expect(instance.delete).toHaveBeenCalledWith('/auth/sign_out');
    });
  });
});
