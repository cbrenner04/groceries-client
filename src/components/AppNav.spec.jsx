import React from 'react';
import { render, fireEvent, waitForElementToBeRemoved } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import AppNav from './AppNav';
import instance from '../utils/api';

const history = createMemoryHistory();

describe('AppNav', () => {
  describe('when user is not signed in', () => {
    it('renders basic nav with brand linking to sign in', () => {
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
    let queryByText;
    let getByTestId;
    let getByText;

    beforeEach(() => {
      sessionStorage.setItem('user', '{"foo":"bar"}');
      ({ getByTestId, getByText, queryByText } = render(
        <Router history={history}>
          <AppNav />
        </Router>,
      ));
    });

    it('renders nav with brand linking to root, invite link and logout visible', () => {
      expect(getByTestId('nav')).toMatchSnapshot();
      expect(getByText('Groceries')).toHaveAttribute('href', '/');
      expect(getByText('Invite')).toHaveAttribute('href', '/users/invitation/new');
      expect(getByText('Log out')).toHaveAttribute('href', '#');
    });

    it('clears logs the user out when Log out is clicked', async () => {
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
