import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';

import axios from '../../utils/api';
import PageNotFound from './PageNotFound';

const history = {
  push: jest.fn(),
  listen: jest.fn(),
  location: {
    pathname: 'fake',
  },
  createHref: jest.fn(),
};

describe('PageNotFound', () => {
  const renderPageNotFound = () => {
    return render(
      <Router history={history}>
        <PageNotFound history={history} />
      </Router>,
    );
  };

  it('renders the Loading component when fetch request is pending', () => {
    const { container, getByText } = renderPageNotFound();
    const status = getByText('Loading...');

    expect(container).toMatchSnapshot();
    expect(status).toBeTruthy();
  });

  it('redirects to /users/sign_in when the user is not authenticated', async () => {
    axios.get = jest.fn().mockRejectedValue({ response: { status: 401 } });
    renderPageNotFound();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(history.push).toHaveBeenCalledTimes(1));

    expect(axios.get).toHaveBeenCalledWith('/auth/validate_token');
    expect(history.push).toHaveBeenCalledWith({
      pathname: '/users/sign_in',
      state: { errors: 'You must sign in' },
    });

    axios.get.mockClear();
  });

  it('displays UnknownError when an error occurs validating authentication', async () => {
    axios.get = jest.fn().mockRejectedValue({ response: { status: 500 } });
    const { container, getByRole } = renderPageNotFound();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(axios.get).toHaveBeenCalledWith('/auth/validate_token');
    expect(container).toMatchSnapshot();
    expect(getByRole('button')).toHaveTextContent('refresh the page');

    axios.get.mockClear();
  });

  it('displays PageNotFound when the user is authenticated', async () => {
    axios.get = jest.fn().mockResolvedValue({});
    const { container, getByText } = renderPageNotFound();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(axios.get).toHaveBeenCalledWith('/auth/validate_token');
    expect(container).toMatchSnapshot();
    expect(getByText('Page not found!')).toBeTruthy();

    axios.get.mockClear();
  });
});
